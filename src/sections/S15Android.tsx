import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Block, Code, Seg, Stepper } from '../components/ui'

const steps = ['Application', 'MainActivity', 'ReactSurface', 'Android Views']
const text = [
  'MainApplication implements ReactApplication and creates one ReactHost for the whole process.',
  'MainActivity extends ReactActivity. Its delegate asks the ReactHost to start the surface named by getMainComponentName().',
  'A ReactSurface is the area React renders into. Fabric (C++) creates a surface and runs your root component in it.',
  'Mutations from Fabric are applied by the MountingManager, which creates real android.view.View objects on the UI thread.',
]

const types = {
  String: {
    jni: 'jstring',
    cpp: 'jni::local_ref<jstring>',
    note: 'Convert with wrap_alias / toStdString().',
  },
  int: { jni: 'jint', cpp: 'int', note: 'Primitives map one to one.' },
  boolean: { jni: 'jboolean', cpp: 'bool', note: 'jboolean is an unsigned char, fbjni wraps it.' },
  'Object / class': {
    jni: 'jobject',
    cpp: 'jni::alias_ref<JMyClass>',
    note: 'fbjni gives typed, ref-counted handles.',
  },
} as const
type TK = keyof typeof types

function Jni() {
  const [k, setK] = useState<TK>('String')
  const t = types[k]
  return (
    <>
      <div className="row">
        <Seg
          value={k}
          onChange={setK}
          options={(Object.keys(types) as TK[]).map(v => ({ value: v, label: v }))}
        />
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <motion.div layout className="box native">
          Kotlin / Java
          <div>
            <code>{k}</code>
          </div>
        </motion.div>
        <span>→</span>
        <AnimatePresence mode="wait">
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="box bridge"
          >
            JNI
            <div>
              <code>{t.jni}</code>
            </div>
          </motion.div>
        </AnimatePresence>
        <span>→</span>
        <AnimatePresence mode="wait">
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="box cpp"
          >
            fbjni (C++)
            <div>
              <code>{t.cpp}</code>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        {t.note}
      </p>
    </>
  )
}

type Op = { k: string; d: string }
function Mount() {
  const [ops, setOps] = useState<Op[]>([])
  const add = (k: string, d: string) => setOps(o => [...o, { k, d }])
  return (
    <>
      <div className="row">
        <button className="btn" onClick={() => add('CREATE', 'val tv = TextView(context)')}>
          CREATE
        </button>
        <button className="btn" onClick={() => add('INSERT', 'parent.addView(tv, index)')}>
          INSERT
        </button>
        <button className="btn" onClick={() => add('UPDATE', 'tv.text = "Hi"')}>
          UPDATE
        </button>
        <button className="btn" onClick={() => setOps([])}>
          Reset
        </button>
      </div>
      <div style={{ display: 'grid', gap: 6, minHeight: 56 }}>
        <AnimatePresence>
          {ops.map((o, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              className="box native"
              style={{ display: 'flex', gap: 12, padding: '6px 12px' }}
            >
              <b style={{ width: 70 }}>{o.k}</b>
              <code>{o.d}</code>
            </motion.div>
          ))}
        </AnimatePresence>
        {!ops.length && (
          <span className="note">
            Each Fabric mutation becomes an Android View call on the UI thread. Add some.
          </span>
        )}
      </div>
    </>
  )
}

const tasks = ['Codegen', 'CMake + NDK (C++)', 'Kotlin / Java', 'Metro bundle', 'Package APK']
function Build() {
  const [done, setDone] = useState(-1)
  const timers = useRef<number[]>([])
  const run = () => {
    timers.current.forEach(clearTimeout)
    setDone(-1)
    timers.current = tasks.map((_, i) => window.setTimeout(() => setDone(i), 500 * (i + 1)))
  }
  return (
    <>
      <div className="row">
        <button className="btn primary" onClick={run}>
          Run ./gradlew assembleDebug
        </button>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {tasks.map((t, i) => (
          <div
            key={t}
            className={`box ${i <= done ? 'native' : ''}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              opacity: i <= done ? 1 : 0.5,
              transition: 'opacity .3s',
            }}
          >
            <span>{t}</span>
            <span className="note">
              {i <= done ? 'done' : i === done + 1 && done >= 0 ? 'running' : 'waiting'}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

export default function S15() {
  const [s, setS] = useState(0)
  return (
    <>
      <Block title="From Application to first view">
        <Stepper steps={steps} step={s} setStep={setS} />
        <p className="tldr" style={{ fontSize: 15 }}>
          <b>{steps[s].toUpperCase()}</b>
          {text[s]}
        </p>
        <Code
          lang="kotlin"
          title="MainActivity.kt"
        >{`class MainActivity : ReactActivity() {\n  override fun getMainComponentName(): String = "MyApp"\n\n  override fun createReactActivityDelegate() =\n      DefaultReactActivityDelegate(\n          this,\n          mainComponentName,\n          fabricEnabled,\n      )\n}`}</Code>
      </Block>
      <Block
        title="JNI and fbjni"
        lead="Kotlin cannot call C++ directly. JNI is Java's C interface; fbjni is Meta's C++ wrapper that makes it type-safe. Pick a Java type to see how it crosses."
      >
        <Jni />
      </Block>
      <Block title="Mounting Android Views">
        <Mount />
      </Block>
      <Block
        title="Gradle and the Android build"
        lead="One Gradle command builds the C++ and the Kotlin, bundles your JS, and packages everything."
      >
        <Build />
        <Code
          lang="kotlin"
          title="app/build.gradle"
        >{`apply plugin: "com.android.application"\napply plugin: "com.facebook.react"\n\nreact {\n  autolinkLibrariesWithApp()\n}`}</Code>
      </Block>
    </>
  )
}
