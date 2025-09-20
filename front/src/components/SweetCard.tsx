import React, { useState } from 'react';
import { Sweet } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import '../index.css';
interface SweetCardProps {
  sweet: Sweet;
  onUpdate: () => void;
  onEdit?: (sweet: Sweet) => void;
}

const SweetCard: React.FC<SweetCardProps> = ({ sweet, onUpdate, onEdit }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [restockQuantity, setRestockQuantity] = useState(1);
  const [showActions, setShowActions] = useState(false);

  const handlePurchase = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await api.purchaseSweet(sweet._id, purchaseQuantity);
      onUpdate();
      setPurchaseQuantity(1);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async () => {
    if (!user || user.role !== 'admin') return;
    
    setLoading(true);
    try {
      await api.restockSweet(sweet._id, restockQuantity);
      onUpdate();
      setRestockQuantity(1);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Restock failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || user.role !== 'admin') return;
    
    // if (!confirm(`Are you sure you want to delete "${sweet.name}"?`)) return;
    
    setLoading(true);
    try {
      await api.deleteSweet(sweet._id);
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      chocolate: '🍫',
      candy: '🍬',
      gummy: '🐻',
      'hard-candy': '🍭',
      lollipop: '🍭',
      cake: '🧁',
      cookie: '🍪',
      other: '🍯'
    };
    return emojis[category] || '🍬';
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        {sweet.imageUrl ? (
          <img
            src={sweet.imageUrl}
            alt={sweet.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {getCategoryEmoji(sweet.category)}
          </div>
        )}
        
        {sweet.quantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-sm bg-destructive px-2 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg text-card-foreground">{sweet.name}</h3>
          <span className="text-lg text-primary">${sweet.price.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground capitalize">
            {sweet.category.replace('-', ' ')}
          </span>
          <span className={`text-sm ${sweet.quantity > 10 ? 'text-muted-foreground' : sweet.quantity > 0 ? 'text-orange-600' : 'text-destructive'}`}>
            Stock: {sweet.quantity}
          </span>
        </div>

        {sweet.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {sweet.description}
          </p>
        )}

        <div className="space-y-2">
          {/* Purchase Section */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={sweet.quantity}
              value={purchaseQuantity}
              onChange={(e) => setPurchaseQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-4 py-1 text-sm border border-border rounded bg-input-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={handlePurchase}
              disabled={loading || sweet.quantity === 0 || purchaseQuantity > sweet.quantity}
              className="flex-1 px-3 py-2 text-sm bg-white border border-black text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Purchase'}
            </button>
          </div>

          {/* Admin Actions */}
          {user?.role === 'admin' && (
            <div className="pt-2 border-t border-border">
              <button
                onClick={() => setShowActions(!showActions)}
                className="text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors border border-border px-1 py-1 rounded w-full"
              >
                {showActions ? 'Hide' : 'Show'} Admin Actions
              </button>

              {showActions && (
                <div className="space-y-2">
                  {/* Restock */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={restockQuantity}
                      onChange={(e) => setRestockQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-2 py-1 text-xs border border-border rounded bg-input-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      onClick={handleRestock}
                      disabled={loading}
                      className="flex-1 px-3 py-2 text-sm bg-white border border-black text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Restock
                    </button>
                  </div>

                  {/* Edit & Delete */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit?.(sweet)}
                      disabled={loading}
                      className="flex-1 px-3 py-2 text-sm bg-white border border-blue text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="flex-1 px-3 py-2 text-sm bg-white border border-red text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SweetCard;