/** Jira issue keys look like ABC-123. */
export const ISSUE_KEY_PATTERN = /\b([A-Z][A-Z0-9]+-\d+)\b/;

/**
 * Returns the first Jira issue key in `text`, or null.
 */
export function findIssueKey(text: string | null | undefined): string | null {
  if (!text) {
    return null;
  }
  const match = ISSUE_KEY_PATTERN.exec(text);
  return match?.[1] ?? null;
}
