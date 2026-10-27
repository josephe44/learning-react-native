import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Block, Code, Seg } from '../components/ui'

type Path = 'responder' | 'handler'
const paths: Record<Path, { n: string; k: string; who: string }[]> = {
  responder: [
    { n: 'Finger moves', k: 'native', who: 'UI thread' },
    { n: 'Send touch event', k: 'cpp', who: 'to JS' },
    { n: 'JS asks who is responder', k: 'js', who: 'JS thread' },
    { n: 'Handler updates state', k: 'js', who: 'JS thread' },
    { n: 'Render + commit', k: 'cpp', who: 'back to UI' },
    { n: 'View moves', k: 'native', who: 'UI thread' },
  ],
  handler: [
    { n: 'Finger moves', k: 'native', who: 'UI thread' },
    { n: 'Native recognizer decides', k: 'native', who: 'UI thread' },
    { n: 'Worklet moves the view', k: 'native', who: 'UI thread' },
    { n: 'Notify JS (optional)', k: 'js', who: 'JS thread' },
  ],
}

function Paths() {
  const [p, setP] = useState<Path>('handler')
  const [run, setRun] = useState(0)
  const list = paths[p]
  return (
    <>
      <div className="row">
        <Seg
          value={p}
          onChange={v => {
            setP(v)
            setRun(r => r + 1)
          }}
          options={[
            { value: 'responder', label: 'JS responder system' },
            { value: 'handler', label: 'Gesture Handler' },
          ]}
        />
        <button className="btn primary" onClick={() => setRun(r => r + 1)}>
          Replay one touch
        </button>
        <span className="note">
          Hops before the view reacts: <b>{p === 'responder' ? 6 : 3}</b>
        </span>
      </div>
      <div key={`${p}-${run}`} style={{ display: 'grid', gap: 8 }}>
        {list.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.35 }}
            className={`box ${s.k}`}
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <span>{s.n}</span>
            <span className="note">{s.who}</span>
          </motion.div>
        ))}
      </div>
    </>
  )
}

type St = 'UNDETERMINED' | 'BEGAN' | 'ACTIVE' | 'END' | 'FAILED' | 'CANCELLED'
const states: St[] = ['UNDETERMINED', 'BEGAN', 'ACTIVE', 'END', 'FAILED', 'CANCELLED']

function Machine() {
  const [s, setS] = useState<St>('UNDETERMINED')
  const [log, setLog] = useState<string[]>([])
  const go = (label: string, next: (c: St) => St) => {
    setS(c => {
      const n = next(c)
      return n
    })
    setLog(l => [label, ...l].slice(0, 4))
  }
  const final = s === 'END' || s === 'FAILED' || s === 'CANCELLED'
  return (
    <>
      <div className="row">
        <button
          className="btn"
          disabled={s !== 'UNDETERMINED'}
          onClick={() => go('finger down', () => 'BEGAN')}
        >
          Finger down
        </button>
        <button
          className="btn"
          disabled={s !== 'BEGAN'}
          onClick={() => go('moved past threshold', () => 'ACTIVE')}
        >
          Move past threshold
        </button>
        <button
          className="btn"
          disabled={s !== 'ACTIVE' && s !== 'BEGAN'}
          onClick={() => go('released', c => (c === 'ACTIVE' ? 'END' : 'FAILED'))}
        >
          Release
        </button>
        <button
          className="btn"
          disabled={s !== 'ACTIVE'}
          onClick={() => go('system cancelled', () => 'CANCELLED')}
        >
          System interrupts
        </button>
        <button
          className="btn"
          onClick={() => {
            setS('UNDETERMINED')
            setLog([])
          }}
        >
          Reset
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {states.map(x => (
          <motion.div
            key={x}
            className={`box ${x === s ? (final ? 'bridge' : 'native') : ''}`}
            animate={{ scale: x === s ? 1.08 : 1, opacity: x === s ? 1 : 0.45 }}
            style={{ fontFamily: 'var(--mono)', fontSize: 12 }}
          >
            {x}
          </motion.div>
        ))}
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        Events: {log.length ? log.join(' ← ') : 'none yet'}. A Pan only becomes ACTIVE after the
        finger moves far enough. Releasing earlier makes it FAILED, which lets another gesture win.
      </p>
    </>
  )
}

type Mode = 'race' | 'exclusive' | 'simultaneous'
function Compose() {
  const [mode, setMode] = useState<Mode>('exclusive')
  const [out, setOut] = useState<string[]>([])
  const single = () => {
    setOut(
      mode === 'exclusive'
        ? ['wait ~250 ms to see if a second tap follows', 'singleTap fires']
        : ['singleTap fires immediately'],
    )
  }
  const dbl = () => {
    setOut(
      mode === 'exclusive'
        ? ['doubleTap fires', 'singleTap is cancelled']
        : mode === 'race'
          ? ['singleTap activates first and wins', 'doubleTap never runs']
          : ['singleTap fires on tap 1', 'doubleTap fires on tap 2'],
    )
  }
  return (
    <>
      <div className="row">
        <Seg
          value={mode}
          onChange={v => {
            setMode(v)
            setOut([])
          }}
          options={[
            { value: 'exclusive', label: 'Exclusive' },
            { value: 'race', label: 'Race' },
            { value: 'simultaneous', label: 'Simultaneous' },
          ]}
        />
      </div>
      <div className="row">
        <button className="btn primary" onClick={single}>
          Tap once
        </button>
        <button className="btn primary" onClick={dbl}>
          Tap twice quickly
        </button>
      </div>
      <div style={{ minHeight: 70 }}>
        <AnimatePresence mode="popLayout">
          {out.map((o, i) => (
            <motion.div
              key={o}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.25 }}
              className="box native"
              style={{ marginBottom: 6 }}
            >
              {o}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <Code title="Photo.tsx">{`const single = Gesture.Tap().onEnd(onSingle);\nconst double = Gesture.Tap().numberOfTaps(2).onEnd(onDouble);\n\nconst gesture = Gesture.${mode === 'exclusive' ? 'Exclusive(double, single)' : mode === 'race' ? 'Race(single, double)' : 'Simultaneous(single, double)'};\n\nreturn <GestureDetector gesture={gesture}>{children}</GestureDetector>;`}</Code>
    </>
  )
}

export default function S17() {
  return (
    <>
      <Block
        title="Why not use the JS responder?"
        lead="Touch events used to be sent to JS, which then decided who owns the touch. Gesture Handler asks the native recognizers instead, so the decision never leaves the UI thread."
      >
        <Paths />
      </Block>
      <Block
        title="Native recognizers"
        lead="iOS has UIGestureRecognizer and Android has its own touch system. Gesture Handler wraps both behind one API and gives every gesture the same life cycle."
      >
        <Machine />
      </Block>
      <Block title="How Gesture Handler works inside">
        <ul className="note" style={{ lineHeight: 1.9 }}>
          <li>
            Wrapping a view in <code>GestureDetector</code> attaches a native recognizer to the
            underlying native view.
          </li>
          <li>
            The recognizer's state changes are dispatched natively. With Reanimated they run as
            worklets on the UI thread.
          </li>
          <li>
            Callbacks that need JS (like <code>runOnJS</code>) are sent over JSI afterwards.
          </li>
        </ul>
      </Block>
      <Block
        title="Coordinating gestures"
        lead="When two gestures could match the same touch, you choose how they relate. Try each mode."
      >
        <Compose />
      </Block>
    </>
  )
}
