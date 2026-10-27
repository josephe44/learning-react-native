import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Block, Chip, Code, Seg, Stepper, type Kind } from '../components/ui'

type Arch = 'old' | 'new'

function Stack() {
  const [arch, setArch] = useState<Arch>('new')
  const [tap, setTap] = useState(0)
  const layers: { k: Kind; t: string; d: string }[] = [
    { k: 'js', t: 'Your React code', d: 'Components, hooks, state — runs in Hermes' },
    arch === 'old'
      ? { k: 'bridge', t: 'The Bridge', d: 'Async JSON messages, batched' }
      : { k: 'cpp', t: 'JSI + C++ core', d: 'Direct references, synchronous' },
    { k: 'native', t: 'Native views & APIs', d: 'UIView / android.view.View, camera, GPS…' },
  ]
  return (
    <>
      <div className="row">
        <Seg
          value={arch}
          onChange={setArch}
          options={[
            { value: 'old', label: 'Old Architecture' },
            { value: 'new', label: 'New Architecture' },
          ]}
        />
        <button className="btn primary" onClick={() => setTap(t => t + 1)}>
          Send a tap down the stack
        </button>
      </div>
      <div style={{ position: 'relative', display: 'grid', gap: 22, maxWidth: 520 }}>
        {layers.map((l, i) => (
          <motion.div key={i} layout className={`box ${l.k}`} style={{ padding: '16px 18px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={l.t}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
              >
                <b>{l.t}</b> <Chip kind={l.k} />
                <div className="note">{l.d}</div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ))}
        <motion.div
          key={`${tap}-${arch}`}
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: 18,
            height: 18,
            borderRadius: 99,
            background: 'var(--accent)',
            boxShadow: '0 0 0 6px var(--accent-soft)',
            marginLeft: -9,
            opacity: tap ? 1 : 0,
          }}
          animate={{ top: [0, 40, 100, 160, 200, 140, 40, 0] }}
          transition={{ duration: arch === 'old' ? 4 : 1.6, ease: 'easeInOut' }}
        />
      </div>
      <p className="note" style={{ marginTop: 14 }}>
        {arch === 'old' ? (
          <>
            Every call squeezes through <b>one async JSON mailbox</b> — notice how slow the dot is.
          </>
        ) : (
          <>
            JS holds <b>direct C++ references</b> — calls skip serialization, the dot flies.
          </>
        )}
      </p>
    </>
  )
}

function Worlds() {
  const ws: { k: Kind; t: string; d: string; e: string }[] = [
    { k: 'js', t: 'JS world', e: 'JS', d: 'Your app logic. React decides WHAT the UI should be.' },
    {
      k: 'cpp',
      t: 'C++ world',
      e: 'C++',
      d: 'Shared core: Fabric, Yoga layout, JSI. Same code on iOS & Android.',
    },
    {
      k: 'native',
      t: 'Native world',
      e: 'OS',
      d: 'Obj-C/Swift/Kotlin/Java. Real buttons, text, camera, sensors.',
    },
  ]
  return (
    <div className="grid3">
      {ws.map((w, i) => (
        <motion.div
          key={w.t}
          className={`box ${w.k}`}
          whileHover={{ y: -6, scale: 1.03 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12 }}
          viewport={{ once: true }}
        >
          <div className="badge">{w.e}</div>
          <b>{w.t}</b>
          <p className="note">{w.d}</p>
        </motion.div>
      ))}
    </div>
  )
}

const lanes = ['UI / Main thread', 'JS thread', 'Background (layout) thread']
const steps = [
  { lane: 0, label: 'Finger touches screen', note: 'Native detects the touch on the UI thread.' },
  {
    lane: 1,
    label: 'onPress runs',
    note: 'Event is sent to the JS thread; your handler calls setState.',
  },
  {
    lane: 1,
    label: 'React renders',
    note: 'React produces the new element tree (still JS thread).',
  },
  { lane: 2, label: 'Yoga computes layout', note: 'Shadow tree is laid out off the UI thread.' },
  {
    lane: 0,
    label: 'Views are mounted',
    note: 'UI thread applies mutations to real native views.',
  },
]
function Threads() {
  const [step, setStep] = useState(0)
  return (
    <>
      <Stepper steps={steps.map(s => s.label)} step={step} setStep={setStep} />
      <div style={{ position: 'relative' }}>
        {lanes.map((l, i) => (
          <div
            key={l}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 54,
              borderBottom: '1px dashed var(--line)',
              background: steps[step].lane === i ? 'var(--accent-soft)' : 'transparent',
              transition: 'background .3s',
            }}
          >
            <span className="note" style={{ width: 170, paddingLeft: 8 }}>
              {l}
            </span>
          </div>
        ))}
        {steps.map(
          (s, i) =>
            i <= step && (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  top: s.lane * 54 + 17,
                  left: `calc(190px + ${i * 15}%)`,
                  width: 20,
                  height: 20,
                  borderRadius: 99,
                  background: 'var(--accent)',
                  opacity: i === step ? 1 : 0.45,
                  boxShadow: i === step ? '0 0 0 6px var(--accent-soft)' : 'none',
                }}
              />
            ),
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          className="tldr"
          style={{ marginTop: 16, fontSize: 15 }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <b>STEP {step + 1}</b>
          {steps[step].note}
        </motion.p>
      </AnimatePresence>
    </>
  )
}

export default function S01() {
  return (
    <>
      <Block
        title="What does “native” mean?"
        lead={
          <>
            A React Native <code>&lt;View&gt;</code> is not a web <code>div</code>. It becomes a
            real <code>UIView</code> on iOS and a real <code>android.view.View</code> on Android. JS
            only describes it, native draws it.
          </>
        }
      >
        <Code title="App.tsx">{`<View style={styles.card}>
  <Text>Hi</Text>
</View>`}</Code>
        <div className="note" style={{ margin: '10px 0 10px 4px' }}>
          ↓ becomes ↓
        </div>
        <div
          className="grid3"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
        >
          <Code lang="objectivec" title="iOS (UIKit)">{`UIView *card = [[UIView alloc] init];
UILabel *label = [[UILabel alloc] init];
label.text = @"Hi";
[card addSubview:label];`}</Code>
          <Code lang="kotlin" title="Android (Views)">{`val card = FrameLayout(context)
val label = TextView(context).apply {
  text = "Hi"
}
card.addView(label)`}</Code>
        </div>
      </Block>
      <Block
        title="Old vs New Architecture"
        lead="Toggle to see how the middle layer changed — then fire a tap."
      >
        <Stack />
      </Block>
      <Block title="The three worlds">
        <Worlds />
      </Block>
      <Block
        title="Threading: who does what?"
        lead="Step through one tap. Watch which thread owns each moment."
      >
        <Threads />
      </Block>
    </>
  )
}
