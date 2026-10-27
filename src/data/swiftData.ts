// Content for the "Swift for React Native engineers" page.
// Facts checked against docs.swift.org (Swift 6.4 book) and developer.apple.com SwiftUI / SwiftData docs.
const sw = String.raw

export interface Pair {
  id: string
  title: string
  rn: string
  swift: string
  note: string
}

export const languagePairs: Pair[] = [
  {
    id: 'vars',
    title: 'let and var',
    rn: sw`const name = "Ada"   // cannot reassign
let count = 0
count += 1`,
    swift: sw`let name = "Ada"     // constant
var count = 0        // variable
count += 1`,
    note: 'Swift let is the JavaScript const. Swift var is the JavaScript let. Types are inferred once and never change.',
  },
  {
    id: 'optionals',
    title: 'Optionals',
    rn: sw`let nickname: string | undefined
const len = nickname?.length ?? 0

if (nickname) {
  console.log(nickname.toUpperCase())
}`,
    swift: sw`var nickname: String?
let len = nickname?.count ?? 0

if let nickname {
  print(nickname.uppercased())
}`,
    note: 'An optional may hold nil. The compiler makes you handle it before use, so there is no "undefined is not a function" at runtime.',
  },
  {
    id: 'functions',
    title: 'Functions and labels',
    rn: sw`function greet(name: string, from: string) {
  return "Hi " + name + ", from " + from
}
greet("Ada", "Bo")`,
    swift: sw`func greet(_ name: String, from sender: String) -> String {
  "Hi \(name), from \(sender)"
}
greet("Ada", from: "Bo")`,
    note: 'Argument labels make calls read like a sentence. An underscore hides the label. A single expression returns without the return keyword.',
  },
  {
    id: 'closures',
    title: 'Closures',
    rn: sw`const doubled = [1, 2, 3].map(n => n * 2)
const evens = nums.filter(n => n % 2 === 0)`,
    swift: sw`let doubled = [1, 2, 3].map { $0 * 2 }
let evens = nums.filter { $0 % 2 == 0 }`,
    note: '$0 is the first argument. When the last argument is a closure you write it after the parentheses. SwiftUI uses this everywhere.',
  },
  {
    id: 'value',
    title: 'Structs copy, objects share',
    rn: sw`const a = { x: 1 }
const b = a
b.x = 5
console.log(a.x) // 5, same object`,
    swift: sw`struct Point { var x: Int }
var a = Point(x: 1)
var b = a
b.x = 5
print(a.x) // 1, b is a copy`,
    note: 'Structs are value types: assigning copies them. SwiftUI views and most data models are structs. Classes are reference types and behave like JavaScript objects.',
  },
  {
    id: 'enums',
    title: 'Enums with data',
    rn: sw`type Load =
  | { kind: "loading" }
  | { kind: "loaded"; user: User }
  | { kind: "failed"; message: string }

switch (s.kind) {
  case "loaded": return s.user.name
}`,
    swift: sw`enum Load {
  case loading
  case loaded(User)
  case failed(String)
}

switch state {
case .loading: print("loading")
case .loaded(let user): print(user.name)
case .failed(let message): print(message)
}`,
    note: 'Each case can carry its own data, like a discriminated union. A switch must cover every case, so adding a case shows you every place to update.',
  },
  {
    id: 'protocols',
    title: 'Protocols',
    rn: sw`interface Shape {
  area(): number
}
class Circle implements Shape {
  constructor(private r: number) {}
  area() { return Math.PI * this.r ** 2 }
}`,
    swift: sw`protocol Shape {
  func area() -> Double
}
struct Circle: Shape {
  var r: Double
  func area() -> Double { .pi * r * r }
}`,
    note: 'A protocol is an interface. SwiftUI is built on one: any type with a body property is a View.',
  },
  {
    id: 'async',
    title: 'async and await',
    rn: sw`async function load(id: number): Promise<User> {
  const res = await fetch(base + id)
  return await res.json()
}`,
    swift: sw`func load(id: Int) async throws -> User {
  guard let url = URL(string: "https://api.example.com/users/\(id)") else {
    throw URLError(.badURL)
  }
  let (data, _) = try await URLSession.shared.data(from: url)
  return try JSONDecoder().decode(User.self, from: data)
}`,
    note: 'async and await are part of the language. throws marks a function that can fail, and try marks each call that might.',
  },
  {
    id: 'errors',
    title: 'Errors',
    rn: sw`try {
  const user = await load(1)
} catch (e) {
  console.error(e)
}`,
    swift: sw`do {
  let user = try await load(id: 1)
  print(user.name)
} catch {
  print(error)
}`,
    note: 'Errors are values that conform to the Error protocol. do and catch handle them, and the compiler checks that you did.',
  },
  {
    id: 'codable',
    title: 'JSON and Codable',
    rn: sw`const user: User = JSON.parse(text) // trusts the shape`,
    swift: sw`struct User: Codable {
  let id: Int
  var name: String
}
let user = try JSONDecoder().decode(User.self, from: data)`,
    note: 'Decoding checks the real shape. A wrong field throws at the boundary instead of crashing later.',
  },
  {
    id: 'extensions',
    title: 'Extensions',
    rn: sw`// patching prototypes is discouraged
function isBlank(s: string) {
  return s.trim().length === 0
}`,
    swift: sw`extension String {
  var isBlank: Bool {
    trimmingCharacters(in: .whitespaces).isEmpty
  }
}
"  ".isBlank // true`,
    note: "Extensions add behavior to any type, including Apple's. They are also how Swift code is organized into sections.",
  },
]

export const uiPairs: Pair[] = [
  {
    id: 'component',
    title: 'Component',
    rn: sw`function Greeting({ name }: { name: string }) {
  return <Text>Hello {name}</Text>
}`,
    swift: sw`struct Greeting: View {
  let name: String

  var body: some View {
    Text("Hello \(name)")
  }
}`,
    note: 'A component is a struct that conforms to View. Props are stored properties passed to the initializer.',
  },
  {
    id: 'state',
    title: 'State',
    rn: sw`const [count, setCount] = useState(0)
<Button title="Add" onPress={() => setCount(count + 1)} />`,
    swift: sw`@State private var count = 0

Button("Add") { count += 1 }`,
    note: 'You change the value directly. SwiftUI sees the change and re-runs body. Mark @State private, since the view owns it.',
  },
  {
    id: 'layout',
    title: 'Layout',
    rn: sw`<View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
  <Icon />
  <Text>Title</Text>
</View>`,
    swift: sw`HStack(spacing: 8) {
  Image(systemName: "star")
  Text("Title")
}`,
    note: 'VStack, HStack and ZStack replace flex columns, rows and absolute stacking. Spacer() pushes content apart, like flex: 1 on an empty view.',
  },
  {
    id: 'style',
    title: 'Styling',
    rn: sw`<Text style={styles.title}>Hi</Text>

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "700", padding: 12 },
})`,
    swift: sw`Text("Hi")
  .font(.title)
  .fontWeight(.bold)
  .padding(12)`,
    note: 'Styling is a chain of modifiers. Each one returns a new view, and the order matters (see the Style tab).',
  },
  {
    id: 'list',
    title: 'Lists',
    rn: sw`<FlatList
  data={todos}
  keyExtractor={t => t.id}
  renderItem={({ item }) => <Row todo={item} />}
/>`,
    swift: sw`List(todos) { todo in
  Row(todo: todo)
}`,
    note: 'Items must be Identifiable, which plays the role of keyExtractor. For custom designs use LazyVStack inside a ScrollView.',
  },
  {
    id: 'effect',
    title: 'Effects',
    rn: sw`useEffect(() => {
  load(id)
}, [id])`,
    swift: sw`.task(id: id) {
  await load(id)
}`,
    note: 'task runs when the view appears, restarts when id changes, and is cancelled when the view goes away. onChange(of:) reacts to a value changing.',
  },
  {
    id: 'context',
    title: 'Shared state',
    rn: sw`const CartCtx = createContext<Cart>(null!)
<CartCtx.Provider value={cart}><Screen /></CartCtx.Provider>
const cart = useContext(CartCtx)`,
    swift: sw`@Observable class Cart {
  var items: [Item] = []
}

Screen().environment(cart)

@Environment(Cart.self) private var cart`,
    note: '@Observable needs iOS 17 or later. A view re-renders only when a property its body actually reads changes.',
  },
  {
    id: 'nav',
    title: 'Navigation',
    rn: sw`navigation.navigate("Details", { id: item.id })`,
    swift: sw`NavigationStack {
  List(items) { item in
    NavigationLink(item.name, value: item)
  }
  .navigationDestination(for: Item.self) { item in
    DetailView(item: item)
  }
}`,
    note: 'Navigation is driven by values. Bind a NavigationPath to the stack for deep links and programmatic navigation.',
  },
  {
    id: 'input',
    title: 'Two-way input',
    rn: sw`<TextInput value={text} onChangeText={setText} />`,
    swift: sw`TextField("Name", text: $text)`,
    note: '$text is a Binding: a two-way reference to the state, so no separate setter is needed.',
  },
  {
    id: 'conditional',
    title: 'Conditional UI',
    rn: sw`{isLoggedIn ? <Home /> : <Login />}
{error && <ErrorBanner error={error} />}`,
    swift: sw`if isLoggedIn { Home() } else { Login() }
if let error { ErrorBanner(error: error) }`,
    note: 'Plain if, else and switch work inside a view body. No ternary or && tricks needed.',
  },
  {
    id: 'animation',
    title: 'Animation',
    rn: sw`Animated.timing(opacity, {
  toValue: 1, duration: 300, useNativeDriver: true,
}).start()`,
    swift: sw`withAnimation(.easeInOut(duration: 0.3)) {
  isVisible = true
}
// or: .animation(.spring, value: isVisible)`,
    note: 'You describe the state change and SwiftUI animates the difference between before and after.',
  },
  {
    id: 'modal',
    title: 'Modals',
    rn: sw`<Modal visible={open} onRequestClose={close}>
  <Settings />
</Modal>`,
    swift: sw`.sheet(isPresented: $open) {
  SettingsView()
}`,
    note: 'Sheets, alerts, popovers and full-screen covers are all modifiers on a view.',
  },
  {
    id: 'storage',
    title: 'Persistence',
    rn: sw`await AsyncStorage.setItem("theme", "dark")`,
    swift: sw`@AppStorage("theme") private var theme = "dark"

// structured data with SwiftData (iOS 17+)
@Model final class Note {
  var title: String
  init(title: String) { self.title = title }
}
@Query private var notes: [Note]`,
    note: '@AppStorage wraps UserDefaults for small settings. SwiftData stores models and @Query keeps a view in sync with them.',
  },
  {
    id: 'safe',
    title: 'Safe area',
    rn: sw`<SafeAreaView style={{ flex: 1 }}>
  <Content />
</SafeAreaView>`,
    swift: sw`// content respects safe areas by default
Background()
  .ignoresSafeArea() // opt out when you want edge to edge`,
    note: 'Safe areas are handled for you. You opt out for backgrounds and full-bleed media.',
  },
]

export interface PathItem {
  t: string
  rn: string
  note: string
}
export interface Stage {
  id: string
  title: string
  weeks: string
  goal: string
  items: PathItem[]
}

export const stages: Stage[] = [
  {
    id: 's1',
    title: 'Swift language basics',
    weeks: 'Week 1 to 2',
    goal: 'Read and write everyday Swift without fighting the compiler.',
    items: [
      {
        t: 'let, var, type inference',
        rn: 'const, let',
        note: 'Prefer let. Swift infers types, so you write them only when needed.',
      },
      {
        t: 'Optionals: if let, guard let, ??',
        rn: 'optional chaining, ??',
        note: 'The biggest mindset change. nil is handled by the type system.',
      },
      {
        t: 'Structs vs classes (value vs reference)',
        rn: 'plain objects',
        note: 'Structs copy on assignment. Most of your models and all SwiftUI views are structs.',
      },
      {
        t: 'Enums with associated values and switch',
        rn: 'discriminated unions',
        note: 'Model loading, error and result states as one enum.',
      },
      {
        t: 'Collections: Array, Dictionary, Set',
        rn: 'Array, Map, Set',
        note: 'Learn map, filter, reduce, sorted, and compactMap.',
      },
      {
        t: 'Closures and trailing closure syntax',
        rn: 'arrow functions',
        note: 'SwiftUI code is full of closures.',
      },
      {
        t: 'Protocols and extensions',
        rn: 'interfaces, mixins',
        note: 'Composition over inheritance. View is a protocol.',
      },
      {
        t: 'Error handling: throws, try, do/catch',
        rn: 'try/catch',
        note: 'Every throwing call is marked with try.',
      },
      {
        t: 'Generics and opaque types (some View)',
        rn: 'TS generics',
        note: 'some View means "one specific view type, hidden".',
      },
    ],
  },
  {
    id: 's2',
    title: 'SwiftUI fundamentals',
    weeks: 'Week 3 to 4',
    goal: 'Build static and simple interactive screens.',
    items: [
      {
        t: 'The View protocol and body',
        rn: 'function components',
        note: 'body is computed, so it must stay fast and free of side effects.',
      },
      {
        t: 'Text, Image, Button, SF Symbols',
        rn: 'Text, Image, Pressable',
        note: 'Image(systemName:) gives you thousands of icons.',
      },
      {
        t: 'VStack, HStack, ZStack, Spacer',
        rn: 'flex column, row',
        note: 'Learn alignment and spacing parameters.',
      },
      {
        t: 'Modifiers and why order matters',
        rn: 'style props',
        note: 'padding then background is not background then padding.',
      },
      {
        t: 'Frames, sizing, GeometryReader',
        rn: 'width, height, onLayout',
        note: 'Views propose a size, children choose theirs. Avoid fixed sizes.',
      },
      {
        t: 'List, ForEach, ScrollView, LazyVStack',
        rn: 'FlatList, ScrollView',
        note: 'Use Identifiable data.',
      },
      {
        t: 'Forms and controls: Toggle, Picker, Slider, Stepper',
        rn: 'Switch, community pickers',
        note: 'Most controls come built in and look native.',
      },
      {
        t: '#Preview and Xcode canvas',
        rn: 'Fast Refresh',
        note: 'Live previews are your fastest feedback loop.',
      },
    ],
  },
  {
    id: 's3',
    title: 'State and data flow',
    weeks: 'Week 5 to 6',
    goal: 'Share state cleanly across screens.',
    items: [
      {
        t: '@State and @Binding',
        rn: 'useState, props with setters',
        note: '$value passes a two-way binding.',
      },
      {
        t: '@Observable models (iOS 17+)',
        rn: 'Zustand, Context stores',
        note: 'Replaces ObservableObject and @Published for new code.',
      },
      {
        t: '@Environment and custom environment values',
        rn: 'useContext',
        note: 'Use .environment(model) at the root.',
      },
      {
        t: '@Bindable for editing observable models',
        rn: 'controlled inputs',
        note: 'Gives you $model.property bindings.',
      },
      {
        t: 'Identifiable, Hashable, Codable',
        rn: 'ids, JSON types',
        note: 'Three protocols you will adopt on almost every model.',
      },
      {
        t: 'MVVM-light: keep logic out of body',
        rn: 'hooks, custom hooks',
        note: 'A small @Observable class per screen is enough.',
      },
    ],
  },
  {
    id: 's4',
    title: 'Navigation and app structure',
    weeks: 'Week 7',
    goal: 'Multi-screen apps with tabs, stacks and sheets.',
    items: [
      {
        t: 'App, Scene, WindowGroup lifecycle',
        rn: 'AppRegistry, App.tsx',
        note: 'The @main struct is your entry point.',
      },
      {
        t: 'NavigationStack, navigationDestination, NavigationPath',
        rn: 'React Navigation stack',
        note: 'Value based and works with deep links (iOS 16+).',
      },
      {
        t: 'TabView and NavigationSplitView',
        rn: 'bottom tabs, drawers',
        note: 'Adaptive on iPad and Mac.',
      },
      {
        t: 'Sheets, alerts, confirmation dialogs',
        rn: 'Modal, Alert',
        note: 'Modifiers like .sheet and .alert(item:).',
      },
      {
        t: 'Scene phase and URL handling',
        rn: 'AppState, Linking',
        note: '@Environment(\\.scenePhase), .onOpenURL.',
      },
    ],
  },
  {
    id: 's5',
    title: 'Concurrency and networking',
    weeks: 'Week 8 to 9',
    goal: 'Load data safely without freezing the UI.',
    items: [
      {
        t: 'async/await and Task',
        rn: 'async/await, Promises',
        note: 'Same shape, with compile-time safety.',
      },
      {
        t: '.task and .refreshable in views',
        rn: 'useEffect, RefreshControl',
        note: 'Tied to the view lifetime and cancelled automatically.',
      },
      {
        t: '@MainActor and actors',
        rn: 'single JS thread',
        note: 'UI work belongs on the main actor. Actors protect shared mutable state.',
      },
      {
        t: 'URLSession and Codable',
        rn: 'fetch, axios',
        note: 'try await URLSession.shared.data(from:).',
      },
      {
        t: 'Swift 6 data-race safety and Sendable',
        rn: 'n/a',
        note: 'The compiler checks thread safety. Read the Concurrency chapter of the Swift book.',
      },
      {
        t: 'Loading, loaded, failed state enum',
        rn: 'React Query states',
        note: 'One enum instead of three booleans.',
      },
    ],
  },
  {
    id: 's6',
    title: 'Persistence and system features',
    weeks: 'Week 10 to 11',
    goal: 'Save data and use the device.',
    items: [
      {
        t: '@AppStorage and UserDefaults',
        rn: 'MMKV, AsyncStorage',
        note: 'For small settings only.',
      },
      {
        t: 'SwiftData: @Model, ModelContainer, @Query',
        rn: 'WatermelonDB, SQLite',
        note: 'iOS 17+. Add .modelContainer(for:) to your scene.',
      },
      {
        t: 'Keychain for secrets',
        rn: 'expo-secure-store',
        note: 'Never put tokens in UserDefaults.',
      },
      { t: 'Local notifications', rn: 'expo-notifications', note: 'UserNotifications framework.' },
      {
        t: 'PhotosPicker, Camera, Location, ShareLink',
        rn: 'expo-image-picker, etc.',
        note: 'Native pickers need no custom permission screens for photos.',
      },
      {
        t: 'CloudKit sync with SwiftData',
        rn: 'custom backend sync',
        note: 'Needs capabilities and a compatible schema.',
      },
    ],
  },
  {
    id: 's7',
    title: 'Polish: animation, gestures, accessibility',
    weeks: 'Week 12 to 13',
    goal: 'Make it feel like a native app.',
    items: [
      {
        t: 'withAnimation, .animation, transitions, matchedGeometryEffect',
        rn: 'Animated, Reanimated, LayoutAnimation',
        note: 'Springs are the default feel.',
      },
      {
        t: 'Gestures: Tap, Drag, Long press, Magnify',
        rn: 'PanResponder, Gesture Handler',
        note: 'Compose with .simultaneously and .sequenced.',
      },
      {
        t: 'Dynamic Type, Dark Mode, semantic colors',
        rn: 'useColorScheme',
        note: 'Use text styles and Color.primary instead of fixed values.',
      },
      {
        t: 'VoiceOver labels and traits',
        rn: 'accessibilityLabel',
        note: '.accessibilityLabel, .accessibilityHint.',
      },
      {
        t: 'Haptics: .sensoryFeedback',
        rn: 'expo-haptics',
        note: 'One modifier tied to a state change.',
      },
      {
        t: 'Liquid Glass design (iOS 26)',
        rn: 'n/a',
        note: 'Standard controls adopt it when built with the new SDK. glassEffect(_:in:) is available for custom views.',
      },
    ],
  },
  {
    id: 's8',
    title: 'Testing, profiling and shipping',
    weeks: 'Week 14',
    goal: 'Put an app in TestFlight.',
    items: [
      {
        t: 'Swift Testing: @Test and #expect',
        rn: 'Jest',
        note: 'XCTest is still used for UI and performance tests.',
      },
      {
        t: 'XCUITest for UI flows',
        rn: 'Detox, Maestro',
        note: 'Record and edit UI tests in Xcode.',
      },
      {
        t: 'Instruments: Time Profiler, SwiftUI, Allocations',
        rn: 'Flipper, React Profiler',
        note: 'Find slow body evaluations and leaks.',
      },
      {
        t: 'Signing, capabilities, App Store Connect',
        rn: 'EAS Build',
        note: 'Automatic signing handles most of it.',
      },
      {
        t: 'TestFlight and Xcode Cloud',
        rn: 'EAS Submit',
        note: 'Internal testers need no review.',
      },
    ],
  },
  {
    id: 's9',
    title: 'Back to React Native',
    weeks: 'Ongoing',
    goal: 'Use Swift inside the app you already ship.',
    items: [
      {
        t: 'Write a native module in Swift',
        rn: 'Turbo Modules',
        note: 'The Expo Modules API lets you write modules in Swift (see the Ecosystem section).',
      },
      {
        t: 'Read your RN native code with new eyes',
        rn: 'ios/ folder',
        note: 'AppDelegate, Obj-C++ glue and pods now make sense (see Platform: iOS).',
      },
      {
        t: 'Host a SwiftUI view in a native component',
        rn: 'Fabric components',
        note: 'UIHostingController wraps SwiftUI for UIKit based code.',
      },
      {
        t: 'Decide: RN, SwiftUI, or both',
        rn: 'architecture choice',
        note: 'Share business logic in RN, build platform-defining screens natively.',
      },
    ],
  },
]

export interface Build {
  id: string
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  concepts: string[]
  rn: string
  blurb: string
  code: string
}

export const components: Build[] = [
  {
    id: 'button',
    name: 'Primary button style',
    level: 'Beginner',
    concepts: ['ButtonStyle', 'isPressed', 'modifiers'],
    rn: 'Pressable with a style function',
    blurb: 'A full-width button that dims and shrinks while pressed.',
    code: sw`struct PrimaryButtonStyle: ButtonStyle {
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.headline)
      .foregroundStyle(.white)
      .padding(.vertical, 14)
      .frame(maxWidth: .infinity)
      .background(.tint, in: .rect(cornerRadius: 14))
      .opacity(configuration.isPressed ? 0.8 : 1)
      .scaleEffect(configuration.isPressed ? 0.98 : 1)
  }
}

Button("Continue") { }
  .buttonStyle(PrimaryButtonStyle())`,
  },
  {
    id: 'avatar',
    name: 'Avatar with status badge',
    level: 'Beginner',
    concepts: ['overlay', 'clipShape', 'default parameters'],
    rn: 'View with an absolutely positioned dot',
    blurb: 'Initials in a circle with an online indicator in the corner.',
    code: sw`struct Avatar: View {
  let initials: String
  var isOnline = false

  var body: some View {
    Text(initials)
      .font(.headline)
      .frame(width: 48, height: 48)
      .background(.tint.opacity(0.2), in: .circle)
      .overlay(alignment: .bottomTrailing) {
        if isOnline {
          Circle()
            .fill(.green)
            .frame(width: 12, height: 12)
            .overlay(Circle().stroke(.background, lineWidth: 2))
        }
      }
  }
}`,
  },
  {
    id: 'settings',
    name: 'Settings row with toggle',
    level: 'Beginner',
    concepts: ['@Binding', 'Toggle', 'Label', 'List'],
    rn: 'Switch with value and onValueChange',
    blurb: 'A reusable row that edits a boolean owned by its parent.',
    code: sw`struct SettingsRow: View {
  let title: String
  let icon: String
  @Binding var isOn: Bool

  var body: some View {
    Toggle(isOn: $isOn) {
      Label(title, systemImage: icon)
    }
  }
}

// usage
@State private var notifications = true

List {
  SettingsRow(title: "Notifications", icon: "bell", isOn: $notifications)
}`,
  },
  {
    id: 'rating',
    name: 'Star rating',
    level: 'Beginner',
    concepts: ['@Binding', 'ForEach', 'SF Symbols', 'onTapGesture'],
    rn: 'Row of Pressable stars',
    blurb: 'Tap a star to set the rating, shared with the parent through a binding.',
    code: sw`struct RatingView: View {
  @Binding var rating: Int
  var maximum = 5

  var body: some View {
    HStack(spacing: 4) {
      ForEach(1...maximum, id: \.self) { index in
        Image(systemName: index <= rating ? "star.fill" : "star")
          .foregroundStyle(.yellow)
          .onTapGesture { rating = index }
      }
    }
  }
}`,
  },
  {
    id: 'card',
    name: 'Card modifier',
    level: 'Beginner',
    concepts: ['ViewModifier', 'View extension', 'shadow'],
    rn: 'A wrapper component or shared style object',
    blurb: 'Your own .card() modifier you can apply to any view.',
    code: sw`struct CardStyle: ViewModifier {
  func body(content: Content) -> some View {
    content
      .padding()
      .background(.background, in: .rect(cornerRadius: 16))
      .shadow(color: .black.opacity(0.08), radius: 8, y: 4)
  }
}

extension View {
  func card() -> some View { modifier(CardStyle()) }
}

Text("Hello").card()`,
  },
  {
    id: 'field',
    name: 'Validated email field',
    level: 'Intermediate',
    concepts: ['@FocusState', 'computed property', 'TextField modifiers'],
    rn: 'TextInput with onBlur validation',
    blurb: 'Highlights on focus and shows an error under the field.',
    code: sw`struct EmailField: View {
  @Binding var email: String
  @FocusState private var focused: Bool

  private var isValid: Bool {
    email.contains("@") && email.contains(".")
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 4) {
      TextField("Email", text: $email)
        .textContentType(.emailAddress)
        .keyboardType(.emailAddress)
        .textInputAutocapitalization(.never)
        .focused($focused)
        .padding(12)
        .overlay(
          RoundedRectangle(cornerRadius: 10)
            .stroke(focused ? Color.accentColor : .secondary)
        )
      if !email.isEmpty && !isValid {
        Text("Enter a valid email")
          .font(.caption)
          .foregroundStyle(.red)
      }
    }
  }
}`,
  },
  {
    id: 'skeleton',
    name: 'Skeleton loader',
    level: 'Intermediate',
    concepts: ['redacted', 'repeatForever animation', '@State'],
    rn: 'Animated opacity loop on placeholder views',
    blurb: 'Show the real layout greyed out and pulsing while data loads.',
    code: sw`struct LoadingList: View {
  @State private var pulse = false

  var body: some View {
    List(0..<6, id: \.self) { _ in
      VStack(alignment: .leading) {
        Text("Loading title")
        Text("Loading subtitle").font(.caption)
      }
    }
    .redacted(reason: .placeholder)
    .opacity(pulse ? 0.4 : 1)
    .animation(.easeInOut(duration: 0.8).repeatForever(), value: pulse)
    .onAppear { pulse = true }
  }
}`,
  },
  {
    id: 'sheet',
    name: 'Bottom sheet',
    level: 'Intermediate',
    concepts: ['.sheet', 'presentationDetents', 'dismiss'],
    rn: '@gorhom/bottom-sheet',
    blurb: 'A sheet that rests at half height and expands to full.',
    code: sw`@State private var showSheet = false

Button("Filters") { showSheet = true }
  .sheet(isPresented: $showSheet) {
    FilterView()
      .presentationDetents([.medium, .large])
      .presentationDragIndicator(.visible)
  }`,
  },
  {
    id: 'toast',
    name: 'Toast',
    level: 'Intermediate',
    concepts: ['ViewModifier', 'transition', 'Task.sleep', 'overlay'],
    rn: 'react-native-toast-message',
    blurb: 'A message that slides in from the bottom and removes itself after two seconds.',
    code: sw`struct Toast: ViewModifier {
  @Binding var message: String?

  func body(content: Content) -> some View {
    content
      .overlay(alignment: .bottom) {
        if let message {
          Text(message)
            .padding()
            .background(.thinMaterial, in: .capsule)
            .transition(.move(edge: .bottom).combined(with: .opacity))
            .task {
              try? await Task.sleep(for: .seconds(2))
              self.message = nil
            }
        }
      }
      .animation(.spring, value: message)
  }
}`,
  },
  {
    id: 'swipe',
    name: 'Swipe to delete with pull to refresh',
    level: 'Intermediate',
    concepts: ['swipeActions', 'refreshable', 'async closure'],
    rn: 'Gesture Handler Swipeable + RefreshControl',
    blurb: 'Two built-in modifiers replace two libraries.',
    code: sw`List {
  ForEach(items) { item in
    Text(item.title)
      .swipeActions(edge: .trailing) {
        Button(role: .destructive) {
          delete(item)
        } label: {
          Label("Delete", systemImage: "trash")
        }
      }
  }
}
.refreshable { await reload() }`,
  },
  {
    id: 'segmented',
    name: 'Segmented filter',
    level: 'Beginner',
    concepts: ['enum + CaseIterable', 'Picker', 'tag'],
    rn: 'SegmentedControl community package',
    blurb: 'Switch a list between All, Active and Done.',
    code: sw`enum Filter: String, CaseIterable, Identifiable {
  case all, active, done
  var id: Self { self }
}

@State private var filter = Filter.all

Picker("Filter", selection: $filter) {
  ForEach(Filter.allCases) { item in
    Text(item.rawValue.capitalized).tag(item)
  }
}
.pickerStyle(.segmented)`,
  },
  {
    id: 'drag',
    name: 'Draggable card that springs back',
    level: 'Advanced',
    concepts: ['DragGesture', 'offset', 'withAnimation(.spring)'],
    rn: 'PanResponder or Reanimated + Gesture Handler',
    blurb: 'Drag a card around, release and it returns with a spring.',
    code: sw`struct DraggableCard: View {
  @State private var offset = CGSize.zero

  var body: some View {
    RoundedRectangle(cornerRadius: 20)
      .fill(.tint)
      .frame(width: 200, height: 260)
      .offset(offset)
      .gesture(
        DragGesture()
          .onChanged { offset = $0.translation }
          .onEnded { _ in
            withAnimation(.spring) { offset = .zero }
          }
      )
  }
}`,
  },
]

export interface Project {
  id: string
  name: string
  level: string
  time: string
  blurb: string
  learn: string[]
  stack: string
  rn: string
  milestones: string[]
  stretch: string
}

export const projects: Project[] = [
  {
    id: 'tip',
    name: 'Tip splitter',
    level: 'Beginner',
    time: 'A weekend',
    blurb:
      'Enter a bill, pick a tip and split between people. A small app that touches every basic idea.',
    learn: ['@State', 'Form', 'Picker and Stepper', 'computed properties', 'FormatStyle currency'],
    stack: 'SwiftUI only',
    rn: 'A one-screen RN app with useState.',
    milestones: [
      'Bill amount field with decimal keyboard',
      'Tip percentage picker',
      'People stepper',
      'Per person total as a computed property',
      'Currency formatting from the user locale',
    ],
    stretch: 'Save the last tip choice with @AppStorage.',
  },
  {
    id: 'habit',
    name: 'Habit tracker',
    level: 'Intermediate',
    time: '1 to 2 weeks',
    blurb: 'Create habits, check them off each day and see a streak.',
    learn: [
      'SwiftData @Model and @Query',
      'List with swipeActions',
      '@AppStorage',
      'Calendar and Date',
      'UserNotifications',
    ],
    stack: 'SwiftUI + SwiftData',
    rn: 'A habit app with MMKV or SQLite.',
    milestones: [
      'Habit model and list screen',
      'Add and edit sheet',
      'Daily check-in toggle',
      'Streak calculation with unit tests',
      'Daily local reminder',
    ],
    stretch: "A home screen widget showing today's habits.",
  },
  {
    id: 'browser',
    name: 'Movie or recipe browser',
    level: 'Intermediate',
    time: '1 to 2 weeks',
    blurb: 'Search a public API, show posters and open a detail screen.',
    learn: [
      'URLSession + async/await',
      'Codable',
      'AsyncImage',
      'NavigationStack',
      'searchable',
      'loading enum',
    ],
    stack: 'SwiftUI + URLSession',
    rn: 'A FlatList app using fetch and React Navigation.',
    milestones: [
      'Codable models from the API JSON',
      'Service type with async throws methods',
      'List with AsyncImage',
      'Search with .searchable and task(id:)',
      'Detail screen with NavigationStack',
      'Error and empty states using ContentUnavailableView',
    ],
    stretch: 'Pagination and an offline cache with SwiftData.',
  },
  {
    id: 'notes',
    name: 'Notes with iCloud sync',
    level: 'Intermediate',
    time: '2 weeks',
    blurb: 'A notes app that keeps data on every device.',
    learn: [
      'SwiftData relationships',
      'CloudKit sync',
      'TextEditor',
      'ShareLink',
      'NavigationSplitView',
    ],
    stack: 'SwiftUI + SwiftData + CloudKit',
    rn: 'A notes app with a custom sync backend.',
    milestones: [
      'Note and Folder models with a relationship',
      'Split view for iPad and iPhone',
      'Rich text editing',
      'Enable iCloud capability and a compatible schema',
      'Share a note as text',
    ],
    stretch: 'Undo and redo using the model context undo manager.',
  },
  {
    id: 'port',
    name: 'Port a screen from your RN app',
    level: 'Advanced',
    time: '2 weeks',
    blurb:
      'Pick a real screen you shipped and rebuild it natively. Then expose Swift code back to React Native.',
    learn: [
      'Reading your own design in SwiftUI',
      'Expo Modules API in Swift',
      'UIHostingController',
      'Performance comparison with Instruments',
    ],
    stack: 'SwiftUI + Swift module inside RN',
    rn: 'Your existing screen.',
    milestones: [
      'Rebuild the screen in SwiftUI with fake data',
      'Match spacing, fonts and dark mode',
      'Wrap logic in a Swift module callable from JS',
      'Compare scrolling with Instruments',
      'Write up what felt easier and what did not',
    ],
    stretch: 'Ship the Swift module in your RN app.',
  },
  {
    id: 'expense',
    name: 'Expense tracker capstone',
    level: 'Advanced',
    time: '3 to 4 weeks',
    blurb: 'A polished app with charts, a widget and a TestFlight build.',
    learn: [
      'Swift Charts',
      'WidgetKit',
      'App Intents',
      'Swift Testing',
      'Accessibility',
      'TestFlight',
    ],
    stack: 'SwiftUI + SwiftData + WidgetKit',
    rn: 'A finance app with Victory charts.',
    milestones: [
      'Transactions with categories in SwiftData',
      'Monthly chart with Swift Charts',
      'Home screen widget',
      'App Intent: add an expense from Shortcuts',
      'Tests for totals and categories',
      'Accessibility pass with VoiceOver',
      'Upload to TestFlight',
    ],
    stretch: 'A Live Activity for a savings goal.',
  },
]

export const toolbox = [
  {
    rn: 'npm / yarn',
    sw: 'Swift Package Manager',
    note: 'Add packages in Xcode with File > Add Package Dependencies, or list them in Package.swift. React Native itself still uses CocoaPods for iOS.',
  },
  {
    rn: 'Metro + Fast Refresh',
    sw: 'Xcode + SwiftUI Previews',
    note: 'Write #Preview { MyView() } and the canvas updates as you type.',
  },
  {
    rn: 'React DevTools',
    sw: 'Debug View Hierarchy',
    note: 'Pause the app and inspect the live 3D view tree in Xcode.',
  },
  {
    rn: 'Chrome DevTools, console.log',
    sw: 'LLDB and breakpoints',
    note: 'Breakpoints, po in the console and the variables view. print() works too.',
  },
  {
    rn: 'Flipper, Perf Monitor, React Profiler',
    sw: 'Instruments',
    note: 'Time Profiler for CPU, Allocations and Leaks for memory, the SwiftUI instrument for view updates.',
  },
  {
    rn: 'Jest + React Native Testing Library',
    sw: 'Swift Testing and XCTest',
    note: 'Swift Testing uses @Test and #expect. XCUITest drives the UI.',
  },
  {
    rn: 'ESLint + Prettier',
    sw: 'SwiftLint + swift-format',
    note: 'Both are optional but common on teams.',
  },
  {
    rn: 'EAS Build / Submit',
    sw: 'Xcode Cloud, Fastlane, TestFlight',
    note: 'Archive in Xcode and upload to App Store Connect, or automate it.',
  },
  {
    rn: 'package.json, app.json',
    sw: 'Package.swift, Info.plist, entitlements',
    note: 'Capabilities such as push, iCloud and App Groups live in the target settings.',
  },
  {
    rn: 'Expo Go / dev build',
    sw: 'Run on a device from Xcode',
    note: 'Sign in with an Apple ID under Signing & Capabilities to run on your phone.',
  },
]

export const setup = [
  'Install Xcode from the Mac App Store and open it once to accept the license',
  'Install an iOS Simulator runtime under Settings > Components',
  'Create a project: iOS > App, interface SwiftUI, language Swift',
  'Run it on a simulator and edit the Text in ContentView',
  'Open the Preview canvas and edit with live preview',
  'Add your Apple ID in Xcode Settings > Accounts and run on a real iPhone',
  'Download the SF Symbols app to browse icons',
  'Install swiftly from swift.org if you also want command line toolchains',
  'Create a git repository with a Swift/Xcode .gitignore',
]

export interface Rule {
  id: string
  title: string
  avoid: string
  prefer: string
  why: string
}
export const rules: Rule[] = [
  {
    id: 'guard',
    title: 'Exit early with guard',
    avoid: sw`func show(user: User?) {
  if let user = user {
    if user.isActive {
      print(user.name)
    }
  }
}`,
    prefer: sw`func show(user: User?) {
  guard let user, user.isActive else { return }
  print(user.name)
}`,
    why: 'guard keeps the happy path unindented and the unwrapped value available for the rest of the function.',
  },
  {
    id: 'unwrap',
    title: 'No force unwrapping',
    avoid: sw`let name = user!.name`,
    prefer: sw`let name = user?.name ?? "Guest"`,
    why: 'A ! on nil crashes the app. Use a default, if let, or guard let.',
  },
  {
    id: 'struct',
    title: 'Prefer structs',
    avoid: sw`class Point {
  var x = 0
  var y = 0
}`,
    prefer: sw`struct Point {
  var x = 0
  var y = 0
}`,
    why: 'Value types are easier to reason about. Use a class when you need shared identity, such as an @Observable model.',
  },
  {
    id: 'names',
    title: 'Name for the call site',
    avoid: sw`list.removeItemAtIndex(2)`,
    prefer: sw`list.remove(at: 2)`,
    why: 'The Swift API Design Guidelines say the use site should read like a clear phrase. Put the role in an argument label.',
  },
  {
    id: 'private',
    title: 'Private by default',
    avoid: sw`struct CounterView: View {
  @State var count = 0
}`,
    prefer: sw`struct CounterView: View {
  @State private var count = 0
}`,
    why: 'Apple recommends marking @State private because the view owns it. Expose only what callers need.',
  },
  {
    id: 'views',
    title: 'Break up big bodies',
    avoid: sw`var body: some View {
  VStack {
    // 120 lines of nested views
  }
}`,
    prefer: sw`var body: some View {
  VStack {
    HeaderView(user: user)
    StatsRow(stats: stats)
    ActivityList(items: items)
  }
}`,
    why: 'Small views are easier to read, preview and update. SwiftUI only re-evaluates views whose inputs changed.',
  },
  {
    id: 'type',
    title: 'Use text styles and semantic colors',
    avoid: sw`Text("Hi")
  .font(.system(size: 17))
  .foregroundColor(Color(red: 0.2, green: 0.2, blue: 0.2))`,
    prefer: sw`Text("Hi")
  .font(.body)
  .foregroundStyle(.primary)`,
    why: 'Text styles follow Dynamic Type and semantic colors adapt to Dark Mode and accessibility settings.',
  },
  {
    id: 'current',
    title: 'Use the current APIs',
    avoid: sw`NavigationView { ... }
class Store: ObservableObject {
  @Published var items: [Item] = []
}`,
    prefer: sw`NavigationStack { ... }
@Observable class Store {
  var items: [Item] = []
}`,
    why: 'NavigationStack replaces NavigationView, and @Observable replaces ObservableObject for iOS 17 and later.',
  },
]

export const hig = [
  {
    t: 'Use system components first',
    d: 'Lists, tab bars, sheets and pickers give you native behavior, accessibility and the latest look for free.',
  },
  {
    t: 'Touch targets of at least 44 by 44 points',
    d: "Apple's Human Interface Guidelines ask for this minimum. Add padding or contentShape instead of making icons huge.",
  },
  {
    t: 'SF Symbols for icons',
    d: 'They scale with text, match weights and support multicolor and animation effects.',
  },
  {
    t: 'Dynamic Type and Dark Mode from day one',
    d: 'Test the largest text size and both appearances in previews.',
  },
  {
    t: 'Let layout adapt',
    d: 'Avoid hardcoded sizes. Use stacks, Spacer, frame(maxWidth:) and ViewThatFits so iPad and Mac work too.',
  },
  {
    t: 'Standard controls adopt new design',
    d: 'Apps built with the latest SDK pick up Liquid Glass on standard controls. Custom surfaces can opt in with glassEffect(_:in:).',
  },
]

export const sources = [
  { t: 'The Swift Programming Language (book)', u: 'https://docs.swift.org/swift-book/' },
  {
    t: 'Swift API Design Guidelines',
    u: 'https://www.swift.org/documentation/api-design-guidelines/',
  },
  { t: 'SwiftUI documentation', u: 'https://developer.apple.com/documentation/swiftui' },
  {
    t: 'Managing model data in your app',
    u: 'https://developer.apple.com/documentation/swiftui/managing-model-data-in-your-app',
  },
  { t: 'NavigationStack', u: 'https://developer.apple.com/documentation/swiftui/navigationstack' },
  { t: 'SwiftData documentation', u: 'https://developer.apple.com/documentation/swiftdata' },
  {
    t: 'SwiftUI updates by release',
    u: 'https://developer.apple.com/documentation/updates/swiftui',
  },
  { t: 'Learning SwiftUI tutorials', u: 'https://developer.apple.com/tutorials/swiftui' },
  {
    t: 'Human Interface Guidelines',
    u: 'https://developer.apple.com/design/human-interface-guidelines',
  },
  { t: 'Install Swift', u: 'https://www.swift.org/install/' },
]
