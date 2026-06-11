export function extractFigmaFileKey(value) {
  const input = String(value || '').trim();
  if (!input) return '';

  try {
    const url = new URL(input);
    const match = url.pathname.match(/\/(?:file|design)\/([^/]+)/);
    if (match?.[1]) return match[1];
  } catch (_) {
    // Not a full URL, continue with regex fallback.
  }

  const match = input.match(/figma\.com\/(?:file|design)\/([^/?#]+)/);
  return match?.[1] || input;
}

export function normalizeFigmaNodeId(value) {
  const input = String(value || '').trim();
  if (!input) return '';

  const nodeParamMatch = input.match(/[?&]node-id=([^&#]+)/);
  const rawNodeId = nodeParamMatch?.[1] || input;

  return decodeURIComponent(rawNodeId)
    .replace(/-/g, ':')
    .replace(/^node-id=/, '')
    .trim();
}

export function parseFigmaNodes(text) {
  return String(text || '')
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split(/\s+/);
      const id = normalizeFigmaNodeId(parts[0]);
      const name = parts.slice(1).join(' ').trim() || `banner_${index + 1}`;

      return {
        id,
        name,
        scale: 1
      };
    })
    .filter(node => node.id);
}
