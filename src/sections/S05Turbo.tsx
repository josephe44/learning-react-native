import { useState } from 'react'
import { motion } from 'framer-motion'
import { Block, Code, Seg } from '../components/ui'

const mods = [
  { n: 'Camera', e: 'CAM', ms: 90 },
  { n: 'Bluetooth', e: 'BLE', ms: 140 },
  { n: 'Storage', e: 'DB', ms: 40 },
  { n: 'Haptics', e: 'HAP', ms: 25 },
  { n: 'Location', e: 'GPS', ms: 80 },
  { n: 'Share', e: 'SHR', ms: 30 },
]

function Lazy() {
  const [mode, setMode] = useState<'legacy' | 'turbo'>('turbo')
  const [used, setUsed] = useState<string[]>([])
  const loaded = (n: string) => mode === 'legacy' || used.includes(n)
  const startup = mode === 'legacy' ? mods.reduce((a, m) => a + m.ms, 0) : 0
  const lazy = mods.filter(m => used.includes(m.n)).reduce((a, m) => a + m.ms, 0)
  return (
    <>
      <div className="row">
        <Seg
          value={mode}
          onChange={m => {
            setMode(m)
            setUsed([])
          }}
          options={[
            { value: 'legacy', label: 'Legacy NativeModules' },
            { value: 'turbo', label: 'TurboModules' },
          ]}
        />
        <span className="note">
          {mode === 'turbo' ? 'Click a module to call it from JS.' : 'Everything loads at launch.'}
        </span>
      </div>
      <div className="grid3">
        {mods.map(m => (
          <motion.button
            key={m.n}
            className={`box ${loaded(m.n) ? 'native' : ''}`}
            whileTap={{ scale: 0.95 }}
            animate={{ opacity: loaded(m.n) ? 1 : 0.45 }}
            onClick={() => mode === 'turbo' && !used.includes(m.n) && setUsed([...used, m.n])}
            style={{ textAlign: 'left', color: 'inherit' }}
          >
            <div className="badge">{m.e}</div>
            <b>{m.n}</b>
            <div className="note">{loaded(m.n) ? `loaded (${m.ms} ms)` : 'not loaded'}</div>
          </motion.button>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <div className="note">
          Startup cost paid before first screen: <b>{startup} ms</b> &nbsp;|&nbsp; Paid later on
          demand: <b>{lazy} ms</b>
        </div>
        <div
          style={{
            height: 10,
            background: 'var(--panel2)',
            borderRadius: 99,
            marginTop: 6,
            overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{ width: `${(startup / 405) * 100}%` }}
            style={{ height: '100%', background: 'var(--bridge)' }}
          />
        </div>
      </div>
    </>
  )
}

function SyncAsync() {
  const [out, setOut] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const log = (s: string) => setOut(o => [...o, s])
  const sync = () => {
    setOut([])
    log('call getDeviceName()')
    log('→ "Pixel 9" (returned immediately)')
  }
  const async_ = () => {
    setOut([])
    setBusy(true)
    log('call readFile()  → Promise<pending>')
    setTimeout(() => {
      log('→ "file contents" (resolved later)')
      setBusy(false)
    }, 1200)
  }
  return (
    <>
      <div className="row">
        <button className="btn" onClick={sync}>
          Sync method
        </button>
        <button className="btn" disabled={busy} onClick={async_}>
          Async method
        </button>
      </div>
      <Code title="console">{out.length ? out.join('\n') : '// press a button'}</Code>
      <p className="note" style={{ marginTop: 10 }}>
        Use sync for tiny reads; use async (Promise) for slow work like disk or network, so the JS
        thread never blocks.
      </p>
    </>
  )
}

export default function S05() {
  return (
    <>
      <Block
        title="Legacy vs Turbo"
        lead="Old NativeModules were all registered at launch and called through the bridge. TurboModules load on first use and are called through JSI."
      >
        <Lazy />
      </Block>
      <Block
        title="Type-safe spec"
        lead="Each TurboModule starts as a typed TypeScript file. Codegen (next section) turns it into native interfaces."
      >
        <Code title="NativeMyModule.ts">{`export interface Spec extends TurboModule {
  // sync: returns a value directly
  getDeviceName(): string;

  // async: returns a Promise
  readFile(path: string): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MyModule');`}</Code>
      </Block>
      <Block title="Sync vs async methods">
        <SyncAsync />
      </Block>
      <Block
        title="C++ TurboModules"
        lead="A TurboModule can be written once in C++ and shared by iOS and Android — no per-platform glue, great for heavy logic like crypto or databases."
      >
        <Code
          lang="cpp"
          title="NativeCalc.cpp"
        >{`class NativeCalc : public NativeCalcCxxSpec<NativeCalc> {
 public:
  NativeCalc(std::shared_ptr<CallInvoker> jsInvoker)
      : NativeCalcCxxSpec(std::move(jsInvoker)) {}

  double add(jsi::Runtime& rt, double a, double b) {
    return a + b;  // same code on iOS and Android
  }
};`}</Code>
      </Block>
    </>
  )
}
