// src/utils/pushNotifications.js

/**
 * Convierte una clave pública VAPID en Base64 URL a un Uint8Array para el PushManager
 */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Verifica si el entorno actual soporta Web Push y Service Workers
 */
export function isPushNotificationSupported() {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Retorna el estado actual del permiso de notificaciones ('default', 'granted', 'denied')
 */
export function getNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Suscribe al usuario actual a las notificaciones Push y guarda los datos en la base de datos
 */
export async function subscribeToPushNotifications(userId, role = 'Cliente') {
  if (!isPushNotificationSupported()) {
    throw new Error('Las notificaciones push no son soportadas por este navegador o dispositivo.');
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error('Clave VAPID pública no configurada.');
  }

  // 1. Solicitar permiso al usuario
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permiso de notificaciones denegado por el usuario.');
  }

  // 2. Obtener el registro activo del Service Worker
  const registration = await navigator.serviceWorker.ready;

  // 3. Obtener o crear la suscripción
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
  }

  // 4. Extraer claves criptográficas serializables
  const subscriptionJson = subscription.toJSON();

  // 5. Enviar al endpoint backend para persistir en Supabase
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription: subscriptionJson,
      userId: userId || null,
      role: role || 'Cliente',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Error al registrar suscripción push en el servidor');
  }

  return await res.json();
}

/**
 * Cancela la suscripción a notificaciones push
 */
export async function unsubscribeFromPushNotifications(userId) {
  if (!isPushNotificationSupported()) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, userId }),
    }).catch(() => {});
  }
}
