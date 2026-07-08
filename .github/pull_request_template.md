## Qué cambia

- 

## Validación obligatoria

- [ ] Corrí `bun run lint:web`
- [ ] Corrí `bun run typecheck:web`
- [ ] Corrí `bun run test:web`
- [ ] Corrí `bun run build:web`
- [ ] Revisé que no se expongan secretos, tokens ni payloads técnicos en UI

## Reglas de entrega

- PRs funcionales entran primero a `develop`.
- `master` sólo recibe cambios ya validados desde `develop`.
- Si el cambio toca API/BFF, documenté el endpoint consumido y probé el contrato real o dejé la razón del bloqueo.
- Si el cambio toca UI, revisé escritorio y móvil.
