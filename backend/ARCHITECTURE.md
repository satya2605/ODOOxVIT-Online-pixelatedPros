# Enterprise Expense Reimbursement Backend Architecture

This document describes the upgraded logic and structure of the enterprise-grade **Expense Reimbursement Management System** modular backend. The system connects cleanly with the React + MUI frontend using a REST microservices approach aligned with a state-machine driven workflow.

## Base Setup Overview

- **Tech Stack**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL.
- **Project Structure**: Organized by domain-driven components (`auth`, `expenses`, `approvals`, `rules`, `events`).
- **Core Improvements**: Dynamic approval workflows, Intelligent rule engine, Event-driven tracking log, and State Machine.

---

## Component 1: Advanced Approval Engine & Workflow State Machine

Enhances standard static approvals to allow complex branching logic and parallel/escalation approvals.

### Updated DB Schema
```prisma
model ApprovalStep {
  id         String         @id @default(uuid())
  expenseId  String
  approverId String
  stepOrder  Int
  status     ApprovalStatus @default(PENDING) // PENDING, APPROVED, REJECTED, SKIPPED

  expense  Expense @relation(...)
  approver User    @relation(...)
}
```

### API Definitions
- `POST /api/approvals/:expenseId/approve`
  - **Req**: Headers (Authorization/JWT)
  - **Res**: `{ status: "APPROVED" | "IN_REVIEW", message: string }`
- `POST /api/approvals/:expenseId/reject`
  - **Res**: `{ status: "REJECTED", reason: string }`
- `GET /api/approvals/pending`
  - **Res**: `[ Expense[] ]` filtered by current `approverId` active in exactly the lowest pending `stepOrder`.

### Service Logic Overview
When `processApproval()` is invoked, the state machine evaluates:
1. Validates the expense state is not finalized (`APPROVED` or `REJECTED`).
2. Checks if `approverId` belongs to the current `stepOrder`.
3. Marks step as `APPROVED`. Checks if remaining approvers in this block exist.
4. Triggers Rule Engine for overrides.
5. Updates Expense State based on combined outcomes.

### Edge Cases Handled
- **Attempting to approve out of turn**: Blocked by checking `stepOrder` via state tracking.
- **Conflicting Parallel Actions**: Race conditions on DB mutations mitigated via Prisma transactional updates.
- **Duplicate Approvals**: Blocked if `status != PENDING`.

### Frontend Connection
Connects to the timeline visualizer. The frontend retrieves `approvalSteps`, groups them by `stepOrder`, and highlights the current pending block. Approvers click a single button that mutates state and recalculates the timeline dynamically.

---

## Component 2: Rule Engine (Production-Grade)

An independent module responsible for bypassing or optimizing rigid workflows dynamically based on custom policies (e.g., auto-approve if under $50, fast-track if CFO).

### Updated DB Schema
```prisma
model Rule {
  id           String   @id @default(uuid())
  companyId    String
  type         RuleType // PERCENTAGE, ROLE_BASED, HYBRID
  conditionJson Json    // Customizable rule logic schema
  priority     Int      @default(0) // Higher executes first
}
```

### API Definitions
- `POST /api/rules`
  - **Req**: `{ type: "PERCENTAGE", conditionJson: { percentage: 60 }, priority: 10 }`
  - **Res**: `{ success: true, ruleId: string }`
- `GET /api/rules/evaluate/:expenseId`
  - **Res**: `{ ruleTriggered: true/false, ruleId?: string, reason?: string }`

### Service Logic Overview
The `evaluateRules()` method is hooked into the *Approval Service*. 
- It loads all rules scoped to the `companyId`.
- Loops through rules sequentially by priority.
- Deserializes `conditionJson` logic and injects current expense state into the conditions.
- Returns the first triggered rule to auto-resolve or modify workflow behavior.

### Edge Cases Handled
- **Broken Rule Configurations**: Service runs in a try/catch sandbox; failure of a rule skips to the next rule without breaking main workflow.
- **Rule Ordering Conflicts**: Strict numeric priority evaluation prevents conflicting overrides.

### Frontend Connection
The frontend **Admin Dashboard** implements a rule-builder mapping to `conditionJson`. The **Expense Details** view checks if an expense was auto-resolved and visually flags it.

---

## Component 3: Event Logging System (Audit Trail & Activity)

Critical for providing SOC2/Enterprise traceability on who did what and when.

### Updated DB Schema
```prisma
model Event {
  id        String   @id @default(uuid())
  expenseId String
  actorId   String?  // Can be null if system action
  type      String   // EXPENSE_CREATED, TRIGGERED_RULE, REJECTED
  metadata  Json?
  timestamp DateTime @default(now())
}
```

### API Definitions
- `GET /api/expenses/:id/activity`
  - **Res**: `[{ id: "...", type: "EXPENSE_APPROVED", timestamp: "...", actor: {name: "John"} }]`

### Flow Explanation
1. An action occurs anywhere in the app (Draft created, Submitted, Approved, Rule Evaluated).
2. The executing service asynchronously fires `eventService.logEvent()`.
3. Event is inserted instantly into DB without slowing down the core transaction.

### Edge Cases Handled
- **System Automated Steps**: Handled gracefully by making `actorId` nullable, and tagging metadata with rule info.
- **Payload Bloat**: Metadata is schemaless JSON, allowing variable payloads while keeping the primary table lean.

### Frontend Connection
Populates the bottom **Activity Timeline** panel. Displays historical breadcrumbs to users alongside detailed workflow status.

---

## Component 4: Future Upgrades - Analytics & OCR Hooks

Although stubbed out, the architecture natively supports plugging into webhooks or message queues (like Redis Bull/SQS) safely due to the decoupled service design:
- `OCR hooks` translate uploaded imagery and auto-populate Draft variables safely.
- `Notifications` plug directly into the Event stream pattern. When a new event happens, an observer kicks off email/Push triggers.
