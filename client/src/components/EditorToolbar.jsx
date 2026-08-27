const FONT_SIZES = [
  { label: 'Small', value: '13px' },
  { label: 'Normal', value: '16px' },
  { label: 'Large', value: '20px' },
  { label: 'Huge', value: '28px' },
]

const COLORS = ['#172554', '#DC2626', '#2563EB', '#059669', '#7C3AED', '#EA580C']

function ToolbarButton({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-semibold transition-colors ${
        active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-gray-200 mx-1" />
}

export function EditorToolbar({ editor }) {
  if (!editor) return null

  const headingValue = editor.isActive('heading', { level: 1 }) ? '1'
    : editor.isActive('heading', { level: 2 }) ? '2'
    : editor.isActive('heading', { level: 3 }) ? '3'
    : 'p'

  const setHeading = (value) => {
    if (value === 'p') editor.chain().focus().setParagraph().run()
    else editor.chain().focus().toggleHeading({ level: Number(value) }).run()
  }

  const setFontSize = (value) => {
    if (!value) editor.chain().focus().unsetFontSize().run()
    else editor.chain().focus().setFontSize(value).run()
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href || ''
    const url = window.prompt('Link URL', previousUrl)
    if (url === null) return
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('Image URL')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const insertTable = () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()

  return (
    <div className="flex flex-wrap items-center gap-1 border border-gray-200 rounded-xl px-2 py-1.5 mb-3 bg-white">
      <select value={headingValue} onChange={(e) => setHeading(e.target.value)}
        className="text-xs font-semibold border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none">
        <option value="p">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      <Divider />

      <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><span className="italic">I</span></ToolbarButton>
      <ToolbarButton title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><span className="underline">U</span></ToolbarButton>

      <Divider />

      <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>•≡</ToolbarButton>
      <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</ToolbarButton>

      <Divider />

      <select onChange={(e) => setFontSize(e.target.value)} defaultValue=""
        className="text-xs font-semibold border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none">
        <option value="" disabled>Size</option>
        {FONT_SIZES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>

      <div className="flex items-center gap-1 px-1">
        {COLORS.map((c) => (
          <button key={c} type="button" title={c} onClick={() => editor.chain().focus().setColor(c).run()}
            className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
        ))}
        <input type="color" title="Custom color" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-6 h-6 border-0 bg-transparent cursor-pointer" />
      </div>

      <Divider />

      <ToolbarButton title="Link" active={editor.isActive('link')} onClick={addLink}>🔗</ToolbarButton>
      <ToolbarButton title="Image" onClick={addImage}>🖼️</ToolbarButton>
      <ToolbarButton title="Insert table" onClick={insertTable}>▦</ToolbarButton>

      {editor.isActive('table') && (
        <>
          <Divider />
          <ToolbarButton title="Add row" onClick={() => editor.chain().focus().addRowAfter().run()}>+row</ToolbarButton>
          <ToolbarButton title="Add column" onClick={() => editor.chain().focus().addColumnAfter().run()}>+col</ToolbarButton>
          <ToolbarButton title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}>✕table</ToolbarButton>
        </>
      )}
    </div>
  )
}
