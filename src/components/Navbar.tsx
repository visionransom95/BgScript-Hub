import React from 'react';
import { useAuth } from '../lib/auth';
import { Code, LogIn, LogOut, Search, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Navbar({ searchQuery, setSearchQuery }: { searchQuery: string, setSearchQuery: (q: string) => void }) {
    const { user, signInWithGoogle, logout } = useAuth();
    const location = useLocation();
    const showSearch = location.pathname === '/' || location.pathname === '/storage';
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const NavLinks = () => (
        <>
            <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Home</Link>
            {user && (
                <Link to="/storage" className={`text-sm font-medium transition-colors ${location.pathname === '/storage' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Storage</Link>
            )}
            <Link to="/about" className={`text-sm font-medium transition-colors ${location.pathname === '/about' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>About</Link>
            <Link to="/contact" className={`text-sm font-medium transition-colors ${location.pathname === '/contact' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Contact</Link>
        </>
    );

    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 w-full">
            <div className="flex items-center gap-6">
                <Link to="/" className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-500 p-2 rounded-lg text-white font-black italic flex items-center justify-center">
                        <span className="text-blue-200 mr-0.5">&lt;</span>BG<span className="text-blue-200 ml-0.5">&gt;</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 hidden sm:block">BG Script Hub</h1>
                </Link>
                
                <div className="hidden md:flex gap-6 items-center">
                    <NavLinks />
                </div>
            </div>

            {showSearch && (
                <div className="flex-1 max-w-md px-4 sm:px-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search snippets..." 
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-indigo-500 focus:border-indigo-500 block pl-10 p-2.5 outline-none transition-shadow"
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 hidden sm:flex">
                            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="avatar" className="w-8 h-8 rounded-full" />
                            <span className="font-medium">{user.displayName}</span>
                        </div>
                        <button onClick={logout} className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Log out">
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <Link 
                        to="/login"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-full transition-colors text-sm"
                    >
                        <LogIn size={18} />
                        <span className="hidden sm:inline">Sign in</span>
                    </Link>
                )}
            </div>
        </nav>
    );
}
