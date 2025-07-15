import { writable } from 'svelte/store';
import { initDB, getAllTodos, addTodo, updateTodo, deleteTodo, type Todo } from '../utils/db';

function createTodosStore() {
    const { subscribe, set, update } = writable<Todo[]>([]);
    let db: IDBDatabase;

    const initialize = async (): Promise<void> => {
        db = await initDB();
        const todos = await getAllTodos(db);
        set(todos);
    };

    const add = async (text: string): Promise<void> => {
        const newTodo: Todo = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        await addTodo(db, newTodo);
        update(todos => [...todos, newTodo]);
    };

    const toggle = async (id: number): Promise<void> => {
        update(todos => {
            const todo = todos.find(t => t.id === id);
            if (todo) {
                const updatedTodo = { ...todo, completed: !todo.completed };
                updateTodo(db, updatedTodo).catch(console.error);
                return todos.map(t => t.id === id ? updatedTodo : t);
            }
            return todos;
        });
    };

    const remove = async (id: number): Promise<void> => {
        await deleteTodo(db, id);
        update(todos => todos.filter(t => t.id !== id));
    };

    const edit = async (id: number, newText: string): Promise<void> => {
        update(todos => {
            const todo = todos.find(t => t.id === id);
            if (todo) {
                const updatedTodo = { ...todo, text: newText };
                updateTodo(db, updatedTodo).catch(console.error);
                return todos.map(t => t.id === id ? updatedTodo : t);
            }
            return todos;
        });
    };

    return {
        subscribe,
        initialize,
        add,
        toggle,
        remove,
        edit
    };
}

export const todos = createTodosStore();
