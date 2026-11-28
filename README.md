# Flujo — Planificador

Flujo es la interfaz web de un planificador visual para organizar tareas y eventos. Este repositorio contiene únicamente el frontend; el backend se desarrolla en otro repositorio con Spring Boot.

## Funcionalidades

- Tablero Kanban con los estados **Por hacer**, **En proceso**, **En revisión** y **Hecho**.
- Creación, edición, eliminación y cambio de estado de tareas. Las tarjetas se pueden arrastrar entre columnas para actualizar su estado.
- Calendario mensual para consultar, crear, editar, eliminar y mover eventos.
- Formularios de inicio de sesión y registro como interfaz visual.

## el proyecto aun se encuentra en desarrollo el backend esta alojado en otro repositorio 
## Estructura del proyecto

.
├── index.html
├── planner.html
├── calendar.html
├── static/
│   ├── css/
│   │   ├── auth.css
│   │   ├── calendar.css
│   │   └── style.css
│   ├── img/
│   │   ├── Calendario y Checklist .png
│   │   ├── hecho.png
│   │   ├── process.png
│   │   ├── revision.png
│   │   └── to-do.png
│   └── js/
│       ├── app.js
│       ├── auth.js
│       ├── eventForm.js
│       ├── eventStorage.js
│       ├── eventView.js
│       ├── taskCalendar.js
│       ├── taskForm.js
│       ├── taskStorage.js
│       ├── taskView.js
│       └── taskmanager.js
└── .vscode/
    └── settings.json

## Páginas

- **`index.html`**: pantalla de bienvenida con formularios para iniciar sesión o crear una cuenta. Incluye un enlace para abrir el planner de prueba.
- **`planner.html`**: tablero Kanban, formulario de tareas y panel lateral que muestra el calendario.
- **`calendar.html`**: calendario interactivo y formularios para administrar eventos. Se puede abrir dentro del panel lateral del planner.

### JavaScript (`static/js/`)

- **`app.js`**: inicializa los módulos disponibles cuando el DOM está listo; conecta la vista y el formulario de tareas o eventos según la página.
- **`auth.js`**: alterna entre los modos de inicio de sesión y registro, valida el nombre y permite mostrar u ocultar la contraseña. No envía credenciales a un servidor.
- **`taskmanager.js`**: administra el ciclo de vida de las tareas, sus estados e identificadores, y coordina almacenamiento y representación.
- **`taskStorage.js`**: lee y guarda tareas en `localStorage` bajo la clave `tasks`.
- **`taskForm.js`**: inicializa el formulario de tareas, valida sus campos y gestiona la creación y edición.
- **`taskView.js`**: representa las tarjetas, actualiza los contadores y permite mover tarjetas entre columnas mediante arrastrar y soltar.
- **`taskCalendar.js`**: implementa `CalendarManager`, que administra los eventos del calendario y sincroniza los cambios con FullCalendar y `localStorage`.
- **`eventStorage.js`**: lee y guarda eventos en `localStorage` bajo la clave `events`.
- **`eventForm.js`**: valida y gestiona los formularios para crear y editar eventos.
- **`eventView.js`**: inicializa FullCalendar, presenta los detalles de un evento y conecta las acciones de edición y eliminación.

### Estilos e imágenes

- **`static/css/auth.css`**: estilos de la pantalla de acceso y registro, incluidos sus ajustes para pantallas pequeñas.
- **`static/css/style.css`**: estilos compartidos del planner, tablero, tarjetas, botones y panel lateral.
- **`static/css/calendar.css`**: ajustes visuales complementarios del calendario.
- **`static/img/to-do.png`**, **`process.png`**, **`revision.png`** y **`hecho.png`**: ilustraciones de fondo para las columnas del tablero.
- **`static/img/Calendario y Checklist .png`**: imagen adicional de calendario y lista de tareas.
- **`.vscode/settings.json`**: configura el puerto `5501` para la extensión Live Server de Visual Studio Code.

## Tecnologías

- **HTML5**, **CSS3** y **JavaScript** sin framework de frontend ni paso de compilación.
- **Bootstrap 5.3.3** para componentes y estilos, y **Bootstrap Icons 1.13.2** para iconos.
- **FullCalendar 7.1.3** para la vista de calendario.
- **Google Fonts**: DM Sans, Inter e Inter Tight.
- **`localStorage`** como almacenamiento local temporal para tareas y eventos.
- **Backend asociado, en otro repositorio:** Spring Boot. La conexión entre este frontend y dicho backend está pendiente.

Bootstrap, Bootstrap Icons, FullCalendar y las fuentes se cargan desde CDN, por lo que se necesita conexión a internet para obtener esos recursos.

## Cómo ejecutar

No se requiere instalar dependencias ni compilar el proyecto.

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Instala o habilita la extensión **Live Server**, si todavía no está disponible.
3. Haz clic derecho en `index.html` y selecciona **Open with Live Server**.
4. Abre el planner desde el enlace **Abrir el planner de prueba**. También puedes visitar `planner.html` directamente en el mismo servidor.

La configuración del proyecto establece el puerto `5501`; la dirección habitual será `http://127.0.0.1:5501/`. Se recomienda usar un servidor local en lugar de abrir los HTML directamente como archivos, ya que las páginas enlazan recursos locales y el planner carga el calendario dentro de un `iframe`.
