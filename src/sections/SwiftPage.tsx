import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Code, Seg } from '../components/ui'
import {
  components,
  hig,
  languagePairs,
  projects,
  rules,
  setup,
  sources,
  stages,
  toolbox,
  uiPairs,
  type Pair,
} from '../data/swiftData'

type Tab = 'translate' | 'path' | 'components' | 'projects' | 'tools' | 'style'
const tabs: { value: Tab; label: string }[] = [
  { value: 'translate', label: 'Translate' },
  { value: 'path', label: 'Learning path' },
  { value: 'components', label: 'Components' },
  { value: 'projects', label: 'Projects' },
  { value: 'tools', label: 'Tools' },
  { value: 'style', label: 'Style' },
]

const KEY = 'swift-done'
function useChecks() {
  const [done, setDone] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]')
    } catch {
      return []
    }
  })
  const toggle = useCallback((id: string) => {
    setDone(d => {
      const next = d.includes(id) ? d.filter(x => x !== id) : [...d, id]
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])
  const reset = () => {
    setDone([])
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }
  return { done, toggle, reset }
}
type Checks = ReturnType<typeof useChecks>

const Check = ({ id, c, label }: { id: string; c: Checks; label: string }) => (
  <label className="swcheck">
    <input
      type="checkbox"
      checked={c.done.includes(id)}
      onChange={() => c.toggle(id)}
      aria-label={`Done: ${label}`}
    />
    <span className="box-mark" aria-hidden="true" />
  </label>
)

function Translate() {
  const [mode, setMode] = useState<'language' | 'ui'>('ui')
  const list: Pair[] = mode === 'ui' ? uiPairs : languagePairs
  const [sel, setSel] = useState<Record<string, string>>({})
  const cur = list.find(p => p.id === sel[mode]) ?? list[0]
  return (
    <>
      <div className="row">
        <Seg
          value={mode}
          onChange={setMode}
          options={[
            { value: 'ui', label: 'React to SwiftUI' },
            { value: 'language', label: 'TypeScript to Swift' },
          ]}
        />
      </div>
      <div className="swchips">
        {list.map(p => (
          <button
            key={p.id}
            className={`swchip ${p.id === cur.id ? 'on' : ''}`}
            onClick={() => setSel(s => ({ ...s, [mode]: p.id }))}
          >
            {p.title}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={mode + cur.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="cols2">
            <Code lang="tsx" title={mode === 'ui' ? 'React Native' : 'TypeScript'}>
              {cur.rn}
            </Code>
            <Code lang="swift" title={mode === 'ui' ? 'SwiftUI' : 'Swift'}>
              {cur.swift}
            </Code>
          </div>
          <p className="tldr" style={{ marginTop: 14, fontSize: 15 }}>
            <b>WHAT TO NOTICE</b>
            {cur.note}
          </p>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

function Path({ c }: { c: Checks }) {
  const [open, setOpen] = useState<string | null>('s1')
  const all = stages.flatMap(s => s.items.map((_, i) => `${s.id}-${i}`))
  const total = all.length,
    finished = all.filter(id => c.done.includes(id)).length
  return (
    <>
      <div className="box cpp" style={{ marginBottom: 16 }}>
        <div className="row" style={{ marginBottom: 8, justifyContent: 'space-between' }}>
          <b>
            {finished} of {total} topics done
          </b>
          <button className="btn" onClick={c.reset}>
            Reset progress
          </button>
        </div>
        <div className="progress" style={{ margin: 0 }}>
          <div style={{ width: `${(finished / total) * 100}%` }} />
        </div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {stages.map((s, si) => {
          const n = s.items.filter((_, i) => c.done.includes(`${s.id}-${i}`)).length
          const isOpen = open === s.id
          return (
            <div key={s.id} className="swstage">
              <button
                className="swstagehead"
                onClick={() => setOpen(isOpen ? null : s.id)}
                aria-expanded={isOpen}
              >
                <span className="swnum">{si + 1}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>
                  <b>{s.title}</b>
                  <span className="note" style={{ display: 'block' }}>
                    {s.goal}
                  </span>
                </span>
                <span className="chip cpp">{s.weeks}</span>
                <span className="note" style={{ minWidth: 38, textAlign: 'right' }}>
                  {n}/{s.items.length}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '4px 16px 16px', display: 'grid', gap: 8 }}>
                      {s.items.map((it, i) => (
                        <div key={it.t} className="switem">
                          <Check id={`${s.id}-${i}`} c={c} label={it.t} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <b>{it.t}</b>
                            <div className="note">{it.note}</div>
                          </div>
                          <span
                            className="chip js"
                            title="What you know from React Native"
                            style={{ alignSelf: 'flex-start' }}
                          >
                            {it.rn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </>
  )
}

function Components({ c }: { c: Checks }) {
  const [lv, setLv] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All')
  const [open, setOpen] = useState('button')
  const list = components.filter(b => lv === 'All' || b.level === lv)
  const cur = components.find(b => b.id === open) ?? components[0]
  return (
    <>
      <div className="row">
        <Seg
          value={lv}
          onChange={setLv}
          options={(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map(v => ({
            value: v,
            label: v,
          }))}
        />
      </div>
      <div className="swgrid">
        {list.map(b => (
          <button
            key={b.id}
            className={`swcard ${b.id === cur.id ? 'on' : ''}`}
            onClick={() => setOpen(b.id)}
          >
            <span
              className="row"
              style={{ marginBottom: 4, justifyContent: 'space-between', flexWrap: 'nowrap' }}
            >
              <b style={{ textAlign: 'left' }}>{b.name}</b>
              {c.done.includes('c-' + b.id) && <span className="ok">done</span>}
            </span>
            <span
              className="chip"
              style={{
                color:
                  b.level === 'Beginner'
                    ? 'var(--native)'
                    : b.level === 'Intermediate'
                      ? 'var(--js)'
                      : 'var(--bridge)',
              }}
            >
              {b.level}
            </span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={cur.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ marginTop: 18 }}
        >
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 22 }}>{cur.name}</h3>
            <label className="note" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Check id={'c-' + cur.id} c={c} label={cur.name} /> I built this
            </label>
          </div>
          <p className="note" style={{ marginBottom: 10 }}>
            {cur.blurb}
          </p>
          <div className="row">
            {cur.concepts.map(x => (
              <span key={x} className="chip cpp">
                {x}
              </span>
            ))}
          </div>
          <p className="note" style={{ marginBottom: 12 }}>
            In React Native you would reach for: <b>{cur.rn}</b>
          </p>
          <Code lang="swift" title={cur.name}>
            {cur.code}
          </Code>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

function Projects({ c }: { c: Checks }) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {projects.map((p, pi) => {
        const n = p.milestones.filter((_, i) => c.done.includes(`p-${p.id}-${i}`)).length
        return (
          <motion.div
            key={p.id}
            className="swproject"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
          >
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <h3 style={{ fontSize: 22 }}>
                <span className="note" style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
                  Project {pi + 1}
                </span>
                <br />
                {p.name}
              </h3>
              <div className="row" style={{ marginBottom: 0 }}>
                <span className="chip js">{p.level}</span>
                <span className="chip cpp">{p.time}</span>
              </div>
            </div>
            <p className="note" style={{ marginBottom: 12 }}>
              {p.blurb}
            </p>
            <div className="cols2">
              <div>
                <div className="swlabel">
                  Milestones ({n}/{p.milestones.length})
                </div>
                <div className="progress" style={{ margin: '6px 0 10px' }}>
                  <div style={{ width: `${(n / p.milestones.length) * 100}%` }} />
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {p.milestones.map((m, i) => (
                    <div key={m} className="switem">
                      <Check id={`p-${p.id}-${i}`} c={c} label={m} />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="swlabel">You will learn</div>
                <div className="row" style={{ marginTop: 6 }}>
                  {p.learn.map(x => (
                    <span key={x} className="chip cpp">
                      {x}
                    </span>
                  ))}
                </div>
                <div className="swlabel">Stack</div>
                <p className="note" style={{ margin: '4px 0 10px' }}>
                  {p.stack}
                </p>
                <div className="swlabel">Compare with</div>
                <p className="note" style={{ margin: '4px 0 10px' }}>
                  {p.rn}
                </p>
                <div className="swlabel">Stretch goal</div>
                <p className="note" style={{ margin: '4px 0 0' }}>
                  {p.stretch}
                </p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function Tools({ c }: { c: Checks }) {
  const [v, setV] = useState<'map' | 'setup'>('map')
  return (
    <>
      <div className="row">
        <Seg
          value={v}
          onChange={setV}
          options={[
            { value: 'map', label: 'Your toolbox, translated' },
            { value: 'setup', label: 'Setup checklist' },
          ]}
        />
      </div>
      {v === 'map' ? (
        <div style={{ display: 'grid', gap: 8 }}>
          {toolbox.map(t => (
            <div key={t.rn} className="swtool">
              <span className="chip js" style={{ justifySelf: 'start' }}>
                {t.rn}
              </span>
              <span className="note" aria-hidden="true">
                becomes
              </span>
              <span className="chip native" style={{ justifySelf: 'start' }}>
                {t.sw}
              </span>
              <p className="note" style={{ gridColumn: '1 / -1' }}>
                {t.note}
              </p>
            </div>
          ))}
          <div className="box" style={{ marginTop: 8 }}>
            <b>Versions to know (checked against Apple and swift.org docs)</b>
            <ul className="note" style={{ lineHeight: 1.8, marginTop: 6 }}>
              <li>
                The Swift book covers Swift 6.4, and swift.org lists 6.4.1 as the latest release.
              </li>
              <li>
                Observation (@Observable) and SwiftData need iOS 17 or later. NavigationStack needs
                iOS 16 or later.
              </li>
              <li>Liquid Glass and glassEffect(_:in:) arrived with the iOS 26 SDK.</li>
              <li>
                Building with Xcode 27 turns @State into a macro and adds ContentBuilder, per
                Apple's SwiftUI updates page.
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {setup.map((s, i) => (
            <div key={s} className="switem">
              <Check id={`t-${i}`} c={c} label={s} />
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function Order() {
  const [first, setFirst] = useState<'padding' | 'background'>('padding')
  const pad = first === 'padding'
  return (
    <>
      <div className="row">
        <Seg
          value={first}
          onChange={setFirst}
          options={[
            { value: 'padding', label: '.padding() then .background()' },
            { value: 'background', label: '.background() then .padding()' },
          ]}
        />
      </div>
      <div className="cols2">
        <div className="box" style={{ display: 'grid', placeItems: 'center', minHeight: 130 }}>
          {pad ? (
            <motion.span
              layout
              style={{
                padding: 18,
                background: 'var(--accent)',
                color: 'var(--on-solid)',
                fontWeight: 700,
                borderRadius: 4,
              }}
            >
              Hello
            </motion.span>
          ) : (
            <span style={{ padding: 18 }}>
              <motion.span
                layout
                style={{
                  background: 'var(--accent)',
                  color: 'var(--on-solid)',
                  fontWeight: 700,
                  borderRadius: 4,
                }}
              >
                Hello
              </motion.span>
            </span>
          )}
        </div>
        <Code lang="swift" title="SwiftUI">
          {pad
            ? 'Text("Hello")\n  .padding()\n  .background(.tint)'
            : 'Text("Hello")\n  .background(.tint)\n  .padding()'}
        </Code>
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        {pad
          ? 'The background is applied after padding, so it covers the text and the padding.'
          : 'The background is applied first and only covers the text. The padding then adds empty space around it.'}{' '}
        In React Native, style order never matters. In SwiftUI every modifier wraps the view before
        it.
      </p>
    </>
  )
}

function Style() {
  const [r, setR] = useState(rules[0].id)
  const cur = rules.find(x => x.id === r)!
  return (
    <>
      <h3 style={{ fontSize: 20, marginBottom: 10 }}>Swift habits to build</h3>
      <div className="swchips">
        {rules.map(x => (
          <button
            key={x.id}
            className={`swchip ${x.id === r ? 'on' : ''}`}
            onClick={() => setR(x.id)}
          >
            {x.title}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={r}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="cols2">
            <div>
              <div className="swlabel err">Avoid</div>
              <Code lang="swift" title="avoid">
                {cur.avoid}
              </Code>
            </div>
            <div>
              <div className="swlabel ok">Prefer</div>
              <Code lang="swift" title="prefer">
                {cur.prefer}
              </Code>
            </div>
          </div>
          <p className="tldr" style={{ marginTop: 14, fontSize: 15 }}>
            <b>WHY</b>
            {cur.why}
          </p>
        </motion.div>
      </AnimatePresence>
      <h3 style={{ fontSize: 20, margin: '28px 0 10px' }}>Modifier order, live</h3>
      <Order />
      <h3 style={{ fontSize: 20, margin: '28px 0 10px' }}>Design rules that make it feel native</h3>
      <div className="grid3">
        {hig.map(h => (
          <div key={h.t} className="box">
            <b>{h.t}</b>
            <p className="note" style={{ marginTop: 4 }}>
              {h.d}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

export default function SwiftPage() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'translate'
  const c = useChecks()
  const setTab = (t: Tab) => setParams({ tab: t }, { replace: true })
  const blurb: Record<Tab, string> = {
    translate:
      'Pick a concept you already know. See the React Native code next to the Swift or SwiftUI version.',
    path: 'Nine stages from language basics to shipping. Tick topics as you finish them. Each shows what it replaces in React Native.',
    components:
      'Twelve components to build by hand. Each has concepts, the React Native equivalent and working starter code.',
    projects:
      'Six projects from a weekend app to a TestFlight build, each with milestones you can tick off.',
    tools:
      'The Swift world has a different toolbox. Here is what replaces each tool you use today.',
    style:
      'Swift has strong conventions. Learn the habits that make your code look like it belongs.',
  }
  return (
    <>
      <motion.header
        className="hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22 }}
      >
        <div className="kicker">Swift track</div>
        <h1>Swift and SwiftUI for React Native engineers</h1>
        <div className="tldr">
          <b>WHO THIS IS FOR</b>You are a React Native engineer who wants to learn Swift and
          SwiftUI. You already think in components, state and props. SwiftUI uses the same ideas
          with different syntax, so this page maps what you know to what you need.
        </div>
      </motion.header>

      <div className="grid3" style={{ marginBottom: 22 }}>
        <div className="box native">
          <b>Same</b>
          <p className="note">Declarative UI, components, state-driven rendering, composition.</p>
        </div>
        <div className="box js">
          <b>Different</b>
          <p className="note">
            Static types, value semantics, modifiers instead of style objects, optionals.
          </p>
        </div>
        <div className="box bridge">
          <b>New</b>
          <p className="note">
            Xcode, Swift Package Manager, signing, Instruments, the Apple design language.
          </p>
        </div>
      </div>

      <div className="swtabs" role="tablist">
        {tabs.map(t => (
          <button
            key={t.value}
            role="tab"
            aria-selected={tab === t.value}
            className={`swtab ${tab === t.value ? 'on' : ''}`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
            {tab === t.value && <motion.span layoutId="swtab" className="swtabline" />}
          </button>
        ))}
      </div>
      <p className="lead" style={{ color: 'var(--dim)', margin: '14px 0 18px', maxWidth: '66ch' }}>
        {blurb[tab]}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'translate' && <Translate />}
          {tab === 'path' && <Path c={c} />}
          {tab === 'components' && <Components c={c} />}
          {tab === 'projects' && <Projects c={c} />}
          {tab === 'tools' && <Tools c={c} />}
          {tab === 'style' && <Style />}
        </motion.div>
      </AnimatePresence>

      <section className="block" style={{ marginTop: 36 }}>
        <h2>Sources</h2>
        <p className="lead">
          Everything above follows these official docs. Open them when you want the full detail.
        </p>
        <div className="grid3">
          {sources.map(s => (
            <a
              key={s.u}
              className="btn"
              href={s.u}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              {s.t}
            </a>
          ))}
        </div>
      </section>
    </>
  )
}
