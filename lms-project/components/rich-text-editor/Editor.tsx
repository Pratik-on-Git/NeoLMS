"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { TextStyle } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import FontFamily from "@tiptap/extension-font-family";
import Placeholder from "@tiptap/extension-placeholder";
import { Menubar } from "./Menubar";

interface FieldValue {
  value?: string;
  onChange?: (value: string) => void;
}

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
  field?: FieldValue;
}

export default function RichTextEditor({
  content = "",
  onChange,
  editable = true,
  placeholder = "Start typing...",
  field,
}: RichTextEditorProps) {
  let initialContent = content;
  if (field) {
    if (field.value) {
      try {
        initialContent = JSON.parse(field.value);
      } catch {
        initialContent = "<p>Start typing...</p>";
      }
    } else {
      initialContent = "<p>Start typing...</p>";
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // We'll add Heading explicitly
        bulletList: false, // We'll add BulletList explicitly
        orderedList: false, // We'll add OrderedList explicitly
        listItem: false, // We'll add ListItem explicitly
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      TextStyle,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
        defaultAlignment: "left",
      }),
      Underline,
      FontFamily.configure({ types: ["textStyle"] }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: initialContent,
    editable,
    editorProps: {
      attributes: {
        class:
          "min-h-[250px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert !w-full !max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (field) {
        field.onChange?.(JSON.stringify(editor.getJSON()));
      } else {
        onChange?.(editor.getHTML());
      }
    },
    immediatelyRender: false,
  });

  return (
    <div className="w-full border border-input rounded-lg overflow-hidden dark:bg-input/30">
      <Menubar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}