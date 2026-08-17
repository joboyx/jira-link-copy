import { escapeAttr, escapeHtml, escapeMarkdownLabel } from './escape';

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
 * Markdown link for editors that paste plain text.
 */
export function formatPlainText(issue: JiraIssue): string {
  const label = escapeMarkdownLabel(formatLinkLabel(issue));
  return `[${label}](${issue.browseUrl})`;
}

/**
 * HTML anchor for apps that paste rich text.
 */
export function formatHtml(issue: JiraIssue): string {
  const label = formatLinkLabel(issue);
  return `<a href="${escapeAttr(issue.browseUrl)}">${escapeHtml(label)}</a>`;
}
