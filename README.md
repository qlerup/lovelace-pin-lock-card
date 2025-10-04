# Pin Lock Card (Home Assistant Lovelace)

A Home Assistant Lovelace card that protects any card behind a PIN code, with optional auto re-lock/timer.  
Supports the Lovelace GUI editor.

<img width="763" height="318" alt="Skærmbillede 2025-10-04 023216" src="https://github.com/user-attachments/assets/761fa2cd-f140-467a-989b-401dfaf4f5b5" />


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
show_keypad: true     # show on-screen keypad
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
| `show_keypad`    | boolean         | `true`      | Show the on-screen keypad                     |
| `mask_input`     | boolean         | `true`      | Mask digits while typing                      |
| `title`          | string          | `"PIN Lock"`| Title shown above                             |
| `hint`           | string          | –           | Small helper text under the title             |
| `max_width`      | string/number   | `"360px"`   | Max width (e.g. `420`, `420px`, `24rem`)     |
| `card`           | object          | –           | The inner card to protect                     |






   ```text
   https://github.com/qlerup/lovelace-pin-lock-card
   ```

