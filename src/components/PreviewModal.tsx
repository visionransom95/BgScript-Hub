import React from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Snippet } from '../types';

export function PreviewModal({ snippet, onClose }: { snippet: Snippet | null, onClose: () => void }) {
    const [copied, setCopied] = React.useState(false);

    if (!snippet) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={onClose}>
            <div className="bg-gray-900 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-700 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-800 bg-gray-900/50">
                    <div>
                        <h2 className="text-xl font-semibold text-white">{snippet.title}</h2>
                        <p className="text-sm text-gray-400 mt-1">{snippet.language} · by {snippet.authorName}</p>
                    </div>
                    <div className="flex items-center gap-2">
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
                
                <div className="flex-1 overflow-auto bg-[#1E1E1E] p-4 text-sm code-preview">
                    <SyntaxHighlighter 
                        language={snippet.language.toLowerCase()} 
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                        showLineNumbers={true}
                    >
                        {snippet.code}
                    </SyntaxHighlighter>
                </div>
            </div>
        </div>
    );
}
