/**
 * Queue Orchestrator Visualization
 * 
 * An interactive demonstration of asynchronous task management with:
 * - Priority-based queuing (EOS > Finance > Other)
 * - Parallel execution with limited concurrency (max 3 tasks)
 * - Asynchronous subtask processing
 */

class Task {
    constructor(id, type, source) {
        this.id = id;
        this.type = type;
        this.source = source;
        this.priority = this.calculatePriority();
        this.timestamp = Date.now();
        this.status = 'queued';
        
        // Define subtasks (previously called computations)
        this.subtasks = [
            { id: `R${Math.floor(Math.random() * 1000)}`, name: 'Revenue', type: 'revenue', status: 'pending', progress: 0 },
            { id: `S${Math.floor(Math.random() * 1000)}`, name: 'Specialty', type: 'specialty', status: 'pending', progress: 0 },
            { id: `B${Math.floor(Math.random() * 1000)}`, name: 'Rebates', type: 'rebates', status: 'pending', progress: 0 }
        ];
        
        this.completedTime = null;
    }

    calculatePriority() {
        switch (this.source) {
            case 'eos': return 1; // Highest priority
            case 'finance': return 2;
            default: return 3;
        }
    }

    getPriorityLabel() {
        switch (this.priority) {
            case 1: return 'High';
            case 2: return 'Medium';
            case 3: return 'Low';
        }
    }

    updateSubtaskProgress(index, progress) {
        if (this.subtasks[index]) {
            this.subtasks[index].progress = Math.min(progress, 100);
            
            if (progress >= 100) {
                this.subtasks[index].status = 'completed';
            } else if (progress > 0) {
                this.subtasks[index].status = 'running';
            }
        }
    }

    isCompleted() {
        return this.subtasks.every(subtask => subtask.status === 'completed');
    }

    markCompleted() {
        this.completedTime = new Date();
        this.status = 'completed';
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
                return a.priority - b.priority; // Sort by priority first
            }
            return a.timestamp - b.timestamp; // Then by timestamp (FIFO)
        });
    }

    size() {
        return this.queue.length;
    }

    peek() {
        return this.queue.length > 0 ? this.queue[0] : null;
    }

    clear() {
        this.queue = [];
    }
}

class QueueOrchestrator {
    constructor() {
        this.taskQueue = new PriorityQueue();
        this.inProgress = [];
        this.completed = [];
        this.taskCounter = 0;
        this.maxParallel = 3;
        this.totalCompleted = 0;
        this.isProcessing = false;

        // Initialize event listeners after DOM is loaded
        this.initializeEventListeners();
        this.updateDisplay();
    }

    initializeEventListeners() {
        // Attach click events to task buttons
        document.querySelectorAll('.task-button').forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('random-task')) {
                    this.addRandomTask();
                } else {
                    // Extract task type from button text content
                    const type = button.textContent.trim();
                    const source = document.getElementById('task-source').value;
                    this.addTask(type, source);
                }
            });
        });
    }

    addRandomTask() {
        const taskTypes = ['Task A', 'Task B', 'Task C', 'Task D', 'Task E'];
        const sources = ['eos', 'finance', 'other'];
        
        const randomType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        
        this.addTask(randomType, randomSource);
    }

    addTask(type, source) {
        // Create and enqueue a new task
        const task = new Task(++this.taskCounter, type, source);
        this.taskQueue.enqueue(task);
        
        console.log(`Added task to queue: ${type} (${source}) with ID #${task.id}`);
        
        // Update UI and start processing if needed
        this.updateDisplay();
        this.processQueue();
    }

    async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        // Process as many tasks as we can (up to maxParallel)
        while (this.inProgress.length < this.maxParallel && this.taskQueue.size() > 0) {
            const task = this.taskQueue.dequeue();
            task.status = 'in_progress';
            this.inProgress.push(task);
            
            console.log(`Moving task #${task.id} to in-progress`);
            this.updateDisplay();

            // Start processing all subtasks in parallel
            task.subtasks.forEach((subtask, index) => {
                this.processSubtask(task, index);
            });
        }

        this.isProcessing = false;
    }

    processSubtask(task, subtaskIndex) {
        // Set different durations for different subtask types
        const baseDuration = 2000;
        const varianceDuration = 3000;
        const durationOffset = subtaskIndex * 1000; // Make later subtasks slightly longer
        
        const duration = baseDuration + durationOffset + Math.random() * varianceDuration;
        const startTime = Date.now();

        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(Math.floor((elapsed / duration) * 100), 100);

            task.updateSubtaskProgress(subtaskIndex, progress);
            this.updateDisplay();

            if (progress < 100) {
                // Continue updating until complete
                requestAnimationFrame(updateProgress);
            } else if (task.isCompleted()) {
                // If all subtasks complete, mark the task as completed
                this.completeTask(task);
            }
        };

        // Start the update loop
        requestAnimationFrame(updateProgress);
    }

    completeTask(task) {
        const index = this.inProgress.findIndex(t => t.id === task.id);
        
        if (index !== -1) {
            // Remove from in-progress and add to completed
            const completedTask = this.inProgress.splice(index, 1)[0];
            completedTask.markCompleted();
            
            this.completed.unshift(completedTask); // Add to the beginning (most recent first)
            this.totalCompleted++;
            
            // Keep only the 5 most recent completed tasks
            if (this.completed.length > 5) {
                this.completed.pop();
            }
            
            console.log(`Task #${task.id} completed`);
            
            // Update UI and check if we can process more tasks
            this.updateDisplay();
            this.processQueue();
        }
    }

    createTaskElement(task) {
        // Create the main task card container
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.id = `task-${task.id}`;
        
        // Create the task header with ID and type
        const taskHeader = document.createElement('div');
        taskHeader.className = 'task-header';
        
        const taskId = document.createElement('div');
        taskId.className = 'task-id';
        taskId.textContent = `#${task.id}`;
        
        const taskType = document.createElement('div');
        taskType.className = `task-type ${task.type.toLowerCase().replace(/\s+/g, '-')}`;
        taskType.textContent = task.type;
        
        taskHeader.appendChild(taskId);
        taskHeader.appendChild(taskType);
        
        // Create the task body with subtasks
        const taskBody = document.createElement('div');
        taskBody.className = 'task-body';
        
        const subtaskList = document.createElement('div');
        subtaskList.className = 'subtask-list';
        
        // Add each subtask
        task.subtasks.forEach(subtask => {
            const subtaskElement = document.createElement('div');
            subtaskElement.className = 'subtask';
            
            // Subtask icon
            const iconElement = document.createElement('div');
            iconElement.className = `subtask-icon ${subtask.type}`;
            
            const icon = document.createElement('i');
            if (subtask.type === 'revenue') {
                icon.className = 'fas fa-dollar-sign';
            } else if (subtask.type === 'specialty') {
                icon.className = 'fas fa-star';
            } else {
                icon.className = 'fas fa-percentage';
            }
            
            iconElement.appendChild(icon);
            
            // Subtask details with name and progress
            const detailsElement = document.createElement('div');
            detailsElement.className = 'subtask-details';
            
            const nameElement = document.createElement('div');
            nameElement.className = 'subtask-name';
            nameElement.textContent = subtask.name;
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            
            const progressFill = document.createElement('div');
            progressFill.className = `progress-fill ${subtask.type}`;
            progressFill.style.width = `${subtask.progress}%`;
            
            progressBar.appendChild(progressFill);
            detailsElement.appendChild(nameElement);
            detailsElement.appendChild(progressBar);
            
            // Subtask status
            const statusElement = document.createElement('div');
            statusElement.className = `subtask-status ${subtask.status}`;
            statusElement.textContent = subtask.status.charAt(0).toUpperCase() + subtask.status.slice(1);
            
            // Add all elements to the subtask
            subtaskElement.appendChild(iconElement);
            subtaskElement.appendChild(detailsElement);
            subtaskElement.appendChild(statusElement);
            
            // Add to the subtask list
            subtaskList.appendChild(subtaskElement);
        });
        
        taskBody.appendChild(subtaskList);
        
        // Create task footer with metadata
        const taskFooter = document.createElement('div');
        taskFooter.className = 'task-footer';
        
        const taskMeta = document.createElement('div');
        taskMeta.className = 'task-meta';
        
        const sourceElement = document.createElement('div');
        sourceElement.className = `task-source ${task.source}`;
        sourceElement.textContent = task.source.toUpperCase();
        
        const priorityElement = document.createElement('div');
        priorityElement.className = `task-priority ${task.getPriorityLabel().toLowerCase()}`;
        priorityElement.textContent = `${task.getPriorityLabel()} Priority`;
        
        taskMeta.appendChild(sourceElement);
        taskMeta.appendChild(priorityElement);
        
        taskFooter.appendChild(taskMeta);
        
        // Assemble the complete task card
        taskCard.appendChild(taskHeader);
        taskCard.appendChild(taskBody);
        taskCard.appendChild(taskFooter);
        
        return taskCard;
    }

    createCompletedTasksTable() {
        if (this.completed.length === 0) {
            // Show empty state if no completed tasks
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            
            const icon = document.createElement('i');
            icon.className = 'fas fa-clipboard-check';
            
            const text = document.createElement('p');
            text.textContent = 'No completed tasks';
            
            emptyState.appendChild(icon);
            emptyState.appendChild(text);
            
            return emptyState;
        }

        // Create the table
        const table = document.createElement('table');
        table.className = 'completed-table';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Task ID', 'Type', 'Source', 'Priority', 'Completed At', 'Subtasks'];
        
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        this.completed.forEach(task => {
            const row = document.createElement('tr');
            
            // Task ID
            const idCell = document.createElement('td');
            idCell.textContent = `#${task.id}`;
            
            // Task Type
            const typeCell = document.createElement('td');
            typeCell.textContent = task.type;
            
            // Source
            const sourceCell = document.createElement('td');
            const sourceSpan = document.createElement('span');
            sourceSpan.className = `task-source ${task.source}`;
            sourceSpan.textContent = task.source.toUpperCase();
            sourceCell.appendChild(sourceSpan);
            
            // Priority
            const priorityCell = document.createElement('td');
            const prioritySpan = document.createElement('span');
            prioritySpan.className = `task-priority ${task.getPriorityLabel().toLowerCase()}`;
            prioritySpan.textContent = task.getPriorityLabel();
            priorityCell.appendChild(prioritySpan);
            
            // Completed Time
            const timeCell = document.createElement('td');
            timeCell.textContent = task.completedTime ? task.completedTime.toLocaleTimeString() : 'N/A';
            
            // Subtasks
            const subtasksCell = document.createElement('td');
            subtasksCell.style.display = 'flex';
            subtasksCell.style.gap = '0.5rem';
            
            task.subtasks.forEach(subtask => {
                const iconSpan = document.createElement('span');
                iconSpan.style.display = 'inline-flex';
                iconSpan.style.alignItems = 'center';
                iconSpan.style.justifyContent = 'center';
                iconSpan.style.width = '1.75rem';
                iconSpan.style.height = '1.75rem';
                iconSpan.style.borderRadius = '0.25rem';
                iconSpan.style.backgroundColor = `var(--bg-tertiary)`;
                iconSpan.title = `${subtask.name}: ${subtask.id}`;
                
                const icon = document.createElement('i');
                if (subtask.type === 'revenue') {
                    icon.className = 'fas fa-dollar-sign';
                } else if (subtask.type === 'specialty') {
                    icon.className = 'fas fa-star';
                } else {
                    icon.className = 'fas fa-percentage';
                }
                
                iconSpan.appendChild(icon);
                subtasksCell.appendChild(iconSpan);
            });
            
            // Add all cells to the row
            row.appendChild(idCell);
            row.appendChild(typeCell);
            row.appendChild(sourceCell);
            row.appendChild(priorityCell);
            row.appendChild(timeCell);
            row.appendChild(subtasksCell);
            
            // Add row to table body
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        return table;
    }

    updateDisplay() {
        console.log('Updating display - Queue:', this.taskQueue.size(), 'In Progress:', this.inProgress.length, 'Completed:', this.completed.length);
        
        // Update Queue Container
        const queueContainer = document.getElementById('queue-container');
        if (queueContainer) {
            queueContainer.innerHTML = '';
            
            if (this.taskQueue.size() === 0) {
                // Show empty state
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                
                const icon = document.createElement('i');
                icon.className = 'fas fa-inbox';
                
                const text = document.createElement('p');
                text.textContent = 'Queue is empty';
                
                emptyState.appendChild(icon);
                emptyState.appendChild(text);
                queueContainer.appendChild(emptyState);
            } else {
                // Add all queued tasks
                this.taskQueue.queue.forEach(task => {
                    queueContainer.appendChild(this.createTaskElement(task));
                });
            }
        }

        // Update In Progress Container
        const inProgressContainer = document.getElementById('in-progress-container');
        if (inProgressContainer) {
            inProgressContainer.innerHTML = '';
            
            if (this.inProgress.length === 0) {
                // Show empty state
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                
                const icon = document.createElement('i');
                icon.className = 'fas fa-hourglass-half';
                
                const text = document.createElement('p');
                text.textContent = 'No tasks in progress';
                
                emptyState.appendChild(icon);
                emptyState.appendChild(text);
                inProgressContainer.appendChild(emptyState);
            } else {
                // Add all in-progress tasks
                this.inProgress.forEach(task => {
                    inProgressContainer.appendChild(this.createTaskElement(task));
                });
            }
        }

        // Update Completed Container
        const completedContainer = document.getElementById('completed-container');
        if (completedContainer) {
            completedContainer.innerHTML = '';
            completedContainer.appendChild(this.createCompletedTasksTable());
        }

        // Update Counters
        this.updateCounters();
    }

    updateCounters() {
        // Update all counter displays
        const counters = {
            'queue-count': this.taskQueue.size(),
            'queue-count-badge': this.taskQueue.size(),
            'in-progress-count': this.inProgress.length,
            'in-progress-count-badge': this.inProgress.length,
            'completed-count': this.totalCompleted,
            'completed-count-badge': this.completed.length
        };
        
        // Update each counter element if it exists
        Object.entries(counters).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
}

// Initialize the orchestrator when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Queue Orchestrator');
    window.orchestrator = new QueueOrchestrator();
}); 