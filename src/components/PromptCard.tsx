import { Bookmark, BookmarkCheck, Heart, Pencil, Trash2, Zap, Clipboard } from 'lucide-react';
import { Prompt } from '../types';
import { copyToClipboard } from '../utils/utils';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: () => void;
  onDelete: () => void;
  onToggleTemplate: () => void;
  onToggleFavorite: () => void;
  onTest: () => void;
}

const PromptCard = ({ 
  prompt, 
  onEdit, 
  onDelete, 
  onToggleTemplate, 
  onToggleFavorite,
  onTest 
}: PromptCardProps) => {
  return (
    <div className={`p-4 border rounded-md shadow-sm flex flex-col justify-between ${prompt.isSystem ? 'bg-green-50' : 'bg-white'} dark:bg-gray-800 dark:border-gray-700`}>
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-800 line-clamp-1 dark:text-gray-200">{prompt.name}</h3>
          <div className="flex space-x-2">
            <button 
              onClick={onToggleFavorite}
              className={`p-1 -mr-1 -mt-1 ${prompt.isFavorite ? 'text-red-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
              title={prompt.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={18} fill={prompt.isFavorite ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={onToggleTemplate}
              className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 p-1 -mr-1 -mt-1"
              title={prompt.isTemplate ? "Remove from templates" : "Add to templates"}
            >
              {prompt.isTemplate ? (
                <BookmarkCheck size={18} className="text-gray-800 dark:text-gray-200" />
              ) : (
                <Bookmark size={18} />
              )}
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 dark:text-gray-400">{prompt.description}</p>
        
        <div className="relative bg-gray-50 p-3 rounded-md mb-4 max-h-32 overflow-y-auto dark:bg-gray-700">
          <button 
            onClick={() => copyToClipboard(prompt.content)}
            className="absolute top-1 right-1 text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
            title="Copy content"
          >
            <Clipboard size={16} />
          </button>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono dark:text-gray-300">{prompt.content}</pre>
        </div>
        
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {prompt.tags.map(tag => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex justify-between dark:bg-gray-900 dark:border-gray-700">
        <div className="flex space-x-3">
          <button
            onClick={onEdit}
            className="text-gray-700 hover:text-gray-900 flex items-center text-sm dark:text-gray-300 dark:hover:text-gray-100"
          >
            <Pencil size={15} className="mr-1.5" />
            Edit
          </button>
          <button
            onClick={onTest}
            className="text-gray-700 hover:text-gray-900 flex items-center text-sm dark:text-gray-300 dark:hover:text-gray-100"
          >
            <Zap size={15} className="mr-1.5" />
            Test
          </button>
        </div>
        <button
          onClick={onDelete}
          className="text-gray-500 hover:text-red-600 flex items-center text-sm dark:text-gray-400 dark:hover:text-red-400"
        >
          <Trash2 size={15} className="mr-1.5" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default PromptCard;
