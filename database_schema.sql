-- Crear tabla de Categorías
CREATE TABLE IF NOT EXISTS public.categorias (
    codigo_categoria TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    foto_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de Productos
CREATE TABLE IF NOT EXISTS public.productos (
    codigo_producto TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    codigo_categoria TEXT REFERENCES public.categorias(codigo_categoria) ON DELETE SET NULL,
    unidad TEXT,
    costo NUMERIC(15, 2) DEFAULT 0,
    precio NUMERIC(15, 2) DEFAULT 0,
    foto_url TEXT,
    lista_normal NUMERIC(15, 2) DEFAULT 0,
    pedidos_y_consumo NUMERIC(15, 2) DEFAULT 0,
    ta_da TEXT,
    lista_dos NUMERIC(15, 2) DEFAULT 0,
    cantidad NUMERIC(15, 2) DEFAULT 0,
    cantidad_disponible NUMERIC(15, 2) DEFAULT 0,
    descuento NUMERIC(5, 2) DEFAULT 0,
    tasa_impuesto NUMERIC(5, 2) DEFAULT 0,
    metodo_costeo TEXT,
    codigo_barras TEXT,
    producto_variable BOOLEAN DEFAULT FALSE,
    campo_personalizado_1 TEXT,
    campo_personalizado_2 TEXT,
    campo_personalizado_3 TEXT,
    campo_personalizado_4 TEXT,
    campo_personalizado_5 TEXT,
    campo_personalizado_6 TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para Categorías
CREATE POLICY "Categorias legibles por todos" ON public.categorias
    FOR SELECT USING (true);

CREATE POLICY "Categorias modificables por administradores" ON public.categorias
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() AND usuarios.role IN ('Admin', 'Cajero')
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() AND usuarios.role IN ('Admin', 'Cajero')
        )
    );

-- Políticas de acceso para Productos
CREATE POLICY "Productos legibles por todos" ON public.productos
    FOR SELECT USING (true);

CREATE POLICY "Productos modificables por administradores" ON public.productos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() AND usuarios.role IN ('Admin', 'Cajero')
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() AND usuarios.role IN ('Admin', 'Cajero')
        )
    );

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER set_updated_at_categorias
    BEFORE UPDATE ON public.categorias
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_productos
    BEFORE UPDATE ON public.productos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- POLÍTICAS DE SUPABASE STORAGE (IMÁGENES)
-- ==========================================

-- 1. Crear el bucket 'productos' si no existe y hacerlo público
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos', 'productos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir que CUALQUIERA pueda ver y descargar las imágenes (necesario para que la tienda las muestre)
CREATE POLICY "Imágenes de productos son públicas"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'productos' );

-- 3. Permitir subir/insertar imágenes al bucket 'productos'
CREATE POLICY "Permitir subir imágenes a productos"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'productos' );

-- 4. Permitir actualizar imágenes en el bucket 'productos'
CREATE POLICY "Permitir actualizar imágenes en productos"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'productos' );

-- 5. Permitir borrar imágenes del bucket 'productos'
CREATE POLICY "Permitir borrar imágenes en productos"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'productos' );

-- ==========================================
-- TABLA DE CONFIGURACIÓN GLOBAL
-- ==========================================
-- Guarda parámetros configurables de la tienda (clave → valor)
CREATE TABLE IF NOT EXISTS public.configuracion (
    clave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    descripcion TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

-- Lectura pública (el checkout necesita leer el precio de delivery)
CREATE POLICY "Configuracion lectura publica" ON public.configuracion
    FOR SELECT USING (true);

-- Solo personal autorizado puede modificar la configuracion
CREATE POLICY "Configuracion modificable por administradores" ON public.configuracion
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() AND usuarios.role IN ('Admin', 'Cajero')
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() AND usuarios.role IN ('Admin', 'Cajero')
        )
    );

-- Valor inicial del precio de delivery
INSERT INTO public.configuracion (clave, valor, descripcion)
VALUES ('delivery_price', '0', 'Precio del delivery en guaraníes para Ciudad del Este')
ON CONFLICT (clave) DO NOTHING;

-- Valor inicial para número de WhatsApp
INSERT INTO public.configuracion (clave, valor, descripcion)
VALUES ('whatsapp_number', '595981000000', 'Número de WhatsApp de destino para compras y pedidos')
ON CONFLICT (clave) DO NOTHING;

-- ==========================================
-- TABLA DE BANNERS PUBLICITARIOS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.banners (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para Banners
CREATE POLICY "Banners legibles por todos" ON public.banners
    FOR SELECT USING (true);

CREATE POLICY "Banners modificables por administradores" ON public.banners
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() AND usuarios.role IN ('Admin', 'Cajero')
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() AND usuarios.role IN ('Admin', 'Cajero')
        )
    );

-- Trigger para updated_at
CREATE TRIGGER set_updated_at_banners
    BEFORE UPDATE ON public.banners
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- POLÍTICAS DE STORAGE PARA BANNERS
-- ==========================================

-- 1. Crear el bucket 'banners' si no existe y hacerlo público
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir que CUALQUIERA pueda ver y descargar las imágenes del bucket 'banners'
CREATE POLICY "Imágenes de banners son públicas"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'banners' );

-- 3. Permitir subir/insertar imágenes al bucket 'banners'
CREATE POLICY "Permitir subir imágenes a banners"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'banners' );

-- 4. Permitir actualizar imágenes en el bucket 'banners'
CREATE POLICY "Permitir actualizar imágenes en banners"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'banners' );

-- 5. Permitir borrar imágenes del bucket 'banners'
CREATE POLICY "Permitir borrar imágenes en banners"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'banners' );

-- ==========================================
-- TABLA DE USUARIOS Y AUTENTICACIÓN (PERFILES)
-- ==========================================

-- 1. Crear tabla pública de usuarios vinculada a auth.users
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'Cliente',
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para Usuarios
CREATE POLICY "Usuarios son legibles por todos" ON public.usuarios
    FOR SELECT USING (true);

CREATE POLICY "Usuarios son modificables por si mismos o por admin" ON public.usuarios
    FOR ALL USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() AND usuarios.role = 'Admin'
        )
    ) WITH CHECK (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() AND usuarios.role = 'Admin'
        )
    );

-- 4. Trigger para updated_at
CREATE TRIGGER set_updated_at_usuarios
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Función Trigger para registrar automáticamente en public.usuarios al crear en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_role TEXT := 'Cliente';
BEGIN
  -- Asignar roles especiales a las cuentas de prueba conocidas
  IF new.email = 'admin@benmarket.com' THEN
    default_role := 'Admin';
  ELSIF new.email = 'cajero@benmarket.com' THEN
    default_role := 'Cajero';
  ELSIF new.email = 'tesoreria@benmarket.com' THEN
    default_role := 'Tesoreria';
  END IF;

    INSERT INTO public.usuarios (id, name, email, avatar, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    default_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Crear el Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Tabla de Pedidos (Ventas Web) en Tiempo Real
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT NOT NULL,
    cliente_direccion TEXT NOT NULL,
    cliente_barrio TEXT,
    cliente_google_maps TEXT,
    cliente_nota TEXT,
    items JSONB NOT NULL, -- Array de objetos: [{id, name, price, quantity, image}]
    subtotal NUMERIC NOT NULL,
    delivery NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    estado TEXT DEFAULT 'Pendiente' NOT NULL, -- 'Pendiente' | 'Preparando' | 'Enviado'
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    oculto_por_cliente BOOLEAN DEFAULT FALSE
);

-- Habilitar RLS
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para Pedidos
CREATE POLICY "Pedidos son insertables por todos" ON public.pedidos
    FOR INSERT WITH CHECK (true);

-- Solo el dueño del pedido o personal de la tienda puede leer los datos
CREATE POLICY "Pedidos legibles por propietarios o staff" ON public.pedidos
    FOR SELECT USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() AND usuarios.role IN ('Admin', 'Cajero', 'Tesoreria')
        )
    );

-- Solo personal de la tienda puede actualizar estados
CREATE POLICY "Pedidos actualizables por staff" ON public.pedidos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() AND usuarios.role IN ('Admin', 'Cajero', 'Tesoreria')
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() AND usuarios.role IN ('Admin', 'Cajero', 'Tesoreria')
        )
    );

-- ==========================================
-- FUNCIONES RPC DE BASE DE DATOS
-- ==========================================

-- Función para descontar stock atómicamente en un pedido
CREATE OR REPLACE FUNCTION public.descontar_stock_pedido(productos_pedido jsonb)
RETURNS void AS $$
DECLARE
  item record;
BEGIN
  FOR item IN SELECT * FROM jsonb_to_recordset(productos_pedido) AS x(id text, quantity numeric) LOOP
    UPDATE public.productos
    SET cantidad_disponible = cantidad_disponible - item.quantity
    WHERE codigo_producto = item.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices de optimización de rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(codigo_categoria);
CREATE INDEX IF NOT EXISTS idx_pedidos_user_id ON public.pedidos(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos(created_at DESC);

-- Habilitar extensión para búsqueda rápida de texto
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_productos_nombre_trgm ON public.productos USING gin (nombre gin_trgm_ops);

