export type EdgeType = 'R' | 'B' | 'F' | 'S'

export const edgeTypes: Record<EdgeType, { name: string; color: string; dash?: string }> = {
  R: { name: 'Replaces', color: 'var(--bridge)', dash: '6 5' },
  B: { name: 'Built on', color: 'var(--cpp)' },
  F: { name: 'Flows into', color: 'var(--native)' },
  S: { name: 'Supports', color: 'var(--dim)', dash: '2 4' },
}

export interface MapNode {
  id: string
  label: string
  row: number
}

export const rows = [
  'Overview',
  'Your JavaScript',
  'Runtime',
  'C++ core',
  'Native',
  'Tooling & build',
]

// Order inside a row is the left-to-right order on screen.
const layout: [number, string, string][] = [
  [0, 'big-picture', 'Big Picture'],
  [1, 'reconciler', 'Reconciler'],
  [1, 'events', 'Events'],
  [1, 'gestures', 'Gestures'],
  [1, 'animations', 'Animations'],
  [1, 'lists', 'Lists'],
  [1, 'networking', 'Networking'],
  [1, 'errors', 'Errors'],
  [2, 'js-engine', 'JS Engine'],
  [2, 'old-bridge', 'Old Bridge'],
  [2, 'jsi', 'JSI'],
  [2, 'turbo-modules', 'Turbo Modules'],
  [2, 'bridgeless', 'Bridgeless'],
  [3, 'fabric', 'Fabric'],
  [3, 'layout', 'Layout (Yoga)'],
  [3, 'text', 'Text'],
  [3, 'images', 'Images'],
  [4, 'ios', 'iOS'],
  [4, 'android', 'Android'],
  [5, 'metro', 'Metro'],
  [5, 'startup', 'Startup'],
  [5, 'codegen', 'Codegen'],
  [5, 'memory', 'Memory & Perf'],
  [5, 'debugging', 'Debugging'],
  [5, 'release', 'Release'],
  [5, 'extending', 'Extending'],
  [5, 'ecosystem', 'Ecosystem'],
]
export const mapNodes: MapNode[] = layout.map(([row, id, label]) => ({ id, label, row }))

// Each edge reads as a sentence: "<from> <label> <to>".
export interface Edge {
  from: string
  to: string
  label: string
  type: EdgeType
}
const e = (from: string, to: string, label: string, type: EdgeType): Edge => ({
  from,
  to,
  label,
  type,
})
export const edges: Edge[] = [
  e('big-picture', 'old-bridge', 'explains', 'S'),
  e('big-picture', 'jsi', 'explains', 'S'),
  e('big-picture', 'fabric', 'explains', 'S'),
  e('old-bridge', 'jsi', 'is replaced by', 'R'),
  e('bridgeless', 'old-bridge', 'removes', 'R'),
  e('jsi', 'js-engine', 'is built on', 'B'),
  e('turbo-modules', 'jsi', 'is built on', 'B'),
  e('fabric', 'jsi', 'is built on', 'B'),
  e('bridgeless', 'jsi', 'runs everything over', 'B'),
  e('bridgeless', 'turbo-modules', 'hosts', 'B'),
  e('codegen', 'turbo-modules', 'generates code for', 'F'),
  e('codegen', 'fabric', 'generates code for', 'F'),
  e('reconciler', 'fabric', 'renders into', 'F'),
  e('fabric', 'layout', 'asks for layout from', 'F'),
  e('layout', 'text', 'measures with', 'F'),
  e('text', 'ios', 'uses the text engine of', 'F'),
  e('text', 'android', 'uses the text engine of', 'F'),
  e('fabric', 'ios', 'mounts views on', 'F'),
  e('fabric', 'android', 'mounts views on', 'F'),
  e('events', 'fabric', 'dispatches through', 'F'),
  e('events', 'reconciler', 'sets update priority in', 'F'),
  e('gestures', 'events', 'replaces the JS responder in', 'R'),
  e('gestures', 'animations', 'drives', 'F'),
  e('animations', 'js-engine', 'runs worklets beside', 'B'),
  e('animations', 'fabric', 'updates props in', 'F'),
  e('lists', 'reconciler', 'mounts rows through', 'F'),
  e('lists', 'images', 'renders', 'F'),
  e('images', 'ios', 'decodes natively on', 'F'),
  e('images', 'android', 'decodes natively on', 'F'),
  e('images', 'networking', 'downloads through', 'F'),
  e('networking', 'turbo-modules', 'calls native code via', 'B'),
  e('errors', 'reconciler', 'uses error boundaries in', 'S'),
  e('errors', 'js-engine', 'catches exceptions from', 'S'),
  e('errors', 'android', 'reports crashes from', 'S'),
  e('startup', 'js-engine', 'creates', 'F'),
  e('startup', 'bridgeless', 'starts', 'F'),
  e('startup', 'metro', 'loads the bundle from', 'F'),
  e('startup', 'ios', 'launches through', 'F'),
  e('metro', 'js-engine', 'feeds a bundle to', 'F'),
  e('release', 'metro', 'builds with', 'B'),
  e('release', 'js-engine', 'ships bytecode for', 'F'),
  e('release', 'errors', 'uploads source maps for', 'S'),
  e('debugging', 'js-engine', 'talks CDP to', 'S'),
  e('debugging', 'metro', 'connects through', 'S'),
  e('memory', 'js-engine', 'profiles the GC of', 'S'),
  e('memory', 'lists', 'is the reason for', 'S'),
  e('memory', 'android', 'measures native memory on', 'S'),
  e('extending', 'turbo-modules', 'adds new', 'B'),
  e('extending', 'fabric', 'adds native components to', 'B'),
  e('extending', 'codegen', 'starts with', 'B'),
  e('ecosystem', 'extending', 'simplifies', 'S'),
  e('ecosystem', 'metro', 'wraps the CLI around', 'S'),
  e('ecosystem', 'android', 'autolinks into', 'S'),
  e('ecosystem', 'ios', 'autolinks into', 'S'),
]

export const oldArch = ['old-bridge']
export const newArch = ['jsi', 'turbo-modules', 'codegen', 'fabric', 'bridgeless']

export const tapTour = [
  { id: 'ios', t: 'A finger touches the screen. The native view receives the touch.' },
  { id: 'events', t: 'The event system finds the target and builds the dispatch path.' },
  { id: 'reconciler', t: 'Your onPress runs and React works out what changed.' },
  { id: 'fabric', t: 'Fabric clones the shadow tree and commits the new one.' },
  { id: 'layout', t: 'Yoga lays out the new tree.' },
  { id: 'android', t: 'Mutations are applied and real native views update on screen.' },
]
