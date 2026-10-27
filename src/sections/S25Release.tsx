import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Block, Code, Seg, Stepper } from '../components/ui'

const steps = ['Source', 'Metro (release)', 'Hermes compiler', 'App package']
const stext = [
  'Your TypeScript and JSX files, plus assets.',
  'Metro bundles with dev = false: minified, no warnings, __DEV__ is false.',
  'hermesc compiles the JS bundle ahead of time into Hermes bytecode (.hbc).',
  'The bytecode file is embedded in the IPA / APK. At launch Hermes memory-maps it and runs it with no parsing.',
]
const sizes: Record<string, { name: string; mb: number; k: string }[]> = {
  dev: [{ name: 'JS text bundle (dev)', mb: 8.4, k: 'bridge' }],
  release: [
    { name: 'Minified JS', mb: 2.9, k: 'js' },
    { name: 'Hermes bytecode', mb: 3.6, k: 'cpp' },
  ],
}

function Bundle() {
  const [m, setM] = useState<'dev' | 'release'>('release')
  return (
    <>
      <div className="row">
        <Seg
          value={m}
          onChange={setM}
          options={[
            { value: 'dev', label: 'Development' },
            { value: 'release', label: 'Release' },
          ]}
        />
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {sizes[m].map(s => (
          <div key={s.name}>
            <div className="note">
              {s.name}: <b>{s.mb} MB</b> (illustrative)
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
                animate={{ width: `${(s.mb / 9) * 100}%` }}
                style={{ height: '100%', background: `var(--${s.k})` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        {m === 'dev'
          ? 'Development: served by Metro, readable, with warnings and Fast Refresh. Hermes must parse it on startup.'
          : 'Release: minified source is compiled to bytecode. Startup skips parsing, so the app opens faster.'}
      </p>
    </>
  )
}

function Symbolicate() {
  const [on, setOn] = useState(false)
  return (
    <>
      <div className="row">
        <button className="btn primary" onClick={() => setOn(o => !o)}>
          {on ? 'Show raw stack' : 'Symbolicate with source map'}
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={String(on)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <Code lang="json" title={on ? 'symbolicated' : 'production crash report'}>
            {on
              ? `TypeError: Cannot read property 'name' of undefined\n  at handlePress (src/screens/Profile.tsx:42:11)\n  at onPress (src/components/Button.tsx:18:5)`
              : `TypeError: Cannot read property 'name' of undefined\n  at a (address at index.android.bundle:1:48213)\n  at b (address at index.android.bundle:1:51877)`}
          </Code>
        </motion.div>
      </AnimatePresence>
      <p className="note" style={{ marginTop: 10 }}>
        The source map is a file that maps positions in the bundle back to your original files.
        Upload it to your crash reporter at release time and keep it private.
      </p>
    </>
  )
}

function Ota() {
  const [app, setApp] = useState<'1.0' | '2.0'>('1.0')
  const ok = app === '1.0'
  const steps2 = [
    'App launches',
    'Asks update server: anything new for runtime ' + app + '?',
    ok
      ? 'Server returns the new JS bundle + assets'
      : 'Server returns nothing: bundle targets runtime 1.0',
    ok ? 'Downloaded and stored on device' : 'App keeps its embedded bundle',
    ok ? 'Next launch runs the new JS' : 'A new store build is required',
  ]
  return (
    <>
      <div className="row">
        <span className="note">Installed app version (runtime version)</span>
        <Seg
          value={app}
          onChange={setApp}
          options={[
            { value: '1.0', label: '1.0' },
            { value: '2.0', label: '2.0' },
          ]}
        />
        <span className="note">
          Published update targets: <b>1.0</b>
        </span>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <AnimatePresence mode="popLayout">
          {steps2.map((s, i) => (
            <motion.div
              key={app + s}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 }}
              className={`box ${i === steps2.length - 1 ? (ok ? 'native' : 'bridge') : ''}`}
            >
              {s}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        OTA (CodePush, EAS Update) can only replace JavaScript and assets. Native code changes need
        a new build, so updates are tied to a runtime version that describes the native layer.
      </p>
    </>
  )
}

export default function S25() {
  const [s, setS] = useState(0)
  return (
    <>
      <Block title="From source to release bundle" lead="Step through what your build does.">
        <Stepper steps={steps} step={s} setStep={setS} />
        <p className="tldr" style={{ fontSize: 15 }}>
          <b>{steps[s].toUpperCase()}</b>
          {stext[s]}
        </p>
        <Bundle />
      </Block>
      <Block
        title="Source maps and symbolication"
        lead="A production crash points into a minified bundle. A source map turns it back into your code."
      >
        <Symbolicate />
      </Block>
      <Block
        title="OTA updates"
        lead="Switch the installed app version and see if the update applies."
      >
        <Ota />
      </Block>
    </>
  )
}
