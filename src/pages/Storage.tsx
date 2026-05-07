import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { SnippetList } from '../components/SnippetList';
import { UploadModal } from '../components/UploadModal';
import { Navigate } from 'react-router-dom';
import { Snippet } from '../types';
import { FileCode, Heart } from 'lucide-react';

export function Storage({ searchQuery }: { searchQuery: string }) {
    const { user, loading } = useAuth();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
    const [activeTab, setActiveTab] = useState<'snippets' | 'favorites'>('snippets');

    if (loading) {
        return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
    }
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleEdit = (snippet: Snippet) => {
        setEditingSnippet(snippet);
        setIsUploadOpen(true);
    };

    const handleCloseUpload = () => {
        setIsUploadOpen(false);
        setEditingSnippet(null);
    };

    return (
        <main className="max-w-7xl mx-auto px-6 py-8 w-full">
            <div className="mb-2 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">My Storage</h2>
                    <p className="text-gray-500 mt-1">Manage your personal collection of code snippets.</p>
                </div>
                <button 
                    onClick={() => setIsUploadOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-indigo-700 hover:shadow transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    New Snippet
                </button>
            </div>

            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('snippets')}
                    className={`flex items-center gap-2 py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === 'snippets' 
                            ? 'border-indigo-600 text-indigo-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    <FileCode size={16} /> My Snippets
                </button>
                <button
                    onClick={() => setActiveTab('favorites')}
                    className={`flex items-center gap-2 py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === 'favorites' 
                            ? 'border-indigo-600 text-indigo-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    <Heart size={16} /> Favorites
                </button>
            </div>

            {activeTab === 'snippets' ? (
                <SnippetList searchQuery={searchQuery} onEdit={handleEdit} filterByAuthor={user.uid} />
            ) : (
                <SnippetList searchQuery={searchQuery} onEdit={handleEdit} favoritesOnly={true} />
            )}

            <UploadModal isOpen={isUploadOpen} onClose={handleCloseUpload} snippetToEdit={editingSnippet} />
        </main>
    );
}
