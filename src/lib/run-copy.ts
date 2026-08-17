import { copyIssueLink } from './clipboard';
import { detectIssue } from './detect-issue';
import { formatLinkLabel } from './format-link';
import { showToast } from './toast';

/**
 * Detects the Jira issue on this tab, copies a formatted link, and shows a card.
 */
export async function copyCurrentIssue(): Promise<void> {
  const issue = detectIssue(document, location.href);
  if (!issue) {
    showToast({
      kind: 'error',
      kicker: 'Not found',
      title: 'No Jira issue on this page',
      body: 'Open an issue, or select a card on a board.',
    });
    return;
  }

  try {
    await copyIssueLink(issue);
  } catch {
    showToast({
      kind: 'error',
      kicker: 'Copy failed',
      title: 'Could not write to the clipboard',
    });
    return;
  }

  showToast({
    kind: 'success',
    kicker: 'Copied',
    title: formatLinkLabel(issue),
    body: issue.browseUrl,
  });
}
