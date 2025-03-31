import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import './index.css';
import { Plus, Settings, LogOut, Terminal } from 'lucide-react';
import PromptCard from './components/PromptCard';
import PromptTable from './components/PromptTable';
import AddEditPromptModal from './components/AddEditPromptModal';
import { AppSettings, Prompt, PromptFilter } from './types';
import TagsFilter from './components/TagsFilter';
import SettingsModal from './components/SettingsModal';
import TestPromptModal from './components/TestPromptModal';
import ActionBar from './components/ActionBar';
import Login from './components/Login';
import { useLoading } from './contexts/LoadingContext';


const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  defaultLLM: {
    provider: 'ollama',
    model: 'llama3.2:latest',
  },
  defaultTags: [
    "Code", "Browser", "Search", "Image", "writing", "Music", "Ideas", "Fun", "Misc", "Personal", "Work", "Video", "GameDev", 'Simple','Complex', 'Reasoning'
  ]
};

export function App() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<PromptFilter>(PromptFilter.ALL);
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [allTags, setAllTags] = useState<string[]>(DEFAULT_SETTINGS.defaultTags);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { setLoading } = useLoading();

  // Fetch prompts from Firestore on mount
  useEffect(() => {
    const fetchPrompts = async () => {
      if (!user) return; // Ensure user is logged in
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'prompts'));
        const fetchedPrompts: Prompt[] = querySnapshot.docs
          .map(doc => ({
            ...(doc.data() as Prompt),
            id: doc.id,
          }))
          .filter(prompt => prompt.userId === user.uid); // Filter by userId
        setPrompts(fetchedPrompts);

        // Extract all unique tags from prompts
        const tags = Array.from(new Set(fetchedPrompts.flatMap(prompt => prompt.tags)));

        setAllTags((defaultTags) => {
          let s = new Set(defaultTags.concat(tags))
          return [...s]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [user, setLoading]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAddPrompt = () => {
    setCurrentPrompt(null);
    setIsModalOpen(true);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setCurrentPrompt(prompt);
    setIsModalOpen(true);
  };

  const handleTestPrompt = (prompt: Prompt) => {
    setCurrentPrompt(prompt);
    setIsTestModalOpen(true);
  };

  const handleSavePrompt = async (prompt: Prompt) => {
    setLoading(true);
    try {
      if (currentPrompt) {
        // Update existing prompt
        const promptRef = doc(db, 'prompts', currentPrompt.id);
        await updateDoc(promptRef, prompt as { [key: string]: any });
        setPrompts(prompts.map(p => (p.id === currentPrompt.id ? { ...prompt, id: currentPrompt.id } : p)));
      } else {
        // Add new prompt
        const docRef = await addDoc(collection(db, 'prompts'), { ...prompt, userId: user?.uid }); // Include isSystem
        if (user?.uid) {
          setPrompts([...prompts, { ...prompt, id: docRef.id, userId: user.uid }]);
        } else {
          console.error('User ID is undefined');
        }
      }
    } finally {
      setLoading(false);
    }
    setIsModalOpen(false);
  };

  const handleDeletePrompt = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'prompts', id));
      setPrompts(prompts.filter(prompt => prompt.id !== id));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  };

  const handleToggleTemplate = async (id: string) => {
    setLoading(true);
    try {
      const prompt = prompts.find(p => p.id === id);
      if (prompt) {
        const updatedPrompt = { ...prompt, isTemplate: !prompt.isTemplate };
        const promptRef = doc(db, 'prompts', id);
        await updateDoc(promptRef, { isTemplate: updatedPrompt.isTemplate });
        setPrompts(prompts.map(p => (p.id === id ? updatedPrompt : p)));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  };

  const handleToggleFavorite = async (id: string) => {
    setLoading(true)
    try {
      const prompt = prompts.find(p => p.id === id);
      if (prompt) {
        const updatedPrompt = { ...prompt, isFavorite: !prompt.isFavorite };
        const promptRef = doc(db, 'prompts', id);
        await updateDoc(promptRef, { isFavorite: updatedPrompt.isFavorite });
        setPrompts(prompts.map(p => (p.id === id ? updatedPrompt : p)));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setIsSettingsOpen(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'card' ? 'table' : 'card');
  };

  const handleSortPrompts = (direction: 'asc' | 'desc') => {
    const sortedPrompts = [...prompts].sort((a, b) => {
      const tagA = a.tags.join(', ').toLowerCase();
      const tagB = b.tags.join(', ').toLowerCase();
      return direction === 'asc' ? tagA.localeCompare(tagB) : tagB.localeCompare(tagA);
    });
    setPrompts(sortedPrompts);
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to the first page when items per page changes
  };

  // Filter prompts based on search term, selected tags, and active filter
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch =
      searchTerm === '' ||
      prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 || selectedTags.every(tag => prompt.tags.includes(tag));

    const matchesFilter =
      activeFilter === PromptFilter.ALL ||
      (activeFilter === PromptFilter.TEMPLATES && prompt.isTemplate) ||
      (activeFilter === PromptFilter.FAVORITES && prompt.isFavorite) ||
      (activeFilter === PromptFilter.SYSTEM && prompt.isSystem); // Add system filter logic

    return matchesSearch && matchesTags && matchesFilter;
  });

  const paginatedPrompts = filteredPrompts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPrompts.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Apply theme
  useEffect(() => {
    const applyTheme = (themeSetting: 'light' | 'dark' | 'system') => {
      if (themeSetting === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (themeSetting === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (themeSetting === 'system') {
        // For system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    // Apply theme immediately when settings change
    applyTheme(settings.theme);

    // Set up listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [settings.theme]);


  if (!user) {
    return <Login onLogin={() => setUser(auth.currentUser)} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
        <header className="border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex justify-between items-center">
                <span className='text-primary mr-2'><Terminal size={24} /></span>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                  My <span className='text-primary'>PROMPT</span> collection
                </h1>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  title="Logout" // Tooltip text
                >
                  <LogOut size={18} className="mr-2" />
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Settings size={18} className="mr-2" />
                  Settings
                </button>
                <button
                  onClick={handleAddPrompt}
                  className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  <Plus size={18} className="mr-2" />
                  Add Prompt
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
          <ActionBar
            prompts={prompts}
            setPrompts={setPrompts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            selectedTags={selectedTags}
            toggleViewMode={toggleViewMode}
            viewMode={viewMode}
          />

          {showFilters && (
            <div className="mb-6 p-4 bg-white border border-gray-200 rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Filters</h3>
                <button
                  onClick={() => {
                    setActiveFilter(PromptFilter.ALL);
                    setSelectedTags([]);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold font-medium text-gray-700  rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Reset
                </button>
              </div>
              <TagsFilter
                allTags={allTags}
                selectedTags={selectedTags}
                toggleTag={toggleTag}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
              />
            </div>
          )}

          {paginatedPrompts.length === 0 ? (
            <div className="mt-8 text-center py-12 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:border-gray-700">
              <p className="text-gray-500 mb-4 dark:text-gray-400">No prompts found</p>
              <button
                onClick={handleAddPrompt}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors "
              >
                Add your first prompt
              </button>
            </div>
          ) : (
            viewMode === 'card' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-h-[70vh] overflow-y-auto">
                {paginatedPrompts.map(prompt => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onEdit={() => handleEditPrompt(prompt)}
                    onDelete={() => handleDeletePrompt(prompt.id)}
                    onToggleTemplate={() => handleToggleTemplate(prompt.id)}
                    onToggleFavorite={() => handleToggleFavorite(prompt.id)}
                    onTest={() => handleTestPrompt(prompt)}
                  />
                ))}
              </div>)
              : (
                <div className="max-h-[70vh] overflow-y-auto">
                  <PromptTable
                    prompts={paginatedPrompts}
                    onEdit={handleEditPrompt}
                    onDelete={handleDeletePrompt}
                    onToggleTemplate={handleToggleTemplate}
                    onToggleFavorite={handleToggleFavorite}
                    onTest={handleTestPrompt}
                    onSortTags={(direction) => handleSortPrompts(direction)}
                  />
                </div>
              )
          )}

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <div>
              <label htmlFor="itemsPerPage" className="text-gray-700 dark:text-gray-300 mr-2">
                Items per page:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded-md p-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded-md ${currentPage === 1
                  ? 'text-gray-400 border-gray-300 dark:text-gray-600 dark:border-gray-700'
                  : 'text-gray-700 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800'
                  }`}
                title="Previous"
              >
                &lt;
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 border rounded-md ${currentPage === totalPages
                  ? 'text-gray-400 border-gray-300 dark:text-gray-600 dark:border-gray-700'
                  : 'text-gray-700 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800'
                  }`}
                title="Next"
              >
                &gt;
              </button>
            </div>
          </div>
        </main>

        {isModalOpen && (
          <AddEditPromptModal
            user={user}
            prompt={currentPrompt}
            allTags={allTags}
            onSave={handleSavePrompt}
            onClose={() => setIsModalOpen(false)}
          />
        )}

        {isSettingsOpen && (
          <SettingsModal
            settings={settings}
            onSave={handleSaveSettings}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}

        {isTestModalOpen && currentPrompt && (
          <TestPromptModal
            prompt={currentPrompt}
            llmConfig={settings.defaultLLM}
            onClose={() => setIsTestModalOpen(false)}
          />
        )}
      </div>
    </>
  );
}

export default App;
