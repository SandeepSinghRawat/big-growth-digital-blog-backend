'use client';

import { useRef, useState } from 'react';
import { uploadImageFile } from './uploadImage';

function CoverImage({ featuredImage, onFeaturedImageChange, altText = '' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    console.log("file log value", file);
    event.target.value = '';
    if (!file) {
      return;
    }

    setUploading(true);
    setMessage('');
    try {
      const url = await uploadImageFile(file, altText);
      onFeaturedImageChange?.(url);
      setMessage('Cover image uploaded.');
    } catch (err) {
      setMessage(err.message || 'Unable to upload cover image.');
    } finally {
      setUploading(false);
    }
  };

  const setCoverFromUrl = () => {
    const url = window.prompt('Cover image URL');
    if (!url) {
      return;
    }
    onFeaturedImageChange?.(url);
    setMessage('Cover image updated.');
  };

  const removeCover = () => {
    onFeaturedImageChange?.('');
    setMessage('Cover image removed.');
  };

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <strong>Cover image</strong>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="button secondary" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? 'Uploading…' : 'Upload cover'}
          </button>
          <button type="button" className="button secondary" onClick={setCoverFromUrl}>
            Use URL
          </button>
          {featuredImage ? (
            <button type="button" className="button secondary" onClick={removeCover}>
              Remove
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {featuredImage ? (
        <img src={featuredImage} alt={altText || 'Cover image'} className="featured-image max-h-72 w-full object-cover" />
      ) : (
        <p className="m-0 text-sm text-slate-500">No cover image selected.</p>
      )}
      {message ? <p className="status-message mt-2">{message}</p> : null}
    </div>
  );
}

export default CoverImage;
