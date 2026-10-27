import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Code, Seg } from '../components/ui'
import { compare, finalRn, finalSw, steps } from '../data/todoSteps'

type Item = { id: number; title: string; done: boolean }
type Skin = 'rn' | 'sw'
type Filter = 'all' | 'active' | 'done'
const SAVE = 'todo-preview'
const seed: Item[] = [
  { id: 1, title: 'Buy milk', done: false },
  { id: 2, title: 'Walk the dog', done: true },
  { id: 3, title: 'Read a chapter', done: false },
]

const loadItems = (): Item[] => {
  try {
    const r = localStorage.getItem(SAVE)
    return r ? JSON.parse(r) : seed
  } catch {
    return seed
  }
}

function Preview({ step, skin }: { step: number; skin: Skin }) {
  const [items, setItems] = useState<Item[]>(loadItems)
  const [text, setText] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const canAdd = step >= 4,
    canToggle = step >= 5,
    canFilter = step >= 7,
    persists = step >= 8,
    animated = step >= 9
  useEffect(() => {
    if (persists) {
      try {
        localStorage.setItem(SAVE, JSON.stringify(items))
      } catch {
        /* ignore */
      }
    }
  }, [items, persists])

  const add = () => {
    const t = text.trim()
    if (!t) return
    setItems(i => [{ id: Date.now(), title: t, done: false }, ...i])
    setText('')
  }
  const toggle = (id: number) =>
    canToggle && setItems(i => i.map(x => (x.id === id ? { ...x, done: !x.done } : x)))
  const remove = (id: number) => setItems(i => i.filter(x => x.id !== id))
  const visible = items.filter(t => filter === 'all' || (filter === 'done' ? t.done : !t.done))
  const Row = animated ? motion.li : 'li'
  const rowProps = (id: number) =>
    animated
      ? {
          layout: true,
          initial: { opacity: 0, y: -8 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, x: 30 },
          key: id,
        }
      : { key: id }

  return (
    <div className={`tp ${skin}`}>
      <div className="tpstatus">
        <span>9:41</span>
        <span>{skin === 'sw' ? 'SwiftUI' : 'Expo'}</span>
      </div>
      {step === 1 && <div className="tphello">Hello, world!</div>}
      {step === 2 && (
        <div className="tpmodel">
          <div className="tpcap">Todo</div>
          <code>{'{ id, title, done }'}</code>
          <div className="tpcap" style={{ marginTop: 12 }}>
            Sample
          </div>
          <code>{'{ id: 1, title: "Buy milk", done: false }'}</code>
        </div>
      )}
      {step >= 3 && (
        <div className="tpbody">
          <div className="tptitle">Todos</div>
          {canFilter &&
            (skin === 'sw' ? (
              <div className="tpseg">
                {(['all', 'active', 'done'] as Filter[]).map(f => (
                  <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
            ) : (
              <div className="tpchips">
                {(['all', 'active', 'done'] as Filter[]).map(f => (
                  <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
            ))}
          <ul className="tplist">
            <AnimatePresence initial={false}>
              {visible.map(t => (
                <Row {...rowProps(t.id)} className="tprow">
                  <button className="tpmain" onClick={() => toggle(t.id)} disabled={!canToggle}>
                    {canToggle && (
                      <span className={`tpcircle ${t.done ? 'on' : ''}`} aria-hidden="true">
                        {t.done ? '✓' : ''}
                      </span>
                    )}
                    <span className={t.done ? 'tpdone' : ''}>{t.title}</span>
                  </button>
                  {canToggle && (
                    <button className="tpdel" onClick={() => remove(t.id)}>
                      Delete
                    </button>
                  )}
                </Row>
              ))}
            </AnimatePresence>
          </ul>
          {animated && visible.length === 0 && (
            <div className="tpempty">
              No todos
              <br />
              <small>Add one below.</small>
            </div>
          )}
        </div>
      )}
      {canAdd && (
        <div className="tpinput">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="New todo"
            aria-label="New todo"
          />
          <button onClick={add}>Add</button>
        </div>
      )}
      {persists && <div className="tpbadge">Saved on device. Reload the page and they stay.</div>}
    </div>
  )
}

function StepByStep() {
  const [i, setI] = useState(0)
  const [skin, setSkin] = useState<Skin>('rn')
  const [view, setView] = useState<'both' | 'rn' | 'sw'>('both')
  const s = steps[i]
  const show = (side: 'rn' | 'sw') => view === 'both' || view === side
  return (
    <>
      <div className="swchips">
        {steps.map((x, n) => (
          <button
            key={x.title}
            className={`swchip ${n === i ? 'on' : ''}`}
            onClick={() => setI(n)}
            aria-label={`Step ${n + 1}: ${x.title}`}
          >
            {n + 1}. {x.title}
          </button>
        ))}
      </div>
      <div className="todolayout">
        <div className="todophone">
          <Seg
            value={skin}
            onChange={setSkin}
            options={[
              { value: 'rn', label: 'Expo look' },
              { value: 'sw', label: 'SwiftUI look' },
            ]}
          />
          <Preview step={i + 1} skin={skin} />
          <p className="note" style={{ fontSize: 13 }}>
            This is a live mini app. It gains a feature at each step.
          </p>
        </div>
        <div style={{ minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div
                className="kicker"
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  color: 'var(--accent)',
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                }}
              >
                Step {i + 1} of {steps.length}
              </div>
              <h2 style={{ fontSize: 30, margin: '4px 0 4px' }}>{s.title}</h2>
              <p className="note" style={{ marginBottom: 14 }}>
                {s.goal}
              </p>
              <div className="row">
                <Seg
                  value={view}
                  onChange={setView}
                  options={[
                    { value: 'both', label: 'Side by side' },
                    { value: 'rn', label: 'React Native' },
                    { value: 'sw', label: 'SwiftUI' },
                  ]}
                />
              </div>
              <div className={view === 'both' ? 'cols2' : ''}>
                {show('rn') && (
                  <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                    <div className="swlabel" style={{ color: 'var(--js)' }}>
                      React Native + Expo
                    </div>
                    {s.rn.map(b => (
                      <Code key={b.file} lang={b.lang} title={b.file}>
                        {b.code}
                      </Code>
                    ))}
                  </div>
                )}
                {show('sw') && (
                  <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                    <div className="swlabel" style={{ color: 'var(--native)' }}>
                      Swift + SwiftUI
                    </div>
                    {s.sw.map(b => (
                      <Code key={b.file} lang={b.lang} title={b.file}>
                        {b.code}
                      </Code>
                    ))}
                  </div>
                )}
              </div>
              <div className="cols2" style={{ marginTop: 14 }}>
                <p className="tldr" style={{ fontSize: 15 }}>
                  <b>SAME IDEA</b>
                  {s.same}
                </p>
                <p className="tldr" style={{ fontSize: 15 }}>
                  <b>WHERE THEY DIFFER</b>
                  {s.diff}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="pager" style={{ marginTop: 20 }}>
            <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>
              ← Previous step
            </button>
            <button
              className="btn primary"
              disabled={i === steps.length - 1}
              onClick={() => setI(i + 1)}
            >
              Next step →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const lines = (files: { code: string }[]) =>
  files.reduce((n, f) => n + f.code.split('\n').length, 0)

function Final() {
  const [side, setSide] = useState<'rn' | 'sw'>('rn')
  const files = side === 'rn' ? finalRn : finalSw
  const [f, setF] = useState(0)
  const cur = files[Math.min(f, files.length - 1)]
  return (
    <>
      <div className="row">
        <Seg
          value={side}
          onChange={v => {
            setSide(v)
            setF(0)
          }}
          options={[
            { value: 'rn', label: 'React Native + Expo' },
            { value: 'sw', label: 'Swift + SwiftUI' },
          ]}
        />
        <span className="note">
          {files.length} files, about {lines(files)} lines
        </span>
      </div>
      <div className="swchips">
        {files.map((x, n) => (
          <button key={x.file} className={`swchip ${n === f ? 'on' : ''}`} onClick={() => setF(n)}>
            {x.file}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={side + cur.file}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Code lang={cur.lang} title={cur.file}>
            {cur.code}
          </Code>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

function Compare() {
  return (
    <>
      <div className="grid3" style={{ marginBottom: 18 }}>
        <div className="box js">
          <div className="note">React Native + Expo</div>
          <b style={{ fontSize: 26 }}>
            {finalRn.length} files · ~{lines(finalRn)} lines
          </b>
        </div>
        <div className="box native">
          <div className="note">Swift + SwiftUI</div>
          <b style={{ fontSize: 26 }}>
            {finalSw.length} files · ~{lines(finalSw)} lines
          </b>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {compare.map(c => (
          <div key={c.what} className="cmprow">
            <b>{c.what}</b>
            <span className="note">
              <span className="chip js">RN</span> {c.rn}
            </span>
            <span className="note">
              <span className="chip native">Swift</span> {c.sw}
            </span>
          </div>
        ))}
      </div>
      <p className="note" style={{ marginTop: 14 }}>
        Line counts are for the final files shown here, including styles. They are a rough guide,
        not a benchmark. React Native reaches Android and web from the same code, which Swift does
        not.
      </p>
    </>
  )
}

export default function TodoPage() {
  const [tab, setTab] = useState<'steps' | 'final' | 'compare'>('steps')
  return (
    <>
      <motion.header
        className="hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22 }}
      >
        <div className="kicker">Build along</div>
        <h1>Build a todo app, twice</h1>
        <div className="tldr">
          <b>THE IDEA</b>One app, eleven steps. Follow React Native with Expo on one side and Swift
          with SwiftUI on the other, and watch the live preview gain a feature at every step.
        </div>
      </motion.header>
      <div className="row">
        <Seg
          value={tab}
          onChange={setTab}
          options={[
            { value: 'steps', label: 'Step by step' },
            { value: 'final', label: 'Final code' },
            { value: 'compare', label: 'Compare' },
          ]}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'steps' && <StepByStep />}
          {tab === 'final' && <Final />}
          {tab === 'compare' && <Compare />}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
