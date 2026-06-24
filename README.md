# 🧩 Proyecto: Aplicación Web (Primer Parcial)

## 📌 Descripción

Este proyecto corresponde al desarrollo de una aplicación web como parte de un parcial práctico.  
Está construido utilizando **Vite + TypeScript** y tiene como objetivo integrar distintas funcionalidades clave del frontend, como:

- Manejo de estado de la aplicación
- Gestión de sesión de usuario
- Implementación de funcionalidades específicas (ej: carrito, navegación, validaciones)
- Interacción entre componentes y lógica de negocio

El proyecto busca simular un entorno real de aplicación SPA (Single Page Application) que en este caso es una FOODSTORE.

---

## ⚠️ ¡Importante! Nivel de Seguridad

La protección de rutas implementada en este proyecto **NO ES SEGURA** y no debe utilizarse en un entorno de producción.

- **Razón**: La lógica de autenticación se basa en datos guardados en `localStorage` en el navegador del usuario.
- **Riesgo**: Cualquier usuario con conocimientos técnicos básicos puede abrir las herramientas de desarrollador del navegador para inspeccionar, modificar o eliminar los datos de `localStorage`, obteniendo así acceso no autorizado a rutas protegidas.


---

## 🚀 Instalación y Uso

Se recomienda usar `pnpm` como gestor de paquetes para mayor eficiencia en el manejo de dependencias.

### 1. Instalar pnpm

Si no tienes `pnpm` instalado, puedes hacerlo fácilmente a través de `npm` (que viene con Node.js) ejecutando el siguiente comando en tu terminal:

```bash
npm install -g pnpm
```

### 2. Instalar Dependencias del Proyecto

Una vez en la carpeta raíz del proyecto, instala las dependencias necesarias con `pnpm`:

```bash
pnpm install
```

### 3. Ejecutar el Proyecto

Para iniciar el servidor de desarrollo de Vite, ejecuta:

```bash
pnpm dev
```

La aplicación estará disponible en la URL que aparezca en la terminal (generalmente `http://localhost:5173`).

---

## 📂 Estructura del proyecto

```
/
├── node_modules/             # Dependencias del proyecto
├── public/                  # Archivos estáticos públicos
│
├── src/
│   ├── data/                # Datos simulados o mock
│   │   └── data.ts
│   │
│   ├── pages/               # Páginas de la aplicación
│   │   └── store/
│   │       ├── cart/        # Vista del carrito
│   │       │   ├── cart.html
│   │       │   └── cart.ts
│   │       │
│   │       └── home/        # Página principal (productos)
│   │           ├── home.html
│   │           └── home.ts
│   │
│   ├── types/               # Definición de tipos/interfaces
│   │   ├── catalogo.ts
│   │   └── product.ts
│   │
│   ├── utils/               # Funciones reutilizables (helpers)
│   │
│   ├── main.ts              # Punto de entrada de la app
│   ├── style.css            # Estilos globales
│   └── vite-env.d.ts        # Tipos de entorno de Vite
│
├── index.html               # HTML principal
├── package.json             # Scripts y dependencias
├── package-lock.json        # Lock de npm
├── pnpm-lock.yaml           # Lock de pnpm
├── .gitignore               # Archivos ignorados por git
├── excalidraw_scheme.excalidraw  # Diagrama del proyecto
└── README.md                # Documentación
```