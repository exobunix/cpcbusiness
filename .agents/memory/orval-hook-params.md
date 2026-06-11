---
name: Orval hook params pattern
description: How to pass query params to Orval-generated React Query hooks in this project
---

Orval-generated hooks in `lib/api-client-react` take query params as the **first argument directly**, not wrapped in an object.

**Correct:**
```ts
useGetLeads({ stage: 'new' })         // with params
useGetLeads()                          // no params
useGetProjects({ status: 'active' })
useGetClients({ search: 'acme' })
```

**Wrong:**
```ts
useGetLeads({ params: { stage: 'new' } })   // ❌ causes TS2353
useGetLeads({ params: {} })                  // ❌ causes TS2353
```

**Why:** The generated hook signature is `useGetLeads(params?: GetLeadsParams, options?)` — the first arg IS the params type, not a wrapper.

**How to apply:** Any time you call a `useGet*` hook with filtering, pass the filter fields as top-level keys of the first argument. Check `lib/api-client-react/src/generated/api.ts` for the exact signature if unsure.
