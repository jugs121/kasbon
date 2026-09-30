# DESIGN.md — Kasbon

Identity: casual Indonesian debt ledger. Santai tapi rapi. Single-column, mobile-first.
Audience: friends / small stalls tracking who owes whom.
Language: Bahasa Indonesia casual.

Dial: ENERGY 1 / RHYTHM 1 / MOTION 1
Why: utility ledger. Calm reading, uniform rows, hover states only. No marketing sections.

Palette (2 core + 1 accent + semantic states):
- Core: zinc-950 text, zinc-50 page, white cards. Why: neutral paper keeps amounts legible.
- Accent: zinc-900 solid for primary CTA only. Why: one focal action per screen.
- Semantic only: emerald tint for owed-to-me, rose tint for i-owe, amber text for pending. Why: money direction must scan instantly, never as decoration.

Typography:
- Geist sans for UI, Geist Mono for amounts only if tabular needed. Why: neutral grotesk fits ledger utility, not brand shout.
- Body 14-16px, meta 12px minimum zinc-600. Why: small grey must still pass contrast.

Radius system:
- Cards 16px (rounded-2xl). Why: soft container, distinct from controls.
- Inputs/selects 12px (rounded-xl). Why: form fields share one field language.
- Primary CTA pill (rounded-full). Why: single pill marks the one action.
- Small icon buttons pill. Why: circular touch targets for row actions.

Motion: hover + active scale on buttons only. No loops, no scroll-reveal. Why: ledger has no narrative to choreograph.

Reading this as: utility ledger for Indonesian users, in a calm paper-ledger language, dial ENERGY 1 / RHYTHM 1 / MOTION 1.
