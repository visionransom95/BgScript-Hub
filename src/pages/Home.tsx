import React, { useState } from 'react';
import { SnippetList } from '../components/SnippetList';
import { UploadModal } from '../components/UploadModal';
import { useAuth } from '../lib/auth';
import { Plus } from 'lucide-react';

export function Home({ searchQuery }: { searchQuery: string }) {
    const { user } = useAuth();
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    return (
        <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">BG Script Hub</h2>
                    <p className="text-gray-500 mt-1">Discover, upload, and share code snippets with developers worldwide.</p>
                </div>
                {user ? (
                    <button 
                        onClick={() => setIsUploadOpen(true)}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-5 rounded-xl transition-colors shadow-sm shrink-0"
                    >
                        <Plus size={20} />
                        Share Code
                    </button>
                ) : (
                    <div className="text-sm font-medium px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 shrink-0">
                        Sign in to share your code
                    </div>
                )}
            </div>

            <SnippetList searchQuery={searchQuery} />
            <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
        </main>
    );
}
