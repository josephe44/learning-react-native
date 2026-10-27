import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Block, Code, Seg } from '../components/ui'

const cli = {
  'Community CLI': [
    'npx @react-native-community/cli init',
    'You own android/ and ios/ folders',
    'Native config edited by hand',
    'Best when you need full native control',
  ],
  'Expo CLI': [
    'npx create-expo-app',
    'Native folders generated on demand (prebuild)',
    'Config lives in app.json plugins',
    'Best for fast start, still allows custom native code',
  ],
} as const
type C = keyof typeof cli

function Cli() {
  const [c, setC] = useState<C>('Expo CLI')
  return (
    <>
      <div className="row">
        <Seg
          value={c}
          onChange={setC}
          options={(Object.keys(cli) as C[]).map(v => ({ value: v, label: v }))}
        />
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={c}
            style={{ display: 'grid', gap: 8 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {cli[c].map((l, i) => (
              <motion.div
                key={l}
                initial={{ x: -12, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className={`box ${i === 0 ? 'cpp' : ''}`}
              >
                {l}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}

function ModulesApi() {
  const [m, setM] = useState<'expo' | 'turbo'>('expo')
  return (
    <>
      <div className="row">
        <Seg
          value={m}
          onChange={setM}
          options={[
            { value: 'expo', label: 'Expo Modules API' },
            { value: 'turbo', label: 'TurboModule' },
          ]}
        />
      </div>
      {m === 'expo' ? (
        <Code
          lang="kotlin"
          title="BatteryModule.kt (one file)"
        >{`class BatteryModule : Module() {\n  override fun definition() = ModuleDefinition {\n    Name("Battery")\n\n    Function("getLevel") {\n      readBatteryLevel()\n    }\n  }\n}`}</Code>
      ) : (
        <Code
          lang="kotlin"
          title="BatteryModule.kt (plus spec, package, iOS twin)"
        >{`class BatteryModule(ctx: ReactApplicationContext) :\n    NativeBatterySpec(ctx) {\n  override fun getName() = NAME\n  override fun getLevel(promise: Promise) {\n    promise.resolve(readBatteryLevel())\n  }\n  companion object { const val NAME = "Battery" }\n}`}</Code>
      )}
      <p className="note" style={{ marginTop: 10 }}>
        {m === 'expo'
          ? 'Expo Modules API gives a Swift and Kotlin DSL. Types and registration are handled for you.'
          : 'A TurboModule needs a TS spec, generated base class, a package registration and a matching iOS file.'}
      </p>
    </>
  )
}

const libs = [
  { n: 'react-native-camera', pod: 'RNCamera', gradle: ':react-native-camera' },
  { n: 'react-native-maps', pod: 'react-native-maps', gradle: ':react-native-maps' },
  { n: 'react-native-mmkv', pod: 'react-native-mmkv', gradle: ':react-native-mmkv' },
]
function Autolink() {
  const [inst, setInst] = useState<string[]>([])
  const on = libs.filter(l => inst.includes(l.n))
  return (
    <>
      <div className="row">
        {libs.map(l => (
          <button
            key={l.n}
            className="btn"
            disabled={inst.includes(l.n)}
            onClick={() => setInst([...inst, l.n])}
          >
            npm install {l.n}
          </button>
        ))}
        <button className="btn" onClick={() => setInst([])}>
          Reset
        </button>
      </div>
      <div
        className="grid3"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
      >
        <Code lang="kotlin" title="iOS: Pods installed (generated)">
          {on.length ? on.map(l => `pod '${l.pod}'`).join('\n') : '// no native libraries yet'}
        </Code>
        <Code lang="kotlin" title="Android: Gradle projects (generated)">
          {on.length
            ? on.map(l => `include '${l.gradle}'`).join('\n')
            : '// no native libraries yet'}
        </Code>
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        Autolinking scans node_modules for packages with native code and writes the native build
        files for you. No manual linking step.
      </p>
    </>
  )
}

export default function S27() {
  return (
    <>
      <Block title="Community CLI vs Expo CLI">
        <Cli />
      </Block>
      <Block title="Expo Modules API" lead="A friendlier way to write native modules.">
        <ModulesApi />
      </Block>
      <Block title="Autolinking" lead="Install some libraries and see what gets linked.">
        <Autolink />
      </Block>
      <Block title="You made it">
        <p className="note">
          You have now followed a tap from the screen, through JSI, Fabric and Yoga, to real native
          views, and seen how it is built, shipped and extended. Go back to any section and replay
          its demo.
        </p>
      </Block>
    </>
  )
}
