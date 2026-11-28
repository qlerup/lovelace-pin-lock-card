# Pin Lock Card (Home Assistant Lovelace) 🔒
[![hacs_badge](https://img.shields.io/badge/HACS-Default-blue.svg)](https://hacs.xyz) [![Downloads](https://img.shields.io/github/downloads/qlerup/lovelace-pin-lock-card/total)](https://github.com/qlerup/lovelace-pin-lock-card/releases)


A Home Assistant Lovelace card component that protects any card behind a PIN code — now with automatic translation! 🌐
Supports the Lovelace GUI editor.

![Pin lock card gif](https://github.com/user-attachments/assets/4af69454-3703-4408-ad8d-7b9fb0d49d4d)

---

## ✨ Features
- 🔢 Lock/unlock any inner card behind one or more PIN codes (or an `input_number` entity)  
- ⏱️ Optional auto re-lock after N seconds  
- 🎛️ Show/hide on-screen keypad  
- 🕵️‍♂️ Mask input while typing  
- 💬 Optional hint text for the user  
- 📐 Configurable max width  
- 🌍 **Automatic localization** — follows your Home Assistant language (Danish, Swedish, Norwegian, English, German, Spanish, French, Finnish, Italian)

---

## 🌐 Localization
Starting from **v1.0.5**, the card automatically detects your Home Assistant language.

| Language       | Supported |
| -------------- | --------- |
| 🇩🇰 Danish    | ✅         |
| 🇸🇪 Swedish   | ✅         |
| 🇳🇴 Norwegian | ✅         |
| 🇬🇧 English   | ✅         |
| 🇩🇪 German    | ✅         |
| 🇪🇸 Spanish   | ✅         |
| 🇫🇷 French    | ✅         |
| 🇫🇮 Finnish   | ✅         |
| 🇮🇹 Italian   | ✅         |

> 💡 If your language isn’t yet supported, the card will default to **English**.  
> Want to help? Open an issue titled `Locale request: <language>` or upvote an existing one with 👍.

---

## ⚙️ Installation

[![Open this repository in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=qlerup&repository=lovelace-pin-lock-card)

### 🧩 HACS (as a custom repository)
1. HACS → **Frontend** → `⋮` → **Custom repositories**  
2. Add this repository URL and set **Category** to **Lovelace**:
   ```text
   https://github.com/qlerup/lovelace-pin-lock-card
   ```
3. Install **Pin Lock Card**
4. Reload the frontend cache (hard refresh)

> The resource will usually be added as  
> `/hacsfiles/lovelace-pin-lock-card/pin-lock-card.js`

---

### 🪣 Manual (CDN)
Add a Lovelace **resource** (Settings → Dashboards → Resources → Add):
```yaml
url: https://cdn.jsdelivr.net/gh/qlerup/lovelace-pin-lock-card@v1.1.3/pin-lock-card.js
type: module
```

---

## 🧰 YAML Example
```yaml
type: custom:pin-lock-card
title: "Kodelås"
codes:
  - "1234"            # you can add multiple codes
# code_entity: input_number.pin_code  # optional entity (e.g. input_number) storing the PIN
relock_seconds: 60    # auto re-lock after N seconds (0 disables it; omitted defaults to 60)
mask_input: true      # mask digits while typing
hint: "Enter PIN"     # optional helper text
max_width: "360px"    # number or any CSS width
card:
  type: entities      # the inner card to protect
  entities:
    - switch.example
```
---
## 🖱️ Visual Editor (Lovelace GUI) — Point-and-Click Setup ✨
Set up the card without touching YAML using the built-in Lovelace GUI editor.

**How to open it:**
1. 🧭 Go to your dashboard → **Edit** → **Add card** → search for **Pin Lock Card** (or “Custom: Pin Lock Card”).  
2. 🔐 Enter one or more **PIN codes** (comma-separated).  
3. ⏱️ Set **Auto re-lock** time (or disable with `0`).  
4. 👁️ Toggle **Mask input**, keypad visibility, change **Title/Hint**, and **Max width**.  
5. 🧩 Pick the **inner card** to protect (e.g., Entities, Button, Tile, etc.).  
6. ✅ Click **Save** — done!

**What it looks like in the editor:**

<img width="1006" height="614" alt="Pin Lock Card — GUI Editor" src="https://github.com/user-attachments/assets/654a0b3e-d092-4e74-be29-b35525b352ba" />


> [!NOTE]  
> The GUI editor mirrors every option available in YAML and previews changes live, making it quick to validate PIN behavior and layout.



> [!TIP]  
> In the GUI editor you can enter multiple codes as a comma-separated list, e.g. `1234, 0000, 9999`.


---


## ⚙️ Options

| Option           | Type            | Default     | Description                                   |
| :--------------- | :-------------- | :---------- | :-------------------------------------------- |
| `codes`          | array of string | `["1234"]` (omitted if `code_entity` is set) | One or more accepted PIN codes |
| `code_entity`    | string          | –           | Entity ID (such as `input_number.pin_code`) storing the PIN code |
| `relock_seconds` | number          | `60`        | Auto re-lock after N seconds. Set to 0 to disable.|
| `mask_input`     | boolean         | `true`      | Mask digits while typing                      |
| `title`          | string          | `"PIN Lock"`| Title shown above                             |
| `hint`           | string          | –           | Small helper text under the title             |
| `max_width`      | string/number   | `"360px"`   | Max width (e.g. `420`, `420px`, `24rem`)      |
| `card`           | object          | –           | The inner card to protect                     |



## 🧩 Security Notice

> [!CAUTION]  
> **PINs are not encrypted.** This card validates PINs client-side. Anyone with access to the Lovelace editor or browser DevTools can discover the configured PIN codes. Do **not** use this for real security or to protect sensitive/critical controls.

### 🔐 Recommended Hardening

- 🔒 Use with **Kiosk Mode** on wall tablets/shared screens to hide header/sidebar and block editor access:  
  - Kiosk Mode (maintained fork): https://github.com/NemesisRE/kiosk-mode  
  - Legacy (archived): https://github.com/maykar/kiosk-mode
- 👥 Give household users **non-admin** roles  
- 🧱 Limit who can **edit dashboards**  
- ⚠️ Treat this as a **convenience lock only**, not a security boundary
