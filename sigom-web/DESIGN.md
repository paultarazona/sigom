---
name: SIGOM-ENOSA
description: Operations dashboard for electrical grid inspection and maintenance work orders
colors:
  primary: "#00236F"
  primary-hover: "#001A52"
  accent: "#57DFFE"
  secondary: "#00687A"
  background: "#F7F9FB"
  surface: "#FFFFFF"
  border: "#C4D0D8"
  text-primary: "#151B30"
  text-secondary: "#72727A"
  success: "#166534"
  success-bg: "#DBFCE6"
  warning: "#B45309"
  warning-bg: "#FEF3C7"
  danger: "#B91C1C"
  danger-bg: "#FEE2E2"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  nav-item-active:
    backgroundColor: "rgba(255,255,255,0.12)"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  nav-item-inactive:
    backgroundColor: "transparent"
    textColor: "rgba(255,255,255,0.75)"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  status-badge:
    rounded: "{rounded.full}"
    padding: "2px 10px"
  stat-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 12px 8px 36px"
---

# Design System: SIGOM-ENOSA

## 1. Overview

**Creative North Star: "The Operations Center"**

SIGOM is not a dashboard in the SaaS sense — it is a command interface for people who manage electrical infrastructure under pressure. The visual system is built to communicate operational state at a glance: who has what, what is urgent, what is moving. Every pixel earns its place by carrying signal or creating legible structure.

The palette is institutional by intent. The navy (#00236F) and cyan (#57DFFE) are the colors of ENOSA — they are not design choices to revisit, they are identity markers that connect SIGOM to SISCON and to the broader infrastructure that field supervisors trust. The system uses this palette with discipline: primary color carries weight, accent carries attention, neutral surfaces carry content.

Density is a feature, not a failure. Supervisors scan tables, not cards. The type scale is tight, spacing is purposeful rather than generous, and the default state of the interface is information-dense. Space is not used to feel "modern" — it is used to group, separate, and direct attention where needed.

**Key Characteristics:**
- Institutional identity over design originality — the navy/cyan palette IS the brand
- Information density over white space — supervisors scan, they don't browse
- State visibility over decoration — status badges and priority indicators are the most important visual elements
- Flat-by-default elevation — shadows appear only as hover response, never decoration
- Single-family type scale — Inter in multiple weights, no decorative pairing needed

## 2. Colors: The ENOSA Institutional Palette

A restrained palette with one accent used sparingly. Every color has a named operational role.

### Primary
- **Grid Navy** (#00236F): The ENOSA institutional color. Sidebar background, primary buttons, page-level headings. This color IS the brand.
- **Midnight Navy** (#001A52): Hover depth for Grid Navy. Logo bar, button hover, pressed state.

### Secondary
- **Signal Cyan** (#57DFFE): The active-state accent. Used exclusively for: active sidebar item icon, active indicators. Never used for backgrounds or decoration. Its rarity is the point.
- **Teal Secondary** (#00687A): Secondary actions and active filter states.

### Neutral
- **Control Ink** (#151B30): Primary text — headings, data cells, important labels.
- **Instrument Gray** (#72727A): Secondary text — descriptions, metadata, placeholder text. Must maintain ≥4.5:1 contrast on all surfaces.
- **Station White** (#FFFFFF): Surface color for cards, tables, modals, and fields.
- **Grid Mist** (#F7F9FB): Application background — a barely-there cool tint.
- **Panel Border** (#C4D0D8): All borders — table lines, input strokes, card outlines. One border color throughout.

### Semantic
- **Resolved Green** (#166534) / **Resolved Tint** (#DBFCE6): Resolved or closed states.
- **Alert Amber** (#B45309) / **Alert Tint** (#FEF3C7): Suspended or warning states.
- **Critical Red** (#B91C1C) / **Critical Tint** (#FEE2E2): Cancelled, error, or critical priority.

**The One Accent Rule.** Signal Cyan appears on ≤10% of any screen. Active nav icon and deliberate indicators only. Nowhere else.

**The Semantic Color Rule.** State colors (green/amber/red) appear only in status badges and explicit error/warning/success states. Never as decorative accents.

## 3. Typography

**All roles:** Inter, system-ui fallback

**Character:** A single sans-serif in five weights. Inter's tabular figures make it legible in dense data contexts. No display face — personality comes from weight contrast and density, not expressive typefaces.

### Hierarchy
- **Display** (700, 1.5rem, -0.01em): Page-level titles in PageHeader. One per screen.
- **Headline** (600, 1.125rem): Section headings inside cards and panels.
- **Title** (600, 0.875rem): Card labels, button text, form labels.
- **Body** (400, 0.875rem): Table cell content, descriptions, inputs. Max ~80ch in prose.
- **Label** (600, 0.625rem, 0.08em tracking, uppercase): Data table column headers only.

**The No-Prose-Label Rule.** The 10px uppercase tracked label style is reserved strictly for data table column headers. Using it for section eyebrows or card captions is the AI dashboard reflex.

## 4. Elevation

Flat by default. Two surface layers: Grid Mist (background) and Station White (content). Shadows are a hover-state affordance, not decoration.

### Shadow Vocabulary
- **Hover lift** (`box-shadow: 0 1px 4px rgba(0,0,0,0.08)`): Interactive card-like elements on hover only. Never at rest.
- **Modal** (`box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)`): Dialog elevation over content.

**The Flat-At-Rest Rule.** Every surface is visually flat at rest. A shadow at rest implies interactivity — if the element is not interactive, remove the shadow.

## 5. Components

### Buttons
- **Shape:** 8px radius
- **Primary:** Grid Navy background, white text, 8px 16px padding. Hover: Midnight Navy. Focus ring: navy/30 at 2px offset.
- **Danger:** Critical Red background, white text. Destructive actions only.
- **Secondary:** White background, Control Ink text, Panel Border stroke. Cancel and back actions.
- **States:** default, hover, focus, active, disabled (`opacity-50 cursor-not-allowed`).

### Status Badges
Seven work order states, each with a colored dot + text label. Both always present — color is never the sole differentiator. Dot is `aria-hidden="true"`. Pill shape (9999px radius).

### Priority Badges
Same pattern: LOW (slate), MEDIUM (blue), HIGH (orange), CRITICAL (red). Dot + text always.

### StatCard
Dashboard KPI card. Clean white surface, uniform Panel Border, colored icon container per semantic variant. No side-stripe accents — variant color lives in the icon container only. Non-interactive at rest: no shadow, no cursor-pointer.

### DataTable
Primary data affordance. Header: Grid Mist background, 10px uppercase tracked labels. Row hover: solid `#F0F4F8` (not opacity). Clickable rows require `role="button"`, `tabIndex={0}`, `onKeyDown` for keyboard access.

### Search Input
8px radius. Left Search icon at `left-3`. Focus: 2px navy/30 ring, border shifts to Grid Navy. Must have `aria-label` — placeholder is not a label.

### Navigation (Sidebar)
Background: Grid Navy. Active: white/12 background + font-semibold + Signal Cyan icon (three independent signals). Inactive: white/75 text (not white/60 — contrast requirement). No left-border stripe.

### Dialogs
Native `<dialog>` with `showModal()`. Must have `aria-labelledby` (dialog title) and `aria-describedby` (message). Backdrop: `bg-black/50`.

## 6. Do's and Don'ts

### Do:
- **Do** keep the navy/cyan palette exactly as-is — it is the ENOSA institutional identity
- **Do** make tables the primary affordance — supervisors scan lists, they don't browse cards
- **Do** label every status and priority with both a colored dot AND a text label — color is never sole differentiator
- **Do** keep shadows flat at rest, responsive on hover — hover-state only on interactive elements
- **Do** use Tailwind design tokens (`text-textPrimary`, `bg-background`, `border-border`) over raw hex literals
- **Do** add keyboard navigation (`tabIndex`, `onKeyDown`) to any interactive non-button/non-anchor element
- **Do** give every form input an associated `<label>` or `aria-label` — placeholder text is not a label
- **Do** use `white/75` minimum for sidebar inactive text — `white/60` fails WCAG AA contrast

### Don't:
- **Don't** use generic SaaS aesthetics (Notion, Linear, Vercel) — too playful, too sparse for utility ops
- **Don't** use glassmorphism, gradient fills, or gradient text — explicitly forbidden
- **Don't** add left-border stripes to cards, list items, or callouts — the most recognizable AI-generated UI tell
- **Don't** use `border-left > 1px` as a colored accent on any surface
- **Don't** convey state through color alone — badges always need the text label
- **Don't** use the `success` (green) variant on a metric with no defined target — green says "good" only relative to a baseline
- **Don't** apply `shadow-sm` at rest on non-interactive elements — it implies clickability
- **Don't** use raw hex literals when a design token exists in `tailwind.config.js`
- **Don't** use the 10px uppercase tracked label style outside of data table column headers
- **Don't** add decorative motion — transitions are for state changes only, 150–200ms ease-out
