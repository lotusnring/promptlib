export function matchesSearch(prompt: { title: string; content: string }, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return prompt.title.toLowerCase().includes(q) || prompt.content.toLowerCase().includes(q);
}
