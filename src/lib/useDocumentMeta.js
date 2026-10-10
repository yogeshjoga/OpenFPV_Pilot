import { useEffect } from 'react'

/** Sets the browser tab title and the search description for a page, and restores them when leaving it. */
export default function useDocumentMeta(title, description) {
  useEffect(() => {
    const previousTitle = document.title
    const meta = document.querySelector('meta[name="description"]')
    const previousDescription = meta ? meta.content : null
    document.title = title
    if (description && meta) meta.content = description
    return () => {
      document.title = previousTitle
      if (meta && previousDescription !== null) meta.content = previousDescription
    }
  }, [title, description])
}
