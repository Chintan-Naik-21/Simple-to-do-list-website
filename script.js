let todos = [];
let currentFilter = 'all';

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const todoCount = document.getElementById('todoCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const emptyState = document.getElementById('emptyState');

function init() {
    loadTodos();
    renderTodos();
    updateTodoCount();

    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTodos();
        });
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);
}

function addTodo() {
    const text = todoInput.value.trim();

    if (text === '') {
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    todos.push(todo);
    todoInput.value = '';
    saveTodos();
    renderTodos();
    updateTodoCount();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateTodoCount();
}

function toggleTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateTodoCount();
    }
}

function editTodo(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const todoText = todoItem.querySelector('.todo-text');
    const currentText = todoText.textContent;

    todoText.contentEditable = true;
    todoText.classList.add('editing');
    todoText.focus();

    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(todoText);
    selection.removeAllRanges();
    selection.addRange(range);

    function saveEdit() {
        const newText = todoText.textContent.trim();

        if (newText === '') {
            todoText.textContent = currentText;
        } else {
            const todo = todos.find(todo => todo.id === id);
            if (todo) {
                todo.text = newText;
                saveTodos();
            }
        }

        todoText.contentEditable = false;
        todoText.classList.remove('editing');
        todoText.removeEventListener('blur', saveEdit);
        todoText.removeEventListener('keypress', handleEnter);
    }

    function handleEnter(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            todoText.blur();
        }
    }

    todoText.addEventListener('blur', saveEdit);
    todoText.addEventListener('keypress', handleEnter);
}

function filterTodos() {
    if (currentFilter === 'all') {
        return todos;
    } else if (currentFilter === 'active') {
        return todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        return todos.filter(todo => todo.completed);
    }
}

function renderTodos() {
    const filteredTodos = filterTodos();

    if (todos.length === 0) {
        emptyState.classList.remove('hidden');
        todoList.innerHTML = '';
        return;
    }

    emptyState.classList.add('hidden');

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<li style="text-align: center; padding: 32px; color: #a0aec0;">No todos to show</li>';
        return;
    }

    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <div class="checkbox-wrapper">
                <input
                    type="checkbox"
                    class="todo-checkbox"
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id})"
                    aria-label="Mark todo as ${todo.completed ? 'incomplete' : 'complete'}"
                >
            </div>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button
                    class="edit-btn"
                    onclick="editTodo(${todo.id})"
                    aria-label="Edit todo"
                >
                    Edit
                </button>
                <button
                    class="delete-btn"
                    onclick="deleteTodo(${todo.id})"
                    aria-label="Delete todo"
                >
                    Delete
                </button>
            </div>
        </li>
    `).join('');
}

function updateTodoCount() {
    const activeTodos = todos.filter(todo => !todo.completed).length;
    todoCount.textContent = `${activeTodos} ${activeTodos === 1 ? 'item' : 'items'} left`;
}

function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
    updateTodoCount();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

init();
