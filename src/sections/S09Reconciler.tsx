import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Block, Seg } from '../components/ui'

function Batching() {
  const [auto, setAuto] = useState<'on' | 'off'>('on')
  const [renders, setRenders] = useState(0)
  const [count, setCount] = useState(0)
  const fire = () => {
    setCount(c => c + 3)
    setRenders(r => r + (auto === 'on' ? 1 : 3))
  }
  return (
    <>
      <div className="row">
        <Seg
          value={auto}
          onChange={v => {
            setAuto(v)
            setRenders(0)
            setCount(0)
          }}
          options={[
            { value: 'on', label: 'Batched (React 18)' },
            { value: 'off', label: 'Unbatched' },
          ]}
        />
        <button className="btn primary" onClick={fire}>
          Call setState 3 times
        </button>
      </div>
      <div className="grid3">
        <div className="box js">
          <div className="note">state value</div>
          <motion.b
            key={count}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ fontSize: 28, display: 'block' }}
          >
            {count}
          </motion.b>
        </div>
        <div className="box cpp">
          <div className="note">renders triggered</div>
          <motion.b
            key={renders}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            style={{ fontSize: 28, display: 'block' }}
          >
            {renders}
          </motion.b>
        </div>
      </div>
    </>
  )
}

function Lanes() {
  const [p, setP] = useState(0)
  const [urgent, setUrgent] = useState(0)
  const paused = useRef(false)
  const [isPaused, setIsPaused] = useState(false)
  useEffect(() => {
    const t = setInterval(() => {
      if (!paused.current) setP(x => (x >= 100 ? 0 : x + 1))
    }, 60)
    return () => clearInterval(t)
  }, [])
  const tap = () => {
    paused.current = true
    setIsPaused(true)
    setUrgent(u => u + 1)
    setTimeout(() => {
      paused.current = false
      setIsPaused(false)
    }, 900)
  }
  return (
    <>
      <div className="row">
        <button className="btn primary" onClick={tap}>
          Tap (urgent update)
        </button>
        <span className="note">
          Urgent taps: <b>{urgent}</b>
        </span>
      </div>
      <div className="note">Transition render (low priority, e.g. filtering a big list)</div>
      <div
        style={{
          height: 14,
          background: 'var(--panel2)',
          borderRadius: 99,
          overflow: 'hidden',
          margin: '6px 0 12px',
        }}
      >
        <div
          style={{
            width: `${p}%`,
            height: '100%',
            background: isPaused ? 'var(--js)' : 'var(--cpp)',
            transition: 'background .2s',
          }}
        />
      </div>
      <motion.div
        key={urgent}
        initial={{ opacity: urgent ? 1 : 0, scale: 1.04 }}
        animate={{ opacity: urgent ? 0.9 : 0, scale: 1 }}
        className="box native"
      >
        <b>Urgent render</b>{' '}
        <span className="note">
          {isPaused ? 'the transition is paused while this commits' : 'done; transition resumed'}
        </span>
      </motion.div>
    </>
  )
}

const order = [
  'begin App',
  'begin View',
  'begin Text',
  'complete Text',
  'begin Image',
  'complete Image',
  'complete View',
  'complete App',
]
function FiberWalk() {
  const [i, setI] = useState(0)
  const cur = order[i].split(' ')[1]
  const phase = order[i].split(' ')[0]
  const node = (n: string) => (
    <motion.div
      className={`box ${cur === n ? (phase === 'begin' ? 'js' : 'native') : ''}`}
      animate={{ scale: cur === n ? 1.08 : 1 }}
      style={{ textAlign: 'center', padding: '6px 14px' }}
    >
      {n}
    </motion.div>
  )
  return (
    <>
      <div className="row">
        <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>
          ← Back
        </button>
        <button
          className="btn primary"
          disabled={i === order.length - 1}
          onClick={() => setI(i + 1)}
        >
          Next unit of work →
        </button>
        <code>{order[i]}</code>
      </div>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 14 }}>
        {node('App')}
        {node('View')}
        <div style={{ display: 'flex', gap: 14 }}>
          {node('Text')}
          {node('Image')}
        </div>
      </div>
      <p className="note" style={{ marginTop: 12 }}>
        Fiber walks down calling components (<b>begin</b>) then back up building the result (
        <b>complete</b>). Because each step is one small unit, React can pause between any two of
        them.
      </p>
    </>
  )
}

export default function S09() {
  return (
    <>
      <Block
        title="Fiber: rendering in small pieces"
        lead="React's reconciler (Fiber) is the part that figures out what changed. It splits work into units so it can stop, resume or throw work away."
      >
        <FiberWalk />
      </Block>
      <Block
        title="Priorities and transitions"
        lead="Press the urgent button while the transition renders. Urgent work jumps the queue, then the transition continues."
      >
        <Lanes />
      </Block>
      <Block title="Batching" lead="Several state updates in one event become a single render.">
        <Batching />
      </Block>
      <Block title="Suspense">
        <p className="note">
          A component can "suspend" while data loads. React shows the fallback and keeps the rest of
          the tree interactive. In Fabric this works because a new tree can be prepared off-screen
          and committed only when ready.
        </p>
      </Block>
    </>
  )
}
