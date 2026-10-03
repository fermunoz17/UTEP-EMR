# Design Decisions

Log of architectural and technical decisions made for the UTEP-EMR project.

---

## Decision Record Template

### ADR-XXX: [Title]
- **Status**: [Proposed | Accepted | Superseded]
- **Date**: YYYY-MM-DD
- **Context**: [Background]
- **Decision**: [What was chosen]
- **Consequences**: [Impact and trade-offs]

---

### ADR-001: Instructor feedback is optional
- **Status**: Accepted
- **Date**: 2026-10-01
- **Context**: Instructors needed a way to leave comments when signing off or returning a case.
- **Decision**: Added a text column for feedback on assigned cases.
- **Consequences**: Instructors can submit without writing anything, which keeps the flow fast for straightforward sign-offs.

---

### ADR-002: Rubric is plain text, not a structured format
- **Status**: Accepted
- **Date**: 2026-10-01
- **Context**: We needed a place for instructors to define what they expect students to document.
- **Decision**: Added a single free-text field to the template for grading notes and expectations.
- **Consequences**: Simple to implement and flexible. A more structured rubric builder can be added later if needed.

---

### ADR-003: Clinical roles are separate from account types
- **Status**: Accepted
- **Date**: 2026-10-03
- **Context**: Students need discipline roles, such as Pharmacy, Nursing, and Physical Therapy, while retaining their student account type.
- **Decision**: Assign clinical roles separately from account types, link roles to permissions, and check capabilities through `has_permission()`.
- **Consequences**: Supports multiple disciplines per user and workflows such as PT SOAP notes. Existing access policies remain and permission-based database enforcement is still needed.
