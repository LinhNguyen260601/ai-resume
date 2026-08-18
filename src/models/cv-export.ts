export function toPdfFilename(title: string): string {
  const slug = title
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, ' ')
  return `${slug || 'CV'}.pdf`
}
