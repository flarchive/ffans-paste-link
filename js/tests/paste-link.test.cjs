const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

// Exercise the actual TypeScript sources without adding a browser or test framework.
function loadSource(name, dependencies = {}) {
  const source = readFileSync(path.join(__dirname, '../src/forum', name + '.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  new Function('exports', 'require', outputText)(exports, (id) => {
    assert.ok(Object.hasOwn(dependencies, id), 'Unexpected dependency: ' + id);
    return dependencies[id];
  });
  return exports;
}

const utils = loadSource('utils');
const { handlePaste } = loadSource('handlePaste', { './utils': utils });

function assertProtectedRanges(text, ranges) {
  for (let i = 0; i < text.length; i++) {
    assert.equal(
      utils.selectionIntersectsLink(text, i, i + 1),
      ranges.some(({ start, end }) => start <= i && i < end),
      'Unexpected protection at character ' + i
    );
  }
}

const links = [
  ['normal link', '[label](https://example.com)'],
  ['nested label', '[outer [inner] text](url)'],
  ['nested target', '[label](https://example.com/a(b(c)))'],
  ['escaped label delimiter', String.raw`[a\]b](url)`],
  ['escaped target delimiter', String.raw`[label](a\)b)`],
  ['even backslashes before closing label', String.raw`[label\\](url)`],
  ['image', '![alt](image.png)'],
  ['outer link containing a link', '[[inner](inner-url)](outer-url)'],
  ['empty label and target', '[]()'],
  ['multiline existing link', '[first\nsecond](url)'],
];

for (const [name, link] of links) {
  test('recognizes ' + name + ' and respects selection boundaries', () => {
    const text = 'before ' + link + ' after';
    const start = 7;
    const end = start + link.length;
    assertProtectedRanges(text, [{ start, end }]);
    assert.equal(utils.selectionIntersectsLink(text, 0, start), false);
    assert.equal(utils.selectionIntersectsLink(text, end, text.length), false);
    assert.equal(utils.selectionIntersectsLink(text, 0, text.length), true);
  });
}

test('skips escaped opening delimiters and distinguishes escaped image markers', () => {
  assertProtectedRanges(String.raw`\[label](url)`, []);
  assertProtectedRanges(String.raw`\\[label](url)`, [{ start: 2, end: 14 }]);
  assertProtectedRanges(String.raw`\![alt](url)`, [{ start: 2, end: 12 }]);
  assertProtectedRanges(String.raw`\\![alt](url)`, [{ start: 2, end: 13 }]);
});

test('finds complete inner links when outer candidates are incomplete', () => {
  const link = '[inner](url)';
  for (const prefix of ['[unclosed ', '[broken](unclosed ', '[[[']) {
    const text = prefix + link;
    assertProtectedRanges(text, [{ start: prefix.length, end: text.length }]);
  }
  assertProtectedRanges('[outer [inner](url)]', [{ start: 7, end: 19 }]);
});

test('finds separate links and leaves gaps unprotected', () => {
  const text = '[a](b) gap ![c](d)';
  assertProtectedRanges(text, [
    { start: 0, end: 6 },
    { start: 11, end: 18 },
  ]);
  assert.equal(utils.selectionIntersectsLink(text, 6, 11), false);
  assert.equal(utils.selectionIntersectsLink(text, 11, 12), true);
});

test('handles long incomplete brackets, targets and backslash runs', () => {
  assert.equal(utils.selectionIntersectsLink('['.repeat(100000), 0, 1), false);
  assert.equal(utils.selectionIntersectsLink('[a]('.repeat(25000), 0, 1), false);
  const text = '[' + '\\'.repeat(100000) + '](url)';
  assert.equal(utils.selectionIntersectsLink(text, 0, 1), true);
  assert.equal(utils.selectionIntersectsLink(text, text.length - 1, text.length), true);
});

function paste(text, start, end, clipboard = 'https://example.com', defaultPrevented = false) {
  const inserted = [];
  let prevented = false;
  let clipboardReads = 0;
  handlePaste(
    {
      defaultPrevented,
      clipboardData: {
        getData() {
          clipboardReads++;
          return clipboard;
        },
      },
      preventDefault() {
        prevented = true;
      },
    },
    {
      el: { value: text },
      getSelectionRange: () => [start, end],
      insertBetween: (...args) => inserted.push(args),
    }
  );
  return { inserted, prevented, clipboardReads };
}

test('turns a single-line selection into a link and escapes the label', () => {
  assert.deepEqual(paste('hello', 0, 5, ' https://example.com '), {
    inserted: [[0, 5, '[hello](https://example.com)']],
    prevented: true,
    clipboardReads: 1,
  });
  const label = String.raw`a[b]\c`;
  assert.deepEqual(paste(label, 0, label.length).inserted, [
    [0, label.length, String.raw`[a\[b\]\\c](https://example.com)`],
  ]);
});

test('ignores cancelled paste, empty selection and multiline selection before reading clipboard', () => {
  for (const result of [paste('hello', 0, 5, 'https://example.com', true), paste('hello', 2, 2), paste('a\nb', 0, 3)]) {
    assert.deepEqual(result, { inserted: [], prevented: false, clipboardReads: 0 });
  }
});

test('leaves ordinary text, empty clipboard and blocked schemes to native paste', () => {
  for (const clipboard of ['', 'ordinary text', 'javascript:alert(1)', 'data:text/plain,hi', 'vbscript:msgbox(1)']) {
    const result = paste('hello', 0, 5, clipboard);
    assert.deepEqual(result.inserted, []);
    assert.equal(result.prevented, false);
  }
});

test('does not wrap existing links or images again', () => {
  for (const text of ['[hello](url)', '![hello](image.png)']) {
    const result = paste(text, 0, text.length);
    assert.deepEqual(result.inserted, []);
    assert.equal(result.prevented, false);
  }
});

const plainLinks = [
  'https://www.jetbrains.com/zh-cn/help/idea/markdown.html',
  'https://jetbrains.com/zh-cn/help/idea/markdown.html',
  'www.jetbrains.com/zh-cn/help/idea/markdown.html',
  'http://jetbrains.com/zh-cn/help/idea/markdown.html',
  'HTTPS://JETBRAINS.COM/zh-cn/help/idea/markdown.html',
  'WWW.JETBRAINS.COM/zh-cn/help/idea/markdown.html',
];

for (const link of plainLinks) {
  test('does not wrap any part of the plain link ' + link, () => {
    const text = 'before ' + link + ' after';
    const start = 7;
    const end = start + link.length;
    assertProtectedRanges(text, [{ start, end }]);
    for (const [from, to] of [
      [start, end],
      [start + 10, start + 15],
      [end - 13, end],
      [0, end],
      [start, text.length],
    ]) {
      const result = paste(text, from, to);
      assert.deepEqual(result.inserted, []);
      assert.equal(result.prevented, false);
    }
    assert.equal(paste(text, 0, 6).prevented, true);
    assert.equal(paste(text, end + 1, text.length).prevented, true);
  });
}

test('still wraps bare domains and their path fragments without a supported prefix', () => {
  const text = 'jetbrains.com/zh-cn/help/idea/markdown.html';
  assertProtectedRanges(text, []);
  for (const [start, end] of [
    [0, text.length],
    [0, 9],
    [text.length - 13, text.length],
  ]) {
    const result = paste(text, start, end);
    assert.equal(result.prevented, true);
    assert.deepEqual(result.inserted, [[start, end, '[' + text.slice(start, end) + '](https://example.com)']]);
  }
});

test('keeps URL wrappers and sentence punctuation outside protected selections', () => {
  const link = 'https://jetbrains.com/docs/a(b)';
  for (const [prefix, suffix] of [
    ['(', ').'],
    ['<', '>'],
    ['"', '"'],
    ['[', ']'],
    ['参考：', '，继续'],
  ]) {
    const text = prefix + link + suffix;
    assertProtectedRanges(text, [{ start: prefix.length, end: prefix.length + link.length }]);
  }
});

test('ignores incomplete URLs and www inside other tokens', () => {
  for (const text of [
    'https://',
    'www.',
    'www./path',
    'https://?',
    'notwww.jetbrains.com/path',
    'user@www.jetbrains.com',
  ]) {
    assertProtectedRanges(text, []);
    assert.equal(paste(text, 0, text.length).prevented, true);
  }
});

test('checks plain links after unrelated Markdown links without protecting the gap', () => {
  const text = '[label](url) gap https://jetbrains.com/path after';
  const start = text.indexOf('https://');
  const end = text.indexOf(' after');
  assert.equal(utils.selectionIntersectsLink(text, start + 8, end), true);
  assert.equal(utils.selectionIntersectsLink(text, 12, start), false);
});
