import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { SnippetList } from '../components/SnippetList';
import { UploadModal } from '../components/UploadModal';
import { Snippet } from '../types';
import { FileCode, Heart, User as UserIcon } from 'lucide-react';

export function Profile({ searchQuery }: { searchQuery: string }) {
    const { id } = useParams<{ id: string }>();
    const { user, loading } = useAuth();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
    const [activeTab, setActiveTab] = useState<'snippets' | 'favorites'>('snippets');

    if (loading) {
        return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
    }
    
    if (!id) {
        return <Navigate to="/" replace />;
    }

    const isOwnProfile = user?.uid === id;

    const handleEdit = (snippet: Snippet) => {
        setEditingSnippet(snippet);
        setIsUploadOpen(true);
    };

    const handleCloseUpload = () => {
        setIsUploadOpen(false);
        setEditingSnippet(null);
    };

    return (
        <main className="max-w-7xl mx-auto px-6 py-8 w-full flex flex-col items-center">
            <div className="w-full max-w-4xl bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-md shrink-0">
                        <UserIcon size={40} className="text-indigo-600" />
                    </div>
                    <div className="text-center sm:text-left flex-1 min-w-0">
                        <h2 className="text-3xl font-bold text-gray-900 truncate">
                            {isOwnProfile ? (user.displayName || 'You') : 'Developer'} Profile
                        </h2>
                        <p className="text-gray-500 mt-2 line-clamp-2 max-w-2xl">
                            {isOwnProfile 
                                ? 'This is your public developer profile. Manage your code snippets and favorites here.' 
                                : 'Explore this developer\'s shared code snippets.'}
                        </p>
                    </div>
                </div>

                <div className="flex border-b border-gray-200 mt-8">
                    <button
                        onClick={() => setActiveTab('snippets')}
                        className={`flex items-center gap-2 py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'snippets' 
                                ? 'border-indigo-600 text-indigo-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <FileCode size={16} /> Snippets
                    </button>
                    {isOwnProfile && (
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
                    )}
                </div>
            </div>

            <div className="w-full">
                {activeTab === 'snippets' ? (
                    <SnippetList searchQuery={searchQuery} onEdit={handleEdit} filterByAuthor={id} />
                ) : (
                    <SnippetList searchQuery={searchQuery} onEdit={handleEdit} favoritesOnly={true} />
                )}
            </div>

            <UploadModal isOpen={isUploadOpen} onClose={handleCloseUpload} snippetToEdit={editingSnippet} />
        </main>
    );
}
