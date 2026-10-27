import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Block, Code, Seg } from '../components/ui'

type Scale = '1' | '2' | '3'
const files = [
  { f: 'logo.png', s: '1' },
  { f: 'logo@2x.png', s: '2' },
  { f: 'logo@3x.png', s: '3' },
]

function Resolve() {
  const [sc, setSc] = useState<Scale>('3')
  const pick = files.find(f => f.s === sc)!
  return (
    <>
      <div className="row">
        <span className="note">Device pixel ratio</span>
        <Seg
          value={sc}
          onChange={setSc}
          options={[
            { value: '1', label: '1x' },
            { value: '2', label: '2x' },
            { value: '3', label: '3x' },
          ]}
        />
      </div>
      <div className="grid3">
        {files.map(f => (
          <motion.div
            key={f.f}
            className={`box ${f.f === pick.f ? 'native' : ''}`}
            animate={{ opacity: f.f === pick.f ? 1 : 0.4, scale: f.f === pick.f ? 1.04 : 1 }}
          >
            <code style={{ background: 'none', padding: 0 }}>{f.f}</code>
            <div className="note">{f.f === pick.f ? 'chosen at runtime' : 'ignored'}</div>
          </motion.div>
        ))}
      </div>
      <Code title="App.tsx">{`<Image source={require('./logo.png')} />\n\n// Metro turns the require into asset metadata:\n// { uri: 'logo', width: 100, height: 100, scale: ${sc} }`}</Code>
    </>
  )
}

const stages = ['Memory cache', 'Disk cache', 'Network fetch', 'Decode', 'Draw']
function Pipeline() {
  const [cached, setCached] = useState(false)
  const [at, setAt] = useState(-1)
  const timers = useRef<number[]>([])
  const load = () => {
    timers.current.forEach(clearTimeout)
    setAt(-1)
    const seq = cached ? [0, 4] : [0, 1, 2, 3, 4]
    timers.current = seq.map((st, i) => window.setTimeout(() => setAt(st), 450 * (i + 1)))
    window.setTimeout(() => setCached(true), 450 * (seq.length + 1))
  }
  const skipped = (i: number) => cached && i > 0 && i < 4
  return (
    <>
      <div className="row">
        <button className="btn primary" onClick={load}>
          Load image
        </button>
        <button
          className="btn"
          onClick={() => {
            setCached(false)
            setAt(-1)
          }}
        >
          Clear caches
        </button>
        <span className="note">
          {cached ? 'Cached: second load skips the slow steps.' : 'Cold: every step runs.'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {stages.map((st, i) => (
          <motion.div
            key={st}
            className={`box ${i === at ? 'native' : i === 2 ? 'bridge' : ''}`}
            animate={{ scale: i === at ? 1.08 : 1, opacity: skipped(i) ? 0.25 : 1 }}
            style={{ textDecoration: skipped(i) ? 'line-through' : 'none' }}
          >
            {st}
          </motion.div>
        ))}
      </div>
    </>
  )
}

function Memory() {
  const [w, setW] = useState(4000)
  const h = Math.round((w * 3) / 4)
  const mb = (w * h * 4) / 1024 / 1024
  return (
    <>
      <div className="row">
        <label htmlFor="iw" className="note">
          Image width: <b>{w}px</b> (4:3)
        </label>
        <input
          id="iw"
          type="range"
          min={200}
          max={6000}
          step={100}
          value={w}
          onChange={e => setW(+e.target.value)}
        />
      </div>
      <div className="box js">
        <div className="note">
          {w} × {h} × 4 bytes per pixel
        </div>
        <motion.b
          key={Math.round(mb)}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          style={{ fontSize: 28, display: 'block' }}
        >
          {mb.toFixed(1)} MB decoded
        </motion.b>
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        The file on disk may be small (JPEG is compressed), but the decoded bitmap in memory is
        width × height × 4. Resize server-side to the size you display.
      </p>
    </>
  )
}

export default function S20() {
  return (
    <>
      <Block
        title="Asset resolution"
        lead="With a local file, Metro looks at the screen's pixel ratio and picks the closest file."
      >
        <Resolve />
      </Block>
      <Block
        title="The loading pipeline"
        lead="A remote image goes through several steps. Load it twice to see caching skip most of them."
      >
        <Pipeline />
      </Block>
      <Block title="Caching and memory" lead="Decoded images are the real cost.">
        <Memory />
      </Block>
      <Block title="Tips">
        <ul className="note" style={{ lineHeight: 1.9 }}>
          <li>
            Network images need explicit <code>width</code> and <code>height</code>; RN cannot know
            their size before loading.
          </li>
          <li>
            Use the <code>cache</code> prop (<code>'force-cache'</code>) or a library such as
            expo-image for stronger disk caching.
          </li>
          <li>
            Prefetch with <code>Image.prefetch(url)</code> before a screen opens.
          </li>
        </ul>
      </Block>
    </>
  )
}
