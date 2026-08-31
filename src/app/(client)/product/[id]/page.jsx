import { supabase } from '../../../../supabaseClient';
import ProductDetailsClient from './ProductDetailsClient';

const PRODUCT_PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23f8fafc'/><text x='200' y='210' font-size='18' text-anchor='middle' fill='%2394a3b8' font-family='Arial, sans-serif'>Sin imagen</text></svg>";

async function getProduct(id) {
  if (!id) return null;
  const decodedId = decodeURIComponent(id);
  const keysToTry = Array.from(new Set([decodedId, id]));

  for (const key of keysToTry) {
    const { data, error } = await supabase
      .from('productos')
      .select('codigo_producto,nombre,precio,cantidad_disponible,foto_url,descuento,unidad,campo_personalizado_1,codigo_barras,categorias(nombre,descuento,fecha_inicio_descuento,fecha_fin_descuento)')
      .eq('codigo_producto', key)
      .maybeSingle();

    if (error || !data) continue;

    let desc = Number(data.descuento) || 0;
    const catDesc = Number(data.categorias?.descuento) || 0;
    if (catDesc > 0) {
      const now = new Date();
      const start = data.categorias?.fecha_inicio_descuento ? new Date(data.categorias.fecha_inicio_descuento) : null;
      const end = data.categorias?.fecha_fin_descuento ? new Date(data.categorias.fecha_fin_descuento) : null;
      if (start && end && now >= start && now <= end && catDesc > desc) {
        desc = catDesc;
      }
    }

    const basePrice = Number(data.precio) || 0;
    const activePrice = desc > 0 ? basePrice * (1 - desc / 100) : basePrice;

    return {
      id: data.codigo_producto,
      name: data.nombre,
      originalPrice: basePrice,
      price: activePrice,
      discount: desc,
      stock: data.cantidad_disponible,
      image: data.foto_url || PRODUCT_PLACEHOLDER_IMAGE,
      category: data.categorias?.nombre || 'Sin Categoría',
      unit: data.unidad || '',
      barcode: data.codigo_barras || '',
      isRecommended: data.campo_personalizado_1 === 'true',
    };
  }

  return null;
}

export async function generateMetadata({ params }) {
  const id = params?.id;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Producto no encontrado | Benmarket Express',
      description: 'El producto solicitado no existe o fue retirado del catálogo.',
    };
  }

  const title = `${product.name} | Benmarket Express`;
  const description = `Comprá ${product.name} en Benmarket Express. Categoría: ${product.category}. Envíos rápidos en Ciudad del Este.`;
  const imageUrl = product.image?.startsWith('http') ? product.image : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: imageUrl ? [{ url: imageUrl, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }) {
  const id = params?.id;
  const initialProduct = await getProduct(id);

  return <ProductDetailsClient initialProduct={initialProduct} />;
}
