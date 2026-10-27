import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Block, Chip } from '../components/ui'

const origins = {
  'Event handler': { layer: 'js', caught: 'try/catch', bound: false },
  Render: { layer: 'js', caught: 'boundary', bound: true },
  'Unhandled promise': { layer: 'js', caught: 'global', bound: false },
  'Native module (sync)': { layer: 'cpp', caught: 'jsi', bound: false },
  'Native module (async)': { layer: 'native', caught: 'promise', bound: false },
  'Native thread crash': { layer: 'native', caught: 'none', bound: false },
} as const
type O = keyof typeof origins

function outcome(
  o: O,
  boundary: boolean,
  handler: boolean,
): { path: string[]; end: string; ok: boolean } {
  switch (o) {
    case 'Event handler':
      return {
        path: ['onPress throws'],
        end: handler
          ? 'Reported by the global handler, app keeps running.'
          : 'Dev: RedBox. Release: app closes. Error boundaries do NOT catch event handlers.',
        ok: handler,
      }
    case 'Render':
      return {
        path: ['Component throws while rendering', 'React walks up the tree'],
        end: boundary
          ? 'Nearest error boundary shows its fallback UI. The rest of the app survives.'
          : handler
            ? 'Reported globally, but the whole tree unmounts (blank screen).'
            : 'Whole tree unmounts. Dev: RedBox. Release: crash.',
        ok: boundary,
      }
    case 'Unhandled promise':
      return {
        path: ['Promise rejects', 'No .catch attached'],
        end: handler
          ? 'Tracked and reported, app keeps running.'
          : 'Dev: a warning. Release: silently ignored, work is lost.',
        ok: handler,
      }
    case 'Native module (sync)':
      return {
        path: [
          'JS calls a sync TurboModule',
          'C++ catches the native exception',
          'Rethrown as a JS Error',
        ],
        end: 'You can try/catch it in JS like any error.',
        ok: true,
      }
    case 'Native module (async)':
      return {
        path: [
          'JS calls an async TurboModule',
          'Native code fails',
          'promise.reject(code, message)',
        ],
        end: 'Your await call throws. try/catch it.',
        ok: true,
      }
    case 'Native thread crash':
      return {
        path: ['Exception on a native thread', 'Uncaught native exception handler'],
        end: 'The process terminates. JS cannot catch this. Only a crash reporter (Crashlytics, Sentry) sees it.',
        ok: false,
      }
  }
}

function Lab() {
  const [o, setO] = useState<O>('Render')
  const [boundary, setBoundary] = useState(true)
  const [handler, setHandler] = useState(false)
  const r = outcome(o, boundary, handler)
  return (
    <>
      <div className="row">
        {(Object.keys(origins) as O[]).map(k => (
          <button
            key={k}
            className="btn"
            style={{
              borderColor: k === o ? 'var(--accent)' : undefined,
              background: k === o ? 'var(--accent-soft)' : undefined,
            }}
            onClick={() => setO(k)}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="row">
        <label className="note">
          <input type="checkbox" checked={boundary} onChange={e => setBoundary(e.target.checked)} />{' '}
          error boundary around the screen
        </label>
        <label className="note">
          <input type="checkbox" checked={handler} onChange={e => setHandler(e.target.checked)} />{' '}
          global ErrorUtils handler
        </label>
      </div>
      <Chip kind={origins[o].layer}>
        {origins[o].layer === 'js'
          ? 'starts in JS'
          : origins[o].layer === 'cpp'
            ? 'crosses JSI'
            : 'starts in native'}
      </Chip>
      <AnimatePresence mode="wait">
        <motion.div
          key={o + boundary + handler}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ display: 'grid', gap: 8, margin: '14px 0' }}
        >
          {r.path.map((p, i) => (
            <motion.div
              key={p}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="box"
            >
              {p}
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: r.path.length * 0.2 }}
            className={`box ${r.ok ? 'native' : 'bridge'}`}
          >
            <b>{r.ok ? 'Handled' : 'Not handled'}</b>
            <div className="note">{r.end}</div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default function S24() {
  return (
    <>
      <Block
        title="Where does an error go?"
        lead="Choose where the error starts and which safety nets you have. The result is what a user would see."
      >
        <Lab />
      </Block>
      <Block title="JS exceptions">
        <div className="grid3">
          <div className="box js">
            <b>try / catch</b>
            <p className="note">Works for sync code and awaited promises.</p>
          </div>
          <div className="box js">
            <b>Error boundary</b>
            <p className="note">Catches errors thrown while rendering children.</p>
          </div>
          <div className="box js">
            <b>ErrorUtils.setGlobalHandler</b>
            <p className="note">Last chance for anything uncaught in JS.</p>
          </div>
        </div>
      </Block>
      <Block title="Native crashes and propagation">
        <ul className="note" style={{ lineHeight: 1.9 }}>
          <li>
            Errors in synchronous TurboModule calls are converted to JS errors at the JSI boundary.
          </li>
          <li>
            Async modules reject their promise, so <code>await</code> throws.
          </li>
          <li>
            A crash on a native thread kills the process before JS can react. Plan for it with a
            crash reporter and symbolicated stacks (see Build &amp; Release).
          </li>
        </ul>
      </Block>
    </>
  )
}
