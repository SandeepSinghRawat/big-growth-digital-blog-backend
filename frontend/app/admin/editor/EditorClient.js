'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const defaultPost = {
  title: '',
  slug: '',
  summary: '',
  category: '',
  tags: [],
  status: 'draft',
  publishedAt: undefined,
  seo: { metaTitle: '', metaDescription: '', primaryKeyword: '', secondaryKeywords: [], canonicalUrl: '', openGraph: {} },
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
  const [blockType, setBlockType] = useState('paragraph');
  const [blockText, setBlockText] = useState('');
  const [blockHeadingLevel, setBlockHeadingLevel] = useState(2);
  const [blockHtml, setBlockHtml] = useState('');
  const [paragraphChildren, setParagraphChildren] = useState([]);
  const [childType, setChildType] = useState('text');
  const [childText, setChildText] = useState('');
  const [childHref, setChildHref] = useState('');
  const [childHeadingLevel, setChildHeadingLevel] = useState(3);
  const [childTableHeaders, setChildTableHeaders] = useState('');
  const [childTableRows, setChildTableRows] = useState('');
  const [childImageSrc, setChildImageSrc] = useState('');
  const [childImageAlt, setChildImageAlt] = useState('');
  const [childListStyle, setChildListStyle] = useState('unordered');
  const [childListItems, setChildListItems] = useState([]);
  const [childListItemText, setChildListItemText] = useState('');
  const [faqItems, setFaqItems] = useState([]);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [blockImageSrc, setBlockImageSrc] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [blockImageAlt, setBlockImageAlt] = useState('');
  const [blockImageFile, setBlockImageFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [blockHeaders, setBlockHeaders] = useState('');
  const [blockRows, setBlockRows] = useState('');
  const [blockStyle, setBlockStyle] = useState('unordered');
  const [blockItems, setBlockItems] = useState('');
  const [nestedListItems, setNestedListItems] = useState([]);
  const [nestedListInputs, setNestedListInputs] = useState({});
  const [listItemText, setListItemText] = useState('');
  const [childNestedListItems, setChildNestedListItems] = useState([]);
  const [childNestedListInputs, setChildNestedListInputs] = useState({});
  const [sectionChildNestedListItems, setSectionChildNestedListItems] = useState([]);
  const [sectionChildNestedListInputs, setSectionChildNestedListInputs] = useState({});
  const [sectionParagraphChildNestedListItems, setSectionParagraphChildNestedListItems] = useState([]);
  const [sectionParagraphChildNestedListInputs, setSectionParagraphChildNestedListInputs] = useState({});
  const [sectionHeadingText, setSectionHeadingText] = useState('');
  const [sectionHeadingLevel, setSectionHeadingLevel] = useState(2);
  const [sectionChildren, setSectionChildren] = useState([]);
  const [sectionChildType, setSectionChildType] = useState('paragraph');
  const [sectionChildText, setSectionChildText] = useState('');
  const [sectionChildHref, setSectionChildHref] = useState('');
  const [sectionChildHeadingLevel, setSectionChildHeadingLevel] = useState(3);
  const [sectionChildTableHeaders, setSectionChildTableHeaders] = useState('');
  const [sectionChildTableRows, setSectionChildTableRows] = useState('');
  const [sectionChildImageSrc, setSectionChildImageSrc] = useState('');
  const [sectionChildImageAlt, setSectionChildImageAlt] = useState('');
  const [sectionChildListStyle, setSectionChildListStyle] = useState('unordered');
  const [sectionChildListItems, setSectionChildListItems] = useState([]);
  const [sectionChildListItemText, setSectionChildListItemText] = useState('');
  const [sectionParagraphChildren, setSectionParagraphChildren] = useState([]);
  const [sectionParagraphChildType, setSectionParagraphChildType] = useState('text');
  const [sectionParagraphChildText, setSectionParagraphChildText] = useState('');
  const [sectionParagraphChildHref, setSectionParagraphChildHref] = useState('');
  const [sectionParagraphChildHeadingLevel, setSectionParagraphChildHeadingLevel] = useState(3);
  const [sectionParagraphChildTableHeaders, setSectionParagraphChildTableHeaders] = useState('');
  const [sectionParagraphChildTableRows, setSectionParagraphChildTableRows] = useState('');
  const [sectionParagraphChildImageSrc, setSectionParagraphChildImageSrc] = useState('');
  const [sectionParagraphChildImageAlt, setSectionParagraphChildImageAlt] = useState('');
  const [sectionParagraphChildListStyle, setSectionParagraphChildListStyle] = useState('unordered');
  const [sectionParagraphChildListItems, setSectionParagraphChildListItems] = useState([]);
  const [sectionParagraphChildListItemText, setSectionParagraphChildListItemText] = useState('');

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

  const addBlock = () => {
    let block = null;

    if (blockType === 'paragraph') {
      block = {
        type: 'paragraph',
        text: blockText || 'New paragraph'
      };
      if (paragraphChildren.length > 0) {
        block.children = paragraphChildren;
      }
    }

    if (blockType === 'heading') {
      block = { type: 'heading', level: blockHeadingLevel, text: blockText || 'Heading text' };
    }

    if (blockType === 'list') {
      const items = nestedListItems.length > 0
        ? nestedListItems
        : blockItems.split('\n').map((item) => item.trim()).filter(Boolean).map((text) => ({ text, children: [] }));
      block = {
        type: 'list',
        style: blockStyle,
        items
      };
    }

    if (blockType === 'table') {
      const { headers, rows } = parseTableInput(blockHeaders, blockRows);
      block = { type: 'table', headers, rows };
    }

    if (blockType === 'image') {
      block = {
        type: 'image',
        src: blockImageSrc || '',
        alt: blockImageAlt || ''
      };
    }

    if (blockType === 'section') {
      block = {
        type: 'section',
        heading: sectionHeadingText.trim() || undefined,
        headingLevel: sectionHeadingText ? sectionHeadingLevel : undefined,
        children: sectionChildren
      };
    }

    if (blockType === 'faq') {
      block = {
        type: 'faq',
        items: faqItems.map((item) => ({
          question: item.question,
          answer: item.answer
        }))
      };
    }

    if (blockType === 'html') {
      block = { type: 'html', html: blockHtml || '<p>Insert rich HTML, links, or tables here.</p>' };
    }

    if (!block) {
      return;
    }

    setBlocks((prevBlocks) => [...prevBlocks, block]);
    setBlockText('');
    setBlockHtml('');
    setBlockHeaders('');
    setBlockRows('');
    setBlockItems('');
    setParagraphChildren([]);
    setChildText('');
    setChildHref('');
    setChildTableHeaders('');
    setChildTableRows('');
    setChildImageSrc('');
    setChildImageAlt('');
    setChildListStyle('unordered');
    setChildListItems([]);
    setChildListItemText('');
    setSectionHeadingText('');
    setSectionHeadingLevel(2);
    setSectionChildren([]);
    setSectionChildType('paragraph');
    setSectionChildText('');
    setSectionChildHref('');
    setSectionChildHeadingLevel(3);
    setSectionChildTableHeaders('');
    setSectionChildTableRows('');
    setSectionChildImageSrc('');
    setSectionChildImageAlt('');
    setSectionChildListStyle('unordered');
    setSectionChildListItems([]);
    setSectionChildListItemText('');
    setSectionParagraphChildren([]);
    setSectionParagraphChildType('text');
    setSectionParagraphChildText('');
    setSectionParagraphChildHref('');
    setSectionParagraphChildHeadingLevel(3);
    setSectionParagraphChildTableHeaders('');
    setSectionParagraphChildTableRows('');
    setSectionParagraphChildImageSrc('');
    setSectionParagraphChildImageAlt('');
    setSectionParagraphChildListStyle('unordered');
    setSectionParagraphChildListItems([]);
    setSectionParagraphChildListItemText('');
    setFaqItems([]);
    setFaqQuestion('');
    setFaqAnswer('');
    setNestedListItems([]);
    setNestedListInputs({});
    setListItemText('');
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
          <label>
            Block type
            <select value={blockType} onChange={(event) => setBlockType(event.target.value)}>
              <option value="paragraph">Paragraph</option>
              <option value="heading">Heading</option>
              <option value="section">Section</option>
              <option value="list">List</option>
              <option value="table">Table</option>
              <option value="image">Image</option>
              <option value="faq">FAQ</option>
              <option value="html">HTML / links</option>
            </select>
          </label>
          {blockType === 'paragraph' && (
            <>
              <label>
                Paragraph text
                <textarea value={blockText} onChange={(event) => setBlockText(event.target.value)} />
              </label>
              <div className="nested-block-builder">
                <strong>Nested paragraph content</strong>
                <label>
                  Nested block type
                  <select value={childType} onChange={(event) => setChildType(event.target.value)}>
                    <option value="text">Text</option>
                    <option value="link">Link</option>
                    <option value="heading">Subheading</option>
                    <option value="table">Table</option>
                    <option value="image">Image</option>
                    <option value="list">List</option>
                  </select>
                </label>
                {childType !== 'list' && (
                  <label>
                    Text
                    <textarea value={childText} onChange={(event) => setChildText(event.target.value)} />
                  </label>
                )}
                {childType === 'link' && (
                  <label>
                    Link URL
                    <input value={childHref} onChange={(event) => setChildHref(event.target.value)} placeholder="https://example.com" />
                  </label>
                )}
                {childType === 'heading' && (
                  <label>
                    Heading level
                    <select value={childHeadingLevel} onChange={(event) => setChildHeadingLevel(Number(event.target.value))}>
                      {[3, 4, 5, 6].map((level) => (
                        <option key={level} value={level}>
                          H{level}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {childType === 'table' && (
                  <>
                    <label>
                      Table headers (comma separated)
                      <input value={childTableHeaders} onChange={(event) => setChildTableHeaders(event.target.value)} />
                    </label>
                    <label>
                      Table rows (one row per line, comma or tab separated)
                      <textarea value={childTableRows} onChange={(event) => setChildTableRows(event.target.value)} />
                    </label>
                  </>
                )}
                {childType === 'image' && (
                  <>
                    <label>
                      Image URL
                      <input value={childImageSrc} onChange={(event) => setChildImageSrc(event.target.value)} placeholder="https://example.com/image.jpg" />
                    </label>
                    <label>
                      Alt text
                      <input value={childImageAlt} onChange={(event) => setChildImageAlt(event.target.value)} />
                    </label>
                  </>
                )}
                {childType === 'list' && (
                  <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <label>
                      List style
                      <select value={childListStyle} onChange={(event) => setChildListStyle(event.target.value)}>
                        <option value="unordered">Unordered</option>
                        <option value="ordered">Ordered</option>
                      </select>
                    </label>
                    <label>
                      Item text
                      <input
                        value={childListItemText}
                        onChange={(event) => setChildListItemText(event.target.value)}
                        placeholder="Enter item text"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            addChildListItem();
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={addChildListItem}
                    >
                      Add list item
                    </button>
                    {childNestedListItems.length > 0 ? (
                      <div>
                        <strong className="block mb-2">Current nested list</strong>
                        {renderListItemUI(childNestedListItems, [], {
                          getInputValue: getChildNestedListInputValue,
                          setInputValue: setChildNestedListInputValue,
                          addItem: addChildNestedListItem,
                          updateItemText: updateChildNestedListItemText,
                          removeItem: removeChildListItem,
                          defaultStyle: childListStyle
                        })}
                      </div>
                    ) : childListItems.length > 0 ? (
                      <div>
                        <strong className="block mb-2">Current items</strong>
                        <ul className="list-disc pl-5 text-slate-700">
                          {childListItems.map((item, index) => (
                            <li key={index}>{item.text}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                )}
                <button type="button" onClick={addParagraphChild} className="button secondary">
                  Add Nested Child
                </button>
                {paragraphChildren.length > 0 && (
                  <div className="nested-block-list">
                    <strong>Current nested content</strong>
                    <ul>
                      {paragraphChildren.map((child, index) => (
                        <li key={index} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                          <span>{child.type}: {child.text || child.href || child.src || 'content'}</span>
                          <button
                            type="button"
                            className="button small secondary"
                            onClick={() => removeParagraphChild(index)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
          {blockType === 'heading' && (
            <>
              <label>
                Heading text
                <textarea value={blockText} onChange={(event) => setBlockText(event.target.value)} />
              </label>
              <label>
                Heading level
                <select value={blockHeadingLevel} onChange={(event) => setBlockHeadingLevel(Number(event.target.value))}>
                  {[2, 3, 4, 5, 6].map((level) => (
                    <option key={level} value={level}>
                      H{level}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          {blockType === 'section' && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <label>
                Section heading (optional)
                <input
                  value={sectionHeadingText}
                  onChange={(event) => setSectionHeadingText(event.target.value)}
                  placeholder="Section title"
                />
              </label>
              {sectionHeadingText ? (
                <label>
                  Heading level
                  <select value={sectionHeadingLevel} onChange={(event) => setSectionHeadingLevel(Number(event.target.value))}>
                    {[2, 3, 4, 5, 6].map((level) => (
                      <option key={level} value={level}>
                        H{level}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <strong className="mb-3 block">Add section content</strong>
                <label>
                  Content type
                  <select value={sectionChildType} onChange={(event) => setSectionChildType(event.target.value)}>
                    <option value="paragraph">Paragraph</option>
                    <option value="heading">Heading</option>
                    <option value="list">List</option>
                    <option value="table">Table</option>
                    <option value="image">Image</option>
                  </select>
                </label>
                {sectionChildType === 'paragraph' && (
                  <>
                    <label>
                      Paragraph text
                      <textarea value={sectionChildText} onChange={(event) => setSectionChildText(event.target.value)} />
                    </label>
                    <div className="nested-block-builder rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <strong className="block mb-3">Nested paragraph content</strong>
                      <label>
                        Nested block type
                        <select value={sectionParagraphChildType} onChange={(event) => setSectionParagraphChildType(event.target.value)}>
                          <option value="text">Text</option>
                          <option value="link">Link</option>
                          <option value="heading">Subheading</option>
                          <option value="table">Table</option>
                          <option value="image">Image</option>
                          <option value="list">List</option>
                        </select>
                      </label>
                      {sectionParagraphChildType !== 'list' && (
                        <label>
                          Text
                          <textarea
                            value={sectionParagraphChildText}
                            onChange={(event) => setSectionParagraphChildText(event.target.value)}
                          />
                        </label>
                      )}
                      {sectionParagraphChildType === 'link' && (
                        <label>
                          Link URL
                          <input
                            value={sectionParagraphChildHref}
                            onChange={(event) => setSectionParagraphChildHref(event.target.value)}
                            placeholder="https://example.com"
                          />
                        </label>
                      )}
                      {sectionParagraphChildType === 'heading' && (
                        <label>
                          Heading level
                          <select
                            value={sectionParagraphChildHeadingLevel}
                            onChange={(event) => setSectionParagraphChildHeadingLevel(Number(event.target.value))}
                          >
                            {[3, 4, 5, 6].map((level) => (
                              <option key={level} value={level}>
                                H{level}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      {sectionParagraphChildType === 'table' && (
                        <>
                          <label>
                            Table headers (comma separated)
                            <input
                              value={sectionParagraphChildTableHeaders}
                              onChange={(event) => setSectionParagraphChildTableHeaders(event.target.value)}
                            />
                          </label>
                          <label>
                            Table rows (one row per line, comma or tab separated)
                            <textarea
                              value={sectionParagraphChildTableRows}
                              onChange={(event) => setSectionParagraphChildTableRows(event.target.value)}
                            />
                          </label>
                        </>
                      )}
                      {sectionParagraphChildType === 'image' && (
                        <>
                          <label>
                            Image URL
                            <input
                              value={sectionParagraphChildImageSrc}
                              onChange={(event) => setSectionParagraphChildImageSrc(event.target.value)}
                              placeholder="https://example.com/image.jpg"
                            />
                          </label>
                          <label>
                            Alt text
                            <input
                              value={sectionParagraphChildImageAlt}
                              onChange={(event) => setSectionParagraphChildImageAlt(event.target.value)}
                            />
                          </label>
                        </>
                      )}
                      {sectionParagraphChildType === 'list' && (
                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                          <label>
                            List style
                            <select
                              value={sectionParagraphChildListStyle}
                              onChange={(event) => setSectionParagraphChildListStyle(event.target.value)}
                            >
                              <option value="unordered">Unordered</option>
                              <option value="ordered">Ordered</option>
                            </select>
                          </label>
                          <label>
                            Item text
                            <input
                              value={sectionParagraphChildListItemText}
                              onChange={(event) => setSectionParagraphChildListItemText(event.target.value)}
                              placeholder="Enter item text"
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  addSectionParagraphChildListItem();
                                }
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            className="button secondary"
                            onClick={addSectionParagraphChildListItem}
                          >
                            Add nested list item
                          </button>
                          {sectionParagraphChildNestedListItems.length > 0 ? (
                            <div>
                              <strong className="block mb-2">Current nested list</strong>
                              {renderListItemUI(sectionParagraphChildNestedListItems, [], {
                                getInputValue: getSectionParagraphChildNestedListInputValue,
                                setInputValue: setSectionParagraphChildNestedListInputValue,
                                addItem: addSectionParagraphChildNestedListItem,
                                updateItemText: updateSectionParagraphChildNestedListItemText,
                                removeItem: removeSectionParagraphChildListItem,
                                defaultStyle: sectionParagraphChildListStyle
                              })}
                            </div>
                          ) : sectionParagraphChildListItems.length > 0 ? (
                            <ul className="list-disc pl-5 text-slate-700">
                              {sectionParagraphChildListItems.map((item, index) => (
                                <li key={index}>{item.text}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      )}
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => {
                          let child = null;
                          if (sectionParagraphChildType === 'text') {
                            child = { type: 'text', text: sectionParagraphChildText || 'Text' };
                          }
                          if (sectionParagraphChildType === 'link') {
                            child = {
                              type: 'link',
                              text: sectionParagraphChildText || 'Link text',
                              href: sectionParagraphChildHref || 'https://'
                            };
                          }
                          if (sectionParagraphChildType === 'heading') {
                            child = {
                              type: 'heading',
                              level: sectionParagraphChildHeadingLevel,
                              text: sectionParagraphChildText || 'Subheading'
                            };
                          }
                          if (sectionParagraphChildType === 'table') {
                            const { headers, rows } = parseTableInput(sectionParagraphChildTableHeaders, sectionParagraphChildTableRows);
                            child = { type: 'table', headers, rows };
                          }
                          if (sectionParagraphChildType === 'image') {
                            child = { type: 'image', src: sectionParagraphChildImageSrc || '', alt: sectionParagraphChildImageAlt || '' };
                          }
                          if (sectionParagraphChildType === 'list') {
                            child = {
                              type: 'list',
                              style: sectionParagraphChildListStyle,
                              items: sectionParagraphChildNestedListItems.length > 0 ? sectionParagraphChildNestedListItems : sectionParagraphChildListItems
                            };
                          }
                          if (!child) return;
                          setSectionParagraphChildren((prev) => [...prev, child]);
                          setSectionParagraphChildText('');
                          setSectionParagraphChildHref('');
                          setSectionParagraphChildTableHeaders('');
                          setSectionParagraphChildTableRows('');
                          setSectionParagraphChildImageSrc('');
                          setSectionParagraphChildImageAlt('');
                          setSectionParagraphChildListStyle('unordered');
                          setSectionParagraphChildListItems([]);
                          setSectionParagraphChildNestedListItems([]);
                          setSectionParagraphChildNestedListInputs({});
                          setSectionParagraphChildListItemText('');
                        }}
                      >
                        Add nested child
                      </button>
                      {sectionParagraphChildren.length > 0 && (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <strong className="block mb-2">Current nested paragraph children</strong>
                          <ul className="space-y-2">
                            {sectionParagraphChildren.map((child, index) => (
                              <li key={index} className="rounded-xl border border-slate-200 bg-white p-3">
                                {child.type}: {child.text || child.href || child.src || 'content'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {sectionChildType === 'heading' && (
                  <>
                    <label>
                      Heading text
                      <textarea value={sectionChildText} onChange={(event) => setSectionChildText(event.target.value)} />
                    </label>
                    <label>
                      Heading level
                      <select value={sectionChildHeadingLevel} onChange={(event) => setSectionChildHeadingLevel(Number(event.target.value))}>
                        {[2, 3, 4, 5, 6].map((level) => (
                          <option key={level} value={level}>
                            H{level}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                )}
                {sectionChildType === 'list' && (
                  <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <label>
                      List style
                      <select value={sectionChildListStyle} onChange={(event) => setSectionChildListStyle(event.target.value)}>
                        <option value="unordered">Unordered</option>
                        <option value="ordered">Ordered</option>
                      </select>
                    </label>
                    <label>
                      Item text
                      <input
                        value={sectionChildListItemText}
                        onChange={(event) => setSectionChildListItemText(event.target.value)}
                        placeholder="Enter item text"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            addSectionChildListItem();
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={addSectionChildListItem}
                    >
                      Add list item
                    </button>
                    {sectionChildNestedListItems.length > 0 ? (
                      <div>
                        <strong className="block mb-2">Current nested list</strong>
                        {renderListItemUI(sectionChildNestedListItems, [], {
                          getInputValue: getSectionChildNestedListInputValue,
                          setInputValue: setSectionChildNestedListInputValue,
                          addItem: addSectionChildNestedListItem,
                          updateItemText: updateSectionChildNestedListItemText,
                          removeItem: removeSectionChildListItem,
                          defaultStyle: sectionChildListStyle
                        })}
                      </div>
                    ) : sectionChildListItems.length > 0 ? (
                      <ul className="list-disc pl-5 text-slate-700">
                        {sectionChildListItems.map((item, index) => (
                          <li key={index}>{item.text}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )}
                {sectionChildType === 'table' && (
                  <>
                    <label>
                      Table headers (comma separated)
                      <input value={sectionChildTableHeaders} onChange={(event) => setSectionChildTableHeaders(event.target.value)} />
                    </label>
                    <label>
                      Table rows (one row per line, comma or tab separated)
                      <textarea value={sectionChildTableRows} onChange={(event) => setSectionChildTableRows(event.target.value)} />
                    </label>
                  </>
                )}
                {sectionChildType === 'image' && (
                  <>
                    <label>
                      Image URL
                      <input value={sectionChildImageSrc} onChange={(event) => setSectionChildImageSrc(event.target.value)} placeholder="https://example.com/image.jpg" />
                    </label>
                    <label>
                      Alt text
                      <input value={sectionChildImageAlt} onChange={(event) => setSectionChildImageAlt(event.target.value)} />
                    </label>
                  </>
                )}
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    let child = null;
                    if (sectionChildType === 'paragraph') {
                      child = {
                        type: 'paragraph',
                        text: sectionChildText || 'New paragraph',
                        children: sectionParagraphChildren.length > 0 ? sectionParagraphChildren : []
                      };
                    }
                    if (sectionChildType === 'heading') {
                      child = {
                        type: 'heading',
                        level: sectionChildHeadingLevel,
                        text: sectionChildText || 'Heading text'
                      };
                    }
                    if (sectionChildType === 'list') {
                      child = {
                        type: 'list',
                        style: sectionChildListStyle,
                        items: sectionChildNestedListItems.length > 0 ? sectionChildNestedListItems : sectionChildListItems
                      };
                    }
                    if (sectionChildType === 'table') {
                      const { headers, rows } = parseTableInput(sectionChildTableHeaders, sectionChildTableRows);
                      child = { type: 'table', headers, rows };
                    }
                    if (sectionChildType === 'image') {
                      child = { type: 'image', src: sectionChildImageSrc || '', alt: sectionChildImageAlt || '' };
                    }
                    if (!child) return;
                    setSectionChildren((prev) => [...prev, child]);
                    setSectionChildText('');
                    setSectionChildHref('');
                    setSectionChildTableHeaders('');
                    setSectionChildTableRows('');
                    setSectionChildImageSrc('');
                    setSectionChildImageAlt('');
                    setSectionChildListStyle('unordered');
                    setSectionChildListItems([]);
                    setSectionChildNestedListItems([]);
                    setSectionChildNestedListInputs({});
                    setSectionChildListItemText('');
                    setSectionParagraphChildren([]);
                  }}
                >
                  Add section content
                </button>
                {sectionChildren.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <strong className="block mb-2">Current section content</strong>
                    <ul className="space-y-2">
                      {sectionChildren.map((child, index) => (
                        <li key={index} className="rounded-xl border border-slate-200 bg-white p-3">
                          {child.type}: {child.text || child.href || child.src || 'content'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          {blockType === 'list' && (
            <div className="space-y-4">
              <label>
                List style
                <select value={blockStyle} onChange={(event) => setBlockStyle(event.target.value)}>
                  <option value="unordered">Unordered</option>
                  <option value="ordered">Ordered</option>
                </select>
              </label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <strong className="mb-3 block">Build nested list structure</strong>
                <label className="mb-3 block">
                  Item text
                  <input
                    value={listItemText}
                    onChange={(event) => setListItemText(event.target.value)}
                    placeholder="Enter list item text"
                    onKeyPress={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addListItem();
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="button secondary mb-4"
                  onClick={addListItem}
                >
                  Add Item
                </button>
                {nestedListItems.length > 0 ? (
                  <div className="space-y-2">
                    <strong className="block">List structure</strong>
                    {renderListItemUI(nestedListItems)}
                  </div>
                ) : null}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <strong className="mb-2 block">Or paste flat list (one per line)</strong>
                <label>
                  Items
                  <textarea
                    value={blockItems}
                    onChange={(event) => setBlockItems(event.target.value)}
                    placeholder="item 1&#10;item 2&#10;item 3"
                  />
                </label>
              </div>
            </div>
          )}
          {blockType === 'table' && (
            <>
              <label>
                Table headers (comma separated)
                <input value={blockHeaders} onChange={(event) => setBlockHeaders(event.target.value)} />
              </label>
              <label>
                Table rows (one row per line, comma or tab separated)
                <textarea value={blockRows} onChange={(event) => setBlockRows(event.target.value)} />
              </label>
            </>
          )}
          {blockType === 'faq' && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <label>
                Question
                <input
                  value={faqQuestion}
                  onChange={(event) => setFaqQuestion(event.target.value)}
                  placeholder="What is this FAQ about?"
                />
              </label>
              <label>
                Answer
                <textarea
                  value={faqAnswer}
                  onChange={(event) => setFaqAnswer(event.target.value)}
                  placeholder="Write the answer here."
                />
              </label>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  if (!faqQuestion.trim() || !faqAnswer.trim()) {
                    return;
                  }
                  setFaqItems((prev) => [...prev, { question: faqQuestion.trim(), answer: faqAnswer.trim() }]);
                  setFaqQuestion('');
                  setFaqAnswer('');
                }}
              >
                Add FAQ item
              </button>
              {faqItems.length > 0 ? (
                <div className="space-y-3">
                  <strong>FAQ items</strong>
                  <ul className="space-y-2">
                    {faqItems.map((item, index) => (
                      <li key={index} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">Q: {item.question}</p>
                            <p className="text-slate-600">A: {item.answer}</p>
                          </div>
                          <button
                            type="button"
                            className="button small secondary"
                            onClick={() => setFaqItems((prev) => prev.filter((_, idx) => idx !== index))}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
          {blockType === 'image' && (
            <>
              <label>
                Image URL
                <input
                  value={blockImageSrc}
                  onChange={(event) => setBlockImageSrc(event.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </label>
              <label>
                Alt text
                <input value={blockImageAlt} onChange={(event) => setBlockImageAlt(event.target.value)} />
              </label>
              <label>
                Upload image file
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setBlockImageFile(event.target.files?.[0] || null)}
                />
              </label>
              <button type="button" onClick={uploadImageFile} className="button secondary">
                Upload Image
              </button>
              {uploadMessage ? <p className="status-message">{uploadMessage}</p> : null}
            </>
          )}
          {blockType === 'html' && (
            <label>
              HTML content
              <textarea
                value={blockHtml}
                onChange={(event) => setBlockHtml(event.target.value)}
                placeholder={'<p><a href="https://example.com">Link text</a></p>'}
              />
            </label>
          )}
          <button type="button" onClick={addBlock} className="button secondary">
            Add Block
          </button>
          <div className="block-preview">
            <h3>Block preview</h3>
            {blocks.map((block, index) => (
              <div key={index} className="block-item rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <strong>{block.type}</strong>
                  <button
                    type="button"
                    className="button small secondary"
                    onClick={() => removeBlock(index)}
                  >
                    Remove
                  </button>
                </div>
                <pre className="overflow-x-auto text-xs">{JSON.stringify(block, null, 2)}</pre>
              </div>
            ))}
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
