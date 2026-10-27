import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Block, Code, Seg, Stepper } from '../components/ui'

function Driver() {
  const [x, setX] = useState(0)
  const [msg, setMsg] = useState('')
  useEffect(() => {
    let v = 0
    const t = setInterval(() => {
      v = (v + 4) % 100
      setX(v)
    }, 16)
    return () => clearInterval(t)
  }, [])
  const block = () => {
    setMsg('JS thread blocked for 2 s...')
    setTimeout(() => {
      const end = Date.now() + 2000
      while (Date.now() < end) {
        /* busy */
      }
      setMsg('Unblocked.')
    }, 60)
  }
  return (
    <>
      <div className="row">
        <button className="btn primary" onClick={block}>
          Block the JS thread for 2 s
        </button>
        <span className="note">{msg}</span>
      </div>
      <div className="note">JS-driven: JS computes every frame</div>
      <div className="track">
        <div className="dot js" style={{ left: `calc(${x}% - ${x * 0.28}px)` }} />
      </div>
      <div className="note" style={{ marginTop: 12 }}>
        Native driver: animation is described once, native runs it
      </div>
      <div className="track">
        <div className="dot native slide" />
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        Press the button. The yellow dot freezes because it needs the JS thread for each frame. The
        green one keeps moving because it runs off the JS thread.
      </p>
    </>
  )
}

function Layout() {
  const [on, setOn] = useState<'on' | 'off'>('on')
  const [items, setItems] = useState([1, 2, 3])
  const next = () => setItems(i => [...i, (i[i.length - 1] ?? 0) + 1])
  return (
    <>
      <div className="row">
        <Seg
          value={on}
          onChange={setOn}
          options={[
            { value: 'off', label: 'No LayoutAnimation' },
            { value: 'on', label: 'LayoutAnimation' },
          ]}
        />
        <button className="btn primary" onClick={next}>
          Add item
        </button>
        <button className="btn" onClick={() => setItems(i => i.slice(1))}>
          Remove first
        </button>
      </div>
      <div style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <AnimatePresence initial={false}>
          {items.map(n => (
            <motion.div
              key={n}
              layout={on === 'on'}
              initial={on === 'on' ? { opacity: 0, scale: 0.8 } : false}
              animate={{ opacity: 1, scale: 1 }}
              exit={
                on === 'on'
                  ? { opacity: 0, scale: 0.8 }
                  : { opacity: 0, transition: { duration: 0 } }
              }
              className="box cpp"
            >
              Item {n}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        LayoutAnimation animates the next layout change automatically. Fabric computes the new
        frames, then the native side interpolates from old to new.
      </p>
    </>
  )
}

const steps = ['Shared value', 'Worklet', 'UI runtime', 'Frame']
const stext = [
  'useSharedValue creates a value that lives on both the JS thread and the UI thread.',
  'A function marked "worklet" is compiled so it can be copied to another JS runtime.',
  'The worklet runs inside a second JS runtime on the UI thread, no thread hop needed.',
  'Each frame the worklet updates the view props directly, so gestures stay at 60 or 120 fps even when JS is busy.',
]

export default function S16() {
  const [s, setS] = useState(0)
  return (
    <>
      <Block
        title="Animated API and the native driver"
        lead="The same animation can run on two different threads."
      >
        <Driver />
      </Block>
      <Block title="LayoutAnimation">
        <Layout />
      </Block>
      <Block
        title="Reanimated: JavaScript on the UI thread"
        lead="Reanimated runs small JS functions called worklets on the UI thread, so animations that react to gestures never wait for the JS thread."
      >
        <Stepper steps={steps} step={s} setStep={setS} />
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          {['JS thread', 'Worklet copy', 'UI thread'].map((n, i) => (
            <motion.div
              key={n}
              className={`box ${i === 0 ? 'js' : i === 1 ? 'cpp' : 'native'}`}
              animate={{
                scale:
                  (s === 0 && i === 0) || (s === 1 && i === 1) || (s >= 2 && i === 2) ? 1.06 : 1,
                opacity:
                  (s === 0 && i === 0) || (s === 1 && i === 1) || (s >= 2 && i === 2) ? 1 : 0.45,
              }}
            >
              {n}
            </motion.div>
          ))}
        </div>
        <p className="tldr" style={{ fontSize: 15 }}>
          <b>{steps[s].toUpperCase()}</b>
          {stext[s]}
        </p>
        <Code title="Ball.tsx">{`const offset = useSharedValue(0);\n\nconst pan = Gesture.Pan().onChange((e) => {\n  'worklet';\n  offset.value += e.changeX; // runs on the UI thread\n});\n\nconst style = useAnimatedStyle(() => ({\n  transform: [{ translateX: offset.value }],\n}));`}</Code>
      </Block>
      <Block title="Where each tool fits">
        <div className="grid3">
          <div className="box js">
            <b>Animated + native driver</b>
            <p className="note">Simple opacity and transform animations.</p>
          </div>
          <div className="box cpp">
            <b>LayoutAnimation</b>
            <p className="note">Add, remove or move views.</p>
          </div>
          <div className="box native">
            <b>Reanimated</b>
            <p className="note">Gesture-driven, interruptible or complex.</p>
          </div>
        </div>
      </Block>
    </>
  )
}
