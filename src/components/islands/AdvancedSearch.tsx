import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { useTaskStore } from '../../lib/store/taskStore';
import { useSubjectStore } from '../../lib/store/subjectStore';
import { Search, X, Filter, Save, History, Sparkles } from 'lucide-react';
import type { Task } from '../../lib/types';

interface SearchFilter {
  id: string;
  name: string;
  query: string;
  filters: {
    subjects?: string[];
    priorities?: string[];
    statuses?: string[];
    tags?: string[];
    dateRange?: { start: Date; end: Date };
  };
}

export function AdvancedSearch() {
  const { tasks } = useTaskStore();
  const { subjects } = useSubjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SearchFilter[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<SearchFilter['filters']>({});

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(tasks, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'tags', weight: 0.2 },
        { name: 'subjectId', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }, [tasks]);

  // Perform search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return tasks.filter(task => applyFilters(task, activeFilters));
    }

    // Add to search history
    if (searchQuery && !searchHistory.includes(searchQuery)) {
      setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)]);
    }

    const fuseResults = fuse.search(searchQuery);
    const filteredTasks = fuseResults
      .map(result => result.item)
      .filter(task => applyFilters(task, activeFilters));

    return filteredTasks;
  }, [searchQuery, tasks, activeFilters, fuse]);

  const applyFilters = (task: Task, filters: SearchFilter['filters']): boolean => {
    if (filters.subjects && filters.subjects.length > 0) {
      if (!filters.subjects.includes(task.subjectId)) return false;
    }
    if (filters.priorities && filters.priorities.length > 0) {
      if (!filters.priorities.includes(task.priority)) return false;
    }
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(task.status)) return false;
    }
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some(tag => task.tags.includes(tag))) return false;
    }
    if (filters.dateRange) {
      const taskDate = new Date(task.dueDate);
      if (taskDate < filters.dateRange.start || taskDate > filters.dateRange.end) {
        return false;
      }
    }
    return true;
  };

  const saveFilter = () => {
    const filterName = prompt('Name this filter:');
    if (!filterName) return;

    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      name: filterName,
      query: searchQuery,
      filters: activeFilters,
    };

    setSavedFilters(prev => [...prev, newFilter]);
    localStorage.setItem('saved-search-filters', JSON.stringify([...savedFilters, newFilter]));
  };

  const loadFilter = (filter: SearchFilter) => {
    setSearchQuery(filter.query);
    setActiveFilters(filter.filters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, description, or tags..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              Object.keys(activeFilters).length > 0
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {Object.keys(activeFilters).length > 0 && (
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </button>

          {(searchQuery || Object.keys(activeFilters).length > 0) && (
            <button
              onClick={saveFilter}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subjects
                </label>
                <select
                  multiple
                  value={activeFilters.subjects || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setActiveFilters(prev => ({ ...prev, subjects: selected }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  size={3}
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <div className="space-y-2">
                  {['urgent', 'high', 'medium', 'low'].map(priority => (
                    <label key={priority} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeFilters.priorities?.includes(priority) || false}
                        onChange={(e) => {
                          setActiveFilters(prev => {
                            const priorities = prev.priorities || [];
                            return {
                              ...prev,
                              priorities: e.target.checked
                                ? [...priorities, priority]
                                : priorities.filter(p => p !== priority)
                            };
                          });
                        }}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {priority}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {['todo', 'in-progress', 'completed', 'archived'].map(status => (
                    <label key={status} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeFilters.statuses?.includes(status) || false}
                        onChange={(e) => {
                          setActiveFilters(prev => {
                            const statuses = prev.statuses || [];
                            return {
                              ...prev,
                              statuses: e.target.checked
                                ? [...statuses, status]
                                : statuses.filter(s => s !== status)
                            };
                          });
                        }}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {status.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search History */}
        {!searchQuery && searchHistory.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Recent Searches
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((query, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(query)}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Saved Filters
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => loadFilter(filter)}
                  className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Search Results
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {searchResults.length} task{searchResults.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {searchResults.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || Object.keys(activeFilters).length > 0
                ? 'No tasks match your search criteria'
                : 'Start searching to find your tasks'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {searchResults.map(task => (
              <div
                key={task.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        {getSubjectName(task.subjectId)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
