import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Block, Code } from '../components/ui'

interface Msg {
  id: number
  json: string
}
let uid = 0
const mk = (): Msg => {
  const id = ++uid
  return {
    id,
    json: JSON.stringify({
      module: 'UIManager',
      method: 'setNativeProps',
      args: [id, { opacity: 0.5 }],
    }),
  }
}

function Mailbox() {
  const [queue, setQueue] = useState<Msg[]>([])
  const [done, setDone] = useState(0)
  const [last, setLast] = useState<Msg | null>(null)
  const ref = useRef(queue)
  ref.current = queue

  useEffect(() => {
    const t = setInterval(() => {
      if (!ref.current.length) return
      const batch = ref.current.slice(0, 3)
      setLast(batch[batch.length - 1])
      setQueue(q => q.slice(batch.length))
      setDone(d => d + batch.length)
    }, 500)
    return () => clearInterval(t)
  }, [])

  const send = (n: number) => setQueue(q => [...q, ...Array.from({ length: n }, mk)])
  const jam = queue.length > 12
  return (
    <>
      <div className="row">
        <button className="btn primary" onClick={() => send(1)}>
          Send 1 message
        </button>
        <button className="btn" onClick={() => send(25)}>
          Spam 25 (scroll event storm)
        </button>
        <span className="note">
          Delivered to native: <b>{done}</b>
        </span>
      </div>
      <div className="bridge3">
        <div className="box js">
          <b>JS thread</b>
          <p className="note">Calls native, then moves on. It can't wait for an answer.</p>
        </div>
        <div
          className={`box bridge`}
          style={{ minHeight: 120, borderColor: jam ? 'var(--bridge)' : undefined }}
        >
          <b>Bridge queue</b>{' '}
          <span className="note">
            ({queue.length} waiting{jam ? ' — JAM!' : ''})
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
            <AnimatePresence>
              {queue.slice(0, 40).map(m => (
                <motion.span
                  key={m.id}
                  layout
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ x: 80, opacity: 0, scale: 0.4 }}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: 'var(--bridge)',
                    fontSize: 9,
                    color: 'var(--on-solid)',
                    textAlign: 'center',
                    lineHeight: '18px',
                  }}
                >{`{}`}</motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="box native">
          <b>Native thread</b>
          <p className="note">Parses each JSON, finds the module, runs it.</p>
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <div className="note" style={{ marginBottom: 6 }}>
          Last message delivered (every one must be stringified, then parsed):
        </div>
        <Code lang="json" title="JSON on the wire">
          {last
            ? JSON.stringify(JSON.parse(last.json), null, 2)
            : '{ "hint": "send a message to see its JSON" }'}
        </Code>
      </div>
    </>
  )
}

export default function S03() {
  return (
    <>
      <Block
        title="Design: one async mailbox"
        lead="In the old architecture JS and native never touched each other directly. They dropped JSON letters into a queue; the other side picked them up later in batches."
      >
        <div className="grid3">
          <div className="box bridge">
            <b>1. Serialize</b>
            <p className="note">Arguments → JSON string</p>
          </div>
          <div className="box bridge">
            <b>2. Batch &amp; queue</b>
            <p className="note">Messages wait to be flushed together</p>
          </div>
          <div className="box bridge">
            <b>3. Deserialize</b>
            <p className="note">Native parses JSON, looks up the module</p>
          </div>
        </div>
      </Block>
      <Block
        title="Try it: clog the bridge"
        lead="Send one message — fine. Now spam 25, like a fast scroll firing events. The queue backs up, so the UI reacts late."
      >
        <Mailbox />
      </Block>
      <Block title="Why it was a bottleneck">
        <ul className="note" style={{ lineHeight: 1.9 }}>
          <li>
            <b>Async-only:</b> you could never ask native a question and get an answer right now
            (e.g. measuring a view).
          </li>
          <li>
            <b>JSON cost:</b> every payload was copied and stringified — large data hurt.
          </li>
          <li>
            <b>Single queue:</b> unrelated traffic waited behind each other.
          </li>
          <li>
            <b>Eager modules:</b> all native modules were set up at startup, even unused ones.
          </li>
        </ul>
      </Block>
    </>
  )
}
