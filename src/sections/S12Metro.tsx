import { useState } from 'react'
import { motion } from 'framer-motion'
import { Block, Code, Seg, Stepper } from '../components/ui'

const stages = ['Resolve', 'Transform', 'Serialize']
const stageText = [
  'Metro follows import statements from index.js and finds each file on disk (node_modules, platform extensions like .ios.js).',
  'Each file goes through Babel: JSX and TypeScript are compiled, imports become require calls.',
  'All modules are wrapped in functions, numbered, and concatenated into one bundle. Hermes later compiles it to bytecode.',
]
const stageCode = [
  `import Header from './Header'\nimport { theme } from './theme'`,
  `var _Header = require(_dependencyMap[0])\nvar _theme = require(_dependencyMap[1])`,
  `__d(function (global, require, module, exports) {\n  // App.js\n}, 12, [34, 35])`,
]

const graph: Record<string, string[]> = {
  index: ['App'],
  App: ['Header', 'Counter'],
  Header: ['theme'],
  Counter: ['theme'],
  theme: [],
}
const importers = (m: string) => Object.keys(graph).filter(k => graph[k].includes(m))
const closure = (m: string): string[] => (m === 'theme' ? ['theme', ...importers('theme')] : [m])

function FastRefresh() {
  const [edit, setEdit] = useState<string | null>(null)
  const hit = edit ? closure(edit) : []
  return (
    <>
      <div className="row">
        <span className="note">Save a change in:</span>
        {['Header', 'theme'].map(m => (
          <button
            key={m}
            className="btn"
            onClick={() => {
              setEdit(null)
              setTimeout(() => setEdit(m), 30)
            }}
          >
            {m}.js
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {Object.keys(graph).map(m => (
          <motion.div
            key={m + (hit.includes(m) ? edit : '')}
            className={`box ${hit.includes(m) ? 'native' : ''}`}
            initial={hit.includes(m) ? { scale: 1.2 } : false}
            animate={{ scale: 1 }}
          >
            {m}.js{' '}
            <div className="note" style={{ fontSize: 11 }}>
              {hit.includes(m) ? 're-run' : 'untouched'}
            </div>
          </motion.div>
        ))}
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        {edit === 'Header'
          ? 'Only Header re-runs and its component re-renders. State in the rest of the app is kept.'
          : edit === 'theme'
            ? 'theme.js has no components, so Fast Refresh re-runs the files that import it (Header, Counter).'
            : 'Pick a file to edit.'}
      </p>
    </>
  )
}

function Inline() {
  const [on, setOn] = useState<'off' | 'on'>('off')
  const mods = ['Home', 'Settings', 'Chart', 'Camera', 'Maps', 'Chat']
  const [opened, setOpened] = useState<string[]>(['Home'])
  const loaded = (m: string) => on === 'off' || opened.includes(m)
  return (
    <>
      <div className="row">
        <Seg
          value={on}
          onChange={v => {
            setOn(v)
            setOpened(['Home'])
          }}
          options={[
            { value: 'off', label: 'Eager requires' },
            { value: 'on', label: 'Inline requires' },
          ]}
        />
        <span className="note">
          Modules run at startup: <b>{mods.filter(loaded).length}</b> of {mods.length}
        </span>
      </div>
      <div className="grid3">
        {mods.map(m => (
          <motion.button
            key={m}
            className={`box ${loaded(m) ? 'js' : ''}`}
            animate={{ opacity: loaded(m) ? 1 : 0.4 }}
            style={{ color: 'inherit', textAlign: 'left' }}
            onClick={() => on === 'on' && !opened.includes(m) && setOpened([...opened, m])}
          >
            {m}.js
            <div className="note">
              {loaded(m) ? 'evaluated' : 'not loaded (click to open screen)'}
            </div>
          </motion.button>
        ))}
      </div>
    </>
  )
}

export default function S12() {
  const [s, setS] = useState(0)
  return (
    <>
      <Block
        title="From files to one bundle"
        lead="Metro is the bundler. It runs three stages every time you build."
      >
        <Stepper steps={stages} step={s} setStep={setS} />
        <Code title={`stage ${s + 1}`}>{stageCode[s]}</Code>
        <p className="tldr" style={{ marginTop: 14, fontSize: 15 }}>
          <b>{stages[s].toUpperCase()}</b>
          {stageText[s]}
        </p>
      </Block>
      <Block
        title="Fast Refresh"
        lead="Edit a file and Metro sends only that module. Watch what re-runs."
      >
        <FastRefresh />
      </Block>
      <Block
        title="Inline requires"
        lead="Without them, every module runs at startup. With them, a module runs the first time it is used."
      >
        <Inline />
      </Block>
    </>
  )
}
