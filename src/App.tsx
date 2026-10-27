import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Shell from './components/Shell'
import Page from './sections/Page'
import MapPage from './sections/MapPage'
import SwiftPage from './sections/SwiftPage'
import TodoPage from './sections/TodoPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Navigate to="/big-picture" replace />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/swift" element={<SwiftPage />} />
          <Route path="/todo" element={<TodoPage />} />
          <Route path="/:id" element={<Page />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
