import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Block, Code, Seg } from '../components/ui'

const goals = {
  'Call a platform API': {
    build: 'Native module (TurboModule)',
    files: ['NativeBattery.ts  (spec)', 'BatteryModule.kt  (Android)', 'RCTBattery.mm  (iOS)'],
    code: `export interface Spec extends TurboModule {\n  getLevel(): Promise<number>;\n}\nexport default TurboModuleRegistry.getEnforcing<Spec>('Battery');`,
  },
  'Show native UI': {
    build: 'Native component (Fabric)',
    files: [
      'MapViewNativeComponent.ts  (props spec)',
      'MapViewManager.kt  (Android)',
      'RCTMapView.mm  (iOS)',
    ],
    code: `export default codegenNativeComponent<{\n  zoom?: Int32;\n  onRegionChange?: DirectEventHandler<{ lat: Double }>;\n}>('MapView');`,
  },
  'Share heavy logic': {
    build: 'C++ module',
    files: ['NativeCrypto.ts  (spec)', 'NativeCrypto.cpp  (shared, once)'],
    code: `class NativeCrypto : public NativeCryptoCxxSpec<NativeCrypto> {\n public:\n  std::string hash(jsi::Runtime& rt, std::string input);\n};`,
  },
  'Run on a new OS': {
    build: 'Out-of-tree platform',
    files: [
      'Host components for the OS',
      'TurboModule implementations',
      'Event loop + view mounting layer',
    ],
    code: `// react-native-windows, react-native-macos,\n// react-native-tvos, react-native-web\n// each re-implements the native layer.`,
  },
} as const
type G = keyof typeof goals

function Chooser() {
  const [g, setG] = useState<G>('Call a platform API')
  const x = goals[g]
  return (
    <>
      <div className="row">
        {(Object.keys(goals) as G[]).map(k => (
          <button
            key={k}
            className="btn"
            style={{
              borderColor: k === g ? 'var(--accent)' : undefined,
              background: k === g ? 'var(--accent-soft)' : undefined,
            }}
            onClick={() => setG(k)}
          >
            {k}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={g}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="box cpp" style={{ marginBottom: 10 }}>
            <div className="note">You build a</div>
            <b style={{ fontSize: 20 }}>{x.build}</b>
          </div>
          <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
            {x.files.map(f => (
              <div
                key={f}
                className="box"
                style={{ padding: '6px 12px', fontFamily: 'var(--mono)', fontSize: 13 }}
              >
                {f}
              </div>
            ))}
          </div>
          <Code title="what you write">{x.code}</Code>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

const plats = {
  iOS: ['UIKit views', 'Objective-C++ modules'],
  Android: ['Android Views', 'Kotlin / JNI modules'],
  Windows: ['WinUI / Composition visuals', 'C++/WinRT modules'],
  macOS: ['AppKit views', 'Objective-C++ modules'],
  Web: ['DOM elements (react-native-web)', 'Browser APIs'],
} as const
type P = keyof typeof plats

function Platforms() {
  const [p, setP] = useState<P>('iOS')
  return (
    <>
      <div className="row">
        <Seg
          value={p}
          onChange={setP}
          options={(Object.keys(plats) as P[]).map(v => ({ value: v, label: v }))}
        />
      </div>
      <div style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
        <div className="box js">
          Your React code <span className="note">same everywhere</span>
        </div>
        <div className="box js">
          React reconciler <span className="note">same everywhere</span>
        </div>
        <div className="box cpp">
          Fabric + Yoga + JSI core <span className="note">shared C++ (not on web)</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={p}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="box native"
            style={{ borderStyle: 'dashed' }}
          >
            <b>{p}</b> platform layer: {plats[p][0]}, {plats[p][1]}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}

export default function S26() {
  return (
    <>
      <Block title="What do you want to build?" lead="Pick a goal and see what you write.">
        <Chooser />
      </Block>
      <Block
        title="Out-of-tree platforms"
        lead="Only the bottom layer is platform-specific. A new platform replaces it and reuses everything above."
      >
        <Platforms />
      </Block>
      <Block title="Writing native code, step by step">
        <ol className="note" style={{ lineHeight: 1.9 }}>
          <li>Write the typed spec in TypeScript.</li>
          <li>Run Codegen to produce the native interfaces (section 6).</li>
          <li>Implement the interface in Kotlin, Objective-C++ or C++.</li>
          <li>Autolinking registers it in the app (section 27).</li>
        </ol>
      </Block>
    </>
  )
}
