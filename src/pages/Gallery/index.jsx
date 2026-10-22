import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Folder, Images } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import gallery from '@data/galleryStatic.json'
import { fetchGallery } from '@lib/siteApi'
import useDocumentMeta from '@lib/useDocumentMeta'
import styles from './Gallery.module.css'

const HIGHLIGHT_COUNT = 5

const staticImage = (img) => ({
  id: img.id,
  w: img.w,
  h: img.h,
  thumb: `/gallery/${img.set}/thumb/${img.id}.webp`,
  full: `/gallery/${img.set}/full/${img.id}.webp`,
})

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '')
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
const albumPath = (folder, album) => `/gallery/${folder.slug}/${album.id}`

/** The folders, albums and best photos shown on the site: what is bundled with it plus what the team adds in the CRM. */
function buildGallery(remote) {
  const remoteFolders = remote?.categories ?? []
  const staticFolder = gallery.folders[0]
  const folders = remoteFolders.some((c) => c.slug === staticFolder.slug)
    ? remoteFolders
    : [...remoteFolders, { id: staticFolder.id, slug: staticFolder.slug, name: staticFolder.name }]
  const workshops = folders.find((f) => f.slug === staticFolder.slug)

  const bundled = gallery.albums.map((a) => {
    const images = a.images.map(staticImage)
    const featured = (a.featured ?? []).map((id) => images.find((i) => i.id === id)).filter(Boolean)
    return { ...a, folderId: workshops.id, images, featured: featured.length ? featured : images.slice(0, 1) }
  })
  const added = (remote?.albums ?? [])
    .filter((a) => a.images.length > 0)
    .map((a) => ({ ...a, folderId: a.categoryId, featured: a.images.slice(0, 2) }))

  // Newest first, so a new album from the CRM is the first thing visitors see
  const albums = [...added, ...bundled].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  const used = new Set(albums.map((a) => a.folderId))
  const list = folders
    .filter((f) => used.has(f.id))
    .map((f) => {
      const inFolder = albums.filter((a) => a.folderId === f.id)
      return { ...f, albums: inFolder, photoCount: inFolder.reduce((n, a) => n + a.images.length, 0) }
    })
  return { folders: list, albums }
}

/** The best photos from different albums: one from each album first, then second picks, until there are enough. */
function pickHighlights(folders) {
  const pool = folders.flatMap((f) => f.albums.map((a) => ({ folder: f, album: a })))
  const picks = []
  for (let round = 0; picks.length < HIGHLIGHT_COUNT; round++) {
    let found = false
    for (const { folder, album } of pool) {
      const image = album.featured[round]
      if (image && picks.length < HIGHLIGHT_COUNT) {
        picks.push({ image, album, folder })
        found = true
      }
    }
    if (!found) break
  }
  return picks
}

function Crumbs({ items }) {
  return (
    <nav className={styles.crumbs} aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item.label} className={styles.crumb}>
          {i > 0 && <ChevronRight size={14} aria-hidden="true" />}
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}

function AlbumCard({ folder, album }) {
  return (
    <Link to={albumPath(folder, album)} className={styles.albumCard}>
      <div className={styles.albumCover}>
        <img src={album.featured[0].thumb} alt="" loading="lazy" decoding="async" />
      </div>
      <div className={styles.albumMeta}>
        <span className={styles.albumTitle}>{album.title}</span>
        <span className={styles.albumCount}>{[formatDate(album.date), plural(album.images.length, 'photo')].filter(Boolean).join(' · ')}</span>
      </div>
    </Link>
  )
}

function Landing({ folders, highlights, photoCount, albumCount }) {
  return (
    <>
      <header className={styles.header}>
        <motion.h1 className={styles.title} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          Our <span className="gradient-text">Gallery</span>
        </motion.h1>
        <motion.p className={styles.subtitle} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          Our team, workshops, flying sessions and events.
          {photoCount > 0 && ` ${plural(photoCount, 'photo')} in ${plural(albumCount, 'album')}.`}
        </motion.p>
      </header>

      {highlights.length > 0 && (
        <section className={styles.section} aria-labelledby="highlights-title">
          <h2 id="highlights-title" className={styles.sectionTitle}>Highlights</h2>
          <div className={styles.mosaic}>
            {highlights.map(({ image, album, folder }, i) => (
              <Link key={image.id} to={albumPath(folder, album)} className={`${styles.mosaicItem} ${i === 0 ? styles.mosaicHero : ''}`}>
                <img src={image.thumb} alt={`${album.title}`} width={image.w} height={image.h} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
                <span className={styles.mosaicCaption}>{album.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section} aria-labelledby="folders-title">
        <h2 id="folders-title" className={styles.sectionTitle}>Browse by folder</h2>
        <div className={styles.folderGrid}>
          {folders.map((f) => (
            <Link key={f.id} to={`/gallery/${f.slug}`} className={styles.folderCard}>
              <div className={styles.collage}>
                {f.albums.slice(0, 3).map((a) => (
                  <img key={a.id} src={a.featured[0].thumb} alt="" loading="lazy" decoding="async" />
                ))}
              </div>
              <div className={styles.folderMeta}>
                <Folder size={20} aria-hidden="true" />
                <div>
                  <span className={styles.albumTitle}>{f.name}</span>
                  <span className={styles.albumCount}>
                    {plural(f.albums.length, 'album')} · {plural(f.photoCount, 'photo')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

function FolderView({ folder }) {
  return (
    <>
      <Crumbs items={[{ label: 'Gallery', to: '/gallery' }, { label: folder.name }]} />
      <header className={styles.folderHeader}>
        <h1 className={styles.heading}>{folder.name}</h1>
        <p className={styles.albumSub}>
          {plural(folder.albums.length, 'album')} · {plural(folder.photoCount, 'photo')}
        </p>
      </header>
      <div className={styles.albumGrid}>
        {folder.albums.map((a) => (
          <AlbumCard key={a.id} folder={folder} album={a} />
        ))}
      </div>
    </>
  )
}

function AlbumView({ folder, album }) {
  const [active, setActive] = useState(null)
  const images = album.images
  const current = active === null ? null : images[active]
  const others = folder.albums.filter((a) => a.id !== album.id)

  useEffect(() => {
    if (active === null) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setActive(null)
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + images.length) % images.length)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active, images.length])

  return (
    <>
      <Crumbs items={[{ label: 'Gallery', to: '/gallery' }, { label: folder.name, to: `/gallery/${folder.slug}` }, { label: album.title }]} />
      <header className={styles.folderHeader}>
        <h1 className={styles.heading}>{album.title}</h1>
        <p className={styles.albumSub}>{[formatDate(album.date), plural(images.length, 'photo')].filter(Boolean).join(' · ')}</p>
        {album.description && <p className={styles.albumDesc}>{album.description}</p>}
      </header>

      <div className={album.wide ? styles.wideGrid : styles.masonryGrid}>
        {images.map((img, index) => (
          <button key={img.id} type="button" className={styles.gridItem} onClick={() => setActive(index)} aria-label={`Open photo ${index + 1}`}>
            <div className={styles.mediaWrap}>
              <img
                src={album.wide ? img.full : img.thumb}
                alt={`${album.title}, photo ${index + 1}`}
                width={img.w}
                height={img.h}
                loading="lazy"
                decoding="async"
                className={styles.media}
              />
            </div>
          </button>
        ))}
      </div>

      {others.length > 0 && (
        <section className={styles.section} aria-labelledby="more-albums-title">
          <h2 id="more-albums-title" className={styles.sectionTitle}>More albums in {folder.name}</h2>
          <div className={styles.albumGrid}>
            {others.map((a) => (
              <AlbumCard key={a.id} folder={folder} album={a} />
            ))}
          </div>
        </section>
      )}

      {current && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={`${album.title}, photo ${active + 1}`} onClick={() => setActive(null)}>
          <button type="button" className={styles.lightboxClose} onClick={() => setActive(null)} aria-label="Close">
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setActive((i) => (i - 1 + images.length) % images.length)
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft size={28} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setActive((i) => (i + 1) % images.length)
                }}
                aria-label="Next photo"
              >
                <ChevronRight size={28} aria-hidden="true" />
              </button>
            </>
          )}
          <img src={current.full} alt={`${album.title}, photo ${active + 1}`} className={styles.lightboxImg} onClick={(e) => e.stopPropagation()} />
          <span className={styles.lightboxCount}>
            {active + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  )
}

export default function Gallery() {
  const { folder: folderSlug, album: albumId } = useParams()
  const [remote, setRemote] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let live = true
    fetchGallery()
      .then((data) => live && setRemote(data))
      .catch(() => {})
      .finally(() => live && setLoaded(true))
    return () => {
      live = false
    }
  }, [])

  const { folders, albums } = useMemo(() => buildGallery(remote), [remote])
  const highlights = useMemo(() => pickHighlights(folders), [folders])

  const folder = folderSlug ? folders.find((f) => f.slug === folderSlug) : null
  const album = folder && albumId ? folder.albums.find((a) => a.id === albumId) : null

  const level = album ? 'album' : folder && !albumId ? 'folder' : folderSlug ? 'missing' : 'landing'
  const title = album ? `${album.title} | Gallery | EGIRE Robotics` : folder ? `${folder.name} | Gallery | EGIRE Robotics` : 'Gallery | EGIRE Robotics'
  useDocumentMeta(title, album?.description || 'Photos from EGIRE Robotics workshops, flying sessions and events.')

  // Each level opens at the top of the page
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [folderSlug, albumId])

  return (
    <PageWrapper>
      <div className={styles.page}>
        <div className="container">
          {level === 'landing' && (
            <Landing folders={folders} highlights={highlights} photoCount={albums.reduce((n, a) => n + a.images.length, 0)} albumCount={albums.length} />
          )}
          {level === 'folder' && <FolderView folder={folder} />}
          {level === 'album' && <AlbumView key={album.id} folder={folder} album={album} />}
          {level === 'missing' && (
            <div className={styles.missing}>
              {loaded ? (
                <>
                  <Images size={32} aria-hidden="true" />
                  <h1 className={styles.heading}>We could not find that page</h1>
                  <p className={styles.albumDesc}>The folder or album may have been moved or removed.</p>
                  <Link to="/gallery" className={styles.backLink}>
                    Back to the gallery
                  </Link>
                </>
              ) : (
                <p className={styles.albumDesc}>Loading…</p>
              )}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
