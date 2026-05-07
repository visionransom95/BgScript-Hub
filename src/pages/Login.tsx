import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { LogIn, Code } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export function Login() {
    const { user, signInWithGoogle } = useAuth();
    const [error, setError] = useState<string | null>(null);

    if (user) {
        return <Navigate to="/" />;
    }

    const handleLogin = async () => {
        setError(null);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            console.error("Login failed:", err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in popup was closed before completing. Please try again.');
            } else {
                setError(err.message || 'Failed to sign in.');
            }
        }
    };

    return (
        <main className="flex-1 flex items-center justify-center p-6 mt-12">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-500 w-20 h-20 rounded-2xl text-white font-black italic text-2xl flex items-center justify-center mx-auto mb-6 shadow-md border-4 border-indigo-100">
                    <span className="text-blue-200 mr-1">&lt;</span>BG<span className="text-blue-200 ml-1">&gt;</span>
                </div>
                
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-500 mb-8">Sign in to BG Script Hub to share your code and join the community.</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <button 
                    onClick={handleLogin}
                    className="w-full relative flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3.5 px-4 rounded-xl border border-gray-300 shadow-sm transition-all hover:shadow focus:ring-4 focus:ring-gray-100"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                    Continue with Google
                </button>

                <p className="text-sm text-gray-400 mt-8">
                    By signing in, you agree to our Terms of Service and Privacy Policy. All snippets are publicly visible.
                </p>
            </div>
        </main>
    );
}
