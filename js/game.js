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
    }
    
    cellClicked(event) {
        const cell = event.target;
        const index = parseInt(cell.getAttribute('data-index'));
        
        if (this.gameState[index] !== '' || !this.gameActive) {
            return;
        }
        
        this.gameState[index] = this.currentPlayer;
        
        if (this.currentPlayer === 'X') {
            const xMark = document.createElement('div');
            xMark.innerHTML = 'X';
            xMark.style.color = '#3498db';
            xMark.style.fontSize = '2.5rem';
            xMark.style.fontWeight = 'bold';
            
            cell.innerHTML = '';
            cell.appendChild(xMark);
        } else {
            const oMark = document.createElement('div');
            oMark.innerHTML = 'O';
            oMark.style.color = '#e74c3c';
            oMark.style.fontSize = '2.5rem';
            oMark.style.fontWeight = 'bold';
            
            cell.innerHTML = '';
            cell.appendChild(oMark);
        }
        
        this.validateGame();
    }
    
    validateGame() {
        let roundWon = false;
        let winningLine = null;
        
        for (let i = 0; i < this.winningCombinations.length; i++) {
            const [a, b, c] = this.winningCombinations[i];
            
            if (
                this.gameState[a] !== '' &&
                this.gameState[a] === this.gameState[b] &&
                this.gameState[a] === this.gameState[c]
            ) {
                roundWon = true;
                winningLine = this.winningCombinations[i];
                break;
            }
        }
        
        if (roundWon) {
            this.gameStatus.innerText = `Player ${this.currentPlayer} wins!`;
            this.gameActive = false;
            
            this.highlightWinningCells(winningLine);
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
    
    highlightWinningCells(winningLine) {
        winningLine.forEach(index => {
            const cell = this.cells[index];
            cell.style.backgroundColor = '#d5f5e3';
            cell.style.transition = 'background-color 0.3s ease';
        });
    }
    
    resetGame() {
        this.currentPlayer = 'X';
        this.gameState = ['', '', '', '', '', '', '', '', ''];
        this.gameActive = true;
        this.gameStatus.innerText = `Player X's turn`;
        
        this.cells.forEach(cell => {
            cell.innerHTML = '';
            cell.style.backgroundColor = '#fff';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
}); 