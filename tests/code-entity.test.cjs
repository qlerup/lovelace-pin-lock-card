const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadElements() {
  const registry = new Map();
  const tag = (strings, ...values) => ({ strings, values });
  class Element {
    constructor() {
      this.classList = {
        add() {},
        remove() {},
        toggle() {},
      };
    }
    requestUpdate() {}
    dispatchEvent() {}
  }
  const context = vm.createContext({
    window: { LitElement: Element, html: tag, css: tag },
    HTMLElement: Element,
    CustomEvent: class CustomEvent {
      constructor(type, init = {}) {
        this.type = type;
        this.detail = init.detail;
      }
    },
    customElements: {
      get: (name) => registry.get(name),
      define: (name, value) => registry.set(name, value),
    },
    console: { info() {}, warn() {}, error() {} },
    setTimeout,
    setInterval,
    clearInterval,
    navigator: { language: 'en' },
  });
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '../pin-lock-card.js'), 'utf8'),
    context
  );
  return {
    Card: registry.get('pin-lock-card'),
    Editor: registry.get('pin-lock-card-editor'),
  };
}

const { Card, Editor } = loadElements();

test('unlocks with input_number state formatted as integer or .0 float', () => {
  for (const state of ['4321', '4321.0', '4321.00']) {
    const card = new Card();
    card._tickStart = () => {};
    card.setConfig({ code_entity: 'input_number.door_pin' });
    card.hass = { states: { 'input_number.door_pin': { state } } };

    // Default 1234 must not be injected when code_entity is configured without codes
    card._entered = '1234';
    card._tryUnlock();
    assert.ok(!card._isUnlocked);

    card._entered = '4321';
    card._tryUnlock();
    assert.ok(card._isUnlocked);
  }
});

test('unlocks when input_number state is 0 or 0.0', () => {
  const card = new Card();
  card._tickStart = () => {};
  card.setConfig({ code_entity: 'input_number.door_pin' });
  card.hass = { states: { 'input_number.door_pin': { state: '0.0' } } };

  card._entered = '0';
  card._tryUnlock();
  assert.ok(card._isUnlocked);
});

test('rejects unknown, unavailable, or missing entity states', () => {
  for (const states of [
    {},
    { 'input_number.door_pin': { state: 'unknown' } },
    { 'input_number.door_pin': { state: 'unavailable' } },
    { 'input_number.door_pin': { state: '' } },
  ]) {
    const card = new Card();
    card._tickStart = () => {};
    card.setConfig({ code_entity: 'input_number.door_pin' });
    card.hass = { states };

    for (const attempt of ['', 'unknown', 'unavailable', '1234']) {
      card._entered = attempt;
      card._tryUnlock();
      assert.ok(!card._isUnlocked);
    }
  }
});

test('supports combining static codes and code_entity', () => {
  const card = new Card();
  card._tickStart = () => {};
  card.setConfig({ codes: ['9999'], code_entity: 'input_number.door_pin' });
  card.hass = { states: { 'input_number.door_pin': { state: '5555.0' } } };

  card._entered = '9999';
  card._tryUnlock();
  assert.ok(card._isUnlocked);

  card._lockNow();
  card._entered = '5555';
  card._tryUnlock();
  assert.ok(card._isUnlocked);
});

test('tracks dynamic updates to input_number state', () => {
  const card = new Card();
  card._tickStart = () => {};
  card.setConfig({ code_entity: 'input_number.door_pin' });
  card.hass = { states: { 'input_number.door_pin': { state: '1111.0' } } };

  card._entered = '1111';
  card._tryUnlock();
  assert.ok(card._isUnlocked);
  card._lockNow();

  card.hass = { states: { 'input_number.door_pin': { state: '2222.0' } } };
  card._entered = '1111';
  card._tryUnlock();
  assert.ok(!card._isUnlocked);

  card._entered = '2222';
  card._tryUnlock();
  assert.ok(card._isUnlocked);
});

test('editor preserves code_entity without injecting default codes', () => {
  const editor = new Editor();
  editor.setConfig({ type: 'custom:pin-lock-card', code_entity: 'input_number.door_pin' });
  assert.equal(editor._config.code_entity, 'input_number.door_pin');
  assert.equal(editor._config.codes, undefined);
});
