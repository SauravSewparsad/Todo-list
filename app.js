const todoForm = document.querySelector('form');
const todoInput = document.getElementById('todo-input');
const todoListUL = document.getElementById('todo-list');

// Sidebar Elements
const sidebar = document.getElementById('sidebar');
const openSidebarBtn = document.getElementById('open-sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar');
const categoryForm = document.getElementById('category-form');
const categoryInput = document.getElementById('category-input');
const categoryListUL = document.getElementById('category-list');

// App State
let allTodos = getTodos();
let allCategories = getCategories();
let activeCategory = 'All Tasks'; // Default view

// Initialize UI
updateCategoryList();
updateTodoList();

// --- EVENT LISTENERS ---

todoForm.addEventListener('submit', function(e){
    e.preventDefault();
    addTodo();
})

categoryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    addCategory();
});

openSidebarBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
});

closeSidebarBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
});

// --- CATEGORY LOGIC ---

function addCategory() {
    const newCat = categoryInput.value.trim();
    // Prevent empty, duplicate, or reserved names
    if (newCat && !allCategories.includes(newCat) && newCat.toLowerCase() !== 'all tasks') {
        allCategories.push(newCat);
        saveCategories();
        categoryInput.value = '';
        selectCategory(newCat); // Automatically switch to the newly created category
    }
}

function updateCategoryList() {
    categoryListUL.innerHTML = "";
    
    // 1. Render 'All Tasks' (No delete button for this one!)
    const allLi = document.createElement('li');
    allLi.innerText = 'All Tasks';
    if (activeCategory === 'All Tasks') allLi.classList.add('active');
    allLi.addEventListener('click', () => selectCategory('All Tasks'));
    categoryListUL.appendChild(allLi);

    // 2. Render custom categories with delete buttons
    allCategories.forEach((cat, index) => {
        const li = document.createElement('li');
        if (activeCategory === cat) li.classList.add('active');
        
        // Category Name Label
        const span = document.createElement('span');
        span.innerText = cat;
        span.style.flexGrow = "1";
        span.addEventListener('click', () => selectCategory(cat));
        
        // Delete Button
        const delBtn = document.createElement('button');
        delBtn.innerHTML = "&times;"; // The 'X' symbol
        delBtn.className = "delete-category";
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents clicking the category when deleting
            deleteCategory(cat);
        });

        li.appendChild(span);
        li.appendChild(delBtn);
        categoryListUL.appendChild(li);
    });
}

function deleteCategory(categoryName) {
    // 1. Remove from category list
    allCategories = allCategories.filter(cat => cat !== categoryName);
    saveCategories();

    // 2. Delete all todos associated with this category
    allTodos = allTodos.filter(todo => todo.category !== categoryName);
    saveTodos();

    // 3. Reset view if we just deleted the active category
    if (activeCategory === categoryName) {
        activeCategory = 'All Tasks';
    }

    updateCategoryList();
    updateTodoList();
}
function selectCategory(categoryName) {
    activeCategory = categoryName;
    updateCategoryList(); // Re-render to update the active highlight
    updateTodoList();     // Re-render todos to show only the selected category
    
    //close sidebar on mobile after clicking a category
    if(window.innerWidth <= 600) {
        sidebar.classList.remove('open');
    }
}

function saveCategories() {
    localStorage.setItem("categories", JSON.stringify(allCategories));
}

function getCategories() {
    const cats = localStorage.getItem("categories");
    return cats ? JSON.parse(cats) : ['Personal', 'Work']; // Give some defaults if empty
}

// --- TODO LOGIC ---

function addTodo(){
    const todoText = todoInput.value.trim();
    if(todoText.length > 0){
        // If we are in "All Tasks", default new tasks to the first category (or a fallback)
        const assignedCategory = activeCategory === 'All Tasks' 
            ? (allCategories[0] || 'Uncategorized') 
            : activeCategory;

        const todoObject = {
            text: todoText,
            completed: false,
            category: assignedCategory // Attach the category to the todo
        }
        allTodos.push(todoObject);
        updateTodoList();
        saveTodos();
        todoInput.value = "";
    }  
}

function updateTodoList(){
    todoListUL.innerHTML = "";
    
    // Filter the todos based on the active category
    const filteredTodos = activeCategory === 'All Tasks' 
        ? allTodos 
        : allTodos.filter(todo => todo.category === activeCategory);

    filteredTodos.forEach((todo) => {
        // We need the original index to safely delete/update the main allTodos array
        const originalIndex = allTodos.indexOf(todo); 
        const todoItem = createTodoItem(todo, originalIndex);
        todoListUL.append(todoItem);
    })
}

function createTodoItem(todo, todoIndex){
    const todoId = "todo-"+todoIndex;
    const todoLI = document.createElement("li");
    const todoText = todo.text;
    todoLI.className = "todo";
    todoLI.innerHTML = `
        <input type="checkbox" id="${todoId}">
        <label class="custom-checkbox" for="${todoId}">
            <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
        </label>
        <label for="${todoId}" class="todo-text">
            ${todoText}
        </label>
        <button class="delete-button">
            <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
        </button>
    `
    const deleteButton = todoLI.querySelector(".delete-button");
    deleteButton.addEventListener("click", ()=>{
        deleteTodoItem(todoIndex);
    })
    const checkbox = todoLI.querySelector("input");
    checkbox.addEventListener("change", ()=>{
        allTodos[todoIndex].completed = checkbox.checked;
        saveTodos();
    })
    checkbox.checked = todo.completed;
    return todoLI;
}

function deleteTodoItem(todoIndex){
    allTodos = allTodos.filter((_, i)=> i !== todoIndex);
    saveTodos();
    updateTodoList();
}

function saveTodos(){
    const todosJson = JSON.stringify(allTodos);
    localStorage.setItem("todos", todosJson);
}

function getTodos(){
    const todos = localStorage.getItem("todos") || "[]";
    return JSON.parse(todos);
}