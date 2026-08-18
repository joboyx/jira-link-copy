/**
 * Escapes text for HTML body content.
 */
export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Escapes a URL for use in an HTML attribute.
 */
export function escapeAttr(text: string): string {
  return escapeHtml(text);
}
