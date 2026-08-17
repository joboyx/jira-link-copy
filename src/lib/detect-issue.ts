import { findIssueKey } from './issue-key';
import type { JiraIssue } from './format-link';

const BROWSE_PATH_PATTERN = /\/(?:jira\/)?browse\/([A-Z][A-Z0-9]+-\d+)/;
const ISSUES_PATH_PATTERN = /\/issues\/([A-Z][A-Z0-9]+-\d+)/;

const SUMMARY_SELECTORS = [
  '[data-testid="issue.views.issue-base.foundation.summary.heading"]',
  '[data-testid="issue-field-summary.ui.issue-field-summary-inline-edit--read"]',
  '#summary-val',
  'h1[data-test-id="issue.views.issue-base.foundation.summary.heading"]',
];

/**
 * Finds the Jira issue on a browse page or a board with a selected/focused card.
 */
export function detectIssue(doc: Document, pageUrl: string): JiraIssue | null {
  const url = parseUrl(pageUrl);
  if (!url) {
    return null;
  }

  const key =
    keyFromUrl(url) ??
    keyFromSelectedCard(doc) ??
    keyFromIssueChrome(doc) ??
    findIssueKey(doc.title);
  if (!key) {
    return null;
  }

  const summary = summaryFromDocument(doc, key);
  return {
    key,
    summary,
    browseUrl: `${url.origin}/browse/${key}`,
  };
}

/**
 * Reads an issue key from browse/issues paths or a `selectedIssue` query param.
 */
export function keyFromUrl(url: URL): string | null {
  const selected = findIssueKey(url.searchParams.get('selectedIssue'));
  if (selected) {
    return selected;
  }

  const browse = BROWSE_PATH_PATTERN.exec(url.pathname);
  if (browse?.[1]) {
    return browse[1];
  }

  const issues = ISSUES_PATH_PATTERN.exec(url.pathname);
  if (issues?.[1]) {
    return issues[1];
  }

  return null;
}

/**
 * Picks a human title from the issue view, selected card, or document title.
 */
export function summaryFromDocument(doc: Document, key: string): string {
  const fromHeading = firstText(doc, SUMMARY_SELECTORS);
  if (fromHeading) {
    return stripKey(fromHeading, key);
  }

  const selected = selectedCard(doc);
  const fromCard =
    firstTextIn(selected, ['.ghx-summary', '[data-testid*="summary"]', 'h3', 'h2']) ??
    selected?.getAttribute('aria-label') ??
    selected?.textContent?.replace(/\s+/g, ' ').trim();
  if (fromCard) {
    return stripKey(fromCard, key);
  }

  return stripKey(cleanDocumentTitle(doc.title), key);
}

function parseUrl(pageUrl: string): URL | null {
  try {
    return new URL(pageUrl);
  } catch {
    return null;
  }
}

function keyFromSelectedCard(doc: Document): string | null {
  const card = selectedCard(doc);
  return keyFromElement(card);
}

function selectedCard(doc: Document): Element | null {
  return (
    doc.querySelector('.ghx-issue.ghx-selected') ??
    doc.querySelector('[data-issue-key].ghx-selected') ??
    doc.querySelector('[data-issue-key][aria-selected="true"]') ??
    doc.querySelector('[data-issue-key][data-selected="true"]') ??
    closestIssueNode(doc.activeElement)
  );
}

function keyFromIssueChrome(doc: Document): string | null {
  const breadcrumb = firstText(doc, [
    '[data-testid="issue.views.issue-base.foundation.breadcrumbs.current-issue.item"]',
    '[data-testid="issue-navigator.ui.issue-results.detail-view.issue-header"]',
  ]);
  return findIssueKey(breadcrumb);
}

function closestIssueNode(start: Element | null): Element | null {
  if (!start) {
    return null;
  }
  return start.closest(
    '[data-issue-key], .ghx-issue, [data-testid*="card.card"], [data-testid*="board-ticket"]',
  );
}

function keyFromElement(el: Element | null): string | null {
  if (!el) {
    return null;
  }
  return (
    findIssueKey(el.getAttribute('data-issue-key')) ??
    findIssueKey(el.querySelector('a[href*="/browse/"]')?.getAttribute('href')) ??
    findIssueKey(el.textContent)
  );
}

function firstText(doc: Document, selectors: string[]): string | null {
  for (const selector of selectors) {
    const text = doc.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
    if (text) {
      return text;
    }
  }
  return null;
}

function firstTextIn(root: Element | null, selectors: string[]): string | null {
  if (!root) {
    return null;
  }
  for (const selector of selectors) {
    const text = root.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
    if (text) {
      return text;
    }
  }
  return null;
}

function cleanDocumentTitle(title: string): string {
  return title.replace(/\s+-\s+Jira(?:\s+Cloud)?\s*$/i, '').trim();
}

function stripKey(text: string, key: string): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  const withoutBrackets = trimmed.replace(new RegExp(`^\\[?${key}\\]?:?\\s*`, 'i'), '').trim();
  return withoutBrackets;
}
