import { useEffect, useState } from 'react';
import { Heart, Plus, X } from 'lucide-react';
import { Prompt } from '../types';
import { User } from 'firebase/auth';

interface AddEditPromptModalProps {
  user: User
  prompt: Prompt | null;
  allTags: string[];
  onSave: (prompt: Prompt) => void;
  onClose: () => void;
}

const AddEditPromptModal = ({ user, prompt, allTags, onSave, onClose }: AddEditPromptModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isTemplate, setIsTemplate] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [author, setAuthor] = useState<string>(''); // Nuovo stato per l'autore
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (prompt) {
      setName(prompt.name);
      setDescription(prompt.description);
      setContent(prompt.content);
      setTags(prompt.tags);
      setIsTemplate(prompt.isTemplate);
      setIsFavorite(prompt.isFavorite || false);
      setAuthor(prompt.author || ''); // Imposta l'autore se esiste
    }
  }, [prompt]);

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) return;

    const updatedPrompt: Prompt = {
      id: prompt?.id || '',
      name: name.trim(),
      description: description.trim(),
      content: content.trim(),
      tags,
      isTemplate,
      isFavorite,
      author: author.trim(), // Salva l'autore
      createdAt: prompt?.createdAt || Date.now(),
      updatedAt: Date.now(),
      userId: user.uid
    };

    onSave(updatedPrompt);
  };

  const handleNewTagInput = (value: string) => {
    setNewTag(value);
    if (value.trim()) {
      const filtered = allTags.filter(
        tag => tag.toLowerCase().includes(value.toLowerCase()) && !tags.includes(tag)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setNewTag('');
    setSuggestions([]);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      addTag(newTag);
    }
  };

  const handleAddTag = () => {
    if (!showTagInput) {
      setShowTagInput(true);
    } else if (newTag.trim()) {
      addTag(newTag);
      setNewTag('');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 dark:bg-gray-900 dark:bg-opacity-80">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col dark:bg-gray-800">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {prompt ? 'Edit Prompt' : 'Add New Prompt'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-grow">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter prompt name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Author
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter author name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Brief description of what this prompt does"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Prompt Content *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter the actual prompt text here"
              rows={8}
              required
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
              <button 
                onClick={handleAddTag}
                className="text-sm text-gray-700 hover:text-gray-900 flex items-center dark:text-gray-300 dark:hover:text-gray-100"
              >
                <Plus size={16} className="mr-1" />
                {showTagInput ? 'Add' : 'Add Tag'}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span 
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag}
                  <button 
                    onClick={() => removeTag(tag)} 
                    className="ml-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              
              <div className="relative">
                {showTagInput && (
                  <div className="relative">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => handleNewTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="px-2.5 py-1 border border-gray-300 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Add tag..."
                      autoFocus
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute top-full mt-1 left-0 z-10 w-40 max-h-36 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-md dark:bg-gray-700 dark:border-gray-600">
                        {suggestions.map(suggestion => (
                          <button
                            key={suggestion}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 truncate dark:hover:bg-gray-600 dark:text-gray-200"
                            onClick={() => {
                              addTag(suggestion);
                              setShowTagInput(false);
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-4 flex space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isTemplate}
                onChange={() => setIsTemplate(!isTemplate)}
                className="h-4 w-4 text-gray-800 focus:ring-gray-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Mark as template</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={() => setIsFavorite(!isFavorite)}
                className="h-4 w-4 text-gray-800 focus:ring-gray-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                <Heart size={14} className="inline mr-1" fill={isFavorite ? "currentColor" : "none"} />
                Add to favorites
              </span>
            </label>
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
            disabled={!name.trim() || !content.trim()}
            className={`px-4 py-2 rounded-md text-white ${
              !name.trim() || !content.trim() 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-opacity-90 '
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditPromptModal;
