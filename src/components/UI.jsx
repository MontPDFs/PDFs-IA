const AC = '#FF6B00'

export function Btn({ children, onClick, variant = 'primary', fullWidth, style = {}, disabled }) {
  const base = {
    padding: '11px 22px', borderRadius: 10, fontWeight: 700,
    fontSize: 14, cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', transition: 'all .15s', width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1, ...style,
  }
  const variants = {
    primary: { background: AC, color: '#000' },
    secondary: { background: '#1e1e1e', color: '#fff', border: '1px solid #333' },
    ghost: { background: 'transparent', color: '#888', border: '1px solid #333' },
    purple: { background: '#a855f7', color: '#fff' },
  }
  return <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>{children}</button>
}

export function Tag({ children, color = AC }) {
  return (
    <span style={{
      display: 'inline-block', padding: '4px 12px', borderRadius: 20,
      fontSize: 10, fontWeight: 700, letterSpacing: 2,
      background: color + '22', color, border: `1px solid ${color}44`,
    }}>{children}</span>
  )
}

export function Spinner({ size = 36, color = AC }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
      <div style={{
        width: size, height: size,
        border: `3px solid #333`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
    </div>
  )
}

export function Navbar({ right }) {
  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 24px', borderBottom: '1px solid #1e1e1e',
      background: '#0a0a0a', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 34, height: 34, background: AC, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>📄</div>
        <div>
          <span style={{ fontWeight: 900, fontSize: 15, color: '#fff' }}>MVP</span>
          <span style={{ fontWeight: 900, fontSize: 15, color: AC }}> PDFs</span>
          <span style={{ color: '#555', fontSize: 11, marginLeft: 6 }}>IA</span>
        </div>
      </a>
      {right && <div>{right}</div>}
    </nav>
  )
}
