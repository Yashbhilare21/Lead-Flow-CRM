import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineEditSelectProps<T extends string> {
  value: T;
  options: T[];
  onChange: (value: T) => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
  renderValue?: (value: T) => React.ReactNode;
  className?: string;
}

export function InlineEditSelect<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  isLoading = false,
  renderValue,
  className,
}: InlineEditSelectProps<T>) {
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = async (newValue: T) => {
    if (newValue === value) return;
    
    setIsChanging(true);
    try {
      await onChange(newValue);
    } finally {
      setIsChanging(false);
    }
  };

  const showLoader = isLoading || isChanging;

  // Filter out empty strings and use a placeholder value for "unassigned"
  const UNASSIGNED_VALUE = '__unassigned__';
  const filteredOptions = options.map(opt => opt === '' ? UNASSIGNED_VALUE : opt);
  const currentValue = value === '' ? UNASSIGNED_VALUE : value;

  const handleSelectChange = (newValue: string) => {
    const actualValue = newValue === UNASSIGNED_VALUE ? '' as T : newValue as T;
    if (actualValue === value) return;
    handleChange(actualValue);
  };

  return (
    <div className={cn('relative inline-flex items-center', className)} onClick={(e) => e.stopPropagation()}>
      {showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded z-10">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        </div>
      )}
      <Select
        value={currentValue}
        onValueChange={handleSelectChange}
        disabled={disabled || showLoader}
      >
        <SelectTrigger className={cn(
          'h-auto py-1 px-2 min-w-[100px] border-transparent hover:border-border',
          showLoader && 'opacity-50'
        )}>
          <SelectValue>
            {renderValue ? renderValue(value) : value}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {filteredOptions.map((option, index) => (
            <SelectItem key={option || index} value={option}>
              {renderValue ? renderValue(options[index]) : options[index]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
