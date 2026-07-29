function Heading({ editor, activeLevel }) {
  const levels = [1, 2, 3];

  return (
    <div className="button-group flex gap-1">
      {levels.map((level) => (
        <button
          key={level}
          type="button"
          className={activeLevel === level ? 'bg-gray-900 text-blue-400' : ''}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
        >
          <strong>H{level}</strong>
        </button>
      ))}
      <button
        type="button"
        className={activeLevel === 0 ? 'bg-gray-900 text-blue-400' : ''}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <strong>P</strong>
      </button>
    </div>
  );
}

export default Heading;
