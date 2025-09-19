/**
 * Utility functions for text processing
 */

/**
 * Strips HTML tags from a string and returns plain text
 * @param html - The HTML string to strip tags from
 * @returns Plain text without HTML tags
 */
export const stripHtmlTags = (html: string | undefined | null): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length of the text
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string | undefined | null, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Strips HTML tags and truncates text
 * @param html - The HTML string to process
 * @param maxLength - Maximum length of the resulting text
 * @returns Plain text, truncated if necessary
 */
export const stripAndTruncate = (html: string | undefined | null, maxLength: number): string => {
  const plainText = stripHtmlTags(html);
  return truncateText(plainText, maxLength);
};
