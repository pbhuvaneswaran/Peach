import { ArticleEditor } from './ArticleEditor'

// Full-screen document-editing experience — opened from a list (ArticlesTab, ContentBriefModal)
// rather than embedded inline, so writing an article feels like opening a doc, not filling a form field.
export function ArticleEditorPanel({ open, onClose, articleId, title, initialHtml, initialMarkdown, initialQuality, angle, loading }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* No onClick here on purpose — an accidental click outside the panel must never
          discard an in-progress edit. Closing only happens via the explicit control below. */}
      <div className="hidden sm:block sm:w-[30%] bg-[#172554]/40" />
      <div className="w-full sm:w-[70%] h-full bg-white shadow-2xl flex flex-col ml-auto">
        <div className="px-6 sm:px-10 py-4 border-b border-gray-100 shrink-0">
          <button onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-800 mb-2">← Back to outline</button>
          {angle && <p className="text-xs text-blue-600 italic mb-1">{angle}</p>}
          <h2 className="text-xl font-bold text-gray-900 truncate">{title || 'Article'}</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <ArticleEditor
              articleId={articleId}
              title={title}
              initialHtml={initialHtml}
              initialMarkdown={initialMarkdown}
              initialQuality={initialQuality}
            />
          )}
        </div>
      </div>
    </div>
  )
}
