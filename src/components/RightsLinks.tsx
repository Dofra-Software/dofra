import { PATHS, pageFromPath } from '../routes'
import type { LegalLocale } from '../legal/types'

/**
 * Botones de la Disposición 954/2025 con su denominación exacta en español; en inglés y francés suman una
 * explicación para lectores de pantalla. `className` define la ubicación (ver styles.css, «Botones legales»).
 */
export default function RightsLinks({ labels, className }: { labels: LegalLocale['footer']; className: string }) {
  const page = pageFromPath(window.location.pathname)
  const link = (id: 'withdrawal' | 'cancellation', label: string, hint?: string) =>
    <a href={PATHS[id]} aria-current={page === id ? 'page' : undefined}>
      <span lang="es">{label}</span>{hint && <span className="sr-only"> ({hint})</span>}
    </a>
  return <nav className={`rights-links ${className}`} aria-label={labels.requestsLabel}>
    {link('withdrawal', labels.withdrawal, labels.withdrawalHint)}
    {link('cancellation', labels.cancellation, labels.cancellationHint)}
  </nav>
}
