import { escapeAttr, escapeHtml } from './escape';

export interface JiraIssue {
  key: string;
  summary: string;
  browseUrl: string;
}

/**
 * Most visible characters a copied link label may have, including the ellipsis.
 */
export const MAX_LABEL_LENGTH = 80;

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/**
 * Link label: `ABC-123: Summary`, or just the key when summary is empty.
 * A label longer than `MAX_LABEL_LENGTH` visible characters is cut and ends with `…`.
 */
export function formatLinkLabel(issue: JiraIssue): string {
  const summary = issue.summary.trim();
  const label = summary ? `${issue.key}: ${summary}` : issue.key;
  const parts = Array.from(graphemes.segment(label), (part) => part.segment);
  if (parts.length <= MAX_LABEL_LENGTH) {
    return label;
  }
  // Count by grapheme so the cut never splits an emoji or a combining mark.
  return `${parts
    .slice(0, MAX_LABEL_LENGTH - 1)
    .join('')
    .trimEnd()}…`;
}

/**
 * Visible label only. Apps that paste as plain text use this, with no hyperlink.
 */
export function formatPlainText(issue: JiraIssue): string {
  return formatLinkLabel(issue);
}

/**
 * HTML anchor for apps that paste rich text.
 */
export function formatHtml(issue: JiraIssue): string {
  const label = formatLinkLabel(issue);
  return `<a href="${escapeAttr(issue.browseUrl)}">${escapeHtml(label)}</a>`;
}
