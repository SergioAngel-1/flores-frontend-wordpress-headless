# Flores INC - Frontend E-Commerce

Frontend moderno para la tienda en línea de Flores INC, desarrollado con React, TypeScript y Tailwind CSS, integrado con un backend headless WordPress mediante la API de WooCommerce y APIs personalizadas.

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
- Sistema de referidos con códigos de invitación
- Billetera virtual para transferencia de Flores Coins entre usuarios

## Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- WordPress con WooCommerce instalado y configurado
- Plugin FloresInc Referrals & Points instalado en WordPress

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
│   ├── modals/        # Componentes modales (Login, Wallet, etc.)
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

### Sistema de Referidos y Billetera

- `WalletModal`: Modal para gestionar la billetera virtual
- `ReferralSection`: Sección para compartir y gestionar referidos
- `ReferralLink`: Componente para generar enlaces de referido
- `TransferCoins`: Formulario para transferir Flores Coins

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
- `/login` - Página de inicio de sesión (con soporte para referidos)
- `/register` - Página de registro (con soporte para referidos)

## Sistema de Referidos

El sistema de referidos funciona de la siguiente manera:

1. Cada usuario tiene un código único de referido generado automáticamente
2. Los usuarios pueden compartir un enlace con su código (ej: `http://dominio?ref=CODIGO`)
3. Cuando un nuevo usuario accede a través de ese enlace:
   - Es dirigido al formulario de registro con el código ya completado
   - Se muestra el nombre del referidor para confirmar quién los invitó
4. Al registrarse un nuevo usuario con código de referido:
   - Se establece la relación entre referidor y referido
   - Se generan Flores Coins para el referidor cuando el referido es aprobado

## Sistema de Referidos y Moneda Virtual (Flores Coins)

### Sistema de Referidos

El sistema de referidos es una funcionalidad clave que permite a los usuarios invitar a otros y obtener recompensas. Su implementación incluye:

#### Componentes Frontend
- **Generación de Enlaces**: Los enlaces de referido se generan automáticamente en el perfil del usuario
- **Persistencia de Cookies**: Cuando un usuario accede a través de un enlace de referido, el código se almacena en cookies
- **Pre-llenado de Formulario**: El registro detecta el código de referido en cookies y lo autocompleta
- **Validación Visual**: El sistema muestra el nombre del referidor durante el registro para confirmar la relación
- **Interfaz de Usuarios Referidos**: Cada usuario puede ver una lista de las personas que ha referido

#### Flujo Completo del Sistema de Referidos
1. **Generación de Código**: Al registrarse, cada usuario recibe un código alfanumérico único
2. **Compartir**: El usuario comparte su enlace personalizado (URL + parámetro `ref=CODIGO`)
3. **Aterrizaje**: Al hacer clic en el enlace, el visitante es redirigido a la página principal
   - Si el visitante no está autenticado, se le dirige al formulario de registro
   - El código de referido se almacena en una cookie por 30 días
4. **Registro**: Al registrarse, el sistema:
   - Detecta el código almacenado en la cookie
   - Valida que el código corresponda a un usuario existente
   - Vincula al nuevo usuario con su referidor en la base de datos
   - Coloca al usuario en estado "pendiente de aprobación"
5. **Aprobación**: Cuando un administrador aprueba al usuario:
   - Se verifica nuevamente la relación de referido
   - Se asignan Flores Coins al referidor como recompensa
   - Ambos usuarios reciben notificaciones del proceso

### Moneda Virtual (Flores Coins)

La moneda virtual Flores Coins es un sistema de puntos de fidelidad que permite múltiples interacciones económicas dentro de la plataforma:

#### Características Técnicas
- **Persistencia**: El balance se almacena en la base de datos y se sincroniza con el estado de React
- **Precision**: Todos los valores se manejan como enteros para evitar problemas de precisión
- **Transacciones Atómicas**: Se utilizan transacciones SQL para garantizar la integridad
- **Historial Completo**: Cada operación genera un registro de transacción con timestamp

#### Formas de Obtener Flores Coins
1. **Registro**: Bonificación inicial al registrarse
2. **Referidos**: Recompensa cuando un referido es aprobado
3. **Compras**: Porcentaje del valor de cada compra realizada
4. **Transferencias**: Recibidas de otros usuarios
5. **Eventos Especiales**: Campañas y promociones específicas

#### Uso de Flores Coins
1. **Transferencias**: Envío a otros usuarios mediante su código de referido
2. **Descuentos**: Redimir en el proceso de checkout para obtener descuentos
3. **Productos Exclusivos**: Acceso a productos que solo pueden comprarse con Flores Coins

#### Billetera Virtual (Wallet)
El componente `WalletModal` proporciona una interfaz completa para la gestión de Flores Coins:

- **Panel Superior**: Muestra el balance actual y un resumen de movimientos
- **Sección de Transferencia**:
  - Campo para ingresar el código de referido del destinatario
  - Validación en tiempo real del código (muestra el nombre del destinatario)
  - Control numérico para ingresar el monto a transferir
  - Campo opcional para añadir notas a la transferencia
  - Botón de confirmación con validaciones de saldo suficiente
- **Feedback de Operaciones**: Notificaciones visuales de éxito o error
- **Prevención de Errores**: Bloqueo de transferencias a sí mismo o a usuarios inexistentes

#### Implementación Técnica de la Billetera
- **Estado Local**: Gestión del formulario con React useState
- **Validación Asíncrona**: Los códigos de referido se validan en tiempo real contra la API
- **Actualización Optimista**: El balance se actualiza inmediatamente en la interfaz
- **Manejo de Errores**: Sistema robusto de captura y visualización de errores
- **Animaciones**: Transiciones suaves entre estados con CSS Animations

#### Integración con el Resto del Sistema
- **Header**: Botón dedicado para acceder rápidamente a la billetera
- **Perfil**: Sección que muestra el historial de transferencias y balance
- **Checkout**: Opción para usar Flores Coins como método de pago parcial
- **API Service**: Módulo dedicado para todas las operaciones relacionadas con la billetera

### Seguridad del Sistema
- **Validación en Ambos Extremos**: Tanto en frontend como en backend
- **Prevención de Transferencias Negativas**: Validación de montos positivos
- **Verificación de Saldo**: Comprobación de saldo suficiente antes de cualquier operación
- **Protección contra Ataques**: Limitación de solicitudes por tiempo
- **Autenticación Requerida**: Todas las operaciones requieren usuario autenticado
- **Logs Detallados**: Registro de todas las operaciones para auditoría

## Integración con WooCommerce y APIs Personalizadas

El proyecto utiliza:
- API REST de WooCommerce para productos, categorías, carrito y pedidos
- API personalizada para el sistema de referidos y Flores Coins
- Autenticación mediante JWT con WordPress

### Servicios API

- `productService`: Gestión de productos
- `categoryService`: Gestión de categorías
- `cartService`: Gestión del carrito
- `orderService`: Gestión de pedidos
- `authService`: Autenticación y gestión de usuarios
- `referralService`: Gestión de referidos
- `walletService`: Gestión de la billetera virtual

## Estilos y Diseño

- Uso de Tailwind CSS para estilos responsive
- Variables CSS personalizadas para colores de marca
- Animaciones con GSAP para transiciones fluidas
- Diseño adaptable a móviles, tablets y escritorio
- Notificaciones con Alertify.js

## Desarrollo

Este proyecto fue creado con Vite, React y TypeScript. Para más información sobre la configuración de Vite, consulta la [documentación oficial](https://vitejs.dev/guide/).

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila el proyecto para producción
- `npm run lint` - Ejecuta el linter
- `npm run preview` - Previsualiza la versión de producción

## Licencia

[MIT](LICENSE)
