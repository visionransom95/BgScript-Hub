import React, { useState, useEffect } from 'react';
import { addDoc, updateDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { X, Upload, FileCode, Edit2, AlertCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import { Snippet } from '../types';

export const SUPPORTED_LANGUAGES = [
    { value: 'python', label: 'Python' },
    { value: 'lua', label: 'Lua' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'rust', label: 'Rust' },
    { value: 'go', label: 'Go' },
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' },
    { value: 'bash', label: 'Bash' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'csharp', label: 'C#' },
    { value: 'sql', label: 'SQL' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
];

export function UploadModal({ isOpen, onClose, snippetToEdit }: { isOpen: boolean, onClose: () => void, snippetToEdit?: Snippet | null }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{title?: string, code?: string, tags?: string}>({});

    useEffect(() => {
        if (isOpen) {
            if (snippetToEdit) {
                setTitle(snippetToEdit.title);
                setLanguage(snippetToEdit.language);
                setCode(snippetToEdit.code);
                setTags(snippetToEdit.tags || []);
            } else {
                setTitle('');
                setLanguage('python');
                setCode('');
                setTags([]);
            }
            setTagInput('');
            setErrors({});
        }
    }, [isOpen, snippetToEdit]);

    useEffect(() => {
        const newErrors: {title?: string, code?: string, tags?: string} = {};
        if (title.length > 256) newErrors.title = "Title is too long (max 256 characters)";
        if (code.length > 1000000) newErrors.code = "Code is too long (max 1000000 characters)";
        else if (code.trim() === '' && title.trim() !== '') newErrors.code = "Code cannot be empty";
        if (tags.length > 5) newErrors.tags = "Maximum 5 tags allowed";
        setErrors(newErrors);
    }, [title, code, tags]);

    if (!isOpen) return null;

    const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase();
            if (newTag && !tags.includes(newTag) && tags.length < 5 && newTag.length <= 20) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!title.trim() || !code.trim() || Object.keys(errors).length > 0) return;

        setIsSubmitting(true);
        try {
            if (snippetToEdit) {
                await updateDoc(doc(db, 'snippets', snippetToEdit.id), {
                    title: title.trim(),
                    language,
                    code: code.trim(),
                    tags
                });
                
                // If code changed, log a version
                if (snippetToEdit.code !== code.trim()) {
                    await addDoc(collection(db, 'snippets', snippetToEdit.id, 'versions'), {
                        code: code.trim(),
                        createdAt: serverTimestamp()
                    });
                }
            } else {
                const docRef = await addDoc(collection(db, 'snippets'), {
                    title: title.trim(),
                    language,
                    code: code.trim(),
                    tags,
                    authorId: user.uid,
                    authorName: user.displayName || 'Anonymous',
                    createdAt: serverTimestamp()
                });
                
                // Initial version
                await addDoc(collection(db, 'snippets', docRef.id, 'versions'), {
                    code: code.trim(),
                    createdAt: serverTimestamp()
                });
            }
            onClose();
        } catch (error) {
            handleFirestoreError(error, snippetToEdit ? OperationType.UPDATE : OperationType.CREATE, 'snippets');
            alert('Failed to save snippet. See console for details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileRead = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase();
        const map: Record<string, string> = {
            py: 'python', lua: 'lua', js: 'javascript', ts: 'typescript', 
            html: 'html', css: 'css', rs: 'rust', go: 'go', cpp: 'cpp', java: 'java', sh: 'bash',
            php: 'php', rb: 'ruby', swift: 'swift', kt: 'kotlin', cs: 'csharp', sql: 'sql',
            json: 'json', yml: 'yaml', yaml: 'yaml', md: 'markdown'
        };
        if (ext && map[ext]) {
            setLanguage(map[ext]);
        }
        
        if (!title) {
            setTitle(file.name);
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
                setCode(event.target.result);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col h-[95vh] max-h-[900px]">
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        {snippetToEdit ? <Edit2 size={20} className="text-indigo-600" /> : <Upload size={20} className="text-indigo-600" />}
                        {snippetToEdit ? 'Edit Snippet' : 'Upload Snippet'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-hidden flex-1 flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Title</label>
                            <input 
                                type="text"
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className={`w-full bg-gray-50 border ${errors.title ? 'border-red-500' : 'border-gray-200'} text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none`}
                                placeholder="e.g. Binary Search Implementation"
                            />
                            {errors.title && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/>{errors.title}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Language</label>
                            <select 
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none"
                            >
                                {SUPPORTED_LANGUAGES.map(lang => (
                                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Tags (press Enter to add)</label>
                        <div className="flex flex-wrap gap-2 items-center bg-gray-50 border border-gray-200 rounded-lg p-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                            {tags.map(tag => (
                                <span key={tag} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded inline-flex items-center gap-1">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-indigo-900"><X size={12} /></button>
                                </span>
                            ))}
                            <input 
                                type="text"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={handleTagAdd}
                                className="bg-transparent border-none outline-none text-sm flex-1 min-w-[100px]"
                                placeholder={tags.length < 5 ? "Add tags..." : "Max tags reached"}
                                disabled={tags.length >= 5}
                                maxLength={20}
                            />
                        </div>
                        {errors.tags && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/>{errors.tags}</p>}
                    </div>

                    <div className="flex flex-col gap-2 flex-1 min-h-0 relative">
                        <div className="flex items-center justify-between pb-1">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FileCode size={16} /> Code
                            </label>
                            <div className="relative overflow-hidden inline-block cursor-pointer">
                                <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded inline-flex items-center gap-1">
                                    <Upload size={14} /> From File
                                </button>
                                <input 
                                    type="file" 
                                    className="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full"
                                    onChange={handleFileRead}
                                />
                            </div>
                        </div>
                        <div className={`flex-1 rounded-xl overflow-hidden border ${errors.code ? 'border-red-500' : 'border-gray-200'}`}>
                            <Editor
                                height="100%"
                                language={language === 'csharp' ? 'csharp' : language.toLowerCase()}
                                theme="vs-dark"
                                value={code}
                                onChange={(val) => setCode(val || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    wordWrap: 'on',
                                    padding: { top: 16, bottom: 16 }
                                }}
                            />
                        </div>
                        {errors.code && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/>{errors.code}</p>}
                    </div>
                    
                    <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 mt-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting || !user || Object.keys(errors).length > 0}
                            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : (snippetToEdit ? 'Save Changes' : 'Publish Snippet')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
