export function getImageUrl(pathOrUrl?: string|null) {
  if (!pathOrUrl) return undefined;
  const s = String(pathOrUrl).trim();
  // If already an absolute URL, return as-is
  if (/^https?:\/\//i.test(s)) return s;
  // If it already contains uploads/question-images as a prefix, remove leading slash to avoid duplicate
  const clean = s.replace(/^\/?uploads\/question-images\//i, '');
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3002';
  return `${base}/uploads/question-images/${clean}`;
}
