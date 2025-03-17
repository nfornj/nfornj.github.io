/**
 * Queue Orchestrator Visualization
 * 
 * This simulation demonstrates how an orchestrator manages tasks with:
 * 1. Duplicate entry handling (removing oldest duplicates)
 * 2. Task orchestration with duplicate handling (pending similar tasks until current ones complete)
 * 3. Parallel task execution limit (max 3 tasks running simultaneously)
 */

class QueueOrchestrator {
    constructor() {
        this.queue = [];
        this.inProgress = [];
        this.completed = [];
        this.maxParallelTasks = 3;
        this.taskTypes = [
            { id: 'task-a', name: 'Task A', color: '#3498db', duration: 3000 },
            { id: 'task-b', name: 'Task B', color: '#2ecc71', duration: 5000 },
            { id: 'task-c', name: 'Task C', color: '#e74c3c', duration: 2000 },
            { id: 'task-d', name: 'Task D', color: '#f39c12', duration: 4000 },
            { id: 'task-e', name: 'Task E', color: '#9b59b6', duration: 3500 }
        ];
    }

    // Add a task to the queue
    addTask(taskType) {
        const taskTypeObj = this.taskTypes.find(t => t.id === taskType);
        if (!taskTypeObj) return;

        const task = {
            id: `${taskType}-${Date.now()}`,
            type: taskType,
            name: taskTypeObj.name,
            color: taskTypeObj.color,
            duration: taskTypeObj.duration,
            timestamp: Date.now()
        };

        // Rule 1: Remove oldest duplicate if exists
        const duplicateIndex = this.queue.findIndex(t => t.type === task.type);
        if (duplicateIndex !== -1) {
            this.queue.splice(duplicateIndex, 1);
        }

        this.queue.push(task);
        this.updateUI();
        this.processQueue();
    }

    // Process the queue based on rules
    processQueue() {
        if (this.queue.length === 0 || this.inProgress.length >= this.maxParallelTasks) {
            return;
        }

        // Get next eligible task
        const nextTaskIndex = this.findNextEligibleTaskIndex();
        if (nextTaskIndex === -1) return;

        const task = this.queue.splice(nextTaskIndex, 1)[0];
        this.inProgress.push(task);
        
        this.updateUI();

        // Process the task
        setTimeout(() => {
            const index = this.inProgress.findIndex(t => t.id === task.id);
            if (index !== -1) {
                const completedTask = this.inProgress.splice(index, 1)[0];
                completedTask.completedAt = Date.now();
                this.completed.push(completedTask);
                
                // Keep only the last 5 completed tasks
                if (this.completed.length > 5) {
                    this.completed.shift();
                }
                
                this.updateUI();
                this.processQueue();
            }
        }, task.duration);
    }

    // Find the next eligible task based on rules
    findNextEligibleTaskIndex() {
        for (let i = 0; i < this.queue.length; i++) {
            const task = this.queue[i];
            
            // Rule 2: Skip if similar task is in progress
            const similarTaskInProgress = this.inProgress.some(t => t.type === task.type);
            if (!similarTaskInProgress) {
                return i;
            }
        }
        return -1;
    }

    // Update the UI to reflect current state
    updateUI() {
        this.renderQueue();
        this.renderInProgress();
        this.renderCompleted();
        this.updateStats();
    }

    renderQueue() {
        const queueContainer = document.getElementById('queue-container');
        queueContainer.innerHTML = '';
        
        this.queue.forEach(task => {
            const taskElement = this.createTaskElement(task, 'queued');
            queueContainer.appendChild(taskElement);
        });
        
        if (this.queue.length === 0) {
            queueContainer.innerHTML = '<div class="empty-message">Queue is empty</div>';
        }
    }

    renderInProgress() {
        const inProgressContainer = document.getElementById('in-progress-container');
        inProgressContainer.innerHTML = '';
        
        this.inProgress.forEach(task => {
            const taskElement = this.createTaskElement(task, 'in-progress');
            inProgressContainer.appendChild(taskElement);
        });
        
        if (this.inProgress.length === 0) {
            inProgressContainer.innerHTML = '<div class="empty-message">No tasks in progress</div>';
        }
    }

    renderCompleted() {
        const completedContainer = document.getElementById('completed-container');
        completedContainer.innerHTML = '';
        
        this.completed.slice().reverse().forEach(task => {
            const taskElement = this.createTaskElement(task, 'completed');
            completedContainer.appendChild(taskElement);
        });
        
        if (this.completed.length === 0) {
            completedContainer.innerHTML = '<div class="empty-message">No completed tasks</div>';
        }
    }

    createTaskElement(task, status) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${status}`;
        taskElement.style.backgroundColor = task.color;
        
        let content = `<div class="task-name">${task.name}</div>`;
        
        if (status === 'in-progress') {
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            
            const progress = document.createElement('div');
            progress.className = 'progress';
            progressBar.appendChild(progress);
            
            // Animate the progress bar
            setTimeout(() => {
                progress.style.width = '100%';
                progress.style.transition = `width ${task.duration}ms linear`;
            }, 10);
            
            taskElement.appendChild(progressBar);
        } else if (status === 'completed') {
            const completionTime = ((task.completedAt - task.timestamp) / 1000).toFixed(1);
            content += `<div class="task-time">Completed in ${completionTime}s</div>`;
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'task-content';
        contentDiv.innerHTML = content;
        taskElement.appendChild(contentDiv);
        
        return taskElement;
    }

    updateStats() {
        document.getElementById('queue-count').textContent = this.queue.length;
        document.getElementById('in-progress-count').textContent = this.inProgress.length;
        document.getElementById('completed-count').textContent = this.completed.length;
        document.getElementById('max-parallel').textContent = this.maxParallelTasks;
    }
}

// Initialize the visualization when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const orchestrator = new QueueOrchestrator();
    
    // Add task buttons
    const controlsContainer = document.getElementById('queue-controls');
    orchestrator.taskTypes.forEach(taskType => {
        const button = document.createElement('button');
        button.className = 'task-button';
        button.style.backgroundColor = taskType.color;
        button.textContent = taskType.name;
        button.addEventListener('click', () => orchestrator.addTask(taskType.id));
        controlsContainer.appendChild(button);
    });
    
    // Add random task button
    const randomButton = document.createElement('button');
    randomButton.className = 'task-button random-button';
    randomButton.textContent = 'Add Random Task';
    randomButton.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * orchestrator.taskTypes.length);
        orchestrator.addTask(orchestrator.taskTypes[randomIndex].id);
    });
    controlsContainer.appendChild(randomButton);
    
    // Initialize UI
    orchestrator.updateUI();
}); 