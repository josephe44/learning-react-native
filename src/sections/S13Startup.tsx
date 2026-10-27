import { useState } from 'react'
import { Block, type Kind } from '../components/ui'

const phases: { n: string; ms: number; k: Kind; d: string }[] = [
  {
    n: 'Process launch',
    ms: 150,
    k: 'native',
    d: 'The OS starts the app process and runs main(). Native code sets up the app delegate / Application.',
  },
  {
    n: 'Create runtime',
    ms: 60,
    k: 'cpp',
    d: 'ReactHost starts and creates the Hermes runtime, installs JSI bindings and the TurboModule registry.',
  },
  {
    n: 'Load bundle',
    ms: 90,
    k: 'js',
    d: 'The Hermes bytecode bundle is memory-mapped from disk (or fetched from Metro in dev).',
  },
  {
    n: 'Run bundle',
    ms: 140,
    k: 'js',
    d: 'Top-level code of every needed module runs. Inline requires shrink this step.',
  },
  {
    n: 'Render root',
    ms: 80,
    k: 'js',
    d: 'AppRegistry.runApplication calls your root component. React renders the first tree.',
  },
  {
    n: 'Commit & mount',
    ms: 70,
    k: 'cpp',
    d: 'Layout runs, mutations are computed and native views are created and attached.',
  },
]
const total = phases.reduce((a, p) => a + p.ms, 0)

export default function S13() {
  const [t, setT] = useState(300)
  let acc = 0
  const cur =
    phases.find(p => {
      acc += p.ms
      return t <= acc
    }) ?? phases[phases.length - 1]
  return (
    <Block
      title="Icon tap to first screen"
      lead="Drag the slider through time. Each colored segment is a phase; the sentence below explains what is happening."
    >
      <div
        style={{
          display: 'flex',
          height: 50,
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid var(--line)',
        }}
      >
        {phases.map(p => (
          <div
            key={p.n}
            style={{
              flex: p.ms,
              background: `color-mix(in srgb, var(--${p.k === 'native' ? 'native' : p.k}) ${cur === p ? 45 : 18}%, var(--panel))`,
              borderRight: '1px solid var(--line)',
              fontSize: 11,
              padding: 4,
              overflow: 'hidden',
              transition: 'background .2s',
            }}
          >
            {p.n}
          </div>
        ))}
      </div>
      <input
        id="t"
        type="range"
        min={0}
        max={total}
        value={t}
        onChange={e => setT(+e.target.value)}
        style={{ width: '100%', margin: '14px 0 6px' }}
        aria-label="Time since launch"
      />
      <div className="note">
        Time since launch: <b>{t} ms</b> of {total} ms (illustrative). The last point is TTI, time
        to interactive.
      </div>
      <p className="tldr" style={{ marginTop: 14, fontSize: 15 }}>
        <b>{cur.n.toUpperCase()}</b>
        {cur.d}
      </p>
    </Block>
  )
}
