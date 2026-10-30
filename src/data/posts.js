// The one list behind the blog: the former guides and the articles. Plain data, shared by the site and the build step.
import { GUIDES } from './guides.js'
import { ARTICLES } from './blogPosts.js'

const guides = GUIDES.map((g) => ({ ...g, category: 'Guides', author: 'EGIRE Robotics', published: g.updated }))

const words = (post) => [post.intro, ...post.sections.flatMap((s) => s.p)].join(' ').split(/\s+/).length

/** Newest first. */
export const POSTS = [...guides, ...ARTICLES]
  .map((p) => ({ ...p, readMinutes: Math.max(2, Math.round(words(p) / 200)) }))
  .sort((a, b) => b.published.localeCompare(a.published) || a.title.localeCompare(b.title))

export const postBySlug = (slug) => POSTS.find((p) => p.slug === slug)
export const CATEGORIES = [...new Set(POSTS.map((p) => p.category))]

/** Other posts to read next: same category first, then the rest. */
export const relatedPosts = (post, count = 3) => [
  ...POSTS.filter((p) => p.slug !== post.slug && p.category === post.category),
  ...POSTS.filter((p) => p.slug !== post.slug && p.category !== post.category),
].slice(0, count)

/** Keywords of a post as one list, for the page's meta tag. */
export const keywordList = (post) => (post.keywords ?? []).join(', ')
