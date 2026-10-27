// Todo app walkthrough: the same app built with React Native + Expo and with Swift + SwiftUI.
// APIs checked against the Apple SwiftUI/SwiftData docs; Expo steps follow the standard create-expo-app flow.
import type { Lang } from '../components/ui'
const sw = String.raw

export interface Block {
  file: string
  lang: Lang
  code: string
}
export interface Step {
  title: string
  goal: string
  rn: Block[]
  sw: Block[]
  same: string
  diff: string
}

export const steps: Step[] = [
  {
    title: 'Create the project',
    goal: 'Get an empty app running on a simulator.',
    rn: [
      {
        file: 'Terminal',
        lang: 'bash',
        code: sw`npx create-expo-app@latest todo-app
cd todo-app
npx expo start
# press i for the iOS simulator, or scan the QR code with Expo Go`,
      },
      {
        file: 'app/index.tsx',
        lang: 'tsx',
        code: sw`import { Text, View } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Hello, world!</Text>
    </View>
  );
}`,
      },
    ],
    sw: [
      {
        file: 'Xcode',
        lang: 'bash',
        code: sw`1. File > New > Project
2. Choose iOS > App
3. Product Name: Todo
   Interface: SwiftUI   Language: Swift   Storage: None
4. Press Cmd+R to run on a simulator`,
      },
      {
        file: 'TodoApp.swift and ContentView.swift',
        lang: 'swift',
        code: sw`import SwiftUI

@main
struct TodoApp: App {
  var body: some Scene {
    WindowGroup { ContentView() }
  }
}

struct ContentView: View {
  var body: some View {
    Text("Hello, world!")
  }
}`,
      },
    ],
    same: 'One entry point renders one root screen, and edits show up as you save.',
    diff: 'Expo runs without Xcode through Expo Go and works on any OS. Swift needs a Mac and Xcode, and gives you native previews instead of Fast Refresh.',
  },

  {
    title: 'Model the data',
    goal: 'Describe what a todo is.',
    rn: [
      {
        file: 'types.ts',
        lang: 'tsx',
        code: sw`export type Todo = {
  id: string;
  title: string;
  done: boolean;
};`,
      },
    ],
    sw: [
      {
        file: 'Todo.swift',
        lang: 'swift',
        code: sw`import Foundation
import Observation

@Observable
final class Todo: Identifiable {
  let id = UUID()
  var title: String
  var isDone: Bool

  init(title: String, isDone: Bool = false) {
    self.title = title
    self.isDone = isDone
  }
}`,
      },
    ],
    same: 'A small type with an id, a title and a done flag.',
    diff: 'Identifiable is what lists use instead of keyExtractor. We use a class with @Observable so child views can change a todo directly. A struct would also work but needs bindings.',
  },

  {
    title: 'Show a list',
    goal: 'Render hard-coded todos.',
    rn: [
      {
        file: 'app/index.tsx',
        lang: 'tsx',
        code: sw`const initial: Todo[] = [
  { id: "1", title: "Buy milk", done: false },
  { id: "2", title: "Walk the dog", done: true },
];

export default function Home() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.heading}>Todos</Text>
      <FlatList
        data={initial}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <Text style={styles.row}>{item.title}</Text>
        )}
      />
    </SafeAreaView>
  );
}`,
      },
    ],
    sw: [
      {
        file: 'ContentView.swift',
        lang: 'swift',
        code: sw`struct ContentView: View {
  let todos = [
    Todo(title: "Buy milk"),
    Todo(title: "Walk the dog", isDone: true),
  ]

  var body: some View {
    NavigationStack {
      List(todos) { todo in
        Text(todo.title)
      }
      .navigationTitle("Todos")
    }
  }
}`,
      },
    ],
    same: 'Both render a scrolling list from an array, one view per item.',
    diff: 'SwiftUI gives you the title bar, row separators and safe areas with NavigationStack and List. In RN you style the heading and rows yourself.',
  },

  {
    title: 'Add todos',
    goal: 'Type a title and add it to the top.',
    rn: [
      {
        file: 'app/index.tsx',
        lang: 'tsx',
        code: sw`const [todos, setTodos] = useState<Todo[]>(initial);
const [text, setText] = useState("");

const add = () => {
  const title = text.trim();
  if (!title) return;
  setTodos((t) => [{ id: Date.now().toString(), title, done: false }, ...t]);
  setText("");
};

<View style={styles.inputRow}>
  <TextInput
    value={text}
    onChangeText={setText}
    onSubmitEditing={add}
    placeholder="New todo"
    style={styles.input}
  />
  <Pressable onPress={add} style={styles.add}>
    <Text style={styles.addText}>Add</Text>
  </Pressable>
</View>`,
      },
    ],
    sw: [
      {
        file: 'ContentView.swift',
        lang: 'swift',
        code: sw`@State private var todos = [Todo(title: "Buy milk")]
@State private var text = ""

private func add() {
  let title = text.trimmingCharacters(in: .whitespaces)
  guard !title.isEmpty else { return }
  todos.insert(Todo(title: title), at: 0)
  text = ""
}

HStack {
  TextField("New todo", text: $text)
    .textFieldStyle(.roundedBorder)
    .onSubmit(add)
  Button("Add", action: add)
    .buttonStyle(.borderedProminent)
}`,
      },
    ],
    same: 'State holds the list and the text. Adding replaces the list and clears the input.',
    diff: 'RN needs a controlled input (value plus onChangeText). In SwiftUI $text passes a binding, so there is no separate setter.',
  },

  {
    title: 'Complete and delete',
    goal: 'Tap to check a todo off, remove it when done.',
    rn: [
      {
        file: 'app/index.tsx',
        lang: 'tsx',
        code: sw`const toggle = (id: string) =>
  setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));

const remove = (id: string) =>
  setTodos((t) => t.filter((x) => x.id !== id));

renderItem={({ item }) => (
  <View style={styles.row}>
    <Pressable onPress={() => toggle(item.id)}>
      <Text style={item.done ? styles.done : undefined}>
        {item.done ? "● " : "○ "}{item.title}
      </Text>
    </Pressable>
    <Pressable onPress={() => remove(item.id)}>
      <Text style={styles.delete}>Delete</Text>
    </Pressable>
  </View>
)}`,
      },
    ],
    sw: [
      {
        file: 'ContentView.swift',
        lang: 'swift',
        code: sw`List {
  ForEach(todos) { todo in
    Button {
      todo.isDone.toggle()
    } label: {
      Label(todo.title,
            systemImage: todo.isDone ? "checkmark.circle.fill" : "circle")
        .strikethrough(todo.isDone)
    }
    .buttonStyle(.plain)
  }
  .onDelete { todos.remove(atOffsets: $0) }
}`,
      },
    ],
    same: 'Toggling flips one flag. Deleting removes one item.',
    diff: 'RN updates state immutably (map and filter). The @Observable class lets SwiftUI change todo.isDone in place. .onDelete adds swipe to delete with no library.',
  },

  {
    title: 'Split into components',
    goal: 'Move the row and the logic out of the screen.',
    rn: [
      {
        file: 'components/TodoItem.tsx',
        lang: 'tsx',
        code: sw`type Props = { todo: Todo; onToggle: () => void; onDelete: () => void };

export function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onToggle}>
        <Text style={todo.done ? styles.done : undefined}>{todo.title}</Text>
      </Pressable>
      <Pressable onPress={onDelete}><Text>Delete</Text></Pressable>
    </View>
  );
}`,
      },
      {
        file: 'hooks/useTodos.ts',
        lang: 'tsx',
        code: sw`export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const add = (title: string) => { /* ... */ };
  const toggle = (id: string) => { /* ... */ };
  const remove = (id: string) => { /* ... */ };
  return { todos, add, toggle, remove };
}`,
      },
    ],
    sw: [
      {
        file: 'TodoRow.swift',
        lang: 'swift',
        code: sw`struct TodoRow: View {
  let todo: Todo

  var body: some View {
    Button {
      todo.isDone.toggle()
    } label: {
      Label(todo.title,
            systemImage: todo.isDone ? "checkmark.circle.fill" : "circle")
        .strikethrough(todo.isDone)
    }
    .buttonStyle(.plain)
  }
}

// ContentView.swift
ForEach(todos) { todo in
  TodoRow(todo: todo)
}`,
      },
    ],
    same: 'Small, focused pieces. Props and parameters in, UI out.',
    diff: 'RN passes callbacks down and keeps logic in a custom hook. The Swift row receives the observable model and mutates it, so there are no callbacks to wire.',
  },

  {
    title: 'Filter the list',
    goal: 'Show All, Active or Done.',
    rn: [
      {
        file: 'app/index.tsx',
        lang: 'tsx',
        code: sw`type Filter = "all" | "active" | "done";
const [filter, setFilter] = useState<Filter>("all");

const visible = todos.filter((t) =>
  filter === "all" ? true : filter === "done" ? t.done : !t.done
);

<View style={styles.filters}>
  {(["all", "active", "done"] as Filter[]).map((f) => (
    <Pressable
      key={f}
      onPress={() => setFilter(f)}
      style={[styles.chip, filter === f && styles.chipOn]}
    >
      <Text>{f}</Text>
    </Pressable>
  ))}
</View>
<FlatList data={visible} ... />`,
      },
    ],
    sw: [
      {
        file: 'ContentView.swift',
        lang: 'swift',
        code: sw`enum Filter: String, CaseIterable, Identifiable {
  case all = "All", active = "Active", done = "Done"
  var id: Self { self }
}

@State private var filter = Filter.all

private var visible: [Todo] {
  switch filter {
  case .all: todos
  case .active: todos.filter { !$0.isDone }
  case .done: todos.filter(\.isDone)
  }
}

Picker("Filter", selection: $filter) {
  ForEach(Filter.allCases) { Text($0.rawValue).tag($0) }
}
.pickerStyle(.segmented)

ForEach(visible) { todo in TodoRow(todo: todo) }
.onDelete { offsets in
  let ids = offsets.map { visible[$0].id }
  todos.removeAll { ids.contains($0.id) }
}`,
      },
    ],
    same: 'A filter value in state and a derived list. Nothing extra is stored.',
    diff: 'SwiftUI has a native segmented Picker. RN builds the chips by hand. Swift deletes by id because the offsets refer to the filtered list.',
  },

  {
    title: 'Save on the device',
    goal: 'Keep todos after the app closes.',
    rn: [
      {
        file: 'Terminal',
        lang: 'bash',
        code: 'npx expo install @react-native-async-storage/async-storage',
      },
      {
        file: 'hooks/useTodos.ts',
        lang: 'tsx',
        code: sw`const [loaded, setLoaded] = useState(false);

useEffect(() => {
  AsyncStorage.getItem("todos").then((raw) => {
    if (raw) setTodos(JSON.parse(raw));
    setLoaded(true);
  });
}, []);

useEffect(() => {
  if (loaded) AsyncStorage.setItem("todos", JSON.stringify(todos));
}, [todos, loaded]);`,
      },
    ],
    sw: [
      {
        file: 'Todo.swift',
        lang: 'swift',
        code: sw`import SwiftData

@Model
final class Todo {
  var title: String
  var isDone: Bool
  var createdAt: Date

  init(title: String, isDone: Bool = false, createdAt: Date = .now) {
    self.title = title
    self.isDone = isDone
    self.createdAt = createdAt
  }
}`,
      },
      {
        file: 'TodoApp.swift and ContentView.swift',
        lang: 'swift',
        code: sw`WindowGroup { ContentView() }
  .modelContainer(for: Todo.self)

// ContentView.swift: replace the @State array
@Environment(\.modelContext) private var context
@Query(sort: \Todo.createdAt, order: .reverse) private var todos: [Todo]

// add:    context.insert(Todo(title: title))
// delete: context.delete(todo)`,
      },
    ],
    same: 'Load once on launch, save when the list changes.',
    diff: 'RN needs a library and manual load and save effects. SwiftData is built in: change @Observable to @Model, and @Query keeps the list in sync and saves for you (iOS 17+).',
  },

  {
    title: 'Polish',
    goal: 'Animations, an empty state, feedback and dark mode.',
    rn: [
      {
        file: 'app/index.tsx',
        lang: 'tsx',
        code: sw`import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";

<Animated.View entering={FadeIn} exiting={FadeOut} layout={LinearTransition}>
  <TodoItem ... onToggle={() => { Haptics.selectionAsync(); toggle(item.id); }} />
</Animated.View>

ListEmptyComponent={<Text style={styles.empty}>Nothing here yet.</Text>}

// dark mode: read useColorScheme() and pick colors yourself`,
      },
    ],
    sw: [
      {
        file: 'ContentView.swift and TodoRow.swift',
        lang: 'swift',
        code: sw`List { ... }
  .animation(.default, value: visible.count)
  .overlay {
    if visible.isEmpty {
      ContentUnavailableView("No todos",
        systemImage: "checklist",
        description: Text("Add one below."))
    }
  }

// TodoRow: one modifier for haptics
.sensoryFeedback(.selection, trigger: todo.isDone)

// Dark Mode, Dynamic Type and VoiceOver come with system controls`,
      },
    ],
    same: 'Small touches that make it feel finished.',
    diff: 'RN adds libraries for haptics and animation and handles dark mode yourself. SwiftUI covers most of it with modifiers and system views.',
  },

  {
    title: 'Test it',
    goal: 'Check behavior without tapping through the app.',
    rn: [
      {
        file: 'Terminal',
        lang: 'bash',
        code: 'npx expo install jest-expo jest @testing-library/react-native',
      },
      {
        file: '__tests__/TodoItem.test.tsx',
        lang: 'tsx',
        code: sw`import { fireEvent, render, screen } from "@testing-library/react-native";
import { TodoItem } from "../components/TodoItem";

test("calls onToggle when pressed", () => {
  const onToggle = jest.fn();
  render(
    <TodoItem
      todo={{ id: "1", title: "Buy milk", done: false }}
      onToggle={onToggle}
      onDelete={() => {}}
    />
  );
  fireEvent.press(screen.getByText("Buy milk"));
  expect(onToggle).toHaveBeenCalled();
});`,
      },
    ],
    sw: [
      {
        file: 'TodoTests.swift',
        lang: 'swift',
        code: sw`import Testing
import SwiftData
@testable import Todo   // your module name

@MainActor
struct TodoTests {
  @Test func newTodoStartsActive() {
    let todo = Todo(title: "Buy milk")
    #expect(todo.isDone == false)
  }

  @Test func insertedTodoCanBeFetched() throws {
    let container = try ModelContainer(
      for: Todo.self,
      configurations: ModelConfiguration(isStoredInMemoryOnly: true)
    )
    container.mainContext.insert(Todo(title: "Buy milk"))
    let all = try container.mainContext.fetch(FetchDescriptor<Todo>())
    #expect(all.count == 1)
  }
}`,
      },
    ],
    same: 'Arrange, act, assert. Use fakes and in-memory data.',
    diff: 'RN tests through a rendered component tree with Jest. Swift Testing ships with Xcode and the SwiftData test uses an in-memory store.',
  },

  {
    title: 'Run on a device and ship',
    goal: 'Get it to testers.',
    rn: [
      {
        file: 'Terminal',
        lang: 'bash',
        code: sw`npx expo run:ios            # local native build
npm install -g eas-cli
eas build --platform ios    # cloud build
eas submit --platform ios   # upload to App Store Connect`,
      },
    ],
    sw: [
      {
        file: 'Xcode',
        lang: 'bash',
        code: sw`1. Signing & Capabilities: choose your team
2. Run on your iPhone with Cmd+R
3. Product > Archive
4. Distribute App > App Store Connect > Upload
5. Add testers in TestFlight`,
      },
    ],
    same: 'An Apple Developer account, signing, App Store Connect and TestFlight in both.',
    diff: 'Expo can build in the cloud and also targets Android and web from the same code. The Swift app targets Apple platforms only, with the smallest runtime.',
  },
]

export interface FinalFile {
  file: string
  lang: Lang
  code: string
}

export const finalRn: FinalFile[] = [
  {
    file: 'hooks/useTodos.ts',
    lang: 'tsx',
    code: sw`import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Todo = { id: string; title: string; done: boolean };
const KEY = "todos";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) setTodos(JSON.parse(raw));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(todos));
  }, [todos, loaded]);

  const add = (title: string) =>
    setTodos((t) => [{ id: Date.now().toString(), title, done: false }, ...t]);
  const toggle = (id: string) =>
    setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const remove = (id: string) =>
    setTodos((t) => t.filter((x) => x.id !== id));

  return { todos, add, toggle, remove };
}`,
  },
  {
    file: 'components/TodoItem.tsx',
    lang: 'tsx',
    code: sw`import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Todo } from "../hooks/useTodos";

type Props = { todo: Todo; onToggle: () => void; onDelete: () => void };

export function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onToggle}
        style={styles.main}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.done }}
      >
        <Text style={styles.check}>{todo.done ? "●" : "○"}</Text>
        <Text style={[styles.title, todo.done && styles.done]}>{todo.title}</Text>
      </Pressable>
      <Pressable onPress={onDelete} accessibilityLabel="Delete">
        <Text style={styles.delete}>Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  main: { flex: 1, flexDirection: "row", gap: 10, alignItems: "center" },
  check: { fontSize: 20 },
  title: { fontSize: 17 },
  done: { textDecorationLine: "line-through", color: "#888" },
  delete: { color: "#d33" },
});`,
  },
  {
    file: 'app/index.tsx',
    lang: 'tsx',
    code: sw`import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TodoItem } from "../components/TodoItem";
import { useTodos } from "../hooks/useTodos";

type Filter = "all" | "active" | "done";
const FILTERS: Filter[] = ["all", "active", "done"];

export default function Home() {
  const { todos, add, toggle, remove } = useTodos();
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const visible = todos.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );

  const submit = () => {
    const title = text.trim();
    if (!title) return;
    add(title);
    setText("");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.heading}>Todos</Text>
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.chip, filter === f && styles.chipOn]}
          >
            <Text style={filter === f && styles.chipTextOn}>{f}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={visible}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onToggle={() => toggle(item.id)}
            onDelete={() => remove(item.id)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nothing here yet.</Text>}
      />
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={submit}
          placeholder="New todo"
          returnKeyType="done"
          style={styles.input}
        />
        <Pressable onPress={submit} style={styles.add}>
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16 },
  heading: { fontSize: 32, fontWeight: "700", marginVertical: 12 },
  filters: { flexDirection: "row", gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, borderWidth: 1, borderColor: "#ccc" },
  chipOn: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  chipTextOn: { color: "white" },
  empty: { textAlign: "center", marginTop: 40, color: "#888" },
  inputRow: { flexDirection: "row", gap: 8, paddingVertical: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, paddingHorizontal: 12 },
  add: { backgroundColor: "#2563eb", borderRadius: 10, paddingHorizontal: 18, justifyContent: "center" },
  addText: { color: "white", fontWeight: "600" },
});`,
  },
]

export const finalSw: FinalFile[] = [
  {
    file: 'Todo.swift',
    lang: 'swift',
    code: sw`import Foundation
import SwiftData

@Model
final class Todo {
  var title: String
  var isDone: Bool
  var createdAt: Date

  init(title: String, isDone: Bool = false, createdAt: Date = .now) {
    self.title = title
    self.isDone = isDone
    self.createdAt = createdAt
  }
}`,
  },
  {
    file: 'TodoApp.swift',
    lang: 'swift',
    code: sw`import SwiftUI
import SwiftData

@main
struct TodoApp: App {
  var body: some Scene {
    WindowGroup {
      ContentView()
    }
    .modelContainer(for: Todo.self)
  }
}`,
  },
  {
    file: 'TodoRow.swift',
    lang: 'swift',
    code: sw`import SwiftUI

struct TodoRow: View {
  let todo: Todo

  var body: some View {
    Button {
      todo.isDone.toggle()
    } label: {
      Label(todo.title,
            systemImage: todo.isDone ? "checkmark.circle.fill" : "circle")
        .strikethrough(todo.isDone)
        .foregroundStyle(todo.isDone ? .secondary : .primary)
    }
    .buttonStyle(.plain)
    .sensoryFeedback(.selection, trigger: todo.isDone)
  }
}`,
  },
  {
    file: 'ContentView.swift',
    lang: 'swift',
    code: sw`import SwiftUI
import SwiftData

enum Filter: String, CaseIterable, Identifiable {
  case all = "All", active = "Active", done = "Done"
  var id: Self { self }
}

struct ContentView: View {
  @Environment(\.modelContext) private var context
  @Query(sort: \Todo.createdAt, order: .reverse) private var todos: [Todo]
  @State private var text = ""
  @State private var filter = Filter.all

  private var visible: [Todo] {
    switch filter {
    case .all: todos
    case .active: todos.filter { !$0.isDone }
    case .done: todos.filter(\.isDone)
    }
  }

  var body: some View {
    NavigationStack {
      List {
        Picker("Filter", selection: $filter) {
          ForEach(Filter.allCases) { Text($0.rawValue).tag($0) }
        }
        .pickerStyle(.segmented)
        .listRowBackground(Color.clear)

        ForEach(visible) { todo in
          TodoRow(todo: todo)
        }
        .onDelete { offsets in
          for index in offsets { context.delete(visible[index]) }
        }
      }
      .animation(.default, value: visible.count)
      .overlay {
        if visible.isEmpty {
          ContentUnavailableView("No todos",
            systemImage: "checklist",
            description: Text("Add one below."))
        }
      }
      .navigationTitle("Todos")
      .safeAreaInset(edge: .bottom) { inputBar }
    }
  }

  private var inputBar: some View {
    HStack {
      TextField("New todo", text: $text)
        .textFieldStyle(.roundedBorder)
        .submitLabel(.done)
        .onSubmit(add)
      Button("Add", action: add)
        .buttonStyle(.borderedProminent)
        .disabled(text.trimmingCharacters(in: .whitespaces).isEmpty)
    }
    .padding()
    .background(.bar)
  }

  private func add() {
    let title = text.trimmingCharacters(in: .whitespaces)
    guard !title.isEmpty else { return }
    context.insert(Todo(title: title))
    text = ""
  }
}

#Preview {
  ContentView().modelContainer(for: Todo.self, inMemory: true)
}`,
  },
]

export const compare = [
  {
    what: 'Persistence',
    rn: 'AsyncStorage package plus load and save effects',
    sw: 'SwiftData built in: @Model and @Query',
  },
  {
    what: 'Swipe to delete',
    rn: 'A Delete button, or a gesture library for swipes',
    sw: '.onDelete on ForEach',
  },
  { what: 'Haptics', rn: 'expo-haptics', sw: '.sensoryFeedback' },
  {
    what: 'List animations',
    rn: 'react-native-reanimated layout animations',
    sw: '.animation(_:value:)',
  },
  { what: 'Segmented filter', rn: 'Hand-built chips', sw: 'Picker with .segmented style' },
  { what: 'Empty state', rn: 'ListEmptyComponent you design', sw: 'ContentUnavailableView' },
  {
    what: 'Dark Mode and Dynamic Type',
    rn: 'You read the color scheme and size text yourself',
    sw: 'Automatic with system controls and text styles',
  },
  {
    what: 'Tests',
    rn: 'Jest + React Native Testing Library',
    sw: 'Swift Testing, included with Xcode',
  },
  { what: 'Platforms', rn: 'iOS, Android and web from one codebase', sw: 'Apple platforms only' },
  { what: 'Shipping', rn: 'EAS Build and Submit, or Xcode', sw: 'Xcode Archive to TestFlight' },
]
