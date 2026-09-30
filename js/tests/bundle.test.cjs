const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

for (const major of [1, 2]) {
  test(`Flarum ${major} bundle initializes and handles a paste with its native module loader`, () => {
    const initializers = new Map();
    const listeners = new Map();
    const inserted = [];
    class BasicEditorDriver {
      el = { value: 'label', addEventListener: (name, callback) => listeners.set(name, callback) };
      getSelectionRange() {
        return [0, 5];
      }
      insertBetween(...args) {
        inserted.push(args);
      }
    }
    class TextEditor {
      buildEditor(driver) {
        return driver;
      }
    }
    const modules = {
      'forum/app': { initializers: { add: (name, callback) => initializers.set(name, callback) } },
      'common/components/TextEditor': TextEditor,
      'common/utils/BasicEditorDriver': BasicEditorDriver,
      'common/extend': {
        extend(object, method, callback) {
          const original = object[method];
          object[method] = function (...args) {
            const result = original.apply(this, args);
            callback.call(this, result, ...args);
            return result;
          };
        },
      },
    };
    // Deliberately expose only the registry supplied by this Flarum major.
    const flarum =
      major === 1
        ? { core: { compat: modules } }
        : {
            reg: {
              _webpack_runtimes: {},
              get(namespace, id) {
                assert.equal(namespace, 'core');
                assert.ok(Object.hasOwn(modules, id), `Unknown core module: ${id}`);
                return modules[id];
              },
              add() {},
            },
          };
    const filename = major === 1 ? 'forum-1.x.js' : 'forum.js';
    runInNewContext(readFileSync(path.join(__dirname, '../dist', filename), 'utf8'), {
      flarum,
      module: { exports: {} },
    });
    assert.equal(initializers.size, 1);
    initializers.get('ffans-paste-link')();
    const editor = new TextEditor();
    const driver = new BasicEditorDriver();
    assert.equal(editor.buildEditor(driver), driver);
    let prevented = false;
    listeners.get('paste')({
      defaultPrevented: false,
      clipboardData: { getData: () => 'https://example.com' },
      preventDefault: () => {
        prevented = true;
      },
    });
    assert.equal(prevented, true);
    assert.deepEqual(inserted, [[0, 5, '[label](https://example.com)']]);
    assert.doesNotThrow(() => editor.buildEditor({}));
  });
}
