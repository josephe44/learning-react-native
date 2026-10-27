import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Block, Code, Stepper } from '../components/ui'

const steps = ['main()', 'AppDelegate', 'Factory', 'Root view']
const text = [
  'UIApplicationMain starts the app and creates your AppDelegate.',
  'didFinishLaunching runs. In a standard template your AppDelegate subclasses RCTAppDelegate, which does the work.',
  'RCTReactNativeFactory (Objective-C++) creates the ReactHost: Hermes runtime, TurboModules, Fabric.',
  'A root view hosting the Fabric surface is placed in a UIViewController and set as the window root.',
]

type Op = { k: string; d: string }
function Mount() {
  const [ops, setOps] = useState<Op[]>([])
  const add = (k: string, d: string) => setOps(o => [...o, { k, d }])
  return (
    <>
      <div className="row">
        <button className="btn" onClick={() => add('CREATE', 'UILabel *l = [UILabel new];')}>
          CREATE
        </button>
        <button className="btn" onClick={() => add('INSERT', '[parent addSubview:l];')}>
          INSERT
        </button>
        <button className="btn" onClick={() => add('UPDATE', 'l.text = @"Hi";')}>
          UPDATE
        </button>
        <button className="btn" onClick={() => setOps([])}>
          Reset
        </button>
      </div>
      <div style={{ display: 'grid', gap: 6, minHeight: 60 }}>
        <AnimatePresence>
          {ops.map((o, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              className="box native"
              style={{ display: 'flex', gap: 12, padding: '6px 12px' }}
            >
              <b style={{ width: 70 }}>{o.k}</b>
              <code>{o.d}</code>
            </motion.div>
          ))}
        </AnimatePresence>
        {!ops.length && (
          <span className="note">
            Fabric's mutation list becomes UIKit calls on the main thread. Add some.
          </span>
        )}
      </div>
    </>
  )
}

export default function S14() {
  const [s, setS] = useState(0)
  return (
    <>
      <Block title="From main() to your first view">
        <Stepper steps={steps} step={s} setStep={setS} />
        <p className="tldr" style={{ fontSize: 15 }}>
          <b>{steps[s].toUpperCase()}</b>
          {text[s]}
        </p>
        <Code
          lang="objectivec"
          title="AppDelegate.mm"
        >{`#import "AppDelegate.h"\n\n@implementation AppDelegate\n\n- (BOOL)application:(UIApplication *)application\n    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {\n  self.moduleName = @"MyApp";\n  self.initialProps = @{};\n  return [super application:application\n      didFinishLaunchingWithOptions:launchOptions];\n}\n\n@end`}</Code>
      </Block>
      <Block
        title="Objective-C++ glue"
        lead="Files ending in .mm mix Objective-C and C++. They are the bridge between UIKit (Objective-C) and React Native's C++ core, so a single file can call both."
      >
        <span />
      </Block>
      <Block title="Mounting UIKit views">
        <Mount />
      </Block>
      <Block
        title="CocoaPods and autolinking"
        lead="CocoaPods installs native dependencies. React Native's autolinking scans node_modules and adds each library's pod for you."
      >
        <Code
          lang="kotlin"
          title="Podfile (Ruby)"
        >{`target 'MyApp' do\n  config = use_native_modules!\n  use_react_native!(\n    :path => config[:reactNativePath],\n    :app_path => "#{Pod::Config.instance.installation_root}/.."\n  )\nend`}</Code>
      </Block>
    </>
  )
}
