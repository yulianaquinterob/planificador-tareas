const taskView = {
    renderTaskCard(task) {
        const template = document.getElementById('task-card-template');
        if (!template) return;

        const cardClone = template.content.cloneNode(true);
        const article = cardClone.querySelector('.task-card');
        article.setAttribute('data-task-id', task.id);
        article.setAttribute('draggable', 'true');
        article.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', task.id);
        });

        cardClone.querySelector('.card-title').textContent = task.titulo;
        cardClone.querySelector('.card-person').textContent = task.responsable;
        cardClone.querySelector('.card-description').textContent = task.descripcion;
        cardClone.querySelector('.card-date').textContent = task.fechaDeEntrega;

        cardClone.querySelector('.btn-delete').addEventListener('click', () => {
            taskManager.deleteTask(task.id);
        });

        cardClone.querySelector('.btn-update').addEventListener('click', () => {
            openTaskForEdit(task);
        });

        const targetColumn = document.querySelector(`#column-${task.estado} .tasks-list`);
        if (targetColumn) {
            targetColumn.appendChild(cardClone);
        }
    },

    removeTaskCard(taskId) {
        document.querySelector(`[data-task-id="${taskId}"]`)?.remove();
    },

    moveTaskCard(taskId, column) {
        const cardElement = document.querySelector(`[data-task-id="${taskId}"]`);
        const targetList = column.querySelector('.tasks-list');
        if (cardElement && targetList) {
            targetList.appendChild(cardElement);
        }
    },

    updateCountersBadges(tasks) {
        const statesMap = {
            'to-do': 'column-to-do',
            process: 'column-process',
            revision: 'column-revision',
            done: 'column-done'
        };

        Object.keys(statesMap).forEach((status) => {
            const count = tasks.filter(task => task.estado === status).length;
            const column = document.getElementById(statesMap[status]);
            if (column) {
                const badge = column.querySelector('.badge');
                if (badge) badge.textContent = count;
            }
        });
    },

    initializeDragAndDrop() {
        document.querySelectorAll('.task-column').forEach((column) => {
            column.addEventListener('dragover', (event) => event.preventDefault());
            column.addEventListener('drop', (event) => {
                event.preventDefault();
                const taskId = parseInt(event.dataTransfer.getData('text/plain'));
                const newStatus = column.id.replace('column-', '');

                taskManager.updateTask(taskId, newStatus);
                this.moveTaskCard(taskId, column);
            });
        });
    }
};
