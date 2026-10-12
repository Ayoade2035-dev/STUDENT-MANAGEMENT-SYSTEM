const students = [
  { id: '001', name: 'John Doe', department: 'Computer Science', year: '3rd Year', status: 'Active' },
  { id: '002', name: 'Jane Smith', department: 'Computer Engineering', year: '2nd Year', status: 'Active' },
  { id: '003', name: 'Michael Brown', department: 'Information Technology', year: '4th Year', status: 'On Leave' },
  { id: '004', name: 'Emma Johnson', department: 'Civil Engineering', year: '1st Year', status: 'Active' },
  { id: '005', name: 'Daniel Lee', department: 'Mechanical Engineering', year: '3rd Year', status: 'Inactive' },
  { id: '006', name: 'Olivia Davis', department: 'Electrical Engineering', year: '2nd Year', status: 'Active' }
];

const activityLog = [
  'New student added to Computer Science',
  'Attendance report was reviewed',
  'Student profile updated',
  'Department summary refreshed'
];

const STORAGE_KEY = 'student-management-system';
const ACTIVITY_KEY = 'student-activity-log';

const studentList = document.getElementById('studentList');
const form = document.getElementById('studentForm');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const departmentFilter = document.getElementById('departmentFilter');
const activityList = document.getElementById('activityList');
const themeToggle = document.getElementById('themeToggle');
const yearEl = document.getElementById('year');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sideNav = document.getElementById('sideNav');
const overlay = document.getElementById('sidebarOverlay');
const modal = document.getElementById('studentModal');
const modalBody = document.getElementById('studentModalBody');
const closeModalBtn = document.getElementById('closeModalBtn');

function loadData() {
  const savedStudents = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  const savedActivity = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || 'null');

  if (savedStudents && Array.isArray(savedStudents) && savedStudents.length) {
    students.splice(0, students.length, ...savedStudents);
  }

  if (savedActivity && Array.isArray(savedActivity)) {
    activityLog.splice(0, activityLog.length, ...savedActivity);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activityLog));
}

function populateDepartmentFilter() {
  const departments = [...new Set(students.map(student => student.department))];
  const currentValue = departmentFilter.value || 'All Departments';

  departmentFilter.innerHTML = '<option value="All Departments">All Departments</option>' +
    departments.map(department => `<option value="${department}">${department}</option>`).join('');

  if (departments.includes(currentValue)) {
    departmentFilter.value = currentValue;
  } else {
    departmentFilter.value = 'All Departments';
  }
}

function getFilteredStudents() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedDepartment = departmentFilter.value;

  return students.filter(student => {
    const matchesSearch = !query || [student.name, student.id, student.department].some(value => value.toLowerCase().includes(query));
    const matchesDepartment = selectedDepartment === 'All Departments' || student.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });
}

function renderStudentList() {
  const filteredStudents = getFilteredStudents();

  if (!filteredStudents.length) {
    studentList.innerHTML = '<div class="empty-state">No students found.</div>';
    updateSummary();
    return;
  }

  studentList.innerHTML = filteredStudents.map(student => `
    <div class="list-box">
      <figure>👨‍🎓</figure>
      <figcaption>
        <h3>${student.name}</h3>
        <p>ID: ${student.id}</p>
        <p>${student.department}</p>
        <p class="student-meta">${student.year} • ${student.status}</p>
        <div class="student-actions">
          <button class="view-btn" data-id="${student.id}">👁️ View</button>
          <button class="del" data-id="${student.id}">📋 Delete</button>
        </div>
      </figcaption>
    </div>
  `).join('');

  updateSummary();
}

function updateSummary() {
  const total = students.length;
  const active = students.filter(student => student.status === 'Active').length;
  const departments = new Set(students.map(student => student.department)).size;

  document.getElementById('totalStudentsValue').textContent = total;
  document.getElementById('activeStudentsValue').textContent = active;
  document.getElementById('departmentCountValue').textContent = departments;
  document.getElementById('courseCountValue').textContent = 8;
}

function addActivity(message) {
  activityLog.unshift(message);
  if (activityLog.length > 6) activityLog.pop();
  renderActivities();
  saveData();
}

function renderActivities() {
  activityList.innerHTML = activityLog.map(item => `<li>${item}</li>`).join('');
}

function deleteStudent(studentId) {
  const index = students.findIndex(student => student.id === studentId);
  if (index === -1) return;

  const [removed] = students.splice(index, 1);
  addActivity(`Student ${removed.name} was removed`);
  populateDepartmentFilter();
  renderStudentList();
  saveData();
}

function openStudentModal(studentId) {
  const student = students.find(item => item.id === studentId);
  if (!student) return;

  modalBody.innerHTML = `
    <div class="student-detail-card">
      <p><strong>Name:</strong> ${student.name}</p>
      <p><strong>ID:</strong> ${student.id}</p>
      <p><strong>Department:</strong> ${student.department}</p>
      <p><strong>Year:</strong> ${student.year}</p>
      <p><strong>Status:</strong> ${student.status}</p>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeStudentModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function handleStudentFormSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('studentName').value.trim();
  const id = document.getElementById('studentIdInput').value.trim();
  const department = document.getElementById('studentDepartment').value;
  const year = document.getElementById('studentYear').value;
  const status = document.getElementById('studentStatus').value;

  if (!name || !id || !department || !year) {
    alert('Please fill in all required fields.');
    return;
  }

  const alreadyExists = students.some(student => student.id === id);
  if (alreadyExists) {
    alert('A student with this ID already exists.');
    return;
  }

  students.push({ id, name, department, year, status });
  form.reset();
  populateDepartmentFilter();
  renderStudentList();
  addActivity(`New student added: ${name}`);
  saveData();
}

function handleStudentClick(event) {
  const target = event.target;
  const studentId = target.dataset.id;

  if (!studentId) return;

  if (target.classList.contains('del')) {
    deleteStudent(studentId);
    return;
  }

  if (target.classList.contains('view-btn')) {
    openStudentModal(studentId);
  }
}

function applyTheme(theme) {
  const root = document.body;
  const isDark = theme === 'dark';
  root.setAttribute('data-theme', theme);
  themeToggle.textContent = isDark ? '☀️' : '🌙';
}

function toggleTheme() {
  const nextTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  localStorage.setItem('sms-theme', nextTheme);
  applyTheme(nextTheme);
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('sms-theme') || 'light';
  applyTheme(savedTheme);
}

function attachEvents() {
  form.addEventListener('submit', handleStudentFormSubmit);
  searchBtn.addEventListener('click', renderStudentList);
  searchInput.addEventListener('input', renderStudentList);
  departmentFilter.addEventListener('change', renderStudentList);
  studentList.addEventListener('click', handleStudentClick);
  themeToggle.addEventListener('click', toggleTheme);
  closeModalBtn.addEventListener('click', closeStudentModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeStudentModal();
  });
  overlay.addEventListener('click', closeSidebar);
  hamburgerBtn.addEventListener('click', toggleSidebar);
}

function toggleSidebar() {
  const isOpen = sideNav.classList.contains('open');
  if (isOpen) {
    closeSidebar();
  } else {
    sideNav.classList.add('open');
    overlay.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
  }
}

function closeSidebar() {
  sideNav.classList.remove('open');
  overlay.classList.remove('active');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
}

function init() {
  loadData();
  populateDepartmentFilter();
  renderStudentList();
  renderActivities();
  initializeTheme();
  yearEl.textContent = new Date().getFullYear();
  attachEvents();
}

init();
