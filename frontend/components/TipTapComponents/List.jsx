function List({ editor, isBulletList, isOrderedList }) {
  return (
    <>
      <div className="button-group">
        <button
          type="button"
          className={isBulletList ? 'bg-gray-900 text-blue-400' : ''}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <strong>BL</strong>
        </button>
      </div>
      <div className="button-group">
        <button
          type="button"
          className={isOrderedList ? 'bg-gray-900 text-blue-400' : ''}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <strong>NL</strong>
        </button>
      </div>
      <div className="button-group">
        <button type="button" onClick={() => editor.chain().focus().sinkListItem('listItem').run()}>
          Indent
        </button>
      </div>
      <div className="button-group">
        <button type="button" onClick={() => editor.chain().focus().liftListItem('listItem').run()}>
          Outdent
        </button>
      </div>
    </>
  );
}

export default List;
