import type { ReactNode } from 'react'

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g

/**
 * Texto con enlaces en el formato [texto](destino). Los enlaces externos se abren en otra pestaña;
 * los internos también, si `internalInNewTab` (p. ej. dentro de un formulario, para no perder lo escrito).
 */
export default function RichText({ text, newTabLabel, internalInNewTab = false }: {
  text: string
  newTabLabel: string
  internalInNewTab?: boolean
}) {
  const parts: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(LINK)) {
    const [whole, label, href] = match
    const start = match.index ?? 0
    if (start > last) parts.push(text.slice(last, start))
    const external = /^https?:/.test(href)
    const newTab = external || (internalInNewTab && href.startsWith('/'))
    parts.push(newTab
      ? <a key={start} href={href} target="_blank" rel="noopener noreferrer">{label}<span className="sr-only"> ({newTabLabel})</span></a>
      : <a key={start} href={href}>{label}</a>)
    last = start + whole.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}
