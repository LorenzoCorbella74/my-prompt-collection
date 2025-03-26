import { Heart, Tag } from 'lucide-react';
import { PromptFilter } from '../types';

interface TagsFilterProps {
  allTags: string[];
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  activeFilter: PromptFilter;
  setActiveFilter: (filter: PromptFilter) => void;
}

const TagsFilter = ({ 
  allTags, 
  selectedTags, 
  toggleTag, 
  activeFilter, 
  setActiveFilter 
}: TagsFilterProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter(PromptFilter.ALL)}
          className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
            activeFilter === PromptFilter.ALL
              ? 'bg-primary text-white dark:bg-primary-600'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-primary-600'
          }`}
        >
          All Prompts
        </button>
        <button
          onClick={() => setActiveFilter(PromptFilter.TEMPLATES)}
          className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
            activeFilter === PromptFilter.TEMPLATES
              ? 'bg-primary text-white dark:bg-primary-600'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-primary-600'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveFilter(PromptFilter.FAVORITES)}
          className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
            activeFilter === PromptFilter.FAVORITES
              ? 'bg-primary text-white dark:bg-primary-600'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-primary-600'
          }`}
        >
          <Heart size={14} className="mr-1.5" fill={activeFilter === PromptFilter.FAVORITES ? "white" : "none"} />
          Favorites
        </button>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Tags</h4>
        {allTags.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No tags available</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                  selectedTags.includes(tag)
                    ? 'bg-primary text-white dark:bg-gray-600'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Tag size={12} className="mr-1.5" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsFilter;
