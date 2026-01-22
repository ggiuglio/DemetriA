import { db } from '$lib/firebase';
import { 
	collection, 
	doc, 
	getDocs, 
	getDoc, 
	addDoc, 
	updateDoc, 
	deleteDoc, 
	onSnapshot,
	query,
	type Unsubscribe 
} from 'firebase/firestore';

export interface Field {
	id: string;
	type: 'agriculture' | 'garden';
	name: string;
	length: number;
	width: number;
	unit: 'ha' | 'm²';
	crop: string;
	status: string;
	plantedDate?: string;
	expectedHarvest?: string;
	soilType?: string;
	pH?: number;
	stoniness?: string;
	drainage?: string;
	irrigation?: string;
	notes?: string;
	lat?: number;
	lng?: number;
	address?: string;
	street?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	country?: string;
}

const FIELDS_COLLECTION = 'fields';

export const fieldsService = {
	// Get all fields (one-time read)
	async getAllFields(): Promise<Field[]> {
		if (!db) return [];
		
		try {
			const fieldsRef = collection(db, FIELDS_COLLECTION);
			const snapshot = await getDocs(fieldsRef);
			
			return snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			} as Field));
		} catch (error) {
			console.error('Error getting fields:', error);
			return [];
		}
	},

	// Get field by ID (one-time read)
	async getFieldById(id: string): Promise<Field | null> {
		if (!db) return null;
		
		try {
			const fieldRef = doc(db, FIELDS_COLLECTION, id);
			const snapshot = await getDoc(fieldRef);
			
			if (snapshot.exists()) {
				return {
					id: snapshot.id,
					...snapshot.data()
				} as Field;
			}
			return null;
		} catch (error) {
			console.error('Error getting field:', error);
			return null;
		}
	},

	// Subscribe to all fields (real-time)
	subscribeToFields(callback: (fields: Field[]) => void): Unsubscribe {
		if (!db) return () => {};
		
		const fieldsRef = collection(db, FIELDS_COLLECTION);
		const q = query(fieldsRef);
		
		return onSnapshot(q, (snapshot) => {
			const fields = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			} as Field));
			callback(fields);
		}, (error) => {
			console.error('Error subscribing to fields:', error);
			callback([]);
		});
	},

	// Subscribe to single field (real-time)
	subscribeToField(id: string, callback: (field: Field | null) => void): Unsubscribe {
		if (!db) return () => {};
		
		const fieldRef = doc(db, FIELDS_COLLECTION, id);
		
		return onSnapshot(fieldRef, (snapshot) => {
			if (snapshot.exists()) {
				callback({
					id: snapshot.id,
					...snapshot.data()
				} as Field);
			} else {
				callback(null);
			}
		}, (error) => {
			console.error('Error subscribing to field:', error);
			callback(null);
		});
	},

	// Create new field
	async createField(field: Omit<Field, 'id'>): Promise<string> {
		if (!db) throw new Error('Firestore not initialized');
		
		try {
			const fieldsRef = collection(db, FIELDS_COLLECTION);
			const docRef = await addDoc(fieldsRef, field);
			return docRef.id;
		} catch (error) {
			console.error('Error creating field:', error);
			throw error;
		}
	},

	// Update field
	async updateField(id: string, updates: Partial<Omit<Field, 'id'>>): Promise<void> {
		if (!db) throw new Error('Firestore not initialized');
		
		try {
			const fieldRef = doc(db, FIELDS_COLLECTION, id);
			await updateDoc(fieldRef, updates);
		} catch (error) {
			console.error('Error updating field:', error);
			throw error;
		}
	},

	// Delete field
	async deleteField(id: string): Promise<void> {
		if (!db) throw new Error('Firestore not initialized');
		
		try {
			const fieldRef = doc(db, FIELDS_COLLECTION, id);
			await deleteDoc(fieldRef);
		} catch (error) {
			console.error('Error deleting field:', error);
			throw error;
		}
	}
};
