import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote, Code } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[#dfe1e6] bg-gray-50/50 p-1.5 dark:border-white/10 dark:bg-black/20">
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
        className={`rounded p-1.5 hover:bg-[#dfe1e6] dark:hover:bg-white/10 ${editor.isActive('bold') ? 'bg-[#dfe1e6] text-blue-600 dark:bg-white/20' : 'text-gray-600 dark:text-gray-300'}`}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
        className={`rounded p-1.5 hover:bg-[#dfe1e6] dark:hover:bg-white/10 ${editor.isActive('italic') ? 'bg-[#dfe1e6] text-blue-600 dark:bg-white/20' : 'text-gray-600 dark:text-gray-300'}`}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </button>
      <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-700" />
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
        className={`rounded p-1.5 hover:bg-[#dfe1e6] dark:hover:bg-white/10 ${editor.isActive('bulletList') ? 'bg-[#dfe1e6] text-blue-600 dark:bg-white/20' : 'text-gray-600 dark:text-gray-300'}`}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
        className={`rounded p-1.5 hover:bg-[#dfe1e6] dark:hover:bg-white/10 ${editor.isActive('orderedList') ? 'bg-[#dfe1e6] text-blue-600 dark:bg-white/20' : 'text-gray-600 dark:text-gray-300'}`}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-700" />
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
        className={`rounded p-1.5 hover:bg-[#dfe1e6] dark:hover:bg-white/10 ${editor.isActive('blockquote') ? 'bg-[#dfe1e6] text-blue-600 dark:bg-white/20' : 'text-gray-600 dark:text-gray-300'}`}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleCodeBlock().run(); }}
        className={`rounded p-1.5 hover:bg-[#dfe1e6] dark:hover:bg-white/10 ${editor.isActive('codeBlock') ? 'bg-[#dfe1e6] text-blue-600 dark:bg-white/20' : 'text-gray-600 dark:text-gray-300'}`}
        title="Code Block"
      >
        <Code className="h-4 w-4" />
      </button>
    </div>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder = 'Write something...', readOnly = false }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] p-4',
      },
    },
  });

  return (
    <div className={`overflow-hidden rounded-md border ${readOnly ? 'border-transparent bg-transparent' : 'border-[#dfe1e6] bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:border-white/10 dark:bg-black/20'}`}>
      {!readOnly && <MenuBar editor={editor} />}
      <div className={readOnly ? '' : 'cursor-text'} onClick={() => !readOnly && editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
