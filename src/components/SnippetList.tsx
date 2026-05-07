import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit, deleteDoc, doc, where, setDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Snippet } from '../types';
import { useAuth } from '../lib/auth';
import { formatDistanceToNow } from 'date-fns';
import { FileCode, Trash2, Code2, TerminalSquare, Box, Coffee, Fingerprint, Scissors, Maximize2, Filter, Edit2, Share2, Database, Layout, Heart, Tag } from 'lucide-react';
import { PreviewModal } from './PreviewModal';
import { Link } from 'react-router-dom';

const LanguageIcon = ({ lang }: { lang: string }) => {
    switch(lang.toLowerCase()) {
        case 'python': return <TerminalSquare size={16} className="text-blue-500" />;
        case 'javascript':
        case 'typescript': return <Code2 size={16} className="text-yellow-500" />;
        case 'html': return <Layout size={16} className="text-orange-500" />;
        case 'css': return <Scissors size={16} className="text-blue-400" />;
        case 'rust': return <Box size={16} className="text-orange-700" />;
        case 'java':
        case 'kotlin': return <Coffee size={16} className="text-red-500" />;
        case 'go': return <Fingerprint size={16} className="text-cyan-500" />;
        case 'php': return <FileCode size={16} className="text-indigo-400" />;
        case 'ruby': return <Box size={16} className="text-red-600" />;
        case 'swift': return <Code2 size={16} className="text-orange-600" />;
        case 'csharp': return <Box size={16} className="text-purple-600" />;
        case 'sql': return <Database size={16} className="text-blue-600" />;
        case 'json':
        case 'yaml':
        case 'markdown': return <FileCode size={16} className="text-gray-600" />;
        default: return <FileCode size={16} className="text-gray-500" />;
    }
};

export function SnippetList({ searchQuery, onEdit, filterByAuthor, favoritesOnly }: { searchQuery: string, onEdit: (snippet: Snippet) => void, filterByAuthor?: string, favoritesOnly?: boolean }) {
    const { user } = useAuth();
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
    const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'language'>('createdAt');
    const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
    const [languageFilter, setLanguageFilter] = useState<string>('all');
    const [tagFilter, setTagFilter] = useState<string>('all');
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!user) {
            setFavoriteIds(new Set());
            return;
        }
        const favQuery = query(collection(db, 'users', user.uid, 'favorites'));
        const unsub = onSnapshot(favQuery, (snap) => {
            const ids = new Set<string>();
            snap.forEach(doc => ids.add(doc.id));
            setFavoriteIds(ids);
        }, (err) => {
            console.error("Failed to load favorites", err);
        });
        return () => unsub();
    }, [user]);

    useEffect(() => {
        setLoading(true);
        let q;
        if (filterByAuthor) {
            q = query(collection(db, 'snippets'), where('authorId', '==', filterByAuthor));
        } else {
            q = query(collection(db, 'snippets'), orderBy(sortBy, sortDirection), limit(100));
        }
        
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
    }, [sortBy, sortDirection, filterByAuthor]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this snippet?")) return;
        try {
            await deleteDoc(doc(db, 'snippets', id));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `snippets/${id}`);
        }
    }

    const handleShare = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/snippet/${id}`;
        navigator.clipboard.writeText(url);
        alert('Snippet link copied to clipboard!');
    };

    const toggleFavorite = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return alert("Please log in to favorite snippets");
        
        try {
            if (favoriteIds.has(id)) {
                await deleteDoc(doc(db, 'users', user.uid, 'favorites', id));
            } else {
                await setDoc(doc(db, 'users', user.uid, 'favorites', id), {
                    snippetId: id,
                    createdAt: serverTimestamp()
                });
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/favorites/${id}`);
        }
    };

    let filteredSnippets = snippets.filter(s => {
        if (favoritesOnly && !favoriteIds.has(s.id)) return false;
        if (languageFilter !== 'all' && s.language !== languageFilter) return false;
        if (tagFilter !== 'all' && (!s.tags || !s.tags.includes(tagFilter))) return false;
        const queryLower = searchQuery.toLowerCase();
        return s.title.toLowerCase().includes(queryLower) || 
               s.language.toLowerCase().includes(queryLower) ||
               s.authorName.toLowerCase().includes(queryLower) || 
               (s.tags && s.tags.some(t => t.toLowerCase().includes(queryLower)));
    });

    if (filterByAuthor || favoritesOnly) {
        filteredSnippets.sort((a, b) => {
            if (sortBy === 'createdAt') {
                const timeA = a.createdAt?.toMillis() || 0;
                const timeB = b.createdAt?.toMillis() || 0;
                return sortDirection === 'desc' ? timeB - timeA : timeA - timeB;
            }
            if (sortBy === 'title') {
                return sortDirection === 'desc' ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title);
            }
            if (sortBy === 'language') {
                return sortDirection === 'desc' ? b.language.localeCompare(a.language) : a.language.localeCompare(b.language);
            }
            return 0;
        });
    }

    // Derive languages and tags
    const presentLanguages = Array.from(new Set(snippets.map(s => s.language))).sort();
    const allTags = new Set<string>();
    snippets.forEach(s => s.tags?.forEach(t => allTags.add(t)));
    const presentTags = Array.from(allTags).sort();

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
                <h3 className="text-lg font-semibold text-gray-900">
                    {favoritesOnly ? 'My Favorites' : filterByAuthor ? 'My Snippets' : 'Community Snippets'}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    {presentTags.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium flex items-center gap-1"><Tag size={14} /> Tag:</span>
                            <select 
                                value={tagFilter} 
                                onChange={(e) => setTagFilter(e.target.value)}
                                className="bg-white border border-gray-200 text-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 outline-none font-medium"
                            >
                                <option value="all">All Tags</option>
                                {presentTags.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-medium flex items-center gap-1"><Filter size={14} /> Lang:</span>
                        <select 
                            value={languageFilter} 
                            onChange={(e) => setLanguageFilter(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 outline-none font-medium capitalize"
                        >
                            <option value="all">All Languages</option>
                            {presentLanguages.map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-px h-5 bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-medium">Sort:</span>
                        <select 
                            value={`${sortBy}-${sortDirection}`} 
                            onChange={(e) => {
                                const [newSortBy, newSortDir] = e.target.value.split('-');
                                setSortBy(newSortBy as any);
                                setSortDirection(newSortDir as any);
                            }}
                            className="bg-white border border-gray-200 text-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 outline-none font-medium"
                        >
                            <option value="createdAt-desc">Date (Newest)</option>
                            <option value="createdAt-asc">Date (Oldest)</option>
                            <option value="title-asc">Title (A-Z)</option>
                            <option value="title-desc">Title (Z-A)</option>
                            <option value="language-asc">Language (A-Z)</option>
                            <option value="language-desc">Language (Z-A)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSnippets.map(snippet => (
                    <div 
                        key={snippet.id} 
                        onClick={() => setSelectedSnippet(snippet)}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col cursor-pointer group hover:-translate-y-1 relative"
                    >
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                                    <LanguageIcon lang={snippet.language} />
                                </div>
                                <div>
                                    <Link to={`/snippet/${snippet.id}`} onClick={e => e.stopPropagation()} className="text-sm font-semibold text-gray-900 line-clamp-1 pr-2 hover:text-indigo-600 transition-colors">{snippet.title}</Link>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {snippet.language} · by <Link to={`/profile/${snippet.authorId}`} onClick={e => e.stopPropagation()} className="hover:text-indigo-600">{snippet.authorName}</Link>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-gray-50/90 backdrop-blur rounded-lg shadow-sm border border-gray-100 p-1">
                                <button 
                                    onClick={(e) => toggleFavorite(snippet.id, e)}
                                    className={`p-2 rounded-lg transition-colors ${favoriteIds.has(snippet.id) ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                                    title={favoriteIds.has(snippet.id) ? "Unfavorite" : "Favorite"}
                                >
                                    <Heart size={16} fill={favoriteIds.has(snippet.id) ? "currentColor" : "none"} />
                                </button>
                                <button 
                                    onClick={(e) => handleShare(snippet.id, e)}
                                    className="text-gray-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                    title="Share Link"
                                >
                                    <Share2 size={16} />
                                </button>
                                {user?.uid === snippet.authorId && (
                                    <>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onEdit(snippet); }}
                                            className="text-gray-400 hover:text-indigo-500 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={(e) => handleDelete(snippet.id, e)}
                                            className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                            {/* Always visible favorite state and tags */}
                            <div className="flex items-center gap-2 pr-1 group-hover:opacity-0 transition-opacity">
                                {snippet.tags && snippet.tags.length > 0 && (
                                    <div className="hidden sm:flex gap-1 items-center mr-2">
                                        <Tag size={12} className="text-gray-400" />
                                        <span className="text-xs text-gray-500">{snippet.tags.length}</span>
                                    </div>
                                )}
                                {favoriteIds.has(snippet.id) && (
                                    <Heart size={16} className="text-red-500" fill="currentColor" />
                                )}
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
                        No snippets found matching your filters.
                    </div>
                )}
            </div>
            
            <PreviewModal snippet={selectedSnippet} onClose={() => setSelectedSnippet(null)} />
        </>
    );
}
