import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import useDocumentMeta from '@lib/useDocumentMeta'
import { GUIDES, guideBySlug } from '@data/guides'
import styles from './Guides.module.css'

function GuideList() {
  useDocumentMeta('Drone Guides for India: FPV, DJI, Rules and Building | EGIRE Robotics', 'Plain-language drone guides for India: FPV drones, DJI vs FPV, drone rules and how to build an FPV drone.')
  return (
    <PageWrapper>
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.kicker}>Guides</p>
          <h1 className={styles.title}>Drone guides for India</h1>
          <p className={styles.lead}>Plain answers on FPV drones, camera drones, the rules and building your own, from the team that teaches it.</p>
        </div>
      </section>
      <section className={styles.listSection}>
        <div className={`container ${styles.cards}`}>
          {GUIDES.map((g) => (
            <article key={g.slug} className={styles.card}>
              <h2><Link to={`/guides/${g.slug}`}>{g.title}</Link></h2>
              <p>{g.description}</p>
              <Link to={`/guides/${g.slug}`} className={styles.more}>Read the guide <ArrowRight size={16} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>
    </PageWrapper>
  )
}

function GuideArticle({ guide }) {
  useDocumentMeta(`${guide.title} | EGIRE Robotics`, guide.description)
  return (
    <PageWrapper>
      <article className={styles.article}>
        <div className="container">
          <nav className={styles.crumbs} aria-label="Breadcrumb"><Link to="/">Home</Link> / <Link to="/guides">Guides</Link></nav>
          <h1 className={styles.title}>{guide.title}</h1>
          <p className={styles.meta}>By EGIRE Robotics · Updated {new Date(guide.updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className={styles.lead}>{guide.intro}</p>
          {guide.sections.map((s) => (
            <section key={s.h}>
              <h2 className={styles.h2}>{s.h}</h2>
              {s.p.map((p) => <p key={p} className={styles.p}>{p}</p>)}
            </section>
          ))}
          {guide.faq?.length > 0 && (
            <section>
              <h2 className={styles.h2}>Frequently asked questions</h2>
              {guide.faq.map((f) => (
                <div key={f.q} className={styles.faq}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </div>
              ))}
            </section>
          )}
          <aside className={styles.cta}>
            <h2>Learn it hands-on</h2>
            <p>EGIRE Robotics runs FPV piloting, building and robotics workshops for colleges and individuals across India.</p>
            <Link to="/workshops" className={styles.button}>See the workshops <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link to="/enquire" className={styles.ghost}>Send an enquiry</Link>
          </aside>
          <p className={styles.others}>More guides: {GUIDES.filter((g) => g.slug !== guide.slug).map((g, i) => <span key={g.slug}>{i > 0 && ' · '}<Link to={`/guides/${g.slug}`}>{g.title}</Link></span>)}</p>
        </div>
      </article>
    </PageWrapper>
  )
}

export default function Guides() {
  const { slug } = useParams()
  if (!slug) return <GuideList />
  const guide = guideBySlug(slug)
  return guide ? <GuideArticle guide={guide} /> : <Navigate to="/guides" replace />
}
