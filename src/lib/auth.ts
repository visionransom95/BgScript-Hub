import { useState, useEffect } from 'react';
import { auth, signInWithGoogle, logout } from './firebase';
import { User } from 'firebase/auth';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return { user, loading, signInWithGoogle, logout };
}
