import {
  MAX_LABEL_LENGTH,
  formatHtml,
  formatLinkLabel,
  formatPlainText,
} from '../src/lib/format-link';
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

describe('label length cap', () => {
  // 'ABC-12: ' is 8 characters, so a summary of n characters gives a label of n + 8.
  const withSummaryLength = (n: number, fill = 'x') => ({ ...issue, summary: fill.repeat(n) });

  it('keeps a label of exactly 80 characters', () => {
    const label = formatLinkLabel(withSummaryLength(72));
    expect(label).toHaveLength(MAX_LABEL_LENGTH);
    expect(label).toBe(`ABC-12: ${'x'.repeat(72)}`);
  });

  it('cuts a label of 81 characters to 80 and ends with one ellipsis', () => {
    const label = formatLinkLabel(withSummaryLength(73));
    expect(label).toHaveLength(MAX_LABEL_LENGTH);
    expect(label.endsWith('…')).toBe(true);
    expect(label.endsWith('...')).toBe(false);
    expect(label.startsWith(`ABC-12: ${'x'.repeat(71)}`)).toBe(true);
  });

  it('puts the same cut label in plain text and HTML, and keeps the full href', () => {
    const long = { ...issue, summary: 'word '.repeat(40) };
    const label = formatLinkLabel(long);
    expect(label.length).toBeLessThanOrEqual(MAX_LABEL_LENGTH);
    expect(label.endsWith('…')).toBe(true);
    expect(formatPlainText(long)).toBe(label);
    expect(formatHtml(long)).toBe(`<a href="https://jira.example.com/browse/ABC-12">${label}</a>`);
  });

  it('leaves no space before the ellipsis when the cut falls after a space', () => {
    // The first 79 characters end with a space: 'ABC-12: ' + 70 x + ' ' + 'y'.
    const label = formatLinkLabel({ ...issue, summary: `${'x'.repeat(70)} ${'y'.repeat(10)}` });
    expect(label).toBe(`ABC-12: ${'x'.repeat(70)}…`);
  });

  it('does not split an emoji at the cut', () => {
    // Each family emoji is one visible character made of several code points.
    const family = '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}';
    const label = formatLinkLabel({ ...issue, summary: family.repeat(80) });
    expect([
      ...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(label),
    ]).toHaveLength(MAX_LABEL_LENGTH);
    expect(label).toBe(`ABC-12: ${family.repeat(71)}…`);
  });

  it('does not split a combining mark from its base letter', () => {
    const accented = 'e\u0301';
    const label = formatLinkLabel({ ...issue, summary: accented.repeat(80) });
    expect(label).toBe(`ABC-12: ${accented.repeat(71)}…`);
  });

  it('cuts before HTML escaping, so entities are not cut or counted', () => {
    // 'ABC-12: ' + 70 '&' + 'z' + 'tail' is 83 characters, so the cut keeps 79 characters.
    const html = formatHtml({ ...issue, summary: `${'&'.repeat(70)}ztail` });
    expect(html).toBe(
      `<a href="https://jira.example.com/browse/ABC-12">ABC-12: ${'&amp;'.repeat(70)}z…</a>`,
    );
  });

  it('escapes a < near the cut as a whole entity', () => {
    const html = formatHtml({ ...issue, summary: `${'x'.repeat(70)}<b>tail` });
    expect(html).toBe(
      `<a href="https://jira.example.com/browse/ABC-12">ABC-12: ${'x'.repeat(70)}&lt;…</a>`,
    );
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
