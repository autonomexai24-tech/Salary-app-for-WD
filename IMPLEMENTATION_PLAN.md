# IMPLEMENTATION_PLAN

## Overview
Project: Salary App Backend
Stack: Node.js (Express), Prisma, PostgreSQL, Zod
Architecture: Controller → Service → Prisma (STRICT)
Stage: EMPLOYEE SYSTEM

### Backend Strict Rules
- NO frontend work or UI changes.
- Controllers = request/response only.
- Services = ALL business logic.
- Prisma = DB access only.
- Use async/await.
- Use Zod validation for ALL inputs.
- Use UUID as primary keys.
- Return JSON only.
- Use centralized error handling.

### Business Rules
1. Employee MUST belong to a valid Department.
2. Reject creation if `departmentId` does NOT exist.
3. Use `departmentId` (UUID) — NOT department name.
4. No duplicate constraints for now.
5. Store clean relational data.

---

## Step-by-Step Execution Plan

### [ ] STEP 1: UPDATE PRISMA SCHEMA
**File:** `backend/prisma/schema.prisma`
- Add relational `employees Employee[]` to `Department` model.
- Add `deletedAt DateTime?` to `Department` model per instructions (Note: replaces or runs alongside existing `is_deleted`).
- Create `Employee` model:
  - `id String @id @default(uuid())`
  - Required: `firstName`, `lastName`, `phone`, `salary`, `departmentId`
  - Optional: `address`, `dateOfBirth`, `gender`, `qualification`, `previousSalary`, `permittedLeaves`
  - Relation: `department Department @relation(fields: [departmentId], references: [id])`
  - Timestamps: `createdAt`, `updatedAt`
- Run DB Sync: `npx prisma db push --accept-data-loss` (or `migrate dev` as requested) and `npx prisma generate`.

### [ ] STEP 2: CREATE VALIDATION
**File:** `backend/src/validations/employee.validation.js`
- Create Zod schema for Employee body requiring: `firstName` (string), `lastName` (string), `phone` (string), `salary` (number), `departmentId` (uuid).

### [ ] STEP 3: CREATE SERVICE LAYER
**File:** `backend/src/services/employee.service.js`
- `createEmployee(data)`
  - Query existing department with `deletedAt: null` (or `is_deleted: false`).
  - Throw error if invalid.
  - Return `prisma.employee.create`.
- `getEmployees(params)`
  - Implement pagination with `skip`/`take`.
  - Include relation: `{ include: { department: true } }`.

### [ ] STEP 4: CREATE CONTROLLER
**File:** `backend/src/controllers/employee.controller.js`
- Methods: `createEmployee`, `getEmployees`.
- Map req.body/req.query to Zod validations.
- Pipe to service.
- Return wrapped JSON via `res.status(x).json({ success: true, data: result })`.
- Forward errors via `catch(err) { next(err); }`.

### [ ] STEP 5 & 6: SETUP ROUTES & REGISTRATION
**File:** `backend/src/routes/employee.routes.js`
- `router.post("/", createEmployee)`
- `router.get("/", getEmployees)`

**File:** `backend/src/app.js`
- Inject `app.use("/api/employees", require("./routes/employee.routes"));`

### [ ] STEP 7: TESTING
- Hit `POST /api/employees` simulating `{ "firstName": "John", ... "departmentId": "VALID_UUID" }`.
- Expected result: Clean JSON response, linked successfully to department.
