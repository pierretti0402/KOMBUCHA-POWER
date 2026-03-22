-- ============================================================
-- MIGRACIÓN v2 — Actualización de productos
-- Ejecutar en el SQL Editor de Supabase si ya tenías datos previos.
-- ============================================================

-- 1. Eliminar los productos anteriores
delete from public.products;

-- 2. Insertar los 3 sabores actualizados (un registro por sabor)
--    Completar image_url con las URLs reales de Supabase Storage.
insert into public.products (name, flavor, presentation, stock, min_stock, cost_price, sale_price, image_url, active) values
  (
    'Pomelo Rosado y Jengibre',
    'Pomelo Rosado y Jengibre',
    'Lata',
    300, 30,
    1500, 4000,
    null,   -- REEMPLAZAR: 'https://TU-PROYECTO.supabase.co/storage/v1/object/public/products/pomelo.png'
    true
  ),
  (
    'Naranja, Frutilla y Guaraná',
    'Naranja, Frutilla y Guaraná',
    'Lata',
    300, 30,
    1500, 4000,
    null,   -- REEMPLAZAR: 'https://TU-PROYECTO.supabase.co/storage/v1/object/public/products/naranja.png'
    true
  ),
  (
    'Manzana Verde, Guaraná y Cayena',
    'Manzana Verde, Guaraná y Cayena',
    'Lata',
    300, 30,
    1500, 4000,
    null,   -- REEMPLAZAR: 'https://TU-PROYECTO.supabase.co/storage/v1/object/public/products/manzana.png'
    true
  );

-- ============================================================
-- CÓMO OBTENER LAS URLs DE TUS FOTOS EN SUPABASE STORAGE
-- 1. Andá a tu proyecto Supabase → Storage
-- 2. Abrí el bucket donde subiste las fotos (ej: "products")
-- 3. Hacé clic en cada foto → "Copy URL" (columna derecha)
-- 4. Pegá esa URL en el campo image_url del UPDATE de abajo:

-- UPDATE public.products SET image_url = 'URL_AQUI' WHERE flavor = 'Pomelo Rosado y Jengibre';
-- UPDATE public.products SET image_url = 'URL_AQUI' WHERE flavor = 'Naranja, Frutilla y Guaraná';
-- UPDATE public.products SET image_url = 'URL_AQUI' WHERE flavor = 'Manzana Verde, Guaraná y Cayena';
-- ============================================================
