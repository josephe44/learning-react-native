import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { curriculum } from '../data/curriculum'
import {
  edgeTypes,
  edges,
  mapNodes,
  newArch,
  oldArch,
  rows,
  tapTour,
  type EdgeType,
} from '../data/relations'
import { Seg } from '../components/ui'

const W = 1100,
  LEFT = 120,
  NW = 100,
  NH = 40
const rowY = [45, 165, 285, 405, 525, 645]
const H = 700

const pos = (() => {
  const out: Record<string, { x: number; y: number }> = {}
  rows.forEach((_, r) => {
    const list = mapNodes.filter(n => n.row === r)
    list.forEach((n, i) => {
      out[n.id] = { x: LEFT + ((W - LEFT - 20) * (i + 1)) / (list.length + 1), y: rowY[r] }
    })
  })
  return out
})()

const rowKind = ['dim', 'js', 'cpp', 'cpp', 'native', 'dim'] as const
const kindColor = { dim: 'var(--dim)', js: 'var(--js)', cpp: 'var(--cpp)', native: 'var(--native)' }

function path(a: string, b: string) {
  const p = pos[a],
    q = pos[b]
  if (p.y === q.y) {
    const y = p.y - NH / 2
    return {
      d: `M ${p.x} ${y} C ${p.x} ${y - 60} ${q.x} ${y - 60} ${q.x} ${y}`,
      mx: (p.x + q.x) / 2,
      my: y - 45,
    }
  }
  const down = q.y > p.y
  const sy = p.y + (down ? NH / 2 : -NH / 2),
    ey = q.y + (down ? -NH / 2 : NH / 2),
    mid = (sy + ey) / 2
  return {
    d: `M ${p.x} ${sy} C ${p.x} ${mid} ${q.x} ${mid} ${q.x} ${ey}`,
    mx: (p.x + q.x) / 2,
    my: mid,
  }
}

const visitedIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('rn-visited') ?? '[]')
  } catch {
    return []
  }
}
const labelOf = (id: string) => mapNodes.find(n => n.id === id)!.label

export default function MapPage() {
  const [params, setParams] = useSearchParams()
  const sel = params.get('focus')
  const [hover, setHover] = useState<string | null>(null)
  const [hoverEdge, setHoverEdge] = useState<string | null>(null)
  const [arch, setArch] = useState<'all' | 'old' | 'new'>('all')
  const [types, setTypes] = useState<EdgeType[]>(['R', 'B', 'F', 'S'])
  const [tour, setTour] = useState<number | null>(null)
  const visited = useMemo(visitedIds, [])

  useEffect(() => {
    if (tour === null) return
    if (tour >= tapTour.length - 1) {
      const t = setTimeout(() => setTour(null), 2200)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setTour(tour + 1), 1700)
    return () => clearTimeout(t)
  }, [tour])

  useEffect(() => {
    if (!sel) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setParams({}, { replace: true })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sel, setParams])

  const active = tour !== null ? tapTour[tour].id : (hover ?? sel)
  const faded = (id: string) =>
    (arch === 'old' && newArch.includes(id)) || (arch === 'new' && oldArch.includes(id))
  const related = (id: string) =>
    active !== null &&
    (id === active ||
      edges.some(x => (x.from === active && x.to === id) || (x.to === active && x.from === id)))
  const select = (id: string | null) => {
    setTour(null)
    setParams(id ? { focus: id } : {}, { replace: true })
  }
  const toggleType = (t: EdgeType) =>
    setTypes(ts => (ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t]))

  const selected = sel ? curriculum.find(c => c.id === sel) : null
  const out = sel ? edges.filter(x => x.from === sel) : []
  const inc = sel ? edges.filter(x => x.to === sel) : []

  return (
    <>
      <header className="hero">
        <div className="kicker">The whole picture</div>
        <h1>How it all connects</h1>
        <div className="tldr">
          <b>HOW TO READ IT</b>Each box is a section. Rows go from your JavaScript at the top to the
          native views at the bottom. Click a box to see what it builds on and what builds on it.
        </div>
      </header>

      <div className="row">
        <button
          className="btn primary"
          onClick={() => {
            select(null)
            setTour(0)
          }}
          disabled={tour !== null}
        >
          Follow a tap
        </button>
        {tour !== null && (
          <button className="btn" onClick={() => setTour(null)}>
            Stop
          </button>
        )}
        <Seg
          value={arch}
          onChange={setArch}
          options={[
            { value: 'all', label: 'Everything' },
            { value: 'old', label: 'Old architecture' },
            { value: 'new', label: 'New architecture' },
          ]}
        />
        {sel && (
          <button className="btn" onClick={() => select(null)}>
            Clear selection
          </button>
        )}
      </div>
      <div className="row maptypes">
        {(Object.keys(edgeTypes) as EdgeType[]).map(t => (
          <button
            key={t}
            className={`maptype ${types.includes(t) ? 'on' : ''}`}
            onClick={() => toggleType(t)}
            aria-pressed={types.includes(t)}
          >
            <svg width="30" height="8" aria-hidden="true">
              <line
                x1="0"
                y1="4"
                x2="30"
                y2="4"
                stroke={edgeTypes[t].color}
                strokeWidth="2.5"
                strokeDasharray={edgeTypes[t].dash}
              />
            </svg>
            {edgeTypes[t].name}
          </button>
        ))}
      </div>

      {tour !== null && (
        <motion.div
          key={tour}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="tldr"
          style={{ fontSize: 15, marginBottom: 14 }}
        >
          <b>
            STEP {tour + 1} OF {tapTour.length}
          </b>
          {tapTour[tour].t}
        </motion.div>
      )}

      <div className={`mapwrap ${selected ? 'withpanel' : ''}`}>
        <div className="mapscroll">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mapsvg"
            role="img"
            aria-label="Map of how the React Native sections relate"
          >
            <defs>
              {(Object.keys(edgeTypes) as EdgeType[]).map(t => (
                <marker
                  key={t}
                  id={`ah-${t}`}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto"
                >
                  <path d="M0 0 L10 5 L0 10 z" fill={edgeTypes[t].color} />
                </marker>
              ))}
            </defs>
            {rows.map((r, i) => (
              <g key={r}>
                <line
                  x1={LEFT - 20}
                  x2={W - 10}
                  y1={rowY[i] + 48}
                  y2={rowY[i] + 48}
                  stroke="var(--line)"
                  strokeDasharray="2 6"
                  opacity={i === rows.length - 1 ? 0 : 0.8}
                />
                <text x={10} y={rowY[i] + 4} className="maprow">
                  {r}
                </text>
              </g>
            ))}
            {edges
              .filter(x => types.includes(x.type))
              .map(x => {
                const hit = active !== null && (x.from === active || x.to === active)
                const g = path(x.from, x.to)
                const dim = faded(x.from) || faded(x.to)
                const op = dim ? 0.04 : active === null ? 0.28 : hit ? 1 : 0.04
                const t = edgeTypes[x.type]
                return (
                  <g key={x.from + x.to} style={{ transition: 'opacity .25s' }} opacity={op}>
                    <path
                      d={g.d}
                      fill="none"
                      stroke={t.color}
                      strokeWidth={hit || hoverEdge === x.from + x.to ? 2.6 : 1.4}
                      strokeDasharray={t.dash}
                      markerEnd={hit ? `url(#ah-${x.type})` : undefined}
                    />
                    {hit && (
                      <path
                        d={g.d}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={14}
                        style={{ cursor: 'help' }}
                        onMouseEnter={() => setHoverEdge(x.from + x.to)}
                        onMouseLeave={() => setHoverEdge(null)}
                      >
                        <title>{`${labelOf(x.from)} ${x.label} ${labelOf(x.to)}`}</title>
                      </path>
                    )}
                    {hoverEdge === x.from + x.to && (
                      <text
                        x={g.mx}
                        y={g.my}
                        textAnchor="middle"
                        className="maplabel"
                      >{`${labelOf(x.from)} ${x.label} ${labelOf(x.to)}`}</text>
                    )}
                  </g>
                )
              })}
            {mapNodes.map(n => {
              const p = pos[n.id],
                on = active === n.id,
                rel = related(n.id)
              const c = kindColor[rowKind[n.row]]
              const op = faded(n.id) ? 0.2 : active === null || rel ? 1 : 0.3
              return (
                <g
                  key={n.id}
                  transform={`translate(${p.x - NW / 2} ${p.y - NH / 2})`}
                  className="mapnode"
                  opacity={op}
                  tabIndex={0}
                  role="button"
                  aria-label={n.label}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => select(n.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') select(n.id)
                  }}
                >
                  {on && (
                    <motion.rect
                      x={-6}
                      y={-6}
                      width={NW + 12}
                      height={NH + 12}
                      rx={16}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.9, 0.35, 0.9] }}
                      transition={{ repeat: Infinity, duration: 1.4 }}
                    />
                  )}
                  <rect
                    width={NW}
                    height={NH}
                    rx={11}
                    fill="var(--panel)"
                    stroke={on ? 'var(--accent)' : c}
                    strokeWidth={on || sel === n.id ? 2.5 : 1.5}
                  />
                  <text x={NW / 2} y={NH / 2 + 4.5} textAnchor="middle" className="mapnodetext">
                    {n.label}
                  </text>
                  {visited.includes(n.id) && (
                    <circle cx={NW - 9} cy={9} r={4} fill="var(--native)" />
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        <div className="maplist">
          {rows.map((r, ri) => (
            <section key={r}>
              <div className="maprow-h">{r}</div>
              <div className="mapchips">
                {mapNodes
                  .filter(n => n.row === ri)
                  .map(n => {
                    const on = active === n.id,
                      rel = related(n.id)
                    const cls = [
                      'mapchip',
                      `k-${rowKind[ri]}`,
                      on ? 'on' : '',
                      rel && !on ? 'rel' : '',
                      active !== null && !rel ? 'dim' : '',
                      faded(n.id) ? 'faded' : '',
                    ].join(' ')
                    return (
                      <button
                        key={n.id}
                        className={cls}
                        onClick={() => select(n.id)}
                        aria-pressed={sel === n.id}
                      >
                        {n.label}
                        {visited.includes(n.id) && <i className="vdot" aria-label="visited" />}
                      </button>
                    )
                  })}
              </div>
            </section>
          ))}
        </div>

        {selected &&
          createPortal(
            <aside className="mappanel" aria-label="Section details">
              <button
                className="btn mapclose"
                onClick={() => select(null)}
                aria-label="Close details"
              >
                Close
              </button>
              {selected ? (
                <>
                  <div
                    className="kicker"
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 11,
                      color: 'var(--accent)',
                      letterSpacing: '.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Section {curriculum.indexOf(selected) + 1}
                  </div>
                  <h2 style={{ fontSize: 24, margin: '4px 0 8px' }}>{selected.title}</h2>
                  <p className="note" style={{ marginBottom: 12 }}>
                    {selected.tldr}
                  </p>
                  <Link
                    to={`/${selected.id}`}
                    className="btn primary"
                    style={{
                      display: 'inline-block',
                      textDecoration: 'none',
                      color: 'var(--on-solid)',
                    }}
                  >
                    Open this section
                  </Link>
                  {[
                    { title: 'It connects to', list: out, dir: 'out' as const },
                    { title: 'Connected from', list: inc, dir: 'in' as const },
                  ].map(
                    g =>
                      g.list.length > 0 && (
                        <div key={g.title} style={{ marginTop: 16 }}>
                          <div
                            className="note"
                            style={{
                              fontFamily: 'var(--mono)',
                              fontSize: 11,
                              letterSpacing: '.08em',
                              textTransform: 'uppercase',
                              marginBottom: 6,
                            }}
                          >
                            {g.title}
                          </div>
                          <div style={{ display: 'grid', gap: 6 }}>
                            {g.list.map(x => {
                              const other = g.dir === 'out' ? x.to : x.from
                              return (
                                <button
                                  key={x.from + x.to}
                                  className="maplink"
                                  onClick={() => select(other)}
                                >
                                  <span
                                    className="dotline"
                                    style={{ background: edgeTypes[x.type].color }}
                                  />
                                  <span>
                                    <b>{labelOf(x.from)}</b> {x.label} <b>{labelOf(x.to)}</b>
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ),
                  )}
                </>
              ) : null}
            </aside>,
            document.body,
          )}
      </div>
    </>
  )
}
