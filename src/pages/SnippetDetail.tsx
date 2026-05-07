import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Snippet } from '../types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function SnippetDetail() {
    const { id } = useParams<{ id: string }>();
    const [snippet, setSnippet] = useState<Snippet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchSnippet = async () => {
            try {
                const docRef = doc(db, 'snippets', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setSnippet({ id: docSnap.id, ...docSnap.data() } as Snippet);
                } else {
                    setError('Snippet not found.');
                }
            } catch (err) {
                handleFirestoreError(err, OperationType.GET, `snippets/${id}`);
                setError('Failed to load snippet.');
            } finally {
                setLoading(false);
            }
        };

        fetchSnippet();
    }, [id]);

    const handleCopy = () => {
        if (snippet) {
            navigator.clipboard.writeText(snippet.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !snippet) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Snippet not found'}</h2>
                <Link to="/" className="text-indigo-600 hover:underline inline-flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Hub
                </Link>
            </div>
        );
    }

    return (
        <main className="max-w-5xl mx-auto px-6 py-8 w-full">
            <Link to="/" className="text-gray-500 hover:text-gray-900 inline-flex items-center gap-2 mb-6 transition-colors">
                <ArrowLeft size={16} /> Back to Hub
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{snippet.title}</h1>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                            <span className="font-medium bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded capitalize">{snippet.language}</span>
                            <span>·</span>
                            <span>by <span className="font-medium text-gray-700">{snippet.authorName}</span></span>
                            <span>·</span>
                            <span>{snippet.createdAt?.toDate() ? formatDistanceToNow(snippet.createdAt.toDate(), { addSuffix: true }) : 'recently'}</span>
                        </p>
                    </div>
                    <button 
                        onClick={handleCopy} 
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors font-medium text-sm w-fit"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied' : 'Copy Code'}
                    </button>
                </div>
                
                <div className="bg-[#1E1E1E] w-full overflow-auto text-sm code-preview p-6">
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
        </main>
    );
}
