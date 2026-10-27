import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Block, Code, Seg, Stepper } from '../components/ui'

const cmds = {
  'Set breakpoint': {
    req: `{ "id": 7, "method": "Debugger.setBreakpointByUrl",\n  "params": { "url": "App.js", "lineNumber": 12 } }`,
    res: `{ "id": 7, "result": { "breakpointId": "1:12:0:App.js" } }`,
    tip: 'Hermes pauses execution when line 12 runs.',
  },
  'Evaluate in console': {
    req: `{ "id": 8, "method": "Runtime.evaluate",\n  "params": { "expression": "user.name" } }`,
    res: `{ "id": 8, "result": { "result": { "type": "string", "value": "Ada" } } }`,
    tip: 'The expression runs inside the live Hermes runtime.',
  },
  'Log a message': {
    req: `// no request: the app pushes an event`,
    res: `{ "method": "Runtime.consoleAPICalled",\n  "params": { "type": "log", "args": [{ "value": "hello" }] } }`,
    tip: 'console.log becomes a CDP event shown in the Console panel.',
  },
}
type Cmd = keyof typeof cmds

function Cdp() {
  const [c, setC] = useState<Cmd>('Evaluate in console')
  const x = cmds[c]
  return (
    <>
      <div className="row">
        <Seg
          value={c}
          onChange={setC}
          options={(Object.keys(cmds) as Cmd[]).map(v => ({ value: v, label: v }))}
        />
      </div>
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div className="box cpp">DevTools</div>
        <span>⇄</span>
        <div className="box js">Metro (inspector proxy)</div>
        <span>⇄</span>
        <div className="box native">Hermes (CDP agent)</div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={c}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{ display: 'grid', gap: 10 }}
        >
          <Code lang="json" title="DevTools → Hermes">
            {x.req}
          </Code>
          <Code lang="json" title="Hermes → DevTools">
            {x.res}
          </Code>
        </motion.div>
      </AnimatePresence>
      <p className="note" style={{ marginTop: 10 }}>
        {x.tip}
      </p>
    </>
  )
}

type Lv = 'warn' | 'error' | 'fatal'
function Boxes() {
  const [lv, setLv] = useState<Lv>('warn')
  return (
    <>
      <div className="row">
        <Seg
          value={lv}
          onChange={setLv}
          options={[
            { value: 'warn', label: 'console.warn' },
            { value: 'error', label: 'console.error' },
            { value: 'fatal', label: 'Uncaught exception' },
          ]}
        />
      </div>
      <div
        style={{
          position: 'relative',
          width: 260,
          height: 300,
          border: '2px solid var(--line)',
          borderRadius: 28,
          background: 'var(--panel2)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: 16 }} className="note">
          Your app
        </div>
        <AnimatePresence mode="wait">
          {lv === 'fatal' ? (
            <motion.div
              key="r"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--bridge)',
                color: 'var(--on-solid)',
                padding: 16,
                fontSize: 13,
              }}
            >
              <b>Uncaught Error</b>
              <p>Cannot read property 'name' of undefined</p>
              <p style={{ opacity: 0.8 }}>App.js:12 (stack trace)</p>
              <p>Dismiss / Reload</p>
            </motion.div>
          ) : (
            <motion.div
              key={lv}
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              exit={{ y: 60 }}
              style={{
                position: 'absolute',
                left: 10,
                right: 10,
                bottom: 10,
                padding: '8px 12px',
                borderRadius: 10,
                background: lv === 'warn' ? 'var(--js)' : 'var(--bridge)',
                color: 'var(--on-solid)',
                fontSize: 13,
              }}
            >
              {lv === 'warn' ? 'Warning: key prop missing' : 'Error: failed to load'} (tap for
              details)
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        {lv === 'fatal'
          ? 'RedBox: a full-screen overlay for fatal errors. It only exists in development builds.'
          : 'LogBox: a small toast for warnings and logged errors that did not stop the app.'}
      </p>
    </>
  )
}

const els = [
  { id: 'Screen', box: { top: 0, left: 0, w: 100, h: 100 }, props: '{ flex: 1 }' },
  {
    id: 'Card',
    box: { top: 16, left: 10, w: 80, h: 44 },
    props: '{ padding: 16, borderRadius: 12 }',
  },
  {
    id: 'Button',
    box: { top: 66, left: 25, w: 50, h: 16 },
    props: '{ title: "Save", onPress: fn }',
  },
]
function Inspector() {
  const [sel, setSel] = useState(1)
  const e = els[sel]
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <div
          style={{
            position: 'relative',
            height: 280,
            maxWidth: 260,
            border: '2px solid var(--line)',
            borderRadius: 20,
            background: 'var(--panel2)',
          }}
        >
          {els.map((x, i) => (
            <div
              key={x.id}
              onClick={() => setSel(i)}
              style={{
                position: 'absolute',
                top: `${x.box.top}%`,
                left: `${x.box.left}%`,
                width: `${x.box.w}%`,
                height: `${x.box.h}%`,
                border: '1px dashed var(--line)',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                fontSize: 11,
                color: 'var(--dim)',
              }}
            >
              {x.id}
            </div>
          ))}
          <motion.div
            animate={{
              top: `${e.box.top}%`,
              left: `${e.box.left}%`,
              width: `${e.box.w}%`,
              height: `${e.box.h}%`,
            }}
            style={{
              position: 'absolute',
              background: 'var(--accent-soft)',
              border: '2px solid var(--accent)',
              pointerEvents: 'none',
            }}
          />
        </div>
        <div className="box">
          <b>{e.id}</b>
          <div className="note" style={{ margin: '6px 0' }}>
            props
          </div>
          <code>{e.props}</code>
        </div>
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        Click a view. The inspector asks native which view is at that point, finds the matching
        React component, and draws the highlight over its frame.
      </p>
    </>
  )
}

const steps = ['Dev menu', 'Metro proxy', 'CDP session']
const stext = [
  'Open React Native DevTools from the terminal (press j) or the dev menu.',
  'Metro lists debuggable apps and relays messages between DevTools and the app.',
  'DevTools and Hermes talk Chrome DevTools Protocol over a WebSocket.',
]

export default function S23() {
  const [s, setS] = useState(0)
  return (
    <>
      <Block title="React Native DevTools">
        <Stepper steps={steps} step={s} setStep={setS} />
        <p className="tldr" style={{ fontSize: 15 }}>
          <b>{steps[s].toUpperCase()}</b>
          {stext[s]}
        </p>
      </Block>
      <Block
        title="Chrome DevTools Protocol in Hermes"
        lead="Every DevTools action is a small JSON message. Pick one."
      >
        <Cdp />
      </Block>
      <Block title="LogBox and RedBox">
        <Boxes />
      </Block>
      <Block title="Inspector and element highlighting">
        <Inspector />
      </Block>
    </>
  )
}
