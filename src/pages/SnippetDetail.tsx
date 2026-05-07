import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, getDocs, updateDoc, serverTimestamp, addDoc, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Snippet } from '../types';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Copy, Check, History, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../lib/auth';

interface SnippetVersion {
    id: string;
    code: string;
    createdAt: Timestamp;
}

export function SnippetDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [snippet, setSnippet] = useState<Snippet | null>(null);
    const [versions, setVersions] = useState<SnippetVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<SnippetVersion | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchSnippetAndVersions = async () => {
            try {
                const docRef = doc(db, 'snippets', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setSnippet({ id: docSnap.id, ...docSnap.data() } as Snippet);
                    
                    const versionsQuery = query(collection(db, 'snippets', id, 'versions'), orderBy('createdAt', 'desc'));
                    const versionsSnap = await getDocs(versionsQuery);
                    const versionsData = versionsSnap.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as SnippetVersion[];
                    
                    setVersions(versionsData);
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

        fetchSnippetAndVersions();
    }, [id]);

    const handleCopy = () => {
        const codeToCopy = selectedVersion ? selectedVersion.code : snippet?.code || '';
        if (codeToCopy) {
            navigator.clipboard.writeText(codeToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleRevert = async (version: SnippetVersion) => {
        if (!snippet || !user || snippet.authorId !== user.uid) return;
        if (!window.confirm("Are you sure you want to revert to this version?")) return;
        
        try {
            await updateDoc(doc(db, 'snippets', snippet.id), {
                code: version.code,
            });
            await addDoc(collection(db, 'snippets', snippet.id, 'versions'), {
                code: version.code,
                createdAt: serverTimestamp()
            });
            setSnippet(prev => prev ? { ...prev, code: version.code } : null);
            setSelectedVersion(null);
            
            // Refetch versions
            const versionsQuery = query(collection(db, 'snippets', snippet.id, 'versions'), orderBy('createdAt', 'desc'));
            const versionsSnap = await getDocs(versionsQuery);
            const versionsData = versionsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SnippetVersion[];
            setVersions(versionsData);
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `snippets/${snippet.id}`);
            alert('Failed to revert version.');
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

    const currentCode = selectedVersion ? selectedVersion.code : snippet.code;

    return (
        <main className="max-w-7xl mx-auto px-6 py-8 w-full flex flex-col md:flex-row gap-6">
            <div className="flex-1 min-w-0 flex flex-col">
                <Link to="/" className="text-gray-500 hover:text-gray-900 inline-flex items-center gap-2 mb-6 transition-colors w-fit">
                    <ArrowLeft size={16} /> Back to Hub
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1 min-h-[600px]">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{snippet.title}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="font-medium text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded capitalize">{snippet.language}</span>
                                <span className="text-gray-400">·</span>
                                <span className="text-sm text-gray-500">by <Link to={`/profile/${snippet.authorId}`} className="font-medium text-indigo-600 hover:text-indigo-700">{snippet.authorName}</Link></span>
                                <span className="text-gray-400">·</span>
                                <span className="text-sm text-gray-500">{snippet.createdAt?.toDate() ? formatDistanceToNow(snippet.createdAt.toDate(), { addSuffix: true }) : 'recently'}</span>
                                {snippet.tags && snippet.tags.length > 0 && (
                                    <>
                                        <span className="text-gray-400">·</span>
                                        <div className="flex flex-wrap gap-1">
                                            {snippet.tags.map(tag => (
                                                <span key={tag} className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded">{tag}</span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={handleCopy} 
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors font-medium text-sm w-fit shrink-0"
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Copied' : 'Copy Code'}
                        </button>
                    </div>
                    
                    <div className="bg-[#1E1E1E] w-full flex-1 min-h-[400px]">
                        <Editor
                            height="100%"
                            language={snippet.language.toLowerCase() === 'csharp' ? 'csharp' : snippet.language.toLowerCase()}
                            theme="vs-dark"
                            value={currentCode}
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

            {versions.length > 0 && (
                <div className="w-full md:w-80 flex flex-col shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mt-12 md:mt-14 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                            <History size={18} className="text-gray-500" />
                            <h3 className="font-semibold text-gray-900">Version History</h3>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            {versions.map((version, index) => {
                                const isCurrent = selectedVersion ? selectedVersion.id === version.id : index === 0;
                                return (
                                    <div 
                                        key={version.id} 
                                        className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-between group ${isCurrent ? 'bg-indigo-50 hover:bg-indigo-50' : ''}`}
                                        onClick={() => index === 0 ? setSelectedVersion(null) : setSelectedVersion(version)}
                                    >
                                        <div>
                                            <p className={`text-sm font-medium ${isCurrent ? 'text-indigo-700' : 'text-gray-900'}`}>
                                                {index === 0 ? 'Current Version' : `Version ${versions.length - index}`}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {version.createdAt?.toDate() ? formatDistanceToNow(version.createdAt.toDate(), { addSuffix: true }) : ''}
                                            </p>
                                        </div>
                                        {user?.uid === snippet.authorId && index !== 0 && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleRevert(version); }}
                                                className={`p-1.5 rounded-lg transition-opacity ${isCurrent ? 'text-indigo-600 hover:bg-indigo-100 opacity-100' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100'}`}
                                                title="Revert to this version"
                                            >
                                                <RotateCcw size={16} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
