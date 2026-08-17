import { findIssueKey } from '../src/lib/issue-key';

describe('findIssueKey', () => {
  it('extracts a key from surrounding text', () => {
    expect(findIssueKey('See ABC-12 for details')).toBe('ABC-12');
  });

  it('returns null for empty input', () => {
    expect(findIssueKey(null)).toBeNull();
    expect(findIssueKey('')).toBeNull();
    expect(findIssueKey('no ticket here')).toBeNull();
  });
});
