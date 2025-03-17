/**
 * Queue Orchestrator Visualization
 * 
 * This simulation demonstrates how an orchestrator manages tasks with:
 * 1. Duplicate entry handling (removing oldest duplicates)
 * 2. Task orchestration with duplicate handling (pending similar tasks until current ones complete)
 * 3. Parallel task execution limit (max 3 tasks running simultaneously)
 */

class Task {
    constructor(id, type, source) {
        this.id = id;
        this.type = type;
        this.source = source;
        this.priority = this.calculatePriority();
        this.timestamp = Date.now();
    }

    calculatePriority() {
        switch (this.source) {
            case 'eos':
                return 1; // Highest priority
            case 'finance':
                return 2;
            default:
                return 3;
        }
    }

    getPriorityLabel() {
        switch (this.priority) {
            case 1:
                return 'High';
            case 2:
                return 'Medium';
            case 3:
                return 'Low';
        }
    }
}

class PriorityQueue {
    constructor() {
        this.queue = [];
    }

    enqueue(task) {
        this.queue.push(task);
        this.sort();
    }

    dequeue() {
        return this.queue.shift();
    }

    sort() {
        this.queue.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return a.timestamp - b.timestamp;
        });
    }

    remove(taskId) {
        const index = this.queue.findIndex(task => task.id === taskId);
        if (index !== -1) {
            this.queue.splice(index, 1);
        }
    }
}

class QueueOrchestrator {
    constructor() {
        this.taskQueue = new PriorityQueue();
        this.inProgress = new Set();
        this.completed = [];
        this.taskCounter = 0;
        this.maxParallel = 3;
        this.totalCompleted = 0;
        
        this.initializeEventListeners();
        this.updateDisplay();
    }

    initializeEventListeners() {
        const taskButtons = document.querySelectorAll('.task-button');
        taskButtons.forEach(button => {
            button.addEventListener('click', () => {
                const taskType = button.textContent.trim();
                const source = document.getElementById('task-source').value;
                this.addTask(taskType, source);
            });
        });

        document.querySelector('.random-task').addEventListener('click', () => {
            const taskTypes = ['Task A', 'Task B', 'Task C', 'Task D', 'Task E'];
            const randomType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
            const sources = ['eos', 'finance', 'other'];
            const randomSource = sources[Math.floor(Math.random() * sources.length)];
            this.addTask(randomType, randomSource);
        });
    }

    addTask(type, source) {
        const task = new Task(++this.taskCounter, type, source);
        this.taskQueue.enqueue(task);
        this.processQueue();
        this.updateDisplay();
    }

    processQueue() {
        while (this.inProgress.size < this.maxParallel && this.taskQueue.queue.length > 0) {
            const task = this.taskQueue.dequeue();
            this.inProgress.add(task);
            
            // Simulate task processing
            setTimeout(() => {
                this.inProgress.delete(task);
                this.completed.unshift(task);
                this.totalCompleted++;
                if (this.completed.length > 5) {
                    this.completed.pop();
                }
                this.processQueue();
                this.updateDisplay();
            }, Math.random() * 3000 + 2000);
        }
    }

    createTaskElement(task) {
        return `
            <div class="task-item">
                <div class="task-info">
                    <span class="task-source source-${task.source}">${task.source.toUpperCase()}</span>
                    <span>${task.type}</span>
                    <span class="priority-badge priority-${task.getPriorityLabel().toLowerCase()}">
                        ${task.getPriorityLabel()} Priority
                    </span>
                </div>
                <span class="text-gray-500 text-sm">#${task.id}</span>
            </div>
        `;
    }

    updateDisplay() {
        // Update queue display
        const queueContainer = document.getElementById('queue-container');
        if (this.taskQueue.queue.length === 0) {
            queueContainer.innerHTML = '<div class="empty-message">Queue is empty</div>';
        } else {
            queueContainer.innerHTML = this.taskQueue.queue.map(task => this.createTaskElement(task)).join('');
        }

        // Update in-progress display
        const inProgressContainer = document.getElementById('in-progress-container');
        if (this.inProgress.size === 0) {
            inProgressContainer.innerHTML = '<div class="empty-message">No tasks in progress</div>';
        } else {
            inProgressContainer.innerHTML = Array.from(this.inProgress).map(task => this.createTaskElement(task)).join('');
        }

        // Update completed display
        const completedContainer = document.getElementById('completed-container');
        if (this.completed.length === 0) {
            completedContainer.innerHTML = '<div class="empty-message">No completed tasks</div>';
        } else {
            completedContainer.innerHTML = this.completed.map(task => this.createTaskElement(task)).join('');
        }

        // Update counters
        document.getElementById('queue-count').textContent = this.taskQueue.queue.length;
        document.getElementById('queue-count-badge').textContent = this.taskQueue.queue.length;
        document.getElementById('in-progress-count').textContent = this.inProgress.size;
        document.getElementById('in-progress-count-badge').textContent = this.inProgress.size;
        document.getElementById('completed-count').textContent = this.totalCompleted;
        document.getElementById('completed-count-badge').textContent = this.completed.length;
    }
}

// Initialize the orchestrator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.orchestrator = new QueueOrchestrator();
}); 