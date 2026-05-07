import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Storage } from './pages/Storage';
import { SnippetDetail } from './pages/SnippetDetail';
import { useAuth } from './lib/auth';

export default function App() {
    const { user, loading } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
                <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <div className="flex-1 flex flex-col">
                    <Routes>
                        <Route path="/" element={<Home searchQuery={searchQuery} />} />
                        <Route path="/storage" element={<Storage searchQuery={searchQuery} />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/snippet/:id" element={<SnippetDetail />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}
