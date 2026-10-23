class TaskManager { // crea la clase
    constructor() { // constructor de la clase
        this.tasks = []; // lista para guardar las tareas las tareas
        this.currentId = 1; // Contador para ID único incrementable, 
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
            nombre: taskData.title, //agrega el titulo
            descripcion: taskData.description, //agreag la descripcion
            responsable: taskData.person, //agrega la persona responsable del proyecto
            fechaDeEntrega: taskData.date, // agrega la fecha de entrega
            estado: taskData.state // agrega el estado
        };

        this.tasks.push(newTask); // agrega a la lista la tarea
        this.renderTaskCard(newTask); // renderiza la tarjeta 
        return newTask; //retorna la nueva tarea
    }

    deleteTask(taskId) { //metodo para eliminar la tarea por id
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        const cardElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (cardElement) {
            cardElement.remove();
        }
    }

    updateTask(taskId, status) { //metodo para actualizar la tarea por ID
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.estado = status;
        }
    }

    assignTask(taskId, assignee) { // metodo para  actualizar la persona asignada
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.responsable = assignee;
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

        cardClone.querySelector('.card-title').textContent = task.nombre;
        cardClone.querySelector('.card-description').textContent = task.descripcion;
        cardClone.querySelector('.card-person').textContent = task.responsable;
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
}

// Instancia global del gestor de tareas
const taskManager = new TaskManager();

// elementos de DOM y gestion de vistas 

const dashboardView = document.getElementById('dashboard-view');// dashboard principal
const formView = document.getElementById('form-view');//vista para el formulario que esta oculto por defecto
const navAgregar = document.getElementById('nav-agregar');//navbar para agragar la tarea
const navInicio = document.getElementById('nav-inicio'); // navbar para inicio
const btnCancel = document.getElementById('btn-cancel'); // boton cancelar la tarea

const form = document.getElementById('form'); // obtengo el formulario
const formStatus = document.getElementById('form-status'); //

const fields = { // campos del formulario
    title: document.getElementById('title'),
    description: document.getElementById('description'),
    person: document.getElementById('person'),
    date: document.getElementById('date'),
    state: document.getElementById('state')
};

const errorMessages = { //espacios para los errores
    title: document.getElementById('title-error'),
    description: document.getElementById('description-error'),
    person: document.getElementById('person-error'),
    date: document.getElementById('date-error'),
    state: document.getElementById('state-error')
};


navAgregar.addEventListener('click', (e) => {// Navegación entre vistas del dashboard y el formulario
    e.preventDefault();
    dashboardView.classList.add('hidden');
    formView.classList.remove('hidden');
});

function returnToDashboard() {
    form.reset();
    clearAllErrors();
    formView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
}

navInicio.addEventListener('click', (e) => {
    e.preventDefault();
    returnToDashboard();
});

btnCancel.addEventListener('click', () => {
    returnToDashboard();
});

function showError(fieldName, message) {//funcion para mostrar los errores
    fields[fieldName].setAttribute('aria-invalid', 'true');
    errorMessages[fieldName].textContent = message;
}

function clearError(fieldName) {//funcion para limpiar los errores de un campo
    fields[fieldName].removeAttribute('aria-invalid');
    errorMessages[fieldName].textContent = '';
}

function clearAllErrors() { //funcion para limpiar los errores en todos los campos 
    Object.keys(fields).forEach(field => clearError(field));
    formStatus.textContent = '';
}

function validateTaskForm() { //funcion para validar los campos
    let isValid = true; 
    clearAllErrors();

    const title = fields.title.value.trim();
    const description = fields.description.value.trim();
    const person = fields.person.value.trim();
    const date = fields.date.value.trim();
    const state = fields.state.value.trim();

    
    if (!title) {// Validación de nombre, no puede estar vacio 
        showError('title', 'El campo no puede estar vacío.');
        isValid = false;
    } else if (title.length <= 5) { //debe contener mas de 5 caracteres
        showError('title', 'El título debe tener más de 5 caracteres.');
        isValid = false;
    } else if (title.length > 20) {
    showError('title', 'El título no puede tener más de 20 caracteres.');
    isValid = false;
    }

  
    if (!description) {  // Validación Descripción
        showError('description', 'El campo no puede estar vacío.');
        isValid = false;
    } else if (description.length <= 10) {
        showError('description', 'La descripción debe tener más de 10 caracteres.');
        isValid = false;
    } else if (description.length > 60){
        showError('La descripcion no puede tener más de 60 caracteres');
        isValid = false;
    }

    if (!person) {//validacion responsable 
        showError('person', 'El campo no puede estar vacío.');
        isValid = false;
    } else if (person.length <= 3) {
        showError('person', 'El nombre del responsable debe tener más de 3 caracteres.');
        isValid = false;
    } else if (person.length > 25){
        showError('El nombre del encargado no puede tener más de 25 caracteres');
        isValid = false;
    }

    const today = new Date().toISOString().split('T')[0]; // obtiene la fecha actual 

    if (!date) {//validacion Fecha no debe estra en blanco ni ser anterior a la actual 
        showError('date', 'Debes ingresar una fecha de entrega.');
        isValid = false;
    } else if (date < today) {
        showError('date', 'La fecha de entrega no puede ser anterior al día de hoy.');
        isValid = false;
    }

    if (!state) {  // validacion Estado
        showError('state', 'Debes seleccionar una opción de estado.');
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
        description: fields.description.value.trim(),
        person: fields.person.value.trim(),
        date: fields.date.value.trim(),
        state: fields.state.value.trim()
    };

    taskManager.addTask(taskData);
    returnToDashboard();// regresa al tablero de forma automática tras agregar con éxito
});

// validación interactiva en tiempo real mientras el usuario escribe
Object.keys(fields).forEach(fieldName => {
    fields[fieldName].addEventListener('input', () => clearError(fieldName));
    fields[fieldName].addEventListener('change', () => clearError(fieldName));
});

//configurara drag y drop para que las targetas se muevan 
const columns = document.querySelectorAll('.task-column');

columns.forEach(column => {    // permitir que la columna acepte el elemento arrastrado
    column.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    column.addEventListener('drop', (e) => {    // manejar cuando se suelta la tarjeta en la columna
        e.preventDefault();
        
        const taskId = parseInt(e.dataTransfer.getData('text/plain'));// obtener el ID de la tarea que se esta moviendo
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