// Service Worker para OrganizApp PWA
// === CONFIGURACIÓN DE VERSIONADO AUTOMÁTICO ===
const CACHE_VERSION = 'v1.0.4'; // Incrementar manualmente para nuevas versiones
const CACHE_NAME = `organizapp-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `organizapp-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `organizapp-dynamic-${CACHE_VERSION}`;

// Archivos estáticos a cachear
const STATIC_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './versiculos.json',
  './icons/logo-1.png',
  'https://cdn.tailwindcss.com/3.4.0/tailwind.min.js'
];

// URLs que siempre deben ir a la red
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /\/auth\//,
  /\/users\//
];

// URLs que deben usar cache primero
const CACHE_FIRST_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:css|js)$/,
  /\/icons\//
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando archivos estáticos...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Instalación completada');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Error durante la instalación:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Eliminar caches que no coincidan con la versión actual
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('[SW] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control inmediato de todos los clientes
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activación completada');
      
      // Notificar a todos los clientes sobre la nueva versión
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'NEW_VERSION_AVAILABLE',
            version: CACHE_VERSION,
            message: 'Nueva versión disponible, cierra y vuelve a abrir la app'
          });
        });
      });
    }).catch(error => {
      console.error('[SW] Error durante la activación:', error);
    })
  );
});

// Interceptación de requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar requests GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Verificar si debe usar network first
  const shouldUseNetworkFirst = NETWORK_FIRST_PATTERNS.some(pattern => 
    pattern.test(url.pathname)
  );
  
  if (shouldUseNetworkFirst) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Verificar si debe usar cache first
  const shouldUseCacheFirst = CACHE_FIRST_PATTERNS.some(pattern => 
    pattern.test(url.pathname)
  );
  
  if (shouldUseCacheFirst) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Para otros requests, usar stale while revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Estrategia: Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Red no disponible, usando cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no hay cache, devolver página offline
    if (request.destination === 'document') {
      return caches.match('./index.html');
    }
    
    throw error;
  }
}

// Estrategia: Cache First
async function cacheFirst(request) {
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
    throw error;
  }
}

// Estrategia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(error => {
    console.log('[SW] Error en fetch, usando cache:', error);
  });
  
  return cachedResponse || fetchPromise;
}

// Manejo de mensajes del cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Notificación de nueva versión disponible
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    checkForUpdate().then(hasUpdate => {
      event.ports[0].postMessage({ hasUpdate });
    });
  }
});

// Verificar si hay actualizaciones
async function checkForUpdate() {
  try {
    const response = await fetch('./service-worker.js?' + Date.now());
    const newSWContent = await response.text();
    
    // Comparar con la versión actual (simplificado)
    return !newSWContent.includes(CACHE_NAME);
  } catch (error) {
    console.error('[SW] Error verificando actualización:', error);
    return false;
  }
}

// Manejo de notificaciones push (para futuras funcionalidades)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: './icons/logo-1.png',
      badge: './icons/logo-1.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Ver detalles',
          icon: './icons/logo-1.png'
        },
        {
          action: 'close',
          title: 'Cerrar',
          icon: './icons/logo-1.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

// === MANEJO DE MENSAJES PARA ACTUALIZACIONES ===
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION_INFO',
      version: CACHE_VERSION
    });
  }
  
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // Verificar si hay una nueva versión disponible
    event.ports[0].postMessage({
      type: 'UPDATE_CHECK_RESULT',
      hasUpdate: true, // En una implementación real, esto vendría de una API
      currentVersion: CACHE_VERSION
    });
  }
});

console.log('[SW] Service Worker cargado correctamente');
