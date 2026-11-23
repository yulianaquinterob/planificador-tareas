const taskForm = {
    editingTaskId: null,
    modalElement: null,
    modal: null,

    initialize() {
        this.modalElement = document.getElementById('taskModal');
        this.modal = new bootstrap.Modal(this.modalElement);

        this.label = document.getElementById('taskModalLabel');
        this.submitButton = document.getElementById('btn-save-task');
        this.openButton = document.getElementById('btn-open-modal');
        this.cancelButton = document.getElementById('btn-cancel');
        this.form = document.getElementById('form');
        this.status = document.getElementById('form-status');

        this.fields = {
            title: document.getElementById('title'),
            person: document.getElementById('person'),
            description: document.getElementById('description'),
            date: document.getElementById('date'),
            state: document.getElementById('state')
        };

        this.errorMessages = {
            title: document.getElementById('title-error'),
            person: document.getElementById('person-error'),
            description: document.getElementById('description-error'),
            date: document.getElementById('date-error'),
            state: document.getElementById('state-error')
        };

        this.openButton.addEventListener('click', () => this.openForCreate());
        this.cancelButton.addEventListener('click', () => {
            this.editingTaskId = null;
            this.form.reset();
            this.clearAllErrors();
        });

        this.form.addEventListener('submit', (event) => this.submit(event));

        Object.keys(this.fields).forEach((fieldName) => {
            this.fields[fieldName].addEventListener('input', () => this.clearError(fieldName));
            this.fields[fieldName].addEventListener('change', () => this.clearError(fieldName));
        });
    },

    openForCreate() {
        this.editingTaskId = null;
        this.label.textContent = 'Nueva Tarea';
        this.submitButton.textContent = 'Guardar Tarea';
        this.form.reset();
        this.clearAllErrors();
        this.modal.show();
    },

    openForEdit(task) {
        this.editingTaskId = task.id;
        this.fields.title.value = task.titulo;
        this.fields.person.value = task.responsable;
        this.fields.description.value = task.descripcion;
        this.fields.date.value = task.fechaDeEntrega;
        this.fields.state.value = task.estado;
        this.label.textContent = 'Actualizar tarea';
        this.submitButton.textContent = 'Guardar cambios';
        this.clearAllErrors();
        this.modal.show();
    },

    showError(fieldName, message) {
        this.fields[fieldName].setAttribute('aria-invalid', 'true');
        this.errorMessages[fieldName].textContent = message;
    },

    clearError(fieldName) {
        this.fields[fieldName].removeAttribute('aria-invalid');
        this.errorMessages[fieldName].textContent = '';
    },

    clearAllErrors() {
        Object.keys(this.fields).forEach((fieldName) => this.clearError(fieldName));
        this.status.textContent = '';
    },

    validate() {
        let isValid = true;
        this.clearAllErrors();

        const title = this.fields.title.value.trim();
        const person = this.fields.person.value.trim();
        const description = this.fields.description.value.trim();
        const date = this.fields.date.value.trim();
        const state = this.fields.state.value.trim();

        if (!title) {
            this.showError('title', 'El campo no puede estar vacío.');
            isValid = false;
        } else if (title.length < 8) {
            this.showError('title', 'El título debe tener al menos 8 caracteres.');
            isValid = false;
        } else if (title.length > 30) {
            this.showError('title', 'El título no puede tener más de 20 caracteres.');
            isValid = false;
        }

        if (!person) {
            this.showError('person', 'El campo no puede estar vacío.');
            isValid = false;
        } else if (person.length < 8) {
            this.showError('person', 'El nombre del responsable debe tener al menos 8 caracteres');
            isValid = false;
        } else if (person.length > 20) {
            this.showError('person', 'El nombre del responsable no puede tener más de 20 caracteres.');
            isValid = false;
        }

        if (!description) {
            this.showError('description', 'El campo no puede estar vacío');
            isValid = false;
        } else if (description.length < 15) {
            this.showError('description', 'La descripción debe tener al menos 15 caracteres');
            isValid = false;
        } else if (description.length > 60) {
            this.showError('description', 'La descripción no puede tener más de 60 caracteres.');
            isValid = false;
        }

        const now = new Date();
        const today = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0')
        ].join('-');

        if (!date) {
            this.showError('date', 'Debes ingresar una fecha de entrega');
            isValid = false;
        } else if (date < today && (this.editingTaskId === null || date !== taskManager.getAllTasks()
            .find(task => Number(task.id) === Number(this.editingTaskId))?.fechaDeEntrega)) {
            this.showError('date', 'La fecha de entrega no puede ser anterior al día de hoy');
            isValid = false;
        }

        if (!state) {
            this.showError('state', 'Debes seleccionar una opción de estado');
            isValid = false;
        }

        return isValid;
    },

    submit(event) {
        event.preventDefault();
        if (!this.validate()) return;

        const taskData = {
            title: this.fields.title.value.trim(),
            person: this.fields.person.value.trim(),
            description: this.fields.description.value.trim(),
            date: this.fields.date.value.trim(),
            state: this.fields.state.value.trim()
        };

        try {
            if (this.editingTaskId === null) {
                taskManager.addTask(taskData);
            } else {
                const updatedTask = taskManager.updateTaskDetails(this.editingTaskId, taskData);
                if (!updatedTask) {
                    this.status.textContent = 'No se encontró la tarea que intentas actualizar.';
                    return;
                }
            }
        } catch (error) {
            this.status.textContent = 'No se pudo guardar la tarea. Inténtalo de nuevo.';
            console.error('No se pudo guardar la tarea.', error);
            return;
        }

        this.editingTaskId = null;
        this.form.reset();
        this.clearAllErrors();
        if (document.activeElement) document.activeElement.blur();
        this.modal.hide();
    }
};

function openTaskForEdit(task) {
    taskForm.openForEdit(task);
}
