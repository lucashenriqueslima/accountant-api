// Sanitização mínima de HTML para conteúdo rich text criado por usuários internos.
// Remove tags perigosas, handlers de evento (on*) e URLs javascript:.
const FORBIDDEN_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'form'];

export function sanitizeHtml(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;

  const elements = Array.from(template.content.querySelectorAll('*'));
  for (const el of elements) {
    if (FORBIDDEN_TAGS.includes(el.tagName.toLowerCase())) {
      el.remove();
      continue;
    }
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();
      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
      } else if ((name === 'href' || name === 'src') && /^javascript:/i.test(value)) {
        el.removeAttribute(attr.name);
      }
    }
  }

  return template.innerHTML;
}

// Texto puro (sem tags) — útil para checar se o conteúdo está vazio.
export function htmlToText(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;
  return (template.content.textContent ?? '').trim();
}
