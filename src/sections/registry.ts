import type { ComponentType } from 'react'
import S01 from './S01BigPicture'
import S02 from './S02Engine'
import S03 from './S03Bridge'
import S04 from './S04Jsi'
import S05 from './S05Turbo'
import S06 from './S06Codegen'
import S07 from './S07Fabric'
import S08 from './S08Layout'
import S09 from './S09Reconciler'
import S10 from './S10Events'
import S11 from './S11Bridgeless'
import S12 from './S12Metro'
import S13 from './S13Startup'
import S14 from './S14Ios'
import S15 from './S15Android'
import S16 from './S16Animations'
import S17 from './S17Gestures'
import S18 from './S18Lists'
import S19 from './S19Text'
import S20 from './S20Images'
import S21 from './S21Networking'
import S22 from './S22Memory'
import S23 from './S23Debugging'
import S24 from './S24Errors'
import S25 from './S25Release'
import S26 from './S26Extending'
import S27 from './S27Ecosystem'

export const sectionBodies: Record<string, ComponentType> = {
  'big-picture': S01,
  'js-engine': S02,
  'old-bridge': S03,
  jsi: S04,
  'turbo-modules': S05,
  codegen: S06,
  fabric: S07,
  layout: S08,
  reconciler: S09,
  events: S10,
  bridgeless: S11,
  metro: S12,
  startup: S13,
  ios: S14,
  android: S15,
  animations: S16,
  gestures: S17,
  lists: S18,
  text: S19,
  images: S20,
  networking: S21,
  memory: S22,
  debugging: S23,
  errors: S24,
  release: S25,
  extending: S26,
  ecosystem: S27,
}
