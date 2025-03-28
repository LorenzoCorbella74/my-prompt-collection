import { Bookmark, BookmarkCheck, Heart, Pencil, Trash2, Zap, Clipboard } from 'lucide-react'; // Add Clipboard import
import { Prompt } from '../types';
import { copyToClipboard } from '../utils/utils'; // Import the utility function

interface PromptTableProps {
  prompts: Prompt[];
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onToggleTemplate: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTest: (prompt: Prompt) => void;
}

const PromptTable = ({ 
  prompts, 
  onEdit, 
  onDelete, 
  onToggleTemplate, 
  onToggleFavorite,
  onTest
}: PromptTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
              Tags
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {prompts.map((prompt) => (
            <tr 
              key={prompt.id} 
              className={`${
                prompt.isSystem ? 'bg-green-50' : 'bg-white'
              } dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              <td className="px-6 py-3 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{prompt.name}</div>
              </td>
              <td className="px-6 py-3">
                <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{prompt.description}</div>
              </td>
              <td className="px-6 py-3">
                <div className="flex flex-wrap gap-1">
                  {prompt.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-3 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onToggleFavorite(prompt.id)}
                    className={`p-1 ${prompt.isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    title={prompt.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart size={18} fill={prompt.isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={() => onToggleTemplate(prompt.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                    title={prompt.isTemplate ? "Remove from templates" : "Add to templates"}
                  >
                    {prompt.isTemplate ? (
                      <BookmarkCheck size={18} className="text-gray-700 dark:text-gray-300" />
                    ) : (
                      <Bookmark size={18} />
                    )}
                  </button>
                  <button 
                    onClick={() => copyToClipboard(prompt.content)} // Add copy logic
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                    title="Copy content"
                  >
                    <Clipboard size={18} />
                  </button>
                </div>
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => onTest(prompt)}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Test prompt"
                  >
                    <Zap size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(prompt)}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    title="Edit prompt"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(prompt.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete prompt"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PromptTable;
