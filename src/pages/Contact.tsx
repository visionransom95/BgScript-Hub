import React from 'react';
import { Mail, MessageSquare, ExternalLink } from 'lucide-react';

export function Contact() {
    return (
        <main className="max-w-3xl mx-auto px-6 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Contact & Community</h1>
                <p className="text-xl text-gray-600">Get in touch or join our community to get support.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#5865F2]/10 text-[#5865F2] rounded-full flex items-center justify-center mb-6">
                        <MessageSquare size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Join our Discord</h2>
                    <p className="text-gray-600 mb-8 flex-1">
                        Connect with other developers, ask for help, suggest features, and hang out in our official Discord server.
                    </p>
                    <a 
                        href="https://discord.com/invite/z9jZ8P6aum" 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        Join Discord <ExternalLink size={18} />
                    </a>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center mb-6">
                        <Mail size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Support</h2>
                    <p className="text-gray-600 mb-8 flex-1">
                        Have a specific query, business proposal, or need direct support? Send us an email and we'll get back to you.
                    </p>
                    <a 
                        href="mailto:support@bgscripthub.com" 
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        Send an Email
                    </a>
                </div>
            </div>
        </main>
    );
}
