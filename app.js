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

// Variables del sistema de archivo automático
let lastArchiveDate = null; // Fecha del último archivo automático
let weeklyStats = {
    tasksCompleted: 0,
    tasksArchived: 0,
    currentStreak: 0,
    lastWeekDate: null
};

// Variables del sistema de racha diaria
let lastLoginDate = null; // Último día que el usuario abrió la app
let streakCount = 0; // Días consecutivos de uso

// Variables del sistema de actualizaciones
const APP_VERSION = '2.0.6'; // Corrección UI lista de compras + FAB - Auto-actualización mejorada
let lastKnownVersion = null; // Última versión conocida por el usuario

// Variables del sistema de PWA y Service Worker
let serviceWorkerRegistration = null;
let isUpdateAvailable = false;
let updateCheckInterval = null;

// Variables del calendario
let currentDate = new Date();
let selectedDate = null;
let editingFolderId = null;

// Variables del usuario y filtrado
let currentUser = null;
let currentCategory = 'all'; // 'all', 'notes', 'tasks', 'shopping', 'reminders'
let editingItemId = null; // ID del elemento que se está editando

// Variables para versículo diario
let currentVerseIndex = 0;
let dailyVerseEnabled = true; // Activado por defecto para nuevos usuarios
let lastVerseDate = null; // Fecha del último versículo mostrado
let dailyVerses = []; // Array de versículos cargados

// Referencias del DOM
const itemList = document.getElementById('item-list');
const fab = document.getElementById('fab');
const modal = document.getElementById('input-modal');
const universalInput = document.getElementById('universal-input');
const addBtn = document.getElementById('add-btn');
const cancelBtn = document.getElementById('cancel-btn');
const summaryElement = document.getElementById('daily-summary');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle'); // Puede ser null si no existe
const systemMessage = document.getElementById('system-message');

// Referencias para configuración y versículo diario
const configBtn = document.getElementById('config-btn');
const configMenu = document.getElementById('config-menu');
const dailyVerseToggle = document.getElementById('daily-verse-toggle');
const themeToggleMenu = document.getElementById('theme-toggle-switch');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');
const importBtnMenu = document.getElementById('import-btn-menu');
const notificationBtnMenu = document.getElementById('notification-btn-menu');
const dailyVerseModal = document.getElementById('daily-verse-modal');
const dailyVerseText = document.getElementById('daily-verse-text');
const dailyVerseReference = document.getElementById('daily-verse-reference');
const closeVerseBtn = document.getElementById('close-verse-btn');
const nextVerseBtn = document.getElementById('next-verse-btn');
const typeSelector = document.getElementById('type-selector');
const statusSelector = document.getElementById('status-selector');
const folderSelector = document.getElementById('folder-selector');
const colorSelector = document.getElementById('color-selector');
const dateSelector = document.getElementById('date-selector');
const homeViewBtn = document.getElementById('home-view-btn');
const calendarViewBtn = document.getElementById('calendar-view-btn');
const foldersViewBtn = document.getElementById('folders-view-btn');

// Referencias para Found My Verse
const foundMyVerseBtn = document.getElementById('found-my-verse-btn');
const foundMyVerseModal = document.getElementById('found-my-verse-modal');
const closeFoundVerseBtn = document.getElementById('close-found-verse-btn');
const themesView = document.getElementById('themes-view');
const versesView = document.getElementById('verses-view');
const themesGrid = document.getElementById('themes-grid');
const versesList = document.getElementById('verses-list');
const backToThemesBtn = document.getElementById('back-to-themes-btn');
const currentThemeTitle = document.getElementById('current-theme-title');

// Referencias para búsqueda de versículos
const verseSearchInput = document.getElementById('verse-search-input');
const clearVerseSearchBtn = document.getElementById('clear-verse-search-btn');
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
    
    // Crear fecha y hora del recordatorio - Corregir problema de zona horaria
    const [year, month, day] = item.date.split('-').map(Number);
    const [hours, minutes] = item.time.split(':').map(Number);
    const reminderDateTime = new Date(year, month - 1, day, hours, minutes);
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

/** Solicita permisos de notificación */
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Este navegador no soporta notificaciones');
        showSystemMessage('⚠️ Tu navegador no soporta notificaciones', 'error');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        console.log('Permisos de notificación ya otorgados');
        return true;
    }
    
    if (Notification.permission === 'denied') {
        console.log('Permisos de notificación denegados');
        showSystemMessage('🔕 Las notificaciones están bloqueadas. Por favor, actívalas en la configuración de tu navegador.', 'error');
        return false;
    }
    
    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log('Permisos de notificación otorgados');
            showSystemMessage('✅ ¡Notificaciones activadas! Recibirás alertas de tus recordatorios', 'success');
            
            // Mostrar notificación de prueba SOLO la primera vez
            const hasShownTestNotification = localStorage.getItem('testNotificationShown');
            if (!hasShownTestNotification) {
                showTestNotification();
                localStorage.setItem('testNotificationShown', 'true');
            }
            
            // Programar notificaciones para recordatorios existentes
            scheduleAllReminderNotifications();
            
            return true;
        } else {
            console.log('Permisos de notificación denegados por el usuario');
            showSystemMessage('⚠️ Has rechazado las notificaciones. No recibirás alertas de tus recordatorios.', 'warning');
            return false;
        }
    } catch (error) {
        console.error('Error al solicitar permisos de notificación:', error);
        showSystemMessage('❌ Error al activar notificaciones', 'error');
        return false;
    }
}

/** Muestra una notificación de prueba */
function showTestNotification() {
    if (Notification.permission === 'granted') {
        const notification = new Notification('🎉 ¡Notificaciones Activadas!', {
            body: 'OrganizApp te enviará recordatorios a tu bandeja de notificaciones',
            icon: './icons/logo-1.png',
            badge: './icons/logo-1.png',
            tag: 'test-notification',
            vibrate: [200, 100, 200], // Patrón de vibración para móviles
            requireInteraction: false
        });
        
        setTimeout(() => {
            notification.close();
        }, 5000);
    }
}

/** Muestra una notificación de recordatorio optimizada para móviles */
async function showReminderNotification(item, timeLabel) {
    const title = `⏰ ${item.content}`;
    const body = `Recordatorio: ${timeLabel}`;
    
    // Notificación del navegador (funciona en Android/iOS con PWA)
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            // Si hay service worker registrado, usar showNotification (mejor para móviles)
            if (serviceWorkerRegistration && serviceWorkerRegistration.showNotification) {
                await serviceWorkerRegistration.showNotification(title, {
                    body: body,
                    icon: './icons/logo-1.png',
                    badge: './icons/logo-1.png',
                    tag: `reminder-${item.id}`,
                    requireInteraction: true,
                    vibrate: [300, 100, 300, 100, 300], // Patrón de vibración
                    silent: false,
                    data: {
                        itemId: item.id,
                        type: 'reminder',
                        url: window.location.href
                    },
                    actions: [
                        {
                            action: 'view',
                            title: '👁️ Ver',
                            icon: './icons/logo-1.png'
                        },
                        {
                            action: 'complete',
                            title: '✅ Completar',
                            icon: './icons/logo-1.png'
                        }
                    ]
                });
            } else {
                // Fallback para navegadores sin service worker
                const notification = new Notification(title, {
                    body: body,
                    icon: './icons/logo-1.png',
                    badge: './icons/logo-1.png',
                    tag: `reminder-${item.id}`,
                    requireInteraction: true,
                    vibrate: [300, 100, 300, 100, 300], // Patrón de vibración para móviles
                    silent: false
                });
                
                // Click en la notificación
                notification.onclick = function() {
                    window.focus();
                    notification.close();
                    
                    // Ir al item
                    const element = document.getElementById(`item-${item.id}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.classList.add('highlight-pulse');
                        setTimeout(() => element.classList.remove('highlight-pulse'), 2000);
                    }
                };
                
                // Cerrar la notificación después de 30 segundos
                setTimeout(() => {
                    notification.close();
                }, 30000);
            }
            
            // Vibración adicional para móviles
            if ('vibrate' in navigator) {
                navigator.vibrate([300, 100, 300]);
            }
            
        } catch (error) {
            console.error('Error al mostrar notificación:', error);
        }
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
    const reminders = todayItems.filter(item => item.type === 'Recordatorio' && (item.status === 'pending' || item.status === 'in-progress'));

    // Saludo según la hora
    let greeting = '';
    if (hour >= 6 && hour < 12) {
        greeting = '¡Buenos días';
    } else if (hour >= 12 && hour < 20) {
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
            const truncatedTask = truncateText(task.content, 60);
            message += `<li class="text-sm text-blue-700 dark:text-blue-300">• ${truncatedTask.displayText}</li>`;
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
            const truncatedReminder = truncateText(reminder.content, 60);
            message += `<li class="text-sm text-red-700 dark:text-red-300">• ${truncatedReminder.displayText}</li>`;
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
    
    // Array completo de tips (50 tips únicos y motivadores)
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
        '💡 <strong>Tip del día:</strong> Usa la técnica Pomodoro: 25 min trabajo, 5 min descanso.',
        '💡 <strong>Tip del día:</strong> Delega tareas cuando sea posible.',
        '💡 <strong>Tip del día:</strong> Mantén un equilibrio saludable entre trabajo y descanso.',
        '💡 <strong>Tip del día:</strong> Visualiza el éxito antes de empezar.',
        '💡 <strong>Tip del día:</strong> Aprende de los errores y sigue adelante.',
        '💡 <strong>Tip del día:</strong> Rodéate de personas que te inspiren.',
        '💡 <strong>Tip del día:</strong> El primer paso es siempre el más importante.',
        '💡 <strong>Tip del día:</strong> Divide grandes proyectos en tareas pequeñas.',
        '💡 <strong>Tip del día:</strong> Escucha más de lo que hablas.',
        '💡 <strong>Tip del día:</strong> Invierte en tu desarrollo personal constantemente.',
        '💡 <strong>Tip del día:</strong> La paciencia es clave para el éxito duradero.',
        '💡 <strong>Tip del día:</strong> Haz ejercicio regularmente para mejorar tu concentración.',
        '💡 <strong>Tip del día:</strong> Lee al menos 15 minutos al día.',
        '💡 <strong>Tip del día:</strong> Duerme entre 7-8 horas para rendir al máximo.',
        '💡 <strong>Tip del día:</strong> Hidrátate constantemente durante el día.',
        '💡 <strong>Tip del día:</strong> Evita el multitasking, enfócate en una cosa a la vez.',
        '💡 <strong>Tip del día:</strong> Crea rutinas matutinas que te ayuden a ser productivo.',
        '💡 <strong>Tip del día:</strong> Aprende a decir "no" a lo que no es prioritario.',
        '💡 <strong>Tip del día:</strong> Medita unos minutos para reducir el estrés.',
        '💡 <strong>Tip del día:</strong> Celebra el progreso, no solo los resultados finales.',
        '💡 <strong>Tip del día:</strong> Busca retroalimentación constructiva para mejorar.',
        '💡 <strong>Tip del día:</strong> Mantén tu teléfono en silencio durante tareas importantes.',
        '💡 <strong>Tip del día:</strong> Usa listas de tareas para no olvidar nada importante.',
        '💡 <strong>Tip del día:</strong> Revisa tus objetivos semanalmente para mantenerte enfocado.',
        '💡 <strong>Tip del día:</strong> Mantén una mentalidad de crecimiento siempre.',
        '💡 <strong>Tip del día:</strong> La calidad supera a la cantidad en todo.',
        '💡 <strong>Tip del día:</strong> Aprende de las personas exitosas que admiras.',
        '💡 <strong>Tip del día:</strong> Sé agradecido por lo que tienes hoy.',
        '💡 <strong>Tip del día:</strong> Sal de tu zona de confort regularmente.',
        '💡 <strong>Tip del día:</strong> Mantén tu escritorio limpio y ordenado para pensar mejor.',
        '💡 <strong>Tip del día:</strong> Escribe tus metas y revísalas a diario.',
        '💡 <strong>Tip del día:</strong> Conecta con personas positivas y motivadas.',
        '💡 <strong>Tip del día:</strong> Toma aire fresco para despejar la mente.',
        '💡 <strong>Tip del día:</strong> Aprende a gestionar tu tiempo efectivamente.',
        '💡 <strong>Tip del día:</strong> No temas pedir ayuda cuando la necesites.',
        '💡 <strong>Tip del día:</strong> El éxito es la suma de pequeños esfuerzos diarios.'
    ];
    
    // Si es un nuevo día o no hay tip guardado, generar uno nuevo
    if (lastTipDate !== today || !lastTipIndex) {
        // Seleccionar un tip aleatorio diferente al anterior
        let newTipIndex;
        do {
            newTipIndex = Math.floor(Math.random() * dailyTips.length);
        } while (newTipIndex === parseInt(lastTipIndex) && dailyTips.length > 1);
        
        // Guardar el nuevo tip para el día (se mantiene todo el día)
        localStorage.setItem('lastTipDate', today);
        localStorage.setItem('lastTipIndex', newTipIndex.toString());
        
        console.log(`✨ Nuevo tip del día seleccionado: ${newTipIndex + 1}/${dailyTips.length}`);
        
        return dailyTips[newTipIndex];
    }
    
    // Si es el mismo día, devolver el tip guardado (NO cambia hasta mañana)
    console.log(`📌 Tip del día actual: ${parseInt(lastTipIndex) + 1}/${dailyTips.length}`);
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
    
    // Dejar el título vacío
    welcomeTitle.textContent = '';
    
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

// --- Sistema de Selección Múltiple ---

/** Almacena los elementos seleccionados */
let selectedItems = new Set();
let selectedFolders = new Set();

/** Modo de selección activado/desactivado */
let isSelectionModeActive = false;

/** Activa/desactiva el modo de selección de elementos */
function toggleSelectionMode() {
    isSelectionModeActive = !isSelectionModeActive;
    
    const selectBtn = document.getElementById('select-items-mode-btn');
    const selectAllBtn = document.getElementById('select-all-btn');
    
    if (isSelectionModeActive) {
        // Modo selección activado
        if (selectBtn) {
            selectBtn.textContent = '✖️ Cancelar';
            selectBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            selectBtn.classList.add('bg-red-500', 'hover:bg-red-600');
        }
        if (selectAllBtn) {
            selectAllBtn.classList.remove('hidden');
        }
    } else {
        // Modo selección desactivado
        if (selectBtn) {
            selectBtn.textContent = '✏️ Seleccionar';
            selectBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
            selectBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
        }
        if (selectAllBtn) {
            selectAllBtn.classList.add('hidden');
        }
        clearAllSelections();
    }
    
    // Re-renderizar para mostrar/ocultar checkboxes
    renderList();
}

/** Alterna la selección de un elemento */
function toggleItemSelection(itemId) {
    if (selectedItems.has(itemId)) {
        selectedItems.delete(itemId);
    } else {
        selectedItems.add(itemId);
    }
    updateSelectionUI();
}

/** Obtiene los elementos filtrados según la búsqueda y categoría actual */
function getFilteredItems() {
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

    // Filtrar elementos de carpetas protegidas - OCULTAR COMPLETAMENTE en vista principal
    filteredItems = filteredItems.filter(item => {
        if (!item.folderId) {
            return true; // Elementos sin carpeta siempre se muestran
        }
        
        // Si el elemento está en una carpeta protegida, verificar si está desbloqueada
        if (hasFolderAccessKey(item.folderId)) {
            return isFolderUnlocked(item.folderId);
        }
        
        return true; // Carpetas sin protección siempre se muestran
    });

    // En la vista Todo, mostrar TODOS los elementos (con y sin carpeta)
    // En otras vistas, mantener el comportamiento original
    if (currentView !== 'todo') {
        filteredItems = filteredItems.filter(item => !item.folderId);
    }

    return filteredItems;
}

/** Alterna la selección de todos los elementos visibles */
function toggleSelectAll() {
    // Obtener todos los elementos visibles según el filtro actual
    const visibleItems = getFilteredItems();
    
    // Si todos están seleccionados, deseleccionar todos
    const allSelected = visibleItems.every(item => selectedItems.has(item.id));
    
    if (allSelected) {
        // Deseleccionar todos los elementos visibles
        visibleItems.forEach(item => {
            selectedItems.delete(item.id);
        });
    } else {
        // Seleccionar todos los elementos visibles
        visibleItems.forEach(item => {
            selectedItems.add(item.id);
        });
    }
    
    updateSelectionUI();
    updateSelectAllButtonText();
}

/** Actualiza el texto del botón de seleccionar todo */
function updateSelectAllButtonText() {
    const selectAllBtn = document.getElementById('select-all-btn');
    if (!selectAllBtn) return;
    
    const visibleItems = getFilteredItems();
    const allSelected = visibleItems.length > 0 && visibleItems.every(item => selectedItems.has(item.id));
    
    if (allSelected) {
        selectAllBtn.textContent = '❌ Deseleccionar Todo';
        selectAllBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        selectAllBtn.classList.add('bg-red-500', 'hover:bg-red-600');
    } else {
        selectAllBtn.textContent = '✅ Seleccionar Todo';
        selectAllBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
        selectAllBtn.classList.add('bg-green-500', 'hover:bg-green-600');
    }
}

/** Limpia todas las selecciones */
function clearAllSelections() {
    selectedItems.clear();
    selectedFolders.clear();
    updateSelectionUI();
}

/** Actualiza la UI de selección múltiple */
function updateSelectionUI() {
    const count = selectedItems.size;
    const bulkActionsBar = document.getElementById('bulk-actions-bar');
    
    if (count > 0 && isSelectionModeActive) {
        if (!bulkActionsBar) {
            createBulkActionsBar();
        }
        const selectedCountElement = document.getElementById('selected-count');
        if (selectedCountElement) {
            selectedCountElement.textContent = `${count} elemento${count !== 1 ? 's' : ''}`;
        }
        const updatedBulkActionsBar = document.getElementById('bulk-actions-bar');
        if (updatedBulkActionsBar) {
            updatedBulkActionsBar.classList.remove('hidden');
        }
    } else {
        if (bulkActionsBar) {
            bulkActionsBar.classList.add('hidden');
        }
    }
    
    // Actualizar checkboxes visuales
    document.querySelectorAll('[data-item-id]').forEach(element => {
        const itemId = element.getAttribute('data-item-id');
        const checkbox = element.querySelector('.item-checkbox');
        if (checkbox) {
            checkbox.checked = selectedItems.has(itemId);
        }
    });
    
    // Actualizar el texto del botón de seleccionar todo
    updateSelectAllButtonText();
}

/** Crea la barra de acciones masivas para elementos */
function createBulkActionsBar() {
    const existingBar = document.getElementById('bulk-actions-bar');
    if (existingBar) return;
    
    // Cargar posición guardada o usar posición por defecto
    const savedPosition = localStorage.getItem('bulkMenuPosition');
    const defaultPosition = savedPosition ? JSON.parse(savedPosition) : { top: '12rem', left: '1rem', right: '1rem' };
    
    const bar = document.createElement('div');
    bar.id = 'bulk-actions-bar';
    bar.className = 'fixed bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-40 hidden cursor-move';
    bar.style.top = defaultPosition.top;
    bar.style.left = defaultPosition.left;
    bar.style.right = defaultPosition.right;
    
    bar.innerHTML = `
        <div class="flex flex-col space-y-3">
            <div class="flex items-center justify-between">
                <span id="selected-count" class="text-base font-bold text-gray-900 dark:text-gray-100">0 elementos</span>
                <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">📱 Arrastra para mover</span>
                    <button onclick="clearAllSelections()" class="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline">
                        Limpiar
                    </button>
                </div>
            </div>
            <div class="flex items-center space-x-2 overflow-x-auto pb-1">
                <button onclick="bulkDeleteItems()" class="flex-shrink-0 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors whitespace-nowrap">
                    🗑️ Eliminar
                </button>
                <button onclick="bulkMoveItems()" class="flex-shrink-0 px-4 py-2.5 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors whitespace-nowrap">
                    📁 Mover
                </button>
                <button onclick="bulkChangeColor()" class="flex-shrink-0 px-4 py-2.5 text-sm font-semibold text-white bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors whitespace-nowrap">
                    🎨 Color
                </button>
                <button onclick="bulkChangeStatus()" class="flex-shrink-0 px-4 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors whitespace-nowrap">
                    ✅ Estado
                </button>
            </div>
        </div>
    `;
    
    // Hacer el menú draggable
    makeDraggable(bar);
    
    document.body.appendChild(bar);
}

/** Hace un elemento draggable */
function makeDraggable(element) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    // Event listener para el mouse
    element.addEventListener('mousedown', (e) => {
        // Solo permitir arrastrar desde el área del menú, no desde los botones
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            return;
        }
        
        isDragging = true;
        element.style.cursor = 'grabbing';
        
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(element.style.left) || 0;
        startTop = parseInt(element.style.top) || 0;
        
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        let newLeft = startLeft + deltaX;
        let newTop = startTop + deltaY;
        
        // Limitar el movimiento dentro de la ventana
        const maxLeft = window.innerWidth - element.offsetWidth;
        const maxTop = window.innerHeight - element.offsetHeight;
        
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
        
        element.style.left = newLeft + 'px';
        element.style.top = newTop + 'px';
        element.style.right = 'auto'; // Remover right cuando se arrastra
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'move';
            
            // Guardar la nueva posición
            saveMenuPosition(element);
        }
    });
    
    // Event listeners para touch (dispositivos móviles) con opciones pasivas
    element.addEventListener('touchstart', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            return;
        }
        
        isDragging = true;
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startLeft = parseInt(element.style.left) || 0;
        startTop = parseInt(element.style.top) || 0;
        
        // Solo prevenir default si no es pasivo
        try {
            e.preventDefault();
        } catch (error) {
            // Ignorar error si el evento es pasivo
        }
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        
        let newLeft = startLeft + deltaX;
        let newTop = startTop + deltaY;
        
        // Limitar el movimiento dentro de la ventana
        const maxLeft = window.innerWidth - element.offsetWidth;
        const maxTop = window.innerHeight - element.offsetHeight;
        
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
        
        element.style.left = newLeft + 'px';
        element.style.top = newTop + 'px';
        element.style.right = 'auto';
        
        // Solo prevenir default si no es pasivo
        try {
            e.preventDefault();
        } catch (error) {
            // Ignorar error si el evento es pasivo
        }
    }, { passive: false });
    
    document.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            saveMenuPosition(element);
        }
    });
}

/** Guarda la posición del menú en localStorage */
function saveMenuPosition(element) {
    const position = {
        top: element.style.top,
        left: element.style.left,
        right: element.style.right
    };
    localStorage.setItem('bulkMenuPosition', JSON.stringify(position));
}

/** Elimina múltiples elementos seleccionados */
function bulkDeleteItems() {
    if (selectedItems.size === 0) return;
    
    const count = selectedItems.size;
    if (confirm(`¿Estás seguro de que quieres eliminar ${count} elemento${count !== 1 ? 's' : ''}?`)) {
        selectedItems.forEach(itemId => {
            deleteItem(itemId);
        });
        clearAllSelections();
        showSystemMessage(`${count} elemento${count !== 1 ? 's' : ''} eliminado${count !== 1 ? 's' : ''} correctamente.`);
    }
}

/** Mueve múltiples elementos a una carpeta */
function bulkMoveItems() {
    if (selectedItems.size === 0) return;
    
    // Crear modal para seleccionar carpeta destino
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-surface-dark rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 class="text-xl font-bold mb-4 dark:text-gray-100">Mover Elementos</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">Selecciona la carpeta destino para ${selectedItems.size} elemento${selectedItems.size !== 1 ? 's' : ''}:</p>
            
            <select id="destination-folder" class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 mb-4">
                <option value="">📁 Sin carpeta</option>
            </select>
            
            <div class="flex justify-end space-x-3">
                <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                    Cancelar
                </button>
                <button onclick="confirmBulkMove()" class="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600">
                    Mover
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Poblar selector de carpetas
    const folderSelect = document.getElementById('destination-folder');
    folders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = `📁 ${folder.name}`;
        folderSelect.appendChild(option);
    });
}

/** Confirma el movimiento masivo */
function confirmBulkMove() {
    const folderId = document.getElementById('destination-folder').value || null;
    const count = selectedItems.size;
    
    selectedItems.forEach(itemId => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            item.folderId = folderId;
            item.updatedAt = Date.now();
        }
    });
    
    saveItems();
    renderList();
    clearAllSelections();
    
    // Cerrar todos los modales
    document.querySelectorAll('.fixed').forEach(modal => modal.remove());
    
    showSystemMessage(`${count} elemento${count !== 1 ? 's' : ''} movido${count !== 1 ? 's' : ''} correctamente.`);
}

/** Cambia el color de múltiples elementos */
function bulkChangeColor() {
    if (selectedItems.size === 0) return;
    
    // Crear modal para seleccionar color
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-surface-dark rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 class="text-xl font-bold mb-4 dark:text-gray-100">Cambiar Color</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">Selecciona un color para ${selectedItems.size} elemento${selectedItems.size !== 1 ? 's' : ''}:</p>
            
            <div id="bulk-color-selector" class="grid grid-cols-4 gap-2 mb-4">
                <!-- Los colores se generarán dinámicamente -->
            </div>
            
            <!-- Color personalizado -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color personalizado:</label>
                <div class="flex items-center space-x-2">
                    <input type="color" id="custom-color-input" class="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer">
                    <input type="text" id="custom-color-text" placeholder="#000000" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100">
                </div>
            </div>
            
            <div class="flex justify-end space-x-3">
                <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                    Cancelar
                </button>
                <button onclick="confirmBulkColorChange()" class="px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600">
                    Cambiar Color
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Generar colores
    const colorSelector = document.getElementById('bulk-color-selector');
    const colors = ['blue', 'green', 'yellow', 'red', 'purple', 'pink', 'indigo', 'gray'];
    colors.forEach(color => {
        const colorBtn = document.createElement('button');
        colorBtn.className = `w-8 h-8 rounded-full bg-${color}-500 hover:scale-110 transition-transform`;
        colorBtn.setAttribute('data-color', color);
        colorBtn.onclick = () => {
            document.querySelectorAll('#bulk-color-selector button').forEach(btn => btn.classList.remove('ring-2', 'ring-blue-500'));
            colorBtn.classList.add('ring-2', 'ring-blue-500');
            // Limpiar color personalizado cuando se selecciona un color predefinido
            document.getElementById('custom-color-input').value = '';
            document.getElementById('custom-color-text').value = '';
        };
        colorSelector.appendChild(colorBtn);
    });
    
    // Sincronizar color picker con input de texto
    const colorInput = document.getElementById('custom-color-input');
    const colorText = document.getElementById('custom-color-text');
    
    colorInput.addEventListener('input', () => {
        colorText.value = colorInput.value;
        // Limpiar selección de colores predefinidos
        document.querySelectorAll('#bulk-color-selector button').forEach(btn => btn.classList.remove('ring-2', 'ring-blue-500'));
    });
    
    colorText.addEventListener('input', () => {
        if (colorText.value.match(/^#[0-9A-Fa-f]{6}$/)) {
            colorInput.value = colorText.value;
            // Limpiar selección de colores predefinidos
            document.querySelectorAll('#bulk-color-selector button').forEach(btn => btn.classList.remove('ring-2', 'ring-blue-500'));
        }
    });
}

/** Confirma el cambio de color masivo */
function confirmBulkColorChange() {
    const selectedColorBtn = document.querySelector('#bulk-color-selector button.ring-2');
    const customColorInput = document.getElementById('custom-color-input');
    let color;
    
    if (selectedColorBtn) {
        color = selectedColorBtn.getAttribute('data-color');
    } else if (customColorInput && customColorInput.value) {
        color = customColorInput.value;
    } else {
        return; // No hay color seleccionado
    }
    
    const count = selectedItems.size;
    
    selectedItems.forEach(itemId => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            item.color = color;
            item.updatedAt = Date.now();
        }
    });
    
    saveItems();
    
    // Cerrar solo el modal de cambio de color
    const modal = document.getElementById('bulk-color-selector')?.closest('.fixed');
    if (modal) {
        modal.remove();
    }
    
    renderList();
    clearAllSelections();
    
    showSystemMessage(`Color cambiado para ${count} elemento${count !== 1 ? 's' : ''}.`);
}

/** Cambia el estado de múltiples elementos */
function bulkChangeStatus() {
    if (selectedItems.size === 0) return;
    
    // Crear modal para seleccionar estado
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-surface-dark rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 class="text-xl font-bold mb-4 dark:text-gray-100">Cambiar Estado</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">Selecciona un estado para ${selectedItems.size} elemento${selectedItems.size !== 1 ? 's' : ''}:</p>
            
            <select id="bulk-status-selector" class="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 mb-4">
                <option value="pending">⏳ Pendiente</option>
                <option value="done">✅ Realizado</option>
                <option value="completed">🎉 Terminado</option>
            </select>
            
            <div class="flex justify-end space-x-3">
                <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                    Cancelar
                </button>
                <button onclick="confirmBulkStatusChange()" class="px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600">
                    Cambiar Estado
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/** Confirma el cambio de estado masivo */
function confirmBulkStatusChange() {
    const status = document.getElementById('bulk-status-selector').value;
    const count = selectedItems.size;
    
    selectedItems.forEach(itemId => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            item.status = status;
            item.updatedAt = Date.now();
        }
    });
    
    saveItems();
    
    // Cerrar solo el modal de cambio de estado
    const modal = document.getElementById('bulk-status-selector')?.closest('.fixed');
    if (modal) {
        modal.remove();
    }
    
    renderList();
    clearAllSelections();
    
    const statusNames = {
        'pending': 'Pendiente',
        'done': 'Realizado',
        'completed': 'Terminado'
    };
    
    showSystemMessage(`Estado cambiado a "${statusNames[status]}" para ${count} elemento${count !== 1 ? 's' : ''}.`);
}

// --- Sistema de Selección Múltiple para Carpetas ---

/** Variable para almacenar el modo de selección de carpetas */
let isFolderSelectionModeActive = false;

/** Variable para almacenar el ID de la carpeta actual */
let currentFolderId = null;

/** Activa/desactiva el modo de selección de elementos en carpetas */
function toggleFolderItemsSelectionMode() {
    isFolderSelectionModeActive = !isFolderSelectionModeActive;
    
    const selectBtn = document.getElementById('select-folder-items-mode-btn');
    const selectAllBtn = document.getElementById('select-all-folder-items-btn');
    
    if (isFolderSelectionModeActive) {
        // Modo selección activado
        if (selectBtn) {
            selectBtn.textContent = '✖️ Cancelar';
            selectBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            selectBtn.classList.add('bg-red-500', 'hover:bg-red-600');
        }
        if (selectAllBtn) {
            selectAllBtn.classList.remove('hidden');
        }
    } else {
        // Modo selección desactivado
        if (selectBtn) {
            selectBtn.textContent = '✏️ Seleccionar';
            selectBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
            selectBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
        }
        if (selectAllBtn) {
            selectAllBtn.classList.add('hidden');
        }
        clearAllSelections();
    }
    
    // Obtener el ID de la carpeta actual desde el título
    const folderTitle = document.getElementById('selected-folder-title');
    if (folderTitle && folderTitle.querySelector) {
        const editBtn = folderTitle.querySelector('[data-folder-id]');
        if (editBtn) {
            currentFolderId = editBtn.getAttribute('data-folder-id');
        }
    }
    
    // Re-renderizar para mostrar/ocultar checkboxes
    if (currentFolderId) {
        renderFolderItems(currentFolderId);
    }
}

/** Obtiene los elementos filtrados de la carpeta actual */
function getFilteredFolderItems() {
    if (!currentFolderId) return [];
    
    const folderItems = getItemsInFolder(currentFolderId);
    
    return folderItems;
}

/** Alterna la selección de todos los elementos visibles en la carpeta */
function toggleSelectAllFolderItems() {
    // Obtener todos los elementos visibles de la carpeta
    const visibleItems = getFilteredFolderItems();
    
    // Si todos están seleccionados, deseleccionar todos
    const allSelected = visibleItems.every(item => selectedItems.has(item.id));
    
    if (allSelected) {
        // Deseleccionar todos los elementos visibles
        visibleItems.forEach(item => {
            selectedItems.delete(item.id);
        });
    } else {
        // Seleccionar todos los elementos visibles
        visibleItems.forEach(item => {
            selectedItems.add(item.id);
        });
    }
    
    updateSelectionUI();
    updateSelectAllFolderButtonText();
}

/** Actualiza el texto del botón de seleccionar todo en carpetas */
function updateSelectAllFolderButtonText() {
    const selectAllBtn = document.getElementById('select-all-folder-items-btn');
    if (!selectAllBtn) return;
    
    const visibleItems = getFilteredFolderItems();
    const allSelected = visibleItems.length > 0 && visibleItems.every(item => selectedItems.has(item.id));
    
    if (allSelected) {
        selectAllBtn.textContent = '❌ Deseleccionar Todo';
        selectAllBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        selectAllBtn.classList.add('bg-red-500', 'hover:bg-red-600');
    } else {
        selectAllBtn.textContent = '✅ Seleccionar Todo';
        selectAllBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
        selectAllBtn.classList.add('bg-green-500', 'hover:bg-green-600');
    }
}

// --- Sistema de Archivo Automático Semanal ---

/** Verifica si necesita hacer archivo automático semanal */
function checkWeeklyArchive() {
    const now = new Date();
    const lastArchive = lastArchiveDate ? new Date(lastArchiveDate) : null;
    
    // Si nunca se ha hecho archivo o han pasado más de 7 días
    if (!lastArchive || (now - lastArchive) >= 7 * 24 * 60 * 60 * 1000) {
        performWeeklyArchive();
    }
}

/** Realiza el archivo automático semanal */
function performWeeklyArchive() {
    const now = new Date();
    const archivedCount = items.filter(item => item.status === 'done').length;
    
    // Cambiar todos los elementos "Realizado" a "Terminado"
    items.forEach(item => {
        if (item.status === 'done') {
            item.status = 'completed';
            item.archivedAt = now.getTime();
        }
    });
    
    // Actualizar estadísticas
    weeklyStats.tasksArchived += archivedCount;
    weeklyStats.lastWeekDate = now.getTime();
    lastArchiveDate = now.getTime();
    
    // Guardar cambios
    saveItems();
    saveWeeklyStats();
    
    // Mostrar notificación
    if (archivedCount > 0) {
        showSystemMessage(`📦 Archivo semanal completado: ${archivedCount} tareas movidas a "Terminado"`);
    }
}

/** Calcula las métricas de productividad */
function calculateProductivityMetrics() {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Contar elementos por estado (excluyendo carpetas bloqueadas)
    const metrics = {
        pending: 0,
        completed: 0,
        done: 0,
        archived: 0,
        weeklyCompleted: 0,
        streak: streakCount // Usar la racha de días consecutivos
    };
    
    items.forEach(item => {
        // Excluir elementos de carpetas bloqueadas
        if (item.folderId && hasFolderAccessKey(item.folderId) && !isFolderUnlocked(item.folderId)) {
            return;
        }
        
        switch (item.status) {
            case 'pending':
                metrics.pending++;
                break;
            case 'done':
                metrics.done++;
                break;
            case 'completed':
                metrics.completed++;
                // Verificar si fue completado esta semana
                if (item.updatedAt && item.updatedAt >= weekStart.getTime()) {
                    metrics.weeklyCompleted++;
                }
                break;
        }
    });
    
    return metrics;
}

/** Calcula y actualiza la racha de días consecutivos de uso */
function updateDailyStreak() {
    const today = new Date();
    const todayString = today.toDateString();
    
    // Si es la primera vez que abre la app
    if (!lastLoginDate) {
        streakCount = 1;
        lastLoginDate = todayString;
        saveStreakData();
        showSystemMessage('🔥 ¡Bienvenido! Tu racha de productividad ha comenzado');
        return;
    }
    
    // Normalizar fechas a medianoche para comparación precisa
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lastLoginNormalized = new Date(lastLoginDate);
    const lastLoginDate_normalized = new Date(
        lastLoginNormalized.getFullYear(),
        lastLoginNormalized.getMonth(),
        lastLoginNormalized.getDate()
    );
    
    // Calcular diferencia en días (ahora es preciso)
    const daysDifference = Math.round((todayNormalized - lastLoginDate_normalized) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) {
        // Mismo día - no hacer nada
        return;
    } else if (daysDifference === 1) {
        // Día siguiente - incrementar racha
        streakCount++;
        lastLoginDate = todayString;
        saveStreakData();
        showSystemMessage(`🔥 ¡Excelente! Racha activa: ${streakCount} días seguidos`);
    } else {
        // Más de un día - reiniciar racha
        streakCount = 1;
        lastLoginDate = todayString;
        saveStreakData();
        showSystemMessage('😢 Racha reiniciada — vuelve a empezar');
    }
}

/** Guarda los datos de la racha en localStorage */
function saveStreakData() {
    const streakData = {
        lastLoginDate,
        streakCount
    };
    localStorage.setItem('organizappStreakData', JSON.stringify(streakData));
}

/** Carga los datos de la racha desde localStorage */
function loadStreakData() {
    const saved = localStorage.getItem('organizappStreakData');
    if (saved) {
        const data = JSON.parse(saved);
        lastLoginDate = data.lastLoginDate;
        streakCount = data.streakCount || 0;
    }
}

/** Guarda las estadísticas semanales */
function saveWeeklyStats() {
    const statsData = {
        lastArchiveDate,
        weeklyStats
    };
    localStorage.setItem('organizappWeeklyStats', JSON.stringify(statsData));
}

/** Carga las estadísticas semanales */
function loadWeeklyStats() {
    const saved = localStorage.getItem('organizappWeeklyStats');
    if (saved) {
        const data = JSON.parse(saved);
        lastArchiveDate = data.lastArchiveDate;
        weeklyStats = { ...weeklyStats, ...data.weeklyStats };
    }
}

// --- Funciones para Truncado de Texto ---

/** Trunca el texto si es muy largo y agrega botón "ver más" */
function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) {
        return {
            displayText: text,
            isTruncated: false,
            fullText: text
        };
    }
    
    const truncatedText = text.substring(0, maxLength).trim();
    const lastSpaceIndex = truncatedText.lastIndexOf(' ');
    const finalText = lastSpaceIndex > maxLength * 0.8 ? 
        truncatedText.substring(0, lastSpaceIndex) : 
        truncatedText;
    
    return {
        displayText: finalText + '...',
        isTruncated: true,
        fullText: text
    };
}

/** Muestra el contenido completo en un modal */
function showFullContent(itemId, fullText, itemType) {
    // Crear modal dinámicamente
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-surface-dark rounded-xl p-6 w-full max-w-2xl shadow-2xl transition-all duration-300 transform scale-100">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold dark:text-gray-100 flex items-center">
                    <span class="text-2xl mr-3">${getTypeIcon(itemType)}</span>
                    Contenido Completo
                </h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="mb-6">
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <p class="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">${fullText}</p>
                </div>
            </div>
            <div class="flex justify-end">
                <button onclick="this.closest('.fixed').remove()" class="px-6 py-3 text-sm font-semibold rounded-xl text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cerrar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
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
function createFolder(name, description = '', color = 'green', emoji = '📁', accessKey = null) {
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
    
    // Guardar clave de acceso si se proporciona
    if (accessKey && accessKey.trim()) {
        saveFolderAccessKey(newFolder.id, accessKey.trim());
    }
    
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
    
    // Ocultar FAB cuando se abre el modal
    fab.classList.add('hidden');
    
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
    
    // Verificar si la carpeta tiene clave de acceso
    const hasAccessKey = hasFolderAccessKey(folder.id);
    const isUnlocked = isFolderUnlocked(folder.id);
    
    return `
        <div class="folder-card group bg-gradient-to-br from-white via-gray-50/50 to-gray-100/50 dark:from-gray-800 dark:via-gray-700/50 dark:to-gray-600/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 overflow-visible" data-folder-id="${folder.id}">
            
            <div class="flex items-center justify-between mb-4">
                <div class="folder-icon p-3 rounded-xl shadow-md relative" style="${getIconColorStyle(folderColor)}">
                    ${folder.image ? `
                        <img src="${folder.image}" alt="${folder.name}" class="folder-cover-image" style="width: 48px; height: 48px; object-fit: cover; border-radius: 0.5rem; cursor: pointer; display: block;" data-folder-image="${folder.id}">
                        <span class="text-2xl" style="display: none;">${folder.emoji || '📁'}</span>
                    ` : `<span class="text-2xl">${folder.emoji || '📁'}</span>`}
                    ${hasAccessKey ? `
                        <div class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center" title="${isUnlocked ? 'Carpeta desbloqueada' : 'Carpeta protegida - Requiere clave'}">
                            <span class="text-xs">${isUnlocked ? '🔓' : '🔐'}</span>
                        </div>
                    ` : ''}
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
                            <button class="folder-menu-access-key w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors" data-action="${hasAccessKey ? 'remove-access-key' : 'access-key'}" data-folder-id="${folder.id}">
                                <div class="flex items-center space-x-2">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                    <span>${hasAccessKey ? 'Eliminar clave de acceso' : 'Crear clave de acceso'}</span>
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

    // Formatear fecha y hora - Corregir problema de zona horaria
    const [year, month, day] = item.date.split('-').map(Number);
    const itemDate = new Date(year, month - 1, day); // month - 1 porque Date usa 0-indexado para meses
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
        <div id="item-${item.id}" class="${containerClasses}" data-item-id="${item.id}">
            
            <!-- Checkbox de selección -->
            ${isFolderSelectionModeActive ? `
            <div class="flex-shrink-0 mr-3 mt-1">
                <input type="checkbox" class="item-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                       onchange="toggleItemSelection('${item.id}')">
            </div>
            ` : ''}
            
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
                
                <!-- Menú de opciones adicionales - SISTEMA DE ALERTAS -->
                <div class="relative">
                    <button class="item-options-btn p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md" data-item-id="${item.id}" title="Más opciones" onclick="showItemOptions('${item.id}')">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
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
            let itemHtml = createItemHtml(item);
            
            // Agregar checkbox si está en modo de selección
            if (folderSelectionMode) {
                const isChecked = selectedFolderItems.has(item.id) ? 'checked' : '';
                const checkboxHtml = `
                    <div class="flex items-start gap-3">
                        <input type="checkbox" class="folder-item-checkbox mt-4 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer" data-item-id="${item.id}" ${isChecked} onchange="toggleFolderItemSelection('${item.id}')">
                        <div class="flex-1">
                            ${itemHtml}
                        </div>
                    </div>
                `;
                itemHtml = checkboxHtml;
            }
            
            console.log('Generated HTML:', itemHtml);
            folderItemsList.insertAdjacentHTML('beforeend', itemHtml);
        } catch (error) {
            console.error('Error creating item HTML:', error);
            console.error('Item data:', item);
            console.error('Stack trace:', error.stack);
        }
    });
    
    console.log('renderFolderItems completed, items rendered:', folderItemsList.children.length);
    
    // Renderizar listas de compras en las tarjetas
    setTimeout(() => {
        if (typeof window.addShoppingListsToItems === 'function') {
            window.addShoppingListsToItems();
        }
    }, 100);
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
    selectedFolderId = null;
    currentFolderId = null;
    
    // Mostrar lista de carpetas y ocultar contenido
    const foldersListContainer = document.getElementById('folders-list-container');
    if (foldersListContainer) foldersListContainer.classList.remove('hidden');
    if (folderContent) folderContent.classList.add('hidden');
    
    // Mostrar header de carpetas y ocultar header de contenido
    const foldersHeader = document.getElementById('folders-header');
    const folderContentHeader = document.getElementById('folder-content-header');
    if (foldersHeader) foldersHeader.classList.remove('hidden');
    if (folderContentHeader) folderContentHeader.classList.add('hidden');
    
    // Ocultar menú de acciones múltiples
    const folderSelectionActions = document.getElementById('folder-selection-actions');
    if (folderSelectionActions) folderSelectionActions.classList.add('hidden');
    
    // Asegurar que el botón FAB esté visible
    ensureFabVisibility();
    
    renderFoldersList();
}

/** Muestra el contenido de una carpeta específica */
function showFolderContentView(folderId, skipAccessCheck = false) {
    // Verificar si la carpeta tiene clave de acceso (solo si no se salta la verificación)
    if (!skipAccessCheck && hasFolderAccessKey(folderId) && !isFolderUnlocked(folderId)) {
        openAccessKeyModal(folderId);
        return;
    }
    
    currentFolderView = 'content';
    selectedFolderId = folderId;
    currentFolderId = folderId; // Guardar ID para selección múltiple
    
    const folder = getFolderById(folderId);
    if (!folder) return;
    
    // Ocultar lista de carpetas y mostrar contenido
    const foldersListContainer = document.getElementById('folders-list-container');
    if (foldersListContainer) foldersListContainer.classList.add('hidden');
    if (folderContent) folderContent.classList.remove('hidden');
    
    // Ocultar header de carpetas y mostrar header de contenido
    const foldersHeader = document.getElementById('folders-header');
    const folderContentHeader = document.getElementById('folder-content-header');
    if (foldersHeader) foldersHeader.classList.add('hidden');
    if (folderContentHeader) {
        folderContentHeader.classList.remove('hidden');
        folderContentHeader.classList.add('flex');
    }
    
    // Actualizar el título (sin botón de editar)
    if (selectedFolderTitle) {
        const folderColor = folder.color || 'green';
        const colorValue = getFolderColorValue(folderColor);
        
        selectedFolderTitle.innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="w-6 h-6 rounded-lg shadow-md" style="background-color: ${colorValue}"></div>
                <span>${folder.name}</span>
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
    console.log('Actualizando botones de navegación, vista actual:', currentView);
    
    // Resetear todos los botones usando SOLO estilos directos
    [homeViewBtn, calendarViewBtn, foldersViewBtn].forEach(btn => {
        btn.style.backgroundColor = '#6b7280'; // gray-500 - más oscuro
        btn.style.color = '#ffffff'; // blanco
        btn.style.border = 'none';
        btn.style.transition = 'all 0.3s ease';
    });
    
    // Activar el botón correspondiente usando SOLO estilos directos
    switch (currentView) {
        case 'todo':
            homeViewBtn.style.backgroundColor = '#2563eb'; // blue-600 - más oscuro
            homeViewBtn.style.color = '#ffffff'; // blanco
            console.log('Activando botón Inicio');
            break;
        case 'calendar':
            calendarViewBtn.style.backgroundColor = '#2563eb'; // blue-600 - más oscuro
            calendarViewBtn.style.color = '#ffffff'; // blanco
            console.log('Activando botón Calendario');
            break;
        case 'folders':
            foldersViewBtn.style.backgroundColor = '#2563eb'; // blue-600 - más oscuro
            foldersViewBtn.style.color = '#ffffff'; // blanco
            console.log('Activando botón Carpetas');
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

/** Muestra el modal de productividad semanal */
function showProductivityModal() {
    const metrics = calculateProductivityMetrics();
    const today = new Date();
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-surface-dark rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl transition-all duration-300 transform scale-100 mx-2 sm:mx-0">
            <div class="flex items-center justify-between mb-4 sm:mb-6">
                <h3 class="text-lg sm:text-2xl font-bold dark:text-gray-100 flex items-center">
                    <span class="text-xl sm:text-3xl mr-2 sm:mr-3">📊</span>
                    <span class="hidden sm:inline">Productividad Semanal</span>
                    <span class="sm:hidden">Productividad</span>
                </h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="space-y-6">
                <!-- Período de la semana -->
                <div class="text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        ${weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - 
                        ${weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
                
                <!-- Métricas -->
                <div class="grid grid-cols-3 gap-2 sm:gap-4">
                    <div class="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-2 sm:p-4 min-h-[80px] sm:min-h-[100px] flex flex-col justify-center">
                        <div class="text-xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">${metrics.completed}</div>
                        <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">✅ Terminadas</div>
                    </div>
                    <div class="text-center bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 sm:p-4 min-h-[80px] sm:min-h-[100px] flex flex-col justify-center">
                        <div class="text-xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">${metrics.pending}</div>
                        <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">⏳ Pendientes</div>
                    </div>
                    <div class="text-center bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 sm:p-4 min-h-[80px] sm:min-h-[100px] flex flex-col justify-center">
                        <div class="text-xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">${metrics.streak}</div>
                        <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">🔥 Días Seguidos</div>
                    </div>
                </div>
                
                <!-- Mensaje motivacional -->
                <div class="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4">
                    <p class="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                        ${getMotivationalMessage(metrics)}
                    </p>
                </div>
            </div>
            
            <div class="flex justify-center mt-4 sm:mt-6">
                <button onclick="shareProductivityStats()" class="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-xl text-white bg-blue-500 hover:bg-blue-600 transition-colors flex items-center space-x-1 sm:space-x-2">
                    <span>📤</span>
                    <span class="hidden sm:inline">Compartir Estadísticas</span>
                    <span class="sm:hidden">Compartir</span>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

/** Genera un mensaje motivacional basado en las métricas */
function getMotivationalMessage(metrics) {
    if (metrics.streak >= 7) {
        return "🔥 ¡Increíble! Llevas más de una semana consecutiva";
    } else if (metrics.streak >= 3) {
        return "💪 ¡Excelente! Mantén la constancia";
    } else if (metrics.completed > metrics.pending) {
        return "✅ ¡Bien hecho! Más tareas completadas que pendientes";
    } else if (metrics.pending > 0) {
        return "🎯 ¡Sigue así! Cada paso cuenta";
    } else {
        return "🌟 ¡Perfecto! Todo al día";
    }
}

/** Comparte las estadísticas de productividad */
function shareProductivityStats() {
    const metrics = calculateProductivityMetrics();
    const today = new Date();
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const shareText = `📊 Mi Productividad Semanal - OrganizApp

📅 Período: ${weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}

✅ Tareas Terminadas: ${metrics.completed}
⏳ Tareas Pendientes: ${metrics.pending}
🔥 Días Consecutivos: ${metrics.streak}

${getMotivationalMessage(metrics)}

#Productividad #OrganizApp #ProductividadSemanal`;

    if (navigator.share) {
        navigator.share({
            title: 'Mi Productividad Semanal - OrganizApp',
            text: shareText,
            url: window.location.href
        }).catch(err => {
            console.log('Error al compartir:', err);
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

/** Compartir usando el método alternativo (copiar al portapapeles) */
function fallbackShare(text) {
    navigator.clipboard.writeText(text).then(() => {
        showSystemMessage('📋 Estadísticas copiadas al portapapeles');
    }).catch(() => {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSystemMessage('📋 Estadísticas copiadas al portapapeles');
    });
}

/** Inicializa el sistema de Service Worker y actualizaciones automáticas - CRÍTICO */
async function initializeServiceWorker() {
    // Verificación de compatibilidad del navegador
    if ('serviceWorker' in navigator && navigator.serviceWorker) {
        try {
            // CRÍTICO: Registrar el Service Worker para habilitar PWA
            // Esto permite que la app funcione offline y se actualice automáticamente
            serviceWorkerRegistration = await navigator.serviceWorker.register('./service-worker.js');
            console.log('[PWA] Service Worker registrado:', serviceWorkerRegistration);
            
            // CRÍTICO: Escuchar mensajes del Service Worker
            // Esto permite recibir notificaciones sobre nuevas versiones
            navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
            
            // CRÍTICO: Verificar actualizaciones cada 30 segundos
            // Esto asegura que se detecten nuevas versiones automáticamente
            updateCheckInterval = setInterval(checkForServiceWorkerUpdate, 30000);
            
            // CRÍTICO: Verificar actualización inmediatamente (con delay para asegurar que esté listo)
            // Esto detecta actualizaciones disponibles al abrir la app
            setTimeout(async () => {
                await checkForServiceWorkerUpdate();
            }, 1000);
            
        } catch (error) {
            console.error('[PWA] Error registrando Service Worker:', error);
        }
    } else {
        console.log('[PWA] Service Worker no soportado en este navegador');
    }
}

/** Maneja mensajes del Service Worker - CRÍTICO para actualización automática */
function handleServiceWorkerMessage(event) {
    const data = event.data;
    
    switch (data?.type) {
        case 'NEW_VERSION_AVAILABLE':
            console.log('[PWA] Nueva versión disponible:', data.version);
            isUpdateAvailable = true;
            
            // Mostrar notificación al usuario sobre la actualización
            showSystemMessage(`🚀 Nueva versión ${data.version} disponible. Recargando automáticamente...`);
            
            if (data.autoReload) {
                // CRÍTICO: Recargar automáticamente después de un breve delay
                // Esto elimina completamente la necesidad de presionar Ctrl+F5
                // El delay permite que el usuario vea la notificación antes de la recarga
                setTimeout(() => {
                    console.log('[PWA] Recargando automáticamente para aplicar actualización...');
                    // window.location.reload() carga la nueva versión desde el servidor
                    // Los datos del usuario se mantienen porque están en localStorage/IndexedDB
                    window.location.reload();
                }, 2000);
            }
            break;
            
        case 'FORCE_RELOAD':
            console.log('[PWA] Forzando recarga de la aplicación...');
            // CRÍTICO: Recarga inmediata sin delay
            window.location.reload(true);
            break;
            
        case 'VERSION_INFO':
            console.log('[PWA] Información de versión:', data);
            break;
            
        case 'UPDATE_CHECK_RESULT':
            console.log('[PWA] Resultado de verificación:', data);
            break;
    }
}

/** Verifica si hay actualizaciones del Service Worker - CRÍTICO para detección automática */
async function checkForServiceWorkerUpdate() {
    // Verificación robusta: asegurar que el Service Worker esté disponible
    if (!serviceWorkerRegistration || !serviceWorkerRegistration.update) {
        console.log('[PWA] Service Worker no disponible para verificación');
        return;
    }
    
    try {
        // CRÍTICO: Forzar verificación de actualizaciones en el servidor
        // Esto compara la versión actual con la del servidor
        await serviceWorkerRegistration.update();
        
        // Verificar si hay un nuevo Service Worker esperando activación
        if (serviceWorkerRegistration.waiting) {
            console.log('[PWA] Nuevo Service Worker esperando activación');
            
            // CRÍTICO: Notificar al Service Worker que active la nueva versión
            // Esto desencadena el proceso de actualización automática
            serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Verificar si hay un Service Worker instalándose
        if (serviceWorkerRegistration.installing) {
            console.log('[PWA] Service Worker instalándose...');
        }
        
    } catch (error) {
        console.error('[PWA] Error verificando actualizaciones:', error);
    }
}

/** Verifica si hay una nueva versión disponible (sistema legacy) */
function checkForUpdates() {
    const savedVersion = localStorage.getItem('organizappVersion');
    
    if (!savedVersion) {
        // Primera vez usando la app
        localStorage.setItem('organizappVersion', APP_VERSION);
        return;
    }
    
    if (savedVersion !== APP_VERSION) {
        // Actualizar la versión guardada para evitar notificaciones repetidas
        localStorage.setItem('organizappVersion', APP_VERSION);
        // Ya no mostrar notificación porque el sistema PWA maneja las actualizaciones automáticamente
        console.log('[PWA] Versión actualizada automáticamente:', APP_VERSION);
    }
}

/** Muestra la notificación de actualización */
function showUpdateNotification() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-surface-dark rounded-xl p-6 w-full max-w-md shadow-2xl transition-all duration-300 transform scale-100">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-2xl font-bold dark:text-gray-100 flex items-center">
                    <span class="text-3xl mr-3">🔄</span>
                    Nueva Actualización
                </h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p class="text-blue-700 dark:text-blue-300 font-medium text-center">
                        ¡Hay una nueva versión disponible! 🎉
                    </p>
                </div>
                
                <div class="space-y-3">
                    <h4 class="font-semibold text-gray-900 dark:text-gray-100">Nuevas características:</h4>
                    <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li class="flex items-center">
                            <span class="text-green-500 mr-2">✅</span>
                            Sistema de racha diaria de productividad
                        </li>
                        <li class="flex items-center">
                            <span class="text-blue-500 mr-2">📊</span>
                            Modal de estadísticas semanales
                        </li>
                        <li class="flex items-center">
                            <span class="text-purple-500 mr-2">📤</span>
                            Compartir métricas de productividad
                        </li>
                        <li class="flex items-center">
                            <span class="text-yellow-500 mr-2">🎯</span>
                            Interfaz más limpia y organizada
                        </li>
                    </ul>
                </div>
                
                <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <h4 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Para actualizar:</h4>
                    <ol class="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        <li>1. Presiona <strong>Ctrl + F5</strong> (Windows) o <strong>Cmd + Shift + R</strong> (Mac)</li>
                        <li>2. O ve a Configuración → Actualizar página</li>
                        <li>3. O cierra y vuelve a abrir la aplicación</li>
                    </ol>
                </div>
            </div>
            
            <div class="flex justify-center mt-6">
                <button onclick="this.closest('.fixed').remove(); localStorage.setItem('organizappVersion', '${APP_VERSION}');" class="px-6 py-3 text-sm font-semibold rounded-xl text-white bg-blue-500 hover:bg-blue-600 transition-colors">
                    Entendido, actualizaré
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            localStorage.setItem('organizappVersion', APP_VERSION);
        }
    });
}

/** Actualiza la visibilidad del botón de productividad */
function updateProductivityButton() {
    const buttonContainer = document.getElementById('productivity-button-container');
    
    if (buttonContainer) {
        // Mostrar/ocultar según la vista
        if (currentView === 'todo' && currentCategory !== 'notes') {
            buttonContainer.classList.remove('hidden');
        } else {
            buttonContainer.classList.add('hidden');
        }
    }
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

    // Filtrar elementos de carpetas protegidas - OCULTAR COMPLETAMENTE en vista principal
    filteredItems = filteredItems.filter(item => {
        if (!item.folderId) {
            return true; // Elementos sin carpeta siempre se muestran
        }
        
        // Si el elemento está en una carpeta protegida, verificar si está desbloqueada
        if (hasFolderAccessKey(item.folderId)) {
            return isFolderUnlocked(item.folderId);
        }
        
        return true; // Carpetas sin protección siempre se muestran
    });

    // En la vista Todo, mostrar TODOS los elementos (con y sin carpeta)
    // En otras vistas, mantener el comportamiento original
    if (currentView !== 'todo') {
        filteredItems = filteredItems.filter(item => !item.folderId);
    }

    // Mostrar/ocultar encabezado principal según la vista
    const mainItemsHeader = document.getElementById('main-items-header');
    if (mainItemsHeader) {
        if (currentView === 'todo' && currentCategory !== 'notes') {
            mainItemsHeader.classList.remove('hidden');
        } else {
            mainItemsHeader.classList.add('hidden');
        }
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

        // Formatear fecha - Corregir problema de zona horaria
        const [year, month, day] = item.date.split('-').map(Number);
        const itemDate = new Date(year, month - 1, day); // month - 1 porque Date usa 0-indexado para meses
        const formattedDate = itemDate.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });

        // Obtener información de la carpeta si existe
        let folderInfo = '';
        let displayContent = item.content;
        let isProtected = false;
        
        if (item.folderId) {
            const folder = getFolderById(item.folderId);
            if (folder) {
                folderInfo = `<span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">📁 de carpeta ${folder.name}</span>`;
                
                // Si la carpeta está protegida y no está desbloqueada, mostrar mensaje genérico
                if (hasFolderAccessKey(item.folderId) && !isFolderUnlocked(item.folderId)) {
                    displayContent = `Elemento oculto, ver en "${folder.name}"`;
                    isProtected = true;
                }
            }
        }
        
        // Truncar texto si no está protegido
        let textInfo = { displayText: displayContent, isTruncated: false, fullText: displayContent };
        if (!isProtected) {
            textInfo = truncateText(displayContent, 100);
        }

        // Genera el HTML del elemento
        const itemHtml = `
            <div id="item-${item.id}" class="${containerClasses}" data-item-id="${item.id}">
                
                <!-- Checkbox de selección -->
                ${isSelectionModeActive ? `
                <div class="flex-shrink-0 mr-3 mt-1">
                    <input type="checkbox" class="item-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                           onchange="toggleItemSelection('${item.id}')">
                </div>
                ` : ''}
                
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
                    <div class="font-medium ${colorConfig.text} break-words">
                        <span data-id="${item.id}" 
                            contenteditable="false"
                            data-original-content="${item.content}">
                            ${textInfo.displayText}
                        </span>
                        ${textInfo.isTruncated ? `
                            <button data-action="show-full" data-item-id="${item.id}" data-full-text="${encodeURIComponent(textInfo.fullText)}" data-item-type="${item.type}"
                                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold ml-1 transition-colors">
                                ver más
                            </button>
                        ` : ''}
                    </div>
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
    updateProductivityButton();
    
    // Renderizar listas de compras en las tarjetas
    setTimeout(() => {
        if (typeof window.addShoppingListsToItems === 'function') {
            window.addShoppingListsToItems();
        }
    }, 100);
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

/** 
 * Feriados fijos de Chile
 * Formato: { month: mes (1-12), day: día, name: nombre, irrenunciable: boolean }
 */
const FERIADOS_FIJOS_CHILE = [
    { month: 1, day: 1, name: 'Año Nuevo', irrenunciable: true },
    { month: 5, day: 1, name: 'Día del Trabajo', irrenunciable: true },
    { month: 5, day: 21, name: 'Día de las Glorias Navales', irrenunciable: false },
    { month: 6, day: 29, name: 'San Pedro y San Pablo', irrenunciable: false },
    { month: 6, day: 20, name: 'Día Nacional de los Pueblos Indígenas', irrenunciable: false },
    { month: 7, day: 16, name: 'Día de la Virgen del Carmen', irrenunciable: false },
    { month: 8, day: 15, name: 'Asunción de la Virgen', irrenunciable: false },
    { month: 9, day: 18, name: 'Día de la Independencia', irrenunciable: true },
    { month: 9, day: 19, name: 'Día de las Glorias del Ejército', irrenunciable: true },
    { month: 9, day: 20, name: 'Feriado adicional Fiestas Patrias', irrenunciable: false },
    { month: 10, day: 12, name: 'Encuentro de Dos Mundos', irrenunciable: false },
    { month: 10, day: 31, name: 'Día de las Iglesias Evangélicas y Protestantes', irrenunciable: false },
    { month: 11, day: 1, name: 'Día de Todos los Santos', irrenunciable: false },
    { month: 12, day: 8, name: 'Inmaculada Concepción', irrenunciable: false },
    { month: 12, day: 25, name: 'Navidad', irrenunciable: true },
    { month: 12, day: 31, name: 'Feriado Bancario (Fin de Año)', irrenunciable: false }
];

/**
 * Calcula la fecha de Pascua usando el algoritmo de Meeus
 * @param {number} year - El año para calcular Pascua
 * @returns {Date} - Fecha de Pascua
 */
function calcularPascua(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

/**
 * Obtiene todos los feriados de Chile para un año específico
 * @param {number} year - El año para obtener los feriados
 * @returns {Array} - Array de feriados con formato { date: 'YYYY-MM-DD', name: string }
 */
function obtenerFeriadosChile(year) {
    const feriados = [];
    
    // Agregar feriados fijos
    FERIADOS_FIJOS_CHILE.forEach(feriado => {
        const dateStr = `${year}-${String(feriado.month).padStart(2, '0')}-${String(feriado.day).padStart(2, '0')}`;
        feriados.push({ 
            date: dateStr, 
            name: feriado.name, 
            type: 'fijo',
            irrenunciable: feriado.irrenunciable 
        });
    });
    
    // Calcular feriados móviles basados en Pascua
    const pascua = calcularPascua(year);
    
    // Viernes Santo (2 días antes de Pascua)
    const viernesSanto = new Date(pascua);
    viernesSanto.setDate(pascua.getDate() - 2);
    feriados.push({
        date: `${viernesSanto.getFullYear()}-${String(viernesSanto.getMonth() + 1).padStart(2, '0')}-${String(viernesSanto.getDate()).padStart(2, '0')}`,
        name: 'Viernes Santo',
        type: 'movil',
        irrenunciable: true
    });
    
    // Sábado Santo (1 día antes de Pascua)
    const sabadoSanto = new Date(pascua);
    sabadoSanto.setDate(pascua.getDate() - 1);
    feriados.push({
        date: `${sabadoSanto.getFullYear()}-${String(sabadoSanto.getMonth() + 1).padStart(2, '0')}-${String(sabadoSanto.getDate()).padStart(2, '0')}`,
        name: 'Sábado Santo',
        type: 'movil',
        irrenunciable: true
    });
    
    // Feriados adicionales si caen en día hábil (lunes puente)
    // San Pedro y San Pablo (29 de junio) - si cae entre martes y viernes, se traslada al lunes siguiente
    const sanPedro = new Date(year, 5, 29); // mes 5 = junio (0-indexed)
    const diaSanPedro = sanPedro.getDay();
    if (diaSanPedro >= 2 && diaSanPedro <= 5) { // Martes a viernes
        const siguienteLunes = new Date(sanPedro);
        siguienteLunes.setDate(sanPedro.getDate() + (8 - diaSanPedro));
        feriados.push({
            date: `${siguienteLunes.getFullYear()}-${String(siguienteLunes.getMonth() + 1).padStart(2, '0')}-${String(siguienteLunes.getDate()).padStart(2, '0')}`,
            name: 'San Pedro y San Pablo (trasladado)',
            type: 'trasladado',
            irrenunciable: false
        });
    }
    
    // Encuentro de Dos Mundos (12 de octubre) - si cae entre martes y viernes, se traslada al lunes siguiente
    const encuentro = new Date(year, 9, 12); // mes 9 = octubre (0-indexed)
    const diaEncuentro = encuentro.getDay();
    if (diaEncuentro >= 2 && diaEncuentro <= 5) { // Martes a viernes
        const siguienteLunes = new Date(encuentro);
        siguienteLunes.setDate(encuentro.getDate() + (8 - diaEncuentro));
        feriados.push({
            date: `${siguienteLunes.getFullYear()}-${String(siguienteLunes.getMonth() + 1).padStart(2, '0')}-${String(siguienteLunes.getDate()).padStart(2, '0')}`,
            name: 'Encuentro de Dos Mundos (trasladado)',
            type: 'trasladado',
            irrenunciable: false
        });
    }
    
    return feriados;
}

/**
 * Verifica si una fecha es feriado en Chile
 * @param {string} dateStr - Fecha en formato 'YYYY-MM-DD'
 * @returns {Object|null} - Objeto con información del feriado o null
 */
function esFeriadoChile(dateStr) {
    const [year] = dateStr.split('-').map(Number);
    const feriados = obtenerFeriadosChile(year);
    return feriados.find(f => f.date === dateStr) || null;
}

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
        const feriadoInfo = esFeriadoChile(dateStr);
        
        let dayClasses = 'calendar-day';
        if (isToday) dayClasses += ' today';
        if (isSelected) dayClasses += ' selected';
        if (dayItems.length > 0) dayClasses += ' has-items';
        if (feriadoInfo) dayClasses += ' holiday';
        
        calendarHTML += `<div class="${dayClasses}" data-date="${dateStr}">`;
        calendarHTML += `<div class="calendar-day-number">${day}</div>`;
        
        // Mostrar feriado si existe
        if (feriadoInfo) {
            calendarHTML += `<div class="calendar-holiday-indicator" title="${feriadoInfo.name}">🎉 ${feriadoInfo.name}</div>`;
        }
        
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
    const feriadoInfo = esFeriadoChile(dateStr);
    
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
    
    // Mostrar información del feriado si existe
    let feriadoHTML = '';
    if (feriadoInfo) {
        feriadoHTML = `
            <div class="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 shadow-md">
                <div class="flex items-center space-x-3">
                    <span class="text-3xl">🎉</span>
                    <div>
                        <h4 class="text-lg font-bold text-red-700 dark:text-red-300">${feriadoInfo.name}</h4>
                        <p class="text-sm text-red-600 dark:text-red-400">Feriado en Chile</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (dayItems.length === 0) {
        selectedDayItems.innerHTML = feriadoHTML + '<p class="text-gray-500 dark:text-gray-400 text-center py-4">No hay elementos para este día.</p>';
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
    
    selectedDayItems.innerHTML = feriadoHTML + sectionsHTML;
}

/** Crea el HTML para un elemento individual en la vista del día */
function createDayItemHTML(item) {
    const colorConfig = getColorConfig(item.color);
    const statusConfig = getStatusConfig(item.status);
    const icon = getTypeIcon(item.type);
    
    // Obtener información de la carpeta si existe
    let folderInfo = '';
    let displayContent = item.content;
    
    if (item.folderId) {
        const folder = getFolderById(item.folderId);
        if (folder) {
            folderInfo = `<span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">📁 ${folder.name}</span>`;
            
            // Si la carpeta está protegida y no está desbloqueada, mostrar mensaje genérico
            if (hasFolderAccessKey(item.folderId) && !isFolderUnlocked(item.folderId)) {
                displayContent = `Elemento oculto, ver en "${folder.name}"`;
            }
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
        <div id="item-${item.id}" data-item-id="${item.id}" class="flex items-start p-3 rounded-lg calendar-item ${colorConfig.bg} border-l-4 ${colorConfig.border} shadow-sm hover:shadow-md transition-all duration-200 hover:transform hover:scale-[1.01]">
            <div class="flex-shrink-0 mr-3">
                <div class="p-2 rounded-full text-white shadow-md" style="${getIconColorStyle(item.color)}">${icon}</div>
            </div>
            <div class="flex-grow min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <span class="text-xs font-medium ${colorConfig.text} bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm">${statusConfig.icon} ${statusConfig.name}</span>
                    ${timeInfo}
                    ${folderInfo}
                </div>
                <p class="font-medium ${colorConfig.text} text-sm break-words">${displayContent}</p>
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
    fab.classList.add('hidden'); // Ocultar FAB cuando se abre el modal
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
        
        // Cargar carpetas en el selector
        if (folders.length === 0) {
            loadFolders();
        }
        populateFolderSelector();
        
        modal.classList.remove('hidden');
        fab.classList.add('hidden'); // Ocultar FAB cuando se abre el modal
        universalInput.focus();
    }
});

/** Manejador de eventos para cerrar el modal */
cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
});

/** Manejador de eventos para cerrar el modal al hacer clic en el backdrop */
modal.addEventListener('click', (e) => {
    // Solo cerrar si se hace clic directamente en el backdrop (no en el contenido del modal)
    if (e.target === modal) {
        modal.classList.add('hidden');
        fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
    }
});

/** Manejador de eventos para cerrar el modal con la tecla ESC */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
    }
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
        fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
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
    // Ignorar clicks en checkboxes
    if (e.target.type === 'checkbox') {
        return;
    }
    
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
        case 'show-full':
            const fullText = decodeURIComponent(target.getAttribute('data-full-text'));
            const itemType = target.getAttribute('data-item-type');
            showFullContent(id, fullText, itemType);
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
        
        // Verificar si la carpeta tiene clave de acceso
        if (hasFolderAccessKey(folderId) && !isFolderUnlocked(folderId)) {
            // Mostrar modal de clave de acceso
            openAccessKeyModal(folderId);
        } else {
            // Abrir carpeta normalmente
            showFolderContentView(folderId);
        }
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
    if (e.target.closest('.folder-menu-edit, .folder-menu-export, .folder-menu-access-key, .folder-menu-delete')) {
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
            case 'access-key':
                openCreateAccessKeyModal(folderId);
                break;
            case 'remove-access-key':
                openRemoveAccessKeyModal(folderId);
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

/** Event listeners para botones de selección */
const selectItemsModeBtn = document.getElementById('select-items-mode-btn');
const selectAllBtn = document.getElementById('select-all-btn');

if (selectItemsModeBtn) {
    selectItemsModeBtn.addEventListener('click', toggleSelectionMode);
}

if (selectAllBtn) {
    selectAllBtn.addEventListener('click', toggleSelectAll);
}

/** Event listener para botón de productividad */
const productivityButton = document.getElementById('productivity-button');

if (productivityButton) {
    productivityButton.addEventListener('click', showProductivityModal);
}

/** Event listeners para importar/exportar/compartir */
// El botón de importar ahora está en el menú de configuración
const importBtn = document.getElementById('import-btn');
if (importBtn) {
    importBtn.addEventListener('click', importFile);
}

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

/** NUEVA FUNCIÓN CON SISTEMA DE ALERTAS PARA MENÚS */
function showItemOptions(itemId) {
    console.log('🎯 showItemOptions called with ID:', itemId);
    
    // Crear un modal simple con opciones
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-center mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span class="text-xl">⚙️</span>
                </div>
                <h3 class="text-xl font-bold ml-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Opciones del Elemento</h3>
            </div>
            
            <div class="space-y-3">
                <button onclick="duplicateItem('${itemId}'); this.closest('.fixed').remove();" class="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg border border-gray-200 dark:border-gray-600">
                    <div class="flex items-center space-x-3">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span class="font-medium">Duplicar Elemento</span>
                    </div>
                </button>
                
                <button onclick="deleteItem('${itemId}'); this.closest('.fixed').remove();" class="w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg border border-red-200 dark:border-red-600">
                    <div class="flex items-center space-x-3">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span class="font-medium">Eliminar Elemento</span>
                    </div>
                </button>
            </div>
            
            <div class="flex justify-end mt-6">
                <button onclick="this.closest('.fixed').remove();" class="px-6 py-2 text-sm font-semibold rounded-xl text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    
    // Agregar al DOM
    document.body.appendChild(modal);
    
    // Cerrar al hacer click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    console.log('✅ Modal de opciones creado y mostrado');
}

/** FUNCIÓN SIMPLE PARA MANEJAR MENÚS DE TRES PUNTOS - DEPRECATED */
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
    fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
});

document.getElementById('create-folder-confirm-btn').addEventListener('click', () => {
    const name = folderNameInput.value.trim();
    const description = folderDescriptionInput.value.trim();
    const color = getSelectedFolderColor('folder-color-option');
    const emoji = getSelectedFolderEmoji('folder-emoji-option');
    const accessKeyInput = document.getElementById('folder-access-key-input');
    const hasAccessKeyCheckbox = document.getElementById('folder-has-access-key');
    
    // Obtener clave de acceso si está habilitada
    let accessKey = null;
    if (hasAccessKeyCheckbox.checked && accessKeyInput.value.trim()) {
        accessKey = accessKeyInput.value.trim();
    }
    
    if (name) {
        createFolder(name, description, color, emoji, accessKey);
        createFolderModal.classList.add('hidden');
        fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
        
        // Limpiar campos
        folderNameInput.value = '';
        folderDescriptionInput.value = '';
        accessKeyInput.value = '';
        hasAccessKeyCheckbox.checked = false;
    } else {
        showSystemMessage("El nombre de la carpeta es obligatorio.", 'error');
        folderNameInput.focus();
    }
});

// Modal editar carpeta
document.getElementById('cancel-edit-folder-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    editFolderModal.classList.add('hidden');
    fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
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
        fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
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
            fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
            editingFolderId = null;
        }
    }
});

// Event listeners para modales de clave de acceso
document.getElementById('cancel-access-key-btn').addEventListener('click', () => {
    document.getElementById('access-key-modal').classList.add('hidden');
    fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
});

document.getElementById('confirm-access-key-btn').addEventListener('click', handleConfirmAccessKey);

document.getElementById('cancel-create-access-key-btn').addEventListener('click', () => {
    document.getElementById('create-access-key-modal').classList.add('hidden');
    fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
});

document.getElementById('save-access-key-btn').addEventListener('click', handleSaveAccessKey);

// Event listener para Enter en el campo de clave de acceso
document.getElementById('access-key-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleConfirmAccessKey();
    }
});

// Event listener para Enter en el campo de nueva clave de acceso
document.getElementById('new-access-key-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSaveAccessKey();
    }
});

// Event listener para Enter en el campo de confirmar clave de acceso
document.getElementById('confirm-access-key-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSaveAccessKey();
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
    // Mostrar el FAB después de cerrar el modal de bienvenida
    fab.classList.remove('hidden');
});

/** Event listeners para modal de edición */
editCancelBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
    fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
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
        fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
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

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    });
}

/** Registra el Service Worker si está disponible. */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js', {
                scope: './'
            })
            .then(registration => {
                console.log('[PWA] Service Worker registrado exitosamente:', registration.scope);
                
                // Verificar si hay una actualización disponible
                checkForServiceWorkerUpdate(registration);
                
                // Manejar actualizaciones del Service Worker
                setupServiceWorkerUpdateHandling(registration);
                
            })
            .catch(error => {
                console.error('[PWA] Error registrando Service Worker:', error);
            });
        });
    }
}

/** Configura el manejo de actualizaciones del Service Worker */
function setupServiceWorkerUpdateHandling(registration) {
    // Escuchar mensajes del Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
        const { data } = event;
        
        switch (data.type) {
            case 'NEW_VERSION_AVAILABLE':
                console.log('[PWA] Nueva versión detectada:', data.version);
                showUpdateNotification(data.message);
                break;
                
            case 'VERSION_INFO':
                console.log('[PWA] Versión actual:', data.version);
                break;
                
            case 'UPDATE_CHECK_RESULT':
                if (data.hasUpdate) {
                    showUpdateNotification('Nueva versión disponible');
                }
                break;
        }
    });
    
    // Manejar cambios de controlador
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Service Worker actualizado, recargando...');
        window.location.reload();
    });
    
    // Verificar actualizaciones periódicamente
    setInterval(() => {
        registration.update().catch(error => {
            console.log('[PWA] Error verificando actualizaciones:', error);
        });
    }, 30000); // Verificar cada 30 segundos
}

/** Muestra notificación de actualización */
function showUpdateNotification(message = 'Nueva versión disponible') {
    // Evitar mostrar múltiples notificaciones
    if (document.getElementById('update-notification')) {
        return;
    }
    
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.className = 'fixed top-4 right-4 z-50 transform transition-all duration-300 translate-x-full';
    notification.innerHTML = `
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
            <div class="flex items-center space-x-3">
                <div class="text-2xl">🔄</div>
                <div class="flex-1">
                    <h4 class="font-semibold">Actualización Disponible</h4>
                    <p class="text-sm opacity-90">${message}</p>
                </div>
                <button id="close-update-notification" class="text-white hover:text-gray-200 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="mt-3 flex space-x-2">
                <button id="update-now-btn" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                    Actualizar Ahora
                </button>
                <button id="update-later-btn" class="bg-transparent border border-white text-white px-3 py-1 rounded text-sm font-medium hover:bg-white hover:text-blue-600 transition-colors">
                    Más Tarde
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Event listeners
    document.getElementById('update-now-btn').addEventListener('click', () => {
        updateApp();
    });
    
    document.getElementById('update-later-btn').addEventListener('click', () => {
        hideUpdateNotification();
    });
    
    document.getElementById('close-update-notification').addEventListener('click', () => {
        hideUpdateNotification();
    });
    
    // Auto-ocultar después de 10 segundos
    setTimeout(() => {
        hideUpdateNotification();
    }, 10000);
}

/** Oculta la notificación de actualización */
function hideUpdateNotification() {
    const notification = document.getElementById('update-notification');
    if (notification) {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

/** Actualiza la aplicación */
function updateApp() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
            if (registration && registration.waiting) {
                // Enviar mensaje al service worker para saltar la espera
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            } else {
                // Recargar la página
                window.location.reload();
            }
        });
    } else {
        window.location.reload();
    }
}

/** Muestra modal de actualización (versión mejorada) */
function showUpdateModal(message) {
    // Crear modal de actualización si no existe
    if (document.getElementById('update-modal')) {
        return; // Ya existe, no crear otro
    }
    
    const updateModal = document.createElement('div');
    updateModal.id = 'update-modal';
    updateModal.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl transition-all duration-300 transform scale-100">
                <div class="text-center">
                    <div class="text-6xl mb-4">🔄</div>
                    <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Nueva Versión Disponible</h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-6">${message}</p>
                    <div class="flex space-x-3 justify-center">
                        <button id="reload-app-btn" class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                            Actualizar Ahora
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
        updateApp();
    });
    
    document.getElementById('close-update-modal').addEventListener('click', () => {
        updateModal.remove();
    });
}

// --- Funciones para Modales de Carpetas ---

/** Abre el modal para crear una nueva carpeta */
function openCreateFolderModal() {
    folderNameInput.value = '';
    folderDescriptionInput.value = '';
    initializeFolderColorSelector();
    createFolderModal.classList.remove('hidden');
    fab.classList.add('hidden'); // Ocultar FAB cuando se abre el modal
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
    fab.classList.add('hidden'); // Ocultar FAB cuando se abre el modal
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
    
    // Cargar configuración del versículo diario
    loadDailyVerseSettings();
    
    // Inicializar sistema de archivo automático
    loadWeeklyStats();
    checkWeeklyArchive();
    
    // Inicializar sistema de racha diaria
    loadStreakData();
    updateDailyStreak();
    
    // Verificar actualizaciones
    checkForUpdates();
    
    // Inicializar Service Worker y sistema de actualizaciones automáticas
    initializeServiceWorker();
    
    // Limpiar intervalo de verificación de actualizaciones al cerrar la página
    window.addEventListener('beforeunload', () => {
        if (updateCheckInterval) {
            clearInterval(updateCheckInterval);
        }
    });
    
    // Inicializar estado del toggle de tema
    updateThemeToggleState();
    
    // Inicializar visibilidad del versículo diario
    updateVerseWidgetVisibility();
    
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
    
    // FAB estará oculto hasta que el usuario cierre el modal de bienvenida
    // El FAB se mostrará automáticamente cuando se presione "¡Perfecto!" en el modal de bienvenida
    
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
    
    // El manejo de actualizaciones del Service Worker se hace en registerServiceWorker()
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
 * CARGA LOS VERSÍCULOS DESDE EL ARCHIVO JSON (versión para el sistema diario)
 */
function loadDailyVerses() {
    return fetch('./versiculos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(verses => {
            dailyVerses = verses;
            return verses;
        })
        .catch(error => {
            console.error('Error cargando versículos diarios:', error);
            dailyVerses = [];
            return [];
        });
}


/**
 * MUESTRA EL VERSÍCULO DEL DÍA EN EL WIDGET
 */
function displayDailyVerse() {
    const verseContent = document.getElementById('verse-content');
    
    if (!verseContent) {
        return;
    }
    
    // Si no hay versículos cargados, cargarlos primero
    if (!dailyVerses || dailyVerses.length === 0) {
        verseContent.innerHTML = `
            <div class="text-center py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mx-auto"></div>
                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Cargando versículo...</p>
            </div>
        `;
        
        loadDailyVerses().then(() => {
            displayDailyVerse(); // Llamar recursivamente después de cargar
        }).catch(error => {
            console.error('Error al cargar versículos:', error);
            verseContent.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-red-500 text-4xl mb-2">⚠️</div>
                    <p class="text-red-600 dark:text-red-400 font-medium">Error al cargar versículos</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">${error.message}</p>
                </div>
            `;
        });
        return;
    }
    
    const verse = getDailyVerse();
    
    if (!verse) {
        verseContent.innerHTML = `
            <div class="text-center py-8">
                <div class="text-red-500 text-4xl mb-2">⚠️</div>
                <p class="text-red-600 dark:text-red-400 font-medium">No se pudo obtener el versículo del día</p>
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
    
    try {
        await loadDailyVerses();
        displayDailyVerse();
    } catch (error) {
        console.error('Error inicializando sistema de versículos:', error);
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
            fechaModificacion: getValidDate(item.updatedAt),
            // Datos adicionales
            hora: item.time || null,
            imagen: item.image || null,
            listaCompras: item.shoppingList || null
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
        carpeta: item.folderId ? getFolderById(item.folderId)?.name : null,
        // Datos adicionales
        hora: item.time || null,
        imagen: item.image || null,
        listaCompras: item.shoppingList || null
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

// ===== FUNCIONES DE CLAVE DE ACCESO =====

/**
 * Almacena la clave de acceso de una carpeta en localStorage
 * @param {string} folderId - ID de la carpeta
 * @param {string} accessKey - Clave de acceso
 */
function saveFolderAccessKey(folderId, accessKey) {
    const accessKeys = getFolderAccessKeys();
    accessKeys[folderId] = accessKey;
    localStorage.setItem('folderAccessKeys', JSON.stringify(accessKeys));
}

/**
 * Obtiene la clave de acceso de una carpeta desde localStorage
 * @param {string} folderId - ID de la carpeta
 * @returns {string|null} - Clave de acceso o null si no existe
 */
function getFolderAccessKey(folderId) {
    const accessKeys = getFolderAccessKeys();
    return accessKeys[folderId] || null;
}

/**
 * Obtiene todas las claves de acceso almacenadas
 * @returns {Object} - Objeto con las claves de acceso por carpeta
 */
function getFolderAccessKeys() {
    const stored = localStorage.getItem('folderAccessKeys');
    return stored ? JSON.parse(stored) : {};
}

/**
 * Elimina la clave de acceso de una carpeta
 * @param {string} folderId - ID de la carpeta
 */
function removeFolderAccessKey(folderId) {
    const accessKeys = getFolderAccessKeys();
    delete accessKeys[folderId];
    localStorage.setItem('folderAccessKeys', JSON.stringify(accessKeys));
}

/**
 * Verifica si una carpeta tiene clave de acceso
 * @param {string} folderId - ID de la carpeta
 * @returns {boolean} - true si tiene clave de acceso
 */
function hasFolderAccessKey(folderId) {
    return getFolderAccessKey(folderId) !== null;
}

/**
 * Verifica si el usuario ha ingresado la clave correcta para una carpeta
 * @param {string} folderId - ID de la carpeta
 * @returns {boolean} - true si la clave es correcta
 */
function isFolderUnlocked(folderId) {
    // La clave debe ser permanente - siempre retornar false para forzar ingreso de clave
    return false;
}

/**
 * Obtiene la lista de carpetas desbloqueadas en esta sesión
 * @returns {Array} - Array de IDs de carpetas desbloqueadas
 */
function getUnlockedFolders() {
    const stored = sessionStorage.getItem('unlockedFolders');
    return stored ? JSON.parse(stored) : [];
}

/**
 * Marca una carpeta como desbloqueada en esta sesión
 * @param {string} folderId - ID de la carpeta
 */
function unlockFolder(folderId) {
    const unlockedFolders = getUnlockedFolders();
    if (!unlockedFolders.includes(folderId)) {
        unlockedFolders.push(folderId);
        sessionStorage.setItem('unlockedFolders', JSON.stringify(unlockedFolders));
    }
}

/**
 * Bloquea una carpeta (requiere ingresar clave nuevamente)
 * @param {string} folderId - ID de la carpeta
 */
function lockFolder(folderId) {
    const unlockedFolders = getUnlockedFolders();
    const index = unlockedFolders.indexOf(folderId);
    if (index > -1) {
        unlockedFolders.splice(index, 1);
        sessionStorage.setItem('unlockedFolders', JSON.stringify(unlockedFolders));
    }
}

/**
 * Abre el modal para crear/editar clave de acceso
 * @param {string} folderId - ID de la carpeta
 */
function openCreateAccessKeyModal(folderId) {
    const modal = document.getElementById('create-access-key-modal');
    
    if (!modal) {
        console.error('Modal create-access-key-modal no encontrado');
        return;
    }
    
    const newKeyInput = document.getElementById('new-access-key-input');
    const confirmKeyInput = document.getElementById('confirm-access-key-input');
    const enableCheckbox = document.getElementById('enable-access-key');
    const matchError = document.getElementById('access-key-match-error');
    
    // Limpiar campos
    newKeyInput.value = '';
    confirmKeyInput.value = '';
    enableCheckbox.checked = false;
    matchError.classList.add('hidden');
    
    // Verificar si ya tiene clave
    const hasKey = hasFolderAccessKey(folderId);
    
    if (hasKey) {
        enableCheckbox.checked = true;
        // No mostrar la clave actual por seguridad
    }
    
    // Guardar el folderId en el modal
    modal.setAttribute('data-folder-id', folderId);
    
    // Mostrar modal
    modal.classList.remove('hidden');
    fab.classList.add('hidden'); // Ocultar FAB cuando se abre el modal
    newKeyInput.focus();
}

/**
 * Abre el modal para ingresar clave de acceso
 * @param {string} folderId - ID de la carpeta
 */
function openAccessKeyModal(folderId) {
    const modal = document.getElementById('access-key-modal');
    const keyInput = document.getElementById('access-key-input');
    const errorDiv = document.getElementById('access-key-error');
    const modalTitle = modal.querySelector('h3');
    const modalDescription = modal.querySelector('p');
    const confirmBtn = document.getElementById('confirm-access-key-btn');
    
    // Restaurar contenido del modal para acceso
    modalTitle.textContent = 'Clave de Acceso';
    modalDescription.textContent = 'Esta carpeta está protegida. Ingresa la clave de acceso para continuar:';
    confirmBtn.textContent = '🔓 Acceder';
    
    // Limpiar campos
    keyInput.value = '';
    errorDiv.classList.add('hidden');
    
    // Guardar el folderId y el modo en el modal
    modal.setAttribute('data-folder-id', folderId);
    modal.setAttribute('data-mode', 'access');
    
    // Mostrar modal
    modal.classList.remove('hidden');
    fab.classList.add('hidden'); // Ocultar FAB cuando se abre el modal
    keyInput.focus();
}

/**
 * Valida la clave de acceso ingresada
 * @param {string} folderId - ID de la carpeta
 * @param {string} inputKey - Clave ingresada por el usuario
 * @returns {boolean} - true si la clave es correcta
 */
function validateAccessKey(folderId, inputKey) {
    const storedKey = getFolderAccessKey(folderId);
    return storedKey === inputKey;
}

/**
 * Maneja el evento de confirmar clave de acceso
 */
function handleConfirmAccessKey() {
    const modal = document.getElementById('access-key-modal');
    const folderId = modal.getAttribute('data-folder-id');
    const mode = modal.getAttribute('data-mode');
    const keyInput = document.getElementById('access-key-input');
    const errorDiv = document.getElementById('access-key-error');
    
    const inputKey = keyInput.value.trim();
    
    if (!inputKey) {
        errorDiv.textContent = '❌ Por favor ingresa la clave de acceso.';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    if (validateAccessKey(folderId, inputKey)) {
        if (mode === 'remove') {
            // Modo eliminación - eliminar protección
            removeFolderAccessKey(folderId);
            modal.classList.add('hidden');
            fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
            showSystemMessage('🔓 Protección de carpeta eliminada correctamente');
            
            // Refrescar vista
            renderList();
            renderFoldersList();
        } else {
            // Modo acceso - mostrar contenido temporalmente
            modal.classList.add('hidden');
            fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
            showSystemMessage('🔓 Acceso temporal concedido');
            
            // Cambiar a vista de carpetas y abrir la carpeta específica
            showFoldersView();
            setTimeout(() => {
                showFolderContentView(folderId, true);
            }, 100);
        }
    } else {
        // Clave incorrecta
        errorDiv.textContent = '❌ Clave incorrecta. Inténtalo de nuevo.';
        errorDiv.classList.remove('hidden');
        keyInput.value = '';
        keyInput.focus();
    }
}

/**
/**
 * Abre el modal para eliminar clave de acceso (requiere confirmación con clave actual)
 * @param {string} folderId - ID de la carpeta
 */
function openRemoveAccessKeyModal(folderId) {
    const modal = document.getElementById('access-key-modal');
    const keyInput = document.getElementById('access-key-input');
    const errorDiv = document.getElementById('access-key-error');
    const modalTitle = modal.querySelector('h3');
    const modalDescription = modal.querySelector('p');
    const confirmBtn = document.getElementById('confirm-access-key-btn');
    
    // Cambiar el contenido del modal para eliminación
    modalTitle.textContent = 'Eliminar Clave de Acceso';
    modalDescription.textContent = 'Para eliminar la protección de esta carpeta, ingresa la clave de acceso actual:';
    confirmBtn.textContent = '🗑️ Eliminar';
    
    // Limpiar campos
    keyInput.value = '';
    errorDiv.classList.add('hidden');
    
    // Guardar el folderId y el modo en el modal
    modal.setAttribute('data-folder-id', folderId);
    modal.setAttribute('data-mode', 'remove');
    
    // Mostrar modal
    modal.classList.remove('hidden');
    fab.classList.add('hidden'); // Ocultar FAB cuando se abre el modal
    keyInput.focus();
}

/**
 * Maneja el evento de confirmar eliminación de clave de acceso
 */
function handleConfirmRemoveAccessKey() {
    const modal = document.getElementById('access-key-modal');
    const folderId = modal.getAttribute('data-folder-id');
    const keyInput = document.getElementById('access-key-input');
    const errorDiv = document.getElementById('access-key-error');
    
    const inputKey = keyInput.value.trim();
    
    if (!inputKey) {
        errorDiv.textContent = '❌ Por favor ingresa la clave de acceso actual.';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    if (validateAccessKey(folderId, inputKey)) {
        // Clave correcta - eliminar protección
        removeFolderAccessKey(folderId);
        modal.classList.add('hidden');
        showSystemMessage('🔓 Protección de carpeta eliminada correctamente');
        
        // Refrescar vista
        renderList();
        renderFoldersList();
    } else {
        // Clave incorrecta
        errorDiv.textContent = '❌ Clave incorrecta. Inténtalo de nuevo.';
        errorDiv.classList.remove('hidden');
        keyInput.value = '';
        keyInput.focus();
    }
}


/**
 * Maneja el evento de guardar clave de acceso
 */
function handleSaveAccessKey() {
    const modal = document.getElementById('create-access-key-modal');
    const folderId = modal.getAttribute('data-folder-id');
    const newKeyInput = document.getElementById('new-access-key-input');
    const confirmKeyInput = document.getElementById('confirm-access-key-input');
    const enableCheckbox = document.getElementById('enable-access-key');
    const matchError = document.getElementById('access-key-match-error');
    
    const newKey = newKeyInput.value.trim();
    const confirmKey = confirmKeyInput.value.trim();
    const isEnabled = enableCheckbox.checked;
    
    // Validaciones
    if (isEnabled && !newKey) {
        showSystemMessage('❌ Por favor ingresa una clave de acceso.', 'error');
        return;
    }
    
    if (isEnabled && newKey !== confirmKey) {
        matchError.classList.remove('hidden');
        return;
    } else {
        matchError.classList.add('hidden');
    }
    
    if (isEnabled) {
        // Guardar clave
        saveFolderAccessKey(folderId, newKey);
        showSystemMessage('🔐 Clave de acceso configurada correctamente');
    } else {
        // Eliminar clave
        removeFolderAccessKey(folderId);
        lockFolder(folderId); // Bloquear en esta sesión
        showSystemMessage('🔓 Protección de carpeta removida');
    }
    
    // Cerrar modal
    modal.classList.add('hidden');
    fab.classList.remove('hidden'); // Mostrar FAB cuando se cierra el modal
    
    // Refrescar vista
    renderList();
    renderFoldersList();
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
            carpeta: item.folderId ? getFolderById(item.folderId)?.name : null,
            // Datos adicionales
            hora: item.time || null,
            imagen: item.image || null,
            listaCompras: item.shoppingList || null
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
                    updatedAt: Date.now(),
                    // Datos adicionales
                    time: noteData.hora || null,
                    image: noteData.imagen || null,
                    shoppingList: noteData.listaCompras || []
                };
                items.push(newItem);
            });
            saveItems();
        }

        renderFoldersList();
        
        // Renderizar imágenes y listas de compras después de un pequeño delay
        setTimeout(() => {
            // Renderizar imágenes
            if (typeof window.addImagesToRenderedItems === 'function') {
                window.addImagesToRenderedItems();
            }
            
            // Renderizar listas de compras
            if (typeof window.addShoppingListsToItems === 'function') {
                window.addShoppingListsToItems();
            }
        }, 200);
        
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
            updatedAt: Date.now(),
            // Datos adicionales
            time: data.hora || null,
            image: data.imagen || null,
            shoppingList: data.listaCompras || []
        };

        items.push(newItem);
        saveItems();

        // Refrescar vista actual
        if (currentView === 'todo') {
            renderList();
        } else if (currentView === 'folders' && folderId) {
            renderFolderItems(folderId);
        }
        
        // Renderizar imágenes y listas de compras después de un pequeño delay
        setTimeout(() => {
            // Renderizar imágenes
            if (typeof window.addImagesToRenderedItems === 'function') {
                window.addImagesToRenderedItems();
            }
            
            // Renderizar listas de compras
            if (typeof window.addShoppingListsToItems === 'function') {
                window.addShoppingListsToItems();
            }
        }, 200);

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

// ===== FUNCIONES PARA VERSÍCULO DIARIO =====

// Función para obtener la fecha actual en formato YYYY-MM-DD
function getCurrentDateString() {
    const today = new Date();
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0');
}

// Función para cargar versículos desde el archivo JSON
function loadDailyVerses() {
    return fetch('versiculos.json')
        .then(response => response.json())
        .then(verses => {
            dailyVerses = verses;
            return verses;
        })
        .catch(error => {
            console.error('Error cargando versículos:', error);
            return [];
        });
}

// Función para obtener el versículo del día (mantiene el mismo durante todo el día)
function getDailyVerse() {
    if (!dailyVerses || dailyVerses.length === 0) {
        return null;
    }
    
    const today = getCurrentDateString();
    
    // Si es un nuevo día o no hay versículo cargado, calcular nuevo índice
    if (lastVerseDate !== today || isNaN(currentVerseIndex) || currentVerseIndex === 0) {
        // Usar el día del año para seleccionar el versículo
        const todayDate = new Date();
        const dayOfYear = Math.floor((todayDate - new Date(todayDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        currentVerseIndex = dayOfYear % dailyVerses.length;
        lastVerseDate = today;
        
        // Guardar la configuración
        saveDailyVerseSettings();
    }
    
    return dailyVerses[currentVerseIndex] || null;
}

// Función para mostrar el versículo diario
function showDailyVerse() {
    if (!dailyVerses || dailyVerses.length === 0) {
        loadDailyVerses().then(() => {
            const verse = getDailyVerse();
            if (verse && dailyVerseText && dailyVerseReference) {
                dailyVerseText.textContent = `"${verse.texto}"`;
                dailyVerseReference.textContent = verse.cita;
                if (dailyVerseModal) {
                    dailyVerseModal.classList.remove('hidden');
                }
            }
        });
    } else {
        const verse = getDailyVerse();
        if (verse && dailyVerseText && dailyVerseReference) {
            dailyVerseText.textContent = `"${verse.texto}"`;
            dailyVerseReference.textContent = verse.cita;
            if (dailyVerseModal) {
                dailyVerseModal.classList.remove('hidden');
            }
        }
    }
}

// Función para mostrar el siguiente versículo
function showNextVerse() {
    if (dailyVerses && dailyVerses.length > 0) {
        currentVerseIndex = (currentVerseIndex + 1) % dailyVerses.length;
        const verse = dailyVerses[currentVerseIndex];
        if (verse && dailyVerseText && dailyVerseReference) {
            dailyVerseText.textContent = `"${verse.texto}"`;
            dailyVerseReference.textContent = verse.cita;
        }
        saveDailyVerseSettings();
    }
}

// Función para guardar configuración del versículo diario
function saveDailyVerseSettings() {
    try {
        localStorage.setItem('dailyVerseEnabled', dailyVerseEnabled.toString());
        localStorage.setItem('currentVerseIndex', currentVerseIndex.toString());
        localStorage.setItem('lastVerseDate', lastVerseDate || '');
    } catch (error) {
        console.error('Error guardando configuración del versículo:', error);
    }
}

// Función para cargar configuración del versículo diario
function loadDailyVerseSettings() {
    try {
        const savedEnabled = localStorage.getItem('dailyVerseEnabled');
        const savedIndex = localStorage.getItem('currentVerseIndex');
        const savedDate = localStorage.getItem('lastVerseDate');
        
        // Solo cargar configuración si existe, sino mantener valores por defecto
        if (savedEnabled !== null) {
            dailyVerseEnabled = savedEnabled === 'true';
        }
        // Si no hay configuración guardada, dailyVerseEnabled ya está en true por defecto
        
        if (dailyVerseToggle) {
            dailyVerseToggle.checked = dailyVerseEnabled;
        }
        
        if (savedIndex !== null) {
            currentVerseIndex = parseInt(savedIndex);
        }
        
        if (savedDate) {
            lastVerseDate = savedDate;
        }
        
        // Cargar versículos y mostrar el del día si está habilitado
        loadDailyVerses().then(() => {
            if (dailyVerseEnabled) {
                getDailyVerse(); // Esto asegura que se calcule el versículo correcto para hoy
            }
        });
    } catch (error) {
        console.error('Error cargando configuración del versículo:', error);
    }
}

/**
 * Actualiza el estado visual del toggle de tema
 */
function updateThemeToggleState() {
    if (themeToggleMenu && themeIcon && themeText) {
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        if (isDarkMode) {
            themeToggleMenu.checked = true;
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Cambiar a Modo Claro';
        } else {
            themeToggleMenu.checked = false;
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Cambiar a Modo Oscuro';
        }
    }
}

/**
 * Actualiza la visibilidad del versículo diario en el modal principal
 */
function updateVerseWidgetVisibility() {
    const verseWidget = document.getElementById('verse-widget');
    if (verseWidget && dailyVerseToggle) {
        if (dailyVerseToggle.checked) {
            verseWidget.classList.remove('hidden');
            // Mostrar el versículo cuando se activa
            displayDailyVerse();
        } else {
            verseWidget.classList.add('hidden');
        }
    }
}

// ===== FUNCIONES PARA FOUND MY VERSE =====

/**
 * TEMAS DISPONIBLES CON SUS VERSÍCULOS (CONSOLIDADOS)
 */
const verseThemes = {
    "Fe y Confianza en Dios": {
        emoji: "🌿",
        verses: []
    },
    "Ánimo y Fortaleza": {
        emoji: "💪", 
        verses: []
    },
    "Esperanza y Promesas": {
        emoji: "✨",
        verses: []
    },
    "Amor y Misericordia": {
        emoji: "🕊️",
        verses: []
    },
    "Sabiduría y Guía": {
        emoji: "🌟",
        verses: []
    },
    "Paz y Descanso en Dios": {
        emoji: "🌤️",
        verses: []
    },
    "Gratitud y Alabanza": {
        emoji: "🌾",
        verses: []
    },
    "Gozo y Alegría": {
        emoji: "🌞",
        verses: []
    },
    "Protección y Cuidado Divino": {
        emoji: "🛡️",
        verses: []
    },
    "Oración y Comunión con Dios": {
        emoji: "🙏",
        verses: []
    },
    "Obediencia y Servicio": {
        emoji: "❤️",
        verses: []
    },
    "Vida Eterna y Salvación": {
        emoji: "👑",
        verses: []
    }
};

/**
 * ORGANIZA LOS VERSÍCULOS POR TEMAS SEGÚN SU CONTENIDO ESPIRITUAL
 */
function organizeVersesByThemes() {
    if (!dailyVerses || dailyVerses.length === 0) return;
    
    // Limpiar arrays de versículos
    Object.keys(verseThemes).forEach(theme => {
        verseThemes[theme].verses = [];
    });
    
    // Palabras clave para cada tema (CONSOLIDADAS)
    const themeKeywords = {
        "Fe y Confianza en Dios": ["fe", "confianza", "confiar", "creer", "creencia", "confía", "confío", "confiamos", "seguridad", "seguro"],
        "Ánimo y Fortaleza": ["ánimo", "fortaleza", "fuerza", "esfuerzo", "valiente", "cobardía", "fortalece", "esfuérzate", "poder", "poderoso", "propósito", "vida nueva", "renovar", "transformar", "llamado", "vocación", "misión"],
        "Esperanza y Promesas": ["esperanza", "promesa", "esperar", "aguardar", "prometió", "esperamos", "perseverancia", "paciencia", "aguantar", "persistir"],
        "Amor y Misericordia": ["amor", "misericordia", "amar", "amado", "misericordioso", "amados", "amamos", "perdón", "gracia"],
        "Sabiduría y Guía": ["sabiduría", "sabio", "inteligencia", "conocimiento", "entendimiento", "guía", "enseñar", "caminos", "dirección", "enderezar", "conducir"],
        "Paz y Descanso en Dios": ["paz", "descanso", "tranquilo", "quietud", "reposo", "descansar", "tranquilidad"],
        "Gratitud y Alabanza": ["gratitud", "alabanza", "gracias", "bendecir", "alabar", "agradecido", "bendición", "adoración"],
        "Gozo y Alegría": ["gozo", "alegría", "regocijo", "gozoso", "alegre", "feliz", "júbilo", "celebrar"],
        "Protección y Cuidado Divino": ["protección", "cuidado", "guardar", "defender", "amparo", "refugio", "sombra", "escudo"],
        "Oración y Comunión con Dios": ["oración", "orar", "comunión", "clama", "invocar", "pedir", "buscar", "adorar"],
        "Obediencia y Servicio": ["obediencia", "obedecer", "fidelidad", "fiel", "mandamientos", "guardar", "cumplir", "servicio", "servir", "humildad", "humilde", "siervo"],
        "Vida Eterna y Salvación": ["vida eterna", "salvación", "salvar", "eterno", "redención", "perdón", "justificación"]
    };
    
    // Función para determinar el tema de un versículo
    function getVerseTheme(verse) {
        const text = verse.texto.toLowerCase();
        const citation = verse.cita.toLowerCase();
        const fullText = text + " " + citation;
        
        let bestMatch = null;
        let maxMatches = 0;
        
        // Buscar coincidencias por tema
        Object.keys(themeKeywords).forEach(theme => {
            const keywords = themeKeywords[theme];
            let matches = 0;
            
            keywords.forEach(keyword => {
                if (fullText.includes(keyword)) {
                    matches++;
                }
            });
            
            if (matches > maxMatches) {
                maxMatches = matches;
                bestMatch = theme;
            }
        });
        
        // Si no hay coincidencias claras, asignar por contexto bíblico
        if (!bestMatch || maxMatches === 0) {
            if (citation.includes("proverbios") || citation.includes("santiago") || citation.includes("eclesiastés")) {
                bestMatch = "Sabiduría y Guía";
            } else if (citation.includes("salmos")) {
                if (text.includes("alabar") || text.includes("bendecir") || text.includes("gracias")) {
                    bestMatch = "Gratitud y Alabanza";
                } else if (text.includes("protección") || text.includes("guardar") || text.includes("refugio")) {
                    bestMatch = "Protección y Cuidado Divino";
                } else {
                    bestMatch = "Fe y Confianza en Dios";
                }
            } else if (citation.includes("juan") && text.includes("vida eterna")) {
                bestMatch = "Vida Eterna y Salvación";
            } else if (citation.includes("mateo") || citation.includes("marcos") || citation.includes("lucas")) {
                if (text.includes("orar") || text.includes("pedir")) {
                    bestMatch = "Oración y Comunión con Dios";
                } else {
                    bestMatch = "Fe y Confianza en Dios";
                }
            } else {
                bestMatch = "Fe y Confianza en Dios"; // Tema por defecto
            }
        }
        
        return bestMatch;
    }
    
    // Organizar versículos por tema
    dailyVerses.forEach(verse => {
        const theme = getVerseTheme(verse);
        if (verseThemes[theme]) {
            verseThemes[theme].verses.push(verse);
        }
    });
    
    // Mostrar estadísticas de distribución
    console.log("Distribución de versículos por temas:");
    Object.keys(verseThemes).forEach(theme => {
        console.log(`${theme}: ${verseThemes[theme].verses.length} versículos`);
    });
}

/**
 * MUESTRA EL MODAL DE FOUND MY VERSE
 */
function showFoundMyVerseModal() {
    if (foundMyVerseModal) {
        organizeVersesByThemes();
        loadThemesView();
        foundMyVerseModal.classList.remove('hidden');
        configMenu.classList.add('hidden'); // Cerrar menú de configuración
    }
}

/**
 * CIERRA EL MODAL DE FOUND MY VERSE
 */
function closeFoundMyVerseModal() {
    if (foundMyVerseModal) {
        foundMyVerseModal.classList.add('hidden');
        showThemesView();
    }
}

/**
 * CARGA LA VISTA DE TEMAS
 */
function loadThemesView() {
    if (!themesGrid) return;
    
    themesGrid.innerHTML = '';
    
    Object.keys(verseThemes).forEach(themeName => {
        const theme = verseThemes[themeName];
        const themeCard = document.createElement('div');
        themeCard.className = 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105';
        themeCard.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="text-2xl">${theme.emoji}</span>
                <span class="text-sm text-purple-600 dark:text-purple-400 font-medium">${theme.verses.length} versículos</span>
            </div>
            <h5 class="font-semibold text-gray-800 dark:text-gray-200 text-sm">${themeName}</h5>
        `;
        
        themeCard.addEventListener('click', () => {
            showVersesView(themeName);
        });
        
        themesGrid.appendChild(themeCard);
    });
}

/**
 * MUESTRA LA VISTA DE TEMAS
 */
function showThemesView() {
    if (themesView) themesView.classList.remove('hidden');
    if (versesView) versesView.classList.add('hidden');
}

/**
 * MUESTRA LA VISTA DE VERSÍCULOS PARA UN TEMA
 */
function showVersesView(themeName) {
    if (!versesList || !currentThemeTitle) return;
    
    const theme = verseThemes[themeName];
    if (!theme) return;
    
    currentThemeTitle.textContent = `${theme.emoji} ${themeName}`;
    versesList.innerHTML = '';
    
    theme.verses.forEach((verse, index) => {
        const verseCard = document.createElement('div');
        verseCard.className = 'bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300';
        verseCard.innerHTML = `
            <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                    <p class="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-2">"${verse.texto}"</p>
                    <p class="text-purple-600 dark:text-purple-400 font-medium text-xs">— ${verse.cita}</p>
                </div>
                <button class="share-verse-found-btn ml-3 p-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200" data-verse='${JSON.stringify(verse)}' title="Compartir versículo">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                </button>
            </div>
        `;
        
        versesList.appendChild(verseCard);
    });
    
    // Mostrar vista de versículos
    if (themesView) themesView.classList.add('hidden');
    if (versesView) versesView.classList.remove('hidden');
    
    // Agregar event listeners para compartir
    versesList.querySelectorAll('.share-verse-found-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const verseData = JSON.parse(btn.getAttribute('data-verse'));
            shareFoundVerse(verseData);
        });
    });
}

/**
 * COMPARTE UN VERSÍCULO DESDE FOUND MY VERSE
 */
async function shareFoundVerse(verse) {
    if (!verse) {
        showSystemMessage("No hay versículo para compartir", 'error');
        return;
    }
    
    const shareText = `📖 Versículo - OrganizApp\n\n"${verse.texto}"\n— ${verse.cita}\n\nCompartido desde OrganizApp`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Versículo',
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
 * BUSCA VERSÍCULOS POR CONTENIDO
 */
function searchVerses(searchTerm) {
    if (!versesList || !currentThemeTitle) return;
    
    // Organizar versículos por temas si no está hecho
    organizeVersesByThemes();
    
    // Buscar en todos los versículos de todos los temas
    const allVerses = [];
    Object.keys(verseThemes).forEach(themeName => {
        const theme = verseThemes[themeName];
        theme.verses.forEach(verse => {
            allVerses.push({
                ...verse,
                theme: themeName,
                themeEmoji: theme.emoji
            });
        });
    });
    
    // Filtrar versículos que contengan el término de búsqueda
    const filteredVerses = allVerses.filter(verse => 
        verse.texto.toLowerCase().includes(searchTerm) ||
        verse.cita.toLowerCase().includes(searchTerm)
    );
    
    // Actualizar título
    currentThemeTitle.textContent = `🔍 Resultados de búsqueda: "${searchTerm}" (${filteredVerses.length} versículos)`;
    
    // Limpiar lista
    versesList.innerHTML = '';
    
    if (filteredVerses.length === 0) {
        versesList.innerHTML = `
            <div class="text-center py-8">
                <div class="text-6xl mb-4">🔍</div>
                <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No se encontraron versículos</h3>
                <p class="text-sm text-gray-500 dark:text-gray-500">Intenta con otras palabras clave</p>
            </div>
        `;
    } else {
        // Mostrar versículos encontrados
        filteredVerses.forEach((verse, index) => {
            const verseCard = document.createElement('div');
            verseCard.className = 'bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300';
            verseCard.innerHTML = `
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <div class="flex items-center mb-2">
                            <span class="text-sm text-purple-600 dark:text-purple-400 font-medium mr-2">${verse.themeEmoji} ${verse.theme}</span>
                        </div>
                        <p class="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-2">"${verse.texto}"</p>
                        <p class="text-purple-600 dark:text-purple-400 font-medium text-xs">— ${verse.cita}</p>
                    </div>
                    <button class="share-verse-found-btn ml-3 p-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200" data-verse='${JSON.stringify(verse)}' title="Compartir versículo">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                    </button>
                </div>
            `;
            
            versesList.appendChild(verseCard);
        });
        
        // Agregar event listeners para compartir
        versesList.querySelectorAll('.share-verse-found-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const verseData = JSON.parse(btn.getAttribute('data-verse'));
                shareFoundVerse(verseData);
            });
        });
    }
    
    // Mostrar vista de versículos
    if (themesView) themesView.classList.add('hidden');
    if (versesView) versesView.classList.remove('hidden');
}

// ===== EVENT LISTENERS PARA CONFIGURACIÓN =====

// Event listener para el botón de configuración
if (configBtn) {
    configBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (configMenu) {
            configMenu.classList.toggle('hidden');
            // Actualizar el estado del toggle cuando se abre el menú
            if (!configMenu.classList.contains('hidden')) {
                updateThemeToggleState();
                updateVerseWidgetVisibility();
            }
        }
    });
}

// Event listener para cerrar el menú de configuración al hacer clic fuera
document.addEventListener('click', function(e) {
    if (configMenu && !configMenu.contains(e.target) && !configBtn.contains(e.target)) {
        configMenu.classList.add('hidden');
    }
});

// Event listeners para Found My Verse
if (foundMyVerseBtn) {
    foundMyVerseBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showFoundMyVerseModal();
    });
}

if (closeFoundVerseBtn) {
    closeFoundVerseBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeFoundMyVerseModal();
    });
}

if (backToThemesBtn) {
    backToThemesBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showThemesView();
    });
}

// Event listener para cerrar el modal de Found My Verse al hacer clic fuera
document.addEventListener('click', function(e) {
    if (foundMyVerseModal && !foundMyVerseModal.contains(e.target) && !foundMyVerseBtn.contains(e.target)) {
        closeFoundMyVerseModal();
    }
});

// Event listeners para búsqueda de versículos
if (verseSearchInput) {
    verseSearchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm.length > 0) {
            clearVerseSearchBtn.classList.remove('hidden');
            searchVerses(searchTerm);
        } else {
            clearVerseSearchBtn.classList.add('hidden');
            // Si estamos en vista de temas, recargar temas
            if (themesView && !themesView.classList.contains('hidden')) {
                loadThemesView();
            } else {
                // Si estamos en vista de versículos, volver a temas
                showThemesView();
            }
        }
    });
}

if (clearVerseSearchBtn) {
    clearVerseSearchBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        verseSearchInput.value = '';
        clearVerseSearchBtn.classList.add('hidden');
        
        // Volver a la vista de temas
        showThemesView();
    });
}


// Event listener para el toggle de versículo diario
if (dailyVerseToggle) {
    dailyVerseToggle.addEventListener('change', function() {
        // Actualizar el estado
        dailyVerseEnabled = this.checked;
        // Guardar configuración
        saveDailyVerseSettings();
        // Actualizar visibilidad del widget
        updateVerseWidgetVisibility();
    });
}

// Event listener para el toggle de tema en el menú
if (themeToggleMenu) {
    themeToggleMenu.addEventListener('change', function() {
        // Cambiar el tema directamente
        if (themeToggleMenu.checked) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        
        // Actualizar el estado visual del toggle
        updateThemeToggleState();
    });
}

// Event listener para el botón de importar en el menú
if (importBtnMenu) {
    importBtnMenu.addEventListener('click', function() {
        // Simular click en el botón original de importar
        const importBtn = document.getElementById('import-btn');
        if (importBtn) {
            importBtn.click();
        }
        if (configMenu) {
            configMenu.classList.add('hidden');
        }
    });
}

// Event listener para el botón de notificaciones en el menú
if (notificationBtnMenu) {
    notificationBtnMenu.addEventListener('click', function() {
        showSystemMessage('🔔 Funcionalidad de notificaciones próximamente', 'info');
        if (configMenu) {
            configMenu.classList.add('hidden');
        }
    });
}

// Event listener para cerrar el modal del versículo
if (closeVerseBtn) {
    closeVerseBtn.addEventListener('click', function() {
        if (dailyVerseModal) {
            dailyVerseModal.classList.add('hidden');
        }
    });
}

// Event listener para el botón de siguiente versículo
if (nextVerseBtn) {
    nextVerseBtn.addEventListener('click', function() {
        showNextVerse();
    });
}
// ===== EVENT LISTENERS PARA CARPETAS =====

// Botón "Volver a Carpetas"
if (backToFoldersBtn) {
    backToFoldersBtn.addEventListener('click', function() {
        showFoldersListView();
    });
}

// Botón "Seleccionar" en vista de carpeta
const selectFolderItemsModeBtn = document.getElementById('select-folder-items-mode-btn');
if (selectFolderItemsModeBtn) {
    selectFolderItemsModeBtn.addEventListener('click', function() {
        toggleFolderSelectionMode();
    });
}

// Botón "Seleccionar Todo" en vista de carpeta
const selectAllFolderItemsBtn = document.getElementById('select-all-folder-items-btn');
if (selectAllFolderItemsBtn) {
    selectAllFolderItemsBtn.addEventListener('click', function() {
        selectAllFolderItems();
    });
}

// Botones del menú de acciones múltiples en carpetas
const folderCancelSelectionBtn = document.getElementById('folder-cancel-selection-btn');
const folderClearSelectionBtn = document.getElementById('folder-clear-selection-btn');
const folderMoveToFolderBtn = document.getElementById('folder-move-to-folder-btn');
const folderChangeColorBtn = document.getElementById('folder-change-color-btn');

if (folderCancelSelectionBtn) {
    folderCancelSelectionBtn.addEventListener('click', function() {
        cancelFolderSelection();
    });
}

if (folderClearSelectionBtn) {
    folderClearSelectionBtn.addEventListener('click', function() {
        deleteSelectedFolderItems();
    });
}

if (folderMoveToFolderBtn) {
    folderMoveToFolderBtn.addEventListener('click', function() {
        moveSelectedFolderItems();
    });
}

if (folderChangeColorBtn) {
    folderChangeColorBtn.addEventListener('click', function() {
        changeColorSelectedFolderItems();
    });
}

// ===== FUNCIONES PARA SELECCIÓN MÚLTIPLE EN CARPETAS =====

let folderSelectionMode = false;
let selectedFolderItems = new Set();

/** Activa/desactiva el modo de selección en carpetas */
function toggleFolderSelectionMode() {
    folderSelectionMode = !folderSelectionMode;
    selectedFolderItems.clear();
    
    const selectFolderItemsModeBtn = document.getElementById('select-folder-items-mode-btn');
    const selectAllFolderItemsBtn = document.getElementById('select-all-folder-items-btn');
    const folderSelectionActions = document.getElementById('folder-selection-actions');
    
    if (folderSelectionMode) {
        // Activar modo de selección
        if (selectFolderItemsModeBtn) {
            selectFolderItemsModeBtn.textContent = '❌ Cancelar';
            selectFolderItemsModeBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            selectFolderItemsModeBtn.classList.add('bg-red-500', 'hover:bg-red-600');
        }
        if (selectAllFolderItemsBtn) selectAllFolderItemsBtn.classList.remove('hidden');
        
        // Agregar checkboxes a los elementos
        renderFolderItems(selectedFolderId);
    } else {
        // Desactivar modo de selección
        if (selectFolderItemsModeBtn) {
            selectFolderItemsModeBtn.textContent = '✏️ Seleccionar';
            selectFolderItemsModeBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
            selectFolderItemsModeBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
        }
        if (selectAllFolderItemsBtn) selectAllFolderItemsBtn.classList.add('hidden');
        if (folderSelectionActions) folderSelectionActions.classList.add('hidden');
        
        // Quitar checkboxes
        renderFolderItems(selectedFolderId);
    }
}

/** Selecciona todos los elementos de la carpeta */
function selectAllFolderItems() {
    if (!selectedFolderId) return;
    
    const folderItems = getItemsInFolder(selectedFolderId);
    selectedFolderItems.clear();
    
    folderItems.forEach(item => {
        selectedFolderItems.add(item.id);
    });
    
    updateFolderSelectionUI();
}

/** Cancela la selección en carpetas */
function cancelFolderSelection() {
    folderSelectionMode = false;
    selectedFolderItems.clear();
    toggleFolderSelectionMode();
}

/** Elimina los elementos seleccionados */
function deleteSelectedFolderItems() {
    if (selectedFolderItems.size === 0) {
        showSystemMessage('⚠️ No hay elementos seleccionados', 'warning');
        return;
    }
    
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedFolderItems.size} elemento(s)?`)) {
        return;
    }
    
    selectedFolderItems.forEach(itemId => {
        const index = items.findIndex(i => i.id === itemId);
        if (index !== -1) {
            items.splice(index, 1);
        }
    });
    
    saveItems();
    selectedFolderItems.clear();
    renderFolderItems(selectedFolderId);
    updateFolderSelectionUI();
    showSystemMessage('🗑️ Elementos eliminados correctamente', 'success');
}

/** Mueve los elementos seleccionados a otra carpeta */
function moveSelectedFolderItems() {
    if (selectedFolderItems.size === 0) {
        showSystemMessage('⚠️ No hay elementos seleccionados', 'warning');
        return;
    }
    
    // Obtener carpetas disponibles (excluyendo la actual)
    const availableFolders = folders.filter(f => f.id !== selectedFolderId);
    
    if (availableFolders.length === 0) {
        showSystemMessage('⚠️ No hay otras carpetas disponibles', 'warning');
        return;
    }
    
    // Crear selector de carpeta
    const folderOptions = availableFolders.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
    const targetFolderId = prompt(`Selecciona la carpeta destino:\n\n${availableFolders.map((f, i) => `${i + 1}. ${f.name}`).join('\n')}\n\nIngresa el número de carpeta:`);
    
    if (!targetFolderId) return;
    
    const folderIndex = parseInt(targetFolderId) - 1;
    if (isNaN(folderIndex) || folderIndex < 0 || folderIndex >= availableFolders.length) {
        showSystemMessage('❌ Opción inválida', 'error');
        return;
    }
    
    const targetFolder = availableFolders[folderIndex];
    
    selectedFolderItems.forEach(itemId => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            item.folderId = targetFolder.id;
        }
    });
    
    saveItems();
    selectedFolderItems.clear();
    renderFolderItems(selectedFolderId);
    updateFolderSelectionUI();
    showSystemMessage(`📁 ${selectedFolderItems.size} elemento(s) movido(s) a "${targetFolder.name}"`, 'success');
}

/** Cambia el color de los elementos seleccionados */
function changeColorSelectedFolderItems() {
    if (selectedFolderItems.size === 0) {
        showSystemMessage('⚠️ No hay elementos seleccionados', 'warning');
        return;
    }
    
    const colors = ['blue', 'green', 'yellow', 'red', 'purple', 'pink', 'gray', 'indigo'];
    const colorOptions = colors.map((c, i) => `${i + 1}. ${c.charAt(0).toUpperCase() + c.slice(1)}`).join('\n');
    const colorChoice = prompt(`Selecciona un color:\n\n${colorOptions}\n\nIngresa el número:`);
    
    if (!colorChoice) return;
    
    const colorIndex = parseInt(colorChoice) - 1;
    if (isNaN(colorIndex) || colorIndex < 0 || colorIndex >= colors.length) {
        showSystemMessage('❌ Opción inválida', 'error');
        return;
    }
    
    const selectedColor = colors[colorIndex];
    
    selectedFolderItems.forEach(itemId => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            item.color = selectedColor;
        }
    });
    
    saveItems();
    selectedFolderItems.clear();
    renderFolderItems(selectedFolderId);
    updateFolderSelectionUI();
    showSystemMessage(`🎨 Color cambiado a ${selectedColor}`, 'success');
}

/** Actualiza la UI de selección en carpetas */
function updateFolderSelectionUI() {
    const folderSelectionActions = document.getElementById('folder-selection-actions');
    const folderSelectedCount = document.getElementById('folder-selected-count');
    
    if (folderSelectionActions && folderSelectedCount) {
        if (selectedFolderItems.size > 0) {
            folderSelectionActions.classList.remove('hidden');
            folderSelectedCount.textContent = selectedFolderItems.size;
        } else {
            folderSelectionActions.classList.add('hidden');
        }
    }
    
    // Actualizar checkboxes
    const checkboxes = document.querySelectorAll('.folder-item-checkbox');
    checkboxes.forEach(checkbox => {
        const itemId = checkbox.getAttribute('data-item-id');
        checkbox.checked = selectedFolderItems.has(itemId);
    });
}

/** Maneja el click en checkbox de elemento de carpeta */
function toggleFolderItemSelection(itemId) {
    if (selectedFolderItems.has(itemId)) {
        selectedFolderItems.delete(itemId);
    } else {
        selectedFolderItems.add(itemId);
    }
    updateFolderSelectionUI();
}

// ===== INICIALIZACIÓN =====

// Cargar configuración del versículo diario al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    loadDailyVerseSettings();
    
    // Solicitar permisos de notificación si hay recordatorios
    setTimeout(() => {
        const hasReminders = items.some(item => item.type === 'Recordatorio');
        if (hasReminders && Notification.permission === 'default') {
            showSystemMessage('💡 Activa las notificaciones para recibir alertas de tus recordatorios en tu celular', 'info');
            // Esperar 2 segundos antes de solicitar permisos
            setTimeout(() => {
                requestNotificationPermission();
            }, 2000);
        } else if (Notification.permission === 'granted') {
            // Reprogramar notificaciones existentes
            scheduleAllReminderNotifications();
        }
    }, 1000);
});

// ===== MANEJO DE MENSAJES DEL SERVICE WORKER =====
// Escuchar mensajes del service worker (cuando el usuario hace clic en notificaciones)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {
        console.log('[App] Mensaje del Service Worker:', event.data);
        
        const { type, itemId } = event.data;
        
        if (type === 'COMPLETE_ITEM' && itemId) {
            // Completar el item
            const item = items.find(i => i.id === itemId);
            if (item) {
                item.status = 'completed';
                item.updatedAt = Date.now();
                saveItems();
                renderList();
                showSystemMessage(`✅ "${item.content}" marcado como completado`, 'success');
                
                // Limpiar notificaciones de este item
                clearReminderNotifications(itemId);
            }
        } else if (type === 'NAVIGATE_TO_ITEM' && itemId) {
            // Navegar al item
            const element = document.getElementById(`item-${itemId}`);
            if (element) {
                // Cambiar a la vista apropiada
                if (currentView !== 'todo') {
                    switchView('todo');
                }
                
                // Scroll al elemento
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('highlight-pulse');
                    setTimeout(() => element.classList.remove('highlight-pulse'), 2000);
                }, 500);
            }
        }
    });
}

// ===== SOLICITAR PERMISOS AL CREAR PRIMER RECORDATORIO =====
// Interceptar la creación de recordatorios para solicitar permisos
const originalAddItem = addItem;
addItem = function(content, type, colorClass, statusClass, date, folderId = null, time = null) {
    const result = originalAddItem.call(this, content, type, colorClass, statusClass, date, folderId, time);
    
    // Si es un recordatorio y no tenemos permisos, solicitarlos
    if (type === 'Recordatorio' && time && Notification.permission === 'default') {
        setTimeout(() => {
            requestNotificationPermission();
        }, 500);
    }
    
    return result;
};

// ========================================
// SISTEMA DE COMPARTIR VERSÍCULOS PERSONALIZADOS
// ========================================

// Variables globales para personalización
let currentVerseData = {
    text: '',
    reference: '',
    background: 'fondo1',
    font: 'serif',
    color: 'white',
    align: 'center'
};

// Referencias a elementos del DOM
const shareVerseBtn = document.getElementById('share-verse-btn');
const customizeVerseModal = document.getElementById('customize-verse-modal');
const closeCustomizeVerseBtn = document.getElementById('close-customize-verse-btn');
const cancelCustomizeVerseBtn = document.getElementById('cancel-customize-verse-btn');
const shareCustomizedVerseBtn = document.getElementById('share-customized-verse-btn');
const versePreviewContainer = document.getElementById('verse-preview-container');
const versePreviewContent = document.getElementById('verse-preview-content');
const versePreviewText = document.getElementById('verse-preview-text');
const versePreviewReference = document.getElementById('verse-preview-reference');
const customBgInput = document.getElementById('custom-bg-input');
const uploadCustomBgBtn = document.getElementById('upload-custom-bg-btn');

// Mapeo de fuentes
const fontFamilies = {
    'serif': "'Georgia', serif",
    'sans': "'Arial', sans-serif",
    'cursive': "'Brush Script MT', cursive",
    'monospace': "'Courier New', monospace"
};

// Mapeo de colores
const textColors = {
    'white': '#ffffff',
    'black': '#000000',
    'gold': '#FFD700'
};

/** Abre el modal de personalización de versículo */
function openCustomizeVerseModal() {
    // Obtener el versículo actual del DOM
    const verseContent = document.getElementById('verse-content');
    if (!verseContent) return;
    
    const verseTextElement = verseContent.querySelector('p.italic');
    const verseRefElement = verseContent.querySelector('p.text-sm.mt-2');
    
    if (!verseTextElement) {
        showSystemMessage('⚠️ No hay versículo disponible para compartir', 'warning');
        return;
    }
    
    // Guardar datos del versículo
    currentVerseData.text = verseTextElement.textContent.replace(/^[""]|[""]$/g, '').trim();
    currentVerseData.reference = verseRefElement ? verseRefElement.textContent.trim() : '';
    
    // Actualizar vista previa
    updateVersePreview();
    
    // Mostrar modal
    customizeVerseModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/** Cierra el modal de personalización */
function closeCustomizeVerseModal() {
    customizeVerseModal.classList.add('hidden');
    document.body.style.overflow = '';
}

/** Actualiza la vista previa del versículo */
function updateVersePreview() {
    // Actualizar fondo
    const bgUrl = currentVerseData.background.startsWith('data:') 
        ? currentVerseData.background 
        : `assets/backgrounds/${currentVerseData.background}.jpg`;
    versePreviewContainer.style.backgroundImage = `url('${bgUrl}')`;
    
    // Actualizar fuente
    versePreviewContent.style.fontFamily = fontFamilies[currentVerseData.font];
    
    // Actualizar color
    const color = textColors[currentVerseData.color];
    versePreviewText.style.color = color;
    versePreviewReference.style.color = color;
    
    // Actualizar alineación
    if (currentVerseData.align === 'center') {
        versePreviewContent.style.justifyContent = 'center';
        versePreviewContent.style.paddingBottom = '8rem';
    } else {
        versePreviewContent.style.justifyContent = 'flex-end';
        versePreviewContent.style.paddingBottom = '4rem';
    }
    
    // Actualizar texto
    versePreviewText.textContent = `"${currentVerseData.text}"`;
    versePreviewReference.textContent = currentVerseData.reference;
}

/** Maneja la selección de fondo */
function handleBackgroundSelection(button) {
    // Quitar selección de todos los botones
    document.querySelectorAll('.verse-bg-option').forEach(btn => {
        btn.classList.remove('active', 'border-amber-500', 'border-4');
        btn.classList.add('border-gray-300', 'border-2');
    });
    
    // Marcar el seleccionado
    button.classList.add('active', 'border-amber-500', 'border-4');
    button.classList.remove('border-gray-300', 'border-2');
    
    // Actualizar estado
    currentVerseData.background = button.getAttribute('data-bg');
    updateVersePreview();
}

/** Maneja la selección de fuente */
function handleFontSelection(button) {
    // Quitar selección de todos los botones
    document.querySelectorAll('.verse-font-option').forEach(btn => {
        btn.classList.remove('active', 'border-amber-500', 'bg-amber-50', 'dark:bg-amber-900/20');
        btn.classList.add('border-gray-300', 'dark:border-gray-600');
    });
    
    // Marcar el seleccionado
    button.classList.add('active', 'border-amber-500', 'bg-amber-50', 'dark:bg-amber-900/20');
    button.classList.remove('border-gray-300', 'dark:border-gray-600');
    
    // Actualizar estado
    currentVerseData.font = button.getAttribute('data-font');
    updateVersePreview();
}

/** Maneja la selección de color */
function handleColorSelection(button) {
    // Quitar selección de todos los botones
    document.querySelectorAll('.verse-color-option').forEach(btn => {
        btn.classList.remove('active', 'border-amber-500', 'border-4');
        btn.classList.add('border-gray-300', 'border-2');
    });
    
    // Marcar el seleccionado
    button.classList.add('active', 'border-amber-500', 'border-4');
    button.classList.remove('border-gray-300', 'border-2');
    
    // Actualizar estado
    currentVerseData.color = button.getAttribute('data-color');
    updateVersePreview();
}

/** Maneja la selección de alineación */
function handleAlignSelection(button) {
    // Quitar selección de todos los botones
    document.querySelectorAll('.verse-align-option').forEach(btn => {
        btn.classList.remove('active', 'border-amber-500', 'bg-amber-50', 'dark:bg-amber-900/20');
        btn.classList.add('border-gray-300', 'dark:border-gray-600');
    });
    
    // Marcar el seleccionado
    button.classList.add('active', 'border-amber-500', 'bg-amber-50', 'dark:bg-amber-900/20');
    button.classList.remove('border-gray-300', 'dark:border-gray-600');
    
    // Actualizar estado
    currentVerseData.align = button.getAttribute('data-align');
    updateVersePreview();
}

/** Maneja la carga de imagen personalizada */
function handleCustomBackgroundUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Verificar que sea una imagen
    if (!file.type.startsWith('image/')) {
        showSystemMessage('⚠️ Por favor selecciona un archivo de imagen válido', 'warning');
        return;
    }
    
    // Leer la imagen
    const reader = new FileReader();
    reader.onload = function(e) {
        // Actualizar fondo con la imagen personalizada
        currentVerseData.background = e.target.result;
        updateVersePreview();
        
        // Quitar selección de fondos predefinidos
        document.querySelectorAll('.verse-bg-option').forEach(btn => {
            btn.classList.remove('active', 'border-amber-500', 'border-4');
            btn.classList.add('border-gray-300', 'border-2');
        });
        
        showSystemMessage('✅ Imagen de fondo personalizada cargada', 'success');
    };
    reader.readAsDataURL(file);
}

/** Genera y comparte la imagen del versículo */
async function shareCustomizedVerse() {
    try {
        // Mostrar mensaje de carga
        shareCustomizedVerseBtn.disabled = true;
        shareCustomizedVerseBtn.innerHTML = `
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generando...</span>
        `;
        
        // Crear un contenedor temporal para html2canvas
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '1080px';
        tempContainer.style.height = '1080px';
        document.body.appendChild(tempContainer);
        
        // Clonar el contenido del versículo
        const clonedContent = versePreviewContainer.cloneNode(true);
        clonedContent.style.width = '1080px';
        clonedContent.style.height = '1080px';
        clonedContent.style.position = 'relative';
        tempContainer.appendChild(clonedContent);
        
        // Generar la imagen con html2canvas
        const canvas = await html2canvas(clonedContent, {
            width: 1080,
            height: 1080,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false
        });
        
        // Limpiar contenedor temporal
        document.body.removeChild(tempContainer);
        
        // Convertir canvas a blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
        
        // Intentar compartir usando Web Share API
        if (navigator.share && navigator.canShare) {
            const file = new File([blob], 'versiculo.jpg', { type: 'image/jpeg' });
            
            if (navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Versículo del Día',
                        text: currentVerseData.reference
                    });
                    
                    showSystemMessage('✅ Versículo compartido exitosamente', 'success');
                    closeCustomizeVerseModal();
                    return;
                } catch (shareError) {
                    // Si el usuario cancela, no mostrar error
                    if (shareError.name === 'AbortError') {
                        console.log('Usuario canceló compartir');
                    } else {
                        console.log('Error al compartir:', shareError);
                    }
                }
            }
        }
        
        // Fallback: descargar la imagen
        const url = canvas.toDataURL('image/jpeg', 0.95);
        const link = document.createElement('a');
        link.download = `versiculo-${Date.now()}.jpg`;
        link.href = url;
        link.click();
        
        showSystemMessage('📥 Imagen descargada. Compártela desde tu galería', 'success');
        closeCustomizeVerseModal();
        
    } catch (error) {
        console.error('Error al generar imagen:', error);
        showSystemMessage('❌ Error al generar la imagen', 'error');
    } finally {
        // Restaurar botón
        shareCustomizedVerseBtn.disabled = false;
        shareCustomizedVerseBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Compartir
        `;
    }
}

// Event Listeners para el sistema de compartir versículos
if (shareVerseBtn) {
    shareVerseBtn.addEventListener('click', openCustomizeVerseModal);
}

if (closeCustomizeVerseBtn) {
    closeCustomizeVerseBtn.addEventListener('click', closeCustomizeVerseModal);
}

if (cancelCustomizeVerseBtn) {
    cancelCustomizeVerseBtn.addEventListener('click', closeCustomizeVerseModal);
}

if (shareCustomizedVerseBtn) {
    shareCustomizedVerseBtn.addEventListener('click', shareCustomizedVerse);
}

// Event listeners para opciones de fondo
document.querySelectorAll('.verse-bg-option').forEach(button => {
    button.addEventListener('click', () => handleBackgroundSelection(button));
});

// Event listeners para opciones de fuente
document.querySelectorAll('.verse-font-option').forEach(button => {
    button.addEventListener('click', () => handleFontSelection(button));
});

// Event listeners para opciones de color
document.querySelectorAll('.verse-color-option').forEach(button => {
    button.addEventListener('click', () => handleColorSelection(button));
});

// Event listeners para opciones de alineación
document.querySelectorAll('.verse-align-option').forEach(button => {
    button.addEventListener('click', () => handleAlignSelection(button));
});

// Event listener para subir imagen personalizada
if (uploadCustomBgBtn && customBgInput) {
    uploadCustomBgBtn.addEventListener('click', () => customBgInput.click());
    customBgInput.addEventListener('change', handleCustomBackgroundUpload);
}

// Cerrar modal al hacer clic fuera
if (customizeVerseModal) {
    customizeVerseModal.addEventListener('click', (e) => {
        if (e.target === customizeVerseModal) {
            closeCustomizeVerseModal();
        }
    });
}

console.log('✅ Sistema de compartir versículos personalizados inicializado');

