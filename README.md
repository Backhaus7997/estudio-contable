Estudio Contable — Plataforma de Gestión

Descripción general

Estudio Contable es una plataforma web para centralizar y simplificar la operatoria diaria de un estudio contable: administración de clientes, control de facturación, gestión de impuestos (calendario + DDJJ) y un módulo de reportes con resúmenes y métricas por cliente y globales.

El objetivo es brindar un dashboard moderno, rápido y fácil de usar para el equipo del estudio, con un diseño consistente (estilo “login/dark premium”) y navegación por secciones de “acceso rápido”.

⸻

Alcance (MVP)

Incluye
	•	Autenticación (login) y sesión en frontend.
	•	Dashboard principal (ruta /dashboard) con tarjetas de acceso rápido y widgets / gráficos.
	•	Módulo Clientes (Acceso Rápido)
	•	Listado y gestión básica (base para ABM).
	•	Módulo Facturación (Acceso Rápido)
	•	Vista de facturación por cliente + botón “volver al dashboard”.
	•	Integración lista para conectar con endpoints del backend.
	•	Módulo Impuestos (Acceso Rápido)
	•	Calendario de vencimientos y DDJJ.
	•	Botón “volver al dashboard”.
	•	Módulo Reportes (Acceso Rápido)
	•	Resumen global primero (ej: “últimos 30 días”).
	•	Resúmenes estadísticos por cliente (base para gráficos y KPIs).
	•	Backend con endpoints base
	•	GET /health (estado del servicio)
	•	Endpoint GET /me para validar sesión/usuario en frontend (perfil del usuario logueado).

Fuera de alcance (por ahora)
	•	Integraciones con AFIP / ARCA u otros servicios externos.
	•	Multi-tenant completo (varios estudios con aislamiento total).
	•	Permisos avanzados por rol y auditoría detallada.
	•	Reportería avanzada/exportables (PDF/Excel) a escala productiva.

⸻

Tech Stack

Frontend
	•	Next.js (App Router) + React
	•	TypeScript
	•	Tailwind CSS (estilo dark con gradientes y cards)
	•	Consumo de API por fetch hacia NEXT_PUBLIC_API_URL

Backend
	•	NestJS (API REST)
	•	TypeScript
	•	Estructura por controladores/servicios, con endpoints de salud y usuario (/me)

Persistencia
	•	PostgreSQL (Docker recomendado en local)
	•	Prisma ORM para acceso tipado a datos y migraciones

Dev / Tooling
	•	Docker Compose para levantar DB local
	•	Scripts estándar de Next y Nest (dev/build/start)
	•	Enfoque local-first para pruebas integrales (frontend ↔ backend ↔ db)

⸻

Arquitectura propuesta

Arquitectura en 3 capas con separación clara de responsabilidades:
	1.	UI (Next.js)
	•	Render y navegación.
	•	Componentes de páginas: Login, Dashboard, Accesos rápidos.
	•	Fetch hacia backend con URL configurable por env (NEXT_PUBLIC_API_URL).
	2.	API (NestJS)
	•	Endpoints REST.
	•	Validaciones / DTOs (cuando aplica).
	•	Servicios con lógica de negocio y acceso a Prisma.
	3.	Data (Postgres + Prisma)
	•	Modelo relacional para clientes, facturación, impuestos, vencimientos, etc.
	•	Prisma como capa de acceso + migraciones.

Flujo típico
	•	Usuario inicia sesión en Frontend.
	•	Frontend consulta GET /me para datos del usuario y estado de autenticación.
	•	Las pantallas (Clientes / Facturación / Impuestos / Reportes) consumen endpoints específicos para poblar tablas, KPIs y gráficos.

Estructura esperada (alto nivel)

Frontend (Next)
	•	app/login (o equivalente)
	•	app/dashboard
	•	app/clientes
	•	app/facturacion
	•	app/impuestos
	•	app/reportes
	•	componentes UI compartidos (cards, charts, layout, navbar)

Backend (Nest)
	•	Controller (rutas)
	•	Service (casos de uso)
	•	PrismaService (db)
	•	Módulos por dominio (idealmente): clientes, facturacion, impuestos, reportes, auth

⸻

Convenciones de UI
	•	Estética “dark premium”: fondo con gradiente, cards con blur/opacidad, tipografía fuerte y CTA claros.
	•	Todas las pantallas de acceso rápido incluyen acción de volver al dashboard.
	•	El módulo de Reportes prioriza “Resumen global” y filtros temporales (ej: últimos 30 días).

⸻
