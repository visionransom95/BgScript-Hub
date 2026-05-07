import { Timestamp } from 'firebase/firestore';

export interface Snippet {
    id: string;
    title: string;
    language: string;
    code: string;
    authorId: string;
    authorName: string;
    createdAt: Timestamp;
    tags?: string[];
}
