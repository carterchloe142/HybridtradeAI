"use client"
import useSWR from 'swr'
import { useMemo, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

function Inline({ text }: { text: string }) {
  const nodes = useMemo(() => {
    const out: (string | ReactNode)[] = []
    let i = 0
    const s = text
    const patterns = [
      { re: /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, build: (m: RegExpExecArray) => <a key={`a-${m.index}`} href={m[2]} target="_blank" rel="noopener noreferrer" className="underline">{m[1]}</a> },
      { re: /\*\*([^*]+)\*\*/g, build: (m: RegExpExecArray) => <strong key={`b-${m.index}`}>{m[1]}</strong> },
      { re: /\*([^*]+)\*/g, build: (m: RegExpExecArray) => <em key={`i-${m.index}`}>{m[1]}</em> },
      {re: /`([^`]+)`/g, build: (m: RegExpExecArray) => <code key={`c-${m.index}`} className="px-1 bg-muted rounded text-foreground">{m[1]}</code> },
    ]
    function nextMatch(start: number) {
      let best: { m: RegExpExecArray; build: (m: RegExpExecArray) => ReactNode } | null = null
      for (const p of patterns) {
        p.re.lastIndex = start
        const m = p.re.exec(s)
        if (m && (best === null || m.index < best.m.index)) best = { m, build: p.build }
      }
      return best
    }
    while (i < s.length) {
      const nm = nextMatch(i)
      if (!nm) { out.push(s.slice(i)); break }
      if (nm.m.index > i) out.push(s.slice(i, nm.m.index))
      out.push(nm.build(nm.m))
      i = nm.m.index + nm.m[0].length
    }
    return out
  }, [text])
  return <>{nodes.map((n, idx) => typeof n === 'string' ? <span key={idx}>{n}</span> : <span key={idx}>{n}</span>)}</>
}

export default function GlobalBanner() {
  const { data } = useSWR('/api/settings')
  const pathname = usePathname() || ''
  const isAdmin = pathname.startsWith('/admin')
  const notice = String((data as any)?.settings?.global_notice || '')
  const maintenanceRaw = String((data as any)?.settings?.maintenance_mode || '')
  const maintenance = maintenanceRaw === 'true' || maintenanceRaw === '1'
  const blocks = useMemo(() => (notice || '').split(/\r?\n/), [notice])

  return (
    <>
      {!isAdmin && notice && (
        <div className="w-full bg-warning/10 text-warning border-b border-warning/20 py-2 px-4 text-sm">
          {(() => {
            const items: ReactNode[] = []
            let list: string[] = []
            for (let idx = 0; idx < blocks.length; idx++) {
              const line = blocks[idx]
              if (/^\s*-\s+/.test(line)) {
                list.push(line.replace(/^\s*-\s+/, ''))
              } else {
                if (list.length) {
                  items.push(
                    <ul key={`ul-${idx}`} className="list-disc list-inside">
                      {list.map((t, i) => (<li key={`li-${idx}-${i}`}><Inline text={t} /></li>))}
                    </ul>
                  )
                  list = []
                }
                if (line.trim()) items.push(<p key={`p-${idx}`}><Inline text={line} /></p>)
              }
            }
            if (list.length) {
              items.push(
                <ul key={`ul-end`} className="list-disc list-inside">
                  {list.map((t, i) => (<li key={`li-end-${i}`}><Inline text={t} /></li>))}
                </ul>
              )
            }
            return items
          })()}
        </div>
      )}
      {maintenance && !isAdmin && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="max-w-lg w-full mx-4 rounded-xl bg-card border border-border p-6 text-foreground shadow-xl">
            <h2 className="text-xl font-semibold mb-2">Maintenance Mode</h2>
            <p className="text-sm text-muted-foreground">The platform is undergoing scheduled maintenance. Please check back later.</p>
          </div>
        </div>
      )}
    </>
  )
}
