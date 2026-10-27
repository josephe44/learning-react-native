import { useId, useState, type ReactNode } from 'react'
import { Highlight, type PrismTheme } from 'prism-react-renderer'
import { motion } from 'framer-motion'

export type Kind = 'js' | 'cpp' | 'native' | 'bridge'
const kindLabel: Record<Kind, string> = {
  js: 'JavaScript',
  cpp: 'C++',
  native: 'Native iOS/Android',
  bridge: 'Bridge / JSON',
}

export const Chip = ({ kind, children }: { kind: Kind; children?: ReactNode }) => (
  <span className={`chip ${kind}`}>{children ?? kindLabel[kind]}</span>
)

export const Legend = () => (
  <div className="legend">
    {(Object.keys(kindLabel) as Kind[]).map(k => (
      <Chip key={k} kind={k} />
    ))}
  </div>
)

export const Hero = ({ n, title, tldr }: { n: number; title: string; tldr: string }) => (
  <motion.header
    className="hero"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', damping: 22 }}
  >
    <div className="kicker">Section {n}</div>
    <h1>{title}</h1>
    <div className="tldr">
      <b>IN ONE SENTENCE</b>
      {tldr}
    </div>
  </motion.header>
)

export const Block = ({
  title,
  lead,
  children,
}: {
  title: string
  lead?: ReactNode
  children: ReactNode
}) => (
  <motion.section
    className="block"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ type: 'spring', damping: 24, stiffness: 120 }}
  >
    <h2>{title}</h2>
    {lead && <p className="lead">{lead}</p>}
    {children}
  </motion.section>
)

export function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  const id = useId()
  return (
    <div className="seg">
      {options.map(o => (
        <button
          key={o.value}
          className={o.value === value ? 'on' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.value === value && (
            <motion.span
              layoutId={id}
              className="pill"
              style={{ inset: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            />
          )}
          <span style={{ position: 'relative' }}>{o.label}</span>
        </button>
      ))}
    </div>
  )
}

export const Stepper = ({
  steps,
  step,
  setStep,
}: {
  steps: string[]
  step: number
  setStep: (n: number) => void
}) => (
  <div className="row">
    <button className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>
      ← Back
    </button>
    {steps.map((s, i) => (
      <button
        key={s}
        className="btn"
        onClick={() => setStep(i)}
        style={{
          borderColor: i === step ? 'var(--accent)' : undefined,
          background: i === step ? 'var(--accent-soft)' : undefined,
          opacity: i > step ? 0.6 : 1,
        }}
      >
        {i + 1}. {s}
      </button>
    ))}
    <button
      className="btn primary"
      disabled={step === steps.length - 1}
      onClick={() => setStep(step + 1)}
    >
      Next →
    </button>
  </div>
)

export type Lang = 'tsx' | 'cpp' | 'objectivec' | 'kotlin' | 'json' | 'swift' | 'bash'

// Colors come from CSS classes (.tok-*) so highlighting follows the light/dark theme.
const plain: PrismTheme = { plain: {}, styles: [] }

export function Code({
  children,
  lang = 'tsx',
  title,
}: {
  children: string
  lang?: Lang
  title?: string
}) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard
      ?.writeText(children)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      })
      .catch(() => {})
  }
  return (
    <figure className="codefig">
      <figcaption>
        <span className="lang">{title ?? lang}</span>
        <button className="copy" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <Highlight theme={plain} code={children.replace(/\n$/, '')} language={lang}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="code">
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="ln">
                <span className="no">{i + 1}</span>
                <span>
                  {line.map((tok, k) => {
                    const { style: _s, className, ...rest } = getTokenProps({ token: tok })
                    return (
                      <span
                        key={k}
                        {...rest}
                        className={`${className} tok-${tok.types[tok.types.length - 1]}`}
                      />
                    )
                  })}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </figure>
  )
}

export const Box = ({
  kind,
  children,
  style,
}: {
  kind?: Kind
  children: ReactNode
  style?: React.CSSProperties
}) => (
  <motion.div layout className={`box ${kind ?? ''}`} style={style}>
    {children}
  </motion.div>
)
