export function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{(.+?)\}\}/g) || [];
  return [...new Set(matches.map(m => m.slice(2, -2).trim()))];
}

export function replaceVariables(content: string, values: Record<string, string>): string {
  return content.replace(/\{\{(.+?)\}\}/g, (match, name) => {
    const trimmed = name.trim();
    return values[trimmed] !== undefined ? values[trimmed] : match;
  });
}
