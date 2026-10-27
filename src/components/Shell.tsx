import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { curriculum } from '../data/curriculum'
import { Legend } from './ui'
import { Logo } from './Logo'

const KEY = 'rn-visited'
const THEME = 'rn-theme'
type Theme = 'system' | 'light' | 'dark'
const load = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

const page = {
  enter: (d: number) => ({ opacity: 0, x: 60 * d, filter: 'blur(8px)' }),
  center: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, damping: 26, stiffness: 220 },
  },
  exit: (d: number) => ({
    opacity: 0,
    x: -40 * d,
    filter: 'blur(6px)',
    transition: { duration: 0.18 },
  }),
}

const topLinks = [
  { to: '/big-picture', label: 'Internals', short: 'Learn', key: 'internals' },
  { to: '/map', label: 'Connection map', short: 'Map', key: 'map' },
  { to: '/swift', label: 'Learn Swift', short: 'Swift', key: 'swift' },
  { to: '/todo', label: 'Build a todo app', short: 'Todo app', key: 'todo' },
]

function NavIcon({ name }: { name: string }) {
  const p = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true">
      {name === 'internals' && (
        <g {...p}>
          <path d="M12 3 L21 8 L12 13 L3 8 Z" />
          <path d="M3 12.5 L12 17.5 L21 12.5" />
          <path d="M3 17 L12 22 L21 17" />
        </g>
      )}
      {name === 'map' && (
        <g {...p}>
          <circle cx="6" cy="6" r="2.3" />
          <circle cx="18" cy="7" r="2.3" />
          <circle cx="12" cy="18" r="2.3" />
          <path d="M8 7 L16 7" />
          <path d="M7 8 L11 16" />
          <path d="M17 9 L13 16" />
        </g>
      )}
      {name === 'swift' && (
        <g {...p}>
          <path d="M8 7 L3 12 L8 17" />
          <path d="M16 7 L21 12 L16 17" />
          <path d="M13.5 5 L10.5 19" />
        </g>
      )}
      {name === 'todo' && (
        <g {...p}>
          <path d="M3.5 7 L5.3 8.8 L8.5 5.5" />
          <path d="M12 7 H21" />
          <path d="M3.5 16.5 L5.3 18.3 L8.5 15" />
          <path d="M12 16.5 H21" />
        </g>
      )}
    </svg>
  )
}

const SITE = 'React Native Internals'
const DEFAULT_TITLE = `${SITE} | Interactive Guide to How It Works`
const pageMeta: Record<string, { title: string; description: string }> = {
  map: {
    title: `How it all connects | ${SITE}`,
    description:
      'An interactive map of all 27 React Native internals topics. See how JSI, Fabric, Turbo Modules, Hermes and Metro depend on each other.',
  },
  swift: {
    title: `Swift and SwiftUI for React Native engineers | ${SITE}`,
    description:
      'Learn Swift and SwiftUI if you already know React Native: side-by-side translations, a learning path, components, projects, tools and style.',
  },
  todo: {
    title: `Build a todo app twice: React Native vs SwiftUI | ${SITE}`,
    description:
      'Build the same todo app in eleven steps with React Native and Expo, and with Swift and SwiftUI. Compare code, persistence, tests and shipping.',
  },
}

function setMeta(selector: string, attr: string, value: string) {
  document.querySelector(selector)?.setAttribute(attr, value)
}

const nextTheme: Record<Theme, Theme> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

export default function Shell() {
  const loc = useLocation()
  const [visited, setVisited] = useState<string[]>(load)
  const [open, setOpen] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(THEME) as Theme) || 'system'
    } catch {
      return 'system'
    }
  })
  useEffect(() => {
    const r = document.documentElement
    if (theme === 'system') r.removeAttribute('data-theme')
    else r.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(THEME, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const cur = loc.pathname.split('/')[1]
  const outlet = useOutlet()
  const idx = curriculum.findIndex(x => x.id === cur)
  const isSection = idx >= 0
  const area = isSection ? 'internals' : cur
  const prevIdx = useRef(idx)
  const dir = idx >= prevIdx.current ? 1 : -1
  useEffect(() => {
    prevIdx.current = idx
  }, [idx])

  useEffect(() => {
    setOpen(false)
    setNavHidden(false)
    window.scrollTo({ top: 0 })
    const sec = curriculum.find(x => x.id === cur)
    if (sec?.ready && !visited.includes(cur)) {
      const next = [...visited, cur]
      setVisited(next)
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
    }
  }, [cur]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY,
        d = y - last
      const atEdge = y < 80 || window.innerHeight + y >= document.documentElement.scrollHeight - 80
      if (atEdge || d < -6) setNavHidden(false)
      else if (d > 8) setNavHidden(true)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sec = curriculum.find(x => x.id === cur)
    const m = sec ? { title: `${sec.title} | ${SITE}`, description: sec.tldr } : pageMeta[cur]
    const title = m?.title ?? DEFAULT_TITLE
    document.title = title
    if (m) setMeta('meta[name="description"]', 'content', m.description)
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[name="twitter:title"]', 'content', title)
  }, [cur])

  const ready = curriculum.filter(x => x.ready)
  const pct = (visited.filter(v => ready.some(r => r.id === v)).length / ready.length) * 100
  const wide = cur === 'map' || cur === 'todo' || cur === 'swift'

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/big-picture" className="brand" aria-label="React Native Internals home">
          <Logo />
        </Link>
        <nav className="topnav" aria-label="Main">
          {topLinks.map(l => (
            <Link
              key={l.key}
              to={l.to}
              className={`toplink ${area === l.key ? 'on' : ''}`}
              aria-current={area === l.key ? 'page' : undefined}
            >
              {l.label}
              {area === l.key && (
                <motion.span
                  layoutId="topline"
                  className="topline"
                  transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                />
              )}
            </Link>
          ))}
        </nav>
        <div className="topright">
          {isSection && (
            <button className="btn menu-btn" onClick={() => setOpen(!open)} aria-expanded={open}>
              Sections
            </button>
          )}
          <button
            className="btn themebtn"
            onClick={() => setTheme(nextTheme[theme])}
            title="Change theme"
          >
            Theme: {theme}
          </button>
        </div>
      </header>

      <div className={`app ${isSection ? '' : 'nosb'}`}>
        {isSection && open && (
          <button
            className="scrim"
            onClick={() => setOpen(false)}
            aria-label="Close sections menu"
          />
        )}
        {isSection && (
          <aside className={`sidebar ${open ? 'open' : ''}`}>
            <div className="brand-sub">Interactive visual guide</div>
            <div className="progress">
              <div style={{ width: `${pct}%` }} />
            </div>
            <Legend />
            <nav className="nav">
              {curriculum.map((s, i) => (
                <NavLink
                  key={s.id}
                  to={`/${s.id}`}
                  className={({ isActive }) =>
                    [
                      isActive ? 'active' : '',
                      s.ready ? (visited.includes(s.id) ? 'done' : '') : 'soon',
                    ].join(' ')
                  }
                >
                  <span className="num">{i + 1}</span>
                  {s.title}
                  {!s.ready && <span className="tag">soon</span>}
                </NavLink>
              ))}
            </nav>
          </aside>
        )}
        <main className={`main ${wide ? 'wide' : ''}`}>
          <motion.div
            key={`bar-${cur}`}
            className="route-bar"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: [1, 1, 0] }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={cur}
              custom={dir}
              variants={page}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <nav className={`bottomnav ${navHidden && !open ? 'hide' : ''}`} aria-label="Primary">
        {topLinks.map(l => {
          const on = area === l.key
          return (
            <Link
              key={l.key}
              to={l.to}
              className={`bnlink ${on ? 'on' : ''}`}
              aria-current={on ? 'page' : undefined}
            >
              {on && (
                <motion.span
                  layoutId="bnpill"
                  className="bnpill"
                  transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                />
              )}
              <motion.span
                className="bnicon"
                animate={{ y: on ? -1 : 0, scale: on ? 1.1 : 1 }}
                whileTap={{ scale: 0.84 }}
                transition={{ type: 'spring', damping: 14, stiffness: 420 }}
              >
                <NavIcon name={l.key} />
              </motion.span>
              <span className="bnlabel">{l.short}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
