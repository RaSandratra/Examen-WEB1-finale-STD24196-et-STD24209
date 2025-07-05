
// Application State
let currentUser = null;
let notes = [];
let isLoginMode = true;
let editingNoteId = null;
let currentTheme = 'light';
let selectedColor = 'default';

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const toggleText = document.getElementById('toggleText');
const logoutBtn = document.getElementById('logoutBtn');
const themeToggle = document.getElementById('themeToggle');
const exportBtn = document.getElementById('exportBtn');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const noteTag = document.getElementById('noteTag');
const isImportant = document.getElementById('isImportant');
const addNoteBtn = document.getElementById('addNoteBtn');
const charCount = document.getElementById('charCount');
const quickNoteBtn = document.getElementById('quickNoteBtn');
const templateBtn = document.getElementById('templateBtn');

// Notes containers
const importantNotes = document.getElementById('importantNotes');
const allNotes = document.getElementById('allNotes');
const favoriteNotes = document.getElementById('favoriteNotes');

// Sort controls
const sortImportant = document.getElementById('sortImportant');
const sortAll = document.getElementById('sortAll');
const sortFavorites = document.getElementById('sortFavorites');

// Modal elements
const editModal = document.getElementById('editModal');
const closeEditModal = document.getElementById('closeEditModal');
const cancelEdit = document.getElementById('cancelEdit');
const saveEdit = document.getElementById('saveEdit');
const editTitle = document.getElementById('editTitle');
const editContent = document.getElementById('editContent');
const editTag = document.getElementById('editTag');

const templatesModal = document.getElementById('templatesModal');
const closeTemplatesModal = document.getElementById('closeTemplatesModal');

// Stats elements
const totalNotes = document.getElementById('totalNotes');
const favoriteCount = document.getElementById('favoriteCount');
const importantCount = document.getElementById('importantCount');

// Toast container
const toastContainer = document.getElementById('toastContainer');

// Templates
const noteTemplates = {
    meeting: {
        title: 'Réunion - {date}',
        content: `# Réunion du {date}

## Participants
- 

## Ordre du jour
1. 
2. 
3. 

## Notes
- 

## Actions à suivre
- [ ] 
- [ ] 

## Prochaine réunion
Date: 
Heure: `,
        tag: 'réunion'
    },
    todo: {
        title: 'To-Do - {date}',
        content: `# Liste de tâches

## Priorité haute
- [ ] 
- [ ] 

## Priorité moyenne
- [ ] 
- [ ] 

## Priorité faible
- [ ] 
- [ ] 

## Notes
`,
        tag: 'todo'
    },
    idea: {
        title: 'Idée - {date}',
        content: `# Nouvelle idée

## Description
{Décrivez votre idée ici}

## Contexte


## Avantages
- 
- 

## Étapes suivantes
1. 
2. 
3. 

## Ressources nécessaires
- 
- `,
        tag: 'idée'
    },
    journal: {
        title: 'Journal - {date}',
        content: `# Journal du {date}

## Humeur
😊 😐 😔 😴 😤 (sélectionnez une émotion)

## Ce qui s'est bien passé aujourd'hui


## Ce qui pourrait être amélioré


## Gratitude
Je suis reconnaissant(e) pour:
- 
- 
- 

## Objectifs pour demain
- 
- 

## Réflexions personnelles

`,
        tag: 'journal'
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    initializeEventListeners();
    applyTheme();
    
    if (currentUser) {
        showMainApp();
    } else {
        showLoginScreen();
    }
});

// Event Listeners
function initializeEventListeners() {
    // Authentication
    loginBtn.addEventListener('click', handleAuth);
    toggleAuthMode.addEventListener('click', toggleAuthenticationMode);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Export
    exportBtn.addEventListener('click', exportNotes);
    
    // Note creation
    addNoteBtn.addEventListener('click', addNote);
    quickNoteBtn.addEventListener('click', createQuickNote);
    templateBtn.addEventListener('click', showTemplatesModal);
    
    // Search
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    
    // Character counter
    noteContent.addEventListener('input', updateCharCounter);
    
    // Color picker
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', (e) => selectColor(e.target.dataset.color));
    });
    
    // Toolbar buttons
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => applyFormatting(e.target.dataset.format));
    });
    
    // Sort controls
    sortImportant.addEventListener('change', () => renderNotes());
    sortAll.addEventListener('change', () => renderNotes());
    sortFavorites.addEventListener('change', () => renderNotes());
    
    // Modal controls
    closeEditModal.addEventListener('click', closeModal);
    cancelEdit.addEventListener('click', closeModal);
    saveEdit.addEventListener('click', saveEditedNote);
    closeTemplatesModal.addEventListener('click', () => templatesModal.classList.remove('show'));
    
    // Template selection
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const template = e.currentTarget.dataset.template;
            applyTemplate(template);
            templatesModal.classList.remove('show');
        });
    });
    
    // Close modals on backdrop click
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) closeModal();
    });
    
    templatesModal.addEventListener('click', function(e) {
        if (e.target === templatesModal) templatesModal.classList.remove('show');
    });
    
    // Enter key handlers
    loginEmail.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleAuth();
    });
    
    loginPassword.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleAuth();
    });
    
    noteTitle.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) addNote();
    });
}

// Authentication Functions
function handleAuth() {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    
    if (!email || !password) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('Format d\'email invalide', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.email === email);
    
    if (isLoginMode) {
        // Login
        if (existingUser && existingUser.password === password) {
            currentUser = email;
            localStorage.setItem('currentUser', currentUser);
            loadUserNotes();
            showMainApp();
            showToast('Connexion réussie!', 'success');
            clearAuthForm();
        } else {
            showToast('Email ou mot de passe incorrect', 'error');
        }
    } else {
        // Register
        if (existingUser) {
            showToast('Cet email est déjà utilisé', 'error');
        } else {
            users.push({ email, password });
            localStorage.setItem('users', JSON.stringify(users));
            currentUser = email;
            localStorage.setItem('currentUser', currentUser);
            notes = [];
            showMainApp();
            showToast('Inscription réussie!', 'success');
            clearAuthForm();
        }
    }
}

function toggleAuthenticationMode() {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        loginBtn.innerHTML = '<span>Se connecter</span><i class="fas fa-arrow-right"></i>';
        toggleText.textContent = 'Pas de compte ? S\'inscrire';
    } else {
        loginBtn.innerHTML = '<span>S\'inscrire</span><i class="fas fa-user-plus"></i>';
        toggleText.textContent = 'Déjà un compte ? Se connecter';
    }
    clearAuthForm();
}

function handleLogout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        currentUser = null;
        notes = [];
        localStorage.removeItem('currentUser');
        showLoginScreen();
        showToast('Déconnexion réussie', 'success');
        clearAuthForm();
    }
}

function clearAuthForm() {
    loginEmail.value = '';
    loginPassword.value = '';
}

// Theme Functions
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme();
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = themeToggle.querySelector('.theme-icon');
    
    if (currentTheme === 'dark') {
        themeIcon.className = 'fas fa-sun theme-icon';
    } else {
        themeIcon.className = 'fas fa-moon theme-icon';
    }
}

// Note Management Functions
function addNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    const tag = noteTag.value.trim();
    const important = isImportant.checked;
    
    if (!title || !content) {
        showToast('Le titre et le contenu sont requis', 'error');
        return;
    }
    
    const note = {
        id: generateId(),
        title,
        content,
        tag,
        isImportant: important,
        isFavorite: false,
        color: selectedColor,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    notes.unshift(note);
    saveToStorage();
    renderNotes();
    updateStats();   
    clearNoteForm();
    showToast('Note ajoutée avec succès!', 'success');
}

function createQuickNote() {
    const now = new Date();
    const quickNote = {
        id: generateId(),
        title: `Note rapide - ${formatTime(now)}`,
        content: '',
        tag: 'rapide',
        isImportant: false,
        isFavorite: false,
        color: 'default',
        createdAt: now,
        updatedAt: now
    };
    
    notes.unshift(quickNote);
    saveToStorage();
    renderNotes();
    updateStats();
    editNote(quickNote.id);
    showToast('Note rapide créée!', 'success');
}

function applyTemplate(templateName) {
    const template = noteTemplates[templateName];
    if (!template) return;
    
    const now = new Date();
    const dateStr = formatDate(now);
    const timeStr = formatTime(now);
    
    noteTitle.value = template.title.replace('{date}', dateStr).replace('{time}', timeStr);
    noteContent.value = template.content.replace(/{date}/g, dateStr).replace(/{time}/g, timeStr);
    noteTag.value = template.tag;
    
    updateCharCounter();
    showToast(`Modèle "${templateName}" appliqué!`, 'success');
}

function editNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        editingNoteId = noteId;
        editTitle.value = note.title;
        editContent.value = note.content;
        editTag.value = note.tag || '';
        
        // Set color
        document.querySelectorAll('.modal-color-picker .color-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === (note.color || 'default'));
        });
        
        showModal();
    }
}

function saveEditedNote() {
    const title = editTitle.value.trim();
    const content = editContent.value.trim();
    const tag = editTag.value.trim();
    const color = document.querySelector('.modal-color-picker .color-option.active')?.dataset.color || 'default';
    
    if (!title || !content) {
        showToast('Le titre et le contenu sont requis', 'error');
        return;
    }
    
    const noteIndex = notes.findIndex(n => n.id === editingNoteId);
    if (noteIndex !== -1) {
        notes[noteIndex] = {
            ...notes[noteIndex],
            title,
            content,
            tag,
            color,
            updatedAt: new Date()
        };
        
        saveToStorage();
        renderNotes();
        updateStats();
        closeModal();
        showToast('Note modifiée avec succès!', 'success');
    }
}

function toggleFavorite(noteId) {
    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
        notes[noteIndex].isFavorite = !notes[noteIndex].isFavorite;
        notes[noteIndex].updatedAt = new Date();
        saveToStorage();
        renderNotes();
        updateStats();
        
        const status = notes[noteIndex].isFavorite ? 'ajoutée aux' : 'retirée des';
        showToast(`Note ${status} favoris`, 'success');
    }
}

function deleteNote(noteId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
        notes = notes.filter(n => n.id !== noteId);
        saveToStorage();
        renderNotes();
        updateStats();
        showToast('Note supprimée', 'success');
    }
}

// Search Functions
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query.length > 0) {
        clearSearchBtn.classList.remove('hidden');
    } else {
        clearSearchBtn.classList.add('hidden');
    }
    
    renderNotes(query);
}

function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    renderNotes();
}

// Formatting Functions
function applyFormatting(format) {
    const textarea = document.activeElement;
    if (textarea.tagName !== 'TEXTAREA') return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = '';
    
    switch (format) {
        case 'bold':
            replacement = `**${selectedText}**`;
            break;
        case 'italic':
            replacement = `*${selectedText}*`;
            break;
        case 'heading':
            replacement = `## ${selectedText}`;
            break;
        case 'list':
            replacement = `- ${selectedText}`;
            break;
        case 'code':
            replacement = `\`${selectedText}\``;
            break;
    }
    
    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    
    if (textarea === noteContent) {
        updateCharCounter();
    }
}

function updateCharCounter() {
    const count = noteContent.value.length;
    charCount.textContent = count;
    
    if (count > 1000) {
        charCount.style.color = 'var(--accent-warning)';
    } else if (count > 500) {
        charCount.style.color = 'var(--accent-primary)';
    } else {
        charCount.style.color = 'var(--text-muted)';
    }
}

function selectColor(color) {
    selectedColor = color;
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === color);
    });
}

// Render Functions
function renderNotes(searchQuery = '') {
    const filteredNotes = searchQuery 
        ? notes.filter(note => 
            note.title.toLowerCase().includes(searchQuery) ||
            note.content.toLowerCase().includes(searchQuery) ||
            (note.tag && note.tag.toLowerCase().includes(searchQuery))
          )
        : notes;
    
    // Sort and render each category
    renderNoteCategory(
        filteredNotes.filter(n => n.isImportant),
        importantNotes,
        sortImportant.value
    );
    
    renderNoteCategory(
        filteredNotes,
        allNotes,
        sortAll.value
    );
    
    renderNoteCategory(
        filteredNotes.filter(n => n.isFavorite),
        favoriteNotes,
        sortFavorites.value
    );
}

function renderNoteCategory(categoryNotes, container, sortType) {
    const sortedNotes = sortNotes(categoryNotes, sortType);
    
    container.innerHTML = '';
    
    if (sortedNotes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sticky-note" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-muted); text-align: center;">Aucune note dans cette catégorie</p>
            </div>
        `;
        return;
    }
    
    sortedNotes.forEach(note => {
        const noteCard = createNoteCard(note);
        container.appendChild(noteCard);
    });
}

function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.dataset.noteId = note.id;
    card.dataset.color = note.color || 'default';
    
    card.innerHTML = `
        <div class="note-header">
            <h4 class="note-title">${escapeHtml(note.title)}</h4>
            <div class="note-actions">
                <button class="note-action-btn favorite-btn ${note.isFavorite ? 'active' : ''}" 
                        onclick="toggleFavorite('${note.id}')" title="Favori">
                    <i class="fas fa-star"></i>
                </button>
                <button class="note-action-btn edit-btn" 
                        onclick="editNote('${note.id}')" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="note-action-btn delete-btn" 
                        onclick="deleteNote('${note.id}')" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="note-content">${formatContent(note.content)}</div>
        <div class="note-footer">
            ${note.tag ? `<span class="note-tag">${escapeHtml(note.tag)}</span>` : '<span></span>'}
            <span class="note-date">${formatDate(note.createdAt)}</span>
        </div>
    `;
    
    return card;
}

// Export Functions
function exportNotes() {
    if (notes.length === 0) {
        showToast('Aucune note à exporter', 'warning');
        return;
    }
    
    const exportData = {
        user: currentUser,
        exportDate: new Date().toISOString(),
        totalNotes: notes.length,
        notes: notes.map(note => ({
            ...note,
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString()
        }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `notes-${currentUser}-${formatDate(new Date())}.json`;
    link.click();
    
    showToast('Notes exportées avec succès!', 'success');
}

// Utility Functions
function sortNotes(notesToSort, sortType) {
    return [...notesToSort].sort((a, b) => {
        switch (sortType) {
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'alpha-asc':
                return a.title.localeCompare(b.title);
            case 'alpha-desc':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });
}

function formatContent(content) {
    // Enhanced Markdown support
    return content
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/## (.*)/g, '<h2>$1</h2>')
        .replace(/# (.*)/g, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/- (.*)/g, '<li>$1</li>')
        .replace(/\n/g, '<br>')
        .substring(0, 200) + (content.length > 200 ? '...' : '');
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// UI Functions
function showMainApp() {
    loginScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');
    renderNotes();
    updateStats();
}

function showLoginScreen() {
    mainApp.classList.add('hidden');
    loginScreen.classList.remove('hidden');
}

function showModal() {
    editModal.classList.add('show');
    editTitle.focus();
}

function closeModal() {
    editModal.classList.remove('show');
    editingNoteId = null;
}

function showTemplatesModal() {
    templatesModal.classList.add('show');
}

function clearNoteForm() {
    noteTitle.value = '';
    noteContent.value = '';
    noteTag.value = '';
    isImportant.checked = false;
    selectColor('default');
    updateCharCounter();
}

function updateStats() {
    totalNotes.textContent = notes.length;
    favoriteCount.textContent = notes.filter(n => n.isFavorite).length;
    importantCount.textContent = notes.filter(n => n.isImportant).length;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 type === 'warning' ? 'exclamation-triangle' :
                 'info-circle';
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <i class="fas fa-${icon}" style="font-size: 1.2rem;"></i>
            <span style="font-weight: 500;">${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Storage Functions
function saveToStorage() {
    if (currentUser) {
        localStorage.setItem(`notes_${currentUser}`, JSON.stringify(notes));
    }
}

function loadFromStorage() {
    currentTheme = localStorage.getItem('theme') || 'light';
    currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
        loadUserNotes();
    }
}

function loadUserNotes() {
    const savedNotes = localStorage.getItem(`notes_${currentUser}`);
    if (savedNotes) {
        notes = JSON.parse(savedNotes).map(note => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt)
        }));
    } else {
        notes = [];
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N: New note
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        noteTitle.focus();
    }
    
    // Ctrl/Cmd + S: Save note (when editing)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (editModal.classList.contains('show')) {
            saveEditedNote();
        } else if (noteTitle.value || noteContent.value) {
            addNote();
        }
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
        if (editModal.classList.contains('show')) {
            closeModal();
        }
        if (templatesModal.classList.contains('show')) {
            templatesModal.classList.remove('show');
        }
    }
    
    // Ctrl/Cmd + F: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
    }
});

// Add modal color picker event listeners
document.addEventListener('click', function(e) {
    if (e.target.matches('.modal-color-picker .color-option')) {
        const color = e.target.dataset.color;
        document.querySelectorAll('.modal-color-picker .color-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === color);
        });
    }
});
