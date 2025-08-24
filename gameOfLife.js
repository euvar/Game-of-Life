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
    }

    birth() { this.playSound(440, 0.1); }
    death() { this.playSound(220, 0.2); }
    mutation() { this.playSound(660, 0.15, 'sawtooth'); }
    predatorKill() { this.playSound(880, 0.3, 'square'); }
}

// Класс для ДНК клетки
class CellDNA {
    constructor(survival = null, reproduction = null, adaptation = null, resistance = null, species = 'prey') {
        this.survival = survival || Math.random() * 100;
        this.reproduction = reproduction || Math.random() * 100;
        this.adaptation = adaptation || Math.random() * 100;
        this.resistance = resistance || Math.random() * 100;
        this.species = species; // 'prey' или 'predator'
        this.age = 0;
        this.generation = 0;
        this.energy = 100;
        this.fitness = this.calculateFitness();
        this.id = Math.random().toString(36).substr(2, 9);
        
        // Новые генетические свойства
        this.geneticMemory = []; // память о успешных стратегиях
        this.migrationTendency = Math.random() * 100; // склонность к миграции
        this.immuneSystem = Math.random() * 100; // сопротивляемость болезням
        this.symbiosisCapacity = Math.random() * 100; // способность к симбиозу
        this.lifespan = 50 + Math.random() * 100; // продолжительность жизни
        this.achievements = new Set(); // достижения клетки
        this.diseaseResistance = Math.random() * 100; // сопротивляемость заболеваниям
    }

    calculateFitness() {
        if (this.species === 'predator') {
            return (this.survival * 0.5 + this.reproduction * 0.3 + this.adaptation * 0.2) / 100;
        }
        return (this.survival * 0.4 + this.reproduction * 0.3 + this.adaptation * 0.2 + this.resistance * 0.1) / 100;
    }

    mutate(mutationRate, environment = {}) {
        const envFactor = this.getEnvironmentFactor(environment);
        const actualMutationRate = mutationRate * envFactor;
        const shouldMutate = Math.random() < (actualMutationRate / 100) * (1 - this.resistance / 100);
        
        if (shouldMutate) {
            const trait = Math.floor(Math.random() * 4);
            const change = (Math.random() - 0.5) * 30;
            
            switch(trait) {
                case 0:
                    this.survival = Math.max(0, Math.min(100, this.survival + change));
                    break;
                case 1:
                    this.reproduction = Math.max(0, Math.min(100, this.reproduction + change));
                    break;
                case 2:
                    this.adaptation = Math.max(0, Math.min(100, this.adaptation + change));
                    break;
                case 3:
                    this.resistance = Math.max(0, Math.min(100, this.resistance + change));
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
        const newDNA = new CellDNA(
            (this.survival + otherDNA.survival) / 2 + (Math.random() - 0.5) * 15,
            (this.reproduction + otherDNA.reproduction) / 2 + (Math.random() - 0.5) * 15,
            (this.adaptation + otherDNA.adaptation) / 2 + (Math.random() - 0.5) * 15,
            (this.resistance + otherDNA.resistance) / 2 + (Math.random() - 0.5) * 15,
            this.species
        );
        
        newDNA.survival = Math.max(0, Math.min(100, newDNA.survival));
        newDNA.reproduction = Math.max(0, Math.min(100, newDNA.reproduction));
        newDNA.adaptation = Math.max(0, Math.min(100, newDNA.adaptation));
        newDNA.resistance = Math.max(0, Math.min(100, newDNA.resistance));
        newDNA.generation = Math.max(this.generation, otherDNA.generation) + 1;
        newDNA.fitness = newDNA.calculateFitness();
        
        // Наследование генетической памяти
        newDNA.geneticMemory = [...this.geneticMemory, ...otherDNA.geneticMemory].slice(-5);
        newDNA.migrationTendency = (this.migrationTendency + otherDNA.migrationTendency) / 2 + (Math.random() - 0.5) * 10;
        newDNA.immuneSystem = (this.immuneSystem + otherDNA.immuneSystem) / 2 + (Math.random() - 0.5) * 10;
        newDNA.symbiosisCapacity = (this.symbiosisCapacity + otherDNA.symbiosisCapacity) / 2 + (Math.random() - 0.5) * 10;
        
        return newDNA;
    }

    clone() {
        const newDNA = new CellDNA(this.survival, this.reproduction, this.adaptation, this.resistance, this.species);
        newDNA.age = 0;
        newDNA.generation = this.generation + 1;
        newDNA.geneticMemory = [...this.geneticMemory];
        newDNA.migrationTendency = this.migrationTendency;
        newDNA.immuneSystem = this.immuneSystem;
        newDNA.symbiosisCapacity = this.symbiosisCapacity;
        return newDNA;
    }
    
    // Сохранение успешной стратегии в генетической памяти
    rememberStrategy(strategy) {
        this.geneticMemory.push({
            strategy: strategy,
            fitness: this.fitness,
            generation: this.generation,
            timestamp: Date.now()
        });
        if (this.geneticMemory.length > 5) {
            this.geneticMemory.shift();
        }
    }
    
    // Применение генетической памяти для принятия решений
    applyGeneticMemory(situation) {
        const relevantMemories = this.geneticMemory.filter(memory => 
            memory.strategy.includes(situation)
        );
        if (relevantMemories.length > 0) {
            const bestMemory = relevantMemories.reduce((best, current) => 
                current.fitness > best.fitness ? current : best
            );
            return bestMemory.strategy;
        }
        return null;
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
            const intensity = Math.floor(this.symbiosisCapacity * 2.55);
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
        if (Math.random() > this.diseaseResistance / 100) {
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
            notification.remove();
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
        this.maxHistoryLength = 200;
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
        if (cells.length < 2) return 0;
        
        let totalDistance = 0;
        let comparisons = 0;
        
        for (let i = 0; i < cells.length; i++) {
            for (let j = i + 1; j < cells.length; j++) {
                const cell1 = cells[i].dna;
                const cell2 = cells[j].dna;
                
                const distance = Math.sqrt(
                    Math.pow(cell1.survival - cell2.survival, 2) +
                    Math.pow(cell1.reproduction - cell2.reproduction, 2) +
                    Math.pow(cell1.adaptation - cell2.adaptation, 2) +
                    Math.pow(cell1.resistance - cell2.resistance, 2)
                );
                
                totalDistance += distance;
                comparisons++;
            }
        }
        
        return comparisons > 0 ? totalDistance / comparisons : 0;
    }
}

class GameOfLife {
    constructor() {
        this.canvas = document.getElementById('gameGrid');
        this.ctx = this.canvas.getContext('2d');
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
                if (this.grid[x][y] && this.grid[x][y].dna) {
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
                if (this.grid[neighbor.x] && this.grid[neighbor.x][neighbor.y] && 
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
    
    // Система миграции
    processMigration() {
        if (!this.migrationSystem.active) return;
        
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
        
        // Перемещение клеток
        migratingCells.forEach(migrant => {
            const newX = Math.max(0, Math.min(this.gridWidth - 1, 
                migrant.x + Math.floor((Math.random() - 0.5) * 6)));
            const newY = Math.max(0, Math.min(this.gridHeight - 1, 
                migrant.y + Math.floor((Math.random() - 0.5) * 6)));
            
            if (!this.grid[newX][newY]) {
                this.grid[newX][newY] = migrant.cell;
                migrant.cell.dna.achievements.add('migrant');
                console.log(`🦅 Клетка мигрировала с (${migrant.x},${migrant.y}) на (${newX},${newY})`);
            }
        });
    }
    
    // Система симбиоза
    processSymbiosis() {
        if (!this.symbiosisSystem.active) return;
        
        try {
            console.log('Обрабатываем симбиоз...');
            for (let x = 0; x < this.gridWidth; x++) {
                for (let y = 0; y < this.gridHeight; y++) {
                    if (this.grid[x][y] && this.grid[x][y].dna) {
                        const neighbors = this.getNeighbors(x, y);
                        const symbioticNeighbors = neighbors.filter(n => 
                            this.grid[n.x] && this.grid[n.x][n.y] && 
                            this.grid[n.x][n.y].dna && 
                            this.grid[n.x][n.y].dna.species === 'symbiotic'
                        );
                        
                        if (symbioticNeighbors.length > 0) {
                            console.log(`Симбиоз: клетка ${x},${y} получает энергию от ${symbioticNeighbors.length} соседей`);
                            this.grid[x][y].dna.energy += this.symbiosisSystem.benefit * symbioticNeighbors.length;
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
        setTimeout(() => document.body.removeChild(notification), 3000);
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
        const padding = 2;
        this.canvas.width = this.gridWidth * this.cellSize + padding;
        this.canvas.height = this.gridHeight * this.cellSize + padding;
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
        // Основные кнопки управления
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('resetBtn').addEventListener('click', () => {
            try {
                console.log('Кнопка Сброс нажата');
                this.reset();
            } catch (error) {
                console.error('Ошибка при выполнении reset():', error);
            }
        });
        document.getElementById('randomBtn').addEventListener('click', () => {
            try {
                console.log('Кнопка Случайно нажата');
                this.randomize();
            } catch (error) {
                console.error('Ошибка при выполнении randomize():', error);
            }
        });
        document.getElementById('clearBtn').addEventListener('click', () => {
            try {
                console.log('Кнопка Очистить нажата');
                this.clear();
            } catch (error) {
                console.error('Ошибка при выполнении clear():', error);
            }
        });
        
        // Сохранение и загрузка
        document.getElementById('saveBtn').addEventListener('click', () => this.saveExperiment());
        document.getElementById('loadBtn').addEventListener('click', () => this.toggleSaveLoadPanel());
        document.getElementById('exportBtn').addEventListener('click', () => this.showExportMenu());
        document.getElementById('fileInput').addEventListener('change', (e) => this.loadFromFile(e));
        
        // Ползунки
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = this.speed;
        });
        
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
            this.resizeGrid(parseInt(e.target.value));
        });

        document.getElementById('mutationRate').addEventListener('input', (e) => {
            this.mutationRate = parseInt(e.target.value);
            document.getElementById('mutationValue').textContent = this.mutationRate;
        });

        document.getElementById('temperature').addEventListener('input', (e) => {
            this.environment.temperature = parseInt(e.target.value);
            document.getElementById('temperatureValue').textContent = this.environment.temperature + '°C';
        });

        document.getElementById('pressure').addEventListener('input', (e) => {
            this.environment.pressure = parseInt(e.target.value);
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
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                console.log(`Устанавливаем display для ${id}:`, this.evolutionMode ? 'block' : 'none');
                element.style.display = this.evolutionMode ? 'block' : 'none';
            } else {
                console.warn(`Элемент ${id} не найден!`);
            }
        });
        
        statsElements.forEach(stat => {
            stat.style.display = this.evolutionMode ? 'flex' : 'none';
        });

        if (this.evolutionMode) {
            document.getElementById('evolutionControls').style.display = 'flex';
            document.getElementById('environmentControls').style.display = 'flex';
            document.getElementById('graphsContainer').style.display = 'grid';
        }
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
        const menu = document.createElement('div');
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
            <button onclick="document.body.removeChild(this.parentElement)" class="btn btn-secondary">Отмена</button>
        `;
        
        document.body.appendChild(menu);
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
                    this.grid[x][y] = {
                        dna: new CellDNA(70, 80, 90, 60, 'symbiotic')
                    };
                    symbioticAdded++;
                    console.log(`Добавлена симбиотическая клетка в ${x},${y}`);
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
        this.autoSaveInterval = setInterval(() => {
            if (this.evolutionMode && this.generation > 0) {
                this.autoSave();
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
            localStorage.setItem('gameOfLife_autoSave', JSON.stringify(autoSaveData));
            console.log('Auto-saved at generation', this.generation);
        } catch (e) {
            console.warn('Auto-save failed:', e);
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
        if (!this.grid[x][y] || !this.grid[x][y].dna) return;
        
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
        
        // Найти координаты клетки в сетке
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[x][y] === this.selectedCell) {
                    this.grid[x][y] = null;
                    this.selectedCell = null;
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
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.cellSize);
        const y = Math.floor((e.clientY - rect.top) / this.cellSize);
        
        console.log(`Клик на ячейку ${x},${y}`, this.evolutionMode ? 'режим эволюции' : 'базовый режим');
        
        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
            if (this.evolutionMode) {
                // В режиме эволюции - селекция или создание/удаление клетки
                if (e.ctrlKey && this.grid[x][y] && this.grid[x][y].dna) {
                    // Ctrl+клик - выбор для разведения
                    console.log('Выбор клетки для разведения');
                    this.selectForBreedingAt(x, y);
                } else if (this.grid[x][y]) {
                    // Клик по существующей клетке - селекция или удаление
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
                // Базовый режим - переключение состояния клетки
                this.grid[x][y] = !this.grid[x][y];
            }
            this.updateStats();
            this.draw();
        }
    }

    handleCanvasHover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.cellSize);
        const y = Math.floor((e.clientY - rect.top) / this.cellSize);
        
        this.hoveredCell = { x, y };
        
        if (this.evolutionMode && this.grid[x] && this.grid[x][y]) {
            this.selectedCell = this.grid[x][y];
            this.selectedCell.x = x;
            this.selectedCell.y = y;
            this.updateCellInfo();
        }
        
        this.draw();
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
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    animate() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        const interval = 1000 / this.speed;

        // Обновление FPS
        this.frameCount++;
        if (currentTime - this.fpsLastTime >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.fpsLastTime = currentTime;
            document.getElementById('fps').textContent = this.currentFPS;
        }

        if (deltaTime >= interval) {
            console.log('Обновляем поколение...', this.generation);
            this.nextGeneration();
            this.lastTime = currentTime - (deltaTime % interval);
        }

        if (this.isPlaying) {
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }

    nextGeneration() {
        console.log(`🎮 nextStep(): evolutionMode=${this.evolutionMode}`);
        if (this.evolutionMode) {
            this.nextGenerationEvolution();
        } else {
            console.log(`🎯 Используется классический режим вместо эволюционного!`);
            this.nextGenerationClassic();
        }
        
        this.generation++;
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
        
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const neighbors = this.getNeighborsEvolution(x, y);
                const currentCell = this.grid[x][y];

                if (currentCell && currentCell.dna) {
                    survivalChecks++;
                    // Клетка живая
                    currentCell.dna.age++;
                    currentCell.dna.energy = Math.max(0, currentCell.dna.energy - 5);
                    
                    // 💀 СМЕРТЬ ОТ СТАРОСТИ - принудительная проверка возраста
                    if (currentCell.dna.age >= currentCell.dna.lifespan) {
                        deaths++;
                        this.soundSystem.death();
                        this.createParticle(x * this.cellSize, y * this.cellSize, '#888888');
                        
                        // Логируем смерть от старости
                        if (Math.random() < 0.05) { // 5% случаев
                            console.log(`⚰️ СМЕРТЬ ОТ СТАРОСТИ: возраст=${currentCell.dna.age}, лимит=${currentCell.dna.lifespan.toFixed(0)}, поколение=${currentCell.dna.generation}, вид=${currentCell.dna.species}`);
                        }
                        
                        // Пропускаем все дальнейшие проверки - клетка умерла
                        continue;
                    }
                    
                    // Хищники охотятся на травоядных
                    if (currentCell.dna.species === 'predator' && this.predatorMode) {
                        const prey = neighbors.filter(n => n.dna.species === 'prey');
                        if (prey.length > 0 && Math.random() < 0.3) { // 30% шанс поймать жертву
                            // Выбираем случайную жертву
                            const victim = prey[Math.floor(Math.random() * prey.length)];
                            
                            // Находим координаты жертвы и "убиваем" её в nextGrid
                            for (let nx = Math.max(0, x-1); nx <= Math.min(this.gridWidth-1, x+1); nx++) {
                                for (let ny = Math.max(0, y-1); ny <= Math.min(this.gridHeight-1, y+1); ny++) {
                                    if (this.grid[nx][ny] === victim) {
                                        // НЕ модифицируем this.grid! Убиваем в nextGrid
                                        if (this.nextGrid[nx][ny]) {
                                            this.nextGrid[nx][ny] = null;
                                        }
                                        currentCell.dna.energy = Math.min(100, currentCell.dna.energy + 30);
                                        predatorKills++;
                                        this.soundSystem.predatorKill();
                                        console.log(`🦎 Хищник съел жертву в (${nx},${ny}), энергия: ${currentCell.dna.energy}`);
                                        break;
                                    }
                                }
                                if (predatorKills > 0) break;
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
                    
                    if (Math.random() < survivalChance && currentCell.dna.energy > 10) {
                        // Клетка выживает
                        const newCell = { dna: currentCell.dna.clone() };
                        newCell.dna.age = currentCell.dna.age;
                        newCell.dna.energy = currentCell.dna.energy;
                        
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

        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
        
        // Применяем экологические системы ПОСЛЕ основной эволюции
        const ecologyDeaths = this.applyEcologicalSystems();
        deaths += ecologyDeaths;
        
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
                if (this.grid[x][y] && this.grid[x][y].dna) {
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

    // Применяет все экологические системы и возвращает количество дополнительных смертей
    applyEcologicalSystems() {
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
                if (this.grid[neighbor.x] && this.grid[neighbor.x][neighbor.y] && 
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
        
        // Перемещение клеток
        migratingCells.forEach(migrant => {
            const newX = Math.max(0, Math.min(this.gridWidth - 1, 
                migrant.x + Math.floor((Math.random() - 0.5) * 6)));
            const newY = Math.max(0, Math.min(this.gridHeight - 1, 
                migrant.y + Math.floor((Math.random() - 0.5) * 6)));
            
            if (!this.grid[newX][newY]) {
                this.grid[newX][newY] = migrant.cell;
                migrant.cell.dna.achievements.add('migrant');
                console.log(`🦅 Клетка мигрировала с (${migrant.x},${migrant.y}) на (${newX},${newY})`);
            }
        });
    }

    calculateSurvivalChance(dna, neighborCount) {
        let baseChance = 0;
        
        if (dna.species === 'predator') {
            // Хищники менее зависимы от соседей
            baseChance = neighborCount <= 1 ? 0.7 : neighborCount <= 3 ? 0.9 : 0.6;
        } else {
            // Классические правила для травоядных
            if (neighborCount === 2 || neighborCount === 3) {
                baseChance = 0.8;
            } else if (neighborCount === 1 || neighborCount === 4) {
                baseChance = 0.3;
            } else {
                baseChance = 0.05;
            }
        }

        // Модификация на основе ДНК и среды
        const survivalBonus = dna.survival / 100 * 0.5;
        const adaptationBonus = dna.adaptation / 100 * 0.3;
        const energyPenalty = (100 - dna.energy) / 100 * 0.2;
        const agePenalty = Math.min(dna.age / 100, 0.3);
        
        // ГОРАЗДО более сильное влияние факторов среды на выживаемость
        const tempStress = Math.abs(this.environment.temperature) / 50; // 0 to 1
        const pressureStress = Math.abs(this.environment.pressure - 50) / 50; // 0 to 1
        
        // ОТЛАДКА: принудительно логируем расчет стресса
        if (Math.abs(this.environment.temperature) > 40 || Math.abs(this.environment.pressure - 50) > 40) {
            if (Math.random() < 0.02) { // 2% случаев
                console.log(`🌡️ РАСЧЕТ СТРЕССА: темп=${this.environment.temperature}°C → стресс=${tempStress.toFixed(2)}, давл=${this.environment.pressure}атм → стресс=${pressureStress.toFixed(2)}, экстрим=${tempStress > 0.8 || pressureStress > 0.8 ? 'ДА' : 'НЕТ'}`);
            }
        }
        
        // Экстремальные условия должны быть АБСОЛЮТНО смертельными
        let envPenalty = 0;
        if (tempStress > 0.8 || pressureStress > 0.8) {
            // При экстремальных условиях штраф 95-99% (почти гарантированная смерть)
            envPenalty = 0.95 + (tempStress + pressureStress) * 0.02;
            console.log(`☠️ КРИТИЧЕСКИЙ ШТРАФ: ${(envPenalty*100).toFixed(0)}% при темп=${this.environment.temperature}°C, давл=${this.environment.pressure}атм`);
        } else {
            // При умеренных условиях обычный штраф
            envPenalty = tempStress * 0.4 + pressureStress * 0.3;
        }
        
        // Адаптация снижает воздействие среды, но не полностью
        const adaptationResistance = (dna.adaptation / 100) * 0.5; // уменьшили с 0.7 до 0.5
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
        } else if (Math.random() < 0.01) { // Обычное логирование для нормальных условий
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
        
        // Влияние факторов среды на размножение (УСИЛЕНО)
        const tempStress = Math.abs(this.environment.temperature) / 50; // 0 to 1
        const pressureStress = Math.abs(this.environment.pressure - 50) / 50; // 0 to 1
        
        // Экстремальные условия ПОЛНОСТЬЮ блокируют размножение
        let environmentalFactor;
        if (tempStress > 0.8 || pressureStress > 0.8) {
            environmentalFactor = 0.01; // только 1% шанс размножения при экстреме (было 5%)
        } else {
            environmentalFactor = 1 - (tempStress * 0.6 + pressureStress * 0.5); // увеличили штрафы
        }
        
        console.log(`Размножение: базовый шанс=${baseChance.toFixed(2)}, температура=${this.environment.temperature}°C (стресс=${tempStress.toFixed(2)}), давление=${this.environment.pressure} (стресс=${pressureStress.toFixed(2)}), итоговый модификатор=${environmentalFactor.toFixed(2)}`);
        
        const finalReproductionChance = baseChance * reproductionBonus * energyBonus * environmentalFactor;
        
        // При экстремальных условиях размножение может быть полностью заблокировано (0%)
        if (tempStress > 0.8 || pressureStress > 0.8) {
            return Math.max(0.0, Math.min(0.9, finalReproductionChance)); // Минимум 0%
        } else {
            return Math.max(0.01, Math.min(0.9, finalReproductionChance)); // Обычный минимум 1%
        }
    }

    createOffspringDNA(parents) {
        if (parents.length === 0) return new CellDNA();
        
        // Выбираем случайных родителей
        const parent1 = parents[Math.floor(Math.random() * parents.length)];
        const parent2 = parents.length > 1 ? parents[Math.floor(Math.random() * parents.length)] : parent1;
        
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
        const neighbors = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < this.gridWidth && ny >= 0 && ny < this.gridHeight) {
                    if (this.grid[nx][ny] && this.grid[nx][ny].dna) {
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
            document.getElementById('generation').textContent = this.generation;
            
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
        
        document.getElementById('aliveCells').textContent = aliveCells;
        
        if (this.evolutionMode && aliveCells > 0) {
            const avgFitness = totalFitness / aliveCells;
            document.getElementById('avgFitness').textContent = (avgFitness * 100).toFixed(1) + '%';
            
            const diversity = this.evolutionTracker.calculateDiversity(
                this.grid.flat().filter(cell => cell && cell.dna)
            );
            document.getElementById('diversity').textContent = diversity.toFixed(1);
        }
        
        if (this.predatorMode) {
            document.getElementById('predatorCount').textContent = predators;
            document.getElementById('preyCount').textContent = prey;
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем фон среды
        this.drawEnvironmentBackground();
        
        // Рисуем сетку
        this.ctx.strokeStyle = this.isDarkTheme ? '#555' : '#e0e0e0';
        this.ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= this.gridWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize + 0.5, 0);
            this.ctx.lineTo(x * this.cellSize + 0.5, this.gridHeight * this.cellSize);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.gridHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize + 0.5);
            this.ctx.lineTo(this.gridWidth * this.cellSize, y * this.cellSize + 0.5);
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
        
        const tempFactor = this.environment.temperature / 50; // -1 to 1
        const pressureFactor = (this.environment.pressure - 50) / 50; // -1 to 1
        
        // Цветовой оверлей для температуры
        if (Math.abs(tempFactor) > 0.1) {
            this.ctx.save();
            this.ctx.globalAlpha = Math.abs(tempFactor) * 0.15;
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
        const ctx = this.charts.population;
        if (!ctx) return;
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const data = this.evolutionTracker.populationHistory;
        if (data.length < 2) return;

        const maxPop = Math.max(...data.map(d => d.count));
        if (maxPop === 0) return;
        
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * canvas.width;
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
                if (this.grid[x][y] && this.grid[x][y].dna) {
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
            shannon -= p * Math.log2(p);
            simpson += p * p;
        });
        
        this.scientificMetrics = {
            shannonDiversity: shannon,
            simpsonIndex: 1 - simpson,
            evenness: shannon / Math.log2(Object.keys(species).length),
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
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
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
        // Синхронизируем чекбоксы с переменными
        document.getElementById('evolutionMode').checked = this.evolutionMode;
        document.getElementById('predatorMode').checked = this.predatorMode;
        
        // Синхронизируем новые чекбоксы
        document.getElementById('diseaseMode').checked = this.diseaseSystem.active;
        document.getElementById('migrationMode').checked = this.migrationSystem.active;
        document.getElementById('symbiosisMode').checked = this.symbiosisSystem.active;
        document.getElementById('soundEffects').checked = this.soundSystem.enabled;
        
        // Обновляем UI в соответствии с текущим состоянием
        this.toggleEvolutionUI();
        this.togglePredatorUI();
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
