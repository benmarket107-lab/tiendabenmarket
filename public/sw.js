const CACHE_NAME = 'benmarket-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/faviconapp.png',
  '/apple-touch-icon.png'
];

// 1. Instalar SW y precargar assets básicos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

// 2. Activar SW y limpiar caché antigua
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Listener de Fetch obligatorio para PWA instalable
self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET locales para evitar problemas con Supabase o APIs externas
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retornar de la caché, pero actualizarla en background (Stale-While-Revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});

// 4. Listener de Notificaciones PUSH (W3C Push API)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Benmarket Express';
    const options = {
      body: data.body || 'Tienes una nueva notificación de tu pedido.',
      icon: data.icon || '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200, 100, 200], // Patrón de vibración perceptible
      tag: data.tag || 'benmarket-order-notification',
      renotify: true,
      requireInteraction: true, // Se mantiene visible hasta que el usuario interactúe
      data: {
        url: data.url || '/',
        dateOfArrival: Date.now()
      }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('Error al procesar notificación push en SW:', err);
  }
});

// 5. Listener de clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si la app ya está abierta en una pestaña/ventana, enfocarla y navegar
      for (const client of clientList) {
        if (client.url && client.url.startsWith(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Si estaba cerrada, abrirla
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
