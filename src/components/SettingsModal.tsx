import { useState } from 'react';
import { Moon, Save, Sun, X } from 'lucide-react';
import { AppSettings } from '../types';
import { collection, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure you have the correct path to your Firebase setup

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

const SettingsModal = ({ settings, onSave, onClose }: SettingsModalProps) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(settings.theme);
  const [llmProvider, setLLMProvider] = useState<string>(settings.defaultLLM.provider);
  const [llmModel, setLLMModel] = useState<string>(settings.defaultLLM.model);
  const [apiKey, setApiKey] = useState<string>(settings.defaultLLM.apiKey || '');
  const [endpoint, setEndpoint] = useState<string>(settings.defaultLLM.endpoint || '');

  const handleSave = () => {
    const updatedSettings: AppSettings = {
      ...settings,
      theme,
      defaultLLM: {
        provider: llmProvider as 'ollama' | 'openai' | 'custom',
        model: llmModel,
        apiKey: apiKey || undefined,
        endpoint: endpoint || undefined
      }
    };
    onSave(updatedSettings);
  };

  const handleClearPrompts = async () => {
    const confirmed = window.confirm('Are you sure you want to delete all prompts? This action cannot be undone.');
    if (confirmed) {
      try {
        const querySnapshot = await getDocs(collection(db, 'prompts'));
        const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        alert('All prompts have been deleted successfully.');
      } catch (error) {
        console.error('Error deleting prompts:', error);
        alert('Failed to delete prompts. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 dark:bg-gray-900 dark:bg-opacity-80">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col dark:bg-gray-800">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-grow">
          {/* Theme Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3 dark:text-gray-200">Appearance</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center p-3 rounded-md ${
                  theme === 'light' 
                    ? 'bg-gray-100 border-2 border-gray-800 dark:border-gray-200' 
                    : 'border-2 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Sun size={24} className="mb-2 text-gray-700 dark:text-gray-300" />
                <span className="text-sm text-gray-800 dark:text-gray-200">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center p-3 rounded-md ${
                  theme === 'dark' 
                    ? 'bg-gray-100 border-2 border-gray-800 dark:border-gray-200 dark:bg-gray-700' 
                    : 'border-2 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Moon size={24} className="mb-2 text-gray-700 dark:text-gray-300" />
                <span className="text-sm text-gray-800 dark:text-gray-200">Dark</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center p-3 rounded-md ${
                  theme === 'system' 
                    ? 'bg-gray-100 border-2 border-gray-800 dark:border-gray-200 dark:bg-gray-700' 
                    : 'border-2 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="mb-2 flex">
                  <Sun size={24} className="text-gray-700 dark:text-gray-300" />
                  <Moon size={24} className="text-gray-700 dark:text-gray-300" />
                </div>
                <span className="text-sm text-gray-800 dark:text-gray-200">System</span>
              </button>
            </div>
          </div>

          {/* LLM Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3 dark:text-gray-200">LLM Configuration</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Provider</label>
              <select
                value={llmProvider}
                onChange={(e) => setLLMProvider(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="ollama">Ollama</option>
                <option value="openai">OpenAI</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Model</label>
              <input
                type="text"
                value={llmModel}
                onChange={(e) => setLLMModel(e.target.value)}
                placeholder={llmProvider === 'ollama' ? 'llama2' : llmProvider === 'openai' ? 'gpt-3.5-turbo' : 'Model name'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {llmProvider !== 'ollama' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}

            {llmProvider === 'custom' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Endpoint URL</label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://api.example.com/v1/chat/completions"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}

            {llmProvider === 'ollama' && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Make sure you have Ollama installed and running locally. Default endpoint: http://localhost:11434
              </p>
            )}
          </div>

          {/* Add a section for clearing prompts */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3 dark:text-gray-200">Danger Zone</h3>
            <button
              onClick={handleClearPrompts}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors"
            >
              Clear All Prompts
            </button>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 dark:bg-gray-900 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-primary text-white hover:bg-opacity-90 flex items-center "
          >
            <Save size={18} className="mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
