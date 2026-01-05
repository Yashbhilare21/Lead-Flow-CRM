import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageSquare, Plus, Loader2, User } from 'lucide-react';
import { format } from 'date-fns';

interface LeadNote {
  id: number;
  leadId: number;
  note: string;
  createdBy: string;
  createdAt: string;
}

interface LeadNotesTimelineProps {
  leadId: number;
}

export function LeadNotesTimeline({ leadId }: LeadNotesTimelineProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [leadId]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('LeadNoteHistory')
        .select('*')
        .eq('leadId', leadId)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      setNotes(data as LeadNote[]);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('LeadNoteHistory').insert({
        leadId,
        note: newNote.trim(),
        createdBy: user?.email || 'Unknown',
      });

      if (error) throw error;

      toast.success('Note added');
      setNewNote('');
      setIsAdding(false);
      fetchNotes();
    } catch (error) {
      console.error('Failed to add note:', error);
      toast.error('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Notes History
        </CardTitle>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note about this lead..."
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewNote('');
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddNote} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Note
              </Button>
            </div>
          </div>
        )}

        {notes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No notes yet. Add the first one!
          </p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex gap-4 p-4 rounded-lg bg-muted/50 border"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {note.createdBy.split('@')[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">{note.note}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
