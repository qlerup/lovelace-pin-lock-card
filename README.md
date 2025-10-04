# Pin Lock Card (Home Assistant Lovelace)

A Home Assistant Lovelace card that protects any card behind a PIN code, with optional auto re-lock/timer.  
Supports the Lovelace GUI editor.


![Pin lock card gif](https://github.com/user-attachments/assets/4af69454-3703-4408-ad8d-7b9fb0d49d4d)



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
2. Add this repository URL and set **Category** to **Lovelace**:
   ```text
   https://github.com/qlerup/lovelace-pin-lock-card
   ```
3. Install **Pin Lock Card**
4. Reload the frontend cache (hard refresh)


> The resource will usually be added as  
> `/hacsfiles/lovelace-pin-lock-card/pin-lock-card.js`

### Manual (CDN)
Add a Lovelace **resource** (Settings → Dashboards → Resources → Add):
```yaml
url: https://cdn.jsdelivr.net/gh/qlerup/lovelace-pin-lock-card@v1.0.0/pin-lock-card.js
type: module
```

### YAML Example
```yaml
type: custom:pin-lock-card
title: "Kodelås"
codes:
  - "1234"            # you can add multiple codes
relock_seconds: 60    # auto re-lock after N seconds (omit/0 to disable)
mask_input: true      # mask digits while typing
hint: "Enter PIN"     # optional helper text
max_width: "360px"    # number or any CSS width
card:
  type: entities      # the inner card to protect
  entities:
    - switch.example
```
> [!TIP]
> In the GUI editor you can enter multiple codes as a comma-separated list,
> e.g., `1234, 0000, 9999`.



## Options

| Option           | Type            | Default     | Description                                   |
| :--------------- | :-------------- | :---------- | :-------------------------------------------- |
| `codes`          | array of string | `["1234"]`  | One or more accepted PIN codes                |
| `relock_seconds` | number          | `60`        | Auto re-lock after N seconds                  |
| `mask_input`     | boolean         | `true`      | Mask digits while typing                      |
| `title`          | string          | `"PIN Lock"`| Title shown above                             |
| `hint`           | string          | –           | Small helper text under the title             |
| `max_width`      | string/number   | `"360px"`   | Max width (e.g. `420`, `420px`, `24rem`)     |
| `card`           | object          | –           | The inner card to protect                     |


## Security notice

> [!CAUTION]
> **PINs are not encrypted.** This card validates PINs client-side. Anyone with access to the Lovelace editor or browser DevTools can discover the configured PIN codes. Do **not** use this for real security or to protect sensitive/critical controls.

### Recommended hardening

- **Use with Kiosk Mode** on wall tablets/shared screens to hide header/sidebar and block access to the editor for non-admins:  
  - Kiosk Mode (maintained fork): https://github.com/NemesisRE/kiosk-mode  
  - Legacy (archived): https://github.com/maykar/kiosk-mode
- Give household users **non-admin** roles.
- Limit who can **edit dashboards**.
- Treat this as a **convenience lock only** (deterrence), not a security boundary.


