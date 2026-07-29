function Table({ editor, isInTable }) {
  return (
    <>
      <div className="button-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          Table
        </button>
      </div>
      {isInTable ? (
        <>
          <div className="button-group">
            <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>
              Row+
            </button>
          </div>
          <div className="button-group">
            <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>
              Col+
            </button>
          </div>
          <div className="button-group">
            <button type="button" onClick={() => editor.chain().focus().deleteTable().run()}>
              Del Table
            </button>
          </div>
        </>
      ) : null}
    </>
  );
}

export default Table;
