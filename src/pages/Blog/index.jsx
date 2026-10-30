import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Markdown from 'react-markdown'
import PageWrapper from '@components/layout/PageWrapper'
import useDocumentMeta from '@lib/useDocumentMeta'
import { fetchBlogPosts } from '@lib/siteApi'
import { POSTS, CATEGORIES, keywordList, postBySlug, relatedPosts } from '@data/posts'
import styles from './Blog.module.css'

const dateText = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

/** Posts written in the CRM and not already in the code, so a new post still appears without a release. */
function useCrmPosts() {
  const [rows, setRows] = useState([])
  useEffect(() => {
    let live = true
    fetchBlogPosts()
      .then((posts) => live && setRows(posts.filter((p) => !postBySlug(p.id)).map((p) => ({
        slug: p.id,
        title: p.title,
        description: p.excerpt,
        category: p.category || 'General',
        author: p.author,
        published: new Date(p.date).toString() === 'Invalid Date' ? new Date().toISOString() : new Date(p.date).toISOString(),
        readText: p.readTime,
        markdown: p.content,
        cover: p.cover,
        keywords: [],
      }))))
      .catch(() => {})
    return () => { live = false }
  }, [])
  return rows
}

function BlogList() {
  useDocumentMeta(
    'FPV Drone, DJI and Robotics Blog India | EGIRE Robotics',
    'Guides and articles on FPV drones, DJI vs FPV, drone rules in India, building a drone, simulators, drone pilot training and robotics from EGIRE Robotics.',
    'FPV drone blog India, drone guides India, drone rules India, build FPV drone, DJI vs FPV, drone pilot training, EGIRE Robotics',
  )
  const crm = useCrmPosts()
  const [category, setCategory] = useState('All')
  const all = useMemo(() => [...POSTS, ...crm].sort((a, b) => b.published.localeCompare(a.published)), [crm])
  const categories = useMemo(() => ['All', ...new Set([...CATEGORIES, ...crm.map((p) => p.category)])], [crm])
  const shown = category === 'All' ? all : all.filter((p) => p.category === category)
  return (
    <PageWrapper>
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.kicker}>EGIRE Robotics blog</p>
          <h1 className={styles.title}>FPV drone guides and articles for India</h1>
          <p className={styles.lead}>Plain answers on FPV drones, DJI-style camera drones, the drone rules, building your own and learning to fly, from the team that teaches it.</p>
          <ul className={styles.filters} aria-label="Filter by topic">
            {categories.map((c) => (
              <li key={c}>
                <button type="button" className={`${styles.filter} ${c === category ? styles.filterOn : ''}`} aria-pressed={c === category} onClick={() => setCategory(c)}>{c}</button>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className={styles.listSection}>
        <div className={`container ${styles.cards}`}>
          {shown.map((p) => (
            <article key={p.slug} className={styles.card}>
              {p.cover && <img src={p.cover} alt="" loading="lazy" className={styles.cardCover} />}
              <div className={styles.cardMeta}>
                <span className={styles.category}>{p.category}</span>
                <span>{p.readText ?? `${p.readMinutes} min read`}</span>
              </div>
              <h2><Link to={`/blog/${p.slug}`}>{p.title}</Link></h2>
              <p>{p.description}</p>
              <Link to={`/blog/${p.slug}`} className={styles.more}>Read the article <ArrowRight size={16} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>
    </PageWrapper>
  )
}

function PostBody({ post }) {
  if (post.markdown) return <div className={styles.markdown}><Markdown>{post.markdown}</Markdown></div>
  return (
    <>
      <p className={styles.p}>{post.intro}</p>
      {post.sections.map((s) => (
        <section key={s.h}>
          <h2 className={styles.h2}>{s.h}</h2>
          {s.p.map((text, i) => <p key={i} className={styles.p}>{text}</p>)}
        </section>
      ))}
      {post.faq?.length > 0 && (
        <section>
          <h2 className={styles.h2}>Frequently asked questions</h2>
          {post.faq.map((f) => (
            <div key={f.q} className={styles.faq}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>
      )}
    </>
  )
}

function Post({ post }) {
  useDocumentMeta(`${post.title} | EGIRE Robotics`, post.description, keywordList(post))
  const related = relatedPosts(post)
  return (
    <PageWrapper>
      <article className={styles.article}>
        <div className="container">
          <nav className={styles.crumbs} aria-label="Breadcrumb"><Link to="/">Home</Link> / <Link to="/blog">Blog</Link></nav>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.meta}>
            <span className={styles.category}>{post.category}</span>
            <span>By {post.author}</span>
            <span>{dateText(post.updated ?? post.published)}</span>
            <span>{post.readText ?? `${post.readMinutes} min read`}</span>
          </p>
          {post.cover && <img src={post.cover} alt="" className={styles.cover} />}
          <PostBody post={post} />
          {post.keywords?.length > 0 && (
            <div className={styles.topics}>
              <h2>Topics</h2>
              <ul className={styles.tags}>{post.keywords.map((k) => <li key={k}>{k}</li>)}</ul>
            </div>
          )}
          <aside className={styles.cta}>
            <h2>Learn it hands-on</h2>
            <p>EGIRE Robotics runs FPV piloting, building and robotics workshops for colleges and individuals across India.</p>
            <Link to="/workshops" className={styles.button}>See the workshops <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link to="/enquire" className={styles.ghost}>Send an enquiry</Link>
          </aside>
          <nav className={styles.related} aria-label="More articles">
            <h2>Keep reading</h2>
            <ul>{related.map((r) => <li key={r.slug}><Link to={`/blog/${r.slug}`}>{r.title}</Link></li>)}</ul>
          </nav>
        </div>
      </article>
    </PageWrapper>
  )
}

/** A post that is not in the code: it may be one written in the CRM, which loads after the page. */
function CrmPost({ slug }) {
  const crm = useCrmPosts()
  const [waited, setWaited] = useState(false)
  useEffect(() => { const t = setTimeout(() => setWaited(true), 4000); return () => clearTimeout(t) }, [])
  const post = crm.find((p) => p.slug === slug)
  if (post) return <Post post={post} />
  if (waited) return <Navigate to="/blog" replace />
  return <PageWrapper><p className={`container ${styles.note}`}>Loading the article…</p></PageWrapper>
}

export default function Blog() {
  const { slug } = useParams()
  if (!slug) return <BlogList />
  const post = postBySlug(slug)
  return post ? <Post post={post} /> : <CrmPost slug={slug} />
}
