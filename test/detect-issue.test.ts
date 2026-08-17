import { detectIssue, keyFromUrl, summaryFromDocument } from '../src/lib/detect-issue';

function load(html: string, title = ''): Document {
  document.body.innerHTML = html;
  document.title = title;
  return document;
}

describe('keyFromUrl', () => {
  it('reads a browse path', () => {
    expect(keyFromUrl(new URL('https://jira.example.com/browse/ABC-12'))).toBe('ABC-12');
  });

  it('reads a /jira/browse path', () => {
    expect(keyFromUrl(new URL('https://jira.example.com/jira/browse/ABC-12'))).toBe('ABC-12');
  });

  it('reads selectedIssue on a board URL', () => {
    const url = new URL(
      'https://jira.example.com/jira/software/projects/ABC/boards/1?selectedIssue=ABC-9',
    );
    expect(keyFromUrl(url)).toBe('ABC-9');
  });

  it('reads an issues path', () => {
    expect(keyFromUrl(new URL('https://jira.example.com/issues/ABC-4'))).toBe('ABC-4');
  });

  it('returns null when the URL has no issue key', () => {
    expect(
      keyFromUrl(new URL('https://jira.example.com/jira/software/projects/ABC/boards/1')),
    ).toBe(null);
  });
});

describe('detectIssue', () => {
  it('uses the browse URL and the issue heading', () => {
    const doc = load(
      `<h1 data-testid="issue.views.issue-base.foundation.summary.heading">Reset password flow</h1>`,
    );
    expect(detectIssue(doc, 'https://jira.example.com/browse/ABC-12')).toEqual({
      key: 'ABC-12',
      summary: 'Reset password flow',
      browseUrl: 'https://jira.example.com/browse/ABC-12',
    });
  });

  it('uses selectedIssue on a board and a sidebar heading', () => {
    const doc = load(
      `<h1 data-testid="issue.views.issue-base.foundation.summary.heading">Board sidebar title</h1>`,
    );
    const issue = detectIssue(
      doc,
      'https://jira.example.com/jira/software/projects/ABC/boards/7?selectedIssue=ABC-9',
    );
    expect(issue).toEqual({
      key: 'ABC-9',
      summary: 'Board sidebar title',
      browseUrl: 'https://jira.example.com/browse/ABC-9',
    });
  });

  it('uses a selected server board card when the URL has no key', () => {
    const doc = load(`
      <div class="ghx-issue ghx-selected" data-issue-key="ABC-9">
        <span class="ghx-summary">Selected card title</span>
      </div>
    `);
    expect(detectIssue(doc, 'https://jira.example.com/secure/RapidBoard.jspa')).toEqual({
      key: 'ABC-9',
      summary: 'Selected card title',
      browseUrl: 'https://jira.example.com/browse/ABC-9',
    });
  });

  it('reads the key from issue chrome when the URL has no key', () => {
    const doc = load(`
      <a data-testid="issue.views.issue-base.foundation.breadcrumbs.current-issue.item">ABC-5</a>
      <h1 data-testid="issue.views.issue-base.foundation.summary.heading">From breadcrumb page</h1>
    `);
    expect(
      detectIssue(doc, 'https://jira.example.com/jira/software/projects/ABC/boards/1'),
    ).toEqual({
      key: 'ABC-5',
      summary: 'From breadcrumb page',
      browseUrl: 'https://jira.example.com/browse/ABC-5',
    });
  });

  it('uses an aria-selected card', () => {
    const doc = load(`
      <div data-issue-key="ABC-8" aria-selected="true">
        <span data-testid="card-summary">Aria selected title</span>
      </div>
    `);
    expect(
      detectIssue(doc, 'https://jira.example.com/jira/software/projects/ABC/boards/1'),
    ).toEqual({
      key: 'ABC-8',
      summary: 'Aria selected title',
      browseUrl: 'https://jira.example.com/browse/ABC-8',
    });
  });

  it('uses a selected card aria-label when there is no summary node', () => {
    const doc = load(`
      <div class="ghx-issue ghx-selected" data-issue-key="ABC-8" aria-label="Label only card"></div>
    `);
    expect(detectIssue(doc, 'https://jira.example.com/secure/RapidBoard.jspa')).toEqual({
      key: 'ABC-8',
      summary: 'Label only card',
      browseUrl: 'https://jira.example.com/browse/ABC-8',
    });
  });

  it('reads a key from selected card text when attributes are missing', () => {
    const doc = load(`
      <div class="ghx-issue ghx-selected">ABC-11 Plain text card</div>
    `);
    expect(detectIssue(doc, 'https://jira.example.com/secure/RapidBoard.jspa')).toEqual({
      key: 'ABC-11',
      summary: 'Plain text card',
      browseUrl: 'https://jira.example.com/browse/ABC-11',
    });
  });

  it('uses the focused board card', () => {
    const doc = load(`
      <article data-testid="platform-board-kit.ui.card.card" id="focused-card" tabindex="0">
        <a href="/browse/ABC-7">ABC-7</a>
        <h3>Focused card title</h3>
      </article>
    `);
    const card = doc.getElementById('focused-card');
    card?.focus();
    expect(
      detectIssue(doc, 'https://jira.example.com/jira/software/projects/ABC/boards/1'),
    ).toEqual({
      key: 'ABC-7',
      summary: 'Focused card title',
      browseUrl: 'https://jira.example.com/browse/ABC-7',
    });
  });

  it('falls back to the document title', () => {
    const doc = load('', '[ABC-3] Title from tab - Jira');
    expect(detectIssue(doc, 'https://host.example/browse/ABC-3')).toEqual({
      key: 'ABC-3',
      summary: 'Title from tab',
      browseUrl: 'https://host.example/browse/ABC-3',
    });
  });

  it('does not copy a random board card when nothing is selected', () => {
    const doc = load(`
      <article data-testid="platform-board-kit.ui.card.card">
        <a href="/browse/ABC-1">ABC-1</a>
        <h3>First card</h3>
      </article>
      <article data-testid="platform-board-kit.ui.card.card">
        <a href="/browse/ABC-2">ABC-2</a>
        <h3>Second card</h3>
      </article>
    `);
    expect(
      detectIssue(doc, 'https://jira.example.com/jira/software/projects/ABC/boards/1'),
    ).toBeNull();
  });

  it('returns null when no issue is present', () => {
    const doc = load('<p>Not a Jira page</p>', 'Inbox');
    expect(detectIssue(doc, 'https://example.com/mail')).toBeNull();
  });

  it('returns null for an invalid URL', () => {
    expect(detectIssue(load(''), 'not a url')).toBeNull();
  });
});

describe('summaryFromDocument', () => {
  it('strips a leading key from the heading', () => {
    const doc = load(
      `<h1 data-testid="issue.views.issue-base.foundation.summary.heading">ABC-12: Reset password</h1>`,
    );
    expect(summaryFromDocument(doc, 'ABC-12')).toBe('Reset password');
  });
});
