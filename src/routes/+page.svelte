<script lang="ts">
    import { todos } from '$lib/stores/todos';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    let newTodoText: string = '';
    let editingId: number | null = null;
    let editText: string = '';
    let searchText: string = '';

    const SortType = {
        DateDesc: 'date_desc',
        DateAsc: 'date_asc',
        AlphaAsc: 'alpha_asc',
        AlphaDesc: 'alpha_desc'
    } as const;
    type SortType = typeof SortType[keyof typeof SortType];
    let sortType: SortType = SortType.DateDesc;

    function sortTodos(todos: typeof $todos): typeof $todos {
        switch (sortType) {
            case SortType.DateAsc:
                return [...todos].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            case SortType.DateDesc:
                return [...todos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case SortType.AlphaAsc:
                return [...todos].sort((a, b) => a.text.localeCompare(b.text));
            case SortType.AlphaDesc:
                return [...todos].sort((a, b) => b.text.localeCompare(a.text));
            default:
                return todos;
        }
    }

    onMount(() => {
        todos.initialize().catch(console.error);
    });

    const handleAdd = (): void => {
        if (newTodoText.trim()) {
            todos.add(newTodoText).catch(console.error);
            newTodoText = '';
        }
    };

    const startEditing = (todo: { id: number; text: string }): void => {
        editingId = todo.id;
        editText = todo.text;
    };

    const saveEdit = (): void => {
        if (editText.trim() && editingId !== null) {
            todos.edit(editingId, editText).catch(console.error);
            editingId = null;
        }
    };

    const cancelEdit = (): void => {
        editingId = null;
    };

    const handleKeyDown = (e: KeyboardEvent, action: () => void): void => {
        if (e.key === 'Enter') {
            action();
        }
    };

    const handleEditKeyDown = (e: KeyboardEvent): void => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    };
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div class="p-8">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-2xl font-bold text-gray-800">Todo App</h1>
                <div class="text-sm text-gray-500">
                    {$todos.filter(t => !t.completed).length} remaining
                </div>
            </div>

            <div class="flex mb-4 gap-2 items-center">
                <input
                    type="text"
                    bind:value={searchText}
                    placeholder="Поиск..."
                    class="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <select bind:value={sortType} class="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm">
                    <option value={SortType.DateDesc}>Сначала новые</option>
                    <option value={SortType.DateAsc}>Сначала старые</option>
                    <option value={SortType.AlphaAsc}>А-Я</option>
                    <option value={SortType.AlphaDesc}>Я-А</option>
                </select>
            </div>

            <div class="flex mb-6">
                <input
                    type="text"
                    bind:value={newTodoText}
                    placeholder="Добавить новую запись"
                    class="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    on:keydown={(e) => handleKeyDown(e, handleAdd)}
                />
                <button
                    on:click={handleAdd}
                    class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r-lg transition duration-200"
                >
                    Add
                </button>
            </div>

            <div class="space-y-3">
                {#each sortTodos($todos.filter(todo => todo.text.toLowerCase().includes(searchText.toLowerCase()))) as todo (todo.id)}
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-150" in:fade={{ duration: 250 }} out:fade={{ duration: 200 }}>
                        <div class="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={todo.completed}
                                on:change={() => todos.toggle(todo.id)}
                                class="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                            />
                            {#if editingId === todo.id}
                                <input
                                    type="text"
                                    bind:value={editText}
                                    class="flex-grow px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    on:keydown={handleEditKeyDown}
                                />
                            {:else}
                                <span
                                    class:line-through={todo.completed}
                                    class:text-gray-400={todo.completed}
                                    class="text-gray-800"
                                >
                                    {todo.text}
                                </span>
                            {/if}
                        </div>
                        <div class="flex space-x-2">
                            {#if editingId === todo.id}
                                <button
                                    on:click={saveEdit}
                                    class="text-green-600 hover:text-green-800"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                                <button
                                    on:click={cancelEdit}
                                    class="text-red-600 hover:text-red-800"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            {:else}
                                <button
                                    on:click={() => startEditing(todo)}
                                    class="text-blue-600 hover:text-blue-800"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                                <button
                                    on:click={() => todos.remove(todo.id)}
                                    class="text-red-600 hover:text-red-800"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            {/if}
                        </div>
                    </div>
                {:else}
                    <div class="text-center py-6 text-gray-500">
                        No todos yet. Add one above!
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
