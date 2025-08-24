// КРИТИЧЕСКОЕ ОБНОВЛЕНИЕ: Исправлена проблема с выживаемостью при экстремальных условиях
console.log('🚨 НОВАЯ ВЕРСИЯ ЗАГРУЖЕНА: Экстремальные условия теперь смертельны!');

// Система звуков
class SoundSystem {
    constructor() {
        this.enabled = true; // Включаем звуки по умолчанию
        this.audioContext = null;
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API не поддерживается');
        }
    }

    playSound(frequency, duration, type = 'sine') {
        if (!this.enabled || !this.audioContext) {
            console.log('Звук не проиграть:', !this.enabled ? 'отключен' : 'нет контекста');
            return;
        }
        
        // Активируем аудио контекст если нужно
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        console.log(`Проигрываем звук: ${frequency}Hz, ${duration}s, ${type}`);
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: предотвращаем утечки памяти
        oscillator.onended = () => {
            oscillator.disconnect();
            gainNode.disconnect();
        };
    }

    birth() { this.playSound(440, 0.1); }
    death() { this.playSound(220, 0.2); }
    mutation() { this.playSound(660, 0.15, 'sawtooth'); }
    predatorKill() { this.playSound(880, 0.3, 'square'); }
}

// Класс для ДНК клетки
class CellDNA {
    constructor(survival = null, reproduction = null, adaptation = null, resistance = null, species = 'prey') {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: правильная обработка null/undefined vs 0
        this.survival = survival !== null && survival !== undefined ? survival : (20 + Math.random() * 80);
        this.reproduction = reproduction !== null && reproduction !== undefined ? reproduction : (10 + Math.random() * 90);
        this.adaptation = adaptation !== null && adaptation !== undefined ? adaptation : (10 + Math.random() * 90);
        this.resistance = resistance !== null && resistance !== undefined ? resistance : (10 + Math.random() * 90);
        this.species = species; // 'prey' или 'predator'
        this.age = 0;
        this.generation = 0;
        this.energy = 100;
        this.fitness = this.calculateFitness();
        this.id = Math.random().toString(36).substring(2, 11);
        
        // Новые генетические свойства
        this.geneticMemory = []; // память о успешных стратегиях
        this.migrationTendency = Math.random() * 100; // склонность к миграции
        this.immuneSystem = Math.random() * 100; // сопротивляемость болезням
        this.symbiosisCapacity = Math.random() * 100; // способность к симбиозу
        this.lifespan = 20 + Math.random() * 80; // продолжительность жизни (20-100 ходов - реалистично для клеток)
        this.achievements = new Set(); // достижения клетки
        this.diseaseResistance = Math.random() * 100; // сопротивляемость заболеваниям
    }

    calculateFitness() {
        // Нормализуем значения генов к диапазону 0-1
        const normalizedSurvival = this.survival / 100;
        const normalizedReproduction = this.reproduction / 100;
        const normalizedAdaptation = this.adaptation / 100;
        const normalizedResistance = this.resistance / 100;
        
        if (this.species === 'predator') {
            // Для хищников важнее выживание и адаптация
            return (normalizedSurvival * 0.5 + normalizedReproduction * 0.2 + normalizedAdaptation * 0.3);
        }
        // Для жертв все гены важны более равномерно
        return (normalizedSurvival * 0.3 + normalizedReproduction * 0.25 + normalizedAdaptation * 0.25 + normalizedResistance * 0.2);
    }

    mutate(mutationRate, environment = {}) {
        const envFactor = this.getEnvironmentFactor(environment);
        const actualMutationRate = mutationRate * envFactor;
        
        // Исправляем логику: resistance влияет на силу мутации, а не на вероятность
        // Высокое сопротивление уменьшает размер мутационных изменений
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: минимум 10% силы мутации для сохранения эволюции
        const mutationStrength = 0.1 + (1 - this.resistance / 100) * 0.9; // 0.1-1.0 диапазон
        const shouldMutate = Math.random() < (actualMutationRate / 100);
        
        if (shouldMutate) {
            const trait = Math.floor(Math.random() * 4);
            // Уменьшаем размах мутаций с 30 до 15 и применяем силу мутации
            const change = (Math.random() - 0.5) * 15 * mutationStrength;
            
            switch(trait) {
                case 0:
                    this.survival = Math.max(5, Math.min(100, this.survival + change));
                    break;
                case 1:
                    this.reproduction = Math.max(1, Math.min(100, this.reproduction + change));
                    break;
                case 2:
                    this.adaptation = Math.max(1, Math.min(100, this.adaptation + change));
                    break;
                case 3:
                    this.resistance = Math.max(1, Math.min(100, this.resistance + change));
                    break;
            }
            this.fitness = this.calculateFitness();
            return true;
        }
        return false;
    }

    getEnvironmentFactor(environment) {
        const tempStress = Math.abs(environment.temperature || 0) / 50;
        const pressureStress = Math.abs((environment.pressure || 50) - 50) / 50;
        return 1 + (tempStress + pressureStress) * 0.5;
    }

    crossover(otherDNA) {
        // Уменьшаем случайное отклонение с 15 до 8 для более реалистичной генетики
        const deviation = 8;
        const newDNA = new CellDNA(
            (this.survival + otherDNA.survival) / 2 + (Math.random() - 0.5) * deviation,
            (this.reproduction + otherDNA.reproduction) / 2 + (Math.random() - 0.5) * deviation,
            (this.adaptation + otherDNA.adaptation) / 2 + (Math.random() - 0.5) * deviation,
            (this.resistance + otherDNA.resistance) / 2 + (Math.random() - 0.5) * deviation,
            this.species
        );
        
        newDNA.survival = Math.max(0, Math.min(100, newDNA.survival));
        newDNA.reproduction = Math.max(0, Math.min(100, newDNA.reproduction));
        newDNA.adaptation = Math.max(0, Math.min(100, newDNA.adaptation));
        newDNA.resistance = Math.max(0, Math.min(100, newDNA.resistance));
        // КРИТИЧНОЕ ИСПРАВЛЕНИЕ БЕССМЕРТИЯ #1: crossover ОБЯЗАТЕЛЬНО сбрасывает age!
        newDNA.generation = Math.max(this.generation, otherDNA.generation) + 1;
        newDNA.age = 0; // НОВОРОЖДЕННЫЕ ОБЯЗАТЕЛЬНО НАЧИНАЮТ С 0!!!
        newDNA.energy = 100; // Полная энергия
        newDNA.fitness = newDNA.calculateFitness();
        
        // Наследование дополнительных признаков с оптимизацией
        const smallDeviation = 5; // уменьшаем отклонение для стабильности
        newDNA.geneticMemory = [...this.geneticMemory, ...otherDNA.geneticMemory].slice(-3); // уменьшаем память с 5 до 3
        newDNA.migrationTendency = Math.max(0, Math.min(100, (this.migrationTendency + otherDNA.migrationTendency) / 2 + (Math.random() - 0.5) * smallDeviation));
        newDNA.immuneSystem = Math.max(0, Math.min(100, (this.immuneSystem + otherDNA.immuneSystem) / 2 + (Math.random() - 0.5) * smallDeviation));
        newDNA.symbiosisCapacity = Math.max(0, Math.min(100, (this.symbiosisCapacity + otherDNA.symbiosisCapacity) / 2 + (Math.random() - 0.5) * smallDeviation));
        
        return newDNA;
    }

    clone() {
        const newDNA = new CellDNA(this.survival, this.reproduction, this.adaptation, this.resistance, this.species);
        // КРИТИЧНОЕ ИСПРАВЛЕНИЕ БЕССМЕРТИЯ #2: clone ОБЯЗАТЕЛЬНО age=0!
        newDNA.age = 0; // КЛОНЫ НАЧИНАЮТ С 0 ЛЕТ!!!
        newDNA.generation = this.generation + 1;
        newDNA.energy = 100; // Полная энергия
        newDNA.geneticMemory = [...this.geneticMemory];
        newDNA.migrationTendency = this.migrationTendency;
        newDNA.immuneSystem = this.immuneSystem;
        newDNA.symbiosisCapacity = this.symbiosisCapacity;
        return newDNA;
    }
    
    // Сохранение успешной стратегии (упрощенно для реалистичности)
    rememberStrategy() {
        // Упрощаем до простого счетчика успешных стратегий
        if (this.fitness > 0.7) {
            this.geneticMemory.push({
                fitness: this.fitness,
                generation: this.generation
            });
            if (this.geneticMemory.length > 3) {
                this.geneticMemory.shift();
            }
        }
    }
    
    // Применение генетической памяти (упрощенно)
    applyGeneticMemory() {
        // Упрощаем до простого бонуса за наличие успешных предков
        if (this.geneticMemory.length > 0) {
            const avgAncestorFitness = this.geneticMemory.reduce((sum, mem) => sum + mem.fitness, 0) / this.geneticMemory.length;
            return avgAncestorFitness * 0.1; // маленький бонус к выживанию
        }
        return 0;
    }
    
    // Мутационная катастрофа
    catastrophicMutation() {
        const traits = ['survival', 'reproduction', 'adaptation', 'resistance'];
        traits.forEach(trait => {
            this[trait] = Math.max(0, Math.min(100, this[trait] + (Math.random() - 0.5) * 80));
        });
        this.fitness = this.calculateFitness();
        this.achievements.add('survivor_catastrophe');
    }
    
    // Генетический дрейф в малой популяции
    geneticDrift(populationSize) {
        if (populationSize < 10) {
            const driftStrength = 1 / Math.sqrt(populationSize);
            const traits = ['survival', 'reproduction', 'adaptation', 'resistance'];
            traits.forEach(trait => {
                const change = (Math.random() - 0.5) * 20 * driftStrength;
                this[trait] = Math.max(0, Math.min(100, this[trait] + change));
            });
            this.fitness = this.calculateFitness();
        }
    }

    getColor() {
        if (this.species === 'predator') {
            const intensity = Math.floor(this.fitness * 255);
            return `rgb(${intensity}, 0, 0)`;
        } else if (this.species === 'symbiotic') {
            // Исправление: защита от переполнения RGB (>255)
            const intensity = Math.floor(Math.min(100, this.symbiosisCapacity) * 2.55);
            return `rgb(${intensity}, ${intensity}, 0)`;
        } else {
            const r = Math.floor(this.survival * 2.55);
            const g = Math.floor(this.reproduction * 2.55);
            const b = Math.floor(this.adaptation * 2.55);
            return `rgb(${r},${g},${b})`;
        }
    }
    
    // Проверка на заболевание
    isInfected() {
        return this.achievements.has('infected');
    }
    
    // Заражение
    infect() {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: логика сопротивления болезням была обращена
        if (Math.random() < (100 - this.diseaseResistance) / 100) {
            this.achievements.add('infected');
            this.energy *= 0.7; // Болезнь снижает энергию
            return true;
        }
        return false;
    }
    
    // Выздоровление
    recover() {
        if (this.achievements.has('infected') && Math.random() < this.immuneSystem / 100) {
            this.achievements.delete('infected');
            this.achievements.add('immune');
            this.diseaseResistance = Math.min(100, this.diseaseResistance + 10);
            return true;
        }
        return false;
    }
}

// Система достижений
class AchievementSystem {
    constructor() {
        this.achievements = {
            first_birth: { name: 'Первое рождение', description: 'Создана первая клетка', unlocked: false },
            population_100: { name: 'Процветание', description: 'Популяция достигла 100 клеток', unlocked: false },
            generation_10: { name: 'Эволюционист', description: 'Достигнуто 10-е поколение', unlocked: false },
            mass_extinction: { name: 'Выживший', description: 'Пережил массовое вымирание', unlocked: false },
            perfect_dna: { name: 'Совершенство', description: 'Создана клетка со 100% приспособленностью', unlocked: false },
            symbiosis_master: { name: 'Мастер симбиоза', description: 'Создал симбиотические отношения', unlocked: false },
            disease_survivor: { name: 'Иммунитет', description: 'Выжил после болезни', unlocked: false },
            predator_hunter: { name: 'Охотник', description: 'Хищник съел 10 жертв', unlocked: false },
            migration_master: { name: 'Кочевник', description: 'Клетка прошла большое расстояние', unlocked: false },
            time_traveler: { name: 'Путешественник во времени', description: 'Использовал временную навигацию', unlocked: false }
        };
        this.unlockedCount = 0;
    }
    
    unlock(achievementId) {
        if (!this.achievements[achievementId].unlocked) {
            this.achievements[achievementId].unlocked = true;
            this.unlockedCount++;
            this.showNotification(`Достижение разблокировано: ${this.achievements[achievementId].name}`);
            return true;
        }
        return false;
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            // Исправление утечки памяти: проверяем существование элемента
            if (notification && notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    getProgress() {
        const total = Object.keys(this.achievements).length;
        return { unlocked: this.unlockedCount, total: total, percentage: Math.round((this.unlockedCount / total) * 100) };
    }
}


// Система управления экспериментами
class ExperimentManager {
    constructor() {
        this.experiments = this.loadExperiments();
    }

    saveExperiment(name, data) {
        const experiment = {
            name,
            date: new Date().toISOString(),
            data,
            id: Date.now()
        };
        this.experiments.push(experiment);
        localStorage.setItem('gameOfLife_experiments', JSON.stringify(this.experiments));
        return experiment;
    }

    loadExperiment(id) {
        return this.experiments.find(exp => exp.id === id);
    }

    deleteExperiment(id) {
        this.experiments = this.experiments.filter(exp => exp.id !== id);
        localStorage.setItem('gameOfLife_experiments', JSON.stringify(this.experiments));
    }

    loadExperiments() {
        try {
            const saved = localStorage.getItem('gameOfLife_experiments');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    exportToJSON(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gameOfLife_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportToCSV(evolutionTracker) {
        let csv = 'Generation,Population,AvgFitness,MaxFitness,Diversity,AvgSurvival,AvgReproduction,AvgAdaptation,AvgResistance\n';
        
        const history = evolutionTracker.populationHistory;
        history.forEach((pop, index) => {
            const fitness = evolutionTracker.fitnessHistory[index];
            const diversity = evolutionTracker.diversityHistory[index];
            const genes = evolutionTracker.geneDistribution[index];
            
            csv += `${pop.generation},${pop.count},${fitness?.avgFitness || 0},${fitness?.maxFitness || 0},${diversity?.diversity || 0},${genes?.survival || 0},${genes?.reproduction || 0},${genes?.adaptation || 0},${genes?.resistance || 0}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gameOfLife_data_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Класс для отслеживания статистики (расширенный)
class EvolutionTracker {
    constructor() {
        this.populationHistory = [];
        this.fitnessHistory = [];
        this.diversityHistory = [];
        this.geneDistribution = [];
        this.predatorPreyHistory = [];
        this.environmentHistory = [];
        this.maxHistoryLength = 100; // уменьшаем для экономии памяти
    }

    update(cells, generation, environment = {}) {
        const livingCells = cells.flat().filter(cell => cell && cell.dna);
        const predators = livingCells.filter(cell => cell.dna.species === 'predator');
        const prey = livingCells.filter(cell => cell.dna.species === 'prey');
        
        if (livingCells.length === 0) {
            this.populationHistory.push({ generation, count: 0 });
            this.fitnessHistory.push({ generation, avgFitness: 0, maxFitness: 0 });
            this.diversityHistory.push({ generation, diversity: 0 });
            this.predatorPreyHistory.push({ generation, predators: 0, prey: 0 });
            return;
        }

        // Популяция
        this.populationHistory.push({
            generation,
            count: livingCells.length
        });

        // Приспособленность
        const fitnesses = livingCells.map(cell => cell.dna.fitness);
        const avgFitness = fitnesses.reduce((sum, f) => sum + f, 0) / fitnesses.length;
        const maxFitness = Math.max(...fitnesses);
        
        this.fitnessHistory.push({
            generation,
            avgFitness,
            maxFitness
        });

        // Генетическое разнообразие
        const diversity = this.calculateDiversity(livingCells);
        this.diversityHistory.push({
            generation,
            diversity
        });

        // Хищник-жертва
        this.predatorPreyHistory.push({
            generation,
            predators: predators.length,
            prey: prey.length
        });

        // Распределение генов
        if (livingCells.length > 0) {
            const avgSurvival = livingCells.reduce((sum, cell) => sum + cell.dna.survival, 0) / livingCells.length;
            const avgReproduction = livingCells.reduce((sum, cell) => sum + cell.dna.reproduction, 0) / livingCells.length;
            const avgAdaptation = livingCells.reduce((sum, cell) => sum + cell.dna.adaptation, 0) / livingCells.length;
            const avgResistance = livingCells.reduce((sum, cell) => sum + cell.dna.resistance, 0) / livingCells.length;

            this.geneDistribution.push({
                generation,
                survival: avgSurvival,
                reproduction: avgReproduction,
                adaptation: avgAdaptation,
                resistance: avgResistance
            });
        }

        // Условия среды
        this.environmentHistory.push({
            generation,
            temperature: environment.temperature || 0,
            pressure: environment.pressure || 50
        });

        // Ограничиваем размер истории
        if (this.populationHistory.length > this.maxHistoryLength) {
            this.populationHistory.shift();
            this.fitnessHistory.shift();
            this.diversityHistory.shift();
            this.geneDistribution.shift();
            this.predatorPreyHistory.shift();
            this.environmentHistory.shift();
        }
    }


    calculateDiversity(cells) {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: обработка крайних случаев
        if (!cells || cells.length === 0) return 0;
        if (cells.length === 1) return 0; // одна клетка = нет разнообразия
        if (cells.length < 2) return 0;
        
        let totalDistance = 0;
        let comparisons = 0;
        let validComparisons = 0;
        
        for (let i = 0; i < cells.length; i++) {
            for (let j = i + 1; j < cells.length; j++) {
                // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка валидности клеток и их ДНК
                if (!cells[i] || !cells[j] || !cells[i].dna || !cells[j].dna) {
                    continue;
                }
                
                const cell1 = cells[i].dna;
                const cell2 = cells[j].dna;
                
                // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка валидности генов
                const isValidGenes = (dna) => {
                    return typeof dna.survival === 'number' && !isNaN(dna.survival) &&
                           typeof dna.reproduction === 'number' && !isNaN(dna.reproduction) &&
                           typeof dna.adaptation === 'number' && !isNaN(dna.adaptation) &&
                           typeof dna.resistance === 'number' && !isNaN(dna.resistance);
                };
                
                if (!isValidGenes(cell1) || !isValidGenes(cell2)) {
                    console.warn('Найдены некорректные гены при расчете diversity');
                    continue;
                }
                
                const distance = Math.sqrt(
                    Math.pow(cell1.survival - cell2.survival, 2) +
                    Math.pow(cell1.reproduction - cell2.reproduction, 2) +
                    Math.pow(cell1.adaptation - cell2.adaptation, 2) +
                    Math.pow(cell1.resistance - cell2.resistance, 2)
                );
                
                // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка результата на NaN или Infinity
                if (isNaN(distance) || !isFinite(distance)) {
                    console.warn('Некорректное расстояние в calculateDiversity:', distance);
                    continue;
                }
                
                totalDistance += distance;
                validComparisons++;
                comparisons++; // для обратной совместимости
            }
        }
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: используем validComparisons вместо comparisons
        if (validComparisons === 0) {
            console.warn('Нет валидных сравнений для расчета diversity');
            return 0;
        }
        
        const avgDistance = totalDistance / validComparisons;
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: финальная проверка результата
        if (isNaN(avgDistance) || !isFinite(avgDistance)) {
            console.error('Некорректный результат calculateDiversity:', avgDistance);
            return 0;
        }
        
        return avgDistance;
    }
}

class GameOfLife {
    constructor() {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка существования DOM элементов
        this.canvas = document.getElementById('gameGrid');
        if (!this.canvas) {
            throw new Error('Canvas элемент gameGrid не найден!');
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Невозможно получить 2D контекст Canvas!');
        }
        
        this.cellSize = 12;
        this.gridWidth = 30;
        this.gridHeight = 30;
        this.grid = [];
        this.nextGrid = [];
        this.isPlaying = false;
        this.generation = 0;
        this.speed = 5;
        this.animationId = null;
        this.lastTime = 0;
        this.frameCount = 0;
        this.fpsLastTime = 0;
        this.currentFPS = 0;
        
        // Новые системы
        this.evolutionMode = false;
        this.predatorMode = false;
        this.mutationRate = 2;
        this.evolutionTracker = new EvolutionTracker();
        this.experimentManager = new ExperimentManager();
        this.soundSystem = new SoundSystem();
        this.selectedCell = null;
        this.breedingSelection = [];
        this.isDarkTheme = false;
        
        // Новые функции
        this.achievementSystem = new AchievementSystem();
        this.diseaseSystem = { active: false, spreadRate: 0.1, mortalityRate: 0.05 };
        this.migrationSystem = { active: false, strength: 0.5 }; // Увеличили силу миграции
        this.symbiosisSystem = { active: false, benefit: 0.3 };
        this.catastropheTimer = 0;
        
        // Окружающая среда
        this.environment = {
            temperature: 0, // -50 to 50
            pressure: 50,   // 0 to 100
        };
        
        
        // Графики и аналитика
        this.charts = {
            population: null,
            fitness: null,
            diversity: null,
            genes: null,
            predatorPrey: null,
            environment: null,
            heatmap: null,
            network: null,
            timeline3D: null
        };
        
        this.heatmapData = [];
        this.networkData = { nodes: [], edges: [] };
        this.comparisonExperiments = [];
        this.exportFormats = ['json', 'csv', 'bioinformatics'];
        this.scientificMetrics = {
            shannonDiversity: 0,
            simpsonIndex: 0,
            evenness: 0,
            speciesRichness: 0
        };
        
        this.initializeGrid();
        this.setupCanvas();
        this.bindEvents();
        this.updateStats();
        this.draw();
        this.initializeCharts();
        this.createThemeToggle();
        this.updateExperimentsList();
        // this.setupAutoSave(); // Убрано автосохранение
        this.startCatastropheTimer();
        this.syncUIState(); // Синхронизируем состояние UI с переменными
    }
    
    
    // Таймер катастроф
    startCatastropheTimer() {
        this.catastropheTimer = Math.random() * 500 + 300; // 300-800 поколений
    }
    
    // Мутационная катастрофа
    triggerCatastrophe() {
        let survivorCount = 0;
        const catastropheType = Math.random();
        
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                // Исправление типов: проверяем что клетка - объект, а не boolean
                if (this.grid[x][y] && typeof this.grid[x][y] === 'object' && this.grid[x][y].dna) {
                    if (catastropheType < 0.3) {
                        // Мутационная катастрофа
                        this.grid[x][y].dna.catastrophicMutation();
                        survivorCount++;
                    } else if (catastropheType < 0.7) {
                        // Массовое вымирание
                        if (Math.random() < 0.8) {
                            this.grid[x][y] = null;
                        } else {
                            this.grid[x][y].dna.achievements.add('mass_extinction_survivor');
                            survivorCount++;
                        }
                    } else {
                        // Климатические изменения
                        this.environment.temperature += (Math.random() - 0.5) * 40;
                        this.environment.pressure += (Math.random() - 0.5) * 30;
                        survivorCount++;
                    }
                }
            }
        }
        
        this.achievementSystem.unlock('mass_extinction');
        this.soundSystem.playSound(150, 1.0, 'sawtooth');
        this.startCatastropheTimer();
        
        const notifications = [
            'Мутационная катастрофа! Массовые мутации по всей популяции!',
            'Массовое вымирание! Выжили только сильнейшие!',
            'Климатическая катастрофа! Резко изменился климат!'
        ];
        
        this.showNotification(notifications[Math.floor(catastropheType * 3)]);
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: перезапускаем таймер катастрофы
        this.startCatastropheTimer();
    }
    
    // Система болезней
    spreadDisease() {
        if (!this.diseaseSystem.active) return;
        
        let deaths = 0;
        
        // Случайное заражение новых клеток (очаг болезни)
        if (Math.random() < 0.01) { // 1% шанс появления нового очага
            for (let x = 0; x < this.gridWidth; x++) {
                for (let y = 0; y < this.gridHeight; y++) {
                    if (this.grid[x][y] && this.grid[x][y].dna && Math.random() < 0.001) {
                        if (this.grid[x][y].dna.infect()) {
                            console.log(`🦠 Новый очаг болезни в (${x},${y})`);
                            break;
                        }
                    }
                }
            }
        }
        
        const infectedCells = [];
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[x][y] && this.grid[x][y].dna && this.grid[x][y].dna.isInfected()) {
                    infectedCells.push({x, y});
                }
            }
        }
        
        // Распространение инфекции
        infectedCells.forEach(cell => {
            const neighbors = this.getNeighbors(cell.x, cell.y);
            neighbors.forEach(neighbor => {
                // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка границ массива перед доступом
                if (neighbor.x >= 0 && neighbor.x < this.gridWidth && 
                    neighbor.y >= 0 && neighbor.y < this.gridHeight &&
                    this.grid[neighbor.x] && this.grid[neighbor.x][neighbor.y] && 
                    this.grid[neighbor.x][neighbor.y].dna && 
                    Math.random() < this.diseaseSystem.spreadRate) {
                    if (this.grid[neighbor.x][neighbor.y].dna.infect()) {
                        console.log(`🦠 Болезнь распространилась на клетку (${neighbor.x},${neighbor.y})`);
                    }
                }
            });
        });
        
        // Смертность от болезни
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[x][y] && this.grid[x][y].dna && 
                    this.grid[x][y].dna.isInfected() && 
                    Math.random() < this.diseaseSystem.mortalityRate) {
                    this.grid[x][y] = null;
                    console.log(`💀 Клетка (${x},${y}) умерла от болезни`);
                    deaths++;
                } else if (this.grid[x][y] && this.grid[x][y].dna) {
                    this.grid[x][y].dna.recover();
                }
            }
        }
        
        if (deaths > 0) {
            console.log(`🦠 Болезни убили ${deaths} клеток в этом поколении`);
        }
    }
    
    // УДАЛЕНО: старая функция processMigration() - заменена на processMigrationFixed()
    
    // Система симбиоза
    processSymbiosis() {
        if (!this.symbiosisSystem.active) return;
        
        try {
            console.log('Обрабатываем симбиоз...');
            for (let x = 0; x < this.gridWidth; x++) {
                for (let y = 0; y < this.gridHeight; y++) {
                    // Исправление типов: проверяем что клетка - объект, а не boolean
                if (this.grid[x][y] && typeof this.grid[x][y] === 'object' && this.grid[x][y].dna) {
                        const neighbors = this.getNeighbors(x, y);
                        const symbioticNeighbors = neighbors.filter(n => 
                            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка границ массива
                            n.x >= 0 && n.x < this.gridWidth && 
                            n.y >= 0 && n.y < this.gridHeight &&
                            this.grid[n.x] && this.grid[n.x][n.y] && 
                            this.grid[n.x][n.y].dna && 
                            this.grid[n.x][n.y].dna.species === 'symbiotic'
                        );
                        
                        if (symbioticNeighbors.length > 0) {
                            console.log(`Симбиоз: клетка ${x},${y} получает энергию от ${symbioticNeighbors.length} соседей`);
                            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: ограничиваем энергию от симбиоза максимумом 100
                            const energyGain = this.symbiosisSystem.benefit * symbioticNeighbors.length;
                            this.grid[x][y].dna.energy = Math.min(100, this.grid[x][y].dna.energy + energyGain);
                            this.grid[x][y].dna.achievements.add('symbiotic_partner');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('ОШИБКА в processSymbiosis():', error);
            throw error;
        }
    }

    createThemeToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.innerHTML = '🌙';
        toggle.onclick = () => this.toggleTheme();
        document.body.appendChild(toggle);
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        document.body.classList.toggle('dark-theme');
        const toggle = document.querySelector('.theme-toggle');
        toggle.innerHTML = this.isDarkTheme ? '☀️' : '🌙';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.background = type === 'success' ? 'rgba(40, 167, 69, 0.95)' : 
                                       type === 'error' ? 'rgba(220, 53, 69, 0.95)' : 'rgba(0, 123, 255, 0.95)';
        
        document.body.appendChild(notification);
        setTimeout(() => {
            // Исправление утечки памяти
            if (notification && notification.parentNode === document.body) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    createParticle(x, y, color = '#ffd700') {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = color;
        
        document.body.appendChild(particle);
        setTimeout(() => {
            if (document.body.contains(particle)) {
                document.body.removeChild(particle);
            }
        }, 1000);
    }

    initializeGrid() {
        this.grid = [];
        this.nextGrid = [];
        for (let x = 0; x < this.gridWidth; x++) {
            this.grid[x] = [];
            this.nextGrid[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {
                this.grid[x][y] = null;
                this.nextGrid[x][y] = null;
            }
        }
    }

    setupCanvas() {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка существования canvas перед настройкой
        if (!this.canvas || !this.ctx) {
            console.error('Canvas или контекст не инициализированы!');
            return;
        }
        
        const padding = 2;
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: защита от неположительных размеров
        const safeWidth = Math.max(1, this.gridWidth) * Math.max(1, this.cellSize) + padding;
        const safeHeight = Math.max(1, this.gridHeight) * Math.max(1, this.cellSize) + padding;
        
        this.canvas.width = safeWidth;
        this.canvas.height = safeHeight;
        this.canvas.style.border = '1px solid #ccc';
    }

    resizeGrid(newSize) {
        this.gridWidth = newSize;
        this.gridHeight = newSize;
        this.cellSize = Math.min(500 / newSize, 20);
        this.initializeGrid();
        this.setupCanvas();
        this.generation = 0;
        this.evolutionTracker = new EvolutionTracker();
        this.updateStats();
        this.draw();
        this.updateCharts();
    }

    bindEvents() {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка существования DOM элементов перед привязкой
        const bindSafeEvent = (elementId, eventType, handler, description) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener(eventType, handler);
            } else {
                console.warn(`Элемент ${elementId} не найден для события ${description}`);
            }
        };

        // Основные кнопки управления с безопасной привязкой
        bindSafeEvent('playPauseBtn', 'click', () => this.togglePlayPause(), 'play/pause');
        bindSafeEvent('resetBtn', 'click', () => {
            try {
                console.log('Кнопка Сброс нажата');
                this.reset();
            } catch (error) {
                console.error('Ошибка при выполнении reset():', error);
            }
        }, 'reset');
        bindSafeEvent('randomBtn', 'click', () => {
            try {
                console.log('Кнопка Случайно нажата');
                this.randomize();
            } catch (error) {
                console.error('Ошибка при выполнении randomize():', error);
            }
        }, 'randomize');
        bindSafeEvent('clearBtn', 'click', () => {
            try {
                console.log('Кнопка Очистить нажата');
                this.clear();
            } catch (error) {
                console.error('Ошибка при выполнении clear():', error);
            }
        }, 'clear');
        
        // Сохранение и загрузка с безопасной привязкой
        bindSafeEvent('saveBtn', 'click', () => this.saveExperiment(), 'save experiment');
        bindSafeEvent('loadBtn', 'click', () => this.toggleSaveLoadPanel(), 'load experiment');
        bindSafeEvent('exportBtn', 'click', () => this.showExportMenu(), 'export data');
        bindSafeEvent('fileInput', 'change', (e) => this.loadFromFile(e), 'file input');
        
        // Ползунки с безопасной привязкой
        bindSafeEvent('speedSlider', 'input', (e) => {
            const value = parseInt(e.target.value);
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка на валидность
            this.speed = !isNaN(value) ? value : 5; // fallback на 5
            const speedValueEl = document.getElementById('speedValue');
            if (speedValueEl) speedValueEl.textContent = this.speed;
        }, 'speed slider');
        
        // Новые экологические системы (с проверкой существования элементов)
        document.getElementById('diseaseMode')?.addEventListener('change', (e) => {
            this.diseaseSystem.active = e.target.checked;
            if (e.target.checked) {
                this.showNotification('🦠 Система болезней включена', 'info');
            }
        });
        
        document.getElementById('migrationMode')?.addEventListener('change', (e) => {
            this.migrationSystem.active = e.target.checked;
            if (e.target.checked) {
                this.showNotification('🦅 Система миграции включена', 'info');
            }
        });
        
        document.getElementById('symbiosisMode')?.addEventListener('change', (e) => {
            console.log('Symbiosis mode изменен:', e.target.checked);
            this.symbiosisSystem.active = e.target.checked;
            if (e.target.checked) {
                console.log('Добавляем симбиотические клетки...');
                this.addSymbioticCells();
                this.showNotification('🌱 Система симбиоза включена', 'info');
            }
        });

        document.getElementById('gridSize').addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= 10 && value <= 100) {
                this.resizeGrid(value);
            }
        });

        document.getElementById('mutationRate').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.mutationRate = !isNaN(value) ? Math.max(0, Math.min(100, value)) : 2;
            document.getElementById('mutationValue').textContent = this.mutationRate;
        });

        document.getElementById('temperature').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.environment.temperature = !isNaN(value) ? Math.max(-50, Math.min(50, value)) : 0;
            document.getElementById('temperatureValue').textContent = this.environment.temperature + '°C';
        });

        document.getElementById('pressure').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.environment.pressure = !isNaN(value) ? Math.max(0, Math.min(100, value)) : 50;
            document.getElementById('pressureValue').textContent = this.environment.pressure;
        });

        // Чекбоксы режимов
        document.getElementById('evolutionMode').addEventListener('change', (e) => {
            console.log('Evolution mode изменен:', e.target.checked);
            this.evolutionMode = e.target.checked;
            this.toggleEvolutionUI();
            if (this.evolutionMode) {
                console.log('Инициализируем эволюцию...');
                this.initializeEvolution();
            }
        });

        document.getElementById('predatorMode').addEventListener('change', (e) => {
            console.log('Predator mode изменен:', e.target.checked);
            this.predatorMode = e.target.checked;
            this.togglePredatorUI();
            if (this.predatorMode && this.evolutionMode) {
                console.log('Добавляем хищников...');
                this.addPredators();
            }
        });

        document.getElementById('soundEffects').addEventListener('change', (e) => {
            this.soundSystem.enabled = e.target.checked;
        });


        // Breeding controls
        document.getElementById('cloneBtn')?.addEventListener('click', () => this.cloneSelectedCell());
        document.getElementById('selectForBreedingBtn')?.addEventListener('click', () => this.selectForBreeding());
        document.getElementById('killCellBtn')?.addEventListener('click', () => this.killSelectedCell());

        // Canvas events
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));

        // Pattern buttons
        document.querySelectorAll('.btn-pattern').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pattern = e.target.dataset.pattern;
                this.addPattern(pattern);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'KeyR':
                    this.randomize();
                    break;
                case 'KeyC':
                    this.clear();
                    break;
                case 'KeyE':
                    const evolutionCheckbox = document.getElementById('evolutionMode');
                    evolutionCheckbox.checked = !evolutionCheckbox.checked;
                    evolutionCheckbox.dispatchEvent(new Event('change'));
                    break;
                case 'KeyS':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.saveExperiment();
                    }
                    break;
                case 'KeyT':
                    this.toggleTheme();
                    break;
            }
        });
        
        // ИИ-помощник
    }

    toggleEvolutionUI() {
        console.log('toggleEvolutionUI вызвана, evolutionMode:', this.evolutionMode);
        const elements = ['evolutionControls', 'environmentControls', 'ecologyControls', 'geneticsInfo', 'graphsContainer'];
        const statsElements = document.querySelectorAll('.evolution-stat');
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: корректная обработка элементов UI без дублирования
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (this.evolutionMode) {
                    // Специальные типы display для разных элементов
                    if (id === 'evolutionControls' || id === 'environmentControls') {
                        element.style.display = 'flex';
                    } else if (id === 'graphsContainer') {
                        element.style.display = 'grid';
                    } else {
                        element.style.display = 'block';
                    }
                } else {
                    element.style.display = 'none';
                }
                console.log(`Устанавливаем display для ${id}:`, element.style.display);
            } else {
                console.warn(`Элемент ${id} не найден!`);
            }
        });
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: защита от null элементов в querySelectorAll
        if (statsElements && statsElements.length > 0) {
            statsElements.forEach(stat => {
                if (stat) {
                    stat.style.display = this.evolutionMode ? 'flex' : 'none';
                }
            });
        }

        // УДАЛЯЕМ ДУБЛИРОВАНИЕ: элементы уже обработаны выше
        // if (this.evolutionMode) {
        //     document.getElementById('evolutionControls').style.display = 'flex';
        //     document.getElementById('environmentControls').style.display = 'flex';
        //     document.getElementById('graphsContainer').style.display = 'grid';
        // }
    }

    togglePredatorUI() {
        const predatorStats = document.querySelectorAll('.predator-stat');
        const predatorGraph = document.getElementById('predatorGraph');
        
        predatorStats.forEach(stat => {
            stat.style.display = this.predatorMode && this.evolutionMode ? 'flex' : 'none';
        });
        
        if (predatorGraph) {
            predatorGraph.style.display = this.predatorMode && this.evolutionMode ? 'block' : 'none';
        }
    }

    toggleSaveLoadPanel() {
        const panel = document.getElementById('saveLoadPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'block') {
            this.updateExperimentsList();
        }
    }

    showExportMenu() {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: предотвращаем создание множественных меню
        const existingMenu = document.querySelector('.export-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        const menu = document.createElement('div');
        menu.className = 'export-menu'; // добавляем класс для поиска
        menu.style.position = 'fixed';
        menu.style.top = '50%';
        menu.style.left = '50%';
        menu.style.transform = 'translate(-50%, -50%)';
        menu.style.background = 'white';
        menu.style.padding = '20px';
        menu.style.borderRadius = '10px';
        menu.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        menu.style.zIndex = '1000';
        
        menu.innerHTML = `
            <h3>Экспорт данных</h3>
            <button onclick="window.game.exportData('json')" class="btn btn-primary">JSON файл</button>
            <button onclick="window.game.exportData('csv')" class="btn btn-primary">CSV данные</button>
            <button onclick="window.game.exportCharts()" class="btn btn-primary">Графики (PNG)</button>
            <button onclick="window.game.closeExportMenu()" class="btn btn-secondary">Отмена</button>
        `;
        
        document.body.appendChild(menu);
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: автоматическое удаление через 30 секунд
        setTimeout(() => {
            if (menu && menu.parentNode) {
                menu.remove();
            }
        }, 30000);
    }
    
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: безопасное закрытие меню экспорта
    closeExportMenu() {
        const menu = document.querySelector('.export-menu');
        if (menu) {
            menu.remove();
        }
    }

    exportData(format) {
        const data = {
            generation: this.generation,
            grid: this.grid,
            environment: this.environment,
            evolutionTracker: {
                populationHistory: this.evolutionTracker.populationHistory,
                fitnessHistory: this.evolutionTracker.fitnessHistory,
                diversityHistory: this.evolutionTracker.diversityHistory,
                geneDistribution: this.evolutionTracker.geneDistribution,
                predatorPreyHistory: this.evolutionTracker.predatorPreyHistory
            },
            settings: {
                evolutionMode: this.evolutionMode,
                predatorMode: this.predatorMode,
                mutationRate: this.mutationRate,
                speed: this.speed
            }
        };

        if (format === 'json') {
            this.experimentManager.exportToJSON(data);
        } else if (format === 'csv') {
            this.experimentManager.exportToCSV(this.evolutionTracker);
        }

        // Закрываем меню
        const menu = document.querySelector('[style*="z-index: 1000"]');
        if (menu) document.body.removeChild(menu);
        
        this.showNotification(`Данные экспортированы в ${format.toUpperCase()}`, 'success');
    }

    exportCharts() {
        Object.keys(this.charts).forEach(chartName => {
            const canvas = document.getElementById(chartName + 'Chart');
            if (canvas) {
                const link = document.createElement('a');
                link.download = `${chartName}_chart.png`;
                link.href = canvas.toDataURL();
                link.click();
            }
        });
        
        // Закрываем меню
        const menu = document.querySelector('[style*="z-index: 1000"]');
        if (menu) document.body.removeChild(menu);
        
        this.showNotification('Графики экспортированы', 'success');
    }

    initializeEvolution() {
        try {
            console.log('Начинаем инициализацию эволюции...');
            for (let x = 0; x < this.gridWidth; x++) {
                for (let y = 0; y < this.gridHeight; y++) {
                    if (this.grid[x][y]) {
                        console.log(`Создаем ДНК для клетки ${x},${y}`);
                        this.grid[x][y] = {
                            dna: new CellDNA()
                        };
                    }
                }
            }
            console.log('ДНК создана, обновляем статистики...');
            this.updateStats();
            console.log('Рисуем сетку...');
            this.draw();
            console.log('Обновляем графики...');
            this.updateCharts();
            console.log('Инициализация эволюции завершена');
        } catch (error) {
            console.error('КРИТИЧЕСКАЯ ОШИБКА в initializeEvolution():', error);
            throw error;
        }
    }

    addPredators() {
        let predatorsAdded = 0;
        let attempts = 0;
        const maxAttempts = 100;
        
        // Случайное размещение хищников по всему полю
        while (predatorsAdded < 5 && attempts < maxAttempts) {
            const x = Math.floor(Math.random() * this.gridWidth);
            const y = Math.floor(Math.random() * this.gridHeight);
            
            if (!this.grid[x][y]) {
                const predatorDNA = new CellDNA(80, 60, 70, 50, 'predator');
                predatorDNA.migrationTendency = 80; // Хищники более мобильны
                this.grid[x][y] = {
                    dna: predatorDNA
                };
                predatorsAdded++;
                console.log(`🦎 Добавлен мобильный хищник в (${x},${y}) с миграцией ${predatorDNA.migrationTendency}`);
            }
            attempts++;
        }
        
        console.log(`🦎 Добавлено ${predatorsAdded} хищников из 5 попыток`);
        this.updateStats();
        this.draw();
    }

    addSymbioticCells() {
        let symbioticAdded = 0;
        for (let x = 0; x < this.gridWidth && symbioticAdded < 3; x++) {
            for (let y = 0; y < this.gridHeight && symbioticAdded < 3; y++) {
                if (!this.grid[x][y] && Math.random() < 0.05) {
                    // Исправление: создаем обычные клетки с высоким symbiosisCapacity
                    const symbioticDNA = new CellDNA(70, 80, 90, 60, 'prey');
                    symbioticDNA.symbiosisCapacity = 85 + Math.random() * 15;
                    this.grid[x][y] = {
                        dna: symbioticDNA
                    };
                    symbioticAdded++;
                    console.log(`Добавлена симбиотическая клетка в ${x},${y} с symbiosisCapacity=${symbioticDNA.symbiosisCapacity.toFixed(0)}`);
                }
            }
        }
        console.log(`Всего добавлено симбиотических клеток: ${symbioticAdded}`);
        this.updateStats();
        this.draw();
    }

    saveExperiment() {
        const name = prompt('Название эксперимента:') || `Эксперимент ${Date.now()}`;
        const data = {
            generation: this.generation,
            grid: this.grid,
            environment: this.environment,
            evolutionTracker: this.evolutionTracker,
            settings: {
                evolutionMode: this.evolutionMode,
                predatorMode: this.predatorMode,
                mutationRate: this.mutationRate,
                speed: this.speed,
                gridSize: this.gridWidth
            }
        };
        
        this.experimentManager.saveExperiment(name, data);
        this.updateExperimentsList();
        this.showNotification('Эксперимент сохранен', 'success');
    }

    loadExperiment(id) {
        const experiment = this.experimentManager.loadExperiment(id);
        if (!experiment) return;
        
        this.loadExperimentData(experiment.data);
        this.toggleSaveLoadPanel();
        
        this.showNotification(`Эксперимент "${experiment.name}" загружен`, 'success');
    }

    loadFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.loadExperimentData(data);
                this.showNotification('Файл загружен', 'success');
            } catch (error) {
                this.showNotification('Ошибка загрузки файла', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    updateExperimentsList() {
        const container = document.getElementById('savedExperiments');
        if (this.experimentManager.experiments.length === 0) {
            container.innerHTML = '<p>Нет сохраненных экспериментов</p>';
            return;
        }
        
        container.innerHTML = this.experimentManager.experiments.map(exp => `
            <div class="experiment-item" onclick="game.loadExperiment(${exp.id})">
                <div class="experiment-name">${exp.name}</div>
                <div class="experiment-details">
                    ${new Date(exp.date).toLocaleDateString()}<br>
                    Поколение: ${exp.data.generation}
                </div>
                <button onclick="event.stopPropagation(); game.deleteExperiment(${exp.id})" style="color: red; border: none; background: none; cursor: pointer;">×</button>
            </div>
        `).join('');
    }

    deleteExperiment(id) {
        if (confirm('Удалить эксперимент?')) {
            this.experimentManager.deleteExperiment(id);
            this.updateExperimentsList();
            this.showNotification('Эксперимент удален', 'success');
        }
    }

    // Auto-save functionality
    setupAutoSave() {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: очищаем предыдущий интервал перед созданием нового
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        
        this.autoSaveInterval = setInterval(() => {
            try {
                if (this.evolutionMode && this.generation > 0) {
                    this.autoSave();
                }
            } catch (error) {
                console.error('Ошибка в автосохранении:', error);
                // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: очищаем проблемный интервал
                if (this.autoSaveInterval) {
                    clearInterval(this.autoSaveInterval);
                    this.autoSaveInterval = null;
                }
            }
        }, 60000); // Auto-save every minute
    }

    autoSave() {
        const autoSaveData = {
            generation: this.generation,
            grid: this.grid,
            environment: this.environment,
            evolutionTracker: this.evolutionTracker,
            settings: {
                evolutionMode: this.evolutionMode,
                predatorMode: this.predatorMode,
                mutationRate: this.mutationRate,
                speed: this.speed,
                gridSize: this.gridWidth
            },
            timestamp: Date.now()
        };
        
        try {
            const dataString = JSON.stringify(autoSaveData);
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка размера данных перед сохранением
            const dataSizeKB = Math.round(dataString.length / 1024);
            const maxSizeKB = 5000; // 5MB лимит для localStorage
            
            if (dataSizeKB > maxSizeKB) {
                console.warn(`Автосохранение слишком большое (${dataSizeKB}KB > ${maxSizeKB}KB), сжимаем данные...`);
                // Упрощаем данные для сохранения
                const compactData = {
                    generation: this.generation,
                    environment: this.environment,
                    settings: autoSaveData.settings,
                    timestamp: Date.now(),
                    populationCount: this.grid.flat().filter(cell => cell).length
                };
                localStorage.setItem('gameOfLife_autoSave', JSON.stringify(compactData));
                console.log('Auto-saved compact version at generation', this.generation);
            } else {
                localStorage.setItem('gameOfLife_autoSave', dataString);
                console.log('Auto-saved at generation', this.generation);
            }
        } catch (e) {
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: обработка переполнения localStorage
            if (e.name === 'QuotaExceededError') {
                console.warn('LocalStorage переполнен, очищаем старые данные...');
                this.cleanupLocalStorage();
                try {
                    // Повторная попытка с минимальными данными
                    const minimalData = {
                        generation: this.generation,
                        settings: autoSaveData.settings,
                        timestamp: Date.now()
                    };
                    localStorage.setItem('gameOfLife_autoSave', JSON.stringify(minimalData));
                    console.log('Auto-saved minimal version at generation', this.generation);
                } catch (e2) {
                    console.error('Критическая ошибка автосохранения:', e2);
                }
            } else {
                console.warn('Auto-save failed:', e);
            }
        }
    }

    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: метод очистки localStorage при переполнении
    cleanupLocalStorage() {
        try {
            const keysToClean = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('gameOfLife_')) {
                    keysToClean.push(key);
                }
            }
            
            // Удаляем старые эксперименты, оставляем только последние 5
            const experiments = keysToClean.filter(k => k.includes('experiment'));
            if (experiments.length > 5) {
                experiments.slice(0, -5).forEach(key => {
                    localStorage.removeItem(key);
                    console.log(`Удален старый эксперимент: ${key}`);
                });
            }
            
            console.log(`Очистка LocalStorage завершена. Освобождено ${experiments.length - 5} записей.`);
        } catch (error) {
            console.error('Ошибка очистки localStorage:', error);
        }
    }

    loadAutoSave() {
        try {
            const autoSave = localStorage.getItem('gameOfLife_autoSave');
            if (autoSave) {
                const data = JSON.parse(autoSave);
                const timeSinceAutoSave = Date.now() - data.timestamp;
                
                if (timeSinceAutoSave < 3600000) { // Within last hour
                    if (confirm(`Обнаружено автосохранение от ${new Date(data.timestamp).toLocaleTimeString()}. Загрузить?`)) {
                        this.loadExperimentData(data);
                        this.showNotification('Автосохранение загружено', 'success');
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to load auto-save:', e);
        }
    }

    loadExperimentData(data) {
        this.generation = data.generation || 0;
        this.grid = data.grid || [];
        this.environment = data.environment || { temperature: 0, pressure: 50 };
        this.evolutionTracker = Object.assign(new EvolutionTracker(), data.evolutionTracker);
        
        if (data.settings) {
            this.evolutionMode = data.settings.evolutionMode;
            this.predatorMode = data.settings.predatorMode;
            this.mutationRate = data.settings.mutationRate;
            this.speed = data.settings.speed;
            
            // Update UI
            document.getElementById('evolutionMode').checked = this.evolutionMode;
            document.getElementById('predatorMode').checked = this.predatorMode;
            document.getElementById('mutationRate').value = this.mutationRate;
            document.getElementById('mutationValue').textContent = this.mutationRate;
            document.getElementById('speedSlider').value = this.speed;
            document.getElementById('speedValue').textContent = this.speed;
            document.getElementById('temperature').value = this.environment.temperature;
            document.getElementById('temperatureValue').textContent = this.environment.temperature + '°C';
            document.getElementById('pressure').value = this.environment.pressure;
            document.getElementById('pressureValue').textContent = this.environment.pressure;
            
            if (data.settings.gridSize !== this.gridWidth) {
                document.getElementById('gridSize').value = data.settings.gridSize;
                this.resizeGrid(data.settings.gridSize);
            }
        }
        
        this.toggleEvolutionUI();
        this.togglePredatorUI();
        this.updateStats();
        this.draw();
        this.updateCharts();
    }


    // Breeding controls
    cloneSelectedCell() {
        if (!this.selectedCell || !this.selectedCell.dna) return;
        
        // Находим пустое место рядом
        const emptyCells = this.getEmptyNeighborCells(this.selectedCell.x, this.selectedCell.y);
        if (emptyCells.length > 0) {
            const randomEmpty = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomEmpty.x][randomEmpty.y] = {
                dna: this.selectedCell.dna.clone()
            };
            this.updateStats();
            this.draw();
            this.showNotification('Клетка клонирована', 'success');
        }
    }

    selectForBreeding() {
        if (!this.selectedCell || !this.selectedCell.dna) return;
        
        this.breedingSelection.push(this.selectedCell);
        
        if (this.breedingSelection.length >= 2) {
            this.breedCells();
        }
        
        this.updateBreedingDisplay();
    }

    selectForBreedingAt(x, y) {
        if (!this.grid[x][y] || typeof this.grid[x][y] !== 'object' || !this.grid[x][y].dna) return;
        
        // Создаем временный объект клетки с координатами для разведения
        const cellForBreeding = { ...this.grid[x][y], x, y };
        this.breedingSelection.push(cellForBreeding);
        
        console.log(`Клетка ${x},${y} добавлена для разведения. Всего выбрано: ${this.breedingSelection.length}`);
        
        if (this.breedingSelection.length >= 2) {
            console.log('Начинаем процесс разведения...');
            this.breedCells();
        }
        
        this.updateBreedingDisplay();
    }

    breedCells() {
        const parent1 = this.breedingSelection[0];
        const parent2 = this.breedingSelection[1];
        const offspring = parent1.dna.crossover(parent2.dna);
        
        // Находим место для потомка
        const emptyCells = this.getAllEmptyCells();
        if (emptyCells.length > 0) {
            const randomEmpty = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomEmpty.x][randomEmpty.y] = { dna: offspring };
            this.showNotification('Создано потомство!', 'success');
        }
        
        this.breedingSelection = [];
        this.updateBreedingDisplay();
        this.updateStats();
        this.draw();
    }

    killSelectedCell() {
        if (!this.selectedCell) return;
        
        // Исправление: используем координаты вместо ссылок на объекты
        if (this.selectedCellCoords && this.selectedCellCoords.x !== undefined && this.selectedCellCoords.y !== undefined) {
            const {x, y} = this.selectedCellCoords;
            if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight && this.grid[x][y]) {
                this.grid[x][y] = null;
                this.selectedCell = null;
                this.selectedCellCoords = null;
                this.updateStats();
                this.draw();
                this.showNotification('Клетка удалена', 'success');
                return;
            }
        }
        
        // Fallback: поиск по ссылке (старая логика)
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[x][y] === this.selectedCell) {
                    this.grid[x][y] = null;
                    this.selectedCell = null;
                    this.selectedCellCoords = null;
                    this.updateStats();
                    this.draw();
                    this.showNotification('Клетка удалена', 'success');
                    return;
                }
            }
        }
    }

    updateBreedingDisplay() {
        const display = document.getElementById('selectedForBreeding');
        if (display) {
            display.innerHTML = `Выбрано для скрещивания: ${this.breedingSelection.length}/2`;
        }
    }

    getEmptyNeighborCells(centerX, centerY) {
        const empty = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const x = centerX + dx;
                const y = centerY + dy;
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight && !this.grid[x][y]) {
                    empty.push({ x, y });
                }
            }
        }
        return empty;
    }

    getAllEmptyCells() {
        const empty = [];
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (!this.grid[x][y]) {
                    empty.push({ x, y });
                }
            }
        }
        return empty;
    }

    handleCanvasClick(e) {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка существования canvas и валидности event
        if (!this.canvas || !e) {
            console.error('Canvas или событие недоступны для обработки клика');
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: защита от деления на ноль в cellSize
        const safeCellSize = Math.max(1, this.cellSize || 12);
        const x = Math.floor((e.clientX - rect.left) / safeCellSize);
        const y = Math.floor((e.clientY - rect.top) / safeCellSize);
        
        console.log(`Клик на ячейку ${x},${y}`, this.evolutionMode ? 'режим эволюции' : 'базовый режим');
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка валидности координат
        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight && 
            this.grid && this.grid[x]) {
            if (this.evolutionMode) {
                // В режиме эволюции - селекция или создание/удаление клетки
                if (e.ctrlKey && this.grid[x][y] && this.grid[x][y].dna) {
                    // Ctrl+клик - выбор для разведения
                    console.log('Выбор клетки для разведения');
                    this.selectForBreedingAt(x, y);
                } else if (this.grid[x][y]) {
                    // Клик по существующей клетке - селекция или удаление
                    // Исправление: сохраняем координаты вместе с объектом
                    this.selectedCellCoords = {x, y};
                    if (this.selectedCell === this.grid[x][y]) {
                        // Повторный клик - удаляем клетку
                        this.grid[x][y] = null;
                        this.selectedCell = null;
                    } else {
                        // Выбираем клетку
                        this.selectedCell = this.grid[x][y];
                        console.log('Выбрана клетка:', this.selectedCell);
                    }
                } else {
                    // Создаем новую клетку
                    const species = this.predatorMode && Math.random() < 0.2 ? 'predator' : 'prey';
                    this.grid[x][y] = {
                        dna: new CellDNA(undefined, undefined, undefined, undefined, species)
                    };
                    // Сохраняем координаты для селекции
                    this.selectedCell = { ...this.grid[x][y], x, y };
                    console.log('Создана новая клетка:', species);
                }
                
                this.updateCellInfo();
                
                // Показываем breeding controls если клетка выбрана
                const breedingControls = document.getElementById('breedingControls');
                if (breedingControls) {
                    breedingControls.style.display = this.selectedCell ? 'block' : 'none';
                }
            } else {
                // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ СМЕШАННЫХ ТИПОВ: не смешиваем boolean и objects
                if (this.isEvolutionMode) {
                    // В эволюционном режиме создаем клетку с ДНК
                    if (!this.grid[x][y] || typeof this.grid[x][y] === 'boolean') {
                        this.grid[x][y] = {
                            dna: new CellDNA()
                        };
                    } else {
                        this.grid[x][y] = null;
                    }
                } else {
                    // Базовый режим - только boolean
                    this.grid[x][y] = !this.grid[x][y];
                }
            }
            this.updateStats();
            this.draw();
        }
    }

    handleCanvasHover(e) {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка существования canvas и валидности event
        if (!this.canvas || !e) {
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: защита от деления на ноль в cellSize
        const safeCellSize = Math.max(1, this.cellSize || 12);
        const x = Math.floor((e.clientX - rect.left) / safeCellSize);
        const y = Math.floor((e.clientY - rect.top) / safeCellSize);
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка валидности координат перед присваиванием
        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
            this.hoveredCell = { x, y };
            
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: безопасная проверка существования grid и клетки
            if (this.evolutionMode && this.grid && this.grid[x] && this.grid[x][y]) {
                this.selectedCell = this.grid[x][y];
                this.selectedCell.x = x;
                this.selectedCell.y = y;
                this.updateCellInfo();
            }
            
            this.draw();
        } else {
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: очищаем hoveredCell при выходе за границы
            this.hoveredCell = null;
        }
    }

    updateCellInfo() {
        const cellInfoDiv = document.getElementById('selectedCellDNA');
        
        if (!this.selectedCell || !this.selectedCell.dna) {
            cellInfoDiv.innerHTML = '<p>Выберите живую клетку</p>';
            return;
        }

        const dna = this.selectedCell.dna;
        const speciesIcon = dna.species === 'predator' ? '🦎' : '🐛';
        
        cellInfoDiv.innerHTML = `
            <div style="text-align: center; margin-bottom: 10px;">
                <span style="font-size: 20px;">${speciesIcon}</span>
                <strong>${dna.species === 'predator' ? 'Хищник' : 'Травоядное'}</strong>
            </div>
            <div class="dna-trait">
                <span class="trait-name">🟢 Выживаемость:</span>
                <span class="trait-value">${dna.survival.toFixed(1)}%</span>
            </div>
            <div class="dna-trait">
                <span class="trait-name">🔵 Репродукция:</span>
                <span class="trait-value">${dna.reproduction.toFixed(1)}%</span>
            </div>
            <div class="dna-trait">
                <span class="trait-name">🟡 Адаптация:</span>
                <span class="trait-value">${dna.adaptation.toFixed(1)}%</span>
            </div>
            <div class="dna-trait">
                <span class="trait-name">🔴 Устойчивость:</span>
                <span class="trait-value">${dna.resistance.toFixed(1)}%</span>
            </div>
            <div class="dna-trait">
                <span class="trait-name">⭐ Приспособленность:</span>
                <span class="trait-value">${(dna.fitness * 100).toFixed(1)}%</span>
            </div>
            <div class="dna-trait">
                <span class="trait-name">🔬 Поколение:</span>
                <span class="trait-value">${dna.generation}</span>
            </div>
            <div class="dna-trait">
                <span class="trait-name">🕐 Возраст:</span>
                <span class="trait-value">${dna.age}</span>
            </div>
            <div class="dna-trait">
                <span class="trait-name">⚡ Энергия:</span>
                <span class="trait-value">${dna.energy.toFixed(1)}</span>
            </div>
        `;
    }

    togglePlayPause() {
        console.log('togglePlayPause вызвана, текущее состояние:', this.isPlaying);
        this.isPlaying = !this.isPlaying;
        const btn = document.getElementById('playPauseBtn');
        console.log('Новое состояние:', this.isPlaying);
        
        if (this.isPlaying) {
            btn.innerHTML = '⏸ Пауза';
            btn.classList.add('playing');
            console.log('Запускаем анимацию...');
            this.start();
        } else {
            btn.innerHTML = '▶ Старт';
            btn.classList.remove('playing');
            console.log('Останавливаем анимацию...');
            this.stop();
        }
    }

    start() {
        console.log('start() вызвана, isPlaying:', this.isPlaying);
        if (this.isPlaying) {
            this.lastTime = performance.now();
            console.log('Начинаем анимацию...');
            this.animate();
        }
    }

    stop() {
        // Улучшенная очистка анимации
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isPlaying = false; // Гарантируем остановку
    }

    animate() {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка состояния перед анимацией
        if (!this.isPlaying) {
            return; // Прекращаем анимацию если игра остановлена
        }
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: защита от деления на ноль в speed
        const safeSpeed = Math.max(0.1, this.speed || 5);
        const interval = 1000 / safeSpeed;

        // Обновление FPS с защитой от утечек памяти
        this.frameCount++;
        if (currentTime - this.fpsLastTime >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.fpsLastTime = currentTime;
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: безопасное обновление FPS элемента
            const fpsElement = document.getElementById('fps');
            if (fpsElement) {
                fpsElement.textContent = this.currentFPS;
            }
        }

        if (deltaTime >= interval) {
            console.log('Обновляем поколение...', this.generation);
            this.nextGeneration();
            this.lastTime = currentTime - (deltaTime % interval);
        }

        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: защита от утечек анимации
        if (this.isPlaying && !this.animationId) { // Проверяем что анимация еще не запущена
            this.animationId = requestAnimationFrame(() => {
                this.animationId = null; // Очищаем ID перед вызовом
                this.animate();
            });
        }
    }

    nextGeneration() {
        console.log(`🎮 nextStep(): evolutionMode=${this.evolutionMode}`);
        if (this.evolutionMode) {
            this.nextGenerationEvolution();
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: поколения увеличиваются только в эволюционном режиме
            this.generation++;
        } else {
            console.log(`🎯 Используется классический режим вместо эволюционного!`);
            this.nextGenerationClassic();
            // В классическом режиме поколения не меняются
        }
        
        this.updateStats();
        this.draw();
        
        if (this.evolutionMode) {
            this.evolutionTracker.update(this.grid, this.generation, this.environment);
            this.updateCharts();
            this.checkAchievements();
            
            // Проверка катастроф
            this.catastropheTimer--;
            if (this.catastropheTimer <= 0) {
                this.triggerCatastrophe();
            }
            
            // Обновляем аналитику (экологические системы уже применены в nextGenerationEvolution)
            this.updateHeatmap();
            this.calculateScientificMetrics();
        }
    }


    nextGenerationClassic() {
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const neighbors = this.countNeighborsClassic(x, y);
                const isAlive = this.grid[x][y];

                if (isAlive) {
                    this.nextGrid[x][y] = neighbors === 2 || neighbors === 3;
                } else {
                    this.nextGrid[x][y] = neighbors === 3;
                }
            }
        }
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
    }

    nextGenerationEvolution() {
        console.log(`🔄 nextGenerationEvolution() ВЫЗВАНА для поколения ${this.generation}`);
        let births = 0, deaths = 0, mutations = 0, predatorKills = 0;
        let survivalChecks = 0, extremeConditionsChecks = 0, reproductionAttempts = 0;
        let extremeSurvived = 0, extremeDied = 0;

        // 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: принудительная очистка старых клеток ДО начала обработки
        let oldCellsFound = 0;
        let fixedLifespanCount = 0;
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const cell = this.grid[x][y];
                if (cell && cell.dna) {
                    // 🔧 ИСПРАВЛЯЕМ СТАРЫЕ КЛЕТКИ С НЕПРАВИЛЬНЫМ LIFESPAN
                    if (cell.dna.lifespan > 100) {
                        cell.dna.lifespan = 20 + Math.random() * 80; // Новый реалистичный диапазон
                        fixedLifespanCount++;
                    }
                    // 🚨 ОТЛАДКА: логируем все клетки старше 50 лет (реалистичный предел)
                    if (cell.dna.age >= 50) {
                        console.log(`🚨 НАЙДЕНА СТАРАЯ КЛЕТКА в (${x},${y}): возраст=${cell.dna.age}, лимит=${cell.dna.lifespan.toFixed(1)}, поколение=${cell.dna.generation}, вид=${cell.dna.species}, превышение=${(cell.dna.age - cell.dna.lifespan).toFixed(1)}`);
                        oldCellsFound++;
                        
                        // 🔥 ПРИНУДИТЕЛЬНОЕ ОГРАНИЧЕНИЕ: если lifespan слишком большой, сбрасываем
                        if (cell.dna.lifespan > 100) {
                            console.log(`⚠️ ИСПРАВЛЯЮ АНОМАЛЬНЫЙ LIFESPAN: ${cell.dna.lifespan.toFixed(1)} → 100`);
                            cell.dna.lifespan = 100;
                        }
                    }
                    
                    if (cell.dna.age >= cell.dna.lifespan) {
                        console.log(`☠️ ПРИНУДИТЕЛЬНАЯ СМЕРТЬ в (${x},${y}): возраст=${cell.dna.age}, лимит=${cell.dna.lifespan}, поколение=${cell.dna.generation}`);
                        this.grid[x][y] = null; // Удаляем старую клетку из текущей сетки
                        deaths++;
                    }
                }
            }
        }
        
        if (fixedLifespanCount > 0) {
            console.log(`🔧 ИСПРАВЛЕНО КЛЕТОК С БОЛЬШИМ LIFESPAN: ${fixedLifespanCount}`);
        }
        if (oldCellsFound > 0) {
            console.log(`🚨 ВСЕГО НАЙДЕНО КЛЕТОК 50+ ЛЕТ (биологически старых): ${oldCellsFound}`);
        }
        
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const neighbors = this.getNeighborsEvolution(x, y);
                const currentCell = this.grid[x][y];

                if (currentCell && currentCell.dna) {
                    survivalChecks++;
                    // Клетка живая
                    currentCell.dna.age++;
                    
                    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ ЭНЕРГЕТИЧЕСКОГО БАЛАНСА
                    // Исходная проблема: -2 +3 = +1 энергии каждый ход (бессмертие!)
                    
                    // Базовые затраты на жизнь
                    const baseCost = 3;
                    currentCell.dna.energy = Math.max(0, currentCell.dna.energy - baseCost);
                    
                    // Восполнение зависит от условий и генов
                    let energyGain = 0;
                    if (neighbors.length >= 2 && neighbors.length <= 3) {
                        energyGain = 2 + (currentCell.dna.survival / 100); // 2-3 энергии
                    } else if (neighbors.length === 1 || neighbors.length === 4) {
                        energyGain = 1; // Минимальное восполнение
                    }
                    // Нет восполнения при 0, 5+ соседях (смерть от одиночества/перенаселения)
                    
                    currentCell.dna.energy = Math.min(100, currentCell.dna.energy + energyGain);
                    
                    // Итог: баланс -3+2=-1 в оптимальных условиях (постепенное старение)
                    
                    // 💀 СМЕРТЬ ОТ СТАРОСТИ - принудительная проверка возраста
                    if (currentCell.dna.age >= currentCell.dna.lifespan) {
                        deaths++;
                        this.soundSystem.death();
                        this.createParticle(x * this.cellSize, y * this.cellSize, '#888888');
                        
                        // Логируем смерть от старости
                        if (Math.random() < 0.05) { // 5% случаев
                            console.log(`⚰️ СМЕРТЬ ОТ СТАРОСТИ: возраст=${currentCell.dna.age}, лимит=${currentCell.dna.lifespan.toFixed(0)}, поколение=${currentCell.dna.generation}, вид=${currentCell.dna.species}`);
                        }
                        
                        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: мёртвую клетку НАДО удалить из nextGrid!
                        this.nextGrid[x][y] = null;
                        
                        // Пропускаем все дальнейшие проверки - клетка умерла
                        continue;
                    }
                    
                    // Хищники охотятся на травоядных
                    if (currentCell.dna.species === 'predator' && this.predatorMode) {
                        const prey = neighbors.filter(n => n.dna.species === 'prey');
                        if (prey.length > 0 && Math.random() < 0.3) { // 30% шанс поймать жертву
                            // Выбираем случайную жертву
                            const victim = prey[Math.floor(Math.random() * prey.length)];
                            
                            // Исправление race condition: сохраняем координаты жертвы
                            let victimFound = false;
                            let victimX, victimY;
                            
                            for (let nx = Math.max(0, x-1); nx <= Math.min(this.gridWidth-1, x+1) && !victimFound; nx++) {
                                for (let ny = Math.max(0, y-1); ny <= Math.min(this.gridHeight-1, y+1) && !victimFound; ny++) {
                                    if (this.grid[nx][ny] === victim) {
                                        victimX = nx;
                                        victimY = ny;
                                        victimFound = true;
                                    }
                                }
                            }
                            
                            if (victimFound) {
                                // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверяем что жертва еще не убита другим хищником
                                if (this.nextGrid[victimX][victimY] !== null) {
                                    // Безопасно "убиваем" жертву в nextGrid
                                    this.nextGrid[victimX][victimY] = null;
                                    
                                    // 🦎 Хищник получает энергию от жертвы
                                    const victimEnergy = victim.dna.energy || 50;
                                    const energyGain = Math.min(40, victimEnergy * 0.6);
                                    currentCell.dna.energy = Math.min(100, currentCell.dna.energy + energyGain);
                                    
                                    predatorKills++;
                                    this.soundSystem.predatorKill();
                                    console.log(`🦎 Хищник съел жертву в (${victimX},${victimY}), получил ${energyGain.toFixed(0)} энергии, итого: ${currentCell.dna.energy.toFixed(0)}`);
                                } else {
                                    // Жертва уже убита другим хищником
                                    console.log(`🦎 Жертва в (${victimX},${victimY}) уже убита другим хищником`);
                                }
                            }
                        }
                    }
                    
                    const survivalChance = this.calculateSurvivalChance(currentCell.dna, neighbors.length);
                    
                    // Считаем проверки при экстремальных условиях
                    if (Math.abs(this.environment.temperature) > 40 || Math.abs(this.environment.pressure - 50) > 40) {
                        extremeConditionsChecks++;
                    }
                    
                    // ОТЛАДКА: проверяем экстремальные условия (ограничиваем вывод)
                    if ((Math.abs(this.environment.temperature) > 40 || Math.abs(this.environment.pressure - 50) > 40) && Math.random() < 0.05) {
                        console.log(`🌡️ ЭКСТРИМ: темп=${this.environment.temperature}, давл=${this.environment.pressure}, шанс выжить=${(survivalChance*100).toFixed(0)}%, энергия=${currentCell.dna.energy}, адаптация=${currentCell.dna.adaptation}`);
                    }
                    
                    if (Math.random() < survivalChance) {
                        // Клетка выживает
                        const newCell = { dna: currentCell.dna.clone() };
                        newCell.dna.age = currentCell.dna.age;
                        newCell.dna.energy = currentCell.dna.energy;
                        
                        // 🧬 ИСПРАВЛЕНИЕ: сохраняем поколение для выживших клеток
                        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: выжившие клетки НЕ увеличивают поколение
                        // Поколение остается прежним для выживших клеток
                        newCell.dna.generation = currentCell.dna.generation;
                        // ИСПРАВЛЕНИЕ: возраст уже увеличился в строке 1752, не увеличиваем дважды!
                        newCell.dna.age = currentCell.dna.age;
                        
                        // 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка смерти от старости ПОСЛЕ увеличения возраста
                        if (newCell.dna.age >= newCell.dna.lifespan) {
                            // Клетка умирает от старости даже после выживания
                            deaths++;
                            this.nextGrid[x][y] = null;
                            
                            // 📊 Логирование смерти от старости
                            if (Math.random() < 0.1) { // 10% логирования для отладки
                                console.log(`💀 СМЕРТЬ ОТ СТАРОСТИ: возраст=${newCell.dna.age}, лимит=${newCell.dna.lifespan}, поколение=${newCell.dna.generation}`);
                            }
                            continue;
                        }
                        
                        const didMutate = newCell.dna.mutate(this.mutationRate, this.environment);
                        if (didMutate) {
                            mutations++;
                            this.soundSystem.mutation();
                            this.createParticle(x * this.cellSize, y * this.cellSize, '#ff6b6b');
                        }
                        
                        this.nextGrid[x][y] = newCell;
                        
                        // Считаем выживших в экстриме
                        if (Math.abs(this.environment.temperature) > 40 || Math.abs(this.environment.pressure - 50) > 40) {
                            extremeSurvived++;
                        }
                    } else {
                        // Клетка умирает
                        deaths++;
                        this.soundSystem.death();
                        this.nextGrid[x][y] = null;
                        
                        // Считаем умерших в экстриме
                        if (Math.abs(this.environment.temperature) > 40 || Math.abs(this.environment.pressure - 50) > 40) {
                            extremeDied++;
                            if (Math.random() < 0.1) {
                                console.log(`💀 СМЕРТЬ от экстрима в (${x},${y}): шанс выжить был ${(survivalChance*100).toFixed(0)}%`);
                            }
                        }
                    }
                } else {
                    // Пустая клетка - возможность рождения
                    if (neighbors.length >= 2 && neighbors.length <= 4) {
                        reproductionAttempts++;
                        const reproductionChance = this.calculateReproductionChance(neighbors);
                        
                        if (Math.random() < reproductionChance) {
                            // Создаем потомка
                            const newborn = {
                                dna: this.createOffspringDNA(neighbors)
                            };
                            newborn.dna.mutate(this.mutationRate, this.environment);
                            
                            // КРИТИЧНО: новорожденные должны пройти проверку выживания в экстремальных условиях!
                            const newbornSurvivalChance = this.calculateSurvivalChance(newborn.dna, neighbors.length);
                            
                            if (Math.random() < newbornSurvivalChance) {
                                // Новорожденный выживает
                                births++;
                                this.soundSystem.birth();
                                this.nextGrid[x][y] = newborn;
                                this.createParticle(x * this.cellSize, y * this.cellSize, '#28a745');
                                
                                if (Math.abs(this.environment.temperature) > 40 || Math.abs(this.environment.pressure - 50) > 40) {
                                    if (Math.random() < 0.05) {
                                        console.log(`👶 НОВОРОЖДЕННЫЙ ВЫЖИЛ в экстриме: шанс=${(newbornSurvivalChance*100).toFixed(0)}%, адаптация=${newborn.dna.adaptation}`);
                                    }
                                }
                            } else {
                                // Новорожденный умирает от экстремальных условий
                                if (Math.abs(this.environment.temperature) > 40 || Math.abs(this.environment.pressure - 50) > 40) {
                                    if (Math.random() < 0.1) {
                                        console.log(`💀 НОВОРОЖДЕННЫЙ УМЕР в экстриме: шанс выжить был ${(newbornSurvivalChance*100).toFixed(0)}%`);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: экология ДО swap, чтобы не дублировать обработку
        // Применяем экологические системы К ТЕКУЩЕМУ nextGrid (ещё не swapped!)
        const ecologyDeaths = this.applyEcologicalSystemsToGrid(this.nextGrid);
        deaths += ecologyDeaths;
        
        // Только ПОСЛЕ всех обработок делаем swap
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
        
        // 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: принудительная очистка старых клеток ПОСЛЕ swap тоже!
        let postSwapOldCells = 0;
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const cell = this.grid[x][y];
                if (cell && cell.dna && cell.dna.age >= cell.dna.lifespan) {
                    console.log(`☠️ ПОСТ-SWAP СМЕРТЬ в (${x},${y}): возраст=${cell.dna.age}, лимит=${cell.dna.lifespan}, поколение=${cell.dna.generation}`);
                    this.grid[x][y] = null;
                    deaths++;
                    postSwapOldCells++;
                }
            }
        }
        
        if (postSwapOldCells > 0) {
            console.log(`🚨 УДАЛЕНО СТАРЫХ КЛЕТОК ПОСЛЕ SWAP: ${postSwapOldCells}`);
        }
        
        // Подсчитываем текущую популяцию
        let currentPopulation = 0;
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[x][y]) currentPopulation++;
            }
        }
        
        // Анализируем адаптацию популяции
        let totalAdaptation = 0, adaptationCount = 0;
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                // Исправление типов: проверяем что клетка - объект, а не boolean
                if (this.grid[x][y] && typeof this.grid[x][y] === 'object' && this.grid[x][y].dna) {
                    totalAdaptation += this.grid[x][y].dna.adaptation;
                    adaptationCount++;
                }
            }
        }
        const avgAdaptation = adaptationCount > 0 ? (totalAdaptation / adaptationCount).toFixed(1) : 0;

        // Показываем статистику поколения
        if (births + deaths + mutations > 0 || Math.abs(this.environment.temperature) > 40 || Math.abs(this.environment.pressure - 50) > 40) {
            let extremeInfo = '';
            if (extremeConditionsChecks > 0) {
                const extremeDeathRate = (extremeDied / (extremeSurvived + extremeDied) * 100).toFixed(0);
                extremeInfo = ` | ☠️ ЭКСТРИМ: ${extremeDied}💀 vs ${extremeSurvived}💚 (смертность ${extremeDeathRate}%)`;
            }
            let adaptationInfo = '';
            if (Math.abs(this.environment.temperature) > 40 || Math.abs(this.environment.pressure - 50) > 40) {
                adaptationInfo = ` | 🧬 Средняя адаптация: ${avgAdaptation}%`;
            }
            console.log(`📊 ПОКОЛЕНИЕ ${this.generation}: популяция=${currentPopulation} | выживание: ${survivalChecks} проверок (${extremeConditionsChecks} экстрим) | размножение: ${reproductionAttempts} попыток → ${births} рождений | ${deaths} смертей (${ecologyDeaths} эко) | мутации: ${mutations}, убийства: ${predatorKills}${extremeInfo}${adaptationInfo} | среда: ${this.environment.temperature}°C, ${this.environment.pressure}атм`);
        }
    }

    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: применяем к конкретной сетке, чтобы не нарушать порядок обработки
    applyEcologicalSystemsToGrid(targetGrid) {
        let totalDeaths = 0;
        
        if (this.diseaseSystem.active) {
            totalDeaths += this.spreadDiseaseFixed();
        }
        
        if (this.migrationSystem.active) {
            this.processMigrationFixed();
        }
        
        if (this.symbiosisSystem.active) {
            this.processSymbiosis();
        }
        
        return totalDeaths;
    }

    // Исправленная версия spreadDisease без модификации this.grid
    spreadDiseaseFixed() {
        let deaths = 0;
        
        // Случайное заражение новых клеток (очаг болезни)
        if (Math.random() < 0.01) { // 1% шанс появления нового очага
            for (let x = 0; x < this.gridWidth; x++) {
                for (let y = 0; y < this.gridHeight; y++) {
                    if (this.grid[x][y] && this.grid[x][y].dna && Math.random() < 0.001) {
                        if (this.grid[x][y].dna.infect()) {
                            console.log(`🦠 Новый очаг болезни в (${x},${y})`);
                            break;
                        }
                    }
                }
            }
        }
        
        const infectedCells = [];
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[x][y] && this.grid[x][y].dna && this.grid[x][y].dna.isInfected()) {
                    infectedCells.push({x, y});
                }
            }
        }
        
        // Распространение инфекции
        infectedCells.forEach(cell => {
            const neighbors = this.getNeighbors(cell.x, cell.y);
            neighbors.forEach(neighbor => {
                // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка границ массива перед доступом
                if (neighbor.x >= 0 && neighbor.x < this.gridWidth && 
                    neighbor.y >= 0 && neighbor.y < this.gridHeight &&
                    this.grid[neighbor.x] && this.grid[neighbor.x][neighbor.y] && 
                    this.grid[neighbor.x][neighbor.y].dna && 
                    Math.random() < this.diseaseSystem.spreadRate) {
                    if (this.grid[neighbor.x][neighbor.y].dna.infect()) {
                        console.log(`🦠 Болезнь распространилась на клетку (${neighbor.x},${neighbor.y})`);
                    }
                }
            });
        });
        
        // Смертность от болезни
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[x][y] && this.grid[x][y].dna && 
                    this.grid[x][y].dna.isInfected() && 
                    Math.random() < this.diseaseSystem.mortalityRate) {
                    this.grid[x][y] = null;
                    console.log(`💀 Клетка (${x},${y}) умерла от болезни`);
                    deaths++;
                } else if (this.grid[x][y] && this.grid[x][y].dna) {
                    this.grid[x][y].dna.recover();
                }
            }
        }
        
        if (deaths > 0) {
            console.log(`🦠 Болезни убили ${deaths} клеток в этом поколении`);
        }
        
        return deaths;
    }

    // Исправленная версия processMigration
    processMigrationFixed() {
        const migratingCells = [];
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[x][y] && this.grid[x][y].dna && 
                    Math.random() < (this.grid[x][y].dna.migrationTendency / 100) * this.migrationSystem.strength) {
                    migratingCells.push({x, y, cell: this.grid[x][y]});
                    this.grid[x][y] = null;
                }
            }
        }
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ МИГРАЦИИ: защита от потери клеток
        migratingCells.forEach(migrant => {
            const newX = Math.max(0, Math.min(this.gridWidth - 1, 
                migrant.x + Math.floor((Math.random() - 0.5) * 6)));
            const newY = Math.max(0, Math.min(this.gridHeight - 1, 
                migrant.y + Math.floor((Math.random() - 0.5) * 6)));
            
            if (!this.grid[newX][newY]) {
                this.grid[newX][newY] = migrant.cell;
                migrant.cell.dna.achievements.add('migrant');
                console.log(`🦅 Миграция: (${migrant.x},${migrant.y}) → (${newX},${newY})`);
            } else {
                // Если место занято, поиск fallback позиции
                let placed = false;
                for (let dx = -1; dx <= 1 && !placed; dx++) {
                    for (let dy = -1; dy <= 1 && !placed; dy++) {
                        const fallbackX = Math.max(0, Math.min(this.gridWidth - 1, newX + dx));
                        const fallbackY = Math.max(0, Math.min(this.gridHeight - 1, newY + dy));
                        if (!this.grid[fallbackX][fallbackY]) {
                            this.grid[fallbackX][fallbackY] = migrant.cell;
                            migrant.cell.dna.achievements.add('migrant');
                            placed = true;
                        }
                    }
                }
                // Крайний случай: возвращаем на старое место
                if (!placed) {
                    this.grid[migrant.x][migrant.y] = migrant.cell;
                }
            }
        });
    }

    calculateSurvivalChance(dna, neighborCount) {
        let baseChance = 0;
        
        if (dna.species === 'predator') {
            // Хищники менее зависимы от соседей
            baseChance = neighborCount <= 1 ? 0.7 : neighborCount <= 3 ? 0.9 : 0.6;
        } else {
            // Классические правила Conway's Game of Life для жертв
            if (neighborCount === 2 || neighborCount === 3) {
                baseChance = 0.95; // увеличиваем с 0.8
            } else if (neighborCount === 1 || neighborCount === 4) {
                baseChance = 0.2;
            } else {
                baseChance = 0.02; // уменьшаем для более четкой разницы
            }
        }

        // Модификация на основе ДНК - увеличиваем роль генов survival/adaptation
        const normalizedSurvival = dna.survival / 100;
        const normalizedAdaptation = dna.adaptation / 100;
        
        const survivalBonus = normalizedSurvival * 0.3; // увеличиваем влияние с 0.5 до 0.3 от шкалы 0-1
        const adaptationBonus = normalizedAdaptation * 0.25; // увеличиваем влияние
        const energyPenalty = (100 - dna.energy) / 100 * 0.4; // Увеличиваем штраф за низкую энергию
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: гарантированная смерть при крайне низкой энергии
        if (dna.energy <= 5) {
            return 0.0; // Абсолютная смерть при энергии ≤ 5
        }
        // ЛОГИЧЕСКАЯ ОШИБКА ИСПРАВЛЕНА: очень низкая энергия должна резко снижать шансы
        if (dna.energy <= 15) {
            return 0.05; // 95% смерти при очень низкой энергии 6-15
        }
        const agePenalty = Math.min(dna.age / 100, 0.3);
        
        // Более сильное влияние факторов среды на выживаемость с защитой от деления на ноль
        const tempStress = Math.abs(this.environment.temperature || 0) / 50; // 0 to 1
        const pressureStress = Math.abs((this.environment.pressure || 50) - 50) / 50; // 0 to 1
        
        // ОТЛАДКА: принудительно логируем расчет стресса
        if (Math.abs(this.environment.temperature) > 40 || Math.abs(this.environment.pressure - 50) > 40) {
            if (Math.random() < 0.001) { // Уменьшаем логирование с 2% до 0.1%
                console.log(`🌡️ РАСЧЕТ СТРЕССА: темп=${this.environment.temperature}°C → стресс=${tempStress.toFixed(2)}, давл=${this.environment.pressure}атм → стресс=${pressureStress.toFixed(2)}, экстрим=${tempStress > 0.8 || pressureStress > 0.8 ? 'ДА' : 'НЕТ'}`);
            }
        }
        
        // Экстремальные условия должны быть АБСОЛЮТНО смертельными
        let envPenalty = 0;
        if (tempStress > 0.8 || pressureStress > 0.8) {
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: при экстремальных условиях штраф 98-99.5% (почти абсолютная смерть)
            envPenalty = 0.98 + Math.min(0.015, (tempStress + pressureStress) * 0.005);
            if (Math.random() < 0.01) { // Логируем реже чтобы не засорять консоль
                console.log(`☠️ СМЕРТЕЛЬНЫЙ ШТРАФ: ${(envPenalty*100).toFixed(1)}% при темп=${this.environment.temperature}°C, давл=${this.environment.pressure}атм`);
            }
        } else {
            // При умеренных условиях обычный штраф
            envPenalty = tempStress * 0.4 + pressureStress * 0.3;
        }
        
        // Адаптация снижает воздействие среды, но не полностью
        let adaptationResistance;
        if (tempStress > 0.8 || pressureStress > 0.8) {
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: при экстремальных условиях адаптация менее эффективна (максимум 50% защиты)
            adaptationResistance = (dna.adaptation / 100) * 0.5;
        } else {
            // При обычных условиях адаптация дает до 80% защиты
            adaptationResistance = (dna.adaptation / 100) * 0.8;
        }
        const finalEnvPenalty = envPenalty * (1 - adaptationResistance);
        
        let finalChance = baseChance + survivalBonus + adaptationBonus - energyPenalty - agePenalty - finalEnvPenalty;
        
        // При экстремальных условиях разрешаем полную смерть (0% шанс)
        if (tempStress > 0.8 || pressureStress > 0.8) {
            finalChance = Math.max(0.0, Math.min(0.99, finalChance)); // Минимум 0% вместо 1%
        } else {
            finalChance = Math.max(0.01, Math.min(0.99, finalChance)); // Обычный минимум 1%
        }
        
        // ПРИНУДИТЕЛЬНОЕ логирование при экстремальных условиях
        if (Math.abs(this.environment.temperature) > 40 || Math.abs(this.environment.pressure - 50) > 40) {
            if (Math.random() < 0.1) { // 10% случаев при экстриме
                console.log(`🧬 ЭКСТРИМ-ВЫЖИВАНИЕ: шанс=${(finalChance*100).toFixed(0)}% | темп=${this.environment.temperature}°C давл=${this.environment.pressure}атм | штраф среды=${(finalEnvPenalty*100).toFixed(0)}% (до адапт: ${(envPenalty*100).toFixed(0)}%) | адапт=${dna.adaptation}`);
            }
        } else if (Math.random() < 0.005) { // Уменьшаем обычное логирование
            console.log(`🧬 Выживание клетки: итоговый шанс=${(finalChance*100).toFixed(0)}% | база=${(baseChance*100).toFixed(0)}% выжив=${(survivalBonus*100).toFixed(0)}% адапт=${(adaptationBonus*100).toFixed(0)}% | штрафы: энерг=${(energyPenalty*100).toFixed(0)}% возр=${(agePenalty*100).toFixed(0)}% среда=${(finalEnvPenalty*100).toFixed(0)}% | темп=${this.environment.temperature}°C давл=${this.environment.pressure}атм`);
        }

        return finalChance;
    }

    calculateReproductionChance(neighbors) {
        if (neighbors.length === 0) return 0;
        
        const avgReproduction = neighbors.reduce((sum, cell) => sum + cell.dna.reproduction, 0) / neighbors.length;
        const avgEnergy = neighbors.reduce((sum, cell) => sum + cell.dna.energy, 0) / neighbors.length;
        
        let baseChance = neighbors.length === 3 ? 0.7 : neighbors.length === 2 ? 0.4 : 0.2;
        
        // Хищники размножаются реже
        if (neighbors.some(n => n.dna.species === 'predator')) {
            baseChance *= 0.6;
        }
        
        const reproductionBonus = avgReproduction / 100;
        const energyBonus = avgEnergy / 100 * 0.3;
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: защита от некорректных environment значений
        const tempStress = Math.abs(this.environment?.temperature || 0) / 50; // 0 to 1
        const pressureStress = Math.abs((this.environment?.pressure || 50) - 50) / 50; // 0 to 1
        
        // ЛОГИЧЕСКАЯ ОШИБКА ИСПРАВЛЕНА: экстремальные условия должны почти полностью блокировать размножение
        let environmentalFactor;
        if (tempStress > 0.8 || pressureStress > 0.8) {
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: экстремальные условия = 99% блокировка размножения
            environmentalFactor = 0.005; // только 0.5% шанс размножения при экстреме
        } else if (tempStress > 0.6 || pressureStress > 0.6) {
            // Тяжелые условия - сильное снижение
            environmentalFactor = 0.2; 
        } else {
            // Обычные условия с постепенным снижением
            environmentalFactor = Math.max(0.1, 1 - (tempStress * 0.4 + pressureStress * 0.3));
        }
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: убираем избыточное логирование (засоряет консоль)
        if ((tempStress > 0.8 || pressureStress > 0.8) && Math.random() < 0.01) {
            console.log(`🚫 Экстремальные условия блокируют размножение: темп=${this.environment.temperature}°C, давл=${this.environment.pressure}атм, шанс=${(environmentalFactor*100).toFixed(2)}%`);
        }
        
        const finalReproductionChance = baseChance * reproductionBonus * energyBonus * environmentalFactor;
        
        // При экстремальных условиях размножение может быть полностью заблокировано (0%)
        if (tempStress > 0.8 || pressureStress > 0.8) {
            return Math.max(0.0, Math.min(0.9, finalReproductionChance)); // Минимум 0%
        } else {
            return Math.max(0.01, Math.min(0.9, finalReproductionChance)); // Обычный минимум 1%
        }
    }

    createOffspringDNA(parents) {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка валидности родителей
        if (!parents || parents.length === 0) {
            console.warn('Нет родителей для создания потомства, создаем случайную ДНК');
            return new CellDNA();
        }
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: фильтруем только валидных родителей с ДНК
        const validParents = parents.filter(p => p && p.dna && typeof p.dna === 'object');
        if (validParents.length === 0) {
            console.warn('Нет валидных родителей с ДНК, создаем случайную');
            return new CellDNA();
        }
        
        // Выбираем случайных родителей из валидных
        const parent1 = validParents[Math.floor(Math.random() * validParents.length)];
        let parent2 = validParents.length > 1 ? validParents[Math.floor(Math.random() * validParents.length)] : parent1;
        
        // ЛОГИЧЕСКАЯ ОШИБКА ИСПРАВЛЕНА: избегаем инцеста при наличии выбора
        if (parent1 === parent2 && validParents.length > 1) {
            // Находим другого родителя
            const otherParents = validParents.filter(p => p !== parent1);
            if (otherParents.length > 0) {
                parent2 = otherParents[Math.floor(Math.random() * otherParents.length)];
            }
        }
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверяем валидность ДНК перед скрещиванием
        if (!parent1.dna || !parent2.dna) {
            console.error('Некорректная ДНК родителей при создании потомства');
            return new CellDNA();
        }
        
        if (parent1 === parent2) {
            return parent1.dna.clone();
        }
        
        return parent1.dna.crossover(parent2.dna);
    }

    countNeighborsClassic(x, y) {
        let count = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < this.gridWidth && ny >= 0 && ny < this.gridHeight) {
                    if (this.grid[nx][ny]) count++;
                }
            }
        }
        return count;
    }

    getNeighbors(x, y) {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: более безопасная обработка границ
        if (typeof x !== 'number' || typeof y !== 'number' || x < 0 || y < 0 || 
            x >= this.gridWidth || y >= this.gridHeight) {
            console.warn(`Некорректные координаты в getNeighbors: (${x}, ${y})`);
            return [];
        }
        
        const neighbors = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < this.gridWidth && ny >= 0 && ny < this.gridHeight) {
                    neighbors.push({x: nx, y: ny});
                }
            }
        }
        return neighbors;
    }

    getNeighborsEvolution(x, y) {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: улучшенная проверка границ и типов
        if (typeof x !== 'number' || typeof y !== 'number' || x < 0 || y < 0 || 
            x >= this.gridWidth || y >= this.gridHeight) {
            console.warn(`Некорректные координаты в getNeighborsEvolution: (${x}, ${y})`);
            return [];
        }
        
        const neighbors = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < this.gridWidth && ny >= 0 && ny < this.gridHeight) {
                    // Исправленная проверка типов для смешанных режимов
                    if (this.grid[nx][ny] && typeof this.grid[nx][ny] === 'object' && this.grid[nx][ny].dna) {
                        neighbors.push(this.grid[nx][ny]);
                    }
                }
            }
        }
        return neighbors;
    }

    reset() {
        this.stop();
        this.isPlaying = false;
        this.generation = 0;
        this.evolutionTracker = new EvolutionTracker();
        this.initializeGrid();
        this.updateStats();
        this.draw();
        this.updateCharts();
        
        document.getElementById('playPauseBtn').innerHTML = '▶ Старт';
        document.getElementById('playPauseBtn').classList.remove('playing');
    }

    randomize() {
        this.stop();
        this.isPlaying = false;
        this.generation = 0;
        this.evolutionTracker = new EvolutionTracker();
        
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (Math.random() < 0.3) {
                    if (this.evolutionMode) {
                        const species = this.predatorMode && Math.random() < 0.15 ? 'predator' : 'prey';
                        const newDNA = new CellDNA(undefined, undefined, undefined, undefined, species);
                        
                        // Хищники получают повышенную миграцию
                        if (species === 'predator') {
                            newDNA.migrationTendency = 70 + Math.random() * 30; // 70-100
                        }
                        
                        this.grid[x][y] = {
                            dna: newDNA
                        };
                    } else {
                        this.grid[x][y] = true;
                    }
                } else {
                    this.grid[x][y] = null;
                }
            }
        }
        
        this.updateStats();
        this.draw();
        this.updateCharts();
        
        document.getElementById('playPauseBtn').innerHTML = '▶ Старт';
        document.getElementById('playPauseBtn').classList.remove('playing');
    }

    clear() {
        this.stop();
        this.isPlaying = false;
        this.generation = 0;
        this.evolutionTracker = new EvolutionTracker();
        this.initializeGrid();
        this.updateStats();
        this.draw();
        this.updateCharts();
        
        document.getElementById('playPauseBtn').innerHTML = '▶ Старт';
        document.getElementById('playPauseBtn').classList.remove('playing');
    }

    updateStats() {
        try {
            console.log('updateStats вызвана');
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: безопасное обновление generation с проверкой
            const generationElement = document.getElementById('generation');
            if (generationElement) {
                generationElement.textContent = this.generation;
            } else {
                console.warn('Элемент generation не найден для обновления статистики');
            }
            
            let aliveCells = 0, predators = 0, prey = 0;
            let totalFitness = 0;
        
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[x][y]) {
                    aliveCells++;
                    if (this.evolutionMode && this.grid[x][y].dna) {
                        totalFitness += this.grid[x][y].dna.fitness;
                        if (this.grid[x][y].dna.species === 'predator') {
                            predators++;
                        } else {
                            prey++;
                        }
                    }
                }
            }
        }
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: защита от null DOM элементов
        const aliveCellsElement = document.getElementById('aliveCells');
        if (aliveCellsElement) {
            aliveCellsElement.textContent = aliveCells;
        }
        
        if (this.evolutionMode && aliveCells > 0) {
            const avgFitness = totalFitness / aliveCells;
            const avgFitnessElement = document.getElementById('avgFitness');
            if (avgFitnessElement) {
                avgFitnessElement.textContent = (avgFitness * 100).toFixed(1) + '%';
            }
            
            const diversity = this.evolutionTracker.calculateDiversity(
                this.grid.flat().filter(cell => cell && typeof cell === 'object' && cell.dna)
            );
            const diversityElement = document.getElementById('diversity');
            if (diversityElement) {
                diversityElement.textContent = diversity.toFixed(1);
            }
        }
        
        if (this.predatorMode) {
            const predatorCountElement = document.getElementById('predatorCount');
            const preyCountElement = document.getElementById('preyCount');
            if (predatorCountElement) predatorCountElement.textContent = predators;
            if (preyCountElement) preyCountElement.textContent = prey;
        }
        
        // Обновляем новые элементы
        if (this.evolutionMode) {
            this.updateAchievementDisplay();
        }
        console.log('updateStats завершена');
        } catch (error) {
            console.error('КРИТИЧЕСКАЯ ОШИБКА в updateStats():', error);
            throw error;
        }
    }
    
    // Метод для получения статистик (используется ИИ-помощником и системой достижений)
    calculateStats() {
        let aliveCells = 0, predators = 0, prey = 0;
        let totalFitness = 0;
        
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[x][y]) {
                    aliveCells++;
                    if (this.evolutionMode && this.grid[x][y].dna) {
                        totalFitness += this.grid[x][y].dna.fitness;
                        if (this.grid[x][y].dna.species === 'predator') {
                            predators++;
                        } else {
                            prey++;
                        }
                    }
                }
            }
        }
        
        return {
            population: aliveCells,
            predators: predators,
            prey: prey,
            averageFitness: aliveCells > 0 ? totalFitness / aliveCells : 0,
            generation: this.generation
        };
    }

    draw() {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка существования контекста перед рендерингом
        if (!this.ctx || !this.canvas) {
            console.error('Canvas или контекст недоступен для рендеринга!');
            return;
        }
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: защита от некорректных размеров canvas
        if (this.canvas.width <= 0 || this.canvas.height <= 0) {
            console.warn('Некорректные размеры canvas для рендеринга');
            return;
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем фон среды
        this.drawEnvironmentBackground();
        
        // ОПТИМИЗАЦИЯ: рисуем сетку только если размер клетки достаточно большой
        if (this.cellSize > 4) {
            this.ctx.strokeStyle = this.isDarkTheme ? '#555' : '#e0e0e0';
            this.ctx.lineWidth = 0.5;
            
            // ОПТИМИЗАЦИЯ: батчим операции рисования сетки
            this.ctx.beginPath();
            for (let x = 0; x <= this.gridWidth; x++) {
                this.ctx.moveTo(x * this.cellSize + 0.5, 0);
                this.ctx.lineTo(x * this.cellSize + 0.5, this.gridHeight * this.cellSize);
            }
            for (let y = 0; y <= this.gridHeight; y++) {
                this.ctx.moveTo(0, y * this.cellSize + 0.5);
                this.ctx.lineTo(this.gridWidth * this.cellSize, y * this.cellSize + 0.5);
            }
            this.ctx.stroke();
        }

        // Рисуем живые клетки
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[x][y]) {
                    if (this.evolutionMode && this.grid[x][y].dna) {
                        this.ctx.fillStyle = this.grid[x][y].dna.getColor();
                        
                        // Особая визуализация для хищников
                        if (this.grid[x][y].dna.species === 'predator') {
                            this.ctx.fillRect(
                                x * this.cellSize + 2,
                                y * this.cellSize + 2,
                                this.cellSize - 4,
                                this.cellSize - 4
                            );
                            
                            // Рамка для хищника
                            this.ctx.strokeStyle = '#ff4444';
                            this.ctx.lineWidth = 1;
                            this.ctx.strokeRect(
                                x * this.cellSize + 1,
                                y * this.cellSize + 1,
                                this.cellSize - 2,
                                this.cellSize - 2
                            );
                        } else {
                            this.ctx.fillRect(
                                x * this.cellSize + 1,
                                y * this.cellSize + 1,
                                this.cellSize - 2,
                                this.cellSize - 2
                            );
                        }
                        
                        // Индикатор энергии
                        if (this.grid[x][y].dna.energy < 50) {
                            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                            this.ctx.fillRect(
                                x * this.cellSize + this.cellSize - 3,
                                y * this.cellSize + 1,
                                2,
                                Math.floor((1 - this.grid[x][y].dna.energy / 100) * (this.cellSize - 2))
                            );
                        }
                    } else {
                        this.ctx.fillStyle = '#007bff';
                        this.ctx.fillRect(
                            x * this.cellSize + 1,
                            y * this.cellSize + 1,
                            this.cellSize - 2,
                            this.cellSize - 2
                        );
                    }
                }
            }
        }

        // Подсвечиваем наведенную клетку
        if (this.hoveredCell && 
            this.hoveredCell.x >= 0 && this.hoveredCell.x < this.gridWidth &&
            this.hoveredCell.y >= 0 && this.hoveredCell.y < this.gridHeight) {
            
            this.ctx.strokeStyle = '#ff6b6b';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                this.hoveredCell.x * this.cellSize + 1,
                this.hoveredCell.y * this.cellSize + 1,
                this.cellSize - 2,
                this.cellSize - 2
            );
        }
    }

    drawEnvironmentBackground() {
        if (!this.evolutionMode) return;
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка существования environment
        if (!this.environment || typeof this.environment.temperature === 'undefined' || 
            typeof this.environment.pressure === 'undefined') {
            console.warn('Environment данные недоступны для рендеринга фона');
            return;
        }
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: защита от деления на ноль и валидация диапазонов
        const tempFactor = Math.max(-1, Math.min(1, this.environment.temperature / 50)); // строго -1 to 1
        const pressureFactor = Math.max(-1, Math.min(1, (this.environment.pressure - 50) / 50)); // строго -1 to 1
        
        // Цветовой оверлей для температуры
        if (Math.abs(tempFactor) > 0.1) {
            this.ctx.save();
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: ограничиваем альфу для предотвращения мерцания
            this.ctx.globalAlpha = Math.max(0.05, Math.min(0.2, Math.abs(tempFactor) * 0.15));
            this.ctx.fillStyle = tempFactor > 0 ? '#ff4444' : '#4444ff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
        
        // Визуальная индикация давления через границы экрана
        if (Math.abs(pressureFactor) > 0.2) {
            this.ctx.save();
            this.ctx.globalAlpha = Math.abs(pressureFactor) * 0.3;
            this.ctx.strokeStyle = pressureFactor > 0 ? '#ffaa00' : '#00aaff';
            this.ctx.lineWidth = Math.abs(pressureFactor) * 8;
            this.ctx.strokeRect(2, 2, this.canvas.width - 4, this.canvas.height - 4);
            this.ctx.restore();
        }
    }

    initializeCharts() {
        try {
            console.log('Инициализируем графики...');
            const populationChart = document.getElementById('populationChart');
            const fitnessChart = document.getElementById('fitnessChart');
            const diversityChart = document.getElementById('diversityChart');
            const genesChart = document.getElementById('genesChart');
            const predatorPreyChart = document.getElementById('predatorPreyChart');
            const environmentChart = document.getElementById('environmentChart');

            if (populationChart) this.charts.population = populationChart.getContext('2d');
            if (fitnessChart) this.charts.fitness = fitnessChart.getContext('2d');
            if (diversityChart) this.charts.diversity = diversityChart.getContext('2d');
            if (genesChart) this.charts.genes = genesChart.getContext('2d');
            if (predatorPreyChart) this.charts.predatorPrey = predatorPreyChart.getContext('2d');
            if (environmentChart) this.charts.environment = environmentChart.getContext('2d');
            
            console.log('Графики инициализированы');
        } catch (error) {
            console.error('Ошибка инициализации графиков:', error);
        }
    }

    updateCharts() {
        if (!this.evolutionMode) return;
        
        try {
            this.drawPopulationChart();
            this.drawFitnessChart();
            this.drawDiversityChart();
            this.drawGenesChart();
            this.drawEnvironmentChart();
            
            if (this.predatorMode) {
                this.drawPredatorPreyChart();
            }
        } catch (error) {
            console.error('Ошибка обновления графиков:', error);
        }
    }

    drawPopulationChart() {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: защита от некорректных данных графика
        const ctx = this.charts.population;
        if (!ctx) {
            console.warn('График популяции недоступен для отрисовки');
            return;
        }
        
        const canvas = ctx.canvas;
        if (!canvas || canvas.width <= 0 || canvas.height <= 0) {
            console.warn('Canvas графика популяции имеет некорректные размеры');
            return;
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверка данных эволюции
        if (!this.evolutionTracker || !this.evolutionTracker.populationHistory) {
            console.warn('Данные популяции недоступны для графика');
            return;
        }
        
        const data = this.evolutionTracker.populationHistory;
        if (!data || data.length < 2) return;

        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: защита от некорректных данных
        const validData = data.filter(d => d && typeof d.count === 'number' && !isNaN(d.count) && isFinite(d.count));
        if (validData.length < 2) {
            console.warn('Недостаточно валидных данных популяции для графика');
            return;
        }

        const maxPop = Math.max(...validData.map(d => d.count));
        if (maxPop === 0 || !isFinite(maxPop)) return;
        
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        validData.forEach((point, index) => {
            const x = (index / Math.max(validData.length - 1, 1)) * canvas.width;
            const y = canvas.height - (point.count / maxPop) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Подписи
        ctx.fillStyle = this.isDarkTheme ? '#e0e0e0' : '#666';
        ctx.font = '10px Arial';
        ctx.fillText(`Max: ${maxPop}`, 5, 15);
        ctx.fillText(`Current: ${data[data.length - 1]?.count || 0}`, 5, canvas.height - 5);
    }

    drawFitnessChart() {
        const ctx = this.charts.fitness;
        if (!ctx) return;
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const data = this.evolutionTracker.fitnessHistory;
        if (data.length < 2) return;

        const maxFitness = Math.max(...data.map(d => Math.max(d.avgFitness, d.maxFitness)));
        if (maxFitness === 0) return;
        
        // Средняя приспособленность
        ctx.strokeStyle = '#28a745';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * canvas.width;
            const y = canvas.height - (point.avgFitness / maxFitness) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Максимальная приспособленность
        ctx.strokeStyle = '#dc3545';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * canvas.width;
            const y = canvas.height - (point.maxFitness / maxFitness) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Легенда
        ctx.fillStyle = '#28a745';
        ctx.font = '10px Arial';
        ctx.fillText('Средняя', 5, 15);
        ctx.fillStyle = '#dc3545';
        ctx.fillText('Макс', 5, 25);
    }

    drawDiversityChart() {
        const ctx = this.charts.diversity;
        if (!ctx) return;
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const data = this.evolutionTracker.diversityHistory;
        if (data.length < 2) return;

        const maxDiv = Math.max(...data.map(d => d.diversity));
        if (maxDiv === 0) return;
        
        ctx.strokeStyle = '#6f42c1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * canvas.width;
            const y = canvas.height - (point.diversity / maxDiv) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        ctx.fillStyle = this.isDarkTheme ? '#e0e0e0' : '#666';
        ctx.font = '10px Arial';
        ctx.fillText(`Max: ${maxDiv.toFixed(1)}`, 5, 15);
    }

    drawGenesChart() {
        const ctx = this.charts.genes;
        if (!ctx) return;
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const data = this.evolutionTracker.geneDistribution;
        if (data.length < 2) return;

        const colors = ['#28a745', '#007bff', '#ffc107', '#dc3545'];
        const traits = ['survival', 'reproduction', 'adaptation', 'resistance'];
        
        traits.forEach((trait, traitIndex) => {
            ctx.strokeStyle = colors[traitIndex];
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            data.forEach((point, index) => {
                const x = (index / Math.max(data.length - 1, 1)) * canvas.width;
                const y = canvas.height - (point[trait] / 100) * canvas.height;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        });
        
        // Легенда
        const labels = ['🟢 Выж', '🔵 Репр', '🟡 Адап', '🔴 Уст'];
        labels.forEach((label, index) => {
            ctx.fillStyle = colors[index];
            ctx.font = '10px Arial';
            ctx.fillText(label, 5 + index * 45, 15);
        });
    }

    drawPredatorPreyChart() {
        if (!this.charts.predatorPrey) return;
        
        const ctx = this.charts.predatorPrey;
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const data = this.evolutionTracker.predatorPreyHistory;
        if (data.length < 2) return;

        const maxCount = Math.max(...data.map(d => Math.max(d.predators, d.prey)));
        if (maxCount === 0) return;
        
        // Хищники
        ctx.strokeStyle = '#dc3545';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * canvas.width;
            const y = canvas.height - (point.predators / maxCount) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Жертвы
        ctx.strokeStyle = '#28a745';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * canvas.width;
            const y = canvas.height - (point.prey / maxCount) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Легенда
        ctx.fillStyle = '#dc3545';
        ctx.font = '10px Arial';
        ctx.fillText('🦎 Хищники', 5, 15);
        ctx.fillStyle = '#28a745';
        ctx.fillText('🐛 Жертвы', 5, 25);
    }

    drawEnvironmentChart() {
        const ctx = this.charts.environment;
        if (!ctx) return;
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const data = this.evolutionTracker.environmentHistory;
        if (data.length < 2) return;

        // Температура
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * canvas.width;
            const y = canvas.height/2 - (point.temperature / 50) * (canvas.height/2);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Давление
        ctx.strokeStyle = '#6b6bff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * canvas.width;
            const y = canvas.height - (point.pressure / 100) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Центральная линия
        ctx.strokeStyle = this.isDarkTheme ? '#555' : '#ddd';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(0, canvas.height/2);
        ctx.lineTo(canvas.width, canvas.height/2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Легенда
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '10px Arial';
        ctx.fillText('🌡️ Температура', 5, 15);
        ctx.fillStyle = '#6b6bff';
        ctx.fillText('💨 Давление', 5, 25);
    }

    addPattern(patternName) {
        this.clear();
        
        const centerX = Math.floor(this.gridWidth / 2);
        const centerY = Math.floor(this.gridHeight / 2);
        
        const patterns = {
            glider: [
                [0, 1], [1, 2], [2, 0], [2, 1], [2, 2]
            ],
            pulsar: [
                [-6, -4], [-6, -3], [-6, -2], [-6, 2], [-6, 3], [-6, 4],
                [-4, -6], [-4, -1], [-4, 1], [-4, 6],
                [-3, -6], [-3, -1], [-3, 1], [-3, 6],
                [-2, -6], [-2, -1], [-2, 1], [-2, 6],
                [-1, -4], [-1, -3], [-1, -2], [-1, 2], [-1, 3], [-1, 4],
                [1, -4], [1, -3], [1, -2], [1, 2], [1, 3], [1, 4],
                [2, -6], [2, -1], [2, 1], [2, 6],
                [3, -6], [3, -1], [3, 1], [3, 6],
                [4, -6], [4, -1], [4, 1], [4, 6],
                [6, -4], [6, -3], [6, -2], [6, 2], [6, 3], [6, 4]
            ],
            beacon: [
                [0, 0], [0, 1], [1, 0], [1, 1],
                [2, 2], [2, 3], [3, 2], [3, 3]
            ],
            toad: [
                [1, 0], [2, 0], [3, 0],
                [0, 1], [1, 1], [2, 1]
            ],
            gosper: [
                [-17, 0], [-16, 0], [-16, 1], [-15, -1], [-15, 1], [-14, -2], [-14, 2],
                [-13, -2], [-13, 2], [-12, -1], [-11, 0], [-10, 0], [-9, 0],
                [-7, -1], [-7, -2], [-7, -3], [-6, -1], [-6, -2], [-6, -3],
                [-5, -4], [-5, 0], [-3, -5], [-3, -4], [-3, 0], [-3, 1],
                [7, -2], [7, -3], [8, -2], [8, -3], [17, -4], [17, -3],
                [18, -4], [18, -3], [19, -2], [21, -5], [21, -4], [21, -2], [21, -1],
                [31, -3], [31, -4], [32, -3], [32, -4]
            ],
            ecosystem: this.generateEcosystemPattern(),
            competition: this.generateCompetitionPattern()
        };
        
        if (patterns[patternName]) {
            patterns[patternName].forEach(([dx, dy, species]) => {
                const x = centerX + dx;
                const y = centerY + dy;
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    if (this.evolutionMode) {
                        const cellSpecies = species || (this.predatorMode && Math.random() < 0.2 ? 'predator' : 'prey');
                        this.grid[x][y] = {
                            dna: new CellDNA(undefined, undefined, undefined, undefined, cellSpecies)
                        };
                    } else {
                        this.grid[x][y] = true;
                    }
                }
            });
            this.updateStats();
            this.draw();
            this.updateCharts();
        }
    }

    generateEcosystemPattern() {
        const pattern = [];
        
        // Создаем разнообразную экосистему
        for (let i = 0; i < 30; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 20;
            const species = Math.random() < 0.15 ? 'predator' : 'prey';
            pattern.push([Math.floor(x), Math.floor(y), species]);
        }
        
        return pattern;
    }

    generateCompetitionPattern() {
        const pattern = [];
        
        // Две конкурирующие популяции
        for (let i = -5; i <= 5; i++) {
            for (let j = -2; j <= 2; j++) {
                if (Math.random() < 0.7) {
                    pattern.push([i - 8, j, 'prey']);
                    pattern.push([i + 8, j, 'prey']);
                }
            }
        }
        
        // Несколько хищников посередине
        pattern.push([0, 0, 'predator']);
        pattern.push([1, 0, 'predator']);
        pattern.push([0, 1, 'predator']);
        
        return pattern;
    }
    
    // Проверка достижений
    checkAchievements() {
        const stats = this.calculateStats();
        
        if (stats.population >= 100 && !this.achievementSystem.achievements.population_100.unlocked) {
            this.achievementSystem.unlock('population_100');
        }
        
        if (this.generation >= 10 && !this.achievementSystem.achievements.generation_10.unlocked) {
            this.achievementSystem.unlock('generation_10');
        }
        
        const perfectCells = this.getAllCells().filter(cell => cell.dna.fitness >= 0.99);
        if (perfectCells.length > 0 && !this.achievementSystem.achievements.perfect_dna.unlocked) {
            this.achievementSystem.unlock('perfect_dna');
        }
        
        if (stats.predators > 0 && stats.prey > 0 && !this.achievementSystem.achievements.symbiosis_master.unlocked) {
            this.achievementSystem.unlock('symbiosis_master');
        }
    }
    
    
    // Получение всех клеток
    getAllCells() {
        const cells = [];
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                // Исправление типов: проверяем что клетка - объект, а не boolean
                if (this.grid[x][y] && typeof this.grid[x][y] === 'object' && this.grid[x][y].dna) {
                    cells.push(this.grid[x][y]);
                }
            }
        }
        return cells;
    }
    
    // Обновление тепловой карты
    updateHeatmap() {
        const data = [];
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const cell = this.grid[x][y];
                if (cell && cell.dna) {
                    data.push({
                        x: x,
                        y: y,
                        value: cell.dna.fitness,
                        species: cell.dna.species,
                        generation: cell.dna.generation
                    });
                }
            }
        }
        this.heatmapData = data;
    }
    
    // Расчет научных метрик
    calculateScientificMetrics() {
        const cells = this.getAllCells();
        if (cells.length === 0) {
            this.scientificMetrics = { shannonDiversity: 0, simpsonIndex: 0, evenness: 0, speciesRichness: 0 };
            return;
        }
        
        // Расчет разнообразия Шеннона
        const species = {};
        cells.forEach(cell => {
            const key = cell.dna.species;
            species[key] = (species[key] || 0) + 1;
        });
        
        const total = cells.length;
        let shannon = 0;
        let simpson = 0;
        
        Object.values(species).forEach(count => {
            const p = count / total;
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: защита от Math.log2(0) = -Infinity
            if (p > 0) {
                shannon -= p * Math.log2(p);
            }
            simpson += p * p;
        });
        
        this.scientificMetrics = {
            shannonDiversity: shannon,
            simpsonIndex: 1 - simpson,
            evenness: Object.keys(species).length > 1 ? shannon / Math.log2(Object.keys(species).length) : 1,
            speciesRichness: Object.keys(species).length
        };
    }
    
    // Экспорт в биоинформатические форматы
    exportToBioinformatics() {
        const cells = this.getAllCells();
        
        // FASTA формат для генетических последовательностей
        let fastaContent = '';
        cells.forEach((cell, index) => {
            const sequence = this.dnaToSequence(cell.dna);
            fastaContent += `>Cell_${index}_Gen${cell.dna.generation}_Fit${cell.dna.fitness.toFixed(3)}\n`;
            fastaContent += `${sequence}\n`;
        });
        
        // Phylip формат для филогенетического анализа
        let phylipContent = `${cells.length} 100\n`;
        cells.forEach((cell, index) => {
            const name = `Cell${index}`.padEnd(10);
            const sequence = this.dnaToSequence(cell.dna);
            phylipContent += `${name} ${sequence}\n`;
        });
        
        return { fasta: fastaContent, phylip: phylipContent };
    }
    
    // Преобразование ДНК в последовательность
    dnaToSequence(dna) {
        const nucleotides = 'ATCG';
        let sequence = '';
        
        [dna.survival, dna.reproduction, dna.adaptation, dna.resistance].forEach(trait => {
            const normalized = Math.floor(trait * 25); // 0-100 -> 0-25 нуклеотидов
            for (let i = 0; i < 25; i++) {
                const index = Math.floor((trait + i * 4) % 4);
                sequence += nucleotides[index];
            }
        });
        
        return sequence;
    }
    
    // Отображение уведомления
    showNotification(message, type = 'info') {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: ограничиваем количество уведомлений
        const existingNotifications = document.querySelectorAll('.notification');
        if (existingNotifications.length >= 5) {
            // Удаляем старые уведомления
            existingNotifications[0].remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: ${20 + existingNotifications.length * 70}px;
            right: 20px;
            background: rgba(0, 123, 255, 0.95);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        if (type === 'achievement') {
            notification.style.background = 'rgba(255, 193, 7, 0.95)';
            notification.style.color = '#212529';
        } else if (type === 'warning') {
            notification.style.background = 'rgba(220, 53, 69, 0.95)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
    
    // Многопользовательские функции
    enableMultiplayer() {
        this.showNotification('Многопользовательский режим активирован', 'info');
        // Здесь можно добавить WebSocket подключение
    }
    
    
    // 3D визуализация (базовая)
    create3DVisualization() {
        // Мок-реализация 3D визуализации
        const canvas3D = document.createElement('canvas');
        canvas3D.width = 400;
        canvas3D.height = 300;
        canvas3D.style.border = '1px solid #ccc';
        
        const ctx3D = canvas3D.getContext('2d');
        ctx3D.fillStyle = '#000';
        ctx3D.fillRect(0, 0, 400, 300);
        
        // Псевдо-3D проекция эволюции
        const cells = this.getAllCells();
        cells.forEach((cell, index) => {
            const x = (index % 20) * 20;
            const y = Math.floor(index / 20) * 15;
            const z = cell.dna.generation;
            
            // Простое проецирование
            const projX = x + z * 0.5;
            const projY = y + z * 0.3;
            
            ctx3D.fillStyle = cell.dna.getColor();
            ctx3D.fillRect(projX, projY, 4, 4);
        });
        
        return canvas3D;
    }
    
    
    
    // Обновление отображения достижений
    updateAchievementDisplay() {
        try {
            console.log('updateAchievementDisplay вызвана');
            const progress = this.achievementSystem.getProgress();
            document.getElementById('achievementCount').textContent = `${progress.unlocked}/${progress.total}`;
        
        // Показываем последние 3 достижения
        const unlockedAchievements = Object.keys(this.achievementSystem.achievements)
            .filter(key => this.achievementSystem.achievements[key].unlocked)
            .slice(-3)
            .map(key => this.achievementSystem.achievements[key].name);
            
        const recentAchievementsElement = document.getElementById('recentAchievements');
        if (recentAchievementsElement) {
            if (unlockedAchievements.length > 0) {
                recentAchievementsElement.innerHTML = 
                    unlockedAchievements.map(name => `• ${name}`).join('<br>');
            } else {
                recentAchievementsElement.textContent = 'Никаких достижений пока нет';
            }
        }
        console.log('updateAchievementDisplay завершена');
        } catch (error) {
            console.error('ОШИБКА в updateAchievementDisplay():', error);
            // Не выбрасываем ошибку, чтобы не ломать остальное
        }
    }
    
    // Синхронизация состояния UI с переменными
    syncUIState() {
        try {
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: безопасное обновление чекбоксов с проверкой существования
            const safeUpdateCheckbox = (id, value) => {
                const element = document.getElementById(id);
                if (element) {
                    element.checked = value;
                } else {
                    console.warn(`UI элемент ${id} не найден для синхронизации`);
                }
            };
            
            // Синхронизируем чекбоксы с переменными
            safeUpdateCheckbox('evolutionMode', this.evolutionMode);
            safeUpdateCheckbox('predatorMode', this.predatorMode);
            
            // Синхронизируем новые чекбоксы с проверкой существования систем
            if (this.diseaseSystem) {
                safeUpdateCheckbox('diseaseMode', this.diseaseSystem.active);
            }
            if (this.migrationSystem) {
                safeUpdateCheckbox('migrationMode', this.migrationSystem.active);
            }
            if (this.symbiosisSystem) {
                safeUpdateCheckbox('symbiosisMode', this.symbiosisSystem.active);
            }
            if (this.soundSystem) {
                safeUpdateCheckbox('soundEffects', this.soundSystem.enabled);
            }
            
            // Обновляем UI в соответствии с текущим состоянием
            this.toggleEvolutionUI();
            this.togglePredatorUI();
        } catch (error) {
            console.error('Ошибка синхронизации UI состояния:', error);
        }
    }
    
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Инициализация GameOfLife...');
        window.game = new GameOfLife();
        console.log('Игра успешно создана');
        
        // Автосохранение отключено
        // setTimeout(() => {
        //     try {
        //         window.game.loadAutoSave();
        //     } catch (e) {
        //         console.warn('Ошибка при загрузке автосохранения:', e);
        //     }
        // }, 1000);
    } catch (error) {
        console.error('Ошибка инициализации игры:', error);
        alert('Ошибка загрузки игры. Проверьте консоль для подробностей.');
    }
});

// Текущее время: Sun Aug 24 07:50:36 +04 2025
