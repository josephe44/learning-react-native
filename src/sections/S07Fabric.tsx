import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Block, Seg, Stepper } from '../components/ui'

interface N {
  id: string
  label: string
  children?: N[]
  layoutOnly?: boolean
}
const tree: N = {
  id: 'root',
  label: 'RootView',
  children: [
    {
      id: 'a',
      label: 'View',
      layoutOnly: true,
      children: [
        { id: 't', label: 'Text' },
        { id: 'i', label: 'Image' },
      ],
    },
    { id: 'b', label: 'View', layoutOnly: true, children: [{ id: 'btn', label: 'Button' }] },
  ],
}

const pathTo = (n: N, target: string): string[] | null => {
  if (n.id === target) return [n.id]
  for (const c of n.children ?? []) {
    const p = pathTo(c, target)
    if (p) return [n.id, ...p]
  }
  return null
}

function Node({
  n,
  ver,
  path,
  pick,
  flat,
}: {
  n: N
  ver: number
  path: string[]
  pick: (id: string) => void
  flat: boolean
}) {
  if (flat && n.layoutOnly)
    return (
      <>
        {n.children!.map(c => (
          <Node key={c.id} n={c} ver={ver} path={path} pick={pick} flat={flat} />
        ))}
      </>
    )
  const cloned = path.includes(n.id)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <motion.button
        layout
        key={cloned ? ver : 0}
        onClick={() => pick(n.id)}
        initial={cloned ? { scale: 1.3, boxShadow: '0 0 0 6px var(--accent-soft)' } : false}
        animate={{ scale: 1, boxShadow: '0 0 0 0px transparent' }}
        className={`box ${cloned ? 'cpp' : ''}`}
        style={{
          borderStyle: cloned ? 'solid' : 'dashed',
          color: 'inherit',
          fontSize: 13,
          padding: '6px 10px',
        }}
      >
        {n.label}
        <div className="note" style={{ fontSize: 10 }}>
          {cloned ? `v${ver + 1} (new clone)` : 'v1 (shared)'}
        </div>
      </motion.button>
      {n.children && (
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 14,
            borderTop: '1px solid var(--line)',
            paddingTop: 10,
          }}
        >
          {n.children.map(c => (
            <Node key={c.id} n={c} ver={ver} path={path} pick={pick} flat={flat} />
          ))}
        </div>
      )}
    </div>
  )
}

const phases = [
  {
    t: 'Render',
    who: 'JS thread',
    d: 'React runs your components and produces a tree of elements. Fabric (C++) turns them into ShadowNodes — immutable, light objects.',
  },
  {
    t: 'Commit',
    who: 'Any thread',
    d: 'Yoga computes layout on the new shadow tree. It becomes the "next" tree and is swapped in atomically. Old tree stays valid for anyone still reading it.',
  },
  {
    t: 'Mount',
    who: 'UI thread',
    d: 'Fabric diffs old vs new tree into a small list of mutations (CREATE, UPDATE, INSERT, DELETE) and applies them to real native views.',
  },
]

function Pipeline() {
  const [s, setS] = useState(0)
  return (
    <>
      <Stepper steps={phases.map(p => p.t)} step={s} setStep={setS} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {phases.map((p, i) => (
          <motion.div
            key={p.t}
            animate={{ flex: i === s ? 2 : 1, opacity: i <= s ? 1 : 0.35 }}
            className={`box ${i === 0 ? 'js' : i === 1 ? 'cpp' : 'native'}`}
            style={{ textAlign: 'center' }}
          >
            <b>{p.t}</b>
            <div className="note" style={{ fontSize: 11 }}>
              {p.who}
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={s}
          className="tldr"
          style={{ fontSize: 15 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <b>{phases[s].t.toUpperCase()}</b>
          {phases[s].d}
        </motion.p>
      </AnimatePresence>
    </>
  )
}

function Clone() {
  const [sel, setSel] = useState<string | null>(null)
  const [ver, setVer] = useState(0)
  const path = sel ? pathTo(tree, sel)! : []
  const mutations = sel ? [`UPDATE ${sel}`] : []
  return (
    <>
      <p className="note" style={{ marginBottom: 12 }}>
        Click any node to “change” it. Only its ancestors are cloned (solid); everything else is
        shared with the old tree (dashed).
      </p>
      <div style={{ overflowX: 'auto', padding: '8px 0 14px' }}>
        <Node
          n={tree}
          ver={ver}
          path={path}
          flat={false}
          pick={id => {
            setSel(id)
            setVer(v => v + 1)
          }}
        />
      </div>
      <div className="row">
        <span className="note">Diff → mutations sent to UI thread:</span>
        <code>{mutations.length ? mutations.join(', ') : '(none)'}</code>
      </div>
    </>
  )
}

function Flatten() {
  const [flat, setFlat] = useState(false)
  const count = flat ? 4 : 6
  return (
    <>
      <div className="row">
        <Seg
          value={flat ? 'on' : 'off'}
          onChange={v => setFlat(v === 'on')}
          options={[
            { value: 'off', label: 'Without flattening' },
            { value: 'on', label: 'View flattening' },
          ]}
        />
        <span className="note">
          Native views created: <b>{count}</b>
        </span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <Node n={tree} ver={0} path={[]} flat={flat} pick={() => {}} />
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        Views that only exist to position children (no background, border, touch) have no visual
        output, so Fabric skips creating native views for them. Fewer views → less memory, faster
        mount.
      </p>
    </>
  )
}

export default function S07() {
  return (
    <>
      <Block
        title="Render → Commit → Mount"
        lead="Every UI update takes the same three-phase trip."
      >
        <Pipeline />
      </Block>
      <Block
        title="The Shadow Tree is immutable"
        lead="Instead of editing the tree in place, Fabric clones just the changed path. That makes it safe to read from many threads without locks."
      >
        <Clone />
      </Block>
      <Block title="View flattening" lead="Toggle to see layout-only wrappers vanish.">
        <Flatten />
      </Block>
      <Block title="Also in Fabric">
        <ul className="note" style={{ lineHeight: 1.9 }}>
          <li>
            <b>Concurrent rendering:</b> React can prepare a new tree in the background and commit
            it only when ready.
          </li>
          <li>
            <b>Synchronous layout:</b> JS can measure a view immediately (via JSI) — no async
            round-trip.
          </li>
          <li>
            <b>Host components:</b> each shadow node type maps to a native view via a component
            descriptor.
          </li>
        </ul>
      </Block>
    </>
  )
}
