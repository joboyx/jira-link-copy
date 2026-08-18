import { escapeAttr, escapeHtml } from './escape';

export interface JiraIssue {
  key: string;
  summary: string;
  browseUrl: string;
}

/**
 * Link label: `ABC-123: Summary`, or just the key when summary is empty.
 */
export function formatLinkLabel(issue: JiraIssue): string {
  const summary = issue.summary.trim();
  if (!summary) {
    return issue.key;
  }
  return `${issue.key}: ${summary}`;
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
