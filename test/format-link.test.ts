import { formatHtml, formatLinkLabel, formatPlainText } from '../src/lib/format-link';
import { escapeHtml } from '../src/lib/escape';

const issue = {
  key: 'ABC-12',
  summary: 'Reset password flow',
  browseUrl: 'https://jira.example.com/browse/ABC-12',
};

describe('formatLinkLabel', () => {
  it('joins key and summary', () => {
    expect(formatLinkLabel(issue)).toBe('ABC-12: Reset password flow');
  });

  it('uses the key when summary is blank', () => {
    expect(formatLinkLabel({ ...issue, summary: '  ' })).toBe('ABC-12');
  });
});

describe('formatPlainText', () => {
  it('returns the visible label with no hyperlink', () => {
    expect(formatPlainText(issue)).toBe('ABC-12: Reset password flow');
  });

  it('does not wrap a summary with brackets as a markdown link', () => {
    expect(formatPlainText({ ...issue, summary: 'Fix [beta] flag' })).toBe(
      'ABC-12: Fix [beta] flag',
    );
  });
});

describe('formatHtml', () => {
  it('returns an anchor tag', () => {
    expect(formatHtml(issue)).toBe(
      '<a href="https://jira.example.com/browse/ABC-12">ABC-12: Reset password flow</a>',
    );
  });

  it('escapes HTML in the summary', () => {
    expect(formatHtml({ ...issue, summary: 'A <b>bold</b> fix' })).toBe(
      '<a href="https://jira.example.com/browse/ABC-12">ABC-12: A &lt;b&gt;bold&lt;/b&gt; fix</a>',
    );
  });
});

describe('escape helpers', () => {
  it('escapes HTML entities', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });
});
