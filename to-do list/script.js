let lists = {};
let currentList = "";

// Add new list
function addList() {
  const newListName = document.getElementById("newListInput").value.trim();
  if (!newListName) return;

  if (!lists[newListName]) {
    lists[newListName] = [];
    currentList = newListName;
    updateListSelector();
    renderTasks();
  }
  document.getElementById("newListInput").value = "";
}

// Update list dropdown
function updateListSelector() {
  const selector = document.getElementById("listSelector");
  selector.innerHTML = "";

  for (let list in lists) {
    const option = document.createElement("option");
    option.value = list;
    option.textContent = list;
    if (list === currentList) option.selected = true;
    selector.appendChild(option);
  }
}

// Change active list
function changeList() {
  currentList = document.getElementById("listSelector").value;
  renderTasks();
}

// Add task
function addTask() {
  const taskText = document.getElementById("taskInput").value.trim();
  const taskDateTime = document.getElementById("taskDateTime").value;

  if (!taskText || !currentList) return;

  const task = {
    text: taskText,
    dateTime: taskDateTime,
    completed: false
  };

  lists[currentList].push(task);
  document.getElementById("taskInput").value = "";
  document.getElementById("taskDateTime").value = "";
  renderTasks();
}

// Render tasks
function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  if (!currentList || !lists[currentList]) return;

  lists[currentList].forEach((task, index) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";

    const taskInfo = document.createElement("span");
    taskInfo.textContent = `${task.text} (${task.dateTime || "No date"})`;

    // Mark complete button
    const completeBtn = document.createElement("button");
    completeBtn.textContent = task.completed ? "Undo" : "Complete";
    completeBtn.onclick = () => {
      task.completed = !task.completed;
      renderTasks();
    };

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => {
      const newText = prompt("Edit task:", task.text);
      if (newText !== null) task.text = newText.trim() || task.text;
      renderTasks();
    };

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => {
      lists[currentList].splice(index, 1);
      renderTasks();
    };

    li.appendChild(taskInfo);
    li.appendChild(completeBtn);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}
