import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useAuth } from '../context/AuthContext'
import { ArticleExportBar } from './ArticleExportBar'

const QUALITY_LABELS = {
  wordCountOk: 'Word count',
  outlineMatchOk: 'Covers full outline',
  ctaPresent: 'Has CTA section',
  brandStuffingOk: 'No brand-name stuffing',
}

function QualityBadges({ quality }) {
  if (!quality) return null
  const checks = [
    { key: 'wordCountOk', ok: quality.wordCountOk, detail: `${quality.wordCount} words` },
    { key: 'outlineMatchOk', ok: quality.outlineMatchOk, detail: quality.missingHeadings?.length ? `missing: ${quality.missingHeadings.slice(0, 2).join(', ')}` : '' },
    { key: 'ctaPresent', ok: quality.ctaPresent, detail: '' },
    { key: 'brandStuffingOk', ok: quality.brandStuffingOk, detail: `${quality.brandMentions} mentions` },
  ]
  const bannedOk = !quality.bannedFound || quality.bannedFound.length === 0

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${quality.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
        {quality.passed ? '✓ Quality checks passed' : '⚠ Needs review'}
      </span>
      {checks.map(c => (
        <span key={c.key} title={c.detail}
          className={`text-[11px] font-medium px-2 py-1 rounded-full ${c.ok ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-600'}`}>
          {c.ok ? '✓' : '✗'} {QUALITY_LABELS[c.key]}
        </span>
      ))}
      {!bannedOk && (
        <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-red-50 text-red-600">
          ✗ Banned phrases: {quality.bannedFound.join(', ')}
        </span>
      )}
    </div>
  )
}

export function ArticleEditor({ articleId, title, initialHtml, initialMarkdown, initialQuality }) {
  const { session } = useAuth()
  const [quality, setQuality] = useState(initialQuality)
  const [markdown, setMarkdown] = useState(initialMarkdown || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialHtml || '',
  })

  const handleSave = async () => {
    if (!editor || !articleId) return
    setSaving(true)
    setSaved(false)
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ content_html: editor.getHTML() }),
      })
      const data = await res.json()
      if (res.ok) {
        setQuality(data.quality_json)
        setMarkdown(data.content_markdown || '')
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  if (!editor) return null

  return (
    <div>
      <QualityBadges quality={quality} />

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white px-4 py-1.5 rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
        </button>
        <span className="text-[11px] text-[#94A3B8]">Edits re-run quality checks automatically on save.</span>
      </div>

      <div className="border border-[#BFDBFE] rounded-xl px-8 py-7 mb-5 min-h-[70vh] prose prose-base max-w-none focus-within:ring-2 focus-within:ring-[#2563EB]">
        <EditorContent editor={editor} />
      </div>

      <ArticleExportBar markdown={markdown} title={title} articleId={articleId} />
    </div>
  )
}
