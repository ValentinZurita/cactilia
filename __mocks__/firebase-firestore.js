// Mock básico de Firebase Firestore
export const collection = jest.fn(() => ({}));
export const getDocs = jest.fn(() => Promise.resolve({ docs: [] }));
export const doc = jest.fn(() => ({}));
export const getDoc = jest.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })); 