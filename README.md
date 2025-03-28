# Flores INC - Frontend E-Commerce

Frontend moderno para la tienda en línea de Flores INC, desarrollado con React, TypeScript y Tailwind CSS, integrado con un backend headless WordPress mediante la API de WooCommerce.

## Características

- Diseño moderno y responsive con Tailwind CSS
- Animaciones fluidas con GSAP
- Integración con API de WooCommerce
- Gestión de estado con React Hooks y Context API
- Tipado estático con TypeScript
- Rutas con React Router
- Carrito de compras con persistencia en localStorage
- Gestión de perfil de usuario y direcciones
- Sistema de autenticación integrado con WordPress
- Checkout completo con integración a WooCommerce

## Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- WordPress con WooCommerce instalado y configurado

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd floresinc-project
```

2. Instalar dependencias:
```bash
npm install
# o
yarn
```

3. Configurar variables de entorno:
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
```
VITE_WP_API_URL=http://tu-wordpress.local/wp-json
VITE_WC_CONSUMER_KEY=tu_consumer_key
VITE_WC_CONSUMER_SECRET=tu_consumer_secret
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

## Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables
│   ├── layout/        # Componentes de estructura (Header, Footer, Layout)
│   ├── ui/            # Componentes de interfaz (botones, formularios, etc.)
│   ├── cart/          # Componentes relacionados con el carrito
│   ├── profile/       # Componentes de perfil de usuario
│   └── products/      # Componentes de productos y categorías
├── contexts/          # Contextos de React (AuthContext, CartContext)
├── hooks/             # Custom hooks
├── pages/             # Páginas de la aplicación
├── services/          # Servicios para API y lógica de negocio
├── types/             # Definiciones de tipos TypeScript
├── utils/             # Utilidades y funciones auxiliares
├── assets/            # Recursos estáticos (imágenes, fuentes, etc.)
├── App.tsx            # Componente principal
└── main.tsx           # Punto de entrada
```

## Principales Componentes

### Autenticación y Perfil

- `AuthContext`: Gestiona el estado de autenticación del usuario
- `ProfileModal`: Modal para gestionar el perfil del usuario
- `ProfileSection`: Sección para editar información personal
- `AddressesSection`: Gestión de direcciones del usuario
- `OrdersSection`: Historial de pedidos del usuario

### Carrito y Checkout

- `CartModal`: Modal del carrito de compras
- `AddToCartButton`: Botón para añadir productos al carrito
- `CheckoutPage`: Página de proceso de pago
- `CartService`: Servicio para gestionar el carrito en localStorage

### Productos y Catálogo

- `ProductCard`: Tarjeta de producto para listados
- `ProductDetailPage`: Página de detalle de producto
- `CategoryPage`: Página de categoría de productos
- `RelatedProducts`: Componente de productos relacionados

## Rutas Disponibles

- `/` - Página de inicio
- `/tienda` - Catálogo de productos
- `/categoria/:slug` - Productos por categoría
- `/producto/:slug` - Detalle de producto
- `/carrito` - Carrito de compras
- `/checkout` - Proceso de pago
- `/contacto` - Página de contacto
- `/blog` - Blog de la tienda
- `/legal/:page` - Páginas legales (términos, privacidad, etc.)

## Integración con WooCommerce

El proyecto utiliza la API REST de WooCommerce para:
- Obtener productos y categorías
- Gestionar el carrito de compras
- Procesar pedidos
- Autenticación de usuarios
- Gestión de perfiles y direcciones

### Servicios API

- `productService`: Gestión de productos
- `categoryService`: Gestión de categorías
- `cartService`: Gestión del carrito
- `orderService`: Gestión de pedidos
- `authService`: Autenticación y gestión de usuarios

## Estilos y Diseño

- Uso de Tailwind CSS para estilos responsive
- Variables CSS personalizadas para colores de marca
- Animaciones con GSAP para transiciones fluidas
- Diseño adaptable a móviles, tablets y escritorio

## Desarrollo

Este proyecto fue creado con Vite, React y TypeScript. Para más información sobre la configuración de Vite, consulta la [documentación oficial](https://vitejs.dev/guide/).

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila el proyecto para producción
- `npm run lint` - Ejecuta el linter
- `npm run preview` - Previsualiza la versión de producción

## Licencia

[MIT](LICENSE)
