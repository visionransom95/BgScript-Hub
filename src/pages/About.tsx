import React from 'react';
import { Info, Shield, Zap, Users } from 'lucide-react';

export function About() {
    return (
        <main className="max-w-4xl mx-auto px-6 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">About BG Script Hub</h1>
                <p className="text-xl text-gray-600">The ultimate platform for sharing and discovering code snippets across the universe.</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 text-gray-700 leading-relaxed space-y-6">
                <p>
                    Started as a vision to unify developers, <strong>BG Script Hub</strong> provides a clean, fast, and accessible home for scripts of all languages—from Python and Lua to Rust and Go. Whether you're looking for a quick boilerplate or a complex algorithms, our community-driven hub has you covered.
                </p>
                <p>
                    We believe in open knowledge, robust security, and seamless collaboration. By offering a robust search and categorized languages, finding the exact script you need has never been easier.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full mb-4"><Zap size={24} /></div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                    <p className="text-gray-600 text-sm">Powered by modern tech, experience instant search and instantaneous snippet uploads.</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
                    <div className="bg-green-100 text-green-600 p-3 rounded-full mb-4"><Users size={24} /></div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Driven</h3>
                    <p className="text-gray-600 text-sm">Join a growing network of enthusiastic coders. Share your knowledge and learn from others.</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
                    <div className="bg-purple-100 text-purple-600 p-3 rounded-full mb-4"><Shield size={24} /></div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
                    <p className="text-gray-600 text-sm">Your data is safe. We utilize industry-standard practices to ensure robust security.</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
                    <div className="bg-orange-100 text-orange-600 p-3 rounded-full mb-4"><Info size={24} /></div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Constantly Evolving</h3>
                    <p className="text-gray-600 text-sm">We listen to feedback and continuously add new features to improve your workflow.</p>
                </div>
            </div>
        </main>
    );
}
