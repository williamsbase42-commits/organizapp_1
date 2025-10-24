// Service Worker para OrganizApp PWA - Sistema de Actualización Automática
// === CONFIGURACIÓN DE VERSIONADO AUTOMÁTICO ===
const CACHE_VERSION = '2.0.5'; // Modal mejorado y funcionalidad FAB - Actualización automática
const CACHE_NAME = `organizapp-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `organizapp-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `organizapp-dynamic-${CACHE_VERSION}`;

// Archivos estáticos críticos que deben estar siempre en caché
const STATIC_FILES = [
  './',
  './index.html',
  './style.css',
  './image-styles.css',
  './app.js',
  './shopping-list.js',
  './image-crop-modal.js',
  './image-system.js',
  './image-integration.js',
  './manifest.json',
  './versiculos.json',
  './icons/logo-1.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdn.tailwindcss.com/3.4.0/tailwind.min.js'
];

// URLs que siempre deben ir a la red primero (datos dinámicos)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /\/auth\//,
  /\/users\//,
  /\/data\//,
  // Archivos de la app deben verificar actualizaciones
  /\/(app|shopping-list|image-.*|index)\.js$/,
  /\/(style|image-styles)\.css$/,
  /\/index\.html$/
];

// URLs que deben usar caché primero (solo recursos estáticos como imágenes)
const CACHE_FIRST_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
  /\/icons\//,
  /\/images\//
];

// === INSTALACIÓN DEL SERVICE WORKER ===
// Este evento se ejecuta cuando se instala una nueva versión del Service Worker
self.addEventListener('install', event => {
  console.log(`[SW] Instalando Service Worker ${CACHE_VERSION}...`);
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando archivos estáticos críticos...');
        // Cachear todos los archivos estáticos necesarios para funcionar offline
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Instalación completada exitosamente');
        // CRÍTICO: Forzar activación inmediata para aplicar cambios sin esperar
        // Esto permite que la nueva versión se active automáticamente
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Error durante la instalación:', error);
        // Fallback: Intentar cachear archivos individualmente si falla addAll
        return cacheFilesIndividually();
      })
  );
});

// Función auxiliar para cachear archivos individualmente
async function cacheFilesIndividually() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  for (const file of STATIC_FILES) {
    try {
      await cache.add(file);
      console.log(`[SW] Cacheado: ${file}`);
    } catch (error) {
      console.warn(`[SW] No se pudo cachear ${file}:`, error);
    }
  }
}

// === ACTIVACIÓN DEL SERVICE WORKER ===
// Este evento se ejecuta cuando se activa una nueva versión del Service Worker
self.addEventListener('activate', event => {
  console.log(`[SW] Activando Service Worker ${CACHE_VERSION}...`);
  
  event.waitUntil(
    Promise.all([
      // CRÍTICO: Limpiar todas las cachés antiguas para evitar conflictos
      // Esto elimina archivos de versiones anteriores y libera espacio
      cleanOldCaches(),
      // CRÍTICO: Tomar control inmediato de todos los clientes (pestañas abiertas)
      // Esto asegura que la nueva versión se aplique inmediatamente
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activación completada exitosamente');
      
      // CRÍTICO: Notificar a todos los clientes sobre la nueva versión
      // Esto desencadena la recarga automática de la página
      notifyClientsAboutUpdate();
      
      // CRÍTICO: Forzar recarga de todos los clientes después de un breve delay
      setTimeout(() => {
        forceReloadAllClients();
      }, 2000);
    }).catch(error => {
      console.error('[SW] Error durante la activación:', error);
    })
  );
});

// Función para limpiar cachés antiguas (mantiene solo la versión actual)
async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames
    .filter(cacheName => !cacheName.includes(CACHE_VERSION))
    .map(cacheName => {
      console.log(`[SW] Eliminando caché antigua: ${cacheName}`);
      return caches.delete(cacheName);
    });
  
  return Promise.all(deletePromises);
}

// Función para notificar clientes sobre actualización y recargar automáticamente
// CRÍTICO: Esta función es la clave para la actualización automática sin Ctrl+F5
async function notifyClientsAboutUpdate() {
  try {
    // Obtener todas las pestañas/ventanas abiertas de la aplicación
    const clients = await self.clients.matchAll();
    
    // Enviar mensaje a cada cliente (pestaña) sobre la nueva versión
    clients.forEach(client => {
      client.postMessage({
        type: 'NEW_VERSION_AVAILABLE',
        version: CACHE_VERSION,
        message: 'Nueva versión disponible. Recargando automáticamente...',
        timestamp: Date.now(),
        autoReload: true // Flag crítico: indica que debe recargar automáticamente
      });
    });
    
    console.log(`[SW] Notificación enviada a ${clients.length} cliente(s)`);
  } catch (error) {
    console.error('[SW] Error notificando clientes:', error);
  }
}

// Función para forzar recarga de todos los clientes
// CRÍTICO: Esta función garantiza que todos los clientes se actualicen
async function forceReloadAllClients() {
  try {
    const clients = await self.clients.matchAll();
    
    clients.forEach(client => {
      client.postMessage({
        type: 'FORCE_RELOAD',
        version: CACHE_VERSION,
        message: 'Forzando recarga para aplicar nueva versión...',
        timestamp: Date.now()
      });
    });
    
    console.log(`[SW] Comando de recarga forzada enviado a ${clients.length} cliente(s)`);
  } catch (error) {
    console.error('[SW] Error forzando recarga de clientes:', error);
  }
}

// === INTERCEPTACIÓN DE REQUESTS ===
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar requests GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar requests de Chrome extensions y otros
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  
  // Determinar estrategia de caché según el tipo de recurso
  if (shouldUseNetworkFirst(url)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (shouldUseCacheFirst(url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Verificar si debe usar Network First (para datos dinámicos)
function shouldUseNetworkFirst(url) {
  return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Verificar si debe usar Cache First (para recursos estáticos)
function shouldUseCacheFirst(url) {
  return CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// === ESTRATEGIAS DE CACHÉ ===

// Estrategia: Network First (para datos dinámicos - siempre intenta red primero)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Red no disponible, usando caché:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si es una página HTML y no hay caché, devolver index.html
    if (request.destination === 'document') {
      return caches.match('./index.html');
    }
    
    throw error;
  }
}

// Estrategia: Cache First (para recursos estáticos - usa caché primero)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Error en cache first:', error);
    
    // Para imágenes, devolver una respuesta vacía si no hay caché
    if (request.destination === 'image') {
      return new Response('', { status: 404 });
    }
    
    throw error;
  }
}

// Estrategia: Stale While Revalidate (para contenido mixto - usa caché y actualiza en background)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(error => {
      console.log('[SW] Error en fetch, usando caché:', error);
      return null;
    });
  
  return cachedResponse || fetchPromise;
}

// === MANEJO DE MENSAJES ===
self.addEventListener('message', event => {
  const { data } = event;
  
  switch (data?.type) {
    case 'SKIP_WAITING':
      console.log('[SW] Saltando espera...');
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({
        type: 'VERSION_INFO',
        version: CACHE_VERSION,
        cacheName: CACHE_NAME
      });
      break;
      
    case 'CHECK_UPDATE':
      checkForUpdate().then(hasUpdate => {
        event.ports[0]?.postMessage({
          type: 'UPDATE_CHECK_RESULT',
          hasUpdate,
          currentVersion: CACHE_VERSION
        });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0]?.postMessage({
          type: 'CACHE_CLEARED',
          success: true
        });
      });
      break;
      
    case 'FORCE_UPDATE':
      // Forzar actualización inmediata
      forceUpdate().then(() => {
        event.ports[0]?.postMessage({
          type: 'UPDATE_FORCED',
          success: true
        });
      });
      break;
  }
});

// Verificar si hay actualizaciones disponibles
async function checkForUpdate() {
  try {
    // Verificar si hay un nuevo service worker disponible
    const registration = await self.registration;
    if (registration.waiting) {
      return true;
    }
    
    // Verificar si hay un nuevo service worker en instalación
    if (registration.installing) {
      return true;
    }
    
    // Intentar actualizar el service worker
    await registration.update();
    
    return registration.waiting !== null;
  } catch (error) {
    console.error('[SW] Error verificando actualización:', error);
    return false;
  }
}

// Forzar actualización inmediata
async function forceUpdate() {
  try {
    const registration = await self.registration;
    await registration.update();
    
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    
    return true;
  } catch (error) {
    console.error('[SW] Error forzando actualización:', error);
    return false;
  }
}

// Limpiar todas las cachés
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName));
  return Promise.all(deletePromises);
}

// === MANEJO DE NOTIFICACIONES PUSH ===
self.addEventListener('push', event => {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'Nueva notificación de OrganizApp',
        icon: './icons/icon-192.png',
        badge: './icons/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1,
          url: data.url || './'
        },
        actions: [
          {
            action: 'open',
            title: 'Abrir',
            icon: './icons/icon-192.png'
          },
          {
            action: 'close',
            title: 'Cerrar',
            icon: './icons/icon-192.png'
          }
        ]
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'OrganizApp', options)
      );
    } catch (error) {
      console.error('[SW] Error procesando notificación push:', error);
    }
  }
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || './')
    );
  }
});

// === MANEJO DE ERRORES GLOBALES ===
self.addEventListener('error', event => {
  console.error('[SW] Error global:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Promesa rechazada:', event.reason);
});

// === INICIALIZACIÓN ===
console.log(`[SW] Service Worker ${CACHE_VERSION} cargado correctamente`);
console.log(`[SW] Caché: ${CACHE_NAME}`);
console.log(`[SW] Archivos estáticos: ${STATIC_FILES.length}`);