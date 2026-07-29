'use client';

import { useRef, useState } from 'react';
import { uploadImageFile } from './uploadImage';

function EditorImage({ editor }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err) {
      window.alert(err.message || 'Unable to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const insertImageFromUrl = () => {
    const url = window.prompt('Image URL');
    if (!url) {
      return;
    }
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <>
      <div className="button-group">
        <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <strong>{uploading ? '…' : 'Img'}</strong>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <div className="button-group">
        <button type="button" onClick={insertImageFromUrl}>
          <strong>URL</strong>
        </button>
      </div>
    </>
  );
}

export default EditorImage;
