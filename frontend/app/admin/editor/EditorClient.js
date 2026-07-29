'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Tiptap from '../../../components/TipTap';
import CoverImage from '../../../components/TipTapComponents/CoverImage';

const defaultPost = {
  title: '',
  slug: '',
  summary: '',
  category: '',
  tags: [],
  status: 'draft',
  publishedAt: undefined,
  seo: { metaTitle: '', metaDescription: '', primaryKeyword: '', secondaryKeywords: [], canonicalUrl: '', openGraph: {} },
  featuredImage: '',
  blocks: []
};

function parseTableInput(headersText, rowsText) {
  const headers = headersText.split(',').map((header) => header.trim()).filter(Boolean);
  const rows = rowsText
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(/\t|,/).map((cell) => cell.trim()));
  return { headers, rows };
}

export default function EditorClient({ searchParams }) {
  const [post, setPost] = useState(defaultPost);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [categoryMessage, setCategoryMessage] = useState('');
  const [currentPostId, setCurrentPostId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [loadingPost, setLoadingPost] = useState(false);
  const router = useRouter();
  const postId = String(searchParams?.id || '');
  const [blocks, setBlocks] = useState([]);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionContent, setSectionContent] = useState('<p></p>');
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`);
        const data = await response.json();
        if (response.ok) {
          setCategories(data.items || []);
        }
      } catch (err) {
        console.error('Unable to load categories', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (!postId) {
      return;
    }

    async function loadPost() {
      setLoadingPost(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/posts/${postId}`);
        const data = await response.json();
        if (response.ok && data.post) {
          const loaded = {
            ...defaultPost,
            ...data.post,
            seo: {
              ...defaultPost.seo,
              ...(data.post.seo || {})
            },
            publishedAt: data.post.publishedAt
              ? new Date(data.post.publishedAt).toISOString().slice(0, 16)
              : ''
          };
          setPost(loaded);
          setBlocks(data.post.blocks || []);
          setCurrentPostId(data.post._id || postId);
          setMessage('');
        } else {
          setMessage(data.error || 'Unable to load post.');
        }
      } catch (err) {
        console.error(err);
        setMessage('Unable to load post.');
      } finally {
        setLoadingPost(false);
      }
    }

    loadPost();
  }, [postId]);

  const canSave = Boolean(post.title && post.slug && post.category);

  const saveSectionBlock = () => {
    const normalizedContent = sectionContent?.trim() || '<p></p>';
    if (!sectionTitle.trim() && normalizedContent === '<p></p>') {
      setMessage('Add a section title or content before saving a section.');
      return;
    }

    const section = {
      type: 'section',
      heading: sectionTitle.trim() || undefined,
      headingLevel: sectionTitle.trim() ? 2 : undefined,
      children: [{ type: 'html', html: normalizedContent }]
    };

    setBlocks((prevBlocks) => {
      if (editingSectionIndex === null) {
        return [...prevBlocks, section];
      }
      return prevBlocks.map((block, index) => (index === editingSectionIndex ? section : block));
    });
    setSectionTitle('');
    setSectionContent('<p></p>');
    setMessage(editingSectionIndex === null ? 'Section added.' : 'Section updated.');
    setEditingSectionIndex(null);
  };

  const editSectionBlock = (indexToEdit) => {
    const section = blocks[indexToEdit];
    setSectionTitle(section.heading || '');
    setSectionContent(section.children?.find((child) => child?.type === 'html')?.html || '<p></p>');
    setEditingSectionIndex(indexToEdit);
    setMessage(`Editing ${section.heading || `section ${indexToEdit + 1}`}.`);
  };

  const cancelSectionEdit = () => {
    setEditingSectionIndex(null);
    setSectionTitle('');
    setSectionContent('<p></p>');
    setMessage('Section edit cancelled.');
  };

  const removeSectionBlock = (indexToRemove) => {
    setBlocks((prevBlocks) => prevBlocks.filter((_, index) => index !== indexToRemove));
    if (editingSectionIndex === indexToRemove) {
      cancelSectionEdit();
      return;
    }
    if (editingSectionIndex !== null && indexToRemove < editingSectionIndex) {
      setEditingSectionIndex((index) => index - 1);
    }
    setMessage('Section removed.');
  };

  const savePost = async () => {
    const token = window.localStorage.getItem('bgd_access_token');
    const payload = { ...post, blocks };
    if (!payload.publishedAt) {
      delete payload.publishedAt;
    }

    const isUpdate = Boolean(currentPostId);
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/posts${isUpdate ? `/${currentPostId}` : ''}`;

    const response = await fetch(url, {
      method: isUpdate ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (response.ok) {
      setMessage(isUpdate ? 'Post updated successfully.' : 'Draft saved successfully.');
      if (!isUpdate && data.id) {
        setCurrentPostId(data.id);
        router.replace(`/admin/editor?id=${data.id}`);
      }
    } else {
      setMessage(data.error || 'Failed to save draft.');
    }
  };

  const deleteCurrentPost = async () => {
    if (!currentPostId) {
      return;
    }
    if (!confirm('Delete this post permanently?')) {
      return;
    }

    const token = window.localStorage.getItem('bgd_access_token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/posts/${currentPostId}`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });
    const data = await response.json();
    if (response.ok) {
      setDeleteMessage('Post deleted successfully.');
      router.push('/admin/dashboard');
    } else {
      setDeleteMessage(data.error || 'Unable to delete post.');
    }
  };

  const uploadImageFile = async () => {
    setUploadMessage('');
    if (!blockImageFile) {
      setUploadMessage('Select an image file first.');
      return;
    }

    const token = window.localStorage.getItem('bgd_access_token');
    try {
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result !== 'string') {
            reject(new Error('Unable to read file'));
            return;
          }
          const base64 = result.split(',')[1] || '';
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blockImageFile);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/media/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          filename: blockImageFile.name,
          contentType: blockImageFile.type || 'application/octet-stream',
          altText: blockImageAlt || '',
          body: fileData
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setUploadMessage(data.error || 'Unable to upload image.');
        return;
      }

      const imageUrl = data.previewUrl || data.s3Url;
      setBlockImageSrc(imageUrl);
      if (blockType === 'image') {
        setBlocks((prevBlocks) => [
          ...prevBlocks,
          { type: 'image', src: imageUrl, alt: blockImageAlt || '' }
        ]);
      }
      setUploadMessage('Image uploaded successfully.');
    } catch (err) {
      console.error(err);
      setUploadMessage('Unable to upload image.');
    }
  };

  const createCategory = async () => {
    setCategoryMessage('');
    if (!newCategoryTitle || !newCategorySlug) {
      setCategoryMessage('Provide both title and slug to create a category.');
      return;
    }

    const token = window.localStorage.getItem('bgd_access_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ title: newCategoryTitle, slug: newCategorySlug, description: '' })
      });
      const data = await response.json();
      if (response.ok) {
        setCategoryMessage('Category created successfully.');
        setNewCategoryTitle('');
        setNewCategorySlug('');
        setPost({ ...post, category: newCategorySlug });
        setCategories([...categories, { title: newCategoryTitle, slug: newCategorySlug, _id: data.id }]);
      } else {
        setCategoryMessage(data.error || 'Unable to create category.');
      }
    } catch (err) {
      console.error(err);
      setCategoryMessage('Unable to create category.');
    }
  };

  const addParagraphChild = () => {
    let child = null;

    if (childType === 'text') {
      child = { type: 'text', text: childText || 'Text' };
    }

    if (childType === 'link') {
      child = {
        type: 'link',
        text: childText || 'Link text',
        href: childHref || 'https://'
      };
    }

    if (childType === 'heading') {
      child = {
        type: 'heading',
        level: childHeadingLevel,
        text: childText || 'Subheading'
      };
    }

    if (childType === 'table') {
      const { headers, rows } = parseTableInput(childTableHeaders, childTableRows);
      child = { type: 'table', headers, rows };
    }

    if (childType === 'image') {
      child = { type: 'image', src: childImageSrc || '', alt: childImageAlt || '' };
    }

    if (childType === 'list') {
      child = {
        type: 'list',
        style: childListStyle,
        items: childNestedListItems.length > 0 ? childNestedListItems : childListItems
      };
    }

    if (!child) {
      return;
    }

    setParagraphChildren((prevChildren) => [...prevChildren, child]);
    setChildText('');
    setChildHref('');
    setChildTableHeaders('');
    setChildTableRows('');
    setChildImageSrc('');
    setChildImageAlt('');
    setChildListItems([]);
    setChildNestedListItems([]);
    setChildNestedListInputs({});
    setChildListItemText('');
    setChildListStyle('unordered');
  };

  const removeParagraphChild = (index) => {
    setParagraphChildren((prevChildren) => prevChildren.filter((_, idx) => idx !== index));
  };

  const updateParagraphChild = (index, updatedChild) => {
    setParagraphChildren((prevChildren) => prevChildren.map((child, idx) => (idx === index ? updatedChild : child)));
  };

  const updateParagraphChildField = (index, field, value) => {
    setParagraphChildren((prevChildren) => prevChildren.map((child, idx) => {
      if (idx !== index) {
        return child;
      }
      return { ...child, [field]: value };
    }));
  };

  const updateParagraphChildListItem = (childIndex, path, updatedText) => {
    setParagraphChildren((prevChildren) => prevChildren.map((child, idx) => {
      if (idx !== childIndex) {
        return child;
      }
      return {
        ...child,
        items: updateNestedTextIn(child.items || [], path, updatedText)
      };
    }));
  };

  const removeParagraphChildListItem = (childIndex, path) => {
    setParagraphChildren((prevChildren) => prevChildren.map((child, idx) => {
      if (idx !== childIndex) {
        return child;
      }
      return {
        ...child,
        items: removeNestedItem(child.items || [], path)
      };
    }));
  };

  const renderParagraphChildListItems = (items, childIndex, path = []) => {
    return (
      <ul className="space-y-2">
        {items.map((item, idx) => {
          const itemPath = [...path, idx];
          return (
            <li key={itemPath.join('-')} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-center gap-2">
                <input
                  value={item.text || ''}
                  onChange={(event) => updateParagraphChildListItem(childIndex, itemPath, event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                />
                <button
                  type="button"
                  className="button small secondary"
                  onClick={() => removeParagraphChildListItem(childIndex, itemPath)}
                >
                  Remove
                </button>
              </div>
              {item.children && item.children.length > 0 ? (
                <div className="ml-4 border-l-2 border-slate-200 pl-3">
                  {renderParagraphChildListItems(item.children, childIndex, itemPath)}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  };

  const removeBlock = (index) => {
    setBlocks((prevBlocks) => prevBlocks.filter((_, idx) => idx !== index));
  };

  const addListItem = () => {
    if (!listItemText.trim()) return;
    setNestedListItems((prev) => [...prev, { text: listItemText.trim(), children: [] }]);
    setListItemText('');
  };

  const setNestedListInputValue = (path, field, value) => {
    const key = path.join('-');
    setNestedListInputs((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value
      }
    }));
  };

  const setNestedInputValue = (setInputs, inputs, path, field, value) => {
    const key = path.join('-');
    setInputs((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value
      }
    }));
  };

  const getNestedListInputValue = (path, field, defaultValue = '') => {
    const key = path.join('-');
    return nestedListInputs[key]?.[field] ?? defaultValue;
  };

  const getNestedInputValue = (inputs, path, field, defaultValue = '') => {
    const key = path.join('-');
    return inputs[key]?.[field] ?? defaultValue;
  };

  const addItemToNested = (items, indices, text, style) => {
    const addToNested = (currentItems, currentIndices) => {
      if (currentIndices.length === 0) {
        return [...currentItems, { text, style, children: [] }];
      }
      return currentItems.map((item, idx) => {
        if (idx !== currentIndices[0]) {
          return item;
        }
        if (currentIndices.length === 1) {
          return {
            ...item,
            children: [...(item.children || []), { text, style, children: [] }]
          };
        }
        return {
          ...item,
          children: addToNested(item.children || [], currentIndices.slice(1))
        };
      });
    };
    return addToNested(items, indices);
  };

  const updateNestedTextIn = (items, indices, updatedText) => {
    const updateInNested = (currentItems, currentIndices) => {
      return currentItems.map((item, idx) => {
        if (idx !== currentIndices[0]) {
          return item;
        }
        if (currentIndices.length === 1) {
          return { ...item, text: updatedText };
        }
        return {
          ...item,
          children: updateInNested(item.children || [], currentIndices.slice(1))
        };
      });
    };
    return updateInNested(items, indices);
  };

  const removeNestedItem = (items, indices) => {
    const removeFromNested = (currentItems, currentIndices) => {
      if (currentIndices.length === 1) {
        return currentItems.filter((_, idx) => idx !== currentIndices[0]);
      }
      return currentItems.map((item, idx) => {
        if (idx === currentIndices[0]) {
          return { ...item, children: removeFromNested(item.children || [], currentIndices.slice(1)) };
        }
        return item;
      });
    };
    return removeFromNested(items, indices);
  };

  const addNestedListItem = (path) => {
    const text = getNestedListInputValue(path, 'text').trim();
    const style = getNestedListInputValue(path, 'style', blockStyle);
    if (!text) return;
    setNestedListItems((prev) => addItemToNested(prev, path, text, style));
    setNestedListInputValue(path, 'text', '');
  };

  const updateNestedListItemText = (path, updatedText) => {
    setNestedListItems((prev) => updateNestedTextIn(prev, path, updatedText));
  };

  const removeListItem = (path) => {
    setNestedListItems((prev) => removeNestedItem(prev, path));
  };

  const setChildNestedListInputValue = (path, field, value) => {
    setNestedInputValue(setChildNestedListInputs, childNestedListInputs, path, field, value);
  };

  const getChildNestedListInputValue = (path, field, defaultValue = '') => {
    return getNestedInputValue(childNestedListInputs, path, field, defaultValue);
  };

  const addChildNestedListItem = (path) => {
    const text = getChildNestedListInputValue(path, 'text').trim();
    const style = getChildNestedListInputValue(path, 'style', childListStyle);
    if (!text) return;
    setChildNestedListItems((prev) => addItemToNested(prev, path, text, style));
    setChildNestedListInputValue(path, 'text', '');
  };

  const updateChildNestedListItemText = (path, updatedText) => {
    setChildNestedListItems((prev) => updateNestedTextIn(prev, path, updatedText));
  };

  const removeChildListItem = (path) => {
    setChildNestedListItems((prev) => removeNestedItem(prev, path));
  };

  const addChildListItem = () => {
    if (!childListItemText.trim()) return;
    setChildNestedListItems((prev) => [...prev, { text: childListItemText.trim(), children: [] }]);
    setChildListItemText('');
  };

  const addSectionChildListItem = () => {
    if (!sectionChildListItemText.trim()) return;
    setSectionChildNestedListItems((prev) => [...prev, { text: sectionChildListItemText.trim(), children: [] }]);
    setSectionChildListItemText('');
  };

  const addSectionParagraphChildListItem = () => {
    if (!sectionParagraphChildListItemText.trim()) return;
    setSectionParagraphChildNestedListItems((prev) => [...prev, { text: sectionParagraphChildListItemText.trim(), children: [] }]);
    setSectionParagraphChildListItemText('');
  };

  const setSectionChildNestedListInputValue = (path, field, value) => {
    setNestedInputValue(setSectionChildNestedListInputs, sectionChildNestedListInputs, path, field, value);
  };

  const getSectionChildNestedListInputValue = (path, field, defaultValue = '') => {
    return getNestedInputValue(sectionChildNestedListInputs, path, field, defaultValue);
  };

  const addSectionChildNestedListItem = (path) => {
    const text = getSectionChildNestedListInputValue(path, 'text').trim();
    const style = getSectionChildNestedListInputValue(path, 'style', sectionChildListStyle);
    if (!text) return;
    setSectionChildNestedListItems((prev) => addItemToNested(prev, path, text, style));
    setSectionChildNestedListInputValue(path, 'text', '');
  };

  const updateSectionChildNestedListItemText = (path, updatedText) => {
    setSectionChildNestedListItems((prev) => updateNestedTextIn(prev, path, updatedText));
  };

  const removeSectionChildListItem = (path) => {
    setSectionChildNestedListItems((prev) => removeNestedItem(prev, path));
  };

  const setSectionParagraphChildNestedListInputValue = (path, field, value) => {
    setNestedInputValue(setSectionParagraphChildNestedListInputs, sectionParagraphChildNestedListInputs, path, field, value);
  };

  const getSectionParagraphChildNestedListInputValue = (path, field, defaultValue = '') => {
    return getNestedInputValue(sectionParagraphChildNestedListInputs, path, field, defaultValue);
  };

  const addSectionParagraphChildNestedListItem = (path) => {
    const text = getSectionParagraphChildNestedListInputValue(path, 'text').trim();
    const style = getSectionParagraphChildNestedListInputValue(path, 'style', sectionParagraphChildListStyle);
    if (!text) return;
    setSectionParagraphChildNestedListItems((prev) => addItemToNested(prev, path, text, style));
    setSectionParagraphChildNestedListInputValue(path, 'text', '');
  };

  const updateSectionParagraphChildNestedListItemText = (path, updatedText) => {
    setSectionParagraphChildNestedListItems((prev) => updateNestedTextIn(prev, path, updatedText));
  };

  const removeSectionParagraphChildListItem = (path) => {
    setSectionParagraphChildNestedListItems((prev) => removeNestedItem(prev, path));
  };

  const renderListItemUI = (
    items,
    path = [],
    inputState = {
      getInputValue: getNestedListInputValue,
      setInputValue: setNestedListInputValue,
      addItem: addNestedListItem,
      updateItemText: updateNestedListItemText,
      removeItem: removeListItem,
      defaultStyle: blockStyle
    }
  ) => {
    const { getInputValue, setInputValue, addItem, updateItemText, removeItem, defaultStyle } = inputState;
    return (
      <ul className="space-y-2">
        {items.map((item, idx) => {
          const itemPath = [...path, idx];
          return (
            <li key={itemPath.join('-')} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="mb-3 grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={item.text}
                  onChange={(event) => updateItemText(itemPath, event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                />
                <button
                  type="button"
                  className="button small secondary"
                  onClick={() => removeItem(itemPath)}
                >
                  Remove
                </button>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50 p-3">
                <label className="block text-sm text-slate-700">
                  Add nested item
                  <input
                    value={getInputValue(itemPath, 'text')}
                    onChange={(event) => setInputValue(itemPath, 'text', event.target.value)}
                    placeholder="Child item text"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addItem(itemPath);
                      }
                    }}
                  />
                </label>
                <label className="block text-sm text-slate-700">
                  Nested list style
                  <select
                    value={getInputValue(itemPath, 'style', defaultStyle)}
                    onChange={(event) => setInputValue(itemPath, 'style', event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                  >
                    <option value="unordered">Unordered</option>
                    <option value="ordered">Ordered</option>
                  </select>
                </label>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => addItem(itemPath)}
                >
                  Add child item
                </button>
              </div>
              {item.children && item.children.length > 0 ? (
                <div className="ml-4 border-l-2 border-slate-200 pl-3">
                  {renderListItemUI(item.children, itemPath, inputState)}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  };

  const tagString = useMemo(() => post.tags.join(', '), [post.tags]);

  return (
    <main className="page-shell admin-shell">
      <section className="section-heading">
        <h1>{currentPostId ? 'Edit Post' : 'Post Editor'}</h1>
        <p>Create structured articles with blocks, SEO metadata, and a draft workflow.</p>
      </section>
      <section className="editor-grid">
        <div className="editor-panel">
          <label>
            Title
            <input value={post.title} onChange={(event) => setPost({ ...post, title: event.target.value })} />
          </label>
          <label>
            Slug
            <input value={post.slug} onChange={(event) => setPost({ ...post, slug: event.target.value })} />
          </label>
          <label>
            Category
            <select value={post.category} onChange={(event) => setPost({ ...post, category: event.target.value })}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id || category.slug} value={category.slug}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Or category slug
            <input value={post.category} onChange={(event) => setPost({ ...post, category: event.target.value })} />
          </label>
          <div className="category-creator">
            <strong>Create new category</strong>
            <label>
              Title
              <input value={newCategoryTitle} onChange={(event) => setNewCategoryTitle(event.target.value)} />
            </label>
            <label>
              Slug
              <input value={newCategorySlug} onChange={(event) => setNewCategorySlug(event.target.value)} />
            </label>
            <button type="button" onClick={createCategory} className="button secondary">
              Create Category
            </button>
            {categoryMessage ? <p className="status-message">{categoryMessage}</p> : null}
          </div>
          <label>
            Status
            <select value={post.status} onChange={(event) => setPost({ ...post, status: event.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label>
            Publish date
            <input
              type="datetime-local"
              value={post.publishedAt || ''}
              onChange={(event) => setPost({ ...post, publishedAt: event.target.value || undefined })}
            />
          </label>
          <label>
            Tags
            <input
              value={tagString}
              onChange={(event) => setPost({ ...post, tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })}
            />
          </label>
          <label>
            Summary
            <textarea value={post.summary} onChange={(event) => setPost({ ...post, summary: event.target.value })} />
          </label>
          <label>
            SEO title
            <input value={post.seo.metaTitle} onChange={(event) => setPost({ ...post, seo: { ...post.seo, metaTitle: event.target.value } })} />
          </label>
          <label>
            SEO description
            <textarea value={post.seo.metaDescription} onChange={(event) => setPost({ ...post, seo: { ...post.seo, metaDescription: event.target.value } })} />
          </label>
          <label>
            Canonical URL
            <input
              value={post.seo.canonicalUrl}
              onChange={(event) => setPost({ ...post, seo: { ...post.seo, canonicalUrl: event.target.value } })}
              placeholder="https://example.com/post-slug"
            />
          </label>
        </div>
        <div className="editor-panel">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <strong className="mb-2 block text-slate-900">Cover image</strong>
              <CoverImage
                featuredImage={post.featuredImage || ''}
                onFeaturedImageChange={(url) => setPost({ ...post, featuredImage: url })}
                altText={post.title}
              />
            </div>
            <label>
              Section title
              <input
                value={sectionTitle}
                onChange={(event) => setSectionTitle(event.target.value)}
                placeholder="Section heading"
              />
            </label>
            <Tiptap
              content={sectionContent}
              onChange={setSectionContent}
            />
            <button type="button" onClick={saveSectionBlock} className="button secondary">
              {editingSectionIndex === null ? 'Add section' : 'Update section'}
            </button>
            {editingSectionIndex !== null ? (
              <button type="button" onClick={cancelSectionEdit} className="button secondary">
                Cancel edit
              </button>
            ) : null}
            {blocks.length > 0 ? (
              <div className="space-y-2">
                <strong className="block">Added sections</strong>
                <ul className="space-y-2">
                  {blocks.map((block, index) => {
                    const previewHtml = block.children?.find((child) => child?.type === 'html')?.html || '';
                    return (
                      <li key={index} className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700">
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-semibold text-slate-900">
                            {block.heading || `Section ${index + 1}`}
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => editSectionBlock(index)}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSectionBlock(index)}
                              className="text-sm text-rose-600 hover:text-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {previewHtml ? (
                          <div
                            className="mt-2 text-sm text-slate-600 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: previewHtml }}
                          />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
          <button type="button" onClick={savePost} disabled={!canSave} className="button primary">
            Save Post
          </button>
          {currentPostId ? (
            <button type="button" onClick={deleteCurrentPost} className="button secondary">
              Delete Post
            </button>
          ) : null}
          {message ? <p className="status-message">{message}</p> : null}
          {deleteMessage ? <p className="status-message">{deleteMessage}</p> : null}
        </div>
        
      </section>
    </main>
  );
}
