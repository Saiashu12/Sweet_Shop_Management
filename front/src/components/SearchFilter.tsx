import React, { useState, useEffect } from 'react';

interface SearchFilterProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}

export interface SearchFilters {
  q: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch, loading }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    q: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'candy', label: 'Candy' },
    { value: 'gummy', label: 'Gummy' },
    { value: 'sweets', label: 'Sweets' },
    { value: 'lollipop', label: 'Lollipop' },
    { value: 'cake', label: 'Cake' },
    { value: 'cookie', label: 'Cookie' },
    { value: 'other', label: 'Other' }
  ];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClear = () => {
    setFilters({
      q: '',
      category: '',
      minPrice: '',
      maxPrice: ''
    });
  };

  const hasActiveFilters = filters.q || filters.category || filters.minPrice || filters.maxPrice;

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Query */}
        <div>
          <label htmlFor="search" className="block text-sm text-card-foreground mb-1">
            Search
          </label>
          <input
            id="search"
            name="q"
            type="text"
            value={filters.q}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
            placeholder="Search sweets..."
          />
        </div>

        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm text-card-foreground mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label htmlFor="minPrice" className="block text-sm text-card-foreground mb-1">
            Min Price ($)
          </label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            step="0.01"
            min="0"
            value={filters.minPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="maxPrice" className="block text-sm text-card-foreground mb-1">
            Max Price ($)
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            step="0.01"
            min="0"
            value={filters.maxPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
            placeholder="999.99"
          />
        </div>
      </div>

      {/* Active Filters & Clear */}
      {hasActiveFilters && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {filters.q && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                Search: "{filters.q}"
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary/50 text-secondary-foreground">
                Category: {categories.find(c => c.value === filters.category)?.label}
              </span>
            )}
            {filters.minPrice && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/50 text-accent-foreground">
                Min: ${filters.minPrice}
              </span>
            )}
            {filters.maxPrice && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/50 text-accent-foreground">
                Max: ${filters.maxPrice}
              </span>
            )}
          </div>

          <button
            onClick={handleClear}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center mt-4">
          <div className="inline-flex items-center text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            Searching...
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;