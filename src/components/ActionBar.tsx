import React from 'react';
import { Search, Filter, List, Grid2x2, Download, Upload } from 'lucide-react';
import { Prompt } from '../types';

interface ActionBarProps {
    prompts: Prompt[],
    setPrompts: (value:Prompt[])=> void
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    showFilters: boolean;
    setShowFilters: (value: boolean) => void;
    selectedTags: string[];
    toggleViewMode: () => void;
    viewMode: 'card' | 'table';
}

const ActionBar: React.FC<ActionBarProps> = ({
    prompts,
    setPrompts,
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    selectedTags,
    toggleViewMode,
    viewMode,
}) => {

    const exportPrompts = () => {
        const dataStr = JSON.stringify(prompts, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `prompt-palette-export-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const importPrompts = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (!target.files?.length) return;

            const file = target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const importedPrompts = JSON.parse(event.target?.result as string);

                    // Validate imported data
                    if (!Array.isArray(importedPrompts)) {
                        alert('Invalid format: Imported data is not an array');
                        return;
                    }

                    // Add imported prompts to existing ones (avoiding duplicates by ID)
                    const existingIds = new Set(prompts.map(p => p.id));
                    const newPrompts = importedPrompts.filter(p => !existingIds.has(p.id));

                    if (newPrompts.length === 0) {
                        alert('No new prompts to import');
                        return;
                    }

                    setPrompts([...prompts, ...newPrompts]);
                    alert(`Successfully imported ${newPrompts.length} prompts`);
                } catch (err) {
                    alert('Error importing prompts: Invalid JSON format');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    };
    return (
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search prompts..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        title="Clear search"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="flex space-x-2">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center px-3 py-2 border ${showFilters
                            ? 'border-gray-800 bg-gray-100 dark:border-gray-500 dark:bg-gray-700'
                            : 'border-gray-300 dark:border-gray-700'
                        } rounded-md hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:bg-gray-700`}
                >
                    <Filter
                        size={18}
                        className={`mr-2 ${showFilters ? 'text-gray-800 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
                            }`}
                    />
                    Filters {selectedTags.length > 0 && `(${selectedTags.length})`}
                </button>

                <button
                    onClick={toggleViewMode}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                    title={viewMode === 'card' ? 'Switch to table view' : 'Switch to card view'}
                >
                    {viewMode === 'card' ? <List size={18} /> : <Grid2x2 size={18} />}
                </button>

                <div className="flex space-x-2">
                    <button
                        onClick={exportPrompts}
                        title="Export Prompts"
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        onClick={importPrompts}
                        title="Import Prompts"
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <Upload size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActionBar;