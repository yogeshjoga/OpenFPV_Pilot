const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const TIMEOUT_MS = 8000

export const siteApiConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY)

export const mediaUrl = (path) => `${SUPABASE_URL}/storage/v1/object/public/site-media/${path}`

async function get(table, query) {
  if (!siteApiConfigured) throw new Error('Site content API is not configured')
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`${table}: ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

async function rpc(name) {
  if (!siteApiConfigured) throw new Error('Site content API is not configured')
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
      body: '{}',
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`${name}: ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

/** Overall rating plus the reviews an admin chose to publish. Only name, rating, comment and description are returned. */
export async function fetchReviews() {
  const [stats, reviews] = await Promise.all([rpc('get_public_review_stats'), rpc('get_public_reviews')])
  const s = stats?.[0]
  return {
    stats: s && Number(s.review_count) > 0 ? { count: Number(s.review_count), average: Number(s.avg_rating) } : null,
    reviews: reviews.map((r) => ({ id: r.id, rating: r.rating, comment: r.comment, name: r.display_name, subtitle: r.subtitle })),
  }
}

/** Partners and collaborators to show on the Workshops page, in the order set in the CRM. Only name, link and logo are returned. */
export async function fetchPartners() {
  const rows = await get('site_partners', 'select=id,name,website_url,logo_path&is_published=eq.true&order=sort_order.asc,created_at.asc')
  return rows.map((p) => ({ id: p.id, name: p.name, url: p.website_url, logo: mediaUrl(p.logo_path) }))
}

/** Published gallery: categories plus albums (with their published images). Row-level security hides drafts. */
export async function fetchGallery() {
  const [categories, albums] = await Promise.all([
    get('site_gallery_categories', 'select=id,name,slug,sort_order&order=sort_order.asc,name.asc'),
    get(
      'site_gallery_albums',
      'select=id,category_id,title,description,event_date,created_at,site_gallery_images(id,full_path,thumb_path,width,height,created_at)' +
        '&is_published=eq.true&order=event_date.desc.nullslast,created_at.desc',
    ),
  ])
  return {
    categories,
    albums: albums.map((a) => ({
      id: a.id,
      categoryId: a.category_id,
      title: a.title,
      description: a.description,
      date: a.event_date,
      images: [...(a.site_gallery_images ?? [])]
        .sort((x, y) => x.created_at.localeCompare(y.created_at))
        .map((i) => ({ id: i.id, w: i.width, h: i.height, thumb: mediaUrl(i.thumb_path), full: mediaUrl(i.full_path) })),
    })),
  }
}

/** Published blog posts, newest first. */
export async function fetchBlogPosts() {
  const rows = await get(
    'site_blog_posts',
    'select=slug,title,excerpt,category,author,content_md,cover_path,read_minutes,published_at&is_published=eq.true&order=published_at.desc.nullslast',
  )
  return rows.map((p) => ({
    id: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    author: p.author,
    date: p.published_at
      ? new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      : '',
    readTime: `${p.read_minutes} min read`,
    content: p.content_md,
    cover: p.cover_path ? mediaUrl(p.cover_path) : null,
  }))
}
