import React from 'react';
import { ShoppingCart, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShoppingListProps {
  items: string[];
  onRemoveItem: (item: string) => void;
  onClear: () => void;
}

export default function ShoppingList({ items, onRemoveItem, onClear }: ShoppingListProps) {
  const [checkedItems, setCheckedItems] = React.useState<Set<string>>(new Set());

  const toggleCheck = (item: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(item)) {
      newChecked.delete(item);
    } else {
      newChecked.add(item);
    }
    setCheckedItems(newChecked);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-zinc-900 mb-2">Shopping List</h1>
          <p className="text-zinc-500">Items you need for your recipes.</p>
        </div>
        {items.length > 0 && (
          <button 
            onClick={onClear}
            className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-zinc-200 border-dashed">
          <ShoppingCart className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 mb-1">Your list is empty</h3>
          <p className="text-zinc-500">Missing ingredients from recipes will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <ul className="divide-y divide-zinc-100">
            <AnimatePresence>
              {items.map((item) => {
                const isChecked = checkedItems.has(item);
                return (
                  <motion.li 
                    key={item}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`flex items-center justify-between p-4 transition-colors hover:bg-zinc-50 ${isChecked ? 'bg-zinc-50/50' : ''}`}
                  >
                    <button 
                      onClick={() => toggleCheck(item)}
                      className="flex items-center gap-4 flex-1 text-left"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-6 h-6 text-zinc-300 shrink-0" />
                      )}
                      <span className={`text-lg transition-all ${isChecked ? 'text-zinc-400 line-through' : 'text-zinc-800 font-medium'}`}>
                        {item}
                      </span>
                    </button>
                    <button 
                      onClick={() => onRemoveItem(item)}
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </div>
  );
}
