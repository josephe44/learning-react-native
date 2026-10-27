import { useState } from 'react'
import { motion } from 'framer-motion'
import { Block, Stepper } from '../components/ui'

const steps = [
  {
    t: 'Native touch',
    who: 'native',
    hl: [],
    d: 'The OS delivers a touch to a UIView / MotionEvent on the UI thread.',
  },
  {
    t: 'Hit test in C++',
    who: 'cpp',
    hl: [],
    d: 'Fabric finds which shadow node is under the finger, then builds the path from root to that node.',
  },
  {
    t: 'Capture',
    who: 'js',
    hl: ['Screen', 'Card'],
    d: 'The event travels down the path. Any ancestor can claim it (onStartShouldSetResponderCapture).',
  },
  {
    t: 'Target',
    who: 'js',
    hl: ['Button'],
    d: 'The target view becomes the responder and its onPress will run.',
  },
  {
    t: 'Bubble',
    who: 'js',
    hl: ['Card', 'Screen'],
    d: 'Unless stopped, the event bubbles back up so parents can react too.',
  },
]
const path = ['Screen', 'Card', 'Button']

export default function S10() {
  const [s, setS] = useState(0)
  const st = steps[s]
  return (
    <>
      <Block title="Follow one tap" lead="Step through the journey from finger to onPress.">
        <Stepper steps={steps.map(x => x.t)} step={s} setStep={setS} />
        <div style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
          {path.map((n, i) => {
            const on = st.hl.includes(n)
            return (
              <motion.div
                key={n}
                className={`box ${on ? st.who : ''}`}
                style={{ marginLeft: i * 20 }}
                animate={{ scale: on ? 1.04 : 1 }}
              >
                {n}
              </motion.div>
            )
          })}
        </div>
        <p className="tldr" style={{ marginTop: 16, fontSize: 15 }}>
          <b>{st.t.toUpperCase()}</b>
          {st.d}
        </p>
      </Block>
      <Block title="Event priority">
        <div className="grid3">
          <div className="box native">
            <b>Discrete</b>
            <p className="note">press, keypress. Rendered right away, high priority.</p>
          </div>
          <div className="box cpp">
            <b>Continuous</b>
            <p className="note">scroll, touch move. Can be dropped or coalesced when busy.</p>
          </div>
        </div>
      </Block>
      <Block title="Responder system vs gesture handler">
        <p className="note">
          The JS responder system decides who owns a touch by asking views in JS. It needs round
          trips. Libraries like react-native-gesture-handler move that decision to native
          recognizers (see section 17).
        </p>
      </Block>
    </>
  )
}
