// ==== Calendar Setup ====
const monthYear = document.getElementById('month-year');
const calendarDays = document.getElementById('calendar-days');
const prevBtn = document.getElementById('prev-month');
const nextBtn = document.getElementById('next-month');
const selectedDateDisplay = document.getElementById('selected-date');

let currentDate = new Date();
let selectedDate = new Date();

// render weekday headers + date cells into the same grid container
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  monthYear.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // reset grid content and add weekday headers
  calendarDays.innerHTML = '';
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(name => {
    const dn = document.createElement('div');
    dn.className = 'day-name';
    dn.textContent = name;
    calendarDays.appendChild(dn);
  });

  // empty slots before 1st
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    // keep empty as a grid cell (no content)
    calendarDays.appendChild(empty);
  }

  for (let d = 1; d <= lastDate; d++) {
    const dayCell = document.createElement('div');
    dayCell.textContent = d;
    dayCell.className = 'calendar-day';
    const thisDate = new Date(year, month, d);

    // Highlight today
    const today = new Date();
    if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dayCell.classList.add('today');
    }

    // Highlight selected date if it matches
    if (
      d === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    ) {
      dayCell.classList.add('selected');
    }

    // Click to select date
    dayCell.addEventListener('click', () => {
      selectedDate = thisDate;
      renderCalendar();
      loadTasks();
    });

    calendarDays.appendChild(dayCell);
  }

  selectedDateDisplay.textContent = selectedDate.toDateString();
  updateMonthlySummary();
}

prevBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  // if selectedDate is not in current month, move selection to 1st of month
  if (selectedDate.getMonth() !== currentDate.getMonth() || selectedDate.getFullYear() !== currentDate.getFullYear()) {
    selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }
  renderCalendar();
  loadTasks();
});
nextBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  if (selectedDate.getMonth() !== currentDate.getMonth() || selectedDate.getFullYear() !== currentDate.getFullYear()) {
    selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }
  renderCalendar();
  loadTasks();
});

renderCalendar();

// ==== Task Handling ====
const addTaskBtn = document.getElementById('add-task');
const taskText = document.getElementById('task-text');
const taskTime = document.getElementById('task-time');
const tasksList = document.getElementById('tasks');

addTaskBtn.addEventListener('click', () => {
  const text = taskText.value.trim();
  const time = taskTime.value;
  if (!text || !time) {
    alert('Please enter both time and task!');
    return;
  }
  const task = { text, time, done: false };
  saveTask(task);
  addTaskToList(task);
  taskText.value = '';
  taskTime.value = '';
  updateMonthlySummary();
});


function addTaskToList(task) {
  const li = document.createElement('li');
  li.className = 'task-item';
  if (task.done) li.classList.add('done');

  li.innerHTML = `
    <span class="task-text">${task.time} - ${task.text}</span>
    <div class="task-buttons">
      <button class="done-btn">Done</button>
      <button class="delete-btn">Delete</button>
    </div>
  `;

  li.querySelector('.done-btn').addEventListener('click', () => {
    li.classList.toggle('done');
    updateTaskStatus(task.text);
    updateMonthlySummary();
  });

  li.querySelector('.delete-btn').addEventListener('click', () => {
    li.remove();
    deleteTask(task.text);
    updateMonthlySummary();
  });

  tasksList.appendChild(li);
}

function loadTasks() {
  tasksList.innerHTML = '';
  const tasks = getTasks();
  tasks.forEach(addTaskToList);
}

function saveTask(task) {
  const dateKey = selectedDate.toDateString();
  const tasks = getTasks();
  tasks.push(task);
  localStorage.setItem(dateKey, JSON.stringify(tasks));
}

function getTasks() {
  const dateKey = selectedDate.toDateString();
  return JSON.parse(localStorage.getItem(dateKey)) || [];
}

function updateTaskStatus(text) {
  const dateKey = selectedDate.toDateString();
  const tasks = getTasks();
  tasks.forEach(t => { if (t.text === text) t.done = !t.done; });
  localStorage.setItem(dateKey, JSON.stringify(tasks));
}

function deleteTask(text) {
  const dateKey = selectedDate.toDateString();
  let tasks = getTasks().filter(t => t.text !== text);
  localStorage.setItem(dateKey, JSON.stringify(tasks));
}

// ==== Monthly Summary ====
const totalTasksDisplay = document.getElementById('total-tasks');
const completedTasksDisplay = document.getElementById('completed-tasks');

function updateMonthlySummary() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  let total = 0;
  let completed = 0;

  const lastDate = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= lastDate; d++) {
    const dateKey = new Date(year, month, d).toDateString();
    const tasks = JSON.parse(localStorage.getItem(dateKey)) || [];
    total += tasks.length;
    completed += tasks.filter(t => t.done).length;
  }
}

renderCalendar();
loadTasks();

