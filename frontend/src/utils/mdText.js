/* Extract plain text from markdown — used for copy-to-clipboard */

export function stripMarkdown(md) {
  return String(md ?? '')
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, ''))
    .replace(/\*\*/g, '')
    .replace(/^#{2,4}\s+/gm, '')
}
