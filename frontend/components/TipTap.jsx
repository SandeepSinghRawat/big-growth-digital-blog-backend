'use client';

import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import Underline from '@tiptap/extension-underline';
import { TableKit } from '@tiptap/extension-table';
import Paragraph from '@tiptap/extension-paragraph';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect } from 'react';
import UnderLine from './TipTapComponents/Underline';
import List from './TipTapComponents/List';
import Heading from './TipTapComponents/Heading';
import Table from './TipTapComponents/Table';
import EditorImage from './TipTapComponents/EditorImage';

function getActiveHeadingLevel(editor) {
  if (!editor) {
    return 0;
  }
  for (const level of [1, 2, 3]) {
    if (editor.isActive('heading', { level })) {
      return level;
    }
  }
  return editor.isActive('paragraph') ? 0 : null;
}

const Tiptap = ({ featuredImage = '', onFeaturedImageChange, coverAlt = '', content = '<p></p>', onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline.configure({
        HTMLAttributes: {},
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc pl-6',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal pl-6',
        },
      }),
      ListItem,
      TableKit,
      Image.configure({
        HTMLAttributes: {
          class: 'content-image rounded-2xl',
        },
      }),
      Paragraph,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'underline text-blue-500',
        },
        defaultProtocol: 'https',
        protocols: ['http', 'https'],
        isAllowedUri: (url, ctx) => {
          try {
            const parsedUrl = url.includes(':')
              ? new URL(url)
              : new URL(`${ctx.defaultProtocol}://${url}`);

            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false;
            }

            const disallowedProtocols = ['ftp', 'file', 'mailto'];
            const protocol = parsedUrl.protocol.replace(':', '');

            if (disallowedProtocols.includes(protocol)) {
              return false;
            }

            const allowedProtocols = ctx.protocols.map((p) => (typeof p === 'string' ? p : p.scheme));

            if (!allowedProtocols.includes(protocol)) {
              return false;
            }

            const disallowedDomains = ['example-phishing.com', 'malicious-site.net'];
            const domain = parsedUrl.hostname;

            if (disallowedDomains.includes(domain)) {
              return false;
            }

            return true;
          } catch {
            return false;
          }
        },
        shouldAutoLink: (url) => {
          try {
            const parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`);
            const disallowedDomains = ['example-no-autolink.com', 'another-no-autolink.com'];
            const domain = parsedUrl.hostname;

            return !disallowedDomains.includes(domain);
          } catch {
            return false;
          }
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'editor-panel min-h-[280px]',
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextContent = content || '<p></p>';
    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, false);
    }
  }, [editor, content]);

  const toggleLink = useCallback(() => {
    if (!editor) {
      return;
    }

    const link = editor.isActive('link');
    if (link) {
      editor.chain().focus().extendMarkRange().unsetLink().run();
      return;
    }

    const url = window.prompt('URL');
    if (!url) {
      return;
    }
    editor.chain().focus().extendMarkRange().setLink({ href: url }).run();
  }, [editor]);

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isLink: ctx.editor ? ctx.editor.isActive('link') : false,
      isBold: ctx.editor ? ctx.editor.isActive('bold') : false,
      isUnderline: ctx.editor ? ctx.editor.isActive('underline') : false,
      isBulletList: ctx.editor ? ctx.editor.isActive('bulletList') : false,
      isOrderedList: ctx.editor ? ctx.editor.isActive('orderedList') : false,
      isInTable: ctx.editor ? ctx.editor.isActive('table') : false,
      activeHeadingLevel: getActiveHeadingLevel(ctx.editor),
    }),
  });

  if (!editor) {
    return null;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-1">
        <div className="button-group">
          <button
            type="button"
            className={editorState.isBold ? 'bg-gray-900 text-blue-400' : ''}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </button>
        </div>
        <div className="button-group">
          <button
            type="button"
            onClick={toggleLink}
            className={editorState.isLink ? 'bg-gray-900 text-blue-400' : ''}
          >
            <strong>L</strong>
          </button>
        </div>
        <UnderLine isUnderline={editorState.isUnderline} editor={editor} />
        <Heading editor={editor} activeLevel={editorState.activeHeadingLevel} />
        <List
          editor={editor}
          isBulletList={editorState.isBulletList}
          isOrderedList={editorState.isOrderedList}
        />
        <Table editor={editor} isInTable={editorState.isInTable} />
        <EditorImage editor={editor} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;
