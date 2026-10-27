import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Block, Code } from '../components/ui'

const ROW = 36,
  VIEW = 252,
  TOTAL = 300

function Window() {
  const [top, setTop] = useState(0)
  const [win, setWin] = useState(2)
  const ref = useRef<HTMLDivElement>(null)
  const margin = (VIEW * win) / 2
  const first = Math.max(0, Math.floor((top - margin) / ROW))
  const last = Math.min(TOTAL - 1, Math.ceil((top + VIEW + margin) / ROW))
  const mounted = last - first + 1
  const items = Array.from({ length: mounted }, (_, i) => first + i)
  return (
    <>
      <div className="row">
        <label htmlFor="win" className="note">
          windowSize: <b>{win}</b> (screens of content kept mounted)
        </label>
        <input
          id="win"
          type="range"
          min={1}
          max={8}
          value={win}
          onChange={e => setWin(+e.target.value)}
        />
      </div>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}
      >
        <div
          ref={ref}
          onScroll={e => setTop(e.currentTarget.scrollTop)}
          style={{
            height: VIEW,
            overflowY: 'auto',
            border: '1px solid var(--line)',
            borderRadius: 12,
            background: 'var(--panel2)',
          }}
        >
          <div style={{ height: first * ROW }} />
          {items.map(i => (
            <div
              key={i}
              style={{
                height: ROW,
                padding: '0 14px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid var(--line)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              Row {i + 1}
            </div>
          ))}
          <div style={{ height: (TOTAL - 1 - last) * ROW }} />
        </div>
        <div>
          <div className="box cpp" style={{ marginBottom: 10 }}>
            <div className="note">Rows in the data</div>
            <b style={{ fontSize: 26 }}>{TOTAL}</b>
          </div>
          <div className="box native">
            <div className="note">Rows actually mounted</div>
            <motion.b
              key={mounted}
              initial={{ scale: 1.25 }}
              animate={{ scale: 1 }}
              style={{ fontSize: 26, display: 'block' }}
            >
              {mounted}
            </motion.b>
            <div className="note">
              Visible: {first + 1}–{last + 1}
            </div>
          </div>
        </div>
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        Scroll the list. Rows outside the window do not exist as views; spacers keep the scrollbar
        honest. A bigger window means fewer blank flashes while scrolling fast but more memory.
      </p>
    </>
  )
}

const POOL = 8
function Recycle() {
  const [off, setOff] = useState(0)
  const [maxSeen, setMaxSeen] = useState(POOL)
  const scroll = (n: number) => {
    setOff(o => o + n)
    setMaxSeen(m => Math.max(m, off + n + POOL))
  }
  const cells = Array.from({ length: POOL }, (_, c) => {
    const base = off - (off % POOL)
    let item = base + c
    if (item < off) item += POOL
    return { c, item }
  })
  return (
    <>
      <div className="row">
        <button className="btn primary" onClick={() => scroll(3)}>
          Scroll down 3 rows
        </button>
        <button
          className="btn"
          onClick={() => {
            setOff(0)
            setMaxSeen(POOL)
          }}
        >
          Reset
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {cells.map(({ c, item }) => (
          <motion.div key={c} layout className="box cpp" style={{ minWidth: 110 }}>
            <div className="note" style={{ fontSize: 11 }}>
              view #{c + 1}
            </div>
            <motion.b key={item} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              Item {item + 1}
            </motion.b>
          </motion.div>
        ))}
      </div>
      <div className="grid3" style={{ marginTop: 14 }}>
        <div className="box js">
          <div className="note">Views created, create-and-destroy approach</div>
          <b style={{ fontSize: 24 }}>{maxSeen}</b>
        </div>
        <div className="box native">
          <div className="note">Views created, recycling approach</div>
          <b style={{ fontSize: 24 }}>{POOL}</b>
        </div>
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        FlashList keeps a small pool of views and swaps in new data as rows scroll off. Views that
        already exist are cheaper than new ones.
      </p>
    </>
  )
}

export default function S18() {
  return (
    <>
      <Block
        title="Windowing"
        lead="A list of thousands of items cannot all be views. VirtualizedList keeps only the rows near the screen mounted."
      >
        <Window />
      </Block>
      <Block
        title="Cell recycling, the FlashList approach"
        lead="Windowing still creates and destroys views as you scroll. Recycling reuses them."
      >
        <Recycle />
      </Block>
      <Block title="FlatList and SectionList">
        <p className="note" style={{ marginBottom: 12 }}>
          Both are thin wrappers over VirtualizedList. FlatList takes a flat array, SectionList
          groups rows under headers. Two props matter most for speed.
        </p>
        <Code title="Feed.tsx">{`<FlatList\n  data={posts}\n  keyExtractor={(p) => p.id}\n  renderItem={({ item }) => <Post post={item} />}\n  getItemLayout={(_, i) => ({ length: 72, offset: 72 * i, index: i })}\n  windowSize={5}\n  removeClippedSubviews\n/>`}</Code>
      </Block>
    </>
  )
}
