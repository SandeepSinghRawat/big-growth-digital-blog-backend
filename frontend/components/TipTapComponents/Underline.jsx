function UnderLine({editor, isUnderline}) {
  return <div className="button-group">
    <button className={isUnderline ? "bg-gray-900 text-blue-400" : ""} onClick={()=> editor.chain().focus().toggleUnderline().run()}>
      <strong>U</strong>
    </button>
  </div>
}

export default UnderLine;