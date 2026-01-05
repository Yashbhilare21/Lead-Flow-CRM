import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Building2, Mail, Phone, Command as CommandIcon, Loader2 } from 'lucide-react';
import { Lead } from '@/types/database';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';

export function GlobalSearch() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const searchTerm = query.toLowerCase();
      
      const { data, error } = await supabase
        .from('Lead')
        .select('id, leadName, companyName, email, phone, status, priority')
        .or(`leadName.ilike.%${searchTerm}%,companyName.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(10);

      if (!error && data) {
        setResults(data as Lead[]);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = useCallback((leadId: number) => {
    navigate(`/leads/${leadId}`);
    setOpen(false);
    setQuery('');
    setResults([]);
  }, [navigate]);

  return (
    <Popover open={open && query.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            ref={inputRef}
            placeholder="Search leads by name, company, email..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value) setOpen(true);
            }}
            onFocus={() => query && setOpen(true)}
            className="pl-10 pr-24 h-10 bg-muted/50 border-muted-foreground/20 focus:bg-background focus:border-primary/50 transition-all duration-200 rounded-lg"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded-md border bg-muted/80 px-2 font-mono text-[11px] font-medium text-muted-foreground shadow-sm">
              <CommandIcon className="h-3 w-3" />K
            </kbd>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[450px] p-0 shadow-xl border-border/50" align="start">
        <Command className="rounded-lg">
          <CommandList className="max-h-[400px]">
            {isLoading ? (
              <div className="p-6 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <CommandEmpty className="py-8">
                <Search className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No leads found matching "{query}"</p>
              </CommandEmpty>
            ) : (
              <CommandGroup heading={`${results.length} result${results.length > 1 ? 's' : ''} found`}>
                {results.map((lead) => (
                  <CommandItem
                    key={lead.id}
                    value={lead.leadName}
                    onSelect={() => handleSelect(lead.id)}
                    className="cursor-pointer p-3 hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground">{lead.leadName}</span>
                        <StatusBadge status={lead.status} />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          {lead.companyName}
                        </span>
                        {lead.email && (
                          <span className="flex items-center gap-1.5 truncate max-w-[150px]">
                            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                            {lead.email}
                          </span>
                        )}
                        {lead.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}