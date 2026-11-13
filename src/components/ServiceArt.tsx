/**
 * Composiciones visuales simples para las tarjetas de servicios (SVG en línea, sin imágenes externas).
 * Decorativas: el título de cada tarjeta ya describe el servicio, por eso van ocultas a lectores de pantalla.
 */

const N = '#0B1930' // azul principal
const T = '#C4938E' // rosado apagado (detalles)
const W = '#FFFFFF'

type Kind = 'code' | 'layers' | 'cpu' | 'zap'

/** Páginas web: ventana de navegador con una página sencilla. */
function Website() {
  return <>
    <rect x="40" y="20" width="240" height="132" rx="10" fill={W} stroke={N} strokeOpacity=".16" />
    <path d="M40 42h240" stroke={N} strokeOpacity=".1" />
    <circle cx="54" cy="31" r="3" fill={T} />
    <circle cx="64" cy="31" r="3" fill={N} fillOpacity=".18" />
    <circle cx="74" cy="31" r="3" fill={N} fillOpacity=".18" />
    <rect x="96" y="26" width="128" height="10" rx="5" fill={N} fillOpacity=".06" />
    {/* navegación */}
    <rect x="56" y="54" width="26" height="6" rx="3" fill={N} />
    <rect x="198" y="55" width="16" height="4" rx="2" fill={N} fillOpacity=".25" />
    <rect x="220" y="55" width="16" height="4" rx="2" fill={N} fillOpacity=".25" />
    <rect x="242" y="55" width="22" height="4" rx="2" fill={T} />
    {/* portada */}
    <rect x="56" y="76" width="104" height="9" rx="4" fill={N} />
    <rect x="56" y="90" width="76" height="9" rx="4" fill={N} />
    <rect x="56" y="108" width="98" height="4" rx="2" fill={N} fillOpacity=".2" />
    <rect x="56" y="116" width="80" height="4" rx="2" fill={N} fillOpacity=".2" />
    <rect x="56" y="128" width="46" height="12" rx="6" fill={T} />
    <rect x="180" y="72" width="84" height="66" rx="8" fill={N} fillOpacity=".06" />
    <path d="M190 128l18-20 14 14 10-9 22 15" fill="none" stroke={N} strokeOpacity=".3" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="246" cy="88" r="6" fill={T} fillOpacity=".8" />
  </>
}

/** Aplicaciones web: interfaz de reservas con calendario y horarios. */
function Booking() {
  const cells = []
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
    const x = 52 + c * 18
    const y = 56 + r * 18
    const selected = r === 1 && c === 3
    const today = r === 1 && c === 1
    cells.push(<rect key={`${r}-${c}`} x={x} y={y} width="13" height="13" rx="3.5"
      fill={selected ? T : today ? W : N} fillOpacity={selected || today ? 1 : 0.07}
      stroke={today ? N : 'none'} strokeOpacity=".5" />)
  }
  return <>
    <rect x="36" y="20" width="248" height="132" rx="10" fill={W} stroke={N} strokeOpacity=".16" />
    <rect x="52" y="34" width="56" height="7" rx="3.5" fill={N} />
    <path d="M160 34l-4 3.5 4 3.5M170 34l4 3.5-4 3.5" fill="none" stroke={N} strokeOpacity=".4" strokeWidth="1.6" strokeLinecap="round" />
    {cells}
    <path d="M190 34v104" stroke={N} strokeOpacity=".1" />
    <rect x="204" y="34" width="46" height="6" rx="3" fill={N} fillOpacity=".7" />
    <rect x="204" y="52" width="66" height="16" rx="8" fill={W} stroke={N} strokeOpacity=".2" />
    <rect x="204" y="74" width="66" height="16" rx="8" fill={N} />
    <rect x="216" y="80" width="26" height="4" rx="2" fill={W} />
    <rect x="204" y="96" width="66" height="16" rx="8" fill={W} stroke={N} strokeOpacity=".2" />
    <rect x="204" y="122" width="66" height="16" rx="8" fill={T} />
  </>
}

/** Sistemas a medida: panel con módulos de gestión y una tabla. */
function Dashboard() {
  const rows = [96, 113, 130]
  return <>
    <rect x="30" y="18" width="260" height="136" rx="10" fill={W} stroke={N} strokeOpacity=".16" />
    <path d="M40 18h40v136H40a10 10 0 0 1-10-10V28a10 10 0 0 1 10-10z" fill={N} />
    {[38, 54, 70, 86].map((y, i) => <rect key={y} x="40" y={y} width="30" height="6" rx="3" fill={i === 0 ? T : W} fillOpacity={i === 0 ? 1 : 0.35} />)}
    {[96, 160, 224].map((x, i) => <g key={x}>
      <rect x={x} y="30" width="54" height="34" rx="7" fill={N} fillOpacity=".05" />
      <rect x={x + 9} y="40" width={i === 1 ? 20 : 26} height="7" rx="3.5" fill={N} />
      <rect x={x + 9} y="52" width="32" height="4" rx="2" fill={N} fillOpacity=".25" />
    </g>)}
    <rect x="96" y="74" width="182" height="12" rx="4" fill={N} fillOpacity=".07" />
    {rows.map((y, i) => <g key={y}>
      <rect x="104" y={y} width="44" height="5" rx="2.5" fill={N} fillOpacity=".7" />
      <rect x="160" y={y} width="34" height="5" rx="2.5" fill={N} fillOpacity=".22" />
      <rect x="206" y={y} width="28" height="5" rx="2.5" fill={N} fillOpacity=".22" />
      <circle cx="264" cy={y + 2.5} r="4" fill={i === 1 ? T : N} fillOpacity={i === 1 ? 1 : 0.2} />
      {i < rows.length - 1 && <path d={`M96 ${y + 11}h182`} stroke={N} strokeOpacity=".07" />}
    </g>)}
  </>
}

/** Automatizaciones: formulario → procesamiento → notificación. */
function Automation() {
  const teeth = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4
    return <path key={i} d={`M${160 + Math.cos(a) * 15} ${78 + Math.sin(a) * 15}L${160 + Math.cos(a) * 20} ${78 + Math.sin(a) * 20}`} stroke={N} strokeWidth="4" strokeLinecap="round" />
  })
  return <>
    {/* conectores */}
    <path d="M100 86h22M198 86h22" stroke={N} strokeOpacity=".35" strokeWidth="2" strokeDasharray="3 4" />
    <circle cx="100" cy="86" r="3" fill={N} fillOpacity=".5" />
    <circle cx="122" cy="86" r="3" fill={N} fillOpacity=".5" />
    <circle cx="198" cy="86" r="3" fill={N} fillOpacity=".5" />
    <circle cx="220" cy="86" r="3" fill={N} fillOpacity=".5" />
    {/* 1. formulario */}
    <rect x="24" y="38" width="76" height="96" rx="10" fill={W} stroke={N} strokeOpacity=".16" />
    <rect x="36" y="52" width="34" height="5" rx="2.5" fill={N} />
    <rect x="36" y="66" width="52" height="11" rx="4" fill="none" stroke={N} strokeOpacity=".3" />
    <rect x="36" y="83" width="52" height="11" rx="4" fill="none" stroke={N} strokeOpacity=".3" />
    <rect x="36" y="104" width="32" height="11" rx="5.5" fill={N} />
    {/* 2. procesamiento */}
    <rect x="122" y="38" width="76" height="96" rx="10" fill={W} stroke={N} strokeOpacity=".16" />
    {teeth}
    <circle cx="160" cy="78" r="15" fill={W} stroke={N} strokeWidth="4" />
    <circle cx="160" cy="78" r="5" fill={T} />
    <rect x="140" y="108" width="40" height="5" rx="2.5" fill={N} fillOpacity=".25" />
    <rect x="146" y="118" width="28" height="5" rx="2.5" fill={N} fillOpacity=".25" />
    {/* 3. notificación */}
    <rect x="220" y="38" width="76" height="96" rx="10" fill={W} stroke={N} strokeOpacity=".16" />
    <rect x="234" y="56" width="48" height="32" rx="8" fill={N} />
    <path d="M244 88l-4 8 12-8" fill={N} />
    <rect x="243" y="65" width="28" height="4" rx="2" fill={W} />
    <rect x="243" y="74" width="20" height="4" rx="2" fill={W} fillOpacity=".6" />
    <circle cx="282" cy="56" r="7" fill={T} stroke={W} strokeWidth="2" />
    <rect x="238" y="108" width="40" height="5" rx="2.5" fill={N} fillOpacity=".25" />
    <rect x="244" y="118" width="28" height="5" rx="2.5" fill={N} fillOpacity=".25" />
  </>
}

const ART: Record<Kind, () => JSX.Element> = { code: Website, layers: Booking, cpu: Dashboard, zap: Automation }

export default function ServiceArt({ kind }: { kind: string }) {
  const Art = ART[kind as Kind]
  if (!Art) return null
  return (
    <svg className="svc-art" viewBox="0 0 320 172" role="presentation" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
      <Art />
    </svg>
  )
}
