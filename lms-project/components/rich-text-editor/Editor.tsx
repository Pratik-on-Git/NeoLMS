"use client"

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Menubar } from './Menubar'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import FontFamily from '@tiptap/extension-font-family'

interface FieldValue {
    value?: string
    onChange?: (value: string) => void
}


interface RichTextEditorProps {
    content?: string
    onChange?: (content: string) => void
    editable?: boolean
    placeholder?: string
    field?: FieldValue
}

export default function RichTextEditor({ 
    content = '', 
    onChange,
    editable = true,
    placeholder = 'Start typing...',
    field
}: RichTextEditorProps) {
    let initialContent = content;
    if (field) {
        if (field.value) {
            try {
                initialContent = JSON.parse(field.value);
            } catch (e) {
                initialContent = '<p>Start typing...</p>';
            }
        } else {
            initialContent = '<p>Start typing...</p>';
        }
    }

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                paragraph: {
                    HTMLAttributes: {
                        class: 'prose-p',
                    },
                },
                underline: false,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right'],
                defaultAlignment: 'left',
            }),
            Underline,
            FontFamily.configure({
                types: ['textStyle'],
            }),
            Placeholder.configure({
                placeholder: placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content: initialContent,
        editable: editable,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "min-h-[250px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert !w-full !max-w-none",
            },
        },
        onUpdate: ({ editor }) => {
            if (field) {
                field.onChange?.(JSON.stringify(editor.getJSON()))
            } else {
                onChange?.(editor.getHTML())
            }
        },
    })

    return (
        <div className='w-full border border-input rounded-lg overflow-hidden dark:bg-input/30'>
            <Menubar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}