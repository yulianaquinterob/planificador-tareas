class TaskManager { // crea la clase
    constructor() { // constructor de la clase
        this.tasks = this.loadFromStorage(); // array para guardar las tareas 
        if (!Array.isArray(this.tasks)) {// Verifica que los datos tengan el formato esperado 
            throw new Error('Los datos guardados de tareas no tienen un formato válido.');// si el formato es diferente de array muestra mensaje
        }
        //recorre la lista de tareas y busca el id mas alto para no repetir identificadores
        const maxId = this.tasks.reduce((max, task) => Math.max(max, Number(task && task.id) || 0), 0);
        this.currentId = maxId + 1; // asegura que el siguiente id sea mayor al guardado
    }
      
    loadFromStorage() {
        return taskStorage.load();
    }

    saveToStorage(tasks = this.tasks) {    // Guarda el array de tareas en formato JSON
        taskStorage.save(tasks);
    }

    getAllTasks() { //metodo que retorna todas las tareas que he guardoado
        return this.tasks;  
    }

    getTasksWithStatus(status) { //metodo para obtener  las tareas filtradas por estados
        return this.tasks.filter(task => task.estado === status);
    }

    addTask(taskData) { //metodo para agragar las tareas a la lista
        const newTask = {
            id: this.currentId++, //autoincrementa el id
            titulo: taskData.title, //agrega el titulo
            responsable: taskData.person,//agrega la persona responsable del proyecto
            descripcion: taskData.description, //agreag la descripcion
            fechaDeEntrega: taskData.date, // agrega la fecha de entrega
            estado: taskData.state // agrega el estado
        };

        this.tasks.push(newTask); // agrega a la lista la tarea
        taskView.renderTaskCard(newTask); // renderiza la tarjeta 
        taskView.updateCountersBadges(this.tasks); //actualizar el contador 
        this.saveToStorage(); //guarda las tareas en localstorage
        return newTask; //retorna la nueva tarea
        
    }

    // Actualiza los datos de una tarea, persiste los cambios y vuelve a dibujar su tarjeta.
    updateTaskDetails(taskId, taskData) {
        const task = this.tasks.find(savedTask => Number(savedTask.id) === Number(taskId));
        if (!task) {
            return null;
        }

        const updatedTask = {
            ...task,
            titulo: taskData.title,
            responsable: taskData.person,
            descripcion: taskData.description,
            fechaDeEntrega: taskData.date,
            estado: taskData.state
        };
        const updatedTasks = this.tasks.map(savedTask => savedTask === task ? updatedTask : savedTask);

        this.saveToStorage(updatedTasks);
        this.tasks = updatedTasks;
        taskView.removeTaskCard(taskId);
        taskView.renderTaskCard(updatedTask);
        taskView.updateCountersBadges(this.tasks);
        return updatedTask;
    }

    deleteTask(taskId) { //metodo para eliminar la tarea por id
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        taskView.removeTaskCard(taskId);
        taskView.updateCountersBadges(this.tasks);
        this.saveToStorage();
        
    }

    // Cambia el estado de una tarea (por ejemplo, al moverla a otra columna).
    updateTask(taskId, status) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.estado = status;
            this.saveToStorage();// guardar el nuevo estado en local storage
            taskView.updateCountersBadges(this.tasks);
        }
        
    }

    assignTask(taskId, assignee) { // metodo para  actualizar la persona asignada
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.responsable = assignee;
            this.saveToStorage();
        }
    }
}

const taskManager = new TaskManager();// Instancia global de la clase  para que sea accesible de manera global
window.taskManager = taskManager;