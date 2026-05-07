import React from 'react';
import { X, Copy, Check } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Snippet } from '../types';

export function PreviewModal({ snippet, onClose }: { snippet: Snippet | null, onClose: () => void }) {
    const [copied, setCopied] = React.useState(false);
    const [editorTheme, setEditorTheme] = React.useState(() => localStorage.getItem('monaco-theme') || 'vs-dark');

    if (!snippet) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={onClose}>
            <div className="bg-gray-900 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col h-[85vh] max-h-[900px] border border-gray-700 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-800 bg-gray-900/50">
                    <div>
                        <h2 className="text-xl font-semibold text-white">{snippet.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-400 capitalize">{snippet.language} · by {snippet.authorName}</p>
                            {snippet.tags && snippet.tags.length > 0 && (
                                <div className="flex gap-1 ml-2">
                                    {snippet.tags.map(tag => (
                                        <span key={tag} className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 text-xs">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select 
                            value={editorTheme}
                            onChange={e => {
                                setEditorTheme(e.target.value);
                                localStorage.setItem('monaco-theme', e.target.value);
                            }}
                            className="text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded px-2 py-1 outline-none focus:border-indigo-500 mr-2"
                        >
                            <option value="vs-dark">Dark</option>
                            <option value="light">Light</option>
                            <option value="hc-black">High Contrast</option>
                        </select>
                        <button 
                            onClick={handleCopy} 
                            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
                            title="Copy code"
                        >
                            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <div className="w-px h-6 bg-gray-700 mx-1"></div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-hidden bg-[#1E1E1E]">
                    <Editor
                        height="100%"
                        language={snippet.language.toLowerCase() === 'csharp' ? 'csharp' : snippet.language.toLowerCase()}
                        theme={editorTheme}
                        value={snippet.code}
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            padding: { top: 16, bottom: 16 }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
