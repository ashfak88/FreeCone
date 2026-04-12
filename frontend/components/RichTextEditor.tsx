"use client";

import React from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-primary/10 animate-pulse flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined text-slate-300 animate-spin">progress_activity</span>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Editor...</p>
      </div>
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write something amazing...",
  className = "",
}) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "link",
  ];

  return (
    <div className={`rich-text-editor-container ${className}`}>
      <style jsx global>{`
        .rich-text-editor-container .ql-container {
          border-bottom-left-radius: 2rem;
          border-bottom-right-radius: 2rem;
          background: transparent;
          font-family: inherit;
          font-size: 1rem;
          min-h: 200px;
        }
        .rich-text-editor-container .ql-toolbar {
          border-top-left-radius: 2rem;
          border-top-right-radius: 2rem;
          background: rgba(var(--primary-rgb), 0.05);
          border-color: rgba(var(--primary-rgb), 0.1) !important;
          padding: 12px 24px !important;
        }
        .rich-text-editor-container .ql-container {
          border-color: rgba(var(--primary-rgb), 0.1) !important;
          min-height: 250px;
        }
        .rich-text-editor-container .ql-editor {
          min-height: 250px;
          padding: 24px;
          line-height: 1.6;
        }
        .rich-text-editor-container .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
          font-weight: 500;
          left: 24px;
        }
        /* Dark mode overrides */
        .dark .rich-text-editor-container .ql-toolbar {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .dark .rich-text-editor-container .ql-container {
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #f1f5f9;
        }
        .dark .rich-text-editor-container .ql-stroke {
          stroke: #94a3b8;
        }
        .dark .rich-text-editor-container .ql-fill {
          fill: #94a3b8;
        }
        .dark .rich-text-editor-container .ql-picker {
          color: #94a3b8;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
