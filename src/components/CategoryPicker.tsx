import { Badge } from '@/components/ui/badge';
import { useCategories, type Category } from '@/hooks/useCategories';
import { X } from 'lucide-react';

interface CategoryPickerProps {
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export default function CategoryPicker({ selected, onChange, disabled }: CategoryPickerProps) {
  const { categories, loading } = useCategories();

  if (loading) return <div className="text-sm text-muted-foreground">Laddar kategorier...</div>;

  const toggle = (id: string) => {
    if (disabled) return;
    onChange(
      selected.includes(id)
        ? selected.filter(s => s !== id)
        : [...selected, id]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isSelected = selected.includes(cat.id);
        return (
          <Badge
            key={cat.id}
            variant={isSelected ? 'default' : 'outline'}
            className={`cursor-pointer select-none transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/80'}`}
            onClick={() => toggle(cat.id)}
          >
            {cat.name}
            {isSelected && <X className="h-3 w-3 ml-1" />}
          </Badge>
        );
      })}
    </div>
  );
}

export function CategoryBadges({ categoryIds, categories }: { categoryIds: string[]; categories: Category[] }) {
  if (categoryIds.length === 0) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {categoryIds.map(id => {
        const cat = categories.find(c => c.id === id);
        return cat ? <Badge key={id} variant="secondary" className="text-xs">{cat.name}</Badge> : null;
      })}
    </div>
  );
}
