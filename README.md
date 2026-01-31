# 🏥 Sistema Web para Gestión Digital de Historias Clínicas y Evoluciones Médicas

<p align="center">
  <img src="https://img.shields.io/badge/Astro-5.14.5-FF5D01?style=for-the-badge&logo=astro&logoColor=white" alt="Astro"/>
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/TailwindCSS-4.1.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
</p>

Sistema frontend integral desarrollado para la gestión electrónica de historias clínicas y evoluciones médicas, diseñado bajo estándares de calidad, seguridad y usabilidad para entornos clínicos.

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Módulos Funcionales](#-módulos-funcionales)
- [Sistema de Autenticación y Autorización](#-sistema-de-autenticación-y-autorización)
- [Gestión del Estado](#-gestión-del-estado)
- [Validación de Datos](#-validación-de-datos)
- [Sistema de Diseño](#-sistema-de-diseño)
- [Generación de Reportes PDF](#-generación-de-reportes-pdf)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Variables de Entorno](#-variables-de-entorno)
- [Despliegue](#-despliegue)
- [Autor](#-autor)

---

## 🎯 Descripción General

Este proyecto constituye el **frontend** de un sistema integral para la gestión digital de historias clínicas médicas. Permite la administración completa del ciclo de vida de pacientes, registros clínicos y evoluciones médicas, proporcionando una interfaz moderna, accesible y altamente funcional.

### Características Principales

- ✅ **Gestión de Pacientes**: CRUD completo con información demográfica, contactos de emergencia, antecedentes clínicos y ocupación.
- ✅ **Historias Clínicas Digitales**: Creación, edición y consulta de expedientes médicos electrónicos.
- ✅ **Evoluciones Médicas**: Registro detallado de consultas incluyendo signos vitales, diagnósticos (CIE-10), tratamientos y exámenes.
- ✅ **Sistema Multi-rol**: Interfaz adaptativa según el perfil del usuario (Administrador, Médico, Enfermero).
- ✅ **Generación de PDFs**: Exportación de historias clínicas completas en formato PDF profesional.
- ✅ **Autenticación Segura**: Sistema JWT con refresh tokens y protección contra ataques de fuerza bruta.

---

## 🏗 Arquitectura del Sistema

El sistema implementa una arquitectura **híbrida SSR/CSR** aprovechando las capacidades de Astro para el renderizado del servidor y React para la interactividad del cliente.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (BROWSER)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Astro     │  │   React     │  │      Zustand Store      │  │
│  │   Pages     │  │ Components  │  │  (Auth/Catalog/Profile) │  │
│  │   (SSR)     │  │   (CSR)     │  │                         │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
│         │                │                      │               │
│         └────────────────┼──────────────────────┘               │
│                          │                                      │
│  ┌───────────────────────┴───────────────────────────────────┐  │
│  │                    Service Layer (Axios)                  │  │
│  │   • Request Interceptors (JWT injection)                  │  │
│  │   • Response Interceptors (Token refresh)                 │  │
│  └───────────────────────┬───────────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      BACKEND API (REST)                          │
│                   /api/v1/* endpoints                            │
└──────────────────────────────────────────────────────────────────┘
```

### Patrón de Renderizado

| Tipo                            | Uso                                     | Ventajas                              |
| ------------------------------- | --------------------------------------- | ------------------------------------- |
| **SSR (Server-Side Rendering)** | Layouts, páginas protegidas, middleware | SEO, seguridad, rendimiento inicial   |
| **CSR (Client-Side Rendering)** | Componentes React interactivos          | Experiencia fluida, estados dinámicos |

---

## 🛠 Stack Tecnológico

### Core Framework

| Tecnología     | Versión | Propósito                                            |
| -------------- | ------- | ---------------------------------------------------- |
| **Astro**      | 5.14.5  | Meta-framework para SSR/SSG con islands architecture |
| **React**      | 19.2.0  | Biblioteca UI para componentes interactivos          |
| **TypeScript** | Strict  | Tipado estático y seguridad en tiempo de compilación |

### Estilizado y UI

| Tecnología               | Versión | Propósito                                         |
| ------------------------ | ------- | ------------------------------------------------- |
| **Tailwind CSS**         | 4.1.17  | Framework CSS utility-first                       |
| **Custom Design Tokens** | -       | Sistema de diseño personalizado con variables CSS |

### Gestión de Estado y Datos

| Tecnología          | Versión | Propósito                                      |
| ------------------- | ------- | ---------------------------------------------- |
| **Zustand**         | 5.0.8   | State management ligero y escalable            |
| **React Hook Form** | 7.65.0  | Gestión performante de formularios             |
| **Zod**             | 3.25.76 | Validación de esquemas con inferencia de tipos |

### Comunicación HTTP

| Tecnología     | Versión | Propósito                        |
| -------------- | ------- | -------------------------------- |
| **Axios**      | 1.12.2  | Cliente HTTP con interceptores   |
| **js-cookie**  | 3.0.5   | Gestión de cookies para tokens   |
| **jwt-decode** | 4.0.0   | Decodificación de JWT en cliente |

### Generación de Documentos

| Tecnología          | Versión | Propósito                    |
| ------------------- | ------- | ---------------------------- |
| **jsPDF**           | 3.0.4   | Generación de documentos PDF |
| **jspdf-autotable** | 5.0.2   | Tablas automáticas en PDFs   |

### Notificaciones

| Tecnología         | Versión | Propósito                       |
| ------------------ | ------- | ------------------------------- |
| **React Toastify** | 11.0.5  | Sistema de notificaciones toast |

### DevOps y Despliegue

| Tecnología         | Versión | Propósito                              |
| ------------------ | ------- | -------------------------------------- |
| **Vercel Adapter** | 9.0.2   | Optimización para despliegue en Vercel |
| **ESLint**         | 9.37.0  | Linting de código                      |
| **Prettier**       | 3.6.2   | Formateo de código                     |

---

## 📁 Estructura del Proyecto

```
src/
├── components/                    # Componentes React
│   ├── common/                    # Componentes reutilizables (Button, Card, Input, Modal)
│   ├── forms/                     # Formularios especializados (Login, Profile, Password)
│   ├── MedicalEvolution/          # Componentes del módulo de evoluciones médicas
│   ├── profile/                   # Componentes del perfil de usuario
│   ├── ui/                        # Elementos de interfaz (ModuleSwitcher)
│   ├── ClinicalRecordsManager.tsx # Gestor de historias clínicas
│   ├── EmployeesManager.tsx       # Gestor de empleados
│   ├── PatientsManager.tsx        # Gestor de pacientes
│   ├── RolesManager.tsx           # Gestor de roles
│   └── ...
│
├── hooks/                         # Custom hooks
│   └── useDebounce.ts             # Hook para debouncing de búsquedas
│
├── layouts/                       # Layouts Astro
│   ├── DashboardLayout.astro      # Layout para paneles de control
│   └── MainLayout.astro           # Layout principal público
│
├── lib/
│   ├── validation/                # Esquemas de validación Zod
│   │   ├── auth.ts                # Validaciones de autenticación
│   │   ├── employee.ts            # Validaciones de empleados
│   │   └── profile.ts             # Validaciones de perfil
│   └── validations/
│       └── patient.ts             # Validaciones de pacientes
│
├── pages/                         # Rutas del sistema (File-based routing)
│   ├── admin/                     # Módulo administrativo
│   │   ├── dashboard.astro
│   │   ├── patients.astro
│   │   ├── clinical-records.astro
│   │   ├── employees/
│   │   ├── roles/
│   │   └── evolutions/
│   ├── medical/                   # Módulo médico
│   │   ├── dashboard.astro
│   │   ├── patients.astro
│   │   ├── clinical-records.astro
│   │   └── evolutions/
│   ├── auth/                      # Páginas de autenticación
│   ├── login.astro
│   ├── profile.astro
│   ├── select-module.astro
│   └── 404.astro
│
├── services/                      # Capa de servicios (API calls)
│   ├── api.ts                     # Configuración Axios e interceptores
│   ├── authService.ts             # Servicios de autenticación
│   ├── catalogService.ts          # Servicios de catálogos
│   ├── clinicalRecordService.ts   # Servicios de historias clínicas
│   ├── medicalEvolutionService.ts # Servicios de evoluciones médicas
│   └── patientService.ts          # Servicios de pacientes
│
├── store/                         # Stores Zustand
│   ├── authStore.ts               # Estado de autenticación
│   ├── catalogStore.ts            # Estado de catálogos (con caché)
│   ├── activeModuleStore.ts       # Módulo activo del usuario
│   └── userProfileStore.ts        # Perfil del usuario
│
├── types/                         # Definiciones TypeScript
│   ├── api.ts                     # Tipos de respuestas API
│   ├── catalog.ts                 # Tipos de catálogos
│   ├── clinicalRecord.ts          # Tipos de historias clínicas
│   ├── medicalEvolution.ts        # Tipos de evoluciones médicas
│   ├── patient.ts                 # Tipos de pacientes
│   └── user.ts                    # Tipos de usuario
│
├── utils/                         # Utilidades
│   ├── lockout.ts                 # Sistema anti-fuerza bruta
│   ├── navigation.ts              # Helpers de navegación y permisos
│   └── pdfGenerator.ts            # Generador de PDFs clínicos
│
├── styles/
│   └── global.css                 # Estilos globales y design tokens
│
├── icons/                         # Iconos SVG del sistema
│   ├── social-media/
│   └── system/
│
└── middleware.ts                  # Middleware de autenticación SSR
```

---

## 🔧 Módulos Funcionales

### 1. Módulo Administrativo (`/admin/*`)

Accesible exclusivamente para usuarios con rol **ADMINISTRADOR**.

| Funcionalidad            | Descripción                                     |
| ------------------------ | ----------------------------------------------- |
| **Dashboard**            | Panel de control con métricas y accesos rápidos |
| **Gestión de Empleados** | CRUD de personal médico y administrativo        |
| **Gestión de Roles**     | Configuración de roles y permisos               |
| **Gestión de Pacientes** | Administración completa de pacientes            |
| **Historias Clínicas**   | Visualización y gestión de expedientes          |
| **Evoluciones**          | Consulta de evoluciones médicas                 |

### 2. Módulo Médico (`/medical/*`)

Accesible para usuarios con rol **MÉDICO** o **ENFERMERO**.

| Funcionalidad           | Descripción                               |
| ----------------------- | ----------------------------------------- |
| **Dashboard**           | Panel de control médico                   |
| **Pacientes**           | Consulta y gestión de pacientes asignados |
| **Historias Clínicas**  | Creación y edición de expedientes         |
| **Evoluciones Médicas** | Registro completo de consultas médicas    |

### 3. Selector de Módulo (`/select-module`)

Interfaz de selección para usuarios con **roles duales** (Administrador + Médico/Enfermero).

---

## 🔐 Sistema de Autenticación y Autorización

### Flujo de Autenticación

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│   API       │────▶│   JWT       │
│   Form      │     │  /auth/login│     │   Tokens    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                         ┌─────────────────────┼─────────────────────┐
                         │                     │                     │
                         ▼                     ▼                     ▼
                  ┌─────────────┐     ┌─────────────────┐   ┌────────────────┐
                  │ auth-token  │     │ auth-refresh-   │   │ auth-user      │
                  │ (Cookie)    │     │ token (Cookie)  │   │ (Cookie/JSON)  │
                  └─────────────┘     └─────────────────┘   └────────────────┘
```

### Características de Seguridad

| Mecanismo                          | Implementación                                                            |
| ---------------------------------- | ------------------------------------------------------------------------- |
| **JWT con Refresh Tokens**         | Access token de corta duración + refresh token para renovación silenciosa |
| **Protección de Rutas (SSR)**      | Middleware de Astro que valida tokens antes del renderizado               |
| **Protección contra Fuerza Bruta** | Bloqueo temporal tras 3 intentos fallidos (10 minutos)                    |
| **Cookie Security**                | Flags `secure` y `sameSite: strict` en producción                         |
| **Auto-renovación de Tokens**      | Interceptor Axios que refresca tokens expirados automáticamente           |

### Control de Acceso Basado en Roles (RBAC)

```typescript
// Middleware de autorización (src/middleware.ts)
const protectedPaths = ["/admin", "/medical", "/select-module", "/profile"];

// Verificación de permisos (src/utils/navigation.ts)
export const hasPermission = (roles: string[], pathname: string): boolean => {
  if (pathname.startsWith("/admin")) {
    return roles.includes("ADMINISTRADOR");
  }
  if (pathname.startsWith("/medical")) {
    return roles.some((r) => r === "MEDICO" || r === "ENFERMERO");
  }
  // ...
};
```

---

## 📦 Gestión del Estado

El sistema utiliza **Zustand** para la gestión del estado global, implementando stores especializados:

### AuthStore (`authStore.ts`)

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  loading: boolean;
  login: (credentials) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}
```

### CatalogStore (`catalogStore.ts`)

Implementa un sistema de **caché inteligente** con TTL de 30 minutos:

```typescript
interface CatalogState {
  catalogs: GroupedCatalogs;
  isLoading: boolean;
  isLoaded: boolean;
  lastFetched: number | null; // Control de caché
  loadCatalogs: (force?: boolean) => Promise<void>;
  getCatalog: (catalogName: CatalogName) => CatalogItem[];
}
```

---

## ✅ Validación de Datos

### Esquemas Zod

El sistema implementa validación robusta utilizando **Zod** con inferencia automática de tipos:

```typescript
// Ejemplo: Esquema de Login
export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Formato de correo electrónico inválido." })
    .min(1, { message: "El correo electrónico es requerido." }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

// Tipo inferido automáticamente
export type LoginFormData = z.infer<typeof loginSchema>;
```

### Integración con React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});
```

---

## 🎨 Sistema de Diseño

### Design Tokens

El sistema implementa un conjunto de **design tokens** personalizados a través de Tailwind CSS 4:

```css
@theme {
  /* Brand Colors */
  --color-primary: #1479ff;
  --color-primary-50: #eff6ff;
  --color-secondary: #193b68;

  /* UI Colors */
  --color-background: #f5f7fa;
  --color-surface: #ffffff;
  --color-border: #e2e8f0;

  /* Status Colors */
  --color-success: #15803d;
  --color-error: #dc2626;
  --color-warning: #b45309;
  --color-info: #0284c7;

  /* Typography */
  --font-sans: "Public Sans", system-ui, sans-serif;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
}
```

### Componentes Base Reutilizables

| Componente          | Ubicación                                 | Propósito               |
| ------------------- | ----------------------------------------- | ----------------------- |
| `Button`            | `components/common/Button.tsx`            | Botones con variantes   |
| `Card`              | `components/common/Card.tsx`              | Contenedores de tarjeta |
| `Input`             | `components/common/Input.tsx`             | Campos de entrada       |
| `Modal`             | `components/common/Modal.tsx`             | Diálogos modales        |
| `NotificationToast` | `components/common/NotificationToast.tsx` | Notificaciones          |
| `ViewToggle`        | `components/common/ViewToggle.tsx`        | Switch lista/grid       |

---

## 📄 Generación de Reportes PDF

El sistema incluye un generador avanzado de PDFs para historias clínicas completas:

### Características

- **Formato A4** con orientación vertical
- **Secciones estructuradas**: Datos del paciente, consulta, signos vitales, valoración clínica, diagnósticos, tratamientos, exámenes solicitados
- **Tablas automáticas** con `jspdf-autotable`
- **Paginación automática** con verificación de espacio disponible
- **Paleta de colores institucional** consistente con el sistema de diseño

```typescript
// Generación de PDF
import { generateClinicalRecordPDF } from "@/utils/pdfGenerator";

const handleExportPDF = (data: FullClinicalRecordResponse) => {
  generateClinicalRecordPDF(data);
};
```

---

## ⚙️ Instalación y Configuración

### Prerrequisitos

- **Node.js** >= 18.x
- **npm** >= 9.x o **pnpm** >= 8.x

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/jmvillanueva-dev/clinic-frontend.git

# Navegar al directorio
cd clinic-frontend

# Instalar dependencias
npm install
```

---

## 🧞 Scripts Disponibles

| Comando                   | Descripción                                          |
| ------------------------- | ---------------------------------------------------- |
| `npm run dev`             | Inicia el servidor de desarrollo en `localhost:4321` |
| `npm run build`           | Genera el build de producción en `./dist/`           |
| `npm run preview`         | Vista previa del build antes de desplegar            |
| `npm run astro -- --help` | Muestra ayuda del CLI de Astro                       |

---

## 🔑 Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# URL base del API backend
PUBLIC_API_URL=http://localhost:8080/api/v1

# Entorno
NODE_ENV=development
```

---

## 🚀 Despliegue

### Vercel (Recomendado)

El proyecto está configurado con `@astrojs/vercel` para despliegue optimizado:

```javascript
// astro.config.mjs
export default defineConfig({
  output: "server",
  adapter: vercel(),
});
```

### Pasos de Despliegue

1. Conectar repositorio a Vercel
2. Configurar variables de entorno en el dashboard
3. Desplegar automáticamente con cada push a `main`

---

## 👤 Autor

<table>
  <tr>
    <td align="center">
      <strong>Jhonny Villanueva M.</strong><br>
      <em>Desarrollador de Software</em><br><br>
      <a href="https://www.linkedin.com/in/jmvillanueva-m">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
      </a>
      <a href="https://github.com/jmvillanueva-dev">
        <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
      </a>
    </td>
  </tr>
</table>

---

<p align="center">
  <strong>© 2026 - Escuela Politécnica Nacional</strong><br>
  <em>Trabajo de Integración Curricular</em>
</p>
