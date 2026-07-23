export default function robots() {
  // Cambia esta URL por el dominio real de tu tienda una vez en producción
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tudominio.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Rutas que no queremos que Google indexe (ej: paneles de usuario, rutas de confirmación)
      disallow: [
        '/dashboard/', 
        '/bienvenida/', 
        '/confirm/', 
        '/login/', 
        '/register/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
