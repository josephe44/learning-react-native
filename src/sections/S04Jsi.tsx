import { useState } from 'react'
import { motion } from 'framer-motion'
import { Block, Code } from '../components/ui'

const bridgeSteps = [
  'Stringify args',
  'Enqueue',
  'Wait for flush',
  'Parse JSON',
  'Run native',
  'Stringify result',
  'Callback to JS',
]
const jsiSteps = ['Call function', 'Result']

function Race() {
  const [run, setRun] = useState(0)
  const lane = (title: string, steps: string[], color: string, per: number) => (
    <div style={{ marginBottom: 16 }}>
      <b style={{ color }}>{title}</b>
      <div style={{ display: 'flex', gap: 4, marginTop: 6, minHeight: 34 }}>
        {run === 0 && (
          <span className="note" style={{ alignSelf: 'center' }}>
            Press the button to run this path.
          </span>
        )}
        {run > 0 &&
          steps.map((s, i) => (
            <motion.div
              key={`${run}-${s}`}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * per }}
              style={{
                flex: 1,
                fontSize: 11,
                textAlign: 'center',
                padding: '8px 2px',
                borderRadius: 8,
                background: `color-mix(in srgb, ${color} 16%, var(--panel))`,
                border: `1px solid ${color}`,
                color: 'var(--text)',
              }}
            >
              {s}
            </motion.div>
          ))}
      </div>
    </div>
  )
  return (
    <>
      <div className="row">
        <button className="btn primary" onClick={() => setRun(r => r + 1)}>
          Call native: getBatteryLevel()
        </button>
      </div>
      {lane('Old: via the Bridge (async, 7 hops)', bridgeSteps, 'var(--bridge)', 0.5)}
      {lane('New: via JSI (sync, 2 hops)', jsiSteps, 'var(--cpp)', 0.25)}
      <p className="note">
        With JSI the answer is available on the very next line:{' '}
        <code>const level = Battery.get()</code>.
      </p>
    </>
  )
}

function HostObject() {
  const [hover, setHover] = useState<string | null>(null)
  const info: Record<string, string> = {
    js: 'A normal-looking JS object. Reading properties or calling methods on it runs C++ code instead.',
    ho: 'A C++ HostObject. It implements get()/set() so JS property access is routed here.',
    hf: 'A C++ HostFunction. JS can call it like any function; arguments arrive as jsi::Value, no JSON.',
    nat: 'The C++ code can then call Obj-C++ / JNI into the platform APIs.',
  }
  const node = (k: string, label: string, cls: string) => (
    <motion.div
      className={`box ${cls}`}
      whileHover={{ scale: 1.06 }}
      onHoverStart={() => setHover(k)}
      onHoverEnd={() => setHover(null)}
      style={{ cursor: 'help', flex: 1, textAlign: 'center' }}
    >
      {label}
    </motion.div>
  )
  return (
    <>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {node('js', 'global.myModule', 'js')}
        <span>→</span>
        {node('ho', 'HostObject (C++)', 'cpp')}
        <span>→</span>
        {node('hf', 'HostFunction (C++)', 'cpp')}
        <span>→</span>
        {node('nat', 'Platform API', 'native')}
      </div>
      <p className="tldr" style={{ marginTop: 14, fontSize: 15, minHeight: 58 }}>
        <b>HOVER A BOX</b>
        {hover ? info[hover] : 'Hover over each piece of the chain.'}
      </p>
      <Code
        lang="cpp"
        title="C++ · expose a function to JS"
      >{`auto fn = jsi::Function::createFromHostFunction(
    rt,
    jsi::PropNameID::forAscii(rt, "getBattery"),
    0,
    [](jsi::Runtime& rt,
       const jsi::Value&,
       const jsi::Value*,
       size_t) {
      // returns right away, no JSON involved
      return jsi::Value(readBatteryLevel());
    });

rt.global().setProperty(rt, "getBattery", fn);`}</Code>
    </>
  )
}

export default function S04() {
  return (
    <>
      <Block
        title="What JSI is"
        lead="JSI (JavaScript Interface) is a thin C++ API over the JS engine. It lets C++ create objects and functions that JS can hold and call directly — like giving JS a phone line instead of a mailbox."
      >
        <div className="grid3">
          <div className="box cpp">
            <b>Synchronous</b>
            <p className="note">Call and get the result immediately.</p>
          </div>
          <div className="box cpp">
            <b>No JSON</b>
            <p className="note">Values pass by reference, no copies.</p>
          </div>
          <div className="box cpp">
            <b>Engine-agnostic</b>
            <p className="note">Same API for Hermes, JSC, V8.</p>
          </div>
        </div>
      </Block>
      <Block title="Race: Bridge vs JSI" lead="Same question, two paths.">
        <Race />
      </Block>
      <Block
        title="HostObjects &amp; HostFunctions"
        lead="These are the two building blocks. Hover the chain."
      >
        <HostObject />
      </Block>
      <Block
        title="Memory ownership across the boundary"
        lead="A HostObject lives in C++ but is referenced from JS. Ownership is shared:"
      >
        <ul className="note" style={{ lineHeight: 1.9 }}>
          <li>JS holds the object; the engine's GC decides when the JS handle dies.</li>
          <li>
            C++ usually keeps a <code>std::shared_ptr</code> so the native part stays alive while JS
            can still reach it.
          </li>
          <li>
            Danger: C++ lambdas that capture the runtime or JS values after the runtime is destroyed
            crash the app.
          </li>
        </ul>
      </Block>
    </>
  )
}
