import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Block, Seg } from '../components/ui'

const prios = ['Immediate', 'UserBlocking', 'Normal', 'Low', 'Idle'] as const
let id = 0
interface T {
  id: number
  p: number
}

function Scheduler() {
  const [q, setQ] = useState<T[]>([])
  const [ran, setRan] = useState<string[]>([])
  const add = (p: number) => setQ(x => [...x, { id: ++id, p }])
  const run = () => {
    if (!q.length) return
    const best = [...q].sort((a, b) => a.p - b.p || a.id - b.id)[0]
    setQ(x => x.filter(t => t.id !== best.id))
    setRan(r => [`${prios[best.p]} #${best.id}`, ...r].slice(0, 5))
  }
  return (
    <>
      <div className="row">
        {prios.map((n, i) => (
          <button key={n} className="btn" onClick={() => add(i)}>
            + {n}
          </button>
        ))}
      </div>
      <div className="row">
        <button className="btn primary" onClick={run} disabled={!q.length}>
          Run next task
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 44 }}>
        <AnimatePresence>
          {q.map(t => (
            <motion.div
              layout
              key={t.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, y: -20 }}
              className={`box ${t.p < 2 ? 'native' : t.p < 4 ? 'cpp' : ''}`}
              style={{ padding: '6px 10px', fontSize: 13 }}
            >
              {prios[t.p]} #{t.id}
            </motion.div>
          ))}
        </AnimatePresence>
        {!q.length && <span className="note">Queue empty. Add tasks in any order.</span>}
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        Last run: {ran.length ? ran.join(' · ') : 'none'}. Higher priority always runs first, ties
        run in arrival order.
      </p>
    </>
  )
}

function Compare() {
  const [m, setM] = useState<'old' | 'less'>('less')
  const chain =
    m === 'old'
      ? ['JS runtime', 'Bridge (JSON queue)', 'NativeModules registry', 'Native']
      : ['JS runtime', 'JSI', 'ReactHost', 'Native (TurboModules, Fabric)']
  return (
    <>
      <div className="row">
        <Seg
          value={m}
          onChange={setM}
          options={[
            { value: 'old', label: 'With bridge' },
            { value: 'less', label: 'Bridgeless' },
          ]}
        />
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {chain.map((c, i) => (
          <motion.div
            key={c}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`box ${i === 0 ? 'js' : i === chain.length - 1 ? 'native' : m === 'old' ? 'bridge' : 'cpp'}`}
          >
            {c}
          </motion.div>
        ))}
      </div>
    </>
  )
}

export default function S11() {
  return (
    <>
      <Block
        title="Removing the bridge"
        lead="Bridgeless mode is the New Architecture with the old bridge deleted. Everything goes through JSI."
      >
        <Compare />
      </Block>
      <Block
        title="ReactHost and ReactInstance"
        lead="ReactHost owns the app's lifecycle (start, reload, destroy). It creates a ReactInstance, which holds the JS runtime, the TurboModule registry and Fabric."
      >
        <span />
      </Block>
      <Block
        title="RuntimeScheduler"
        lead="One scheduler decides what runs next on the JS thread. Add tasks and run them."
      >
        <Scheduler />
      </Block>
      <Block
        title="Interop layers"
        lead="Old libraries that still use NativeModules and legacy views keep working through compatibility layers, so you can migrate gradually."
      >
        <span />
      </Block>
    </>
  )
}
