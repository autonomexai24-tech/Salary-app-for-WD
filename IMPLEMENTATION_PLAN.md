# Phase 4: Payslip System (Stage 4)

## Architecture Integrity
* Strict Backend Only. No frontend modifications.
* PDF Generation must be done in memory securely via `pdfkit` and stream raw binary bytes back upon `GET /api/payslip/:id/download`.
* Immutability enforcement: the JSON snapshot of the payload (`data`) binds permanently to one `salaryId`. No recalculations post-creation.

> [!WARNING]
> **New Dependency:** I will need to execute `npm install pdfkit` inside `/backend` structurally to support the PDF Engine generation requirements.

---

## User Review Required

### Open Questions
You requested clarification parameters in your design stage. Please respond to these before I start building so I can construct exactly to your UI mappings:

1. **PDF Format**: Do you want a bare-bones simple text table rendering for the PDF, or a visually styled structure matching the grey-header look in your Figma/UI screenshots?
2. **Currency Format**: Should the JSON mapping hardcode `₹ 19000` or stream the raw float integer `19000` into `pdfkit` to let the frontend/PDF append the prefix during render time?
3. **Missing Fields**: Your screenshot shows `"mohammedtanveerrashiwale3@gmail.com"` and `"Digital Marketing Specialist"`. Your current `Employee` Prisma model does **not** contain an `email` field, and only tracks a `departmentId` + `qualification` field! 
    - Should I automatically add an `email` and `position` String column to the `Employee` model in this wave, or should I fallback to empty strings `""` mapped dynamically?

---

## Proposed Changes

### Database Layer
#### [MODIFY] backend/prisma/schema.prisma
- Inject `model Payslip` mapping functionally to `Employee` and `Salary`.
- Explicit relational keys preventing duplications via unique index on `salaryId`.
- JSON mapped field explicitly allocated to store snapshot payload natively preventing dynamic recalculations later.

### Dependencies
#### [MODIFY] backend/package.json
- Direct execution script `npm install pdfkit` enabling Node native templating.

### Service Layer (Core Business Rules)
#### [NEW] backend/src/services/payslip.service.js
- `createPayslip(salaryId)`: Queries exact historical arrays from `salary.findUnique`, flattens data to exact snapshot criteria requested natively (Basic, Incentive, TA/DA, Gross, Net, Advance Deducted, etc). 
- Insert the static object block to `prisma.payslip.create()`.
- `generatePdfStream(payslipId)`: Loads snapshot. Dispatches `new PDFDocument()`. Injects table bounds and header metrics. Generates Node Buffer array and pipes readable stream immediately to HTTP headers.

#### [MODIFY] backend/src/services/salary.service.js
- **Injection:** After creating a valid salary payload block, natively trigger an asynchronous await lock sequence explicitly tracking `await payslipService.createPayslip(salary.id)`. This seamlessly enforces the 1:1 integration workflow rule.

### API Layer
#### [NEW] backend/src/controllers/payslip.controller.js
- Standard wrapper functions parsing `req.params`, handling PDF response Content-Type `application/pdf` streaming seamlessly.

#### [NEW] backend/src/routes/payslip.routes.js
- Map logical route prefixes handling HTTP verb contexts accurately `[GET /api/payslips]`, `[GET /api/payslips/:id/download]`.

#### [MODIFY] backend/src/app.js
- Register `payslipRoutes` seamlessly beside your newly architected `salaryRoutes`.

---

## Verification Plan

### Automated Tests
- Explicitly create a test employee internally and ping `POST /api/salary`. 
- Observe internal server logs resolving `createPayslip` side-effects positively cleanly without exception mapping.
- Execute `curl` against `GET /api/payslips/:id/download` testing byte chunking payload configurations natively streaming standard PDF blocks.

### Manual Verification
Ensure your frontend UI natively executes salary creation commands successfully displaying UI rendering for Payslip Download mapping exactly to your new REST endpoints flawlessly.
