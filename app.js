// OrganizApp - Lógica JavaScript - Updated 2024-12-19
const STORAGE_KEY = 'miDiarioAsistenteData';
const FOLDERS_STORAGE_KEY = 'organizappFoldersData';
let items = [];
let folders = []; // Array para almacenar las carpetas simples
let selectedFolderId = null; // ID de la carpeta actualmente seleccionada
let currentView = 'todo'; // 'todo', 'calendar', 'folders'
let currentFolderView = 'list'; // 'list' para lista de carpetas, 'content' para contenido de carpeta
let authReady = false; // Flag para asegurar que la app está lista
const userId = 'local_user_default'; // ID de usuario local para localStorage

// Variables del calendario
let currentDate = new Date();
let selectedDate = null;
let editingFolderId = null;

// Variables del usuario y filtrado
let currentUser = null;
let currentCategory = 'all'; // 'all', 'notes', 'tasks', 'shopping', 'reminders'
let editingItemId = null; // ID del elemento que se está editando

// Referencias del DOM
const itemList = document.getElementById('item-list');
const fab = document.getElementById('fab');
const modal = document.getElementById('input-modal');
const universalInput = document.getElementById('universal-input');
const addBtn = document.getElementById('add-btn');
const cancelBtn = document.getElementById('cancel-btn');
const summaryElement = document.getElementById('daily-summary');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const systemMessage = document.getElementById('system-message');
const typeSelector = document.getElementById('type-selector');
const statusSelector = document.getElementById('status-selector');
const folderSelector = document.getElementById('folder-selector');
const colorSelector = document.getElementById('color-selector');
const dateSelector = document.getElementById('date-selector');
const homeViewBtn = document.getElementById('home-view-btn');
const calendarViewBtn = document.getElementById('calendar-view-btn');
const foldersViewBtn = document.getElementById('folders-view-btn');
const filterDropdownContainer = document.getElementById('filter-dropdown-container');
const categoryFilter = document.getElementById('category-filter');
const todoView = document.getElementById('list-view'); // Mantener referencia para compatibilidad
const calendarView = document.getElementById('calendar-view');
const foldersMainView = document.getElementById('folders-main-view');
const calendarGrid = document.getElementById('calendar-grid');
const calendarMonthYear = document.getElementById('calendar-month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const dayDetails = document.getElementById('day-details');
const selectedDayTitle = document.getElementById('selected-day-title');
const selectedDayItems = document.getElementById('selected-day-items');

// Referencias para carpetas
const foldersList = document.getElementById('folders-list');
const folderContent = document.getElementById('folder-content');
const folderItemsList = document.getElementById('folder-items-list');
const backToFoldersBtn = document.getElementById('back-to-folders-btn');
const createFolderBtn = document.getElementById('create-folder-btn');
const selectedFolderTitle = document.getElementById('selected-folder-title');

// Referencias para modales de carpetas
const createFolderModal = document.getElementById('create-folder-modal');
const editFolderModal = document.getElementById('edit-folder-modal');
const folderNameInput = document.getElementById('folder-name-input');
const folderDescriptionInput = document.getElementById('folder-description-input');
const folderColorSelector = document.getElementById('folder-color-selector');
const editFolderColorSelector = document.getElementById('edit-folder-color-selector');
const deleteFolderBtn = document.getElementById('delete-folder-btn');
const editFolderNameInput = document.getElementById('edit-folder-name-input');
const editFolderDescriptionInput = document.getElementById('edit-folder-description-input');

// Referencias para registro de usuario
const userRegistrationModal = document.getElementById('user-registration-modal');
const userNameInput = document.getElementById('user-name-input');
const saveNameBtn = document.getElementById('save-name-btn');
const dailyWelcomeModal = document.getElementById('daily-welcome-modal');
const welcomeTitle = document.getElementById('welcome-title');
const welcomeMessage = document.getElementById('welcome-message');
const closeWelcomeBtn = document.getElementById('close-welcome-btn');

// Referencias para modal de edición
const editModal = document.getElementById('edit-modal');
const editContentInput = document.getElementById('edit-content-input');
const editTypeSelector = document.getElementById('edit-type-selector');
const editStatusSelector = document.getElementById('edit-status-selector');
const editFolderSelector = document.getElementById('edit-folder-selector');
const editFolderLabel = document.getElementById('edit-folder-label');
const editColorSelector = document.getElementById('edit-color-selector');
const editDateSelector = document.getElementById('edit-date-selector');
const editCancelBtn = document.getElementById('edit-cancel-btn');
const editSaveBtn = document.getElementById('edit-save-btn');

// --- SISTEMA DE NOTIFICACIONES DE RECORDATORIOS ---

/** Configuración de notificaciones */
const NOTIFICATION_TIMES = [
    { label: '24 horas antes', minutes: 24 * 60 },
    { label: '12 horas antes', minutes: 12 * 60 },
    { label: '2 horas antes', minutes: 2 * 60 },
    { label: '30 minutos antes', minutes: 30 },
    { label: '5 minutos antes', minutes: 5 },
    { label: 'En el momento', minutes: 0 }
];

/** Almacena los timeouts de notificaciones activas */
let activeNotificationTimeouts = new Map();

/** Actualiza el estado de las notificaciones en la UI */
function updateNotificationStatus() {
    const statusElement = document.getElementById('notification-status');
    const iconElement = document.getElementById('notification-icon');
    const textElement = document.getElementById('notification-text');
    
    if (!statusElement || !iconElement || !textElement) return;
    
    if ('Notification' in window) {
        switch (Notification.permission) {
            case 'granted':
                iconElement.textContent = '🔔';
                textElement.textContent = 'Notificaciones activas';
                statusElement.className = 'flex items-center space-x-2 px-3 py-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium';
                break;
            case 'denied':
                iconElement.textContent = '🔕';
                textElement.textContent = 'Notificaciones bloqueadas';
                statusElement.className = 'flex items-center space-x-2 px-3 py-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium';
                break;
            case 'default':
                iconElement.textContent = '🔔';
                textElement.textContent = 'Permitir notificaciones';
                statusElement.className = 'flex items-center space-x-2 px-3 py-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm font-medium cursor-pointer';
                statusElement.onclick = requestNotificationPermission;
                break;
        }
    } else {
        iconElement.textContent = '❌';
        textElement.textContent = 'No soportado';
        statusElement.className = 'flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium';
    }
}

/** Controla la visibilidad del botón FAB según el scroll */
function handleScrollVisibility() {
    const fabButton = document.getElementById('fab');
    if (!fabButton) return;
    
    // No ocultar el FAB cuando estamos en la vista de carpetas
    if (currentView === 'folders') {
        fabButton.style.transform = 'translateY(0)';
        fabButton.style.opacity = '1';
        return;
    }
    
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Si estamos cerca del final de la página (últimos 200px), ocultar el botón
    if (scrollY + windowHeight >= documentHeight - 200) {
        fabButton.style.transform = 'translateY(100px)';
        fabButton.style.opacity = '0';
    } else {
        fabButton.style.transform = 'translateY(0)';
        fabButton.style.opacity = '1';
    }
}

/** Event listeners para botones de limpiar hora */
document.addEventListener('click', (e) => {
    if (e.target.id === 'clear-time-btn') {
        document.getElementById('time-selector').value = '';
    }
    if (e.target.id === 'clear-edit-time-btn') {
        document.getElementById('edit-time-selector').value = '';
    }
});

/** Asegura que el botón FAB esté visible */
function ensureFabVisibility() {
    const fabButton = document.getElementById('fab');
    if (!fabButton) return;
    
    // Asegurar que el botón esté visible
    fabButton.style.display = 'flex';
    fabButton.style.visibility = 'visible';
    fabButton.style.opacity = '1';
    fabButton.style.transform = 'translateY(0)';
    fabButton.style.zIndex = '1000';
    
    console.log('FAB visibility ensured');
}

/** Event listener para scroll */
window.addEventListener('scroll', handleScrollVisibility);

/** Programa todas las notificaciones para un recordatorio */
function scheduleReminderNotifications(item) {
    // Solo programar notificaciones si es un recordatorio CON hora específica
    if (item.type !== 'Recordatorio' || !item.time || !item.date) {
        return;
    }
    
    // Limpiar notificaciones anteriores si existen
    clearReminderNotifications(item.id);
    
    // Crear fecha y hora del recordatorio
    const reminderDateTime = new Date(`${item.date}T${item.time}`);
    const now = new Date();
    
    // Si el recordatorio ya pasó, no programar notificaciones
    if (reminderDateTime <= now) {
        return;
    }
    
    // Programar cada tipo de notificación
    NOTIFICATION_TIMES.forEach(({ label, minutes }) => {
        const notificationTime = new Date(reminderDateTime.getTime() - (minutes * 60 * 1000));
        
        // Solo programar si la notificación es en el futuro
        if (notificationTime > now) {
            const timeoutId = setTimeout(() => {
                showReminderNotification(item, label);
            }, notificationTime.getTime() - now.getTime());
            
            // Guardar el timeout para poder cancelarlo después
            const key = `${item.id}-${minutes}`;
            activeNotificationTimeouts.set(key, timeoutId);
        }
    });
}

/** Muestra una notificación de recordatorio */
function showReminderNotification(item, timeLabel) {
    const title = `⏰ Recordatorio: ${item.content}`;
    const body = `Programado para: ${timeLabel}`;
    
    // Notificación del navegador
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: './icons/logo-1.png',
            badge: './icons/logo-1.png',
            tag: `reminder-${item.id}`,
            requireInteraction: true
        });
        
        // Cerrar la notificación después de 10 segundos
        setTimeout(() => {
            notification.close();
        }, 10000);
    }
    
    // También mostrar mensaje en la app
    showSystemMessage(`🔔 ${title} - ${body}`, 'info');
    
    // Reproducir sonido si está disponible
    playNotificationSound();
}

/** Reproduce un sonido de notificación */
function playNotificationSound() {
    try {
        // Crear un tono simple usando Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('No se pudo reproducir el sonido de notificación:', error);
    }
}

/** Limpia las notificaciones programadas para un recordatorio */
function clearReminderNotifications(itemId) {
    NOTIFICATION_TIMES.forEach(({ minutes }) => {
        const key = `${itemId}-${minutes}`;
        const timeoutId = activeNotificationTimeouts.get(key);
        if (timeoutId) {
            clearTimeout(timeoutId);
            activeNotificationTimeouts.delete(key);
        }
    });
}

/** Programa notificaciones para todos los recordatorios activos */
function scheduleAllReminderNotifications() {
    const reminders = items.filter(item => 
        item.type === 'Recordatorio' && 
        item.time && // Solo recordatorios CON hora específica
        item.date &&
        (item.status === 'pending' || item.status === 'in-progress')
    );
    
    reminders.forEach(reminder => {
        scheduleReminderNotifications(reminder);
    });
}

/** Verifica y programa notificaciones cuando se agrega o actualiza un elemento */
function handleReminderNotifications(item) {
    if (item.type === 'Recordatorio' && item.time && item.date) {
        scheduleReminderNotifications(item);
    } else {
        // Si no es un recordatorio, limpiar notificaciones anteriores
        clearReminderNotifications(item.id);
    }
}

// --- FIN SISTEMA DE NOTIFICACIONES ---

/** Muestra un mensaje temporal en la UI. */
function showSystemMessage(message, type = 'success') {
    systemMessage.textContent = message;
    systemMessage.classList.remove('hidden', 'bg-green-500', 'bg-red-500', 'bg-blue-500');
    systemMessage.classList.add(type === 'error' ? 'bg-red-500' : 'bg-green-500', 'opacity-100');

    setTimeout(() => {
        systemMessage.classList.add('hidden');
        systemMessage.classList.remove('opacity-100');
    }, 3000);
}

/** Guarda el nombre del usuario en localStorage */
function saveUserName(name) {
    localStorage.setItem('userName', name);
    currentUser = name;
}

/** Carga el nombre del usuario desde localStorage */
function loadUserName() {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
        currentUser = savedName;
        return true;
    }
    return false;
}

/** Genera mensajes de bienvenida personalizados */
function generateWelcomeMessage() {
    if (!currentUser) return null;

    const hour = new Date().getHours();
    const today = new Date().toISOString().split('T')[0];
    
    // Obtener solo tareas y recordatorios del día (excluir notas y compras)
    const todayItems = items.filter(item => item.date === today);
    const pendingTasks = todayItems.filter(item => item.type === 'Tarea' && item.status === 'pending');
    const reminders = todayItems.filter(item => item.type === 'Recordatorio');

    // Saludo según la hora
    let greeting = '';
    if (hour < 12) {
        greeting = '¡Buenos días';
    } else if (hour < 18) {
        greeting = '¡Buenas tardes';
    } else {
        greeting = '¡Buenas noches';
    }

    let message = `<div class="space-y-4">
        <p class="text-xl font-semibold text-center">${greeting}, <span class="text-primary-blue">${currentUser}</span>! 👋</p>
    `;

    // Mostrar solo 2 tareas pendientes máximo
    if (pendingTasks.length > 0) {
        message += `<div class="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
            <p class="font-medium text-blue-800 dark:text-blue-200 mb-2">📋 Tareas pendientes:</p>
            <ul class="space-y-1">`;
        pendingTasks.slice(0, 2).forEach(task => {
            message += `<li class="text-sm text-blue-700 dark:text-blue-300">• ${task.content}</li>`;
        });
        if (pendingTasks.length > 2) {
            message += `<li class="text-sm text-blue-600 dark:text-blue-400 font-medium">... y ${pendingTasks.length - 2} más</li>`;
        }
        message += `</ul></div>`;
    }

    // Mostrar solo 2 recordatorios máximo
    if (reminders.length > 0) {
        message += `<div class="bg-red-50 dark:bg-red-900 p-3 rounded-lg">
            <p class="font-medium text-red-800 dark:text-red-200 mb-2">⏰ Recordatorios:</p>
            <ul class="space-y-1">`;
        reminders.slice(0, 2).forEach(reminder => {
            message += `<li class="text-sm text-red-700 dark:text-red-300">• ${reminder.content}</li>`;
        });
        if (reminders.length > 2) {
            message += `<li class="text-sm text-red-600 dark:text-red-400 font-medium">... y ${reminders.length - 2} más</li>`;
        }
        message += `</ul></div>`;
    }

    // Tip del día (que cambia realmente una vez por día)
    const dailyTip = getDailyTip();
    message += `<div class="bg-yellow-50 dark:bg-yellow-900 p-3 rounded-lg">
        <p class="text-sm text-yellow-800 dark:text-yellow-200">${dailyTip}</p>
    </div>`;

    message += `</div>`;

    return message;
}

/** Obtiene el tip del día que cambia realmente una vez por día */
function getDailyTip() {
    const today = new Date().toISOString().split('T')[0];
    const lastTipDate = localStorage.getItem('lastTipDate');
    const lastTipIndex = localStorage.getItem('lastTipIndex');
    
    // Si es un nuevo día o no hay tip guardado, generar uno nuevo
    if (lastTipDate !== today || !lastTipIndex) {
        const dailyTips = [
            '💡 <strong>Tip del día:</strong> Organiza tus tareas por prioridad para ser más eficiente.',
            '💡 <strong>Tip del día:</strong> Toma descansos regulares para mantener tu energía.',
            '💡 <strong>Tip del día:</strong> Celebra cada logro, por pequeño que sea.',
            '💡 <strong>Tip del día:</strong> Mantén tu espacio de trabajo organizado.',
            '💡 <strong>Tip del día:</strong> Una tarea a la vez, un día a la vez.',
            '💡 <strong>Tip del día:</strong> La consistencia es más importante que la perfección.',
            '💡 <strong>Tip del día:</strong> Anota tus ideas inmediatamente para no olvidarlas.',
            '💡 <strong>Tip del día:</strong> Dedica tiempo a planificar tu día cada mañana.',
            '💡 <strong>Tip del día:</strong> Elimina distracciones durante las tareas importantes.',
            '💡 <strong>Tip del día:</strong> Revisa tu progreso al final del día.',
            '💡 <strong>Tip del día:</strong> Mantén una actitud positiva ante los desafíos.',
            '💡 <strong>Tip del día:</strong> Aprende algo nuevo cada día.',
            '💡 <strong>Tip del día:</strong> Practica la gratitud por lo que has logrado.',
            '💡 <strong>Tip del día:</strong> Establece metas realistas y alcanzables.',
            '💡 <strong>Tip del día:</strong> Usa la técnica Pomodoro para mantener el enfoque.',
            '💡 <strong>Tip del día:</strong> Delega tareas cuando sea posible.',
            '💡 <strong>Tip del día:</strong> Mantén un equilibrio entre trabajo y descanso.',
            '💡 <strong>Tip del día:</strong> Visualiza el éxito antes de empezar.',
            '💡 <strong>Tip del día:</strong> Aprende de los errores y sigue adelante.',
            '💡 <strong>Tip del día:</strong> Rodéate de personas que te inspiren.'
        ];
        
        // Seleccionar un tip aleatorio diferente al anterior
        let newTipIndex;
        do {
            newTipIndex = Math.floor(Math.random() * dailyTips.length);
        } while (newTipIndex === parseInt(lastTipIndex) && dailyTips.length > 1);
        
        // Guardar el nuevo tip para el día
        localStorage.setItem('lastTipDate', today);
        localStorage.setItem('lastTipIndex', newTipIndex.toString());
        
        return dailyTips[newTipIndex];
    }
    
    // Si es el mismo día, devolver el tip guardado
    const dailyTips = [
        '💡 <strong>Tip del día:</strong> Organiza tus tareas por prioridad para ser más eficiente.',
        '💡 <strong>Tip del día:</strong> Toma descansos regulares para mantener tu energía.',
        '💡 <strong>Tip del día:</strong> Celebra cada logro, por pequeño que sea.',
        '💡 <strong>Tip del día:</strong> Mantén tu espacio de trabajo organizado.',
        '💡 <strong>Tip del día:</strong> Una tarea a la vez, un día a la vez.',
        '💡 <strong>Tip del día:</strong> La consistencia es más importante que la perfección.',
        '💡 <strong>Tip del día:</strong> Anota tus ideas inmediatamente para no olvidarlas.',
        '💡 <strong>Tip del día:</strong> Dedica tiempo a planificar tu día cada mañana.',
        '💡 <strong>Tip del día:</strong> Elimina distracciones durante las tareas importantes.',
        '💡 <strong>Tip del día:</strong> Revisa tu progreso al final del día.',
        '💡 <strong>Tip del día:</strong> Mantén una actitud positiva ante los desafíos.',
        '💡 <strong>Tip del día:</strong> Aprende algo nuevo cada día.',
        '💡 <strong>Tip del día:</strong> Practica la gratitud por lo que has logrado.',
        '💡 <strong>Tip del día:</strong> Establece metas realistas y alcanzables.',
        '💡 <strong>Tip del día:</strong> Usa la técnica Pomodoro para mantener el enfoque.',
        '💡 <strong>Tip del día:</strong> Delega tareas cuando sea posible.',
        '💡 <strong>Tip del día:</strong> Mantén un equilibrio entre trabajo y descanso.',
        '💡 <strong>Tip del día:</strong> Visualiza el éxito antes de empezar.',
        '💡 <strong>Tip del día:</strong> Aprende de los errores y sigue adelante.',
        '💡 <strong>Tip del día:</strong> Rodéate de personas que te inspiren.'
    ];
    
    return dailyTips[parseInt(lastTipIndex)];
}

/** Genera mensajes especiales según la situación del usuario */
function generateSpecialMessage() {
    if (!currentUser) return null;

    const hour = new Date().getHours();
    const today = new Date().toISOString().split('T')[0];
    const todayItems = items.filter(item => item.date === today);
    const pendingTasks = todayItems.filter(item => item.status === 'pending');
    const completedTasks = todayItems.filter(item => item.status === 'completed' || item.status === 'done');
    
    // Mensajes especiales según la situación
    const specialMessages = [];
    
    // Si no hay tareas pendientes
    if (pendingTasks.length === 0 && completedTasks.length > 0) {
        specialMessages.push({
            type: 'success',
            icon: '🎉',
            title: '¡Día perfecto!',
            message: `¡Increíble ${currentUser}! Has completado todas tus tareas de hoy. ¡Eres una máquina de productividad!`,
            bg: 'bg-green-50 dark:bg-green-900',
            text: 'text-green-800 dark:text-green-200'
        });
    }
    
    // Si hay muchas tareas pendientes
    if (pendingTasks.length > 5) {
        specialMessages.push({
            type: 'warning',
            icon: '⚡',
            title: '¡Momento de acción!',
            message: `Tienes ${pendingTasks.length} tareas pendientes. ¡Vamos a organizarlas y empezar con la más importante!`,
            bg: 'bg-orange-50 dark:bg-orange-900',
            text: 'text-orange-800 dark:text-orange-200'
        });
    }
    
    // Si es temprano en la mañana
    if (hour >= 6 && hour <= 9) {
        specialMessages.push({
            type: 'morning',
            icon: '🌅',
            title: '¡Buenos días!',
            message: `¡Perfecto momento para empezar el día, ${currentUser}! El éxito comienza con una buena planificación.`,
            bg: 'bg-blue-50 dark:bg-blue-900',
            text: 'text-blue-800 dark:text-blue-200'
        });
    }
    
    // Si es tarde en la noche
    if (hour >= 21) {
        specialMessages.push({
            type: 'evening',
            icon: '🌙',
            title: '¡Buenas noches!',
            message: `Es hora de relajarse, ${currentUser}. ¿Has revisado lo que lograste hoy? ¡Prepárate para un mañana aún mejor!`,
            bg: 'bg-indigo-50 dark:bg-indigo-900',
            text: 'text-indigo-800 dark:text-indigo-200'
        });
    }
    
    // Si no hay elementos para hoy
    if (todayItems.length === 0) {
        specialMessages.push({
            type: 'info',
            icon: '📝',
            title: '¡Día en blanco!',
            message: `¡Hola ${currentUser}! No tienes elementos programados para hoy. ¿Es momento de planificar algo nuevo?`,
            bg: 'bg-purple-50 dark:bg-purple-900',
            text: 'text-purple-800 dark:text-purple-200'
        });
    }
    
    // Si hay muchas tareas completadas
    if (completedTasks.length >= 3) {
        specialMessages.push({
            type: 'achievement',
            icon: '🏆',
            title: '¡Racha de éxitos!',
            message: `¡Wow ${currentUser}! Ya completaste ${completedTasks.length} elementos hoy. ¡Tu productividad está en llamas!`,
            bg: 'bg-yellow-50 dark:bg-yellow-900',
            text: 'text-yellow-800 dark:text-yellow-200'
        });
    }
    
    // Retornar un mensaje aleatorio si hay opciones
    if (specialMessages.length > 0) {
        const randomMessage = specialMessages[Math.floor(Math.random() * specialMessages.length)];
        return `<div class="${randomMessage.bg} p-4 rounded-lg border-l-4 border-l-${randomMessage.type === 'success' ? 'green' : randomMessage.type === 'warning' ? 'orange' : randomMessage.type === 'morning' ? 'blue' : randomMessage.type === 'evening' ? 'indigo' : randomMessage.type === 'info' ? 'purple' : 'yellow'}-500">
            <div class="flex items-start">
                <span class="text-2xl mr-3">${randomMessage.icon}</span>
                <div>
                    <h4 class="font-bold text-lg ${randomMessage.text}">${randomMessage.title}</h4>
                    <p class="${randomMessage.text} mt-1">${randomMessage.message}</p>
                </div>
            </div>
        </div>`;
    }
    
    return null;
}

/** Muestra el modal de bienvenida diaria */
function showDailyWelcome() {
    const message = generateWelcomeMessage();
    const specialMessage = generateSpecialMessage();
    
    if (message) {
        let fullMessage = message;
        
        // Agregar mensaje especial si existe
        if (specialMessage) {
            fullMessage = `<div class="space-y-4">${specialMessage}${message.replace('<div class="space-y-3">', '')}`;
        }
        
        welcomeMessage.innerHTML = fullMessage;
        dailyWelcomeModal.classList.remove('hidden');
    }
}

/** Verifica si es la primera vez del usuario */
function isFirstTimeUser() {
    return !loadUserName();
}

/** Verifica si debe mostrar bienvenida diaria - AHORA SIEMPRE */
function shouldShowDailyWelcome() {
    // Cambiado para mostrar siempre que el usuario entre
    return true;
}

/** Marca que se mostró la bienvenida de hoy */
function markDailyWelcomeShown() {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('lastWelcomeDate', today);
}

/** Colores disponibles para los elementos */
const AVAILABLE_COLORS = [
    { name: 'Azul', class: 'blue', bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-500' },
    { name: 'Verde', class: 'green', bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', border: 'border-green-500' },
    { name: 'Amarillo', class: 'yellow', bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200', border: 'border-yellow-500' },
    { name: 'Rojo', class: 'red', bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', border: 'border-red-500' },
    { name: 'Púrpura', class: 'purple', bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-500' },
    { name: 'Rosa', class: 'pink', bg: 'bg-pink-100 dark:bg-pink-900', text: 'text-pink-800 dark:text-pink-200', border: 'border-pink-500' },
    { name: 'Gris', class: 'gray', bg: 'bg-gray-100 dark:bg-gray-900', text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-500' },
    { name: 'Índigo', class: 'indigo', bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-800 dark:text-indigo-200', border: 'border-indigo-500' }
];

/** Estados disponibles */
const AVAILABLE_STATUSES = [
    { name: 'Pendiente', class: 'pending', icon: '⏳' },
    { name: 'Realizado', class: 'done', icon: '✅' },
    { name: 'Terminado', class: 'completed', icon: '🎉' }
];

/** Obtiene la configuración de color y icono para un elemento */
function getColorConfig(colorClass) {
    // Si es un color personalizado (hex), crear configuración dinámica
    if (colorClass && colorClass.startsWith('#')) {
        return {
            name: 'Personalizado',
            class: 'custom',
            bg: `bg-[${colorClass}] bg-opacity-20`,
            text: `text-[${colorClass}]`,
            border: `border-[${colorClass}]`,
            hex: colorClass
        };
    }
    
    return AVAILABLE_COLORS.find(c => c.class === colorClass) || AVAILABLE_COLORS[0];
}

/** Obtiene la configuración de estado para un elemento */
function getStatusConfig(statusClass) {
    return AVAILABLE_STATUSES.find(s => s.class === statusClass) || AVAILABLE_STATUSES[0];
}

/** Obtiene el color seleccionado del selector de colores */
function getSelectedColor(selectorClass) {
    const selectedElement = document.querySelector(`.${selectorClass}.ring-2`);
    if (!selectedElement) return 'blue';
    
    // Si es un color picker personalizado, devolver el valor hex
    if (selectedElement.type === 'color') {
        return selectedElement.value;
    }
    
    // Si es un color predefinido, devolver la clase
    return selectedElement.getAttribute('data-color') || 'blue';
}

/** Obtiene el color seleccionado del selector de carpetas */
function getSelectedFolderColor(selectorClass) {
    const selectedElement = document.querySelector(`.${selectorClass}.ring-2`);
    if (!selectedElement) return 'green';
    
    // Si es un color picker personalizado, devolver el valor hex
    if (selectedElement.type === 'color') {
        return selectedElement.value;
    }
    
    // Si es un color predefinido, devolver la clase
    return selectedElement.getAttribute('data-color') || 'green';
}

/** Obtiene el emoji seleccionado en el selector de carpetas */
function getSelectedFolderEmoji(selectorClass) {
    const selectedEmoji = document.querySelector(`.${selectorClass}.ring-2`);
    return selectedEmoji ? selectedEmoji.getAttribute('data-emoji') : '📁';
}

/** Obtiene el emoji seleccionado en el selector de editar carpetas */
function getSelectedEditFolderEmoji(selectorClass) {
    const selectedEmoji = document.querySelector(`.${selectorClass}.ring-2`);
    return selectedEmoji ? selectedEmoji.getAttribute('data-emoji') : '📁';
}

/** Obtiene el estilo de color para iconos */
function getIconColorStyle(colorClass) {
    // Si es un color personalizado (hex), usar estilo inline
    if (colorClass && colorClass.startsWith('#')) {
        return `background-color: ${colorClass};`;
    }
    
    // Si es un color predefinido, usar valores CSS específicos
    const colorMap = {
        'blue': '#3B82F6',
        'green': '#10B981',
        'yellow': '#F59E0B',
        'red': '#EF4444',
        'purple': '#8B5CF6',
        'pink': '#EC4899',
        'gray': '#6B7280',
        'indigo': '#6366F1'
    };
    
    const colorValue = colorMap[colorClass] || '#10B981';
    return `background-color: ${colorValue};`;
}

/** Obtiene el color CSS para mostrar en indicadores */
function getFolderColorValue(colorClass) {
    // Si es un color personalizado (hex), devolver el hex
    if (colorClass && colorClass.startsWith('#')) {
        return colorClass;
    }
    
    // Si es un color predefinido, devolver el valor CSS de Tailwind
    const colorMap = {
        'blue': '#3B82F6',
        'green': '#10B981',
        'yellow': '#F59E0B',
        'red': '#EF4444',
        'purple': '#8B5CF6',
        'pink': '#EC4899',
        'gray': '#6B7280',
        'indigo': '#6366F1'
    };
    
    return colorMap[colorClass] || '#10B981'; // Verde por defecto
}

/** Obtiene el nombre del color para mostrar */
function getFolderColorName(colorClass) {
    // Si es un color personalizado (hex), devolver el hex en mayúsculas
    if (colorClass && colorClass.startsWith('#')) {
        return colorClass.toUpperCase();
    }
    
    // Si es un color predefinido, devolver el nombre
    return colorClass || 'green';
}

/** Obtiene el icono SVG para un tipo de elemento */
function getTypeIcon(type) {
    const icons = {
        'Tarea': `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>`,
        'Nota': `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>`,
        'Compra': `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
        'Recordatorio': `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
    };
    return icons[type] || icons['Nota'];
}

// --- 2. Funciones de Datos (CRUD) ---

/** Carga los elementos desde localStorage. */
function loadItems() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        items = stored ? JSON.parse(stored) : [];
        // Asegurar que todos los elementos tengan los campos necesarios
        let migrated = false;
        items.forEach(item => {
            if (!item.id) item.id = crypto.randomUUID();
            if (!item.color) item.color = 'blue'; // Color por defecto
            if (!item.status) item.status = 'pending'; // Estado por defecto
            if (!item.date) item.date = new Date().toISOString().split('T')[0]; // Fecha por defecto
            
            // Migrar fechas de creación y modificación
            if (!item.createdAt || isNaN(new Date(item.createdAt).getTime())) {
                item.createdAt = Date.now();
                migrated = true;
            }
            if (!item.updatedAt || isNaN(new Date(item.updatedAt).getTime())) {
                item.updatedAt = Date.now();
                migrated = true;
            }
            
            // Mantener compatibilidad con elementos antiguos
            if (item.type === 'Tarea' && typeof item.isCompleted !== 'undefined') {
                item.status = item.isCompleted ? 'completed' : 'pending';
                delete item.isCompleted;
            }
        });
        
        // Guardar si se migraron elementos
        if (migrated) {
            console.log('Elementos migrados con fechas válidas');
            saveItems();
        }
        return items;
    } catch (e) {
        console.error("Error al cargar datos de localStorage:", e);
        showSystemMessage("Error al cargar los datos locales.", 'error');
        return [];
    }
}

/** Guarda los elementos en localStorage. */
function saveItems() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        updateSummary();
    } catch (e) {
        console.error("Error al guardar datos en localStorage:", e);
        showSystemMessage("Error al guardar los datos locales.", 'error');
    }
}

/** Agrega un nuevo elemento a la lista. */
function addItem(content, type, colorClass, statusClass, date, folderId = null, time = null) {
    console.log('addItem called with:', { content, type, colorClass, statusClass, date, folderId, time });
    
    const newItem = {
        id: crypto.randomUUID(),
        type: type,
        content: content.trim(),
        color: colorClass,
        status: statusClass,
        date: date || new Date().toISOString().split('T')[0], // Fecha actual por defecto
        time: time || null, // Hora del recordatorio (solo para recordatorios)
        folderId: folderId || null, // ID de la carpeta (null si no se especifica)
        timestamp: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    console.log('New item created:', newItem);

    items.unshift(newItem); // Agrega al inicio
    saveItems();
    renderList();
    
    console.log('Current view:', currentView, 'Current folder view:', currentFolderView, 'Selected folder ID:', selectedFolderId);
    
    // Si estamos viendo el contenido de una carpeta, actualizar la vista
    if (currentView === 'folders' && currentFolderView === 'content' && selectedFolderId) {
        console.log('Updating folder view for folder:', selectedFolderId);
        renderFolderItems(selectedFolderId);
    }
    
    // Actualizar último uso de la carpeta si el elemento pertenece a una
    if (newItem.folderId) {
        updateFolderLastUsed(newItem.folderId);
    }
    
    showSystemMessage(`"${newItem.type}" agregado correctamente.`);
    
    // Programar notificaciones si es un recordatorio
    handleReminderNotifications(newItem);
    
    if (type === 'Recordatorio') {
        requestNotificationPermission();
        checkReminders();
    }
}

/** Actualiza el contenido de un elemento. */
function updateItemContent(id, newContent) {
    const item = items.find(i => i.id === id);
    if (item) {
        item.content = newContent.trim();
        // Opcional: Re-analizar el tipo si el contenido cambia significativamente
        // item.type = analyzeText(newContent); 
        saveItems();
        showSystemMessage("Elemento actualizado.");
    }
}

/** Marca una tarea como completada/incompleta. */
function toggleItemCompleted(id) {
    const item = items.find(i => i.id === id);
    if (item && item.type === 'Tarea') {
        item.isCompleted = !item.isCompleted;
        item.updatedAt = Date.now(); // Actualizar fecha de modificación
        saveItems();
        renderList(); // Re-renderizar para actualizar el estilo y el resumen
        showSystemMessage(item.isCompleted ? "Tarea completada. ¡Bien hecho!" : "Tarea marcada como pendiente.");
    }
}

/** Cambia el estado de un elemento. */
function changeItemStatus(id, newStatus) {
    const item = items.find(i => i.id === id);
    if (item && newStatus) {
        item.status = newStatus;
        item.updatedAt = Date.now(); // Actualizar fecha de modificación
        saveItems();
        renderList();
        
        // Actualizar calendario si está visible
        if (!calendarView.classList.contains('hidden')) {
            renderCalendar();
            if (selectedDate) {
                renderDayDetails(selectedDate);
            }
        }
        
        const statusConfig = getStatusConfig(newStatus);
        showSystemMessage(`Estado cambiado a: ${statusConfig.name}`);
    }
}

/** Elimina un elemento de la lista. */
function deleteItem(id) {
    // Limpiar notificaciones antes de eliminar
    clearReminderNotifications(id);
    
    items = items.filter(i => i.id !== id);
    saveItems();
    renderList();
    showSystemMessage("Elemento eliminado.");
}

// --- Funciones para Sistema de Carpetas Jerárquico ---

/** Carga las carpetas desde localStorage. */
function loadFolders() {
    try {
        const stored = localStorage.getItem(FOLDERS_STORAGE_KEY);
        folders = stored ? JSON.parse(stored) : [];
        console.log('Folders loaded from localStorage:', folders);
        
        // Migración: agregar lastUsed a carpetas existentes que no lo tengan
        let needsSave = false;
        folders.forEach(folder => {
            if (!folder.lastUsed) {
                folder.lastUsed = folder.createdAt || Date.now();
                needsSave = true;
            }
        });
        
        if (needsSave) {
            saveFolders();
            console.log('Migrated folders with lastUsed field');
        }
        
        // Si no hay carpetas, crear algunas de ejemplo
        if (folders.length === 0) {
            console.log('No folders found, creating sample folders');
            folders = [
                { 
                    id: crypto.randomUUID(), 
                    name: 'Trabajo', 
                    description: 'Elementos relacionados con el trabajo', 
                    createdAt: Date.now(),
                    lastUsed: Date.now()
                },
                { 
                    id: crypto.randomUUID(), 
                    name: 'Personal', 
                    description: 'Elementos personales y privados', 
                    createdAt: Date.now() 
                },
                { 
                    id: crypto.randomUUID(), 
                    name: 'Estudio', 
                    description: 'Elementos de estudio y aprendizaje', 
                    createdAt: Date.now() 
                }
            ];
            saveFolders();
            console.log('Sample folders created:', folders);
        }
        
        // Asegurar que todas las carpetas tengan los campos necesarios
        folders.forEach(folder => {
            if (!folder.id) folder.id = crypto.randomUUID();
            if (!folder.createdAt) folder.createdAt = Date.now();
            if (!folder.description) folder.description = '';
        });
        
        console.log('Folders after processing:', folders);
        return folders;
    } catch (e) {
        console.error("Error al cargar carpetas de localStorage:", e);
        showSystemMessage("Error al cargar las carpetas.", 'error');
        return [];
    }
}

/** Guarda las carpetas en localStorage. */
function saveFolders() {
    try {
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
    } catch (e) {
        console.error("Error al guardar carpetas en localStorage:", e);
        showSystemMessage("Error al guardar las carpetas.", 'error');
    }
}

/** Crea una nueva carpeta. */
function createFolder(name, description = '', color = 'green', emoji = '📁') {
    console.log('Creating folder:', name, description, color, emoji);
    
    const newFolder = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description.trim(),
        color: color,
        emoji: emoji,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastUsed: Date.now() // Agregar timestamp de último uso
    };
    
    folders.push(newFolder);
    console.log('Folder created:', newFolder);
    
    saveFolders();
    renderFoldersList();
    showSystemMessage(`Carpeta "${newFolder.name}" creada correctamente.`);
    return newFolder;
}

/** Actualiza una carpeta. */
function updateFolder(id, name, description = '', color = 'green', emoji = '📁') {
    const folder = folders.find(f => f.id === id);
    if (folder) {
        folder.name = name.trim();
        folder.description = description.trim();
        folder.color = color;
        folder.emoji = emoji;
        folder.updatedAt = Date.now();
        folder.lastUsed = Date.now(); // Actualizar último uso al editar
        saveFolders();
        renderFoldersList();
        showSystemMessage("Carpeta actualizada correctamente.");
    }
}

/** Actualiza el timestamp de último uso de una carpeta */
function updateFolderLastUsed(folderId) {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
        folder.lastUsed = Date.now();
        saveFolders();
    }
}

/** Elimina una carpeta. */
function deleteFolder(id) {
    const folder = folders.find(f => f.id === id);
    if (!folder) return;

    // Eliminar todos los elementos que pertenecen a esta carpeta
    items = items.filter(item => item.folderId !== id);
    saveItems();

    // Eliminar la carpeta
    folders = folders.filter(f => f.id !== id);
    saveFolders();
    renderFoldersList();
    
    // Si estábamos viendo esta carpeta, volver a la lista
    if (selectedFolderId === id) {
        selectedFolderId = null;
        showFoldersListView();
    }
    
    showSystemMessage(`Carpeta "${folder.name}" eliminada correctamente.`);
}

/** Obtiene una carpeta por su ID. */
function getFolderById(id) {
    return folders.find(f => f.id === id);
}

/** Obtiene los elementos de una carpeta específica. */
function getItemsInFolder(folderId) {
    return items.filter(item => item.folderId === folderId);
}

/** Pobla el dropdown de carpetas con las carpetas disponibles */
function populateFolderSelector(selectedFolderId = null) {
    console.log('populateFolderSelector called with:', selectedFolderId);
    console.log('folders array:', folders);
    console.log('folderSelector element:', folderSelector);
    
    if (!folderSelector) {
        console.error('folderSelector not found');
        return;
    }
    
    // Limpiar opciones existentes excepto la primera
    folderSelector.innerHTML = '<option value="">📁 Sin carpeta</option>';
    
    // Agregar carpetas disponibles
    folders.forEach(folder => {
        console.log('Adding folder:', folder);
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = `📁 ${folder.name}`;
        
        // Seleccionar la carpeta si se especifica
        if (selectedFolderId === folder.id) {
            option.selected = true;
        }
        
        folderSelector.appendChild(option);
    });
    
    console.log('populateFolderSelector completed, options:', folderSelector.children.length);
}

/** Pobla el dropdown de carpetas en el modal de edición */
function populateEditFolderSelector(selectedFolderId = null) {
    if (!editFolderSelector) return;
    
    // Limpiar opciones existentes excepto la primera
    editFolderSelector.innerHTML = '<option value="">📁 Sin carpeta</option>';
    
    // Agregar carpetas disponibles
    folders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = `📁 ${folder.name}`;
        
        // Seleccionar la carpeta si se especifica
        if (selectedFolderId === folder.id) {
            option.selected = true;
        }
        
        editFolderSelector.appendChild(option);
    });
}

/** Abre el modal para crear un nuevo elemento */
function openCreateItemModal(folderId = null) {
    // Limpiar campos
    universalInput.value = '';
    typeSelector.value = 'Nota';
    statusSelector.value = 'pending';
    dateSelector.value = new Date().toISOString().split('T')[0];
    
    // Asegurar que las carpetas estén cargadas
    if (folders.length === 0) {
        loadFolders();
    }
    
    // Poblar dropdown de carpetas
    populateFolderSelector(folderId);
    
    // Resetear selección de colores
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-blue-500');
    });
    if (colorSelector.firstChild) {
        colorSelector.firstChild.classList.add('ring-2', 'ring-blue-500');
    }
    
    // Mostrar modal
    modal.classList.remove('hidden');
    universalInput.focus();
}

// --- 3. Renderizado y UI ---

/** Renderiza la lista de carpetas */
function renderFoldersList() {
    if (!foldersList) {
        console.error('foldersList element not found');
        return;
    }

    foldersList.innerHTML = '';

    if (folders.length === 0) {
        foldersList.innerHTML = `
            <div class="col-span-full text-center text-gray-500 dark:text-gray-400 p-8 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div class="text-6xl mb-4">📁</div>
                <p class="text-lg font-medium mb-2">No tienes carpetas aún</p>
                <p class="text-sm">Crea tu primera carpeta para empezar a organizar</p>
            </div>
        `;
        return;
    }

    // Ordenar carpetas por último uso (más recientes primero)
    const sortedFolders = [...folders].sort((a, b) => {
        const aLastUsed = a.lastUsed || a.createdAt || 0;
        const bLastUsed = b.lastUsed || b.createdAt || 0;
        return bLastUsed - aLastUsed;
    });
    
    sortedFolders.forEach(folder => {
        const folderItems = getItemsInFolder(folder.id);
        const folderHtml = createFolderCardHtml(folder, folderItems.length);
        foldersList.insertAdjacentHTML('beforeend', folderHtml);
    });
}

/** Crea el HTML para una tarjeta de carpeta */
function createFolderCardHtml(folder, itemsCount) {
    // Obtener el color de la carpeta
    const folderColor = folder.color || 'green';
    const colorConfig = getColorConfig(folderColor);
    
    return `
        <div class="folder-card group bg-gradient-to-br from-white via-gray-50/50 to-gray-100/50 dark:from-gray-800 dark:via-gray-700/50 dark:to-gray-600/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600" data-folder-id="${folder.id}">
            <div class="flex items-center justify-between mb-4">
                <div class="folder-icon p-3 rounded-xl shadow-md" style="${getIconColorStyle(folderColor)}">
                    <span class="text-2xl">${folder.emoji || '📁'}</span>
                </div>
                <div class="relative">
                    <button class="folder-options-btn p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md" data-folder-id="${folder.id}" title="Opciones de carpeta">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                    
                    <!-- Menú desplegable -->
                    <div class="folder-options-menu absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 hidden" data-folder-id="${folder.id}">
                        <div class="py-1">
                            <button class="folder-menu-edit w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" data-action="edit" data-folder-id="${folder.id}">
                                <div class="flex items-center space-x-2">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span>Editar carpeta</span>
                                </div>
                            </button>
                            <button class="folder-menu-export w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors" data-action="export" data-folder-id="${folder.id}">
                                <div class="flex items-center space-x-2">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Exportar carpeta</span>
                                </div>
                            </button>
                            <button class="folder-menu-share w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" data-action="share" data-folder-id="${folder.id}">
                                <div class="flex items-center space-x-2">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                    </svg>
                                    <span>Compartir carpeta</span>
                                </div>
                            </button>
                            <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            <button class="folder-menu-delete w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" data-action="delete" data-folder-id="${folder.id}">
                                <div class="flex items-center space-x-2">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Eliminar carpeta</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">${folder.name}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">${folder.description || 'Sin descripción'}</p>
                
                <!-- Indicador de color -->
                <div class="flex items-center space-x-2 mb-3">
                    <span class="text-xs text-gray-500 dark:text-gray-400">Color:</span>
                    <div class="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm" style="background-color: ${getFolderColorValue(folderColor)}"></div>
                    <span class="text-xs text-gray-500 dark:text-gray-400">${getFolderColorName(folderColor)}</span>
                </div>
            </div>
            
            <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span class="flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>${itemsCount} elemento${itemsCount !== 1 ? 's' : ''}</span>
                </span>
                <span class="text-xs flex items-center space-x-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>${new Date(folder.createdAt).toLocaleDateString()}</span>
                </span>
            </div>
        </div>
    `;
}

/** Crea el HTML para un elemento individual */
function createItemHtml(item) {
    const colorConfig = getColorConfig(item.color);
    const statusConfig = getStatusConfig(item.status);
    const icon = getTypeIcon(item.type);
    const isCompleted = item.status === 'completed' || item.status === 'done';

    // Clases dinámicas para el contenedor
    let containerClasses = `flex items-start p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${colorConfig.border} ${colorConfig.bg}`;
    if (isCompleted) {
        containerClasses += ' opacity-60 line-through';
    }

    // Formatear fecha y hora
    const itemDate = new Date(item.date);
    const formattedDate = itemDate.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
    
    // Formatear hora si existe
    let timeInfo = '';
    if (item.type === 'Recordatorio') {
        if (item.time) {
            timeInfo = `<span class="text-xs text-blue-600 dark:text-blue-400 font-medium">🕐 ${item.time}</span>`;
        } else {
            timeInfo = `<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">📅 Sin hora específica</span>`;
        }
    }

    // Obtener información de la carpeta si existe
    let folderInfo = '';
    if (item.folderId) {
        const folder = getFolderById(item.folderId);
        if (folder) {
            folderInfo = `<span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">📁 de carpeta ${folder.name}</span>`;
        }
    }

    // Genera el HTML del elemento
    return `
        <div id="item-${item.id}" class="${containerClasses}">
            <!-- Icono -->
            <div class="flex-shrink-0 mr-3 mt-1">
                <div class="p-2 rounded-full text-white text-sm" style="${getIconColorStyle(item.color)}">${icon}</div>
            </div>

            <!-- Contenido principal -->
            <div class="flex-grow min-w-0 w-full">
                <!-- Información de tipo, estado y fecha -->
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                    <span class="text-xs font-semibold uppercase rounded px-2 py-1 ${colorConfig.bg.replace('100', '300')} ${colorConfig.text.replace('800', '900')} dark:bg-opacity-50">${item.type}</span>
                    <span class="text-xs ${colorConfig.text}">${statusConfig.icon} ${statusConfig.name}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">${formattedDate}</span>
                    ${timeInfo}
                </div>
                
                <!-- Información de carpeta -->
                ${folderInfo ? `<div class="mb-2">${folderInfo}</div>` : ''}
                
                <!-- Contenido del elemento -->
                <div class="font-medium ${colorConfig.text} break-words overflow-wrap-anywhere" 
                    data-id="${item.id}" 
                    contenteditable="false"
                    data-original-content="${item.content}">
                    ${item.content}
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex-shrink-0 flex flex-col sm:flex-row gap-1 ml-3">
                <!-- Botón Editar -->
                <button data-action="edit" data-id="${item.id}" title="Editar" class="text-gray-500 dark:text-gray-400 hover:text-primary-blue dark:hover:text-primary-blue transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 shadow-sm">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.232z" />
                    </svg>
                </button>
                
                <!-- Botón Exportar -->
                <button data-action="export" data-id="${item.id}" title="Exportar nota" class="text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 shadow-sm">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </button>
                
                <!-- Botón Compartir -->
                <button data-action="share" data-id="${item.id}" title="Compartir nota" class="text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 shadow-sm">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                </button>
                
                <!-- Menú de opciones adicionales - NUEVO ENFOQUE -->
                <div class="relative">
                    <button class="item-options-btn p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md" data-item-id="${item.id}" title="Más opciones" onclick="toggleItemMenu('${item.id}')">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                    
                    <!-- Menú desplegable - SIMPLIFICADO -->
                    <div id="menu-${item.id}" class="item-options-menu absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 hidden" data-item-id="${item.id}">
                        <div class="py-1">
                            <button class="item-menu-duplicate w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" data-action="duplicate" data-id="${item.id}">
                                <div class="flex items-center space-x-2">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <span>Duplicar</span>
                                </div>
                            </button>
                            <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            <button class="item-menu-delete w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" data-action="delete" data-id="${item.id}">
                                <div class="flex items-center space-x-2">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Eliminar</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/** Renderiza los elementos dentro de una carpeta */
function renderFolderItems(folderId) {
    console.log('renderFolderItems called with folderId:', folderId);
    
    if (!folderItemsList) {
        console.error('folderItemsList not found');
        return;
    }
    
    const folder = getFolderById(folderId);
    if (!folder) {
        console.error('Folder not found:', folderId);
        return;
    }
    
    const folderItems = getItemsInFolder(folderId);
    console.log('Folder items found:', folderItems);
    
    folderItemsList.innerHTML = '';
    
    if (folderItems.length === 0) {
        folderItemsList.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 p-8 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div class="text-4xl mb-4">📝</div>
                <p class="text-lg font-medium mb-2">Esta carpeta está vacía</p>
                <p class="text-sm">Usa el botón "+" para agregar notas, recordatorios o tareas</p>
            </div>
        `;
        return;
    }
    
    console.log('Rendering', folderItems.length, 'items');
    
    folderItems.forEach(item => {
        console.log('Creating HTML for item:', item);
        console.log('createItemHtml function available:', typeof createItemHtml);
        try {
            const itemHtml = createItemHtml(item);
            console.log('Generated HTML:', itemHtml);
            folderItemsList.insertAdjacentHTML('beforeend', itemHtml);
        } catch (error) {
            console.error('Error creating item HTML:', error);
            console.error('Item data:', item);
            console.error('Stack trace:', error.stack);
        }
    });
    
    console.log('renderFolderItems completed, items rendered:', folderItemsList.children.length);
}

/** Muestra la vista de carpetas */
function showFoldersView() {
    console.log('Showing folders view');
    currentView = 'folders';
    
    // Ocultar otras vistas
    if (todoView) todoView.classList.add('hidden');
    if (calendarView) calendarView.classList.add('hidden');
    
    // Ocultar dropdown de filtros
    if (filterDropdownContainer) filterDropdownContainer.classList.add('hidden');
    
    // Mostrar vista de carpetas
    if (foldersMainView) {
        foldersMainView.classList.remove('hidden');
        console.log('Folders view shown');
    } else {
        console.error('foldersMainView element not found');
    }
    
    // Actualizar botones de navegación
    updateNavigationButtons();
    
    // Asegurar que el botón FAB esté visible
    ensureFabVisibility();
    
    // Mostrar lista de carpetas
    showFoldersListView();
}

/** Muestra la lista de carpetas */
function showFoldersListView() {
    currentFolderView = 'list';
    if (foldersList) foldersList.parentElement.classList.remove('hidden');
    if (folderContent) folderContent.classList.add('hidden');
    
    // Asegurar que el botón FAB esté visible
    ensureFabVisibility();
    
    renderFoldersList();
}

/** Muestra el contenido de una carpeta específica */
function showFolderContentView(folderId) {
    currentFolderView = 'content';
    selectedFolderId = folderId;
    
    const folder = getFolderById(folderId);
    if (!folder) return;
    
    if (foldersList) foldersList.parentElement.classList.add('hidden');
    if (folderContent) folderContent.classList.remove('hidden');
    
    // Actualizar el título y agregar botón de editar
    if (selectedFolderTitle) {
        const folderColor = folder.color || 'green';
        const colorValue = getFolderColorValue(folderColor);
        
        selectedFolderTitle.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="flex items-center space-x-2">
                    <div class="w-6 h-6 rounded-lg shadow-md" style="background-color: ${colorValue}"></div>
                    <span>${folder.name}</span>
                </div>
                <button id="edit-folder-from-content-btn" class="p-2 text-gray-500 hover:text-white dark:text-gray-400 dark:hover:text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md" style="background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(4px);" data-folder-id="${folderId}" title="Editar carpeta" onmouseover="this.style.backgroundColor='${colorValue}'; this.style.color='white';" onmouseout="this.style.backgroundColor='rgba(255, 255, 255, 0.8)'; this.style.color='rgb(107, 114, 128)';">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
            </div>
        `;
    }
    
    renderFolderItems(folderId);
    
    // Actualizar último uso de la carpeta al abrirla
    updateFolderLastUsed(folderId);
    
    // Asegurar que el botón FAB esté visible
    ensureFabVisibility();
}

/** Muestra la vista de Todo */
function showTodoView() {
    currentView = 'todo';
    
    // Ocultar otras vistas
    if (foldersMainView) foldersMainView.classList.add('hidden');
    if (calendarView) calendarView.classList.add('hidden');
    
    // Mostrar vista de todo
    if (todoView) todoView.classList.remove('hidden');
    
    // Mostrar dropdown de filtros solo en vista Inicio
    if (filterDropdownContainer) filterDropdownContainer.classList.remove('hidden');
    
    // Actualizar botones de navegación
    updateNavigationButtons();
    
    renderList();
}

/** Muestra la vista de calendario */
function showCalendarView() {
    currentView = 'calendar';
    
    // Ocultar otras vistas
    if (foldersMainView) foldersMainView.classList.add('hidden');
    if (todoView) todoView.classList.add('hidden');
    
    // Ocultar dropdown de filtros
    if (filterDropdownContainer) filterDropdownContainer.classList.add('hidden');
    
    // Mostrar vista de calendario
    if (calendarView) calendarView.classList.remove('hidden');
    
    // Actualizar botones de navegación
    updateNavigationButtons();
    
    renderCalendar();
}

/** Actualiza los botones de navegación según la vista actual */
function updateNavigationButtons() {
    // Resetear todos los botones
    [homeViewBtn, calendarViewBtn, foldersViewBtn].forEach(btn => {
        btn.classList.remove('bg-primary-blue', 'text-white');
        btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
    });
    
    // Activar el botón correspondiente
    switch (currentView) {
        case 'todo':
            homeViewBtn.classList.add('bg-primary-blue', 'text-white');
            homeViewBtn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            break;
        case 'calendar':
            calendarViewBtn.classList.add('bg-primary-blue', 'text-white');
            calendarViewBtn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            break;
        case 'folders':
            foldersViewBtn.classList.add('bg-primary-blue', 'text-white');
            foldersViewBtn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            break;
    }
    
    // Asegurar que el FAB esté visible en todas las vistas
    ensureFabVisibility();
}

/** Selecciona una carpeta y muestra sus detalles */
function selectFolder(folderId) {
    selectedFolderId = folderId;
    const folder = getFolderById(folderId);
    
    if (!folder) return;
    
    // Actualizar breadcrumb
    updateBreadcrumb(folderId);
    
    // Mostrar detalles de la carpeta
    showFolderDetails(folder);
    
    // Mostrar botón de crear subcarpeta
    createSubfolderBtn.classList.remove('hidden');
    
    // Re-renderizar para mostrar selección
    renderFoldersTree();
}

/** Actualiza el breadcrumb de navegación */
function updateBreadcrumb(folderId) {
    if (!folderBreadcrumb) return;
    
    const path = getFolderPath(folderId);
    let breadcrumbHtml = '<span>🏠</span>';
    
    path.forEach((folder, index) => {
        breadcrumbHtml += `<span class="cursor-pointer hover:text-primary-blue transition-colors" data-folder-id="${folder.id}">${folder.name}</span>`;
        if (index < path.length - 1) {
            breadcrumbHtml += '<span>›</span>';
        }
    });
    
    folderBreadcrumb.innerHTML = breadcrumbHtml;
}

/** Muestra los detalles de una carpeta */
function showFolderDetails(folder) {
    if (!folderDetails || !selectedFolderTitle || !folderInfo) return;
    
    selectedFolderTitle.textContent = folder.name;
    
    const subfolders = getSubfolders(folder.id);
    const totalSubfolders = getTotalSubfoldersCount(folder.id);
    
    const createdDate = new Date(folder.createdAt).toLocaleDateString('es-ES');
    const updatedDate = new Date(folder.updatedAt).toLocaleDateString('es-ES');
    
    folderInfo.innerHTML = `
        <div class="space-y-4">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">📋 Información General</h4>
                <div class="space-y-2 text-sm">
                    <p><span class="font-medium">Nombre:</span> ${folder.name}</p>
                    <p><span class="font-medium">Descripción:</span> ${folder.description || 'Sin descripción'}</p>
                    <p><span class="font-medium">Subcarpetas:</span> ${totalSubfolders}</p>
                    <p><span class="font-medium">Creada:</span> ${createdDate}</p>
                    <p><span class="font-medium">Modificada:</span> ${updatedDate}</p>
                </div>
            </div>
            
            ${subfolders.length > 0 ? `
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">📂 Subcarpetas Directas</h4>
                <div class="space-y-2">
                    ${subfolders.map(subfolder => `
                        <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span class="text-sm font-medium">${subfolder.name}</span>
                            <span class="text-xs text-gray-500">${getTotalSubfoldersCount(subfolder.id)} subcarpetas</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;
    
    folderDetails.classList.remove('hidden');
}

/** Renderiza la lista completa de elementos, aplicando el filtro de búsqueda y categoría. */
function renderList() {
    const filterText = searchInput.value.toLowerCase().trim();
    let filteredItems = items.filter(item => 
        item.content.toLowerCase().includes(filterText) ||
        item.type.toLowerCase().includes(filterText)
    );

    // Filtrar por categoría
    if (currentCategory !== 'all') {
        const categoryMap = {
            'notes': 'Nota',
            'tasks': 'Tarea',
            'shopping': 'Compra',
            'reminders': 'Recordatorio'
        };
        filteredItems = filteredItems.filter(item => item.type === categoryMap[currentCategory]);
    }

    // En la vista Todo, mostrar TODOS los elementos (con y sin carpeta)
    // En otras vistas, mantener el comportamiento original
    if (currentView !== 'todo') {
        filteredItems = filteredItems.filter(item => !item.folderId);
    }

    itemList.innerHTML = ''; // Limpia la lista

    if (filteredItems.length === 0) {
        itemList.innerHTML = `
            <p class="text-center text-gray-500 dark:text-gray-400 p-8 rounded-xl bg-surface-light dark:bg-surface-dark">
                ${filterText ? 'No se encontraron elementos que coincidan con la búsqueda.' : 'Aún no tienes elementos. Usa el botón "+" para empezar.'}
            </p>
        `;
        return;
    }

    // Ordenar elementos por fecha de modificación descendente (más recientes primero)
    const sortedItems = filteredItems.sort((a, b) => {
        const aDate = a.updatedAt || a.createdAt || 0;
        const bDate = b.updatedAt || b.createdAt || 0;
        return bDate - aDate; // Descendente (más recientes primero)
    });

    sortedItems.forEach(item => {
        const colorConfig = getColorConfig(item.color);
        const statusConfig = getStatusConfig(item.status);
        const icon = getTypeIcon(item.type);
        const isCompleted = item.status === 'completed' || item.status === 'done';

        // Clases dinámicas para el contenedor
        let containerClasses = `flex items-start p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${colorConfig.border} ${colorConfig.bg} `;
        if (isCompleted) {
            containerClasses += ' opacity-60 line-through';
        }

        // Formatear fecha
        const itemDate = new Date(item.date);
        const formattedDate = itemDate.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });

        // Obtener información de la carpeta si existe
        let folderInfo = '';
        if (item.folderId) {
            const folder = getFolderById(item.folderId);
            if (folder) {
                folderInfo = `<span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">📁 de carpeta ${folder.name}</span>`;
            }
        }

        // Genera el HTML del elemento
        const itemHtml = `
            <div id="item-${item.id}" class="${containerClasses}">
                
                <!-- Columna de Icono/Estado (Izquierda) -->
                <div class="flex-shrink-0 mr-4 mt-1">
                    <div class="p-1 rounded-full text-white" style="${getIconColorStyle(item.color)}">${icon}</div>
                </div>

                <!-- Contenido (Centro) -->
                <div class="flex-grow min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <span class="text-xs font-semibold uppercase rounded px-2 py-0.5 ${colorConfig.bg.replace('100', '300')} ${colorConfig.text.replace('800', '900')} dark:bg-opacity-50">${item.type}</span>
                        <span class="text-xs ${colorConfig.text}">${statusConfig.icon} ${statusConfig.name}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">${formattedDate}</span>
                        ${folderInfo}
                    </div>
                    <p class="font-medium ${colorConfig.text} break-words" 
                        data-id="${item.id}" 
                        contenteditable="false"
                        data-original-content="${item.content}">
                        ${item.content}
                    </p>
                </div>

                <!-- Columna de Acciones (Derecha) -->
                <div class="flex-shrink-0 flex flex-col sm:flex-row gap-1 ml-4 mt-0.5">
                    <!-- Botón Editar -->
                    <button data-action="edit" data-id="${item.id}" title="Editar" class="text-gray-500 dark:text-gray-400 hover:text-primary-blue dark:hover:text-primary-blue transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 shadow-sm">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.232z" />
                        </svg>
                    </button>
                    
                    <!-- Botón Exportar -->
                    <button data-action="export" data-id="${item.id}" title="Exportar nota" class="text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 shadow-sm">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </button>
                    
                    <!-- Botón Compartir -->
                    <button data-action="share" data-id="${item.id}" title="Compartir nota" class="text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 shadow-sm">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                    </button>
                    
                    <!-- Menú de opciones adicionales -->
                    <div class="relative">
                        <button class="item-options-btn p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md" data-item-id="${item.id}" title="Más opciones">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                        
                        <!-- Menú desplegable -->
                        <div class="item-options-menu absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 hidden" data-item-id="${item.id}">
                            <div class="py-1">
                                <button class="item-menu-duplicate w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" data-action="duplicate" data-id="${item.id}">
                                    <div class="flex items-center space-x-2">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span>Duplicar</span>
                                    </div>
                                </button>
                                <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                <button class="item-menu-delete w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" data-action="delete" data-id="${item.id}">
                                    <div class="flex items-center space-x-2">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Eliminar</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        itemList.insertAdjacentHTML('beforeend', itemHtml);
    });
    updateSummary();
}

/** Actualiza el cuadro de resumen diario. */
function updateSummary() {
    const today = new Date().toDateString();
    const pendingTasks = items.filter(item => item.status === 'pending').length;
    const completedTasks = items.filter(item => item.status === 'completed' || item.status === 'done').length;
    
    const userName = currentUser || 'Usuario';
    summaryElement.innerHTML = `¡Hola <strong>${userName}</strong>! Tienes <strong>${pendingTasks} elemento${pendingTasks !== 1 ? 's' : ''} pendiente${pendingTasks !== 1 ? 's' : ''}</strong> y <strong>${completedTasks} completado${completedTasks !== 1 ? 's' : ''}</strong>.`;
}

// --- 4. Funciones del Calendario ---

/** Renderiza el calendario */
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Actualizar título del mes
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    calendarMonthYear.textContent = `${monthNames[month]} ${year}`;
    
    // Obtener primer día del mes y días en el mes
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Generar encabezados de días
    const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    let calendarHTML = '<div class="grid grid-cols-7">';
    
    dayHeaders.forEach(day => {
        calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });
    calendarHTML += '</div>';
    
    // Generar días del mes
    calendarHTML += '<div class="grid grid-cols-7">';
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarHTML += '<div class="calendar-day"></div>';
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayItems = items.filter(item => item.date === dateStr);
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        const isSelected = selectedDate === dateStr;
        
        let dayClasses = 'calendar-day';
        if (isToday) dayClasses += ' today';
        if (isSelected) dayClasses += ' selected';
        if (dayItems.length > 0) dayClasses += ' has-items';
        
        calendarHTML += `<div class="${dayClasses}" data-date="${dateStr}">`;
        calendarHTML += `<div class="calendar-day-number">${day}</div>`;
        
        // Mostrar hasta 3 elementos del día con colores por tipo
        dayItems.slice(0, 3).forEach(item => {
            const typeClass = item.type.toLowerCase().replace(' ', '');
            calendarHTML += `<div class="calendar-item-preview ${typeClass}">${item.content.substring(0, 20)}${item.content.length > 20 ? '...' : ''}</div>`;
        });
        
        if (dayItems.length > 3) {
            calendarHTML += `<div class="calendar-more-indicator">+${dayItems.length - 3} más</div>`;
        }
        
        calendarHTML += '</div>';
    }
    
    calendarHTML += '</div>';
    calendarGrid.innerHTML = calendarHTML;
    
    // Agregar event listeners a los días
    calendarGrid.querySelectorAll('[data-date]').forEach(dayElement => {
        dayElement.addEventListener('click', () => {
            selectedDate = dayElement.getAttribute('data-date');
            renderCalendar();
            renderDayDetails(selectedDate);
        });
    });
}

/** Renderiza los detalles del día seleccionado */
function renderDayDetails(dateStr) {
    const dayItems = items.filter(item => item.date === dateStr);
    
    // Corregir el problema de zona horaria parseando la fecha correctamente
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month - 1 porque Date usa 0-indexado para meses
    
    const formattedDate = date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    selectedDayTitle.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    if (dayItems.length === 0) {
        selectedDayItems.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">No hay elementos para este día.</p>';
        return;
    }
    
    // Agrupar elementos por tipo
    const groupedItems = dayItems.reduce((groups, item) => {
        const type = item.type;
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(item);
        return groups;
    }, {});
    
    // Ordenar elementos dentro de cada grupo por fecha de modificación (más recientes primero)
    Object.keys(groupedItems).forEach(type => {
        groupedItems[type].sort((a, b) => {
            const aDate = a.updatedAt || a.createdAt || 0;
            const bDate = b.updatedAt || b.createdAt || 0;
            return bDate - aDate; // Descendente (más recientes primero)
        });
    });
    
    // Crear HTML con secciones expandibles
    let sectionsHTML = '';
    Object.keys(groupedItems).forEach(type => {
        const items = groupedItems[type];
        const typeIcon = getTypeIcon(type);
        const sectionId = `section-${type.toLowerCase().replace(/\s+/g, '-')}`;
        
        sectionsHTML += `
            <div class="mb-4 calendar-section">
                <button 
                    class="w-full flex items-center justify-between p-4 calendar-section-header rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                    onclick="toggleSection('${sectionId}')"
                >
                    <div class="flex items-center space-x-3">
                        <span class="text-xl calendar-section-icon">${typeIcon}</span>
                        <span class="font-semibold text-gray-800 dark:text-gray-200">${type}</span>
                        <span class="element-count text-xs font-medium px-2 py-1 rounded-full">${items.length} elemento${items.length !== 1 ? 's' : ''}</span>
                    </div>
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-200 calendar-section-icon" id="icon-${sectionId}">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <div id="${sectionId}" class="hidden mt-2 space-y-2 calendar-section-content">
                    ${items.map(item => createDayItemHTML(item)).join('')}
                </div>
            </div>
        `;
    });
    
    selectedDayItems.innerHTML = sectionsHTML;
}

/** Crea el HTML para un elemento individual en la vista del día */
function createDayItemHTML(item) {
    const colorConfig = getColorConfig(item.color);
    const statusConfig = getStatusConfig(item.status);
    const icon = getTypeIcon(item.type);
    
    // Obtener información de la carpeta si existe
    let folderInfo = '';
    if (item.folderId) {
        const folder = getFolderById(item.folderId);
        if (folder) {
            folderInfo = `<span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">📁 ${folder.name}</span>`;
        }
    }
    
    // Formatear hora si existe
    let timeInfo = '';
    if (item.type === 'Recordatorio') {
        if (item.time) {
            timeInfo = `<span class="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">🕐 ${item.time}</span>`;
        } else {
            timeInfo = `<span class="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">📅 Sin hora específica</span>`;
        }
    }
    
    return `
        <div class="flex items-center p-3 rounded-lg calendar-item ${colorConfig.bg} border-l-4 ${colorConfig.border} shadow-sm hover:shadow-md transition-all duration-200 hover:transform hover:scale-[1.01]">
            <div class="flex-shrink-0 mr-3">
                <div class="p-2 rounded-full text-white shadow-md" style="${getIconColorStyle(item.color)}">${icon}</div>
            </div>
            <div class="flex-grow">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <span class="text-xs font-medium ${colorConfig.text} bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm">${statusConfig.icon} ${statusConfig.name}</span>
                    ${timeInfo}
                    ${folderInfo}
                </div>
                <p class="font-medium ${colorConfig.text} text-sm">${item.content}</p>
            </div>
            <div class="flex-shrink-0 flex space-x-1 ml-3">
                <button data-action="edit" data-id="${item.id}" title="Editar" class="text-gray-500 dark:text-gray-400 hover:text-primary-blue dark:hover:text-primary-blue transition-colors p-1 rounded hover:bg-white dark:hover:bg-gray-700">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.232z" /></svg>
                </button>
                <button data-action="delete" data-id="${item.id}" title="Eliminar" class="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-white dark:hover:bg-gray-700">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        </div>
    `;
}

/** Función para alternar la visibilidad de una sección */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const icon = document.getElementById(`icon-${sectionId}`);
    const sectionContainer = section.closest('.calendar-section');
    
    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
        sectionContainer.classList.add('open');
    } else {
        section.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
        sectionContainer.classList.remove('open');
    }
}

/** Cambia al mes anterior */
function goToPreviousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

/** Cambia al mes siguiente */
function goToNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

/** Cambia a la vista de Todo */

/** Cambia la categoría activa */
function changeCategory(category) {
    currentCategory = category;
    
    // Actualizar dropdown de categoría
    if (categoryFilter) {
        categoryFilter.value = category;
    }
    
    renderList();
}

// --- 4. Recordatorios y Notificaciones ---

/** Solicita permiso para notificaciones. */
async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.warn("Este navegador no soporta notificaciones de escritorio.");
        updateNotificationStatus();
        return;
    }
    if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        updateNotificationStatus();
        return permission === 'granted';
    }
    updateNotificationStatus();
    return true;
}

/** Lógica simple para simular un recordatorio inmediato si el texto lo sugiere. */
function checkReminders() {
    if (Notification.permission === "granted") {
        const immediateReminder = items.find(item => 
            item.type === 'Recordatorio' && 
            item.content.toLowerCase().includes('inmediato') || item.content.toLowerCase().includes('ahora')
        );

        if (immediateReminder) {
            new Notification("¡Recordatorio de OrganizApp!", {
                body: immediateReminder.content,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233B82F6"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
            });
            // Opcional: Marcar como notificado o eliminar para que no se muestre de nuevo
        }
    }
}

// --- 5. Event Listeners ---

/** Inicializa el selector de colores */
function initializeColorSelector() {
    colorSelector.innerHTML = '';
    
    // Agregar colores predefinidos
    AVAILABLE_COLORS.forEach(color => {
        const colorButton = document.createElement('button');
        colorButton.type = 'button';
        colorButton.className = `w-8 h-8 rounded-full bg-${color.class}-500 border-2 border-transparent hover:border-gray-400 transition-all duration-200 color-option`;
        colorButton.setAttribute('data-color', color.class);
        colorButton.title = color.name;
        colorSelector.appendChild(colorButton);
    });
    
    // Agregar separador visual
    const separator = document.createElement('div');
    separator.className = 'w-full h-px bg-gray-300 dark:bg-gray-600 my-2';
    colorSelector.appendChild(separator);
    
    // Agregar opción de color personalizado con etiqueta
    const customColorContainer = document.createElement('div');
    customColorContainer.className = 'flex items-center space-x-2';
    
    const customColorLabel = document.createElement('span');
    customColorLabel.textContent = 'Color personalizado:';
    customColorLabel.className = 'text-xs text-gray-600 dark:text-gray-400';
    
    const customColorInput = document.createElement('input');
    customColorInput.type = 'color';
    customColorInput.className = 'w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-400 transition-all duration-200 color-option';
    customColorInput.setAttribute('data-color', 'custom');
    customColorInput.title = 'Elegir color personalizado';
    customColorInput.value = '#3B82F6'; // Color por defecto
    
    customColorContainer.appendChild(customColorLabel);
    customColorContainer.appendChild(customColorInput);
    colorSelector.appendChild(customColorContainer);
    
    // Marcar el primer color como seleccionado por defecto
    if (colorSelector.firstChild) {
        colorSelector.firstChild.classList.add('ring-2', 'ring-blue-500');
    }
}

/** Inicializa el selector de colores del modal de edición */
function initializeEditColorSelector() {
    editColorSelector.innerHTML = '';
    
    // Agregar colores predefinidos
    AVAILABLE_COLORS.forEach(color => {
        const colorButton = document.createElement('button');
        colorButton.type = 'button';
        colorButton.className = `w-8 h-8 rounded-full bg-${color.class}-500 border-2 border-transparent hover:border-gray-400 transition-all duration-200 edit-color-option`;
        colorButton.setAttribute('data-color', color.class);
        colorButton.title = color.name;
        editColorSelector.appendChild(colorButton);
    });
    
    // Agregar separador visual
    const separator = document.createElement('div');
    separator.className = 'w-full h-px bg-gray-300 dark:bg-gray-600 my-2';
    editColorSelector.appendChild(separator);
    
    // Agregar opción de color personalizado con etiqueta
    const customColorContainer = document.createElement('div');
    customColorContainer.className = 'flex items-center space-x-2';
    
    const customColorLabel = document.createElement('span');
    customColorLabel.textContent = 'Color personalizado:';
    customColorLabel.className = 'text-xs text-gray-600 dark:text-gray-400';
    
    const customColorInput = document.createElement('input');
    customColorInput.type = 'color';
    customColorInput.className = 'w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-400 transition-all duration-200 edit-color-option';
    customColorInput.setAttribute('data-color', 'custom');
    customColorInput.title = 'Elegir color personalizado';
    customColorInput.value = '#3B82F6'; // Color por defecto
    
    customColorContainer.appendChild(customColorLabel);
    customColorContainer.appendChild(customColorInput);
    editColorSelector.appendChild(customColorContainer);
}

/** Inicializa el selector de colores para crear carpetas */
function initializeFolderColorSelector() {
    if (!folderColorSelector) return;
    
    folderColorSelector.innerHTML = '';
    
    // Agregar colores predefinidos
    AVAILABLE_COLORS.forEach(color => {
        const colorButton = document.createElement('button');
        colorButton.type = 'button';
        colorButton.className = `w-8 h-8 rounded-full bg-${color.class}-500 border-2 border-transparent hover:border-gray-400 transition-all duration-200 folder-color-option`;
        colorButton.setAttribute('data-color', color.class);
        colorButton.title = color.name;
        folderColorSelector.appendChild(colorButton);
    });
    
    // Agregar separador visual
    const separator = document.createElement('div');
    separator.className = 'w-full h-px bg-gray-300 dark:bg-gray-600 my-2';
    folderColorSelector.appendChild(separator);
    
    // Agregar opción de color personalizado con etiqueta
    const customColorContainer = document.createElement('div');
    customColorContainer.className = 'flex items-center space-x-2';
    
    const customColorLabel = document.createElement('span');
    customColorLabel.textContent = 'Color personalizado:';
    customColorLabel.className = 'text-xs text-gray-600 dark:text-gray-400';
    
    const customColorInput = document.createElement('input');
    customColorInput.type = 'color';
    customColorInput.className = 'w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-400 transition-all duration-200 folder-color-option';
    customColorInput.setAttribute('data-color', 'custom');
    customColorInput.title = 'Elegir color personalizado';
    customColorInput.value = '#10B981'; // Color verde por defecto para carpetas
    
    customColorContainer.appendChild(customColorLabel);
    customColorContainer.appendChild(customColorInput);
    folderColorSelector.appendChild(customColorContainer);
    
    // Marcar el primer color como seleccionado por defecto
    if (folderColorSelector.firstChild) {
        folderColorSelector.firstChild.classList.add('ring-2', 'ring-green-500');
    }
}

/** Inicializa el selector de colores para editar carpetas */
function initializeEditFolderColorSelector() {
    if (!editFolderColorSelector) return;
    
    editFolderColorSelector.innerHTML = '';
    
    // Agregar colores predefinidos
    AVAILABLE_COLORS.forEach(color => {
        const colorButton = document.createElement('button');
        colorButton.type = 'button';
        colorButton.className = `w-8 h-8 rounded-full bg-${color.class}-500 border-2 border-transparent hover:border-gray-400 transition-all duration-200 edit-folder-color-option`;
        colorButton.setAttribute('data-color', color.class);
        colorButton.title = color.name;
        editFolderColorSelector.appendChild(colorButton);
    });
    
    // Agregar separador visual
    const separator = document.createElement('div');
    separator.className = 'w-full h-px bg-gray-300 dark:bg-gray-600 my-2';
    editFolderColorSelector.appendChild(separator);
    
    // Agregar opción de color personalizado con etiqueta
    const customColorContainer = document.createElement('div');
    customColorContainer.className = 'flex items-center space-x-2';
    
    const customColorLabel = document.createElement('span');
    customColorLabel.textContent = 'Color personalizado:';
    customColorLabel.className = 'text-xs text-gray-600 dark:text-gray-400';
    
    const customColorInput = document.createElement('input');
    customColorInput.type = 'color';
    customColorInput.className = 'w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-400 transition-all duration-200 edit-folder-color-option';
    customColorInput.setAttribute('data-color', 'custom');
    customColorInput.title = 'Elegir color personalizado';
    customColorInput.value = '#10B981'; // Color verde por defecto para carpetas
    
    customColorContainer.appendChild(customColorLabel);
    customColorContainer.appendChild(customColorInput);
    editFolderColorSelector.appendChild(customColorContainer);
}

/** Abre el modal de edición con los datos del elemento */
function openEditModal(itemId) {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    editingItemId = itemId;
    
    // Llenar el formulario con los datos actuales
    editContentInput.value = item.content;
    editTypeSelector.value = item.type;
    editStatusSelector.value = item.status;
    editDateSelector.value = item.date;
    
    // Configurar hora si es un recordatorio
    const timeContainer = document.getElementById('edit-time-selector-container');
    const timeSelector = document.getElementById('edit-time-selector');
    if (item.type === 'Recordatorio' && item.time) {
        timeSelector.value = item.time;
        timeContainer.classList.remove('hidden');
    } else {
        timeContainer.classList.add('hidden');
    }
    
    // Asegurar que las carpetas estén cargadas
    if (folders.length === 0) {
        loadFolders();
    }
    
    // Poblar el selector de carpetas y seleccionar la carpeta actual
    populateEditFolderSelector(item.folderId);
    
    // Cambiar el texto del label dinámicamente
    if (item.folderId) {
        const folder = getFolderById(item.folderId);
        if (folder) {
            editFolderLabel.textContent = `Cambiar carpeta (actual: ${folder.name})`;
        } else {
            editFolderLabel.textContent = 'Cambiar carpeta';
        }
    } else {
        editFolderLabel.textContent = 'Carpeta';
    }
    
    // Configurar colores
    initializeEditColorSelector();
    
    // Marcar el color actual como seleccionado
    document.querySelectorAll('.edit-color-option').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-blue-500');
        
        // Si es un color personalizado (hex)
        if (item.color && item.color.startsWith('#')) {
            if (btn.type === 'color') {
                btn.value = item.color;
                btn.classList.add('ring-2', 'ring-blue-500');
            }
        } else {
            // Si es un color predefinido
            if (btn.getAttribute('data-color') === item.color) {
                btn.classList.add('ring-2', 'ring-blue-500');
            }
        }
    });
    
    editModal.classList.remove('hidden');
    editContentInput.focus();
}

/** Actualiza un elemento existente */
function updateItem(itemId, content, type, colorClass, statusClass, date, folderId = null, time = null) {
    const item = items.find(i => i.id === itemId);
    if (item) {
        item.content = content.trim();
        item.type = type;
        item.color = colorClass;
        item.status = statusClass;
        item.date = date;
        item.time = time || null; // Actualizar hora del recordatorio
        item.folderId = folderId || null; // Actualizar carpeta
        item.updatedAt = Date.now();
        
        saveItems();
        renderList();
        
        // Si estamos viendo el contenido de una carpeta, actualizar la vista
        if (currentView === 'folders' && currentFolderView === 'content' && selectedFolderId) {
            renderFolderItems(selectedFolderId);
        }
        
        showSystemMessage("Elemento actualizado correctamente.");
        
        // Programar notificaciones si es un recordatorio
        handleReminderNotifications(item);
        
        // Actualizar calendario si está visible
        if (!calendarView.classList.contains('hidden')) {
            renderCalendar();
            if (selectedDate) {
                renderDayDetails(selectedDate);
            }
        }
    }
}

/** Manejador de eventos para el FAB */
fab.addEventListener('click', () => {
    if (currentView === 'folders' && currentFolderView === 'content' && selectedFolderId) {
        // Si estamos viendo el contenido de una carpeta, crear elemento en esa carpeta
        openCreateItemModal(selectedFolderId);
    } else if (currentView === 'folders') {
        // Si estamos en la lista de carpetas, crear carpeta principal
        openCreateFolderModal();
    } else {
        // En otras vistas, crear elemento normal
        universalInput.value = '';
        typeSelector.value = 'Nota';
        statusSelector.value = 'pending';
        dateSelector.value = new Date().toISOString().split('T')[0]; // Fecha actual
        
        // Resetear selección de colores
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-blue-500');
        });
        if (colorSelector.firstChild) {
            colorSelector.firstChild.classList.add('ring-2', 'ring-blue-500');
        }
        
        modal.classList.remove('hidden');
        universalInput.focus();
    }
});

/** Manejador de eventos para cerrar el modal */
cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

/** Manejador de eventos para el botón Agregar */
addBtn.addEventListener('click', () => {
    console.log('Add button clicked');
    
    const content = universalInput.value.trim();
    const type = typeSelector.value;
    const status = statusSelector.value;
    const date = dateSelector.value;
    const folderId = folderSelector.value || null; // Obtener carpeta seleccionada
    const time = document.getElementById('time-selector').value || null; // Obtener hora seleccionada
    
    console.log('Form values:', { content, type, status, date, folderId, time });
    
    // Obtener color seleccionado
    const selectedColor = getSelectedColor('color-option');
    
    console.log('Selected color:', selectedColor);
    
    if (content) {
        // Agregar elemento con carpeta seleccionada y hora
        addItem(content, type, selectedColor, status, date, folderId, time);
        console.log('Closing modal');
        modal.classList.add('hidden');
    } else {
        showSystemMessage("El contenido no puede estar vacío.", 'error');
        universalInput.focus();
    }
});

/** Manejador de eventos para selección de colores */
colorSelector.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-option')) {
        // Remover selección anterior
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-blue-500');
        });
        
        // Marcar nuevo color como seleccionado
        e.target.classList.add('ring-2', 'ring-blue-500');
    }
});

// Event listener para cambios en el color picker personalizado
colorSelector.addEventListener('change', (e) => {
    if (e.target.type === 'color' && e.target.classList.contains('color-option')) {
        // Remover selección anterior
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-blue-500');
        });
        
        // Marcar el color picker como seleccionado
        e.target.classList.add('ring-2', 'ring-blue-500');
    }
});

/** Manejador de eventos delegados para la lista (completar, editar, eliminar) */
itemList.addEventListener('click', (e) => {
    console.log('Click en itemList:', e.target);
    const target = e.target.closest('button[data-action]');
    if (!target) {
        console.log('No se encontró botón con data-action');
        return;
    }

    const action = target.getAttribute('data-action');
    const id = target.getAttribute('data-id');
    
    console.log('Acción:', action, 'ID:', id);

    switch (action) {
        case 'toggle-complete':
            toggleItemCompleted(id);
            break;
        case 'delete':
            deleteItem(id);
            break;
        case 'edit':
            openEditModal(id);
            break;
        case 'export':
            console.log('Ejecutando exportNote con ID:', id);
            exportNote(id);
            break;
        case 'share':
            shareNote(id);
            break;
    }
});

/** Manejador de eventos delegados para los elementos dentro de carpetas */
folderItemsList.addEventListener('click', (e) => {
    const target = e.target.closest('button[data-action]');
    if (!target) return;

    const action = target.getAttribute('data-action');
    const id = target.getAttribute('data-id');

    switch (action) {
        case 'toggle-complete':
            toggleItemCompleted(id);
            break;
        case 'delete':
            deleteItem(id);
            break;
        case 'edit':
            openEditModal(id);
            break;
        case 'export':
            exportNote(id);
            break;
        case 'share':
            shareNote(id);
            break;
        case 'duplicate':
            duplicateItem(id);
            break;
    }
});

/** Event listeners para mostrar/ocultar selector de hora */
document.addEventListener('change', (e) => {
    // Mostrar/ocultar selector de hora para Recordatorios
    if (e.target.id === 'type-selector') {
        const timeContainer = document.getElementById('time-selector-container');
        if (timeContainer) {
            if (e.target.value === 'Recordatorio') {
                timeContainer.classList.remove('hidden');
            } else {
                timeContainer.classList.add('hidden');
            }
        }
    }
    
    // Mostrar/ocultar selector de hora para Recordatorios en edición
    if (e.target.id === 'edit-type-selector') {
        const timeContainer = document.getElementById('edit-time-selector-container');
        if (timeContainer) {
            if (e.target.value === 'Recordatorio') {
                timeContainer.classList.remove('hidden');
            } else {
                timeContainer.classList.add('hidden');
            }
        }
    }
});

/** Event listeners para el sistema de carpetas jerárquico */
/** Manejador de eventos para el sistema de carpetas */
document.addEventListener('click', (e) => {
    // Click en carpeta para abrirla (pero no en botones de opciones)
    if (e.target.closest('.folder-card') && !e.target.closest('.folder-options-btn') && !e.target.closest('.folder-options-menu')) {
        const folderCard = e.target.closest('.folder-card');
        const folderId = folderCard.getAttribute('data-folder-id');
        showFolderContentView(folderId);
    }
    
    // Click en botón de opciones de carpeta
    if (e.target.closest('.folder-options-btn')) {
        e.preventDefault();
        e.stopPropagation();
        const optionsBtn = e.target.closest('.folder-options-btn');
        const folderId = optionsBtn.getAttribute('data-folder-id');
        
        // Cerrar otros menús abiertos
        document.querySelectorAll('.folder-options-menu').forEach(menu => {
            if (menu.getAttribute('data-folder-id') !== folderId) {
                menu.classList.add('hidden');
            }
        });
        
        // Toggle del menú actual
        const menu = document.querySelector(`.folder-options-menu[data-folder-id="${folderId}"]`);
        if (menu) {
            menu.classList.toggle('hidden');
        }
    }
    
    // Click en opciones del menú de carpeta
    if (e.target.closest('.folder-menu-edit, .folder-menu-export, .folder-menu-share, .folder-menu-delete')) {
        e.preventDefault();
        e.stopPropagation();
        const menuItem = e.target.closest('[data-action]');
        const action = menuItem.getAttribute('data-action');
        const folderId = menuItem.getAttribute('data-folder-id');
        
        console.log('Click en menú de carpeta:', action, 'Folder ID:', folderId);
        
        // Cerrar el menú
        const menu = document.querySelector(`.folder-options-menu[data-folder-id="${folderId}"]`);
        if (menu) {
            menu.classList.add('hidden');
        }
        
        // Ejecutar acción
        switch (action) {
            case 'edit':
                openEditFolderModal(folderId);
                break;
            case 'export':
                console.log('Ejecutando exportFolder con ID:', folderId);
                exportFolder(folderId);
                break;
            case 'share':
                shareFolder(folderId);
                break;
            case 'delete':
                if (confirm('¿Estás seguro de que quieres eliminar esta carpeta y todos sus elementos?')) {
                    deleteFolder(folderId);
                }
                break;
        }
    }
    
    // Click en botón de editar carpeta (desde contenido de carpeta)
    if (e.target.closest('#edit-folder-from-content-btn')) {
        e.preventDefault();
        e.stopPropagation();
        const editBtn = e.target.closest('#edit-folder-from-content-btn');
        const folderId = editBtn.getAttribute('data-folder-id');
        if (folderId) {
            openEditFolderModal(folderId);
        }
    }
    
    // Click en botón de volver a carpetas
    if (e.target.closest('#back-to-folders-btn')) {
        showFoldersListView();
    }
    
    // Cerrar menús al hacer click fuera de ellos
    if (!e.target.closest('.folder-options-btn') && !e.target.closest('.folder-options-menu') && 
        !e.target.closest('.item-options-btn') && !e.target.closest('.item-options-menu')) {
        document.querySelectorAll('.folder-options-menu, .item-options-menu').forEach(menu => {
            menu.classList.add('hidden');
        });
    }
});

/** Manejador de eventos para dropdown de estado */
itemList.addEventListener('change', (e) => {
    const target = e.target.closest('select[data-action]');
    if (!target || target.getAttribute('data-action') !== 'change-status') return;

    const id = target.getAttribute('data-id');
    const newStatus = target.value;
    changeItemStatus(id, newStatus);
});

/** Manejador de eventos para dropdown de estado en carpetas */
folderItemsList.addEventListener('change', (e) => {
    const target = e.target.closest('select[data-action]');
    if (!target || target.getAttribute('data-action') !== 'change-status') return;

    const id = target.getAttribute('data-id');
    const newStatus = target.value;
    changeItemStatus(id, newStatus);
});

/** Manejador de búsqueda en tiempo real */
searchInput.addEventListener('input', renderList);

/** Event listeners para navegación de vistas */
homeViewBtn.addEventListener('click', showTodoView);
calendarViewBtn.addEventListener('click', showCalendarView);
foldersViewBtn.addEventListener('click', showFoldersView);

/** Event listeners para botones de carpetas */
createFolderBtn.addEventListener('click', openCreateFolderModal);

/** Event listeners para importar/exportar/compartir */
document.getElementById('import-btn').addEventListener('click', importFile);

/** Event listener para compartir versículo */
document.getElementById('share-verse-btn').addEventListener('click', shareVerse);

/** Event listeners para selectores de emoji de carpetas */
document.addEventListener('click', (e) => {
    // Selector de emoji para crear carpeta
    if (e.target.closest('.folder-emoji-option')) {
        e.preventDefault();
        const emojiBtn = e.target.closest('.folder-emoji-option');
        const emoji = emojiBtn.getAttribute('data-emoji');
        
        // Remover selección anterior
        document.querySelectorAll('.folder-emoji-option').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-green-500', 'bg-green-100', 'dark:bg-green-900/30');
        });
        
        // Marcar como seleccionado
        emojiBtn.classList.add('ring-2', 'ring-green-500', 'bg-green-100', 'dark:bg-green-900/30');
    }
    
    // Selector de emoji para editar carpeta
    if (e.target.closest('.edit-folder-emoji-option')) {
        e.preventDefault();
        const emojiBtn = e.target.closest('.edit-folder-emoji-option');
        const emoji = emojiBtn.getAttribute('data-emoji');
        
        // Remover selección anterior
        document.querySelectorAll('.edit-folder-emoji-option').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-orange-500', 'bg-orange-100', 'dark:bg-orange-900/30');
        });
        
        // Marcar como seleccionado
        emojiBtn.classList.add('ring-2', 'ring-orange-500', 'bg-orange-100', 'dark:bg-orange-900/30');
    }
});

/** NUEVA FUNCIÓN SIMPLE PARA MANEJAR MENÚS DE TRES PUNTOS */
function toggleItemMenu(itemId) {
    console.log('🎯 toggleItemMenu called with ID:', itemId);
    
    // Cerrar todos los otros menús primero
    document.querySelectorAll('.item-options-menu').forEach(menu => {
        if (menu.id !== `menu-${itemId}`) {
            menu.classList.add('hidden');
        }
    });
    
    // Toggle del menú actual
    const menu = document.getElementById(`menu-${itemId}`);
    if (menu) {
        const isHidden = menu.classList.contains('hidden');
        console.log('📋 Menu found:', menu, 'isHidden:', isHidden);
        
        if (isHidden) {
            menu.classList.remove('hidden');
            console.log('✅ Menu shown');
        } else {
            menu.classList.add('hidden');
            console.log('❌ Menu hidden');
        }
    } else {
        console.error('❌ Menu not found for ID:', itemId);
    }
}

/** Event listeners para menús de opciones de notas */
document.addEventListener('click', (e) => {
    // Click en botón de opciones de nota
    if (e.target.closest('.item-options-btn')) {
        e.preventDefault();
        e.stopPropagation();
        const optionsBtn = e.target.closest('.item-options-btn');
        const itemId = optionsBtn.getAttribute('data-item-id');
        
        console.log('🔍 Click en botón de opciones:', {
            itemId: itemId,
            button: optionsBtn,
            isInFolder: optionsBtn.closest('#folder-items-list') !== null,
            parentContainer: optionsBtn.closest('#folder-items-list') ? 'folder-items-list' : 'item-list'
        });
        
        // Cerrar otros menús abiertos
        document.querySelectorAll('.item-options-menu').forEach(menu => {
            if (menu.getAttribute('data-item-id') !== itemId) {
                menu.classList.add('hidden');
            }
        });
        
        // Toggle del menú actual
        const menu = document.querySelector(`.item-options-menu[data-item-id="${itemId}"]`);
        console.log('🎯 Menú encontrado:', {
            menu: menu,
            exists: !!menu,
            isHidden: menu ? menu.classList.contains('hidden') : 'N/A',
            classes: menu ? menu.className : 'N/A',
            computedStyle: menu ? window.getComputedStyle(menu).display : 'N/A'
        });
        
        if (menu) {
            const isHidden = menu.classList.contains('hidden');
            
            if (isHidden) {
                // Primero mostrar el menú para obtener sus dimensiones reales
                menu.classList.remove('hidden');
                
                console.log('✅ Menú mostrado:', {
                    classes: menu.className,
                    computedStyle: window.getComputedStyle(menu).display,
                    visibility: window.getComputedStyle(menu).visibility,
                    opacity: window.getComputedStyle(menu).opacity,
                    zIndex: window.getComputedStyle(menu).zIndex
                });
                
                // Calcular posición del menú de manera más inteligente para position: fixed
                const rect = optionsBtn.getBoundingClientRect();
                const menuRect = menu.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                console.log('Menu positioning debug (fixed):', {
                    buttonRect: rect,
                    menuRect: menuRect,
                    viewport: { width: viewportWidth, height: viewportHeight }
                });
                
                // Para position: fixed, usar coordenadas absolutas de la ventana
                let left = rect.left - menuRect.width - 8; // 8px de separación
                let top = rect.bottom + 8;
                
                // Si se sale por la izquierda, posicionar a la derecha del botón
                if (left < 8) {
                    left = rect.right + 8;
                    console.log('Adjusted left: positioned to the right of button');
                }
                
                // Si aún se sale por la derecha, centrar horizontalmente
                if (left + menuRect.width > viewportWidth - 8) {
                    left = Math.max(8, (viewportWidth - menuRect.width) / 2);
                    console.log('Adjusted left: centered horizontally');
                }
                
                // Ajustar posición vertical
                if (top + menuRect.height > viewportHeight - 8) {
                    // Intentar posicionar arriba del botón
                    if (rect.top - menuRect.height - 8 > 8) {
                        top = rect.top - menuRect.height - 8;
                        console.log('Adjusted top: positioned above button');
                    } else {
                        // Si no cabe arriba, centrar verticalmente
                        top = Math.max(8, (viewportHeight - menuRect.height) / 2);
                        console.log('Adjusted top: centered vertically');
                    }
                }
                
                console.log('Final position:', { left, top });
                
                // Aplicar posición final
                menu.style.position = 'fixed';
                menu.style.left = `${left}px`;
                menu.style.top = `${top}px`;
                menu.style.zIndex = '9999';
            } else {
                menu.classList.add('hidden');
            }
        }
    }
    
    // Click en opciones del menú de nota
    if (e.target.closest('.item-menu-duplicate, .item-menu-delete')) {
        e.preventDefault();
        e.stopPropagation();
        const menuItem = e.target.closest('[data-action]');
        const action = menuItem.getAttribute('data-action');
        const itemId = menuItem.getAttribute('data-id');
        
        // Cerrar el menú
        const menu = document.querySelector(`.item-options-menu[data-item-id="${itemId}"]`);
        if (menu) {
            menu.classList.add('hidden');
        }
        
        // Ejecutar acción
        switch (action) {
            case 'duplicate':
                duplicateItem(itemId);
                break;
            case 'delete':
                deleteItem(itemId);
                break;
        }
    }
});

/** Event listeners para modales de carpetas */
// Modal crear carpeta
document.getElementById('cancel-folder-btn').addEventListener('click', () => {
    createFolderModal.classList.add('hidden');
});

document.getElementById('create-folder-confirm-btn').addEventListener('click', () => {
    const name = folderNameInput.value.trim();
    const description = folderDescriptionInput.value.trim();
    const color = getSelectedFolderColor('folder-color-option');
    const emoji = getSelectedFolderEmoji('folder-emoji-option');
    
    if (name) {
        createFolder(name, description, color, emoji);
        createFolderModal.classList.add('hidden');
    } else {
        showSystemMessage("El nombre de la carpeta es obligatorio.", 'error');
        folderNameInput.focus();
    }
});

// Modal editar carpeta
document.getElementById('cancel-edit-folder-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    editFolderModal.classList.add('hidden');
    editingFolderId = null; // Limpiar el ID de edición
});

document.getElementById('save-folder-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const name = editFolderNameInput.value.trim();
    const description = editFolderDescriptionInput.value.trim();
    const color = getSelectedFolderColor('edit-folder-color-option');
    const emoji = getSelectedEditFolderEmoji('edit-folder-emoji-option');
    
    if (name && editingFolderId) {
        updateFolder(editingFolderId, name, description, color, emoji);
        editFolderModal.classList.add('hidden');
        editingFolderId = null; // Limpiar el ID de edición
    } else if (!name) {
        showSystemMessage("El nombre de la carpeta es obligatorio.", 'error');
        editFolderNameInput.focus();
    }
});

// Botón eliminar carpeta
document.getElementById('delete-folder-btn').addEventListener('click', () => {
    if (editingFolderId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta carpeta? Todos los elementos dentro de ella también se eliminarán.')) {
            deleteFolder(editingFolderId);
            editFolderModal.classList.add('hidden');
            editingFolderId = null;
        }
    }
});

// Event listeners para selectores de color de carpetas
if (folderColorSelector) {
    folderColorSelector.addEventListener('click', (e) => {
        if (e.target.classList.contains('folder-color-option')) {
            // Remover ring de todos los elementos
            folderColorSelector.querySelectorAll('.folder-color-option').forEach(option => {
                option.classList.remove('ring-2', 'ring-green-500');
            });
            // Agregar ring al elemento clickeado
            e.target.classList.add('ring-2', 'ring-green-500');
        }
    });
    
    folderColorSelector.addEventListener('change', (e) => {
        if (e.target.type === 'color') {
            // Remover ring de todos los elementos
            folderColorSelector.querySelectorAll('.folder-color-option').forEach(option => {
                option.classList.remove('ring-2', 'ring-green-500');
            });
            // Agregar ring al color picker
            e.target.classList.add('ring-2', 'ring-green-500');
        }
    });
}

if (editFolderColorSelector) {
    editFolderColorSelector.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-folder-color-option')) {
            // Remover ring de todos los elementos
            editFolderColorSelector.querySelectorAll('.edit-folder-color-option').forEach(option => {
                option.classList.remove('ring-2', 'ring-green-500');
            });
            // Agregar ring al elemento clickeado
            e.target.classList.add('ring-2', 'ring-green-500');
        }
    });
    
    editFolderColorSelector.addEventListener('change', (e) => {
        if (e.target.type === 'color') {
            // Remover ring de todos los elementos
            editFolderColorSelector.querySelectorAll('.edit-folder-color-option').forEach(option => {
                option.classList.remove('ring-2', 'ring-green-500');
            });
            // Agregar ring al color picker
            e.target.classList.add('ring-2', 'ring-green-500');
        }
    });
}

/** Event listeners para categorías */
categoryFilter.addEventListener('change', (e) => {
    const category = e.target.value;
    changeCategory(category);
});

/** Event listeners para navegación del calendario */
prevMonthBtn.addEventListener('click', goToPreviousMonth);
nextMonthBtn.addEventListener('click', goToNextMonth);

/** Event listeners para registro de usuario */
saveNameBtn.addEventListener('click', () => {
    const userName = userNameInput.value.trim();
    if (userName) {
        saveUserName(userName);
        userRegistrationModal.classList.add('hidden');
        updateSummary();
        
        // Mostrar bienvenida después del registro
        setTimeout(() => {
            showDailyWelcome();
        }, 500);
    } else {
        showSystemMessage("Por favor ingresa tu nombre.", 'error');
        userNameInput.focus();
    }
});

userNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveNameBtn.click();
    }
});

/** Event listeners para bienvenida diaria */
closeWelcomeBtn.addEventListener('click', () => {
    dailyWelcomeModal.classList.add('hidden');
    markDailyWelcomeShown();
    
    // Mostrar mensaje adicional después de cerrar
    setTimeout(() => {
        showAdditionalMessage();
    }, 500);
});

/** Event listeners para modal de edición */
editCancelBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
    editingItemId = null;
});

editSaveBtn.addEventListener('click', () => {
    if (!editingItemId) return;
    
    const content = editContentInput.value.trim();
    const type = editTypeSelector.value;
    const status = editStatusSelector.value;
    const date = editDateSelector.value;
    const folderId = editFolderSelector.value || null; // Obtener carpeta seleccionada
    const time = document.getElementById('edit-time-selector').value || null; // Obtener hora seleccionada
    
    // Obtener color seleccionado
    const selectedColor = getSelectedColor('edit-color-option');
    
    if (content) {
        // Actualizar elemento con carpeta seleccionada y hora
        updateItem(editingItemId, content, type, selectedColor, status, date, folderId, time);
        editModal.classList.add('hidden');
        editingItemId = null;
    } else {
        showSystemMessage("El contenido no puede estar vacío.", 'error');
        editContentInput.focus();
    }
});

/** Event listener para selección de colores en modal de edición */
editColorSelector.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-color-option')) {
        // Remover selección anterior
        document.querySelectorAll('.edit-color-option').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-blue-500');
        });
        
        // Marcar nuevo color como seleccionado
        e.target.classList.add('ring-2', 'ring-blue-500');
    }
});

// Event listener para cambios en el color picker personalizado del modal de edición
editColorSelector.addEventListener('change', (e) => {
    if (e.target.type === 'color' && e.target.classList.contains('edit-color-option')) {
        // Remover selección anterior
        document.querySelectorAll('.edit-color-option').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-blue-500');
        });
        
        // Marcar el color picker como seleccionado
        e.target.classList.add('ring-2', 'ring-blue-500');
    }
});

/** Event listener para acciones en los detalles del día */
selectedDayItems.addEventListener('click', (e) => {
    const target = e.target.closest('button[data-action]');
    if (!target) return;

    const action = target.getAttribute('data-action');
    const id = target.getAttribute('data-id');

    switch (action) {
        case 'edit':
            openEditModal(id);
            break;
        case 'delete':
            deleteItem(id);
            // Actualizar la vista del calendario y detalles
            renderCalendar();
            if (selectedDate) {
                renderDayDetails(selectedDate);
            }
            break;
    }
});

/** Event listener para dropdown de estado en detalles del día */
selectedDayItems.addEventListener('change', (e) => {
    const target = e.target.closest('select[data-action]');
    if (!target || target.getAttribute('data-action') !== 'change-status') return;

    const id = target.getAttribute('data-id');
    const newStatus = target.value;
    changeItemStatus(id, newStatus);
    
    // Actualizar la vista del calendario y detalles
    renderCalendar();
    if (selectedDate) {
        renderDayDetails(selectedDate);
    }
});

/** Manejador del Modo Oscuro */
function initializeDarkMode() {
    // 1. Verificar preferencia del sistema
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    // 2. Cargar preferencia local (si existe)
    const localTheme = localStorage.getItem('theme');
    
    if (localTheme === 'dark' || (!localTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        // Asegurar que el toggle muestre el icono correcto (se maneja en CSS con dark:block/hidden)
    } else {
        document.documentElement.classList.remove('dark');
    }
}

themeToggle.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
});

/** Registra el Service Worker si está disponible. */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // CORRECCIÓN: Usar una ruta relativa 'service-worker.js' en lugar de la absoluta '/service-worker.js'
            // Esto evita el error de protocolo en entornos de ejecución restringidos.
            navigator.serviceWorker.register('service-worker.js') 
                .then(registration => {
                    console.log('Service Worker: Registrado con éxito. Alcance:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker: Fallo el registro:', error);
                });
        });
    }
}

// --- Funciones para Modales de Carpetas ---

/** Abre el modal para crear una nueva carpeta */
function openCreateFolderModal() {
    folderNameInput.value = '';
    folderDescriptionInput.value = '';
    initializeFolderColorSelector();
    createFolderModal.classList.remove('hidden');
    folderNameInput.focus();
}

/** Abre el modal para editar una carpeta */
function openEditFolderModal(folderId) {
    const folder = getFolderById(folderId);
    if (!folder) return;
    
    editingFolderId = folderId;
    editFolderNameInput.value = folder.name;
    editFolderDescriptionInput.value = folder.description || '';
    
    // Inicializar selector de colores y marcar el color actual
    initializeEditFolderColorSelector();
    
    // Marcar el color actual como seleccionado
    const colorOptions = editFolderColorSelector.querySelectorAll('.edit-folder-color-option');
    colorOptions.forEach(option => {
        option.classList.remove('ring-2');
        if (option.getAttribute('data-color') === folder.color) {
            option.classList.add('ring-2', 'ring-green-500');
        } else if (option.type === 'color' && folder.color && folder.color.startsWith('#')) {
            option.value = folder.color;
            option.classList.add('ring-2', 'ring-green-500');
        }
    });
    
    // Marcar el emoji actual como seleccionado
    const emojiOptions = document.querySelectorAll('.edit-folder-emoji-option');
    emojiOptions.forEach(option => {
        option.classList.remove('ring-2', 'ring-orange-500', 'bg-orange-100', 'dark:bg-orange-900/30');
        if (option.getAttribute('data-emoji') === (folder.emoji || '📁')) {
            option.classList.add('ring-2', 'ring-orange-500', 'bg-orange-100', 'dark:bg-orange-900/30');
        }
    });
    
    editFolderModal.classList.remove('hidden');
    editFolderNameInput.focus();
}

/** Cierra todos los modales de carpetas */
function closeFolderModals() {
    createFolderModal.classList.add('hidden');
    editFolderModal.classList.add('hidden');
}

// --- 6. Inicialización de la Aplicación ---

/** Inicializa la aplicación al cargar la página. */
function initializeApp() {
    initializeDarkMode();
    initializeColorSelector();
    initializeEditColorSelector();
    initializeFolderColorSelector();
    initializeEditFolderColorSelector();
    loadItems();
    loadFolders(); // Cargar carpetas
    
    // Verificar si es usuario nuevo
    if (isFirstTimeUser()) {
        userRegistrationModal.classList.remove('hidden');
        userNameInput.focus();
    } else {
        // Usuario existente - verificar si debe mostrar bienvenida diaria
        if (shouldShowDailyWelcome()) {
            setTimeout(() => {
                showDailyWelcome();
            }, 1000); // Pequeño delay para mejor UX
        }
    }
    
    renderList();
    updateSummary();
    registerServiceWorker(); // <--- Registro del Service Worker
    initializeVerseSystem(); // <--- Inicializar sistema de versículo del día
    
    // Solicitar permisos de notificación y programar recordatorios
    requestNotificationPermission();
    scheduleAllReminderNotifications();
    
    // Actualizar estado de notificaciones en la UI
    updateNotificationStatus();
    
    // Asegurar que el botón FAB esté visible
    ensureFabVisibility();
    
    authReady = true;
    console.log("OrganizApp inicializado. Datos cargados:", items.length);
    console.log("Carpetas cargadas:", folders.length);
    
    // Crear carpetas de ejemplo si no hay ninguna
    if (folders.length === 0) {
        console.log("No hay carpetas, creando carpetas de ejemplo...");
        createFolder("Trabajo", "Carpeta para proyectos y tareas laborales");
        createFolder("Personal", "Carpeta para asuntos personales");
        createFolder("Estudio", "Carpeta para materiales de estudio");
    }

    // Revisar recordatorios periódicamente
    // setInterval(checkReminders, 60000); // Cada minuto (opcional)
}

// Ejecutar la inicialización
// === FUNCIONALIDADES PWA ===

let deferredPrompt;
let isInstalled = false;

/** Inicializa las funcionalidades PWA */
function initializePWA() {
    // Detectar evento de instalación
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('[PWA] Evento beforeinstallprompt detectado');
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });
    
    // Detectar si la app ya está instalada
    window.addEventListener('appinstalled', () => {
        console.log('[PWA] App instalada correctamente');
        isInstalled = true;
        hideInstallButton();
        showSystemMessage('¡App instalada correctamente! 🎉', 'success');
    });
    
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
        isInstalled = true;
        console.log('[PWA] App ejecutándose en modo standalone');
    }
    
    // Manejar actualizaciones del Service Worker
    if ('serviceWorker' in navigator) {
        // Escuchar mensajes del Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'NEW_VERSION_AVAILABLE') {
                console.log('[PWA] Nueva versión detectada:', event.data.version);
                showUpdateModal(event.data.message);
            }
        });
        
        // Manejar cambios de controlador
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[PWA] Service Worker actualizado, recargando...');
            window.location.reload();
        });
        
        // Verificar actualizaciones periódicamente
        setInterval(() => {
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration) {
                    registration.update();
                }
            });
        }, 60000); // Verificar cada minuto
    }
}

/** Muestra el botón de instalación */
function showInstallButton() {
    // Crear botón de instalación si no existe
    if (!document.getElementById('install-btn')) {
        const installBtn = document.createElement('button');
        installBtn.id = 'install-btn';
        installBtn.innerHTML = '📱 Instalar App';
        installBtn.className = 'fixed bottom-20 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 z-50';
        installBtn.style.display = 'none';
        
        installBtn.addEventListener('click', installApp);
        document.body.appendChild(installBtn);
        
        // Mostrar con animación
        setTimeout(() => {
            installBtn.style.display = 'block';
            installBtn.style.animation = 'fadeInUp 0.5s ease forwards';
        }, 2000);
    }
}

/** Oculta el botón de instalación */
function hideInstallButton() {
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => {
            installBtn.remove();
        }, 500);
    }
}

/** Instala la app */
async function installApp() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('[PWA] Usuario aceptó la instalación');
    } else {
        console.log('[PWA] Usuario rechazó la instalación');
    }
    
    deferredPrompt = null;
    hideInstallButton();
}

/** Muestra notificación de actualización */
function showUpdateNotification() {
    const updateNotification = document.createElement('div');
    updateNotification.id = 'update-notification';
    updateNotification.innerHTML = `
        <div class="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <span class="text-2xl mr-3">🔄</span>
                    <div>
                        <h3 class="font-bold">Nueva versión disponible</h3>
                        <p class="text-sm opacity-90">Actualiza para obtener las últimas mejoras</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button id="update-btn" class="bg-white text-green-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                        Actualizar
                    </button>
                    <button id="dismiss-update" class="text-white opacity-70 hover:opacity-100 transition-opacity">
                        ✕
                    </button>
                </div>
            </div>
        </div>
    `;
    
    updateNotification.className = 'fixed top-4 left-4 right-4 z-50 transform -translate-y-full transition-transform duration-300';
    document.body.appendChild(updateNotification);
    
    // Animar entrada
    setTimeout(() => {
        updateNotification.style.transform = 'translateY(0)';
    }, 100);
    
    // Event listeners
    document.getElementById('update-btn').addEventListener('click', () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
            });
        }
    });
    
    document.getElementById('dismiss-update').addEventListener('click', () => {
        updateNotification.style.transform = '-translate-y-full';
        setTimeout(() => {
            updateNotification.remove();
        }, 300);
    });
}

/** Muestra modal de actualización */
function showUpdateModal(message) {
    // Crear modal de actualización si no existe
    if (document.getElementById('update-modal')) {
        return; // Ya existe, no crear otro
    }
    
    const updateModal = document.createElement('div');
    updateModal.id = 'update-modal';
    updateModal.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-surface-dark rounded-xl p-6 w-full max-w-md shadow-2xl transition-all duration-300 transform scale-100">
                <div class="text-center">
                    <div class="text-6xl mb-4">🔄</div>
                    <h3 class="text-xl font-bold mb-4 dark:text-gray-100">Nueva Versión Disponible</h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-6">${message}</p>
                    <div class="flex space-x-3 justify-center">
                        <button id="reload-app-btn" class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                            Recargar App
                        </button>
                        <button id="close-update-modal" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            Más Tarde
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(updateModal);
    
    // Event listeners
    document.getElementById('reload-app-btn').addEventListener('click', () => {
        window.location.reload();
    });
    
    document.getElementById('close-update-modal').addEventListener('click', () => {
        updateModal.remove();
    });
    
    // Auto-cerrar después de 30 segundos
    setTimeout(() => {
        if (document.getElementById('update-modal')) {
            updateModal.remove();
        }
    }, 30000);
}

/** Muestra mensajes adicionales después del modal principal */
function showAdditionalMessage() {
    if (!currentUser) return;
    
    const additionalMessages = [
        {
            icon: '💡',
            message: `¡Recuerda ${currentUser}! Cada pequeña acción te acerca a tus metas.`,
            type: 'tip'
        },
        {
            icon: '🌟',
            message: `¡Tu dedicación es inspiradora, ${currentUser}! Sigue así.`,
            type: 'motivation'
        },
        {
            icon: '🎯',
            message: `¡Enfócate en una tarea a la vez, ${currentUser}! La calidad importa más que la cantidad.`,
            type: 'focus'
        },
        {
            icon: '⚡',
            message: `¡Tu energía positiva es contagiosa, ${currentUser}! ¡Aprovecha ese momentum!`,
            type: 'energy'
        },
        {
            icon: '🏆',
            message: `¡Cada logro cuenta, ${currentUser}! Celebra tus victorias, por pequeñas que sean.`,
            type: 'achievement'
        },
        {
            icon: '🚀',
            message: `¡El éxito está en los detalles, ${currentUser}! Presta atención a cada paso.`,
            type: 'success'
        },
        {
            icon: '💪',
            message: `¡Tu constancia es tu superpoder, ${currentUser}! No te rindas.`,
            type: 'persistence'
        },
        {
            icon: '🌈',
            message: `¡Cada día es una nueva oportunidad, ${currentUser}! ¡Aprovecha este momento!`,
            type: 'opportunity'
        }
    ];
    
    const randomMessage = additionalMessages[Math.floor(Math.random() * additionalMessages.length)];
    
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm z-50 transform translate-x-full transition-transform duration-300';
    notification.innerHTML = `
        <div class="flex items-start">
            <span class="text-2xl mr-3">${randomMessage.icon}</span>
            <div class="flex-1">
                <p class="text-gray-800 dark:text-gray-200 text-sm">${randomMessage.message}</p>
            </div>
            <button class="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onclick="this.parentElement.parentElement.remove()">
                ✕
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// ========================================
// SISTEMA DE VERSÍCULO DEL DÍA
// ========================================

/** Variables para el versículo del día */
let verses = [];
let currentVerse = null;

/**
 * CARGA LOS VERSÍCULOS DESDE EL ARCHIVO JSON
 */
async function loadVerses() {
    try {
        console.log('Cargando versículos...');
        const response = await fetch('./versiculos.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        verses = await response.json();
        console.log('Versículos cargados:', verses.length);
        return true;
    } catch (error) {
        console.error('Error al cargar versículos:', error);
        return false;
    }
}

/**
 * OBTIENE EL VERSÍCULO DEL DÍA BASADO EN LA FECHA
 */
function getDailyVerse() {
    if (!verses || verses.length === 0) {
        return null;
    }
    
    // Obtener la fecha actual
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    // Usar el día del año para seleccionar el versículo
    const verseIndex = dayOfYear % verses.length;
    return verses[verseIndex];
}

/**
 * MUESTRA EL VERSÍCULO DEL DÍA EN EL WIDGET
 */
function displayDailyVerse() {
    const verseContent = document.getElementById('verse-content');
    
    if (!verseContent) {
        console.error('Elemento verse-content no encontrado');
        return;
    }
    
    const verse = getDailyVerse();
    
    if (!verse) {
        verseContent.innerHTML = `
            <div class="text-center py-8">
                <div class="text-red-500 text-4xl mb-2">⚠️</div>
                <p class="text-red-600 dark:text-red-400 font-medium">No se pudo cargar el versículo diario</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Intenta recargar la página</p>
            </div>
        `;
        return;
    }
    
    // Guardar el versículo actual para compartir
    currentVerse = verse;
    
    verseContent.innerHTML = `
        <div class="verse-loaded">
            <div class="verse-text">"${verse.texto}"</div>
            <div class="verse-reference">— ${verse.cita}</div>
        </div>
    `;
    
    console.log('Versículo del día mostrado:', verse);
}

/**
 * COMPARTE EL VERSÍCULO DEL DÍA
 */
async function shareVerse() {
    if (!currentVerse) {
        showSystemMessage("No hay versículo para compartir", 'error');
        return;
    }
    
    const shareText = `📖 Versículo del Día - OrganizApp\n\n"${currentVerse.texto}"\n— ${currentVerse.cita}\n\nCompartido desde OrganizApp`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Versículo del Día',
                text: shareText
            });
            showSystemMessage("Versículo compartido exitosamente");
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error al compartir:', error);
                showSystemMessage("Error al compartir el versículo", 'error');
            }
        }
    } else {
        // Fallback para escritorio
        try {
            await navigator.clipboard.writeText(shareText);
            showSystemMessage("Versículo copiado al portapapeles");
        } catch (error) {
            console.error('Error al copiar:', error);
            showSystemMessage("Tu navegador no permite compartir directamente. El versículo es:\n\n" + shareText, 'info');
        }
    }
}

/**
 * INICIALIZA EL SISTEMA DE VERSÍCULO DEL DÍA
 */
async function initializeVerseSystem() {
    console.log('Inicializando sistema de versículo del día...');
    
    const loaded = await loadVerses();
    if (loaded) {
        displayDailyVerse();
    } else {
        // Mostrar error si no se pueden cargar los versículos
        const verseContent = document.getElementById('verse-content');
        if (verseContent) {
            verseContent.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-red-500 text-4xl mb-2">⚠️</div>
                    <p class="text-red-600 dark:text-red-400 font-medium">No se pudo cargar el versículo diario</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Verifica tu conexión a internet</p>
                </div>
            `;
        }
    }
}

// ========================================
// SISTEMA DE EXPORTAR, COMPARTIR E IMPORTAR
// ========================================

/**
 * DUPLICA UNA NOTA
 * @param {string} itemId - ID de la nota a duplicar
 */
function duplicateItem(itemId) {
    const item = items.find(i => i.id === itemId);
    if (!item) {
        showSystemMessage("Nota no encontrada", 'error');
        return;
    }

    const duplicatedItem = {
        id: crypto.randomUUID(),
        content: item.content + ' (Copia)',
        type: item.type,
        status: 'pending', // Siempre pendiente la copia
        date: item.date,
        folderId: item.folderId,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    items.push(duplicatedItem);
    saveItems();

    // Refrescar vista actual
    if (currentView === 'todo') {
        renderList();
    } else if (currentView === 'folders' && item.folderId) {
        renderFolderItems(item.folderId);
    }

    showSystemMessage(`Nota "${item.content.substring(0, 30)}..." duplicada correctamente`);
}

/**
 * EXPORTA UNA CARPETA COMO ARCHIVO JSON
 * @param {string} folderId - ID de la carpeta a exportar
 */
function exportFolder(folderId) {
    console.log('Exportando carpeta:', folderId);
    
    const folder = getFolderById(folderId);
    if (!folder) {
        console.error('Carpeta no encontrada:', folderId);
        showSystemMessage("Carpeta no encontrada", 'error');
        return;
    }

    console.log('Carpeta encontrada:', folder);

    // Obtener todas las notas de la carpeta
    const folderItems = getItemsInFolder(folderId);
    console.log('Elementos en la carpeta:', folderItems);
    
    // Función helper para validar fechas
    const getValidDate = (timestamp) => {
        if (!timestamp || isNaN(timestamp)) {
            return new Date().toISOString();
        }
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    };

    // Crear estructura de datos para exportar
    const exportData = {
        tipo: "carpeta",
        version: "1.0",
        nombre: folder.name,
        descripcion: folder.description || "",
        color: folder.color || "green",
        fechaCreacion: getValidDate(folder.createdAt),
        fechaExportacion: new Date().toISOString(),
        notas: folderItems.map(item => ({
            id: item.id,
            titulo: item.content,
            contenido: item.content,
            tipo: item.type,
            estado: item.status,
            fecha: item.date,
            fechaCreacion: getValidDate(item.createdAt),
            fechaModificacion: getValidDate(item.updatedAt)
        }))
    };

    console.log('Datos a exportar:', exportData);

    // Crear y descargar archivo
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `carpeta-${folder.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSystemMessage(`Carpeta "${folder.name}" exportada correctamente con ${folderItems.length} elemento${folderItems.length !== 1 ? 's' : ''}`);
}

/**
 * EXPORTA UNA NOTA INDIVIDUAL COMO ARCHIVO JSON
 * @param {string} itemId - ID de la nota a exportar
 */
function exportNote(itemId) {
    console.log('Exportando nota:', itemId);
    console.log('Items disponibles:', items);
    
    const item = items.find(i => i.id === itemId);
    if (!item) {
        console.error('Nota no encontrada:', itemId);
        showSystemMessage("Nota no encontrada", 'error');
        return;
    }

    console.log('Nota encontrada:', item);

    // Función helper para validar fechas
    const getValidDate = (timestamp) => {
        if (!timestamp || isNaN(timestamp)) {
            return new Date().toISOString();
        }
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    };

    // Crear estructura de datos para exportar
    const exportData = {
        tipo: "nota",
        version: "1.0",
        titulo: item.content,
        contenido: item.content,
        tipoNota: item.type,
        estado: item.status,
        fecha: item.date,
        fechaCreacion: getValidDate(item.createdAt),
        fechaModificacion: getValidDate(item.updatedAt),
        carpeta: item.folderId ? getFolderById(item.folderId)?.name : null
    };

    console.log('Datos a exportar:', exportData);

    // Crear y descargar archivo
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `nota-${item.content.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Archivo descargado exitosamente');
    showSystemMessage(`Nota "${item.content.substring(0, 30)}..." exportada correctamente`);
}

/**
 * COMPARTE UNA CARPETA USANDO WEB SHARE API
 * @param {string} folderId - ID de la carpeta a compartir
 */
async function shareFolder(folderId) {
    const folder = getFolderById(folderId);
    if (!folder) {
        showSystemMessage("Carpeta no encontrada", 'error');
        return;
    }

    try {
        // Verificar si Web Share API está disponible
        if (!navigator.share) {
            showSystemMessage("Tu navegador no permite compartir archivos directamente. Usa la opción de Exportar.", 'error');
            return;
        }

        // Obtener datos de la carpeta
        const folderItems = getItemsInFolder(folderId);
        const exportData = {
            tipo: "carpeta",
            version: "1.0",
            nombre: folder.name,
            descripcion: folder.description || "",
            color: folder.color || "green",
            fechaCreacion: new Date(folder.createdAt).toISOString(),
            fechaExportacion: new Date().toISOString(),
            notas: folderItems.map(item => ({
                id: item.id,
                titulo: item.content,
                contenido: item.content,
                tipo: item.type,
                estado: item.status,
                fecha: item.date,
                fechaCreacion: new Date(item.createdAt).toISOString(),
                fechaModificacion: new Date(item.updatedAt).toISOString()
            }))
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const fileName = `carpeta-${folder.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        
        const file = new File([blob], fileName, { type: 'application/json' });

        await navigator.share({
            title: 'Carpeta de notas - OrganizApp',
            text: `Mira esta carpeta "${folder.name}" exportada desde OrganizApp`,
            files: [file]
        });

        showSystemMessage(`Carpeta "${folder.name}" compartida correctamente`);
    } catch (error) {
        if (error.name === 'AbortError') {
            showSystemMessage("Compartir cancelado");
        } else {
            showSystemMessage("Error al compartir. Usa la opción de Exportar.", 'error');
        }
    }
}

/**
 * COMPARTE UNA NOTA USANDO WEB SHARE API
 * @param {string} itemId - ID de la nota a compartir
 */
async function shareNote(itemId) {
    const item = items.find(i => i.id === itemId);
    if (!item) {
        showSystemMessage("Nota no encontrada", 'error');
        return;
    }

    try {
        // Crear datos de la nota
        const exportData = {
            tipo: "nota",
            version: "1.0",
            titulo: item.content,
            contenido: item.content,
            tipoNota: item.type,
            estado: item.status,
            fecha: item.date,
            fechaCreacion: new Date(item.createdAt).toISOString(),
            fechaModificacion: new Date(item.updatedAt).toISOString(),
            carpeta: item.folderId ? getFolderById(item.folderId)?.name : null
        };

        // Crear archivo .txt con contenido JSON
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'text/plain' });
        const fileName = `nota-${item.content.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        
        const file = new File([blob], fileName, { type: 'text/plain' });

        // Verificar si Web Share API está disponible
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'Nota - OrganizApp',
                text: `Mira esta nota "${item.content.substring(0, 50)}..." exportada desde OrganizApp`,
                files: [file]
            });
            showSystemMessage(`Nota "${item.content.substring(0, 30)}..." compartida correctamente`);
        } else {
            // Fallback: compartir solo texto
            const shareText = `📝 Nota de OrganizApp\n\n"${item.content}"\n\nTipo: ${item.type}\nEstado: ${item.status}\nFecha: ${item.date}`;
            
            if (navigator.share) {
                await navigator.share({
                    title: 'Nota - OrganizApp',
                    text: shareText
                });
                showSystemMessage(`Nota "${item.content.substring(0, 30)}..." compartida correctamente`);
            } else {
                // Copiar al portapapeles como último recurso
                await navigator.clipboard.writeText(shareText);
                showSystemMessage(`Nota copiada al portapapeles. Contenido:\n\n${shareText}`, 'info');
            }
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            showSystemMessage("Compartir cancelado");
        } else {
            console.error('Error al compartir:', error);
            // Fallback: copiar al portapapeles
            try {
                const shareText = `📝 Nota de OrganizApp\n\n"${item.content}"\n\nTipo: ${item.type}\nEstado: ${item.status}\nFecha: ${item.date}`;
                await navigator.clipboard.writeText(shareText);
                showSystemMessage(`Error al compartir. Nota copiada al portapapeles:\n\n${shareText}`, 'info');
            } catch (clipboardError) {
                showSystemMessage("Error al compartir. Usa la opción de Exportar.", 'error');
            }
        }
    }
}

/**
 * IMPORTA UN ARCHIVO (.txt o .json) EXPORTADO DESDE ORGANIZAPP
 */
function importFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt';
    input.style.display = 'none';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                // Verificar si es un archivo válido de OrganizApp
                if (!data.tipo || !data.version) {
                    showSystemMessage("❌ Archivo incompatible con OrganizApp.", 'error');
                    return;
                }

                if (data.tipo === 'carpeta') {
                    importFolder(data);
                } else if (data.tipo === 'nota') {
                    importNote(data);
                } else {
                    showSystemMessage("❌ Archivo incompatible con OrganizApp.", 'error');
                }
            } catch (error) {
                showSystemMessage("❌ Error al leer el archivo. Verifica que sea un archivo válido exportado desde OrganizApp (.txt o .json).", 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

/**
 * IMPORTA UNA CARPETA DESDE DATOS JSON
 * @param {Object} data - Datos de la carpeta a importar
 */
function importFolder(data) {
    try {
        // Crear nueva carpeta
        const newFolder = {
            id: crypto.randomUUID(),
            name: data.nombre + ' (Importada)',
            description: data.descripcion || '',
            color: data.color || 'green',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        folders.push(newFolder);
        saveFolders();

        // Importar notas de la carpeta
        if (data.notas && Array.isArray(data.notas)) {
            data.notas.forEach(noteData => {
                const newItem = {
                    id: crypto.randomUUID(),
                    content: noteData.titulo || noteData.contenido || 'Nota importada',
                    type: noteData.tipo || 'Nota',
                    status: noteData.estado || 'pending',
                    date: noteData.fecha || new Date().toISOString().split('T')[0],
                    folderId: newFolder.id,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
                items.push(newItem);
            });
            saveItems();
        }

        renderFoldersList();
        showSystemMessage(`✅ Carpeta "${data.nombre}" importada correctamente`);
    } catch (error) {
        showSystemMessage("❌ Error al importar la carpeta", 'error');
    }
}

/**
 * IMPORTA UNA NOTA DESDE DATOS JSON
 * @param {Object} data - Datos de la nota a importar
 */
function importNote(data) {
    try {
        // Buscar carpeta si se especifica
        let folderId = null;
        if (data.carpeta) {
            const existingFolder = folders.find(f => f.name === data.carpeta);
            if (existingFolder) {
                folderId = existingFolder.id;
            }
        }

        const newItem = {
            id: crypto.randomUUID(),
            content: data.titulo || data.contenido || 'Nota importada',
            type: data.tipoNota || 'Nota',
            status: data.estado || 'pending',
            date: data.fecha || new Date().toISOString().split('T')[0],
            folderId: folderId,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        items.push(newItem);
        saveItems();

        // Refrescar vista actual
        if (currentView === 'todo') {
            renderList();
        } else if (currentView === 'folders' && folderId) {
            renderFolderItems(folderId);
        }

        showSystemMessage(`✅ Nota "${data.titulo || data.contenido}" importada correctamente`);
    } catch (error) {
        showSystemMessage("❌ Error al importar la nota", 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initializePWA();
});

// ========================================
// DOCUMENTACIÓN DE FUNCIONES DE EXPORTAR/COMPARTIR/IMPORTAR
// ========================================

/*
📋 GUÍA DE USO DEL SISTEMA DE EXPORTAR/COMPARTIR/IMPORTAR

🔹 EXPORTAR CARPETAS:
   - Ubicación: Botón verde (⬇️) en cada tarjeta de carpeta
   - Función: exportFolder(folderId)
   - Descarga: carpeta-[nombre].json con todas las notas incluidas
   - Formato: JSON estructurado con metadatos completos

🔹 EXPORTAR NOTAS:
   - Ubicación: Botón verde (⬇️) en cada nota individual
   - Función: exportNote(itemId)
   - Descarga: nota-[contenido].json con información completa
   - Formato: JSON con todos los campos de la nota

🔹 COMPARTIR CARPETAS:
   - Ubicación: Botón morado (📤) en cada tarjeta de carpeta
   - Función: shareFolder(folderId)
   - Usa: Web Share API (navigator.share)
   - Fallback: Mensaje si no está disponible

🔹 COMPARTIR NOTAS:
   - Ubicación: Botón morado (📤) en cada nota individual
   - Función: shareNote(itemId)
   - Usa: Web Share API (navigator.share)
   - Fallback: Mensaje si no está disponible

🔹 IMPORTAR ARCHIVOS:
   - Ubicación: Botón naranja (📂) en el header principal
   - Función: importFile()
   - Soporta: Archivos .json exportados de OrganizApp
   - Detecta: Automáticamente si es carpeta o nota
   - Validación: Verifica formato y compatibilidad

📁 ESTRUCTURA DE ARCHIVOS JSON:

CARPETAS:
{
  "tipo": "carpeta",
  "version": "1.0",
  "nombre": "Nombre de la carpeta",
  "descripcion": "Descripción opcional",
  "color": "green" o "#FF5733",
  "fechaCreacion": "2025-01-14T10:30:00.000Z",
  "fechaExportacion": "2025-01-14T10:30:00.000Z",
  "notas": [
    {
      "id": "uuid",
      "titulo": "Contenido de la nota",
      "contenido": "Contenido de la nota",
      "tipo": "Tarea|Nota|Recordatorio|Compra",
      "estado": "pending|completed|done",
      "fecha": "2025-01-14",
      "fechaCreacion": "2025-01-14T10:30:00.000Z",
      "fechaModificacion": "2025-01-14T10:30:00.000Z"
    }
  ]
}

NOTAS:
{
  "tipo": "nota",
  "version": "1.0",
  "titulo": "Contenido de la nota",
  "contenido": "Contenido de la nota",
  "tipoNota": "Tarea|Nota|Recordatorio|Compra",
  "estado": "pending|completed|done",
  "fecha": "2025-01-14",
  "fechaCreacion": "2025-01-14T10:30:00.000Z",
  "fechaModificacion": "2025-01-14T10:30:00.000Z",
  "carpeta": "Nombre de la carpeta (opcional)"
}

✅ CARACTERÍSTICAS:
- 100% Offline (PWA compatible)
- Compatible con móviles y escritorio
- No requiere servidores externos
- Preserva todos los metadatos
- Validación automática de archivos
- Manejo de errores robusto
- Interfaz intuitiva con iconos SVG
- Animaciones suaves y feedback visual

🚀 CASOS DE USO:
- Respaldar carpetas importantes
- Compartir notas con colegas
- Migrar datos entre dispositivos
- Crear plantillas de carpetas
- Sincronizar contenido offline
- Colaborar sin conexión a internet
*/
