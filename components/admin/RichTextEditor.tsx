'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
};

function looksLikeHtml(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.startsWith('<') && trimmed.includes('>');
}

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toEditorHtml(content: string): string {
  if (!content.trim()) return '<p><br></p>';
  if (looksLikeHtml(content)) return content;
  return `<p>${escapeHtml(content).replaceAll('\n', '<br>')}</p>`;
}

type EditorState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  unorderedList: boolean;
  orderedList: boolean;
  justifyLeft: boolean;
  justifyCenter: boolean;
  justifyRight: boolean;
};

const EMPTY_EDITOR_STATE: EditorState = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  unorderedList: false,
  orderedList: false,
  justifyLeft: false,
  justifyCenter: false,
  justifyRight: false,
};

export function RichTextEditor({ value, onChange, minHeight = 260 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef(false);
  const savedRangeRef = useRef<Range | null>(null);
  const [editorState, setEditorState] = useState<EditorState>(EMPTY_EDITOR_STATE);
  const [heading, setHeading] = useState('P');

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const next = toEditorHtml(value);
    if (editor.innerHTML !== next) {
      syncingRef.current = true;
      editor.innerHTML = next;
      syncingRef.current = false;
    }
  }, [value]);

  const updateCommandState = () => {
    setEditorState({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      unorderedList: document.queryCommandState('insertUnorderedList'),
      orderedList: document.queryCommandState('insertOrderedList'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
    });
    const block = document.queryCommandValue('formatBlock');
    if (typeof block === 'string' && block) {
      const next = block.replace(/[<>]/g, '').toUpperCase();
      setHeading(next);
    }
  };

  const saveSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    const range = savedRangeRef.current;
    if (!selection || !range) return;
    selection.removeAllRanges();
    selection.addRange(range);
  };

  useEffect(() => {
    const handleSelection = () => {
      const editor = editorRef.current;
      if (!editor) return;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      if (editor.contains(selection.anchorNode)) {
        saveSelection();
        updateCommandState();
      }
    };
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const emitChange = () => {
    const editor = editorRef.current;
    if (!editor || syncingRef.current) return;
    onChange(editor.innerHTML);
    updateCommandState();
  };

  const run = (command: string, valueArg?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    restoreSelection();
    document.execCommand(command, false, valueArg);
    saveSelection();
    emitChange();
  };

  const setBlock = (tag: 'P' | 'H1' | 'H2' | 'H3' | 'BLOCKQUOTE') => run('formatBlock', tag);

  const addLink = () => {
    const url = window.prompt('បញ្ចូល URL');
    if (!url) return;
    run('createLink', url.trim());
  };

  const wordCount = useMemo(() => {
    const text = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return 0;
    return text.split(' ').length;
  }, [value]);

  const buttonClass =
    'h-8 min-w-8 rounded-md border border-transparent px-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60';
  const activeClass = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
  const groupClass =
    'flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 px-1 py-1';

  return (
    <div className="rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50/70 dark:bg-gray-900/40 overflow-hidden shadow-sm">
      <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2 p-2">
          <div className={groupClass}>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => run('undo')} className={buttonClass} title="Undo">
              ↶
            </button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => run('redo')} className={buttonClass} title="Redo">
              ↷
            </button>
          </div>

          <div className={groupClass}>
            <select
              value={heading}
              onChange={(e) => setBlock(e.target.value as 'P' | 'H1' | 'H2' | 'H3' | 'BLOCKQUOTE')}
              className="h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 text-xs text-gray-700 dark:text-gray-300"
            >
              <option value="P">Paragraph</option>
              <option value="H1">Heading 1</option>
              <option value="H2">Heading 2</option>
              <option value="H3">Heading 3</option>
              <option value="BLOCKQUOTE">Quote</option>
            </select>
          </div>

          <div className={groupClass}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run('bold')}
              className={`${buttonClass} ${editorState.bold ? activeClass : ''}`}
              title="Bold"
            >
              <span className="font-bold">B</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run('italic')}
              className={`${buttonClass} ${editorState.italic ? activeClass : ''}`}
              title="Italic"
            >
              <span className="italic">I</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run('underline')}
              className={`${buttonClass} ${editorState.underline ? activeClass : ''}`}
              title="Underline"
            >
              <span className="underline">U</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run('strikeThrough')}
              className={`${buttonClass} ${editorState.strikeThrough ? activeClass : ''}`}
              title="Strike"
            >
              <span className="line-through">S</span>
            </button>
          </div>

          <div className={groupClass}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run('insertUnorderedList')}
              className={`${buttonClass} ${editorState.unorderedList ? activeClass : ''}`}
              title="Bullet list"
            >
              • List
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run('insertOrderedList')}
              className={`${buttonClass} ${editorState.orderedList ? activeClass : ''}`}
              title="Numbered list"
            >
              1. List
            </button>
          </div>

          <div className={groupClass}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run('justifyLeft')}
              className={`${buttonClass} ${editorState.justifyLeft ? activeClass : ''}`}
              title="Align left"
            >
              ⬅
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run('justifyCenter')}
              className={`${buttonClass} ${editorState.justifyCenter ? activeClass : ''}`}
              title="Align center"
            >
              ↔
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run('justifyRight')}
              className={`${buttonClass} ${editorState.justifyRight ? activeClass : ''}`}
              title="Align right"
            >
              ➡
            </button>
          </div>

          <div className={groupClass}>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={addLink} className={buttonClass} title="Insert link">
              Link
            </button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => run('unlink')} className={buttonClass} title="Remove link">
              Unlink
            </button>
          </div>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={emitChange}
        onKeyUp={updateCommandState}
        onMouseUp={updateCommandState}
        onBlur={saveSelection}
        className="w-full px-6 py-5 text-gray-900 dark:text-white focus:outline-none prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-gray-900"
        style={{ minHeight }}
        suppressContentEditableWarning
      />

      <div className="flex items-center justify-end px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <span className="text-xs text-gray-500 dark:text-gray-400">{wordCount} words</span>
      </div>
    </div>
  );
}
