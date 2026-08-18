import type { JiraIssue } from './format-link';
import { formatHtml, formatPlainText } from './format-link';

/**
 * Writes a rich HTML link and a plain-text label to the clipboard.
 */
export async function copyIssueLink(issue: JiraIssue): Promise<void> {
  const html = formatHtml(issue);
  const text = formatPlainText(issue);

  if (canWriteClipboardItems()) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ]);
      return;
    } catch {
      fallbackCopy(text);
      return;
    }
  }

  fallbackCopy(text);
}

function canWriteClipboardItems(): boolean {
  return typeof ClipboardItem !== 'undefined' && typeof navigator.clipboard?.write === 'function';
}

function fallbackCopy(text: string): void {
  const el = document.createElement('textarea');
  el.value = text;
  el.setAttribute('readonly', '');
  el.style.position = 'fixed';
  el.style.left = '-9999px';
  document.body.append(el);
  el.select();
  const ok = document.execCommand('copy');
  el.remove();
  if (!ok) {
    throw new Error('Clipboard write failed');
  }
}
