# Pin Lock Card (Home Assistant Lovelace)

A Home Assistant Lovelace card that protects any card behind a PIN code, with optional auto re-lock/timer.  
Supports the Lovelace GUI editor.

## Features
- Lock/unlock any inner card behind one or more PIN codes
- Optional auto re-lock after N seconds
- Show/hide on-screen keypad
- Mask input while typing
- Optional hint text for the user
- Configurable max width

## Installation

### HACS (as a custom repository)
1. HACS → **Frontend** → `⋮` → **Custom repositories**
2. Add: `https://github.com/qlerup/lovelace-pin-lock-card` with type **Lovelace**
3. Install **Pin Lock Card**
4. Reload the frontend cache (hard refresh)

> The resource will usually be added as  
> `/hacsfiles/lovelace-pin-lock-card/pin-lock-card.js`

### Manual (CDN)
Add a Lovelace **resource** (Settings → Dashboards → Resources → Add):
```yaml
url: https://cdn.jsdelivr.net/gh/qlerup/lovelace-pin-lock-card@v1.0.0/pin-lock-card.js
type: module


type: custom:pin-lock-card
title: "PIN Lock"
codes:
  - "1234"           # you can add multiple codes
relock_seconds: 60   # auto re-lock after N seconds (optional)
show_keypad: true    # show on-screen keypad
mask_input: true     # mask input while typing
hint: "Enter PIN"    # optional helper text under the title
max_width: "360px"   # number (pixels) or any valid CSS width
card:
  type: entities     # the inner card you want to protect
  entities:
    - switch.example
