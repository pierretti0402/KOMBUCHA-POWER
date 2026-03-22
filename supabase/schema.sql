-- ============================================================
-- POWER KOMBUCHA - Esquema de base de datos para Supabase
-- Ejecutar este archivo en el SQL Editor de Supabase
-- ============================================================

-- Habilitar extensión para UUIDs
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLA: products
-- ============================================================
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  flavor text not null,
  presentation text not null,
  stock integer not null default 0,
  min_stock integer not null default 5,
  cost_price numeric(10,2) not null default 0,
  sale_price numeric(10,2) not null default 0,
  image_url text,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: customers
-- ============================================================
create table if not exists public.customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text,
  email text,
  address text,
  tags text[] default '{}',
  notes text,
  total_spent numeric(12,2) default 0,
  order_count integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: orders
-- ============================================================
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.customers(id),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_address text,
  items jsonb not null default '[]',
  total numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: leads
-- ============================================================
create table if not exists public.leads (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text,
  email text,
  channel text not null default 'manual',
  interest text,
  status text not null default 'new' check (status in ('new','contacted','interested','converted','discarded')),
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: stock_movements
-- ============================================================
create table if not exists public.stock_movements (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade,
  type text not null check (type in ('in','out','adjustment')),
  quantity integer not null,
  cost numeric(10,2),
  supplier text,
  date date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: expenses
-- ============================================================
create table if not exists public.expenses (
  id uuid default uuid_generate_v4() primary key,
  category text not null,
  amount numeric(12,2) not null,
  date date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: campaigns
-- ============================================================
create table if not exists public.campaigns (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  platform text not null,
  start_date date not null,
  end_date date,
  budget numeric(12,2) not null default 0,
  reach integer,
  clicks integer,
  conversions integer,
  attributed_sales numeric(12,2),
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: site_content (textos editables del sitio)
-- ============================================================
create table if not exists public.site_content (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  value text not null,
  updated_at timestamptz default now()
);

-- ============================================================
-- TABLA: faq
-- ============================================================
create table if not exists public.faq (
  id uuid default uuid_generate_v4() primary key,
  question text not null,
  answer text not null,
  "order" integer not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: pickup_points
-- ============================================================
create table if not exists public.pickup_points (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text not null,
  schedule text,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- ============================================================
-- DATOS INICIALES - Productos
-- Un registro por sabor (para imagen y control de stock por lata).
-- Los precios de pack se manejan en el frontend (PACKS constante).
-- image_url: completar con la URL pública de Supabase Storage.
-- ============================================================
insert into public.products (name, flavor, presentation, stock, min_stock, cost_price, sale_price, image_url, active) values
  (
    'Pomelo Rosado y Jengibre',
    'Pomelo Rosado y Jengibre',
    'Lata',
    300, 30,
    1500, 4000,   -- costo unitario / precio de referencia por lata
    null,         -- reemplazar con URL de Supabase Storage
    true
  ),
  (
    'Naranja, Frutilla y Guaraná',
    'Naranja, Frutilla y Guaraná',
    'Lata',
    300, 30,
    1500, 4000,
    null,
    true
  ),
  (
    'Manzana Verde, Guaraná y Cayena',
    'Manzana Verde, Guaraná y Cayena',
    'Lata',
    300, 30,
    1500, 4000,
    null,
    true
  );

-- ============================================================
-- DATOS INICIALES - FAQ
-- ============================================================
insert into public.faq (question, answer, "order", active) values
  ('¿Qué es la kombucha?', 'La kombucha es una bebida fermentada hecha con té, azúcar y un cultivo simbiótico de bacterias y levaduras (SCOBY). Durante la fermentación se generan probióticos naturales, ácidos orgánicos y vitaminas del grupo B que benefician la salud digestiva.', 1, true),
  ('¿Tiene alcohol?', 'La kombucha Power contiene menos de 0.5% de alcohol, resultado natural del proceso de fermentación. Esta cantidad es tan baja que se considera una bebida no alcohólica, apta para toda la familia.', 2, true),
  ('¿Tiene azúcar?', 'El azúcar que se agrega al inicio del proceso es consumido casi en su totalidad por el SCOBY durante la fermentación. El resultado final es una bebida baja en azúcar, muy por debajo de las gaseosas convencionales.', 3, true),
  ('¿Cómo se conserva?', 'Power Kombucha debe conservarse en heladera. Una vez abierta, se recomienda consumir en el día para aprovechar al máximo sus propiedades y su efervescencia natural.', 4, true),
  ('¿Envían a todo el país?', 'Actualmente enviamos a toda la zona metropolitana de Buenos Aires (AMBA). Para el interior del país, consultanos por WhatsApp y coordinamos el envío.', 5, true),
  ('¿Es apta para veganos?', 'Sí, Power Kombucha es 100% vegana. No contiene ningún ingrediente de origen animal en su elaboración.', 6, true),
  ('¿Contiene gluten?', 'No. Power Kombucha es Gluten Free, ideal para personas celíacas o sensibles al gluten.', 7, true);

-- ============================================================
-- DATOS INICIALES - Contenido del sitio
-- ============================================================
insert into public.site_content (key, value) values
  ('hero_title', 'Power Kombucha'),
  ('hero_subtitle', 'La gaseosa del futuro'),
  ('hero_description', 'Bebida fermentada artesanal con probióticos naturales. Vegana, Gluten Free, Orgánica. El sabor que tu cuerpo necesita. 💪'),
  ('about_title', 'Nuestra historia'),
  ('about_text', 'Power Kombucha nació con una misión simple: llevar los beneficios de la kombucha artesanal a todos los argentinos. Somos un equipo apasionado por la salud, el sabor y el bienestar. Cada lata es elaborada con ingredientes orgánicos seleccionados, con el proceso de fermentación natural que nos da esa efervescencia única y ese sabor inconfundible.\n\nCreemos que alimentarse bien no tiene que ser aburrido. Por eso creamos sabores atrevidos y únicos, pensados para personas que quieren más de la vida.'),
  ('delivery_text', 'Enviamos a toda la zona del AMBA. Para pedidos al interior del país, consultá por WhatsApp. También podés retirar en nuestros puntos de pick up.'),
  ('contact_email', 'hola@powerkombucha.com.ar'),
  ('instagram_url', 'https://www.instagram.com/powerkombucha'),
  ('whatsapp_number', '5491135170335');

-- ============================================================
-- DATOS INICIALES - Puntos de pick up
-- ============================================================
insert into public.pickup_points (name, address, schedule, active) values
  ('Pick Up Palermo', 'Thames 1234, Palermo, CABA', 'Lunes a Viernes 10-18hs / Sábados 10-14hs', true),
  ('Pick Up San Isidro', 'Av. del Libertador 5678, San Isidro, GBA Norte', 'Martes, Jueves y Sábados 9-13hs', true);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.customers enable row level security;
alter table public.leads enable row level security;
alter table public.stock_movements enable row level security;
alter table public.expenses enable row level security;
alter table public.campaigns enable row level security;
alter table public.site_content enable row level security;
alter table public.faq enable row level security;
alter table public.pickup_points enable row level security;

-- Políticas: lectura pública para tablas del sitio
create policy "public read products" on public.products for select using (active = true);
create policy "public read site_content" on public.site_content for select using (true);
create policy "public read faq" on public.faq for select using (active = true);
create policy "public read pickup_points" on public.pickup_points for select using (active = true);

-- Políticas: escritura pública para órdenes (clientes pueden crear pedidos)
create policy "public insert orders" on public.orders for insert with check (true);

-- Políticas: acceso completo para usuarios autenticados (admin)
create policy "admin all products" on public.products for all using (auth.role() = 'authenticated');
create policy "admin all orders" on public.orders for all using (auth.role() = 'authenticated');
create policy "admin all customers" on public.customers for all using (auth.role() = 'authenticated');
create policy "admin all leads" on public.leads for all using (auth.role() = 'authenticated');
create policy "admin all stock_movements" on public.stock_movements for all using (auth.role() = 'authenticated');
create policy "admin all expenses" on public.expenses for all using (auth.role() = 'authenticated');
create policy "admin all campaigns" on public.campaigns for all using (auth.role() = 'authenticated');
create policy "admin all site_content" on public.site_content for all using (auth.role() = 'authenticated');
create policy "admin all faq" on public.faq for all using (auth.role() = 'authenticated');
create policy "admin all pickup_points" on public.pickup_points for all using (auth.role() = 'authenticated');
