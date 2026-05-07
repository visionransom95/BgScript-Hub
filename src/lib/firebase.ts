import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, orderBy, serverTimestamp, onSnapshot, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Check connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
}

export const logout = () => signOut(auth);

// Error Handler
export enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
}

interface FirestoreErrorInfo {
    error: string;
    userMessage?: string;
    operationType: OperationType;
    path: string | null;
    authInfo: {
        userId?: string | null;
        email?: string | null;
        emailVerified?: boolean | null;
        isAnonymous?: boolean | null;
        tenantId?: string | null;
        providerInfo?: {
            providerId?: string | null;
            email?: string | null;
        }[];
    }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
    const rawError = error instanceof Error ? error.message : String(error);
    
    let userMessage = 'An unexpected error occurred while communicating with the database.';
    if (rawError.includes('Missing or insufficient permissions') || rawError.includes('permission-denied')) {
        userMessage = 'Permission denied: You do not have the required access to perform this action.';
    } else if (rawError.includes('not-found')) {
        userMessage = 'Document not found: The requested record does not exist or has been deleted.';
    } else if (rawError.includes('unauthenticated')) {
        userMessage = 'Authentication required: Please sign in to continue.';
    } else if (rawError.includes('aborted')) {
        userMessage = 'The operation was aborted. Please try again.';
    }

    const errInfo: FirestoreErrorInfo = {
        error: rawError,
        userMessage,
        authInfo: {
            userId: auth.currentUser?.uid,
            email: auth.currentUser?.email,
            emailVerified: auth.currentUser?.emailVerified,
            isAnonymous: auth.currentUser?.isAnonymous,
            tenantId: auth.currentUser?.tenantId,
            providerInfo: auth.currentUser?.providerData?.map(provider => ({
                providerId: provider.providerId,
                email: provider.email,
            })) || []
        },
        operationType,
        path
    }
    console.error('Firestore Error: ', JSON.stringify(errInfo, null, 2));
    throw new Error(JSON.stringify(errInfo));
}
