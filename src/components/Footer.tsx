import React from 'react';
import { ExternalLink, Github } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-12 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-indigo-600 p-1.5 rounded-lg text-white font-black italic text-xs">
                            BG
                        </div>
                        <span className="font-bold text-gray-900">BG Script Hub</span>
                    </div>
                    <p className="text-gray-500 text-sm text-center md:text-left max-w-xs">
                        The ultimate repository for sharing and discovering high-quality scripts and code snippets.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-12">
                    <div className="flex flex-col gap-3 items-center md:items-start">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resources</h4>
                        <a href="/" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Hub Home</a>
                        <a href="/about" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">About</a>
                        <a href="/contact" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Contact</a>
                    </div>
                    <div className="flex flex-col gap-3 items-center md:items-start">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Partners</h4>
                        <a 
                            href="https://bg-script-hub-lake.vercel.app/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                        >
                            BG Hub Lake <ExternalLink size={12} />
                        </a>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-4">
                    <div className="flex gap-4">
                        <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
                            <Github size={20} />
                        </a>
                    </div>
                    <p className="text-gray-400 text-xs">
                        &copy; {new Date().getFullYear()} BG Script Hub. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
