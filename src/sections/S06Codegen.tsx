import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Block, Code, Seg, Stepper } from '../components/ui'

const steps = ['Write spec', 'Parse', 'Generate', 'Compile']
type Lang = 'cpp' | 'objc' | 'kotlin'

const gen: Record<Lang, (t: string) => string> = {
  cpp: t =>
    `// generated: NativeBatterySpecJSI.h\nclass NativeBatterySpecJSI : public TurboModule {\n public:\n  virtual ${t === 'number' ? 'double' : 'jsi::String'} getLevel(jsi::Runtime& rt) = 0;\n};`,
  objc: t =>
    `// generated: NativeBatterySpec.h\n@protocol NativeBatterySpec <RCTBridgeModule, RCTTurboModule>\n\n- (${t === 'number' ? 'NSNumber *' : 'NSString *'})getLevel;\n\n@end`,
  kotlin: t =>
    `// generated: NativeBatterySpec.java\nabstract class NativeBatterySpec : ReactContextBaseJavaModule {\n  @ReactMethod(isBlockingSynchronousMethod = true)\n  abstract fun getLevel(): ${t === 'number' ? 'Double' : 'String'}\n}`,
}

export default function S06() {
  const [step, setStep] = useState(0)
  const [lang, setLang] = useState<Lang>('cpp')
  const [t, setT] = useState('number')
  const mismatch = step >= 3 && t === 'string'
  return (
    <>
      <Block
        title="Spec → generated code → compile"
        lead="Walk the pipeline. Then break the type and watch the build catch it before your users do."
      >
        <Stepper steps={steps} step={step} setStep={setStep} />
        <div className="row">
          <span className="note">Return type of getLevel():</span>
          <Seg
            value={t}
            onChange={setT}
            options={[
              { value: 'number', label: 'number' },
              { value: 'string', label: 'string' },
            ]}
          />
        </div>
        <div
          className="grid3"
          style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}
        >
          <div>
            <div className="note" style={{ marginBottom: 6 }}>
              NativeBattery.ts (you write)
            </div>
            <Code title="NativeBattery.ts">{`import type { TurboModule } from 'react-native';\nimport { TurboModuleRegistry } from 'react-native';\n\nexport interface Spec extends TurboModule {\n  getLevel(): ${t};\n}\n\nexport default TurboModuleRegistry.getEnforcing<Spec>('NativeBattery');`}</Code>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${step >= 2}-${lang}-${t}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="row" style={{ marginBottom: 6 }}>
                <span className="note">Generated:</span>
                <Seg
                  value={lang}
                  onChange={setLang}
                  options={[
                    { value: 'cpp', label: 'C++' },
                    { value: 'objc', label: 'ObjC' },
                    { value: 'kotlin', label: 'Java/Kotlin' },
                  ]}
                />
              </div>
              <Code lang={lang === 'objc' ? 'objectivec' : lang} title={`generated · ${lang}`}>
                {step >= 2 ? gen[lang](t) : '// not generated yet'}
              </Code>
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="tldr" style={{ marginTop: 16, fontSize: 15 }}>
          <b>STEP {step + 1}</b>
          {
            [
              'You describe the module once in TypeScript (or Flow).',
              'Codegen parses the spec into a schema (JSON).',
              'Per-platform glue is generated from that one schema.',
              '',
            ][step]
          }
          {step === 3 &&
            (mismatch ? (
              <span className="err">
                Build error: your native implementation returns a number, but the spec now says
                string. Caught at build time.
              </span>
            ) : (
              <span className="ok">Native implementation matches the spec — build passes.</span>
            ))}
        </p>
      </Block>
      <Block
        title="How it ties Turbo Modules and Fabric together"
        lead="Codegen isn't just for modules. Fabric components use it too: your component's props spec generates C++ props and event-emitter classes, so the shadow tree and native view agree on types."
      >
        <div className="grid3">
          <div className="box cpp">
            <b>Turbo Modules</b>
            <p className="note">Generates method interfaces</p>
          </div>
          <div className="box cpp">
            <b>Fabric components</b>
            <p className="note">Generates Props, State, EventEmitters</p>
          </div>
        </div>
      </Block>
    </>
  )
}
