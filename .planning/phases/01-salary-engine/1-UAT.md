---
status: testing
phase: 01-salary-engine
source: [walkthrough.md]
started: 2026-03-29T07:18:00Z
updated: 2026-03-29T07:18:00Z
---

## Current Test

number: 1
name: Cold Start Smoke Test
expected: |
  Kill any running server/service. Start the application from scratch (`node server.js`). Server boots without errors, and the backend HTTP port goes live.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server/service. Start the application from scratch (`node server.js`). Server boots without errors, and the backend HTTP port goes live.
result: [pending]

### 2. Idempotency Constraint Check
expected: Send two identical `POST /api/salary` JSON requests (same `employeeId`, `month`, and `year`). The first succeeds (201 Created), and the second returns a strict 400 Validation Error preventing duplicated data.
result: [pending]

### 3. Mathematical Abstraction Verification
expected: Send a valid mathematical tree (`POST /api/salary` with basicSalary, otHours, extraFine, minusMinutes, and leavesTaken). Verify the payload returns exactly populated `grossSalary`, `totalDeduction`, and `netSalary` calculations matching explicit math rules, without UI injection.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0

## Gaps

