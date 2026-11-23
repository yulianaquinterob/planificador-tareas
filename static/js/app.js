document.addEventListener('DOMContentLoaded', () => {//disparar el evento cuando el dom este listo
    if (typeof taskManager !== 'undefined') {//si taskManager es diferente a undefined
        taskManager.getAllTasks().forEach(task => taskView.renderTaskCard(task));//obtiene todas las tareas, recorre y renderiza las cards
        taskView.updateCountersBadges(taskManager.getAllTasks());//
        taskForm.initialize();
        taskView.initializeDragAndDrop();
    }

    if (typeof calendarManager !== 'undefined') {
        eventView.initialize(calendarManager);
        eventForm.initialize();
    }
});
