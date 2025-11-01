import { db } from './firebase';
import {
	collection,
	addDoc,
	updateDoc,
	doc,
	getDoc,
	getDocs,
	query,
	orderBy,
	limit,
	serverTimestamp,
	type Timestamp
} from 'firebase/firestore';

export interface Message {
	role: 'user' | 'assistant';
	content: string;
	timestamp?: Timestamp;
}

export interface ChatSession {
	id?: string;
	messages: Message[];
	createdAt: Timestamp;
	updatedAt: Timestamp;
	userId?: string; // Optional: for multi-user support
}

const COLLECTION_NAME = 'chat_sessions';

/**
 * Create a new chat session
 */
export async function createChatSession(messages: Message[], userId?: string): Promise<string> {
	try {
		const docRef = await addDoc(collection(db, COLLECTION_NAME), {
			messages,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
			userId: userId || 'anonymous'
		});
		return docRef.id;
	} catch (error) {
		console.error('Error creating chat session:', error);
		throw error;
	}
}

/**
 * Update an existing chat session
 */
export async function updateChatSession(sessionId: string, messages: Message[]): Promise<void> {
	try {
		const docRef = doc(db, COLLECTION_NAME, sessionId);
		await updateDoc(docRef, {
			messages,
			updatedAt: serverTimestamp()
		});
	} catch (error) {
		console.error('Error updating chat session:', error);
		throw error;
	}
}

/**
 * Get a specific chat session
 */
export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
	try {
		const docRef = doc(db, COLLECTION_NAME, sessionId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			return {
				id: docSnap.id,
				...docSnap.data()
			} as ChatSession;
		}
		return null;
	} catch (error) {
		console.error('Error getting chat session:', error);
		throw error;
	}
}

/**
 * Get recent chat sessions
 */
export async function getRecentChatSessions(limitCount: number = 10): Promise<ChatSession[]> {
	try {
		const q = query(
			collection(db, COLLECTION_NAME),
			orderBy('updatedAt', 'desc'),
			limit(limitCount)
		);

		const querySnapshot = await getDocs(q);
		return querySnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data()
		})) as ChatSession[];
	} catch (error) {
		console.error('Error getting recent chat sessions:', error);
		throw error;
	}
}

/**
 * Save current chat to Firebase
 * Creates new session if sessionId is null, otherwise updates existing
 */
export async function saveChatHistory(
	messages: Message[],
	sessionId: string | null = null
): Promise<string> {
	try {
		if (sessionId) {
			await updateChatSession(sessionId, messages);
			return sessionId;
		} else {
			return await createChatSession(messages);
		}
	} catch (error) {
		console.error('Error saving chat history:', error);
		throw error;
	}
}
