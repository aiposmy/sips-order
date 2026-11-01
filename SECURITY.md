# Security Policy — SIPS Ordering

## Supported Versions

| Version | Supported |
|---------|-----------|
| v7.x | ✅ Supported |
| v6.x and earlier | ❌ Not Supported |

SIPS Ordering v7 is the current supported release. Security fixes and updates will be prioritized for v7 and subsequent releases.

## Reporting a Vulnerability

Security vulnerabilities should be reported privately through GitHub Private Vulnerability Reporting, where enabled.

Repository:
https://github.com/aiposmy/sips-order

Please do not disclose security vulnerabilities through public GitHub Issues.

Include a description of the vulnerability, affected components, reproduction steps, potential impact and supporting evidence.

We aim to acknowledge reports within 3 business days and provide an initial assessment within 7 business days.

## Security Controls in v7

The following security controls are implemented in the v7 application design:

- Order, shift and audit-log deletion restrictions.
- Reason-based cancellation for unpaid orders.
- Administrator-only refund and void workflow.
- Audit logging of sensitive operational activities.
- Menu-based price validation in the outlet dashboard.
- Payment reference and staff verification records.
- Order capacity and ordering pause controls.
- Shift-closing reconciliation and exception reports.

These controls must be verified against the deployed Firebase security rules before being considered production-enforced.

## Known Security Limitations

- Server-side authoritative price validation is not yet implemented.
- Client-side price verification is not a substitute for secure backend validation.
- Firebase production security rules require deployment verification and live testing.
- Payment confirmation currently relies on staff verification and is not equivalent to automated payment gateway settlement confirmation.

## Responsible Disclosure

Security testing must not disrupt live business operations, expose customer data or modify transactions belonging to other users.

Vulnerabilities should be reported privately and disclosed publicly only after appropriate coordination.

## Security Updates

Security fixes will be maintained for the current supported release. This policy will be updated as the platform evolves.

SIPS Ordering — Version 7
