import { useState } from 'react'
import { motion } from 'framer-motion'
import { Block, Code, Seg, Stepper } from '../components/ui'

const steps = ['Text elements', 'AttributedString', 'Measure', 'Draw']
const stext = [
  'You write nested <Text>. Each one carries its own style (weight, color, size).',
  'Fabric flattens the nesting into fragments: pieces of string, each with its own attributes.',
  'Yoga asks the platform text engine how tall the paragraph is for the available width.',
  'The native view (RCTParagraphComponentView / ReactTextView) draws the same laid-out text.',
]

function Fragments() {
  const [bold, setBold] = useState(true)
  const [red, setRed] = useState(false)
  const frags = [
    { text: 'Hello ', attrs: {} },
    {
      text: 'world',
      attrs: { ...(bold ? { fontWeight: 'bold' } : {}), ...(red ? { color: 'red' } : {}) },
    },
    { text: '!', attrs: {} },
  ]
  return (
    <>
      <div className="row">
        <label className="note">
          <input type="checkbox" checked={bold} onChange={e => setBold(e.target.checked)} /> bold
          "world"
        </label>
        <label className="note">
          <input type="checkbox" checked={red} onChange={e => setRed(e.target.checked)} /> red
          "world"
        </label>
      </div>
      <div className="box" style={{ fontSize: 24 }}>
        Hello{' '}
        <motion.span
          layout
          style={{ fontWeight: bold ? 800 : 400, color: red ? 'var(--bridge)' : undefined }}
        >
          world
        </motion.span>
        !
      </div>
      <p className="note" style={{ margin: '12px 0 8px' }}>
        The same text as an AttributedString:
      </p>
      <Code lang="json" title="fragments">
        {JSON.stringify(frags, null, 2)}
      </Code>
    </>
  )
}

function Measure() {
  const [w, setW] = useState(280)
  const [lines, setLines] = useState<'none' | '1' | '2'>('none')
  return (
    <>
      <div className="row">
        <label htmlFor="tw" className="note">
          Width: <b>{w}px</b>
        </label>
        <input
          id="tw"
          type="range"
          min={140}
          max={520}
          value={w}
          onChange={e => setW(+e.target.value)}
        />
        <Seg
          value={lines}
          onChange={setLines}
          options={[
            { value: 'none', label: 'all lines' },
            { value: '2', label: 'numberOfLines 2' },
            { value: '1', label: 'numberOfLines 1' },
          ]}
        />
      </div>
      <div
        className="box js"
        style={{
          width: w,
          display: lines === 'none' ? 'block' : '-webkit-box',
          WebkitLineClamp: lines === 'none' ? undefined : Number(lines),
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        React Native does not know how tall this paragraph is until it knows how wide it can be. The
        text engine breaks lines, then reports the size back to layout.
      </div>
    </>
  )
}

export default function S19() {
  const [s, setS] = useState(0)
  return (
    <>
      <Block title="From Text to pixels">
        <Stepper steps={steps} step={s} setStep={setS} />
        <p className="tldr" style={{ fontSize: 15 }}>
          <b>{steps[s].toUpperCase()}</b>
          {stext[s]}
        </p>
      </Block>
      <Block
        title="Attributed strings"
        lead="Toggle styles on one word and see how the data changes."
      >
        <Fragments />
      </Block>
      <Block
        title="Measuring text"
        lead="Text is the classic case where layout needs a callback to native code."
      >
        <Measure />
      </Block>
      <Block title="Platform text engines">
        <div className="grid3">
          <div className="box native">
            <b>iOS</b>
            <p className="note">NSAttributedString laid out by TextKit (CoreText underneath).</p>
          </div>
          <div className="box native">
            <b>Android</b>
            <p className="note">Spannable text laid out by StaticLayout.</p>
          </div>
        </div>
        <p className="note" style={{ marginTop: 12 }}>
          Because each platform has its own engine, line breaks and font metrics can differ slightly
          between iOS and Android for the same string.
        </p>
      </Block>
    </>
  )
}
