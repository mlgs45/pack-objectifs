"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Heading2, Undo, Redo } from "lucide-react";
import { cn } from "@/lib/utils";

interface TipTapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  editable?: boolean;
}

export function TipTapEditor({
  content = "",
  onChange,
  placeholder = "Saisir du texte...",
  label,
  error,
  editable = true,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2",
      },
    },
  });

  if (!editor) return null;

  const ToolButton = ({
    onClick,
    active,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-1.5 rounded hover:bg-gray-200 transition-colors",
        active && "bg-gray-200 text-primary"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div
        className={cn(
          "rounded-lg border",
          error ? "border-error" : "border-gray-300",
          "focus-within:ring-2 focus-within:ring-primary-300 focus-within:border-primary"
        )}
      >
        {editable && (
          <div className="flex items-center gap-0.5 px-2 py-1 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <ToolButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
            >
              <Bold className="h-4 w-4" />
            </ToolButton>
            <ToolButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
            >
              <Italic className="h-4 w-4" />
            </ToolButton>
            <ToolButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive("heading", { level: 2 })}
            >
              <Heading2 className="h-4 w-4" />
            </ToolButton>
            <ToolButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
            >
              <List className="h-4 w-4" />
            </ToolButton>
            <ToolButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
            >
              <ListOrdered className="h-4 w-4" />
            </ToolButton>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <ToolButton onClick={() => editor.chain().focus().undo().run()}>
              <Undo className="h-4 w-4" />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().redo().run()}>
              <Redo className="h-4 w-4" />
            </ToolButton>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
