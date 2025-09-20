import React, { useState, useEffect, useCallback } from 'react';
import { Sweet } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import SweetCard from './SweetCard';
import SweetForm from './SweetForm';
import SearchFilter, { SearchFilters } from './SearchFilter';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | undefined>();
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    q: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  const loadSweets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getSweets();
      setSweets(response.data.sweets);
    } catch (error) {
      console.error('Failed to load sweets:', error);
      alert('Failed to load sweets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (filters: SearchFilters) => {
    try {
      setSearchLoading(true);
      setCurrentFilters(filters);

      // If no filters are active, load all sweets
      const hasFilters = filters.q || filters.category || filters.minPrice || filters.maxPrice;
      
      if (!hasFilters) {
        const response = await api.getSweets();
        setSweets(response.data.sweets);
      } else {
        const searchParams: any = {};
        if (filters.q) searchParams.q = filters.q;
        if (filters.category) searchParams.category = filters.category;
        if (filters.minPrice) searchParams.minPrice = parseFloat(filters.minPrice);
        if (filters.maxPrice) searchParams.maxPrice = parseFloat(filters.maxPrice);

        const response = await api.searchSweets(searchParams);
        setSweets(response.data.sweets);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSweets();
  }, [loadSweets]);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSweet(undefined);
    loadSweets();
  };

  const handleEdit = (sweet: Sweet) => {
    setEditingSweet(sweet);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSweet(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-flex items-center text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          Loading sweets...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl text-foreground">Sweet Shop Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name}! {user?.role === 'admin' ? 'Manage your sweet inventory.' : 'Discover and purchase delicious sweets.'}
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary border border-border text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add New Sweet
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <SearchFilter onSearch={handleSearch} loading={searchLoading} />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🍬</div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sweets</p>
              <p className="text-2xl text-card-foreground">{sweets.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📦</div>
            <div>
              <p className="text-sm text-muted-foreground">In Stock</p>
              <p className="text-2xl text-card-foreground">
                {sweets.filter(sweet => sweet.quantity > 0).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">⚠️</div>
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl text-card-foreground">
                {sweets.filter(sweet => sweet.quantity === 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sweets Grid */}
      {sweets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🍬</div>
          <h3 className="text-lg text-foreground mb-2">No sweets found</h3>
          <p className="text-muted-foreground">
            {currentFilters.q || currentFilters.category || currentFilters.minPrice || currentFilters.maxPrice
              ? 'Try adjusting your search filters.'
              : user?.role === 'admin'
              ? 'Add your first sweet to get started!'
              : 'Check back later for new sweets.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sweets.map((sweet) => (
            <SweetCard
              key={sweet._id}
              sweet={sweet}
              onUpdate={loadSweets}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Sweet Form Modal */}
      {showForm && (
        <SweetForm
          sweet={editingSweet}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default Dashboard;