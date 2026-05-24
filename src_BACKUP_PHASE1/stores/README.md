# STORE GOVERNANCE

## Official Global State Owner

This folder is the single source of truth for frontend global state.

Approved technologies:
- Zustand

Deprecated folders:
- src/store
- src/state

Rules:
- New stores MUST be created only inside src/stores
- Runtime stores belong in src/stores/runtime
- Business domain stores belong in src/stores/domain-name
- No duplicated state ownership