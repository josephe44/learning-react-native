import { Link, useParams, Navigate } from 'react-router-dom'
import { curriculum } from '../data/curriculum'
import { Hero, Block } from '../components/ui'
import { sectionBodies } from './registry'

export default function Page() {
  const { id } = useParams()
  const idx = curriculum.findIndex(s => s.id === id)
  if (idx < 0) return <Navigate to="/big-picture" replace />
  const sec = curriculum[idx]
  const Body = sectionBodies[sec.id]
  const prev = curriculum[idx - 1],
    next = curriculum[idx + 1]
  return (
    <>
      <Hero n={idx + 1} title={sec.title} tldr={sec.tldr} />
      {Body ? (
        <Body />
      ) : (
        <Block
          title="Coming soon"
          lead="This section is queued for the next pass. Here is what it will cover:"
        >
          <ul>
            {sec.topics.map(t => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Block>
      )}
      <div className="row" style={{ marginTop: 28 }}>
        <Link to={`/map?focus=${sec.id}`} className="btn">
          See how this connects to the other sections
        </Link>
      </div>
      <div className="pager">
        {prev ? (
          <Link to={`/${prev.id}`} className="btn">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/${next.id}`} className="btn primary">
            {next.title} →
          </Link>
        )}
      </div>
    </>
  )
}
