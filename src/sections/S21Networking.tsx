import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Block, Code, Seg, Stepper } from '../components/ui'

const steps = [
  'fetch()',
  'XMLHttpRequest',
  'Networking module',
  'OS network stack',
  'Response events',
  'Response',
]
const stext = [
  'You call fetch(). React Native ships a fetch polyfill written on top of XMLHttpRequest.',
  'XMLHttpRequest is implemented in JS and delegates the real work to a native module.',
  'The Networking native module receives the request (url, headers, body) and starts it.',
  'iOS uses NSURLSession, Android uses OkHttp. Both run on background threads, never the UI thread.',
  'Native sends back events: response headers, then chunks of data, then completion.',
  'JS assembles the events into a Response. Calling .json() parses the body.',
]
const kinds = ['js', 'js', 'cpp', 'native', 'cpp', 'js'] as const

type WS = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'
function Socket() {
  const [st, setSt] = useState<WS>('CLOSED')
  const [log, setLog] = useState<{ d: '→' | '←' | '•'; t: string }[]>([])
  const timers = useRef<number[]>([])
  const push = (d: '→' | '←' | '•', t: string) => setLog(l => [{ d, t }, ...l].slice(0, 6))
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
  const connect = () => {
    setSt('CONNECTING')
    push('•', 'new WebSocket(url)')
    later(() => {
      setSt('OPEN')
      push('•', 'onopen')
    }, 700)
  }
  const send = () => {
    push('→', 'send("ping")')
    later(() => push('←', 'onmessage: "pong"'), 500)
  }
  const close = () => {
    setSt('CLOSING')
    push('•', 'close()')
    later(() => {
      setSt('CLOSED')
      push('•', 'onclose')
    }, 500)
  }
  return (
    <>
      <div className="row">
        <button className="btn primary" disabled={st !== 'CLOSED'} onClick={connect}>
          Connect
        </button>
        <button className="btn" disabled={st !== 'OPEN'} onClick={send}>
          Send ping
        </button>
        <button className="btn" disabled={st !== 'OPEN'} onClick={close}>
          Close
        </button>
        <span className={`chip ${st === 'OPEN' ? 'native' : st === 'CLOSED' ? 'bridge' : 'js'}`}>
          {st}
        </span>
      </div>
      <div style={{ minHeight: 120 }}>
        <AnimatePresence initial={false}>
          {log.map((l, i) => (
            <motion.div
              key={log.length - i}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="box"
              style={{
                marginBottom: 4,
                padding: '4px 12px',
                fontFamily: 'var(--mono)',
                fontSize: 13,
              }}
            >
              {l.d} {l.t}
            </motion.div>
          ))}
        </AnimatePresence>
        {!log.length && (
          <span className="note">
            The connection stays open, so either side can send at any time.
          </span>
        )}
      </div>
    </>
  )
}

function BlobDemo() {
  const [mb, setMb] = useState(20)
  const b64 = mb * 1.33
  return (
    <>
      <div className="row">
        <label htmlFor="bs" className="note">
          Downloaded file: <b>{mb} MB</b>
        </label>
        <input
          id="bs"
          type="range"
          min={1}
          max={100}
          value={mb}
          onChange={e => setMb(+e.target.value)}
        />
      </div>
      <div className="grid3">
        <div className="box js">
          <b>Copy into JS as a base64 string</b>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{b64.toFixed(0)} MB</div>
          <div className="note">lives in the JS heap, slow to build</div>
        </div>
        <div className="box native">
          <b>Blob handle</b>
          <div style={{ fontSize: 26, fontWeight: 700 }}>~0 MB in JS</div>
          <div className="note">bytes stay native, JS holds a small id</div>
        </div>
      </div>
    </>
  )
}

const stores = {
  AsyncStorage: {
    sync: false,
    lang: 'tsx' as const,
    note: 'Key-value store backed by a file or SQLite. Every call is async and goes through a native module.',
    code: `await AsyncStorage.setItem('theme', 'dark');\nconst theme = await AsyncStorage.getItem('theme');`,
  },
  MMKV: {
    sync: true,
    lang: 'tsx' as const,
    note: 'Memory-mapped file read through JSI. Calls are synchronous and very fast.',
    code: `storage.set('theme', 'dark');\nconst theme = storage.getString('theme'); // no await`,
  },
  SQLite: {
    sync: false,
    lang: 'tsx' as const,
    note: 'A real database. Use it for structured data, queries and large amounts of rows.',
    code: `const rows = await db.getAllAsync(\n  'SELECT * FROM todos WHERE done = ?', [0]\n);`,
  },
}
type Store = keyof typeof stores
function Storage() {
  const [s, setS] = useState<Store>('MMKV')
  const x = stores[s]
  return (
    <>
      <div className="row">
        <Seg
          value={s}
          onChange={setS}
          options={(Object.keys(stores) as Store[]).map(v => ({ value: v, label: v }))}
        />
        <span className={`chip ${x.sync ? 'native' : 'js'}`}>
          {x.sync ? 'synchronous' : 'asynchronous'}
        </span>
      </div>
      <p className="note" style={{ marginBottom: 10 }}>
        {x.note}
      </p>
      <Code lang={x.lang} title={s}>
        {x.code}
      </Code>
    </>
  )
}

export default function S21() {
  const [s, setS] = useState(0)
  return (
    <>
      <Block title="What happens when you call fetch">
        <Stepper steps={steps} step={s} setStep={setS} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {steps.map((n, i) => (
            <motion.div
              key={n}
              className={`box ${i === s ? kinds[i] : ''}`}
              animate={{ opacity: i === s ? 1 : 0.4, scale: i === s ? 1.05 : 1 }}
              style={{ padding: '4px 10px', fontSize: 13 }}
            >
              {n}
            </motion.div>
          ))}
        </div>
        <p className="tldr" style={{ fontSize: 15 }}>
          <b>{steps[s].toUpperCase()}</b>
          {stext[s]}
        </p>
      </Block>
      <Block
        title="WebSockets"
        lead="A persistent two-way connection. Walk through its life cycle."
      >
        <Socket />
      </Block>
      <Block title="Blobs" lead="Binary data is kept in native memory and referenced from JS.">
        <BlobDemo />
      </Block>
      <Block
        title="Storage approaches"
        lead="React Native has no built-in storage. Pick one by how you read the data."
      >
        <Storage />
      </Block>
    </>
  )
}
