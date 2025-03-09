class TicTacToeGame {
    constructor() {
        this.board = document.getElementById('tic-tac-toe-board');
        this.cells = document.querySelectorAll('.game-cell');
        this.gameStatus = document.getElementById('game-status');
        this.resetButton = document.getElementById('reset-game');
        
        this.currentPlayer = 'X';
        this.gameState = ['', '', '', '', '', '', '', '', ''];
        this.gameActive = true;
        
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.cellClicked(e));
        });
        
        this.resetButton.addEventListener('click', () => this.resetGame());
        
        // Force redraw to trigger animations
        this.cells.forEach(cell => {
            cell.style.animation = 'none';
            cell.offsetHeight; // Trigger reflow
            cell.style.animation = null;
        });
    }
    
    cellClicked(event) {
        const cell = event.target;
        const index = parseInt(cell.getAttribute('data-index'));
        
        if (this.gameState[index] !== '' || !this.gameActive) {
            return;
        }
        
        this.gameState[index] = this.currentPlayer;
        
        if (this.currentPlayer === 'X') {
            cell.classList.add('x-mark', 'animate-pop-in', 'gpu-accelerate');
        } else {
            cell.classList.add('o-mark', 'animate-pop-in', 'gpu-accelerate');
        }
        
        requestAnimationFrame(() => this.validateGame());
    }
    
    validateGame() {
        let roundWon = false;
        let winLine = null;
        
        for (let i = 0; i < this.winningCombinations.length; i++) {
            const [a, b, c] = this.winningCombinations[i];
            
            if (
                this.gameState[a] !== '' &&
                this.gameState[a] === this.gameState[b] &&
                this.gameState[a] === this.gameState[c]
            ) {
                roundWon = true;
                winLine = i;
                break;
            }
        }
        
        if (roundWon) {
            this.gameStatus.innerText = `Player ${this.currentPlayer} wins!`;
            this.gameActive = false;
            
            requestAnimationFrame(() => {
                this.drawWinLine(winLine);
                setTimeout(() => this.createConfetti(), 200);
            });
            return;
        }
        
        if (!this.gameState.includes('')) {
            this.gameStatus.innerText = 'Game ended in a draw!';
            this.gameActive = false;
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.gameStatus.innerText = `Player ${this.currentPlayer}'s turn`;
    }
    
    drawWinLine(lineIndex) {
        const existingLines = document.querySelectorAll('.win-line');
        existingLines.forEach(line => line.remove());
        
        const winLine = document.createElement('div');
        winLine.classList.add('win-line', 'gpu-accelerate');
        
        const boardRect = this.board.getBoundingClientRect();
        const cellWidth = this.cells[0].offsetWidth;
        const cellHeight = this.cells[0].offsetHeight;
        
        if (lineIndex < 3) {
            // Horizontal lines
            const row = lineIndex;
            winLine.classList.add('horizontal-line', 'animate-horizontal');
            winLine.style.top = `${this.cells[row*3].offsetTop + cellHeight/2}px`;
            winLine.style.left = `${this.cells[row*3].offsetLeft}px`;
        } 
        else if (lineIndex < 6) {
            // Vertical lines
            const col = lineIndex - 3;
            winLine.classList.add('vertical-line', 'animate-vertical');
            winLine.style.left = `${this.cells[col].offsetLeft + cellWidth/2}px`;
            winLine.style.top = `${this.cells[0].offsetTop}px`;
        } 
        else if (lineIndex === 6) {
            // Diagonal top-left to bottom-right
            winLine.classList.add('diagonal-line-1', 'animate-diagonal');
            winLine.style.top = `${this.cells[0].offsetTop + cellHeight/2}px`;
            winLine.style.left = `${this.cells[0].offsetLeft}px`;
        } 
        else {
            // Diagonal top-right to bottom-left
            winLine.classList.add('diagonal-line-2', 'animate-diagonal');
            winLine.style.top = `${this.cells[2].offsetTop + cellHeight/2}px`;
            winLine.style.right = `${this.cells[2].offsetLeft}px`;
        }
        
        this.board.appendChild(winLine);
    }
    
    createConfetti() {
        const gameSection = document.getElementById('games');
        const confettiCount = 50;
        const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6'];
        
        const existingConfetti = document.querySelectorAll('.confetti-piece');
        existingConfetti.forEach(piece => piece.remove());
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti-piece', 'gpu-accelerate');
            
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${Math.random() * gameSection.offsetWidth}px`;
            
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 2;
            
            confetti.style.setProperty('--duration', `${duration}s`);
            confetti.style.setProperty('--delay', `${delay}s`);
            
            confetti.classList.add('animate-confetti');
            gameSection.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, (duration + delay) * 1000);
        }
    }
    
    resetGame() {
        this.currentPlayer = 'X';
        this.gameState = ['', '', '', '', '', '', '', '', ''];
        this.gameActive = true;
        this.gameStatus.innerText = `Player X's turn`;
        
        this.cells.forEach(cell => {
            cell.classList.remove('x-mark', 'o-mark', 'animate-pop-in');
        });
        
        const winLines = document.querySelectorAll('.win-line');
        winLines.forEach(line => line.parentNode?.removeChild(line));
        
        const confetti = document.querySelectorAll('.confetti-piece');
        confetti.forEach(piece => piece.parentNode?.removeChild(piece));
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
}); 