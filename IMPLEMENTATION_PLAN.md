GSD Architect Online. Are we planning Frontend, Backend, Database, or Full-Stack today? Give me your logic story.

### 1. [CONTEXT_FENCE]
* **Boundary Guardrails**: Agents are strictly fenced to `/backend/` files (specifically `prisma/schema.prisma`, `validations/salary.validation.js`, `services/salary.service.js`, `controllers/salary.controller.js`, `routes/salary.routes.js`, and `app.js`). No frontend or UI logic parsing is permitted in this phase.
* **Architectural Layering**: The computational payload (e.g., Gross, Penalty, Net) is strictly confined to the `salary.service.js` logic layer. Controllers must remain entirely agnostic of mathematical expressions and only handle HTTP/API routing. Prisma handles persistence.
* **Idempotency Execution**: Every execution must be verified against the deterministic `@@unique([employeeId, month, year])` DB constraint to completely suppress parallel or duplicated salary allocations for the same operational index.

### 2. [WAVE_ROUTING]
* **Wave 1 (Parallel)**: [Database Schema Upgrade], [Zod Validation Creation]
* **Wave 2 (Sequential)**: [Core Mathematical Service Engineering - requires DB & validation]
* **Wave 3 (Sequential)**: [Controller Scaffolding & API Router Integration - requires core service]

### 3. [GSD_XML_PLAN]

```xml
<task type="auto">
  <name>Database Schema Configuration</name>
  <files>backend/prisma/schema.prisma</files>
  <action>
    - Inject `model Salary` with UUID mapping and rigid `employeeId` constraint mapping.
    - Explicitly map all calculation and penalty payload fields explicitly as `Float?` and `Int` precisely verbatim to spec constraints.
    - Add explicit `@@unique([employeeId, month, year])` compound uniqueness.
  </action>
  <verify>npx prisma format && npx prisma db push --accept-data-loss && npx prisma generate</verify>
  <done>Schema compiles flawlessly with standard validations and DB is synced.</done>
</task>

<task type="auto">
  <name>Input Payload Validation</name>
  <files>backend/src/validations/salary.validation.js</files>
  <action>
    - Scaffold Zod pipeline binding `employeeId` uniquely to UUID structure.
    - Validate core required integers: `month`, `year`, `workingDays`, `workingHours`, `basicSalary`.
    - Apply wide `.optional().nullable()` handling globally on dynamic calculation subsets (`incentive`, `otHours`, etc.) to prevent blocking. 
  </action>
  <verify>node -e "require('./backend/src/validations/salary.validation.js')"</verify>
  <done>Zod imports and parses natively cleanly without runtime syntax panics.</done>
</task>

<task type="auto">
  <name>Core Calculation Mathematics</name>
  <files>backend/src/services/salary.service.js</files>
  <action>
    - Run strict `prisma.salary.findUnique` trap on `[employeeId, month, year]` resolving to a 400 error if truthy.
    - Write immutable algorithmic variables tracking identical mathematics specified (Gross sum variants vs Total Deduction sum variants).
    - Commit entire structured calculated tree payload back sequentially using `prisma.salary.create()`.
  </action>
  <verify>node -e "require('./backend/src/services/salary.service.js')"</verify>
  <done>Mathematical expressions abstract natively away from the HTTP envelope.</done>
</task>

<task type="auto">
  <name>API Transports</name>
  <files>
    backend/src/controllers/salary.controller.js, 
    backend/src/routes/salary.routes.js, 
    backend/src/app.js
  </files>
  <action>
    - Parse raw `req.body` exclusively through the newly authored Zod schema map in the controller.
    - Send verified data asynchronously into the service logic, capturing it back globally as a standard `{ success: true, data }` JSON response.
    - Bind controller handlers cleanly behind Express router parameters matching `POST /api/salary` and `GET /api/salary`.
    - Wire router directly into main `app.js` express flow.
  </action>
  <verify>node -c backend/src/app.js</verify>
  <done>Terminal server runtime executes flawlessly with route appended to listener root.</done>
</task>
```
