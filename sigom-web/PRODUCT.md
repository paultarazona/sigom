# Product

## Register

product

## Users

Field supervisors and operations coordinators at ENOSA (Empresa Norteña de Electricidad S.A.). They work in an electrical distribution company managing field crews, technicians, and maintenance work orders. Primary context: desktop or laptop in an office or dispatch center, often under time pressure, monitoring multiple open work orders simultaneously. Secondary user: field technicians who need to log status updates.

## Product Purpose

SIGOM-ENOSA (Sistema de Gestión de Órdenes de Inspección y Mantenimiento) is the field operations layer for ENOSA's electrical grid. It lets supervisors create, assign, track, and close work orders for inspections and maintenance activities that SISCON (the metering system) flags as incidents. Success means a supervisor can immediately see what's urgent, who has it, and whether it's moving — without digging through spreadsheets or calling crews.

## Brand Personality

Authoritative, operational, clear. This is mission-critical infrastructure software for a utility company — not a startup dashboard. It should feel like a control room: professional, dense with signal, zero noise.

## Anti-references

- Generic SaaS dashboards (Notion, Linear, Vercel): too playful, too white, too spaced-out for utility ops
- Material Design / Google admin apps: too generic, no institutional identity
- Consumer fintech (Stripe, Brex): wrong register entirely — this is infrastructure, not money
- Glassmorphism / gradient-heavy designs: explicitly forbidden by design system

## Design Principles

1. **Signal over decoration** — Every visual element earns its place by communicating operational state. Status, priority, and assignee are always visible; decorative chrome is always suspicious.
2. **Institutional coherence** — SIGOM must feel like a sibling of SISCON-ENOSA. The navy-cyan palette (#00236F / #57DFFE) is the institutional identity of ENOSA, not a design choice to revisit.
3. **Density with legibility** — Supervisors scan many rows. Tables and lists are the primary affordance. Spacing serves readability, not airiness.
4. **State visibility** — Work order status is the most important data on any screen. Badges, colors, and indicators must make transitions obvious without requiring interaction.
5. **Operational trust** — Destructive actions always confirm. Error states always explain. Empty states always suggest next action. The app never leaves the user stranded.

## Accessibility & Inclusion

WCAG 2.1 AA. High-contrast text is mandatory — operators may work in varied lighting conditions. Reduced motion must be respected. Color is never the sole carrier of state information (badges always include text label alongside color dot).
