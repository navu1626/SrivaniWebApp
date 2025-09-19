import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter description...',
  className = '',
  disabled = false,
  label,
  error
}) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'indent',
    'align',
    'link', 'image'
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-maroon-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          style={{
            backgroundColor: disabled ? '#f9fafb' : 'white',
          }}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          border: 1px solid #d1d5db;
          border-bottom: none;
          border-radius: 0.5rem 0.5rem 0 0;
          background-color: #f9fafb;
        }
        
        .rich-text-editor .ql-container {
          border: 1px solid #d1d5db;
          border-radius: 0 0 0.5rem 0.5rem;
          font-family: inherit;
        }
        
        .rich-text-editor .ql-editor {
          min-height: 120px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #6b7280;
        }
        
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: #6b7280;
        }
        
        .rich-text-editor .ql-toolbar button:hover .ql-stroke {
          stroke: #374151;
        }
        
        .rich-text-editor .ql-toolbar button:hover .ql-fill {
          fill: #374151;
        }
        
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #f59e0b;
        }
        
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #f59e0b;
        }
        
        .rich-text-editor .ql-snow .ql-picker.ql-expanded .ql-picker-label {
          border-color: #f59e0b;
        }
        
        .rich-text-editor .ql-snow .ql-picker.ql-expanded .ql-picker-options {
          border-color: #f59e0b;
        }
        
        /* Focus styles */
        .rich-text-editor .ql-container.ql-snow {
          border-color: #d1d5db;
          transition: border-color 0.15s ease-in-out;
        }
        
        .rich-text-editor .ql-editor:focus {
          outline: none;
        }
        
        .rich-text-editor .ql-container.ql-snow:focus-within {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }
        
        /* Error styles */
        .rich-text-editor.error .ql-toolbar,
        .rich-text-editor.error .ql-container {
          border-color: #ef4444;
        }
        
        /* Disabled styles */
        .rich-text-editor .ql-toolbar.ql-disabled {
          background-color: #f3f4f6;
          opacity: 0.6;
        }
        
        .rich-text-editor .ql-container.ql-disabled {
          background-color: #f9fafb;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
