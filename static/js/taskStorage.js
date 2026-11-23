const taskStorage = {
    load() {
        const storedTasks = localStorage.getItem('tasks');
        return storedTasks ? JSON.parse(storedTasks) : [];
    },

    save(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
};
