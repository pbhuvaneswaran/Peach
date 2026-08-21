import { ArticleEditor } from './ArticleEditor'

// Full-screen document-editing experience — opened from a list (ArticlesTab, ContentBriefModal)
// rather than embedded inline, so writing an article feels like opening a doc, not filling a form field.
export function ArticleEditorPanel({ open, onClose, articleId, title, initialHtml, initialMarkdown, initialQuality, loading }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="hidden sm:block sm:w-[30%] bg-[#172554]/40" onClick={onClose} />
      <div className="w-full sm:w-[70%] h-full bg-white shadow-2xl flex flex-col ml-auto">
        <div className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Editing</p>
            <h2 className="text-base font-bold text-gray-900 truncate">{title || 'Article'}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none px-2 flex-shrink-0">✕</button>
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
