# 🍹 Power Kombucha — Plataforma Web

> La gaseosa del futuro. Plataforma web completa con tienda online y panel administrativo.

---

## ¿Qué incluye esta plataforma?

### Sitio público (lo que ven tus clientes)
- **Landing page** con hero animado, sabores, tienda online, FAQ, contacto y más
- **Carrito de compras** con envío automático del pedido por WhatsApp
- **Sección de beneficios** de la kombucha
- **Puntos de pick up** y opciones de envío

### Panel Admin (acceso privado)
- **Dashboard** con ventas del día, alertas de stock y gráficos
- **Gestión de stock** con historial de movimientos y alertas
- **Pedidos** con cambio de estado y exportación CSV
- **Clientes (CRM)** con etiquetas y notas
- **Leads / Prospectos** con tablero Kanban
- **Finanzas** con ingresos, egresos y rentabilidad
- **Marketing** con seguimiento de campañas y ROI
- **Configuración** del sitio (textos, FAQ, pick ups)

---

## ⚙️ Paso a paso para poner en marcha (sin conocimientos técnicos)

### PASO 1: Crear cuenta en Supabase

1. Andá a [supabase.com](https://supabase.com) y creá una cuenta gratuita
2. Hacé clic en **"New project"**
3. Completá:
   - **Name**: power-kombucha (o el nombre que quieras)
   - **Database Password**: anotá este password, lo vas a necesitar
   - **Region**: elegí **South America (São Paulo)** para mejor velocidad
4. Esperá a que el proyecto se cree (1-2 minutos)

### PASO 2: Configurar la base de datos

1. En tu proyecto de Supabase, hacé clic en **"SQL Editor"** (ícono de base de datos en la barra lateral)
2. Hacé clic en **"New query"**
3. Abrí el archivo `supabase/schema.sql` de este proyecto
4. Copiá TODO el contenido y pegalo en el editor de Supabase
5. Hacé clic en **"Run"** (botón verde)
6. Si todo salió bien, vas a ver "Success" en verde ✅

### PASO 3: Obtener las claves de Supabase

1. En tu proyecto de Supabase, andá a **Settings → API** (ícono de engranaje en la barra lateral)
2. Copiá:
   - **Project URL** → esto va en `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → esto va en `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role / secret** key → esto va en `SUPABASE_SERVICE_ROLE_KEY`

### PASO 4: Crear el primer usuario admin

1. En Supabase, andá a **Authentication → Users**
2. Hacé clic en **"Add user"** → **"Create new user"**
3. Completá email y contraseña (esta será la contraseña para entrar al panel admin)
4. Hacé clic en **"Create user"**

### PASO 5: Deploy en Vercel

1. Andá a [vercel.com](https://vercel.com) y creá una cuenta gratuita (podés entrar con GitHub)
2. Hacé clic en **"Add New Project"**
3. Importá este repositorio desde GitHub
4. En la sección **"Environment Variables"**, agregá estas variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = tu-clave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY = tu-clave-service-role-aqui
NEXT_PUBLIC_WHATSAPP_NUMBER = 5491135170335
```

5. Hacé clic en **"Deploy"**
6. ¡Listo! En 2-3 minutos tu sitio va a estar online 🚀

### PASO 6: Configurar tu dominio (opcional)

1. En Vercel, andá a tu proyecto → **Settings → Domains**
2. Agregá tu dominio (ej: `powerkombucha.com.ar`)
3. Seguí las instrucciones para apuntar tu DNS a Vercel

---

## 🔑 Acceso al panel admin

Una vez desplegado, el panel admin está en:
```
https://tu-sitio.vercel.app/admin
```

Usá el email y contraseña que creaste en el Paso 4.

---

## 📱 Personalización básica

### Cambiar el número de WhatsApp
Editá la variable de entorno `NEXT_PUBLIC_WHATSAPP_NUMBER` en Vercel con tu número (sin el `+`, con código de país).

### Cambiar textos del sitio
Entrá al panel admin → **Configuración** → **Textos del sitio**

### Agregar/editar FAQ
Panel admin → **Configuración** → **FAQ**

### Agregar puntos de pick up
Panel admin → **Configuración** → **Pick Up**

### Registrar stock y precios
Panel admin → **Stock**

---

## 🛠️ Desarrollo local (para desarrolladores)

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd power-kombucha

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Completar las variables en .env.local

# Iniciar servidor de desarrollo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📦 Stack tecnológico

| Tecnología | Para qué se usa |
|------------|-----------------|
| Next.js 14 | Framework principal |
| Supabase | Base de datos y autenticación |
| Tailwind CSS | Estilos |
| Recharts | Gráficos del dashboard |
| Vercel | Deploy y hosting |

---

## ❓ Problemas comunes

**"Error: missing env vars"**
→ Verificá que todas las variables de entorno estén cargadas en Vercel correctamente.

**"No puedo entrar al panel admin"**
→ Verificá que hayas creado el usuario en Supabase → Authentication → Users.

**"Los productos no aparecen"**
→ Verificá que hayas ejecutado el SQL en Supabase correctamente. Debería haber 15 productos de base.

**"El carrito no abre WhatsApp"**
→ Verificá que la variable `NEXT_PUBLIC_WHATSAPP_NUMBER` esté configurada sin espacios ni el símbolo `+`.

---

## 📞 Soporte

¿Necesitás ayuda? Escribinos a hola@powerkombucha.com.ar

---

*Power Kombucha © 2025 — La gaseosa del futuro 🍹⚡*
