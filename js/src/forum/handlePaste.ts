import BasicEditorDriver from 'flarum/common/utils/BasicEditorDriver';

import { escapeLinkLabel, isLinkTarget, selectionIntersectsLink } from './utils';

export function handlePaste(event: ClipboardEvent, editor: BasicEditorDriver) {
  // console.log('[event]', event);

  if (event.defaultPrevented) {
    return;
  }

  // not selected
  const [start, end] = editor.getSelectionRange();
  // console.log('[start, end]', start, end);
  if (start === end) {
    return;
  }

  const value = editor.el.value;
  const selected = value.slice(start, end);
  if (!selected || selected.includes('\n')) {
    return;
  }

  const pasted = event.clipboardData?.getData('text/plain');
  if (!pasted) return;

  const url = pasted.trim();
  // console.log('[url]', url);
  if (!isLinkTarget(url)) {
    return;
  }

  // no wrap again
  if (selectionIntersectsLink(value, start, end)) {
    return;
  }

  event.preventDefault();

  const label = escapeLinkLabel(selected);
  // console.log('[label]', label);

  editor.insertBetween(start, end, `[${label}](${url})`);
}
