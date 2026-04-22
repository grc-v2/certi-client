# API layer

## Type generation

The backend exposes per-service OpenAPI 3.x specs, aggregated behind the gateway. Each service keeps its own spec — we do **not** merge them into a single document — and FE codegen produces one `.ts` file per service under `src/lib/api/schema/`.

### Endpoints (via gateway, default `http://localhost:8080`)

| Service      | Gateway URL                 |
| ------------ | --------------------------- |
| identity     | `/v3/api-docs/identity`     |
| learning     | `/v3/api-docs/learning`     |
| engagement   | `/v3/api-docs/engagement`   |
| notification | `/v3/api-docs/notification` |

Swagger UI with a service dropdown: `http://localhost:8080/swagger-ui.html`.

### Generate

With the gateway and target service running:

```bash
# All services
npm run gen:api

# One service
npm run gen:api:identity
```

Output lands in `src/lib/api/schema/{service}.ts`. These files are auto-generated — do not edit.

### If gen:api fails

- `ECONNREFUSED`: gateway isn't running, or the service is down. `docker compose up` (or your usual stack) and retry.
- `Unsupported schema format`: the endpoint returned HTML (gateway misrouted). Check `/v3/api-docs/{service}` directly in a browser.
- Override the base URL: `API_DOCS_BASE=http://staging.internal:8080 npm run gen:api` (adjust the script if you need CI-time override).

## Shape reminders

- **Success**: `ApiResponse<T> = { data: T; metadata: {...} }` — the Axios response interceptor auto-unwraps `data`.
- **Error**: RFC 7807 `ProblemDetail` — thrown as `ApiError`. Use `error.fieldErrors` for form validation.
- **Pagination**: request `?page=0&size=10&sortBy=x&sortDirection=ASC`; response `PageResponse<T>`.
- **Dates**: ISO 8601 UTC strings. Parse with `date-fns/parseISO`.
