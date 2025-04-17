
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  closeMenuOnSearch?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, closeMenuOnSearch = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="relative w-full sm:w-64 md:w-80">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Rechercher un film..."
        className="w-full bg-secondary py-2 pl-10 pr-10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={(e) => e.stopPropagation()}
      />
      {searchTerm && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            clearSearch();
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
