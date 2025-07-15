export interface Todo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: string;
    tags?: string[];
}

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TodoDB', 1);

        request.onerror = (event) => {
            console.error('Database error:', (event.target as IDBRequest).error);
            reject((event.target as IDBRequest).error);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('todos')) {
                const store = db.createObjectStore('todos', { keyPath: 'id' });
                store.createIndex('completed', 'completed', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };
    });
};

export const getAllTodos = async (db: IDBDatabase): Promise<Todo[]> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('todos', 'readonly');
        const store = transaction.objectStore('todos');
        const request = store.getAll();

        request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBRequest<Todo[]>).result);
        };
    });
};

export const addTodo = async (db: IDBDatabase, todo: Todo): Promise<number> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('todos', 'readwrite');
        const store = transaction.objectStore('todos');
        const request = store.add(todo);

        request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBRequest<IDBValidKey>).result as number);
        };
    });
};

export const updateTodo = async (db: IDBDatabase, todo: Todo): Promise<number> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('todos', 'readwrite');
        const store = transaction.objectStore('todos');
        const request = store.put(todo);

        request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBRequest<IDBValidKey>).result as number);
        };
    });
};

export const deleteTodo = async (db: IDBDatabase, id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('todos', 'readwrite');
        const store = transaction.objectStore('todos');
        const request = store.delete(id);

        request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
        };

        request.onsuccess = () => {
            resolve();
        };
    });
};
