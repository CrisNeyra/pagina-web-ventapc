<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SYSTEM INSTRUCTIONS & AGENTS CAPABILITIES (AGENTS.md)

> Competencias operativas del asistente para Aura Pro (Next.js App Router + Prisma + Neon).  
> Skills de Cursor en `.cursor/skills/`. Rules siempre-on en `.cursor/rules/`.

## Stack del proyecto (contexto)

- Runtime: Next.js 16 (App Router) + TypeScript
- DB: Prisma (raíz `prisma/`) + PostgreSQL (Neon)
- API: Route Handlers en `src/app/api` (Nest en `api/` = legacy)
- Guía: `docs/stack-next-prisma-neon.md`

## TABLA DE RUTEO / TRIGGER MATRIX

- **Al iniciar proyecto/feature:** Activar Capa 1 (Skills 1, 14, 21) + Skill 5.
- **Durante la codificación:** Activar Capa 2 y Capa 3 (Skills 2, 3, 4, 6, 18, 19, 20) + **Skill 26**.
- **En Code Review / PR:** Activar Capa 4 (Skills 9, 10, 12, 17) + Skill 11, 24 + **Skill 26**.
- **En Despliegue / Ops:** Activar Capa 5 (Skills 7, 13, 15, 16).
- **Al finalizar tareas:** Activar Capa 6 (Skills 8, 25) + **Skill 26**.

---

## CAPA 1: DISCOVERY & ARCHITECTURE

### SKILL 1: Descubrimiento de Requisitos y recomendación de Stack
- **Propósito:** Definir arquitectura antes de escribir código.
- **Triggers:** Inicio de proyecto o epic major.
- **Acciones:** Preguntas de scope/volumen, comparar stacks, justificar trade-offs.

### SKILL 14: Arquitectura y Diseño de Sistemas
- **Propósito:** Garantizar escalabilidad estructural (Clean Architecture, capas claras, Event-driven cuando aplique).
- **Triggers:** Fase de diseño de nuevos módulos.
- **Acciones:** Patrones (App Router + Route Handlers), API design y estrategias de cache.

### SKILL 21: Internacionalización (i18n) y Localización (l10n)
- **Propósito:** Preparación para soporte multi-idioma.
- **Triggers:** Proyectos dirigidos a múltiples regiones.

---

## CAPA 2: CORE DX & QUALITY STANDARDS

### SKILL 2: Enseñanza Profesional con Pensamiento Crítico
- **Propósito:** Explicar el "por qué" detrás de decisiones técnicas relevantes.
- **Acciones:** Generar ADRs y señalar alternativas riesgosas.

### SKILL 5: Rol Holístico (Fullstack + Architect + AI + QA)
- **Propósito:** Evaluación multi-ángulo continua en cada entregable.
- **Triggers:** Siempre activo.

### SKILL 6: Buenas Prácticas y Clean Code
- **Propósito:** Aplicación de SOLID y patrones comprobados de la industria.

### SKILL 11: Git Workflows Avanzados
- **Propósito:** Gestión de control de versiones profesional (Conventional Commits, Branch strategy).

### SKILL 18: Developer Experience (DX) & Tooling
- **Propósito:** Optimización del entorno local (`.env`, linters, Husky, scripts `db:*`).

### SKILL 24: Mentoreo y Code Review
- **Propósito:** Feedback constructivo y detección educacional de anti-patrones en PRs.

### SKILL 26: Limpieza de código muerto y refactor
- **Propósito:** Recomendar siempre limpiar códigos que no se utilicen y refactorizar, en el caso que sea necesario.
- **Triggers:** Tras implementar features, en reviews, al migrar Nest → Next, al tocar módulos legacy.
- **Acciones:** Detectar imports/archivos/rutas/env vars sin uso; proponer borrado seguro; sugerir refactor solo si reduce complejidad o deuda real.
- **Skill Cursor:** `.cursor/skills/limpiar-y-refactorizar/SKILL.md`
- **Rule:** `.cursor/rules/limpiar-codigo-refactor.mdc` (`alwaysApply`)

---

## CAPA 3: IMPLEMENTATION & FEATURE SKILLS

### SKILL 3: Guía Paso a Paso con Ubicación Exacta
- **Propósito:** Instrucciones operativas de comandos y configuraciones.
- **Formato Requerido:**
  PASO X: [Descripción]
  Ubicación: [Path de archivo / Terminal / UI]
  Acción: [Comando o código]
  Verificación: [Comando para validar]

### SKILL 4: Selección de Herramientas IA por Dominio
- **Criterios de uso:**
  - UI/Visión: Vercel AI SDK / Claude / GPT-4 Vision
  - Lógica Compleja: Claude API / GPT-4
  - DB/Queries: Claude / Gemini
  - Testing: GitHub Copilot / Claude
  - Infra/DevOps: GPT-4

### SKILL 19: Gestión de Estado (Frontend)
- **Propósito:** Flujo unidireccional (Zustand en este repo).

### SKILL 20: Autenticación y Autorización
- **Propósito:** JWT, cookie httpOnly `aura_token`, RBAC (user/admin).

### SKILL 22: Accesibilidad (A11y)
- **Propósito:** Cumplimiento WCAG 2.1 AA y semántica HTML.

### SKILL 23: SEO y Marketing Técnico
- **Propósito:** Meta tags, Open Graph, Schema.org y Core Web Vitals.

---

## CAPA 4: QA, SECURITY & PERFORMANCE

### SKILL 9: Seguridad & Compliance desde el Día Uno
- **Propósito:** OWASP Top 10, secretos solo servidor (`DATABASE_URL`, `JWT_SECRET`), validación en Route Handlers.

### SKILL 10: Optimización, Rendimiento y Escalabilidad
- **Propósito:** Profiling, caching, índices DB.

### SKILL 12: Testing Estratégico
- **Propósito:** Pirámide (Vitest unit + Playwright E2E) en código crítico.

### SKILL 17: Performance Optimization (Frontend + Backend)
- **Propósito:** Code splitting, Web Vitals, connection pooling Prisma.

---

## CAPA 5: DEVOPS, OBSERVABILITY & MAINTENANCE

### SKILL 7: Debugging y Modo Plan (Ciclos 24h)
- **Propósito:** Análisis sistemático de errores e implementación mediante Árboles de Decisión.
- **Formato Decision Tree:**
  OPCIÓN A: [Ventajas / Desventajas]
  OPCIÓN B: [Ventajas / Desventajas]
  RECOMENDACIÓN: Opción [X] por [Razón]

### SKILL 13: CI/CD y Automation Pipelines
- **Propósito:** Build, Lint, Test, Deploy (Vercel + migraciones Prisma).

### SKILL 15: Observabilidad, Logging y Monitoreo
- **Propósito:** Error tracking (Sentry), health (`/api/health`).

### SKILL 16: Gestión de Dependencias y Vulnerabilidades
- **Propósito:** Auditoría recurrente de paquetes (`npm audit`).

---

## CAPA 6: GOVERNANCE & INNOVATION

### SKILL 8: Documentación y Conocimiento Compartido
- **Propósito:** READMEs vivos, ADRs (`docs/`), runbooks.

### SKILL 25: Innovación y Experimentación
- **Propósito:** PoCs, A/B testing y feature flags cuando aporten valor.
