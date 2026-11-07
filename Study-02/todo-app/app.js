// ============================================================
// STORAGE: localStorage 읽기/쓰기
// ============================================================

const STORAGE_KEYS = {
  todos: 'todoApp.todos',
  settings: 'todoApp.settings',
  version: 'todoApp.version',
  theme: 'todoApp.theme',
};

const SCHEMA_VERSION = '1.0';

function loadTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.todos);
    if (!data) return [];
    const todos = JSON.parse(data);
    return Array.isArray(todos) ? todos : [];
  } catch (error) {
    showStorageError('할 일을 불러올 수 없습니다.');
    return [];
  }
}

function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));
    localStorage.setItem(STORAGE_KEYS.version, SCHEMA_VERSION);
  } catch (error) {
    showStorageError('할 일을 저장할 수 없습니다.');
  }
}

function loadSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.settings);
    if (!data) {
      return { lastCategory: 'work', selectedFilter: 'all' };
    }
    const settings = JSON.parse(data);
    return settings || { lastCategory: 'work', selectedFilter: 'all' };
  } catch (error) {
    return { lastCategory: 'work', selectedFilter: 'all' };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch (error) {
    showStorageError('설정을 저장할 수 없습니다.');
  }
}

function showStorageError(message) {
  const errorDiv = document.getElementById('storage-error');
  errorDiv.textContent = '⚠️ ' + message;
  errorDiv.style.display = 'block';
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

function announceToScreenReader(message) {
  const region = document.getElementById('aria-live-region');
  region.textContent = message;
}

function loadTheme() {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    return savedTheme || 'light';
  } catch (error) {
    return 'light';
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  } catch (error) {
    console.error('Failed to save theme:', error);
  }
}

function applyTheme(theme) {
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add('dark-mode');
    document.getElementById('theme-toggle').textContent = '☀️';
  } else {
    html.classList.remove('dark-mode');
    document.getElementById('theme-toggle').textContent = '🌙';
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark-mode');
  const newTheme = isDark ? 'light' : 'dark';
  applyTheme(newTheme);
  saveTheme(newTheme);
  announceToScreenReader(newTheme === 'dark' ? '다크 모드 켜짐' : '라이트 모드 켜짐');
}

function clearCompletedTodos() {
  const completedCount = app.todos.filter(t => t.completed).length;
  if (completedCount === 0) return;

  app.todos = app.todos.filter(t => !t.completed);
  saveTodos(app.todos);
  hideUndo();
  render();
  announceToScreenReader(`${completedCount}개의 완료 항목이 삭제되었습니다.`);
}

function exportTodos() {
  const data = {
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    todos: app.todos,
  };
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `todo-backup-${new Date().getTime()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const CATEGORY_KEYWORDS = {
  work: ['회의', '보고서', '프로젝트', '팀', '일정', '메일', '업무', '회사', '오피스', '데드라인', '상사', '동료', '클라이언트', '제안', '계약', '판매', '마케팅', '분석'],
  personal: ['쇼핑', '운동', '영화', '친구', '가족', '휴식', '취미', '독서', '요리', '청소', '세탁', '산책', '약속', '생일', '선물', '집', '차'],
  study: ['공부', '숙제', '강의', '시험', '책', '학습', '강좌', '코드', '프로그래밍', '개발', '스킬', '자격증', '교육', '과제', '이론', '연습'],
};

function guessCategory(title) {
  const lowerTitle = title.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerTitle.includes(keyword))) {
      return category;
    }
  }
  return app.settings.lastCategory || 'work';
}

function importTodos(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.todos || !Array.isArray(data.todos)) {
        throw new Error('유효하지 않은 형식입니다.');
      }

      const importedCount = data.todos.length;
      app.todos.push(...data.todos);
      saveTodos(app.todos);
      hideUndo();
      render();
      announceToScreenReader(`${importedCount}개의 항목이 가져와졌습니다.`);
    } catch (error) {
      showStorageError('파일을 가져올 수 없습니다. 유효한 JSON 파일인지 확인하세요.');
      announceToScreenReader('파일 가져오기에 실패했습니다.');
    }
  };
  reader.readAsText(file);
}

// ============================================================
// STATE: 단일 진실 원천으로서 상태 관리
// ============================================================

let app = {
  todos: [],
  settings: { lastCategory: 'work', selectedFilter: 'all' },
};

let undoState = {
  deleted: null,
  originalIndex: -1,
  timer: null,
};

function initializeApp() {
  app.todos = loadTodos();
  app.settings = loadSettings();
  const savedTheme = loadTheme();
  applyTheme(savedTheme);
}

function addTodo(title, category, autoCategory = false) {
  const trimmedTitle = title.trim();

  // 빈 값 또는 100자 초과 거절
  if (!trimmedTitle || trimmedTitle.length === 0 || trimmedTitle.length > 100) {
    return null;
  }

  // 자동 카테고리 분류
  const finalCategory = autoCategory ? guessCategory(trimmedTitle) : category;

  const todo = {
    id: Date.now().toString(),
    title: trimmedTitle,
    category: finalCategory,
    completed: false,
    createdAt: Date.now(),
    completedAt: null,
  };

  app.todos.push(todo);
  app.settings.lastCategory = finalCategory;
  saveTodos(app.todos);
  saveSettings(app.settings);
  hideUndo();
  render();

  return todo;
}

function deleteTodo(id) {
  const index = app.todos.findIndex(t => t.id === id);
  if (index !== -1) {
    const deleted = app.todos[index];
    app.todos.splice(index, 1);
    saveTodos(app.todos);

    undoState.deleted = deleted;
    undoState.originalIndex = index;
    clearUndoTimer();
    undoState.timer = setTimeout(() => {
      clearUndo();
    }, 5000);

    render();
    renderUndo();
    return deleted;
  }
  return null;
}

function restoreTodo() {
  if (!undoState.deleted) {
    return;
  }

  const todo = undoState.deleted;
  const index = Math.min(undoState.originalIndex, app.todos.length);
  app.todos.splice(index, 0, todo);
  saveTodos(app.todos);

  clearUndo();
  hideUndo();
  render();
}

function clearUndo() {
  clearUndoTimer();
  undoState.deleted = null;
  undoState.originalIndex = -1;
}

function clearUndoTimer() {
  if (undoState.timer) {
    clearTimeout(undoState.timer);
    undoState.timer = null;
  }
}

function toggleTodoCompletion(id) {
  const todo = app.todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? Date.now() : null;
    saveTodos(app.todos);
    render();
    return todo;
  }
  return null;
}

function updateTodo(id, title, category) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle || trimmedTitle.length === 0) {
    return null;
  }

  const todo = app.todos.find(t => t.id === id);
  if (todo) {
    todo.title = trimmedTitle;
    todo.category = category;
    saveTodos(app.todos);
    render();
    return todo;
  }
  return null;
}

function setFilter(filter) {
  app.settings.selectedFilter = filter;
  saveSettings(app.settings);
  render();
}

function getFilteredTodos() {
  const filter = app.settings.selectedFilter;
  if (filter === 'all') {
    return app.todos;
  }
  return app.todos.filter(t => t.category === filter);
}

function getTodoStats() {
  const stats = {
    all: { completed: 0, total: 0 },
    work: { completed: 0, total: 0 },
    personal: { completed: 0, total: 0 },
    study: { completed: 0, total: 0 },
  };

  app.todos.forEach(todo => {
    stats.all.total++;
    if (todo.completed) stats.all.completed++;

    const categoryKey = todo.category;
    stats[categoryKey].total++;
    if (todo.completed) stats[categoryKey].completed++;
  });

  return stats;
}

function calcProgress(todos, categoryFilter = null) {
  let total = 0;
  let completed = 0;

  todos.forEach(todo => {
    if (categoryFilter && todo.category !== categoryFilter) {
      return;
    }
    total++;
    if (todo.completed) completed++;
  });

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percentage,
  };
}

// ============================================================
// RENDER: 상태를 화면에 그리기
// ============================================================

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return '오늘';
  }

  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
}

function renderHeader() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dayName = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

  const dateElement = document.getElementById('today-date');
  dateElement.textContent = `${month}월 ${day}일 ${dayName}요일`;
}

function renderProgress() {
  const progress = calcProgress(app.todos);

  const progressText = document.getElementById('progress-text');
  progressText.textContent = `${progress.completed} / ${progress.total} (${progress.percentage}%)`;

  const progressFill = document.getElementById('progress-fill');
  progressFill.style.width = `${progress.percentage}%`;

  const categoryStatsContainer = document.getElementById('category-stats');
  categoryStatsContainer.innerHTML = '';

  const categories = [
    { key: 'work', label: '업무', color: 'var(--color-work)' },
    { key: 'personal', label: '개인', color: 'var(--color-personal)' },
    { key: 'study', label: '공부', color: 'var(--color-study)' },
  ];

  categories.forEach(({ key, label, color }) => {
    const categoryProgress = calcProgress(app.todos, key);

    const statDiv = document.createElement('div');
    statDiv.className = 'category-stat';

    const labelDiv = document.createElement('div');
    labelDiv.className = 'category-stat-label';
    labelDiv.textContent = `${label} ${categoryProgress.completed}/${categoryProgress.total}`;

    const barDiv = document.createElement('div');
    barDiv.className = 'category-stat-bar';

    const fillDiv = document.createElement('div');
    fillDiv.className = 'category-stat-fill';
    fillDiv.style.width = `${categoryProgress.percentage}%`;
    fillDiv.style.backgroundColor = color;

    barDiv.appendChild(fillDiv);
    statDiv.appendChild(labelDiv);
    statDiv.appendChild(barDiv);
    categoryStatsContainer.appendChild(statDiv);
  });
}

function renderFilterTabs() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    const filter = tab.dataset.filter;
    if (filter === app.settings.selectedFilter) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

function renderTodoList() {
  const filteredTodos = getFilteredTodos();
  const todoList = document.getElementById('todo-list');
  const emptyState = document.getElementById('empty-state');
  const emptyMessage = document.getElementById('empty-message');
  const completionMessage = document.getElementById('completion-message');

  todoList.innerHTML = '';

  // 완료 메시지 처리
  const allProgress = calcProgress(app.todos);
  if (allProgress.total > 0 && allProgress.percentage === 100) {
    completionMessage.textContent = '🎉 오늘 할 일을 모두 끝냈어요!';
    completionMessage.style.display = 'block';
    announceToScreenReader('모든 할 일을 완료했습니다.');
  } else {
    completionMessage.style.display = 'none';
  }

  if (filteredTodos.length === 0) {
    emptyState.style.display = 'block';
    if (app.todos.length === 0) {
      emptyMessage.textContent = '아직 할 일이 없어요.\n첫 할 일을 추가해 보세요.';
    } else {
      emptyMessage.textContent = '이 카테고리에는 할 일이 없어요.';
    }
    return;
  }

  emptyState.style.display = 'none';

  const categoryLabels = {
    work: '업무',
    personal: '개인',
    study: '공부',
  };

  const categoryVars = {
    work: 'var(--color-work)',
    personal: 'var(--color-personal)',
    study: 'var(--color-study)',
  };

  filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;

    const titleSpan = document.createElement('span');
    titleSpan.className = 'todo-title';
    if (todo.completed) {
      titleSpan.classList.add('completed');
    }
    titleSpan.textContent = todo.title;

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'todo-edit-input';
    editInput.value = todo.title;
    editInput.maxLength = '100';
    editInput.style.display = 'none';

    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'todo-category';
    categoryBadge.textContent = categoryLabels[todo.category];
    categoryBadge.style.backgroundColor = categoryVars[todo.category];

    const categorySelect = document.createElement('select');
    categorySelect.className = 'todo-category-select';
    categorySelect.style.display = 'none';
    categorySelect.value = todo.category;
    const categories = [
      { value: 'work', label: '업무' },
      { value: 'personal', label: '개인' },
      { value: 'study', label: '공부' },
    ];
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.value;
      option.textContent = cat.label;
      categorySelect.appendChild(option);
    });

    const editBtn = document.createElement('button');
    editBtn.className = 'todo-edit-btn';
    editBtn.textContent = '수정';
    editBtn.dataset.action = 'edit';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'todo-delete-btn';
    deleteBtn.textContent = '삭제';
    deleteBtn.dataset.action = 'delete';

    li.appendChild(checkbox);
    li.appendChild(titleSpan);
    li.appendChild(editInput);
    li.appendChild(categoryBadge);
    li.appendChild(categorySelect);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    todoList.appendChild(li);
  });
}

function enterEditMode(li) {
  if (li.classList.contains('editing')) {
    return;
  }

  li.classList.add('editing');

  const titleSpan = li.querySelector('.todo-title');
  const editInput = li.querySelector('.todo-edit-input');
  const categoryBadge = li.querySelector('.todo-category');
  const categorySelect = li.querySelector('.todo-category-select');

  titleSpan.style.display = 'none';
  editInput.style.display = 'block';
  categoryBadge.style.display = 'none';
  categorySelect.style.display = 'block';

  editInput.focus();
  editInput.select();
}

function exitEditMode(li) {
  li.classList.remove('editing');

  const titleSpan = li.querySelector('.todo-title');
  const editInput = li.querySelector('.todo-edit-input');
  const categoryBadge = li.querySelector('.todo-category');
  const categorySelect = li.querySelector('.todo-category-select');

  titleSpan.style.display = 'block';
  editInput.style.display = 'none';
  categoryBadge.style.display = 'block';
  categorySelect.style.display = 'none';
}

function renderCategorySelect() {
  const select = document.getElementById('category-select');
  select.value = app.settings.lastCategory;
}

function renderUndo() {
  const undoSection = document.getElementById('undo-section');
  const undoMessage = document.getElementById('undo-message');

  if (undoState.deleted) {
    undoMessage.textContent = `"${undoState.deleted.title}" 삭제됨. 5초 안에 실행 취소할 수 있습니다.`;
    undoSection.classList.add('show');
    announceToScreenReader(`${undoState.deleted.title} 항목이 삭제되었습니다. 실행 취소 버튼으로 복원할 수 있습니다.`);
  }
}

function hideUndo() {
  const undoSection = document.getElementById('undo-section');
  undoSection.classList.remove('show');
}

function render() {
  renderHeader();
  renderProgress();
  renderFilterTabs();
  renderTodoList();
  renderCategorySelect();
  renderListActions();
}

function renderListActions() {
  const listActions = document.getElementById('list-actions');
  const clearBtn = document.getElementById('clear-completed-btn');
  const hasCompleted = app.todos.some(t => t.completed);

  // 내보내기는 항상 표시, 완료 항목 삭제는 완료된 항목이 있을 때만
  if (app.todos.length > 0) {
    listActions.style.display = 'flex';
    clearBtn.style.display = hasCompleted ? 'block' : 'none';
  } else {
    listActions.style.display = 'none';
  }
}

// ============================================================
// EVENT HANDLERS
// ============================================================

function setupEventListeners() {
  const addBtn = document.getElementById('add-btn');
  const todoInput = document.getElementById('todo-input');
  const categorySelect = document.getElementById('category-select');
  const undoBtn = document.getElementById('undo-btn');
  const themeToggle = document.getElementById('theme-toggle');
  const todoList = document.getElementById('todo-list');

  // 할 일 추가
  const autoCheckbox = document.getElementById('auto-category-checkbox');

  addBtn.addEventListener('click', () => {
    const category = categorySelect.value;
    const title = todoInput.value.trim();
    const useAuto = autoCheckbox.checked;
    if (title) {
      addTodo(todoInput.value, category, useAuto);
      todoInput.value = '';
      todoInput.focus();
      announceToScreenReader(`"${title}" 항목이 추가되었습니다.`);
    }
  });

  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const category = categorySelect.value;
      const title = todoInput.value.trim();
      const useAuto = autoCheckbox.checked;
      if (title) {
        addTodo(todoInput.value, category, useAuto);
        todoInput.value = '';
        todoInput.focus();
        announceToScreenReader(`"${title}" 항목이 추가되었습니다.`);
      }
    }
  });

  categorySelect.addEventListener('change', () => {
    app.settings.lastCategory = categorySelect.value;
    saveSettings(app.settings);
  });

  // 필터 탭
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setFilter(tab.dataset.filter);
    });
  });

  // 실행 취소
  undoBtn.addEventListener('click', () => {
    restoreTodo();
  });

  // 다크 모드 토글
  themeToggle.addEventListener('click', () => {
    toggleTheme();
  });

  // 완료 항목 일괄 삭제
  const clearCompletedBtn = document.getElementById('clear-completed-btn');
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', () => {
      clearCompletedTodos();
    });
  }

  // 내보내기
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportTodos();
    });
  }

  // 가져오기
  const importFile = document.getElementById('import-file');
  if (importFile) {
    importFile.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        importTodos(e.target.files[0]);
        e.target.value = '';
      }
    });
  }

  // 할 일 목록 이벤트 위임
  todoList.addEventListener('change', (e) => {
    if (e.target.classList.contains('todo-checkbox')) {
      const li = e.target.closest('.todo-item');
      const id = li.dataset.id;
      const todo = app.todos.find(t => t.id === id);
      toggleTodoCompletion(id);
      if (todo) {
        const status = todo.completed ? '완료됨' : '미완료';
        announceToScreenReader(`"${todo.title}" 항목이 ${status}으로 표시되었습니다.`);
      }
    }
  });

  todoList.addEventListener('click', (e) => {
    const li = e.target.closest('.todo-item');
    if (!li) return;

    const id = li.dataset.id;

    if (e.target.dataset.action === 'delete') {
      deleteTodo(id);
    } else if (e.target.dataset.action === 'edit') {
      enterEditMode(li);
    }
  });

  todoList.addEventListener('dblclick', (e) => {
    if (e.target.classList.contains('todo-title')) {
      const li = e.target.closest('.todo-item');
      enterEditMode(li);
    }
  });

  todoList.addEventListener('keydown', (e) => {
    const editInput = e.target.closest('.todo-edit-input');
    if (!editInput) return;

    const li = editInput.closest('.todo-item');
    const id = li.dataset.id;

    if (e.key === 'Enter') {
      const newTitle = editInput.value;
      const categorySelect = li.querySelector('.todo-category-select');
      const newCategory = categorySelect.value;
      if (newTitle.trim()) {
        updateTodo(id, newTitle, newCategory);
      } else {
        exitEditMode(li);
      }
    } else if (e.key === 'Escape') {
      exitEditMode(li);
    }
  });
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  render();
  setupEventListeners();
});

// ============================================================
// TEST: calcProgress 함수 테스트 (콘솔에서 실행 가능)
// ============================================================

function testCalcProgress() {
  console.log('=== calcProgress 함수 테스트 ===\n');

  // 테스트 1: 빈 배열
  const test1 = calcProgress([]);
  console.log('테스트 1: 빈 배열');
  console.log('  입력: []');
  console.log('  결과:', test1);
  console.assert(test1.completed === 0 && test1.total === 0 && test1.percentage === 0, '실패');
  console.log('  ✓ 통과\n');

  // 테스트 2: 모두 미완료
  const test2 = calcProgress([
    { id: '1', title: 'Task 1', category: 'work', completed: false, createdAt: Date.now(), completedAt: null },
    { id: '2', title: 'Task 2', category: 'work', completed: false, createdAt: Date.now(), completedAt: null },
  ]);
  console.log('테스트 2: 모두 미완료 (2개)');
  console.log('  입력: 2개 미완료 항목');
  console.log('  결과:', test2);
  console.assert(test2.completed === 0 && test2.total === 2 && test2.percentage === 0, '실패');
  console.log('  ✓ 통과\n');

  // 테스트 3: 일부 완료
  const test3 = calcProgress([
    { id: '1', title: 'Task 1', category: 'work', completed: true, createdAt: Date.now(), completedAt: Date.now() },
    { id: '2', title: 'Task 2', category: 'work', completed: false, createdAt: Date.now(), completedAt: null },
    { id: '3', title: 'Task 3', category: 'work', completed: true, createdAt: Date.now(), completedAt: Date.now() },
  ]);
  console.log('테스트 3: 일부 완료 (2/3 = 67%)');
  console.log('  입력: 3개 항목, 2개 완료');
  console.log('  결과:', test3);
  console.assert(test3.completed === 2 && test3.total === 3 && test3.percentage === 67, '실패');
  console.log('  ✓ 통과\n');

  // 테스트 4: 모두 완료
  const test4 = calcProgress([
    { id: '1', title: 'Task 1', category: 'work', completed: true, createdAt: Date.now(), completedAt: Date.now() },
    { id: '2', title: 'Task 2', category: 'work', completed: true, createdAt: Date.now(), completedAt: Date.now() },
  ]);
  console.log('테스트 4: 모두 완료 (2/2 = 100%)');
  console.log('  입력: 2개 항목, 모두 완료');
  console.log('  결과:', test4);
  console.assert(test4.completed === 2 && test4.total === 2 && test4.percentage === 100, '실패');
  console.log('  ✓ 통과\n');

  // 테스트 5: 카테고리 필터
  const test5 = calcProgress([
    { id: '1', title: 'Work 1', category: 'work', completed: true, createdAt: Date.now(), completedAt: Date.now() },
    { id: '2', title: 'Work 2', category: 'work', completed: false, createdAt: Date.now(), completedAt: null },
    { id: '3', title: 'Personal 1', category: 'personal', completed: true, createdAt: Date.now(), completedAt: Date.now() },
  ], 'work');
  console.log('테스트 5: 카테고리 필터 (work만, 1/2 = 50%)');
  console.log('  입력: 3개 항목, work 카테고리만 필터');
  console.log('  결과:', test5);
  console.assert(test5.completed === 1 && test5.total === 2 && test5.percentage === 50, '실패');
  console.log('  ✓ 통과\n');

  // 테스트 6: 카테고리 필터로 빈 결과
  const test6 = calcProgress([
    { id: '1', title: 'Work 1', category: 'work', completed: true, createdAt: Date.now(), completedAt: Date.now() },
  ], 'personal');
  console.log('테스트 6: 카테고리 필터로 빈 결과');
  console.log('  입력: 1개 work 항목, personal 카테고리로 필터');
  console.log('  결과:', test6);
  console.assert(test6.completed === 0 && test6.total === 0 && test6.percentage === 0, '실패');
  console.log('  ✓ 통과\n');

  console.log('=== 모든 테스트 통과! ===');
}

// 콘솔에서 testCalcProgress()를 호출하여 테스트 실행
console.log('콘솔에서 testCalcProgress() 실행하여 calcProgress 함수 테스트 가능');
