import { useState } from 'react'
import { motion } from 'framer-motion'
import { Block, Code, Seg, Stepper } from '../components/ui'

type Dir = 'row' | 'column'
type J = 'flex-start' | 'center' | 'space-between'
type A = 'flex-start' | 'center' | 'stretch'

function Playground() {
  const [dir, setDir] = useState<Dir>('column')
  const [j, setJ] = useState<J>('flex-start')
  const [a, setA] = useState<A>('stretch')
  return (
    <>
      <div className="row">
        <span className="note">flexDirection</span>
        <Seg
          value={dir}
          onChange={setDir}
          options={[
            { value: 'column', label: 'column (default)' },
            { value: 'row', label: 'row' },
          ]}
        />
      </div>
      <div className="row">
        <span className="note">justifyContent</span>
        <Seg
          value={j}
          onChange={setJ}
          options={[
            { value: 'flex-start', label: 'flex-start' },
            { value: 'center', label: 'center' },
            { value: 'space-between', label: 'space-between' },
          ]}
        />
      </div>
      <div className="row">
        <span className="note">alignItems</span>
        <Seg
          value={a}
          onChange={setA}
          options={[
            { value: 'flex-start', label: 'flex-start' },
            { value: 'center', label: 'center' },
            { value: 'stretch', label: 'stretch' },
          ]}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: dir,
          justifyContent: j,
          alignItems: a,
          height: 260,
          gap: 8,
          padding: 10,
          border: '1.5px dashed var(--line)',
          borderRadius: 12,
          background: 'var(--panel2)',
        }}
      >
        {['A', 'B', 'C'].map((k, i) => (
          <motion.div
            key={k}
            layout
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="box cpp"
            style={{
              minWidth: 56,
              minHeight: 44 + i * 10,
              fontWeight: 700,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {k}
          </motion.div>
        ))}
      </div>
      <Code title="style">{`container: {\n  flex: 1,\n  flexDirection: '${dir}',\n  justifyContent: '${j}',\n  alignItems: '${a}',\n}`}</Code>
    </>
  )
}

function Measure() {
  const [w, setW] = useState(300)
  return (
    <>
      <div className="row">
        <label htmlFor="w" className="note">
          Available width: <b>{w}px</b>
        </label>
        <input
          id="w"
          type="range"
          min={120}
          max={520}
          value={w}
          onChange={e => setW(+e.target.value)}
        />
      </div>
      <div className="box js" style={{ width: w, transition: 'none' }}>
        Yoga cannot know this text's height until it knows the width. It asks the platform text
        engine to measure it.
      </div>
      <p className="note" style={{ marginTop: 8 }}>
        Drag the slider: the box grows taller as lines wrap. That "measure" call is a callback from
        Yoga into native text code.
      </p>
    </>
  )
}

const steps = ['Shadow tree', 'Measure leaves', 'Flex pass', 'Write frames']
const text = [
  'Yoga reads the immutable shadow tree. Each ShadowNode carries its style props (flex, margin, width...).',
  'Leaf nodes with intrinsic size (Text, Image, custom views) are measured through a callback to the platform.',
  'Yoga walks the tree: resolves flex-grow/shrink, wraps lines, aligns children along main and cross axes.',
  'The computed x, y, width and height are stored on each shadow node. Mount then applies them to native views.',
]

export default function S08() {
  const [s, setS] = useState(0)
  return (
    <>
      <Block
        title="Yoga, the C++ layout engine"
        lead="Yoga is a small C++ library from Meta that implements flexbox. It runs on the shadow tree, not on native views, so the same math gives the same result on iOS and Android."
      >
        <Stepper steps={steps} step={s} setStep={setS} />
        <p className="tldr" style={{ fontSize: 15 }}>
          <b>{steps[s].toUpperCase()}</b>
          {text[s]}
        </p>
      </Block>
      <Block
        title="Flexbox playground"
        lead="Same rules as CSS, with two RN differences: the default direction is column, and everything is flex."
      >
        <Playground />
      </Block>
      <Block title="Measuring text and custom views">
        <Measure />
      </Block>
    </>
  )
}
