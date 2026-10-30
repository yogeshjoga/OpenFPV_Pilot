import { useEffect } from 'react'

const SITE_URL = 'https://www.egirerobotics.com'

// finds a tag in the head, or makes it
const tag = (selector, make) => document.head.querySelector(selector) ?? document.head.appendChild(make())
const meta = (attr, name) => tag(`meta[${attr}="${name}"]`, () => { const m = document.createElement('meta'); m.setAttribute(attr, name); return m })

/** Sets the browser tab title, the search description, the canonical address and the share-card text for a page, and restores them when leaving it. */
export default function useDocumentMeta(title, description) {
  useEffect(() => {
    const previousTitle = document.title
    const desc = meta('name', 'description')
    const ogTitle = meta('property', 'og:title')
    const ogDesc = meta('property', 'og:description')
    const ogUrl = meta('property', 'og:url')
    const twTitle = meta('name', 'twitter:title')
    const twDesc = meta('name', 'twitter:description')
    const canonical = tag('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel = 'canonical'; return l })
    const before = [desc, ogTitle, ogDesc, ogUrl, twTitle, twDesc].map((m) => m.content)
    const beforeCanonical = canonical.href
    const url = `${SITE_URL}${window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/$/, '')}`

    document.title = title
    ogTitle.content = title
    twTitle.content = title
    ogUrl.content = url
    canonical.href = url
    if (description) { desc.content = description; ogDesc.content = description; twDesc.content = description }
    return () => {
      document.title = previousTitle
      ;[desc, ogTitle, ogDesc, ogUrl, twTitle, twDesc].forEach((m, i) => { m.content = before[i] })
      canonical.href = beforeCanonical
    }
  }, [title, description])
}
