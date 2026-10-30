// Runs after `vite build`. The site is a single-page app, so every address would otherwise serve the same bare HTML. This writes a real
// HTML file for each public page (its own title, description, canonical address, social-share tags, structured data and the page's text),
// and a sitemap, so search engines and AI assistants read what each page is about before any script runs. The app replaces the text
// as soon as it loads.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTES, SITE } from '../src/seo/site.js'
import { GUIDES } from '../src/data/guides.js'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const template = readFileSync(join(dist, 'index.html'), 'utf8')
const today = new Date().toISOString().slice(0, 10)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const abs = (path) => (path.startsWith('http') ? path : `${SITE.url}${path === '/' ? '/' : path}`)
const ld = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`

const organisation = {
  '@context': 'https://schema.org',
  '@type': ['EducationalOrganization', 'Organization'],
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  alternateName: SITE.alternateNames,
  url: SITE.url,
  logo: abs(SITE.logo),
  image: abs(SITE.ogImage),
  description: 'EGIRE Robotics trains students, colleges and professionals in India in FPV drone piloting, drone building, AI and robotics.',
  email: SITE.email,
  telephone: SITE.phone,
  areaServed: { '@type': 'Country', name: 'India' },
  knowsAbout: ['FPV drones', 'Drone piloting', 'Drone building', 'Drone workshops for colleges', 'Robotics', 'Artificial intelligence', 'ROS 2', 'Drone mapping', 'Agriculture drones'],
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', telephone: SITE.phone, email: SITE.email, areaServed: 'IN', availableLanguage: ['English', 'Telugu', 'Hindi'] }],
}
const website = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE.url}/#website`, url: SITE.url, name: SITE.name, inLanguage: SITE.language, publisher: { '@id': `${SITE.url}/#organization` } }

function structuredData(route) {
  const blocks = []
  if (route.path === '/') blocks.push(organisation, website)
  const crumbs = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` }]
  if (route.path !== '/') crumbs.push({ '@type': 'ListItem', position: 2, name: route.h1, item: abs(route.path) })
  if (route.path !== '/') blocks.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: route.guide ? [crumbs[0], { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE.url}/guides` }, { '@type': 'ListItem', position: 3, name: route.h1, item: abs(route.path) }] : crumbs })
  if (route.guide) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: route.guide.title,
      description: route.guide.description,
      datePublished: route.guide.updated,
      dateModified: route.guide.updated,
      inLanguage: SITE.language,
      mainEntityOfPage: abs(route.path),
      image: abs(SITE.ogImage),
      author: { '@id': `${SITE.url}/#organization` },
      publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: abs(SITE.logo) } },
    })
    if (route.guide.faq?.length) {
      blocks.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: route.guide.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) })
    }
  }
  if (route.path === '/workshops') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'FPV drone piloting workshop',
      description: 'A hands-on FPV drone piloting workshop that starts in a simulator and moves to real flying, with a certificate for each skill grade.',
      provider: { '@id': `${SITE.url}/#organization` },
      inLanguage: 'en',
      educationalCredentialAwarded: 'Certificate',
    })
  }
  return blocks.map(ld).join('\n    ')
}

function head(route) {
  const url = abs(route.path)
  const image = abs(SITE.ogImage)
  const type = route.guide ? 'article' : 'website'
  return `<!--seo:start-->
    <title>${esc(route.title)}</title>
    <meta name="description" content="${esc(route.description)}" />
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="author" content="${esc(SITE.name)}" />
    <meta property="og:site_name" content="${esc(SITE.name)}" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(route.title)}" />
    <meta property="og:description" content="${esc(route.description)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(SITE.name)}: ${esc(SITE.tagline)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(route.title)}" />
    <meta name="twitter:description" content="${esc(route.description)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="geo.region" content="IN" />
    <meta name="geo.placename" content="India" />
    ${structuredData(route)}
    <!--seo:end-->`
}

function body(route) {
  const link = (path) => `<a href="${path}">${esc(ROUTES.find((r) => r.path === path)?.h1 ?? path)}</a>`
  const parts = [`<h1>${esc(route.h1)}</h1>`]
  if (route.guide) {
    parts.push(`<p>${esc(route.guide.intro)}</p>`)
    for (const s of route.guide.sections) parts.push(`<h2>${esc(s.h)}</h2>`, ...s.p.map((p) => `<p>${esc(p)}</p>`))
    if (route.guide.faq?.length) parts.push('<h2>Frequently asked questions</h2>', ...route.guide.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`))
  } else {
    parts.push(...(route.body ?? []).map((p) => `<p>${esc(p)}</p>`))
  }
  const links = (route.links ?? []).filter((p) => ROUTES.some((r) => r.path === p))
  if (links.length) parts.push(`<p>${links.map(link).join(' · ')}</p>`)
  parts.push(`<p>${esc(SITE.name)} · ${esc(SITE.email)} · ${esc(SITE.phone)}</p>`)
  return `<div class="seo-static">${parts.join('')}</div>`
}

function render(route) {
  let html = template
  html = /<!--seo:start-->[\s\S]*?<!--seo:end-->/.test(html) ? html.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, head(route)) : html.replace('</head>', `${head(route)}\n  </head>`)
  html = html.replace('<div id="root"></div>', `<div id="root">${body(route)}</div>`)
  return html
}

for (const route of ROUTES) {
  const html = render(route)
  if (route.path === '/') {
    writeFileSync(join(dist, 'index.html'), html)
  } else {
    const dir = join(dist, ...route.path.split('/').filter(Boolean))
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), html)
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map((r) => `  <url><loc>${abs(r.path)}</loc><lastmod>${r.guide?.updated ?? today}</lastmod><changefreq>${r.path === '/' || r.path === '/guides' ? 'weekly' : 'monthly'}</changefreq><priority>${r.priority.toFixed(1)}</priority></url>`).join('\n')}
</urlset>
`
writeFileSync(join(dist, 'sitemap.xml'), sitemap)
console.log(`prerender: ${ROUTES.length} pages and a sitemap with ${ROUTES.length} addresses (${GUIDES.length} guides)`)
