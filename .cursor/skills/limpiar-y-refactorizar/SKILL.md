---
name: limpiar-y-refactorizar
description: >-
  Recomienda limpiar código no utilizado y refactorizar cuando sea necesario.
  Use when finishing features, reviewing PRs, migrating Nest to Next, touching
  legacy modules, or when the user asks about dead code, cleanup, or refactor.
---

# Limpieza de código muerto y refactor

## Principio (verbatim)

Recomendar siempre limpiar códigos que no se utilicen y refactorizar, en el caso que sea necesario.

## Cuándo aplicar

- Al cerrar una feature o migración
- En code review / PR
- Al tocar `api/` (Nest legacy) o duplicados Next/Nest
- Cuando el usuario pide cleanup, deuda técnica o “limpiar”

## Qué buscar

1. **Código muerto:** imports, archivos, componentes, rutas, scripts, env vars y flags sin referencias.
2. **Duplicación:** misma lógica en Nest (`api/`) y Next (`src/app/api`) — documentar o eliminar el lado obsoleto.
3. **Refactor necesario:** solo si baja complejidad, unifica paths, o evita bugs; no refactor cosmético masivo sin pedido.

## Cómo actuar

1. Listar candidatos concretos (path + razón).
2. Separar: **borrar seguro** vs **requiere confirmación** (público, seed, e2e).
3. Proponer el cambio; ejecutar solo si el usuario acepta o la tarea lo pide.
4. Tras borrar: verificar con `tsc` / tests afectados.

## Anti-patrones

- No borrar Nest completo mientras pedidos/Stripe/admin dependan de él.
- No “limpiar” dejando la tienda rota.
- No reescribir módulos enteros bajo pretexto de cleanup.
