import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Eye, Edit, Bold, Italic, List, Link as LinkIcon, Code } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function MarkdownEditor({ value, onChange, placeholder, minHeight = '300px' }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const toolbar = [
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('_', '_') },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`') },
    { icon: List, label: 'List', action: () => insertMarkdown('\n- ') },
    { icon: LinkIcon, label: 'Link', action: () => insertMarkdown('[', '](url)') },
  ];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {toolbar.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title={item.label}
              type="button"
            >
              <item.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              !isPreview
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            type="button"
          >
            <Edit className="w-4 h-4 inline mr-1" />
            Edit
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              isPreview
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            type="button"
          >
            <Eye className="w-4 h-4 inline mr-1" />
            Preview
          </button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div style={{ minHeight }}>
        {isPreview ? (
          <div className="p-4 prose dark:prose-invert max-w-none">
            {value ? (
              <ReactMarkdown>{value}</ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">Nothing to preview</p>
            )}
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Write your content in Markdown...'}
            className="w-full p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:outline-none"
            style={{ minHeight }}
          />
        )}
      </div>

      {/* Help Text */}
      {!isPreview && (
        <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 px-3 py-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Supports Markdown: **bold**, *italic*, `code`, [links](url), lists, and more
          </p>
        </div>
      )}
    </div>
  );
}
