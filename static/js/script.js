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
        const storedTasks = localStorage.getItem('tasks');// Lee los eventos guardados como texto
        return storedTasks ? JSON.parse(storedTasks) : [];// Si existen datos se parsean a formato json, si no devolvuelve un array vacio
    }

    saveToStorage() {    // Guarda el array de tareas en formato JSON
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
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
        this.renderTaskCard(newTask); // renderiza la tarjeta 
        this.updateCountersBadges();
        this.saveToStorage(); //guarda las tareas en localstorage
        return newTask; //retorna la nueva tarea
        
    }

    deleteTask(taskId) { //metodo para eliminar la tarea por id
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        const cardElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (cardElement) {
            cardElement.remove();
        }
        this.updateCountersBadges();
        this.saveToStorage();
        
    }

    updateTask(taskId, status) { //metodo para actualizar la tarea por ID
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.estado = status;
            this.saveToStorage();// guardar el nuevo estado en local storage
            this.updateCountersBadges();
        }
        
    }

    assignTask(taskId, assignee) { // metodo para  actualizar la persona asignada
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.responsable = assignee;
            this.saveToStorage();
        }
    }
    
    renderTaskCard(task) { //metodo para renderizar la tarjeta segun el estado 
        const template = document.getElementById('task-card-template'); //obtengo la tarjeta
        const cardClone = template.content.cloneNode(true); // clono el contenido 

        const article = cardClone.querySelector('.task-card');
        article.setAttribute('data-task-id', task.id);

        article.setAttribute('draggable', 'true');//hacer que la tarjeta de tarea sea arrastrable
        article.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id);
        });

        cardClone.querySelector('.card-title').textContent = task.titulo;
        cardClone.querySelector('.card-person').textContent = task.responsable;
        cardClone.querySelector('.card-description').textContent = task.descripcion;  
        cardClone.querySelector('.card-date').textContent = task.fechaDeEntrega;
    


        const deleteBtn = cardClone.querySelector('.btn-delete');// llamo al boton de eliminar en las tarjetas de tareas
        deleteBtn.addEventListener('click', () => {
            this.deleteTask(task.id); //cuando el usuario da click para elimina la tarea
        });

      
        const targetColumn = document.querySelector(`#column-${task.estado} .tasks-list`);  // Seleccionar la columna correspondiente
        if (targetColumn) {
            targetColumn.appendChild(cardClone);//agrega la tajeta con la tarea 
        }
        
    }

    updateCountersBadges() {//metodo para actualizar los contadores en los badges
   
    const statesMap = { // Mapea los estados de las tareas con los IDs de las columnas
        'to-do': 'column-to-do',
        'process': 'column-process',
        'revision': 'column-revision',
        'hecho': 'column-hecho'
    };

    Object.keys(statesMap).forEach(state => { 
        const count = this.getTasksWithStatus(state).length;// Cuenta cuantas tareas tienen los estados   
        const column = document.getElementById(statesMap[state]);// Busca la columna en el DOM y encuentra su badge que tiene cada una
        if (column) {
            const badge = column.querySelector('.badge');
            if (badge) {
                badge.textContent = count; // Actualiza el número en el badge de la columna
            }
        }
    });
}
}

const taskManager = new TaskManager();// Instancia global de la clase  para que sea accesible de manera global
taskManager.getAllTasks().forEach(task => { // obteener las tareas guardadas, recorrerlas 
    taskManager.renderTaskCard(task); // y que se rendericen para que no se borren al recargar la pagina
});
taskManager.updateCountersBadges();


// elementos de DOM y gestion de vistas 

const taskModalElement = document.getElementById('taskModal');
const taskModal = new bootstrap.Modal(taskModalElement); 
const btnOpenModal = document.getElementById('btn-open-modal'); //boton para abrir el modal con el formulario
const btnCancel = document.getElementById('btn-cancel'); // boton cancelar la tarea
const form = document.getElementById('form'); // obtengo el formulario
const formStatus = document.getElementById('form-status'); //estatus del formulario

const fields = { // campos del formulario
    title: document.getElementById('title'),
    person: document.getElementById('person'),
    description: document.getElementById('description'),
    date: document.getElementById('date'),
    state: document.getElementById('state')
};

const errorMessages = { //espacios para los errores
    title: document.getElementById('title-error'),  
    person: document.getElementById('person-error'),
    description: document.getElementById('description-error'),
    date: document.getElementById('date-error'),
    state: document.getElementById('state-error')
};


// Abrir modal con botón "+ Nueva tarea"
btnOpenModal.addEventListener('click', () => {
    form.reset();
    clearAllErrors();
    taskModal.show();
});

btnCancel.addEventListener('click', () => {
    form.reset();
    clearAllErrors();
});

function showError(fieldName, message) {//funcion para mostrar los errores
    fields[fieldName].setAttribute('aria-invalid', 'true'); // indica que un campo en el formulario no se ajusta al formato indicado
    errorMessages[fieldName].textContent = message;
}

function clearError(fieldName) {//funcion para limpiar los errores de un campo
    fields[fieldName].removeAttribute('aria-invalid');
    errorMessages[fieldName].textContent = '';
}

function clearAllErrors() { //funcion para limpiar los errores en todos los campos 
    Object.keys(fields).forEach(field => clearError(field));//obtiene las claves, las recorre y limpia el erro de los campos
    formStatus.textContent = '';// contenido sin  texto
}

function validateTaskForm() { //funcion para validar los campos
    let isValid = true; 
    clearAllErrors();

    const title = fields.title.value.trim();
    const person = fields.person.value.trim();
    const description = fields.description.value.trim();
    const date = fields.date.value.trim();
    const state = fields.state.value.trim();

    
    if (!title) {// Validación de nombre, no puede estar vacio 
        showError('title', 'El campo no puede estar vacío.');
        isValid = false;
    } else if (title.length < 8) { //debe contener mas de 5 caracteres
        showError('title', 'El título debe tener al menos 8 caracteres.');
        isValid = false;
    } else if (title.length > 20) {
    showError('title', 'El título no puede tener más de 20 caracteres.');
    isValid = false;
    }

    if (!person) {//validacion responsable 
        showError('person', 'El campo no puede estar vacío.');
        isValid = false;
    } else if (person.length < 8) {
        showError('person', 'El nombre del responsable debe tener al menos 8 caracteres');
        isValid = false;
    } else if (person.length > 20){
        showError('person', 'El nombre del responsable no puede tener más de 20 caracteres.');
        isValid = false;
    }
      
    if (!description) {  // Validación Descripción
        showError('description', 'El campo no puede estar vacío');
        isValid = false;
    } else if (description.length < 15) {
        showError('description', 'La descripción debe tener al menos 15 caracteres');
        isValid = false;
    } else if (description.length > 60){
        showError('description', 'La descripción no puede tener más de 60 caracteres.');
        isValid = false;
    }

    const now = new Date();
    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
    ].join('-');

    if (!date) {//validacion Fecha no debe estra en blanco ni ser anterior a la actual 
        showError('date', 'Debes ingresar una fecha de entrega');
        isValid = false;
    } else if (date < today) {
        showError('date', 'La fecha de entrega no puede ser anterior al día de hoy');
        isValid = false;
    }

    if (!state) {  // validacion Estado
        showError('state', 'Debes seleccionar una opción de estado');
        isValid = false;
    }

    return isValid; // Devuelve verdadero si los campos son validos , falso si hay errores
}

// conctar el formulario con addTask
form.addEventListener('submit', (event) => {
    event.preventDefault(); // previene la recarga por defecto

    
    if (!validateTaskForm()) {// Si la validación falla, no se agrega la tarea
        return;
    }

    const taskData = {// Si es exitosa, se leen los valores y crea el objeto para TaskManager
        title: fields.title.value.trim(),
        person: fields.person.value.trim(),
        description: fields.description.value.trim(),
        date: fields.date.value.trim(),
        state: fields.state.value.trim()
    };

    taskManager.addTask(taskData);//agrega la tarea
    form.reset(); // resetea el formulario
    clearAllErrors(); //llama la funcion que limpia los errores en el formulario
    document.activeElement.blur();
    taskModal.hide(); //cierra el modal
    

    
});


// validación interactiva en tiempo real mientras el usuario escribe
Object.keys(fields).forEach(fieldName => {
    fields[fieldName].addEventListener('input', () => clearError(fieldName));
    fields[fieldName].addEventListener('change', () => clearError(fieldName));
});

//configurara drag y drop para que las targetas se muevan 
const columns = document.querySelectorAll('.task-column'); // obtiene todas las columnas de las tareas

columns.forEach(column => {    // permitir que la columna acepte el elemento arrastrado
    column.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    column.addEventListener('drop', (e) => {    // manejar cuando se suelta la tarjeta en la columna
        e.preventDefault();

        const taskId = parseInt(e.dataTransfer.getData('text/plain'));//recupera los datos que se estan arrastrando
        const newStatus = column.id.replace('column-', ''); // Obtener el nuevo estado basado en el ID del HTML

        taskManager.updateTask(taskId, newStatus);// actualizar el estado en la clase TaskManager

       //mover visualmente la tarjeta en el DOM a la nueva lista de la columna
        const cardElement = document.querySelector(`[data-task-id="${taskId}"]`);
        const targetList = column.querySelector('.tasks-list');
        
        if (cardElement && targetList) {
            targetList.appendChild(cardElement);

        }
    });
});