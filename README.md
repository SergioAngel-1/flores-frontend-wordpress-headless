# Flores INC - Frontend E-Commerce

Frontend moderno para la tienda en línea de Flores INC, desarrollado con React, TypeScript y Tailwind CSS, integrado con un backend headless WordPress mediante la API de WooCommerce.

## Características

- Diseño moderno y responsive con Tailwind CSS
- Animaciones fluidas con GSAP
- Integración con API de WooCommerce
- Gestión de estado con React Hooks
- Tipado estático con TypeScript
- Rutas con React Router

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
│   └── ...
├── hooks/             # Custom hooks
├── pages/             # Páginas de la aplicación
├── services/          # Servicios para API y lógica de negocio
├── types/             # Definiciones de tipos TypeScript
├── utils/             # Utilidades y funciones auxiliares
├── App.tsx            # Componente principal
└── main.tsx           # Punto de entrada
```

## Rutas Disponibles

- `/` - Página de inicio
- `/tienda` - Catálogo de productos
- `/categoria/:slug` - Productos por categoría
- `/producto/:id` - Detalle de producto
- `/carrito` - Carrito de compras
- `/checkout` - Proceso de pago
- `/api-test` - Página de prueba de conexión a la API

## Integración con WooCommerce

El proyecto utiliza la API REST de WooCommerce para:
- Obtener productos y categorías
- Gestionar el carrito de compras
- Procesar pedidos

## Desarrollo

Este proyecto fue creado con Vite, React y TypeScript. Para más información sobre la configuración de Vite, consulta la [documentación oficial](https://vitejs.dev/guide/).

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila el proyecto para producción
- `npm run lint` - Ejecuta el linter
- `npm run preview` - Previsualiza la versión de producción

## Licencia

[MIT](LICENSE)
