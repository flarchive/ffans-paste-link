// oxfmt-ignore
export function escapeLinkLabel(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

const blockedSchemes = new Set(['javascript', 'data', 'vbscript']);

export function isLinkTarget(value: string): boolean {
  const text = value.trim();

  const match = text.match(/^([a-z][a-z0-9+.-]*):/i);

  if (!match) {
    return false;
  }

  const scheme = match[1].toLowerCase();

  return !blockedSchemes.has(scheme);
}

export function selectionIntersectsLink(text: string, selectionStart: number, selectionEnd: number): boolean {
  if (selectionIntersectsPlainLink(text, selectionStart, selectionEnd)) return true;

  for (const link of iterateInlineLinks(text)) {
    if (link.start >= selectionEnd) return false;
    if (selectionStart < link.end) return true;
  }

  return false;
}

function selectionIntersectsPlainLink(text: string, selectionStart: number, selectionEnd: number): boolean {
  const pattern = /(^|[^\w@./-])((?:https?:\/\/|www\.)[^\s<>"'`\[\]{}，。！？；：]+)/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    const start = match.index + match[1].length;
    if (start >= selectionEnd) return false;

    // Keep balanced parentheses in URL paths, but leave surrounding punctuation outside.
    const candidate = match[2];
    let parentheses = 0;
    for (const character of candidate) {
      if (character === '(') parentheses++;
      else if (character === ')') parentheses--;
    }

    let end = candidate.length;
    while (end > 0) {
      const character = candidate[end - 1];
      if (/[.,!?;:]/.test(character)) end--;
      else if (character === ')' && parentheses < 0) {
        parentheses++;
        end--;
      } else break;
    }

    if (selectionStart >= start + end) continue;

    const target = candidate.slice(0, end);
    const hasWwwPrefix = /^www\./i.test(target);
    try {
      const url = new URL(hasWwwPrefix ? 'https://' + target : target);
      if (url.hostname && (!hasWwwPrefix || url.hostname.length > 4)) return true;
    } catch {
      // Incomplete or invalid URLs do not protect ordinary selected text.
    }
  }

  return false;
}

interface MarkdownLinkRange {
  start: number;
  end: number;
}

function isEscaped(text: string, index: number): boolean {
  let backslashes = 0;

  for (let i = index - 1; i >= 0 && text[i] === '\\'; i--) {
    backslashes++;
  }

  return backslashes % 2 === 1;
}

function* iterateInlineLinks(text: string): Generator<MarkdownLinkRange> {
  if (!text.includes('[')) return;

  const closingDelimiters = new Map<number, number>();
  const brackets: number[] = [];
  const parentheses: number[] = [];

  // Pair each delimiter once, including those inside incomplete link candidates.
  // Skipping escaped characters also avoids rescanning long backslash runs.
  for (let i = 0; i < text.length; i++) {
    const character = text[i];

    if (character === '\\') {
      i++;
      continue;
    }

    if (character === '[') brackets.push(i);
    else if (character === '(') parentheses.push(i);
    else if (character === ']' || character === ')') {
      const start = (character === ']' ? brackets : parentheses).pop();
      if (start !== undefined) closingDelimiters.set(start, i);
    }
  }

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\\') {
      i++;
      continue;
    }

    if (text[i] !== '[') continue;

    const labelEnd = closingDelimiters.get(i);
    if (labelEnd === undefined || text[labelEnd + 1] !== '(') continue;

    const targetEnd = closingDelimiters.get(labelEnd + 1);
    if (targetEnd === undefined) continue;

    const start = i > 0 && text[i - 1] === '!' && !isEscaped(text, i - 1) ? i - 1 : i;
    yield { start, end: targetEnd + 1 };

    // Preserve the first complete outer link and skip any links inside it.
    i = targetEnd;
  }
}
