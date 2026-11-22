const STORAGE_KEY = "little-list-tasks-v1";

const form = document.querySelector("#add-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const countLabel = document.querySelector("#task-count");
const progressLabel = document.querySelector("#progress-label");
const clearButton = document.querySelector("#clear-completed");
const todayLabel = document.querySelector("#today-label");
const filterButtons = document.querySelectorAll(".filter-button");

let tasks = loadTasks();
let activeFilter = "all";

todayLabel.textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(new Date());

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(savedTasks)) return [];
    return savedTasks.filter((task) =>
      task &&
      typeof task.id === "string" &&
      typeof task.text === "string" &&
      typeof task.completed === "boolean"
    );
  } catch (error) {
    console.error("Could not load saved tasks.", error);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks in this browser.", error);
    progressLabel.textContent = "Could not save changes on this device.";
  }
}

function renderTasks() {
  const visibleTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });
  const remaining = tasks.filter((task) => !task.completed).length;
  const completed = tasks.length - remaining;

  list.replaceChildren();
  for (const task of visibleTasks) {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " is-complete" : ""}`;
    item.dataset.taskId = task.id;

    const toggle = document.createElement("button");
    toggle.className = "task-toggle";
    toggle.type = "button";
    toggle.dataset.action = "toggle";
    toggle.setAttribute("aria-label", task.completed ? `Mark ${task.text} as to do` : `Mark ${task.text} as done`);
    toggle.setAttribute("aria-pressed", String(task.completed));
    const check = document.createElement("span");
    check.setAttribute("aria-hidden", "true");
    check.textContent = task.completed ? "✓" : "";
    toggle.append(check);

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const remove = document.createElement("button");
    remove.className = "delete-task";
    remove.type = "button";
    remove.dataset.action = "delete";
    remove.setAttribute("aria-label", `Delete ${task.text}`);
    remove.textContent = "×";

    item.append(toggle, text, remove);
    list.append(item);
  }

  emptyState.classList.toggle("is-visible", visibleTasks.length === 0);
  if (tasks.length === 0) {
    emptyState.querySelector(".empty-title").textContent = "Your mind is clear.";
    emptyState.querySelector(".empty-copy").textContent = "Add a task above to get started.";
  } else if (visibleTasks.length === 0) {
    emptyState.querySelector(".empty-title").textContent =
      activeFilter === "active" ? "Nothing left to do." : "Nothing completed just yet.";
    emptyState.querySelector(".empty-copy").textContent = "Try another filter or add a new task.";
  }

  countLabel.textContent = `${remaining} ${remaining === 1 ? "task" : "tasks"} left`;
  progressLabel.textContent = tasks.length > 0 && completed === tasks.length
    ? "Look at you go. Everything is done!"
    : "A fresh start, whenever you need one.";
  clearButton.hidden = completed === 0;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }

  tasks.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text,
    completed: false,
  });
  saveTasks();
  activeFilter = "all";
  updateFilterButtons();
  renderTasks();
  form.reset();
  input.focus();
});

list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const item = button.closest(".task-item");
  const taskId = item.dataset.taskId;
  if (button.dataset.action === "toggle") {
    tasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
  } else if (button.dataset.action === "delete") {
    tasks = tasks.filter((task) => task.id !== taskId);
  }

  saveTasks();
  renderTasks();
});

function updateFilterButtons() {
  for (const button of filterButtons) {
    const selected = button.dataset.filter === activeFilter;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  }
}

for (const button of filterButtons) {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    updateFilterButtons();
    renderTasks();
  });
}

clearButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();
