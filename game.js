// game.js - FULL CODE FIXED
class AdvancedGameOfLife {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.generationElement = document.getElementById('generation');
        
        // Game settings
        this.cellSize = 10;
        this.cols = Math.floor(800 / this.cellSize);
        this.rows = Math.floor(600 / this.cellSize);
        this.generation = 0;
        this.isRunning = false;
        this.speed = 100;
        
        // Custom Rules
        this.rules = {
            born: { min: 3, max: 3 },
            alive: { min: 2, max: 3 },
            dead: { min: 0, max: 8 },
            switch: { min: null, max: null }
        };
        
        // Initialize grid
        this.grid = this.createGrid();
        this.nextGrid = this.createGrid();
        
        this.setupCanvas();
        this.setupEvents();
        this.setupRules();
        this.loadPresetsFromStorage();
        this.drawGrid();
        this.updateActiveRulesDisplay();
    }
    
    createGrid() {
        return Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }
    
    setupCanvas() {
        this.canvas.width = this.cols * this.cellSize;
        this.canvas.height = this.rows * this.cellSize;
    }
    
    setupRules() {
        this.calculateDeadRules();
        
        document.getElementById('presetSelect').addEventListener('change', (e) => {
            this.loadPreset(e.target.value);
        });
    }
    
    calculateDeadRules() {
        const aliveMin = this.rules.alive.min;
        const aliveMax = this.rules.alive.max;
        this.rules.dead.min = 0;
        this.rules.dead.max = 8;
    }
    
    setupEvents() {
        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('randomBtn').addEventListener('click', () => this.randomize());
        
        // Speed control
        document.getElementById('speed').addEventListener('input', (e) => {
            this.speed = 200 - (e.target.value * 9);
        });
        
        // Rules buttons
        document.getElementById('applyRules').addEventListener('click', () => this.applyCustomRules());
        document.getElementById('resetRules').addEventListener('click', () => this.resetToDefaultRules());
        document.getElementById('savePreset').addEventListener('click', () => this.saveCurrentPreset());
        document.getElementById('deletePreset').addEventListener('click', () => this.deleteCurrentPreset());
        
        // Canvas click to toggle cells
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / this.cellSize);
            const y = Math.floor((e.clientY - rect.top) / this.cellSize);
            
            if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
                this.grid[y][x] = this.grid[y][x] ? 0 : 1;
                this.drawGrid();
            }
        });
        
        this.updateRuleInputs();
    }
    
    updateRuleInputs() {
        document.getElementById('bornMin').value = this.rules.born.min;
        document.getElementById('bornMax').value = this.rules.born.max;
        document.getElementById('aliveMin').value = this.rules.alive.min;
        document.getElementById('aliveMax').value = this.rules.alive.max;
        document.getElementById('deadMin').value = this.rules.dead.min;
        document.getElementById('deadMax').value = this.rules.dead.max;
        
        if (this.rules.switch.min !== null) {
            document.getElementById('switchMin').value = this.rules.switch.min;
            document.getElementById('switchMax').value = this.rules.switch.max;
        } else {
            document.getElementById('switchMin').value = '';
            document.getElementById('switchMax').value = '';
        }
    }
    
    applyCustomRules() {
        this.rules.born.min = parseInt(document.getElementById('bornMin').value) || 0;
        this.rules.born.max = parseInt(document.getElementById('bornMax').value) || 0;
        
        this.rules.alive.min = parseInt(document.getElementById('aliveMin').value) || 0;
        this.rules.alive.max = parseInt(document.getElementById('aliveMax').value) || 0;
        
        this.rules.dead.min = parseInt(document.getElementById('deadMin').value) || 0;
        this.rules.dead.max = parseInt(document.getElementById('deadMax').value) || 8;
        
        const switchMin = document.getElementById('switchMin').value;
        const switchMax = document.getElementById('switchMax').value;
        
        if (switchMin && switchMax) {
            this.rules.switch.min = parseInt(switchMin);
            this.rules.switch.max = parseInt(switchMax);
        } else {
            this.rules.switch.min = null;
            this.rules.switch.max = null;
        }
        
        this.calculateDeadRules();
        this.updateActiveRulesDisplay();
        this.drawGrid();
    }
    
    resetToDefaultRules() {
        this.rules = {
            born: { min: 3, max: 3 },
            alive: { min: 2, max: 3 },
            dead: { min: 0, max: 8 },
            switch: { min: null, max: null }
        };
        
        this.calculateDeadRules();
        this.updateRuleInputs();
        this.updateActiveRulesDisplay();
        document.getElementById('presetSelect').value = 'conway';
    }
    
    // LOCALSTORAGE METHODS
    getPresetsFromStorage() {
        try {
            const presets = localStorage.getItem('gameOfLifePresets');
            return presets ? JSON.parse(presets) : {};
        } catch (e) {
            console.error('Error loading presets:', e);
            return {};
        }
    }
    
    savePresetsToStorage(presets) {
        try {
            localStorage.setItem('gameOfLifePresets', JSON.stringify(presets));
            return true;
        } catch (e) {
            console.error('Error saving presets:', e);
            alert('Error saving preset. Check browser storage permissions.');
            return false;
        }
    }
    
    loadPresetsFromStorage() {
        const presets = this.getPresetsFromStorage();
        const presetSelect = document.getElementById('presetSelect');
        
        const builtInPresets = ['conway', 'highlife', 'maze', 'custom'];
        for (let i = presetSelect.options.length - 1; i >= 0; i--) {
            if (!builtInPresets.includes(presetSelect.options[i].value)) {
                presetSelect.remove(i);
            }
        }
        
        Object.keys(presets).forEach(presetName => {
            const option = document.createElement('option');
            option.value = presetName;
            option.textContent = `★ ${presetName}`;
            presetSelect.appendChild(option);
        });
        
        return presets;
    }
    
    saveCurrentPreset() {
        const presetName = prompt('Enter a name for your preset:');
        if (!presetName) return;
        
        if (presetName.length > 20) {
            alert('Preset name too long (max 20 characters)');
            return;
        }
        
        const builtInPresets = ['conway', 'highlife', 'maze', 'custom'];
        if (builtInPresets.includes(presetName.toLowerCase())) {
            alert('Cannot use reserved preset names. Choose a different name.');
            return;
        }
        
        const presets = this.getPresetsFromStorage();
        
        if (presets[presetName] && !confirm(`Overwrite existing preset "${presetName}"?`)) {
            return;
        }
        
        presets[presetName] = {
            rules: JSON.parse(JSON.stringify(this.rules)),
            timestamp: new Date().toISOString(),
            generation: this.generation
        };
        
        if (this.savePresetsToStorage(presets)) {
            this.loadPresetsFromStorage();
            document.getElementById('presetSelect').value = presetName;
            this.updateDeleteButtonVisibility();
            alert(`Preset "${presetName}" saved successfully!`);
        }
    }
    
    deleteCurrentPreset() {
        const presetSelect = document.getElementById('presetSelect');
        const currentPreset = presetSelect.value;
        
        const builtInPresets = ['conway', 'highlife', 'maze', 'custom'];
        if (builtInPresets.includes(currentPreset)) {
            alert('Cannot delete built-in presets.');
            return;
        }
        
        if (confirm(`Delete preset "${currentPreset}"?`)) {
            const presets = this.getPresetsFromStorage();
            delete presets[currentPreset];
            
            if (this.savePresetsToStorage(presets)) {
                this.loadPresetsFromStorage();
                document.getElementById('presetSelect').value = 'conway';
                this.loadPreset('conway');
                this.updateDeleteButtonVisibility();
                alert(`Preset "${currentPreset}" deleted.`);
            }
        }
    }
    
    updateDeleteButtonVisibility() {
        const presetSelect = document.getElementById('presetSelect');
        const deleteBtn = document.getElementById('deletePreset');
        const currentPreset = presetSelect.value;
        
        const builtInPresets = ['conway', 'highlife', 'maze', 'custom'];
        deleteBtn.style.display = builtInPresets.includes(currentPreset) ? 'none' : 'inline-block';
    }
    
    loadPreset(presetName) {
        const builtInPresets = {
            'conway': { born: { min: 3, max: 3 }, alive: { min: 2, max: 3 } },
            'highlife': { born: { min: 3, max: 6 }, alive: { min: 2, max: 3 } },
            'maze': { born: { min: 3, max: 3 }, alive: { min: 1, max: 5 } }
        };
        
        if (builtInPresets[presetName]) {
            this.rules.born = builtInPresets[presetName].born;
            this.rules.alive = builtInPresets[presetName].alive;
        } else {
            const presets = this.getPresetsFromStorage();
            if (presets[presetName]) {
                this.rules = JSON.parse(JSON.stringify(presets[presetName].rules));
            } else {
                console.warn('Preset not found:', presetName);
                return;
            }
        }
        
        this.calculateDeadRules();
        this.updateRuleInputs();
        this.updateActiveRulesDisplay();
        this.updateDeleteButtonVisibility();
    }
    
    updateActiveRulesDisplay() {
        document.getElementById('activeBorn').textContent = `Born: ${this.rules.born.min}-${this.rules.born.max}`;
        document.getElementById('activeAlive').textContent = `Alive: ${this.rules.alive.min}-${this.rules.alive.max}`;
        
        const deadRules = [];
        if (this.rules.dead.min < this.rules.alive.min) {
            deadRules.push(`${this.rules.dead.min}-${this.rules.alive.min - 1}`);
        }
        if (this.rules.dead.max > this.rules.alive.max) {
            deadRules.push(`${this.rules.alive.max + 1}-${this.rules.dead.max}`);
        }
        
        document.getElementById('activeDead').textContent = `Dead: ${deadRules.join(', ') || 'none'}`;
        
        if (this.rules.switch.min !== null) {
            document.getElementById('activeSwitch').textContent = `Switch: ${this.rules.switch.min}-${this.rules.switch.max}`;
        } else {
            document.getElementById('activeSwitch').textContent = 'Switch: off';
        }
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.run();
        }
    }
    
    pause() {
        this.isRunning = false;
    }
    
    reset() {
        this.pause();
        this.grid = this.createGrid();
        this.generation = 0;
        this.generationElement.textContent = this.generation;
        this.drawGrid();
    }
    
    randomize() {
        this.grid = this.grid.map(row => 
            row.map(() => Math.random() > 0.7 ? 1 : 0)
        );
        this.drawGrid();
    }
    
    run() {
        if (!this.isRunning) return;
        
        this.nextGeneration();
        this.drawGrid();
        this.generation++;
        this.generationElement.textContent = this.generation;
        
        setTimeout(() => this.run(), this.speed);
    }
    
    nextGeneration() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const neighbors = this.countNeighbors(x, y);
                const cell = this.grid[y][x];
                
                let nextState = cell;
                
                if (this.rules.switch.min !== null && 
                    neighbors >= this.rules.switch.min && 
                    neighbors <= this.rules.switch.max) {
                    nextState = 1 - cell;
                }
                else if (cell === 0 && 
                         neighbors >= this.rules.born.min && 
                         neighbors <= this.rules.born.max) {
                    nextState = 1;
                }
                else if (cell === 1 && 
                         neighbors >= this.rules.alive.min && 
                         neighbors <= this.rules.alive.max) {
                    nextState = 1;
                }
                else if (cell === 1 && 
                         neighbors >= this.rules.dead.min && 
                         neighbors <= this.rules.dead.max) {
                    nextState = 0;
                }
                else if (cell === 1) {
                    nextState = 0;
                }
                
                this.nextGrid[y][x] = nextState;
            }
        }
        
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
    }
    
    countNeighbors(x, y) {
        let count = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const nx = (x + dx + this.cols) % this.cols;
                const ny = (y + dy + this.rows) % this.rows;
                
                count += this.grid[ny][nx];
            }
        }
        
        return count;
    }
    
    drawGrid() {
        this.ctx.fillStyle = '#1a2b3c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] === 1) {
                    this.ctx.fillStyle = '#4CAF50';
                    this.ctx.fillRect(
                        x * this.cellSize, 
                        y * this.cellSize, 
                        this.cellSize - 1, 
                        this.cellSize - 1
                    );
                }
            }
        }
        
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= this.cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(this.canvas.width, y * this.cellSize);
            this.ctx.stroke();
        }
    }
}

// ✅ FIXED - Correct class name
window.addEventListener('load', () => {
    new AdvancedGameOfLife(); // ✅ BENAR
});
