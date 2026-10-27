import { useState } from 'react'
import { motion } from 'framer-motion'
import { Block, Chip } from '../components/ui'

function Worlds() {
  const [m, setM] = useState({ js: 20, cpp: 10, native: 40 })
  const add = (k: 'js' | 'cpp' | 'native', n: number) => setM(x => ({ ...x, [k]: x[k] + n }))
  const rows: { k: 'js' | 'cpp' | 'native'; n: string }[] = [
    { k: 'js', n: 'JS heap (Hermes)' },
    { k: 'cpp', n: 'C++ (shadow tree, JSI)' },
    { k: 'native', n: 'Native (views, images)' },
  ]
  return (
    <>
      <div className="row">
        <button className="btn" onClick={() => add('js', 15)}>
          Create a 100k item array
        </button>
        <button className="btn" onClick={() => add('native', 45)}>
          Load a 4000px photo
        </button>
        <button
          className="btn"
          onClick={() => {
            add('cpp', 6)
            add('native', 10)
          }}
        >
          Mount 500 views
        </button>
        <button className="btn" onClick={() => setM({ js: 20, cpp: 10, native: 40 })}>
          Reset
        </button>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {rows.map(r => (
          <div key={r.k}>
            <div className="note">
              {r.n}: <b>{m[r.k]} MB</b>
            </div>
            <div
              style={{
                height: 14,
                background: 'var(--panel2)',
                borderRadius: 99,
                overflow: 'hidden',
              }}
            >
              <motion.div
                animate={{ width: `${Math.min(100, m[r.k] / 1.5)}%` }}
                style={{
                  height: '100%',
                  background: `var(--${r.k === 'native' ? 'native' : r.k})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        The JS garbage collector only sees the first bar. Memory in the other two is freed by their
        own owners, which is why a JS-side reference can keep native memory alive.
      </p>
    </>
  )
}

function Leak() {
  const [mounted, setMounted] = useState(false)
  const [listeners, setListeners] = useState(0)
  const [cleanup, setCleanup] = useState(false)
  const open = () => {
    if (!mounted) {
      setMounted(true)
      setListeners(l => l + 1)
    }
  }
  const close = () => {
    if (mounted) {
      setMounted(false)
      if (cleanup) setListeners(l => l - 1)
    }
  }
  return (
    <>
      <div className="row">
        <label className="note">
          <input type="checkbox" checked={cleanup} onChange={e => setCleanup(e.target.checked)} />{' '}
          remove listener on unmount
        </label>
        <button className="btn primary" disabled={mounted} onClick={open}>
          Open screen
        </button>
        <button className="btn" disabled={!mounted} onClick={close}>
          Close screen
        </button>
      </div>
      <div className="grid3">
        <div className={`box ${mounted ? 'native' : ''}`}>
          <div className="note">Screen</div>
          <b>{mounted ? 'mounted' : 'closed'}</b>
        </div>
        <div className={`box ${listeners > (mounted ? 1 : 0) ? 'bridge' : ''}`}>
          <div className="note">Listeners on the native emitter</div>
          <motion.b
            key={listeners}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            style={{ fontSize: 26, display: 'block' }}
          >
            {listeners}
          </motion.b>
        </div>
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        {listeners > (mounted ? 1 : 0)
          ? 'Closed screens are still referenced by native, so their JS objects can never be freed. That is a leak.'
          : 'Open and close the screen a few times with cleanup off, then on.'}
      </p>
      <pre
        className="code"
        style={{ marginTop: 10 }}
      >{`useEffect(() => {\n  const sub = emitter.addListener('tick', onTick);\n  return () => ${cleanup ? 'sub.remove()' : '{}  // forgot to remove'};\n}, []);`}</pre>
    </>
  )
}

function Jank() {
  const [ui, setUi] = useState(8)
  const [js, setJs] = useState(8)
  const frames = Array.from({ length: 30 }, (_, i) => (i % 4 === 3 ? ui * 1.0 : 5))
  const uiFps = Math.min(60, Math.round(1000 / Math.max(16.7, ui)))
  const jsFps = Math.min(60, Math.round(1000 / Math.max(16.7, js)))
  return (
    <>
      <div className="row">
        <label htmlFor="ui" className="note">
          UI thread work per frame: <b>{ui} ms</b>
        </label>
        <input
          id="ui"
          type="range"
          min={2}
          max={60}
          value={ui}
          onChange={e => setUi(+e.target.value)}
        />
      </div>
      <div className="row">
        <label htmlFor="js" className="note">
          JS thread work per frame: <b>{js} ms</b>
        </label>
        <input
          id="js"
          type="range"
          min={2}
          max={60}
          value={js}
          onChange={e => setJs(+e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 70 }}>
        {frames.map((_, i) => {
          const h = i % 4 === 3 ? ui : 5
          return (
            <div
              key={i}
              title={`${h} ms`}
              style={{
                flex: 1,
                height: `${Math.min(100, (h / 40) * 100)}%`,
                minHeight: 6,
                background: ui > 16.7 && i % 4 === 3 ? 'var(--bridge)' : 'var(--native)',
                borderRadius: 3,
              }}
            />
          )
        })}
      </div>
      <div className="grid3" style={{ marginTop: 14 }}>
        <div className={`box ${uiFps < 60 ? 'bridge' : 'native'}`}>
          <div className="note">UI thread frame rate (scrolling, animation)</div>
          <b style={{ fontSize: 26 }}>{uiFps} fps</b>
        </div>
        <div className={`box ${jsFps < 60 ? 'bridge' : 'native'}`}>
          <div className="note">JS thread frame rate (press handlers, state)</div>
          <b style={{ fontSize: 26 }}>{jsFps} fps</b>
        </div>
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        A frame at 60 fps has 16.7 ms. If either thread needs longer, that thread drops frames. Bars
        above the budget turn red.
      </p>
    </>
  )
}

const tools = [
  {
    n: 'Hermes profiler',
    k: 'js' as const,
    d: 'Samples the JS call stack. Shows which functions burn time.',
  },
  {
    n: 'React DevTools Profiler',
    k: 'js' as const,
    d: 'Shows which components rendered, why, and how long they took.',
  },
  {
    n: 'Perfetto / Systrace',
    k: 'native' as const,
    d: 'Android system trace: every thread, frame and scheduling event on one timeline.',
  },
  {
    n: 'Xcode Instruments',
    k: 'native' as const,
    d: 'iOS Time Profiler, Allocations and Leaks for native code and memory.',
  },
]

export default function S22() {
  const [t, setT] = useState(0)
  return (
    <>
      <Block
        title="Memory lives in three places"
        lead="Trigger some allocations and see which world pays."
      >
        <Worlds />
      </Block>
      <Block
        title="Leaks across boundaries"
        lead="Open and close a screen that subscribes to a native event."
      >
        <Leak />
      </Block>
      <Block
        title="Frame drops and jank"
        lead="Raise the work on each thread and watch the frame rate."
      >
        <Jank />
      </Block>
      <Block title="Profiling tools">
        <div className="row">
          {tools.map((x, i) => (
            <button
              key={x.n}
              className="btn"
              style={{ borderColor: i === t ? 'var(--accent)' : undefined }}
              onClick={() => setT(i)}
            >
              {x.n}
            </button>
          ))}
        </div>
        <div className="box" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Chip kind={tools[t].k}>{tools[t].k === 'js' ? 'JS side' : 'native side'}</Chip>
          <span>{tools[t].d}</span>
        </div>
      </Block>
    </>
  )
}
