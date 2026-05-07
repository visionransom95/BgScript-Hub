import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Snippet } from '../types';
import { useAuth } from '../lib/auth';
import { formatDistanceToNow } from 'date-fns';
import { FileCode, Trash2, Code2, TerminalSquare, Box, Coffee, Fingerprint, Scissors, Maximize2, Filter } from 'lucide-react';
import { PreviewModal } from './PreviewModal';

const LanguageIcon = ({ lang }: { lang: string }) => {
    switch(lang.toLowerCase()) {
        case 'python': return <TerminalSquare size={16} className="text-blue-500" />;
        case 'javascript':
        case 'typescript': return <Code2 size={16} className="text-yellow-500" />;
        case 'html': return <FileCode size={16} className="text-orange-500" />;
        case 'css': return <Scissors size={16} className="text-blue-400" />;
        case 'rust': return <Box size={16} className="text-orange-700" />;
        case 'java': return <Coffee size={16} className="text-red-500" />;
        case 'go': return <Fingerprint size={16} className="text-cyan-500" />;
        default: return <FileCode size={16} className="text-gray-500" />;
    }
};

export function SnippetList({ searchQuery }: { searchQuery: string }) {
    const { user } = useAuth();
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
    const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'language'>('createdAt');
    const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'snippets'), orderBy(sortBy, sortDirection), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Snippet[];
            setSnippets(data);
            setLoading(false);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, 'snippets');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [sortBy, sortDirection]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this snippet?")) return;
        try {
            await deleteDoc(doc(db, 'snippets', id));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `snippets/${id}`);
        }
    }

    const filteredSnippets = snippets.filter(s => {
        const queryLower = searchQuery.toLowerCase();
        return s.title.toLowerCase().includes(queryLower) || 
               s.language.toLowerCase().includes(queryLower) ||
               s.authorName.toLowerCase().includes(queryLower);
    });

    if (loading) {
        return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (snippets.length === 0) {
        return (
            <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-300 mx-auto max-w-2xl mt-10">
                <FileCode size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No snippets yet</h3>
                <p className="text-gray-500 text-sm">Be the first to share a piece of code with the community.</p>
            </div>
        );
    }

    // Helper to get first few lines
    const getPreviewCode = (code: string) => {
        const lines = code.split('\n');
        if (lines.length > 7) {
            return lines.slice(0, 7).join('\n') + '\n...';
        }
        return code;
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Snippets</h3>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 font-medium flex items-center gap-1"><Filter size={14} /> Sort by:</span>
                    <select 
                        value={`${sortBy}-${sortDirection}`} 
                        onChange={(e) => {
                            const [newSortBy, newSortDir] = e.target.value.split('-');
                            setSortBy(newSortBy as any);
                            setSortDirection(newSortDir as any);
                        }}
                        className="bg-white border border-gray-200 text-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 outline-none font-medium"
                    >
                        <option value="createdAt-desc">Date (Newest first)</option>
                        <option value="createdAt-asc">Date (Oldest first)</option>
                        <option value="title-asc">Title (A-Z)</option>
                        <option value="title-desc">Title (Z-A)</option>
                        <option value="language-asc">Language (A-Z)</option>
                        <option value="language-desc">Language (Z-A)</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSnippets.map(snippet => (
                    <div 
                        key={snippet.id} 
                        onClick={() => setSelectedSnippet(snippet)}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col cursor-pointer group hover:-translate-y-1"
                    >
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                                    <LanguageIcon lang={snippet.language} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 pr-2">{snippet.title}</h3>
                                    <p className="text-xs text-gray-500">
                                        {snippet.language} · by {snippet.authorName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {user?.uid === snippet.authorId && (
                                    <button 
                                        onClick={(e) => handleDelete(snippet.id, e)}
                                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-white transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                <div className="text-gray-400 p-2 rounded-lg group-hover:text-indigo-600 transition-colors bg-white border border-transparent group-hover:border-indigo-100 group-hover:bg-indigo-50">
                                    <Maximize2 size={16} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1E1E1E] flex-1 p-4 overflow-hidden relative">
                            <pre className="text-gray-300 font-mono text-xs leading-5">
                                {getPreviewCode(snippet.code)}
                            </pre>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                <span className="bg-white/10 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                                    Click to preview
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                
                {filteredSnippets.length === 0 && snippets.length > 0 && (
                    <div className="col-span-full text-center p-12 text-gray-500">
                        No snippets found matching "{searchQuery}"
                    </div>
                )}
            </div>
            
            <PreviewModal snippet={selectedSnippet} onClose={() => setSelectedSnippet(null)} />
        </>
    );
}
