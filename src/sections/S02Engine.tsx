import { useState } from 'react'
import { motion } from 'framer-motion'
import { Block, Seg } from '../components/ui'

type Eng = 'jsc' | 'hermes'
const phases: Record<Eng, { n: string; ms: number; c: string }[]> = {
  jsc: [
    { n: 'Load JS text', ms: 120, c: 'var(--js)' },
    { n: 'Parse', ms: 260, c: 'var(--bridge)' },
    { n: 'Compile (JIT warm-up)', ms: 220, c: 'var(--bridge)' },
    { n: 'Run', ms: 150, c: 'var(--native)' },
  ],
  hermes: [
    { n: 'Load bytecode (mmap)', ms: 60, c: 'var(--cpp)' },
    { n: 'Run', ms: 150, c: 'var(--native)' },
  ],
}

function Startup() {
  const [eng, setEng] = useState<Eng>('hermes')
  const [run, setRun] = useState(0)
  const ps = phases[eng]
  const total = ps.reduce((a, p) => a + p.ms, 0)
  let acc = 0
  return (
    <>
      <div className="row">
        <Seg
          value={eng}
          onChange={e => {
            setEng(e)
            setRun(r => r + 1)
          }}
          options={[
            { value: 'jsc', label: 'JavaScriptCore' },
            { value: 'hermes', label: 'Hermes' },
          ]}
        />
        <button className="btn primary" onClick={() => setRun(r => r + 1)}>
          Start the app
        </button>
      </div>
      <div
        key={`${eng}-${run}`}
        style={{
          display: 'flex',
          height: 54,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--line)',
        }}
      >
        {ps.map(p => {
          const delay = acc / 400
          acc += p.ms
          return (
            <motion.div
              key={p.n}
              initial={{ width: 0 }}
              animate={{ width: `${(p.ms / 750) * 100}%` }}
              transition={{ delay, duration: p.ms / 400, ease: 'linear' }}
              style={{
                background: p.c,
                color: 'var(--on-solid)',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {p.n}
            </motion.div>
          )
        })}
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        Time to first JS running: <b>{total} ms</b> (illustrative).{' '}
        {eng === 'hermes'
          ? 'Bytecode was compiled at build time, so there is nothing to parse.'
          : 'The phone must parse and compile text every launch.'}
      </p>
    </>
  )
}

type Cell = { live: boolean; state: 'idle' | 'marked' | 'swept' }
const init = (): Cell[] =>
  Array.from({ length: 32 }, (_, i) => ({ live: (i * 7 + 3) % 5 < 2, state: 'idle' }))

function Gc() {
  const [cells, setCells] = useState<Cell[]>(init)
  const [phase, setPhase] = useState('Idle')
  const go = () => {
    setCells(init())
    setPhase('Marking: walk from roots, flag reachable objects')
    setTimeout(() => setCells(c => c.map(x => (x.live ? { ...x, state: 'marked' } : x))), 900)
    setTimeout(() => {
      setPhase('Sweeping: free everything unmarked')
      setCells(c => c.map(x => (x.live ? x : { ...x, state: 'swept' })))
    }, 2200)
    setTimeout(() => setPhase('Done — memory reclaimed'), 3400)
  }
  return (
    <>
      <div className="row">
        <button className="btn primary" onClick={go}>
          Run garbage collection
        </button>
        <span className="note">{phase}</span>
      </div>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: 6, maxWidth: 560 }}
      >
        {cells.map((c, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: c.state === 'swept' ? 0.08 : 1,
              scale: c.state === 'swept' ? 0.4 : 1,
              background: c.state === 'marked' ? 'var(--native)' : 'var(--line)',
            }}
            style={{ aspectRatio: '1', borderRadius: 6 }}
          />
        ))}
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        Hermes' GC (Hades) is generational and mostly concurrent, so pauses stay short and frames
        don't stall.
      </p>
    </>
  )
}

export default function S02() {
  return (
    <>
      <Block
        title="What is a JS engine?"
        lead="Your phone can't run JavaScript by itself. React Native ships a small engine inside the app. Today that is almost always Hermes, built by Meta for mobile. JavaScriptCore (Safari's engine) was the older default."
      >
        <div className="grid3">
          <div className="box cpp">
            <b>Hermes</b>
            <p className="note">Precompiles to bytecode. Small, fast startup, low memory.</p>
          </div>
          <div className="box js">
            <b>JavaScriptCore</b>
            <p className="note">
              Parses and JIT-compiles at runtime. Fast peak speed, slower start.
            </p>
          </div>
        </div>
      </Block>
      <Block
        title="Startup race"
        lead="Switch engines and press start. Hermes skips parsing because the work happened on your build machine."
      >
        <Startup />
      </Block>
      <Block
        title="Garbage collection"
        lead="JS never frees memory by hand. The collector finds unreachable objects and reclaims them."
      >
        <Gc />
      </Block>
    </>
  )
}
