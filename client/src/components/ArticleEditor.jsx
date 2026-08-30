import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, Color, FontSize } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '../context/AuthContext'
import { ArticleExportBar } from './ArticleExportBar'
import { EditorToolbar } from './EditorToolbar'
import { btnBase, btnStyle } from '../lib/motion'

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
  const [mode, setMode] = useState('edit') // 'edit' | 'preview'
  const [publishOpen, setPublishOpen] = useState(false)
  const [quality, setQuality] = useState(initialQuality)
  const [markdown, setMarkdown] = useState(initialMarkdown || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [publishVisible, setPublishVisible] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontSize,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- two-paint mount/reveal trick for the entrance transition
    if (!publishOpen) { setPublishVisible(false); return }
    const raf = requestAnimationFrame(() => setPublishVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [publishOpen])

  if (!editor) return null

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setMode('preview')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${mode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'} ${btnBase}`} style={btnStyle()}>
            Preview
          </button>
          <button onClick={() => setMode('edit')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${mode === 'edit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'} ${btnBase}`} style={btnStyle()}>
            Edit
          </button>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'edit' && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`text-xs font-semibold border border-gray-300 hover:bg-gray-50 disabled:opacity-60 px-4 py-1.5 rounded-lg transition-colors ${btnBase}`}
              style={btnStyle()}
            >
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setPublishOpen(v => !v)}
              className={`text-xs font-semibold bg-gradient-to-r from-[#2563EB] to-cyan-500 hover:opacity-90 text-white px-4 py-1.5 rounded-lg transition-opacity ${btnBase}`}
              style={btnStyle()}
            >
              Publish ▾
            </button>
            {publishOpen && (
              <div
                className="absolute right-0 mt-2 z-10 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-80 origin-top-right transition-[opacity,transform] duration-150"
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
                  opacity: publishVisible ? 1 : 0,
                  transform: publishVisible ? 'scale(1)' : 'scale(0.95)',
                }}
              >
                <ArticleExportBar markdown={markdown} title={title} articleId={articleId} onPublished={() => setPublishOpen(false)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {mode === 'edit' && <QualityBadges quality={quality} />}
      {mode === 'edit' && (
        <p className="text-[11px] text-[#94A3B8] mb-4">Edits re-run quality checks automatically on save.</p>
      )}

      {mode === 'edit' ? (
        <>
          <EditorToolbar editor={editor} />
          <div className="border border-[#BFDBFE] rounded-xl px-8 py-7 min-h-[70vh] prose prose-base max-w-none focus-within:ring-2 focus-within:ring-[#2563EB]">
            <EditorContent editor={editor} />
          </div>
        </>
      ) : (
        <div className="border border-gray-100 rounded-xl px-8 py-7 min-h-[70vh] prose prose-base max-w-none bg-gray-50">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
