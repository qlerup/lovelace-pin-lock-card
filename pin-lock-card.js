// Bootstrap: pull Lit from HA frontend globals so the card can render without imports
const _haPanel = customElements.get("ha-panel-lovelace");
const _Base = _haPanel ? Object.getPrototypeOf(_haPanel) : undefined;
// Fallbacks from HA globals
const LitElement = window.LitElement || (_Base ? _Base : class {});
const html = (window.litHtml && window.litHtml.html) || window.html || (_Base?.prototype?.html);
const css  = (window.litHtml && window.litHtml.css)  || window.css  || (_Base?.prototype?.css);

if (!html || !css) {
  throw new Error("pin-lock-card: Lit html/css not found in the frontend environment");
}

const CARD_VERSION = "1.0.3";

// Helpers
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// ---------------------------------
// Card Editor (Plain HTMLElement to avoid frontend component deps)
// ---------------------------------
class PinLockCardEditor extends HTMLElement {
  setConfig(config) {
    const type = config?.type || 'custom:pin-lock-card';
    this._config = { type, relock_seconds: 60, codes: ["1234"], mask_input: true, max_width: "360px", ...(config || {}) };
    this._render();
    // Immediately expose the initial config so YAML is prefilled and GUI mode doesn't fall back to manual
    this._fireChange();
  }

  set hass(hass) {
    this._hass = hass;
    const child = this.shadowRoot?.querySelector('hui-card-element-editor');
    if (child) child.hass = hass;
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    this._render();
  }

  _mountChildEditor() {
    const container = this.shadowRoot?.getElementById('child-container');
    if (!container) return;
    container.innerHTML = '';

    const mount = async () => {
      try {
        if (!customElements.get('hui-card-element-editor')) {
          await customElements.whenDefined('hui-card-element-editor');
        }
        const el = document.createElement('hui-card-element-editor');
        el.hass = this._hass;
        const lovelace = (document.querySelector('hui-view')?.lovelace || window.lovelace);
        if (lovelace) el.lovelace = lovelace;
        const childCfg = this._config?.card || { type: 'entities', entities: [] };
        el.config = childCfg;
        el.addEventListener('config-changed', (ev) => {
          ev.stopPropagation();
          this._config = { ...this._config, card: ev.detail?.config };
          this._fireChange();
        });
        container.appendChild(el);
      } catch (err) {
        const p = document.createElement('p');
        p.className = 'muted';
        p.textContent = 'Could not load card editor.';
        container.appendChild(p);
        console.warn('pin-lock-card: unable to mount child editor', err);
      }
    };
    mount();
  }

  _fireChange() {
    try {
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('pin-lock-card editor: fireChange failed', e);
    }
  }

  _render() {
    if (!this.shadowRoot) return;
    const cfg = this._config || {};
    const codesStr = (cfg.codes || []).join(', ');
    const maxwInput = (() => {
      if (cfg.max_width === undefined || cfg.max_width === null || cfg.max_width === '') return '360';
      const s = String(cfg.max_width).trim();
      const m = s.match(/^([0-9]+(?:\.[0-9]+)?)\s*px$/i);
      if (m) return m[1];
      if (/^[0-9]+(?:\.[0-9]+)?$/.test(s)) return s;
      return '';
    })();

    try {
      this.shadowRoot.innerHTML = `
        <style>
          .editor { padding: 8px 0; font: inherit; color: inherit; }
          .row { display: grid; gap: 12px; margin: 8px 0; }
          .two { grid-template-columns: 1fr 1fr; }
          input[type=text], input[type=number] { width: 100%; box-sizing: border-box; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.1); color: inherit; }
          label { font-size: 0.9em; }
          .muted { opacity: 0.7; margin: 0 0 8px; }
          h3 { margin: 16px 0 8px; font-weight: 600; }
        </style>
        <div class="editor">
          <div class="row">
            <label> Title<br/>
              <input id="title" type="text" value="${cfg.title ?? 'PIN Lock'}"/>
            </label>
          </div>
          <div class="row two">
            <label> Codes (comma-separated)<br/>
              <input id="codes" type="text" value="${codesStr}"/>
            </label>
            <label> Auto-lock after (seconds)<br/>
              <input id="relock" type="number" min="5" value="${String(cfg.relock_seconds ?? 60)}"/>
            </label>
          </div>
          <div class="row">
            <label>
              <input id="mask" type="checkbox" ${cfg.mask_input !== false ? 'checked' : ''}/> Mask PIN (•)
            </label>
          </div>
          <div class="row">
            <label> Max width for PIN (number; empty = unlimited)<br/>
              <input id="maxw" type="text" placeholder="360" value="${maxwInput}"/>
            </label>
          </div>
          <div class="row">
            <label> Hint (optional)<br/>
              <input id="hint" type="text" value="${cfg.hint ?? ''}"/>
            </label>
          </div>
          <h3>Card behind the lock</h3>
          <p class="muted">Configure the card behind the lock in YAML under <code>card:</code>. The GUI field for manual YAML has been removed.</p>
          <div id="child-container"></div>
        </div>
      `;

      // Wire up events safely (guards)
      const add = (id, type, fn) => {
        const el = this.shadowRoot.getElementById(id);
        if (el) el.addEventListener(type, fn, { passive: true });
      };

      add('title', 'input', (e) => { this._config = { ...this._config, title: e.target.value }; });
      add('title', 'change', () => { this._fireChange(); });
      add('codes', 'input', (e) => {
        const arr = String(e.target.value).split(',').map((s) => s.trim()).filter(Boolean);
        this._config = { ...this._config, codes: arr }; 
      });
      add('codes', 'change', () => { this._fireChange(); });
      add('relock', 'input', (e) => { this._config = { ...this._config, relock_seconds: Number(e.target.value) || 0 }; });
      add('relock', 'change', () => { this._fireChange(); });
      add('mask', 'change', (e) => { this._config = { ...this._config, mask_input: !!e.target.checked }; this._fireChange(); });
      add('hint', 'input', (e) => { this._config = { ...this._config, hint: e.target.value }; });
      add('hint', 'change', () => { this._fireChange(); });
      add('maxw', 'input', (e) => {
        const raw0 = String(e.target.value ?? '').trim();
        if (!raw0) { this._config = { ...this._config, max_width: undefined }; return; }
        const raw = raw0.replace(',', '.');
        if (/^[0-9]+(?:\.[0-9]+)?$/.test(raw)) {
          this._config = { ...this._config, max_width: `${raw}px` };
        }
      });
      add('maxw', 'change', () => { this._fireChange(); });

      // Mount child card editor lazily (no advanced field)
      this._mountChildEditor();
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.error('pin-lock-card editor render failed', e);
    }
  }
}

if (!customElements.get('pin-lock-card-editor')) {
  customElements.define('pin-lock-card-editor', PinLockCardEditor);
}

// ---------------------------------
// The Card
// ---------------------------------
class PinLockCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
      _entered: { state: true },
      _unlockUntil: { state: true },
      _childEl: { state: false },
      _remaining: { state: true },
    };
  }

  static getConfigElement() {
    // Ensure editor is registered before returning element
    if (!customElements.get("pin-lock-card-editor")) {
      customElements.define("pin-lock-card-editor", PinLockCardEditor);
    }
    return document.createElement("pin-lock-card-editor");
  }

  static getStubConfig(_hass) {
    return {
      type: "custom:pin-lock-card",
      title: "PIN Lock",
      relock_seconds: 60,
      codes: ["1234"],
      mask_input: true,
      max_width: "360px",
      card: {
        type: "entities",
        entities: [],
        title: "Locked card (edit me)",
      },
    };
  }

  setConfig(config) {
    if (!config) throw new Error("Missing config");
    const defaults = {
      title: "PIN Lock",
      relock_seconds: 60,
      codes: ["1234"],
      mask_input: true,
      max_width: "360px",
    };
    this._config = { ...defaults, ...config };
    this._entered = "";
    this._ensureChild();
    this._tickStart();
  }

  // Helper to expose max width as a CSS var only on locked state
  _maxWidthStyle() {
    const v = this._config?.max_width;
    if (v === undefined || v === null || v === '') return '';
    let val;
    if (typeof v === 'number') {
      val = `${v}px`;
    } else {
      const s = String(v).trim();
      val = /^[0-9]+(?:\.[0-9]+)?$/.test(s) ? `${s}px` : s;
    }
    return `--pin-lock-card-max-width:${val}`;
  }

  // Detect if rendered inside HA's card picker preview (cross shadow roots)
  _getIsPreview() {
    try {
      const selectors = [
        'hui-card-preview',
        'hui-dialog-select-card',
        'hui-card-picker',
        'hui-card-element-editor'
      ];
      let el = this;
      let hops = 0;
      while (el && hops++ < 25) {
        if (el.matches && selectors.some((s) => el.matches(s))) return true;
        const root = el.getRootNode?.();
        if (root?.host) {
          el = root.host;
        } else {
          el = el.parentElement || null;
        }
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  async _ensureChild() {
    if (!this._config?.card) {
      this._childEl = undefined;
      return;
    }
    try {
      const helpers = await (window.loadCardHelpers?.() ?? Promise.resolve(undefined));
      if (helpers?.createCardElement) {
        this._childEl = helpers.createCardElement(this._config.card);
      } else {
        const el = document.createElement("hui-error-card");
        el.setConfig({ type: "error", error: "Card helpers not ready yet", origConfig: this._config.card });
        this._childEl = el;
      }
      if (this._childEl) {
        this._childEl.hass = this.hass;
        this._childEl.addEventListener("ll-rebuild", () => {
          this._childEl = undefined;
          this._ensureChild();
          this.requestUpdate();
        });
      }
    } catch (e) {
      const el = document.createElement("hui-error-card");
      el.setConfig({ type: "error", error: String(e), origConfig: this._config.card });
      this._childEl = el;
      // Expose error for debugging
      // eslint-disable-next-line no-console
      console.error("pin-lock-card: child create failed", e);
    }
  }

  set hass(hass) {
    this.__hass = hass;
    if (this._childEl) this._childEl.hass = hass;
    this._updateRemaining();
  }

  get hass() {
    return this.__hass;
  }

  // ---------- Unlock logic ----------
  get _isUnlocked() {
    return this._unlockUntil && Date.now() < this._unlockUntil;
  }

  _tryUnlock() {
    const raw = this._config.codes;
    const list = Array.isArray(raw) ? raw : [raw];
    const codes = (list || []).map((c) => String(c).trim()).filter(Boolean);
    if (codes.includes(this._entered)) {
      const seconds = Number(this._config.relock_seconds) || 60;
      this._unlockUntil = Date.now() + seconds * 1000;
      this._entered = "";
      this._updateRemaining();
      this.requestUpdate();
    } else {
      this._shake();
      this._entered = "";
      this.requestUpdate();
    }
  }

  _lockNow() {
    this._unlockUntil = 0;
    this._entered = "";
    this._updateRemaining();
    this.requestUpdate();
  }

  // Simple visual feedback on wrong code
  async _shake() {
    this.classList.add("shake");
    await sleep(300);
    this.classList.remove("shake");
  }

  _pressDigit(d) {
    if (this._isUnlocked) return;
    this._entered = (this._entered || "") + String(d);
    this.requestUpdate();
  }

  _backspace() {
    this._entered = (this._entered || "").slice(0, -1);
    this.requestUpdate();
  }

  _clear() {
    this._entered = "";
    this.requestUpdate();
  }

  // Keep remaining time fresh while unlocked
  _tickStart() {
    if (this._tickHandle) return;
    this._tickHandle = setInterval(() => this._updateRemaining(), 1000);
  }

  _updateRemaining() {
    if (!this._unlockUntil) {
      this._remaining = 0;
      return;
    }
    const diff = Math.max(0, Math.floor((this._unlockUntil - Date.now()) / 1000));
    this._remaining = diff;
    if (diff <= 0 && this._unlockUntil) {
      this._unlockUntil = 0;
      this.requestUpdate();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    if (this._tickHandle) clearInterval(this._tickHandle);
    this._tickHandle = undefined;
  }

  // ---------- Rendering ----------
  render() {
    if (!this._config) return "";

    // Toggle compact styling when shown in card picker preview
    const isPreview = this._getIsPreview();
    this.classList.toggle('is-preview', !!isPreview);

    const title = this._config.title ?? "PIN Lock";

    if (this._isUnlocked) {
      return html`
        <ha-card class="unlocked">
          <div class="header">
            <div class="title">${title}</div>
            <div class="spacer"></div>
            <div class="timer" title="Time to auto-lock">
              ${this._remaining ?? 0}s
            </div>
            <mwc-button dense @click=${this._lockNow}>Lock now</mwc-button>
          </div>
          <div class="content">
            ${this._childEl || html`<div class="placeholder">Select a card in the editor…</div>`}
          </div>
        </ha-card>
      `;
    }

    const masked = this._config.mask_input !== false;
    const display = masked ? "•".repeat(this._entered?.length || 0) : (this._entered || "");

    return html`
      <ha-card class="locked" style="${this._maxWidthStyle()}">
        <div class="header">
          <div class="title">${title}</div>
          <div class="spacer"></div>
          ${this._config.hint?.trim() ? html`<div class="hint">${this._config.hint}</div>` : ""}
        </div>
        <div class="keypad-wrap">
          <div class="pin-display" aria-label="PIN">${display || html`<span class="placeholder">Enter code</span>`}</div>
          ${this._renderKeypad()}
        </div>
      </ha-card>
    `;
  }

  _renderKeypad() {
    const keys = [1,2,3,4,5,6,7,8,9,"←",0,"OK"];
    return html`
      <div class="keypad" @click=${this._onKeypadClick}>
        ${keys.map((k) => html`<button class="key" data-k="${k}">${k}</button>`)}
      </div>
    `;
  }

  _onKeypadClick(ev) {
    const t = ev.composedPath().find((n) => n?.dataset && n.dataset.k !== undefined);
    if (!t) return;
    const k = t.dataset.k;
    if (k === "←") this._backspace();
    else if (k === "OK") this._tryUnlock();
    else this._pressDigit(k);
  }

  // ---------- Lovelace sizing ----------
  getCardSize() {
    if (this._getIsPreview && this._getIsPreview()) return 2; // smaller in picker
    if (!this._isUnlocked) return 3;
    if (this._childEl?.getCardSize) return this._childEl.getCardSize();
    return 6;
  }

  // ---------- Styles ----------
  static get styles() {
    return css`
      :host { display: block; }
      .header { display: flex; align-items: center; gap: 8px; padding: 12px 16px 0 16px; }
      .title { font-weight: 600; }
      .spacer { flex: 1; }
      .timer { font-variant-numeric: tabular-nums; opacity: 0.75; margin-right: 8px; }

      .content { padding: 0 8px 8px 8px; }
      .placeholder { opacity: 0.6; padding: 12px; }

      .keypad-wrap { padding: 12px 16px 16px 16px; display: grid; gap: 12px; width: 100%; max-width: var(--pin-lock-card-max-width, 100%); margin: 0 auto; }
      .pin-display { height: 44px; display: grid; place-items: center; border-radius: var(--ha-card-border-radius, 12px); background: var(--card-secondary-background-color); font-size: 20px; letter-spacing: 8px; }
      .pin-display .placeholder { opacity: 0.6; letter-spacing: normal; }

      .keypad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .key { height: 48px; border-radius: 12px; border: none; background: var(--secondary-background-color); font-size: 18px; cursor: pointer; }
      .key:active { filter: brightness(0.95); }

      .actions { display: flex; justify-content: flex-end; gap: 8px; }

      /* Compact preview when shown in card picker */
      :host(.is-preview) .header { padding: 6px 10px 0 10px; }
      :host(.is-preview) .title { font-size: 0.9em; }
      :host(.is-preview) .hint { display: none; }
      :host(.is-preview) .keypad-wrap { padding: 6px 10px 10px 10px; gap: 6px; max-width: 220px; }
      :host(.is-preview) .pin-display { height: 28px; font-size: 14px; letter-spacing: 4px; }
      :host(.is-preview) .keypad { gap: 6px; }
      :host(.is-preview) .key { height: 32px; font-size: 14px; border-radius: 10px; }

      :host(.shake) .pin-display { animation: shake 0.3s; }
      @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-3px); } 100% { transform: translateX(0); } }
    `;
  }
}

if (!customElements.get("pin-lock-card")) {
  customElements.define("pin-lock-card", PinLockCard);
}

// ----------------------
// Custom card definition for card picker
// ----------------------
window.customCards = window.customCards || [];
window.customCards.push({
  type: "pin-lock-card",
  name: "PIN Lock Card v1.0.3",
  description: "Lock any Lovelace card behind a PIN and automatically relock after a period.",
  preview: true,
});

// Small banner to confirm load
console.info(
  `%c PIN-LOCK-CARD %c v${CARD_VERSION} `,
  "background:#3f51b5;color:white;border-radius:4px 0 0 4px;padding:2px 6px;",
  "background:#e0e0e0;color:#111;border-radius:0 4px 4px 0;padding:2px 6px;"
);

// Optional compatibility wrapper
function loadCard() {}
loadCard();
