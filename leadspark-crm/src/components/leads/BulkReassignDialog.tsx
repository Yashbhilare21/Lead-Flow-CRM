import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Users, Loader2 } from 'lucide-react';
import { Lead, User } from '@/types/database';

interface BulkReassignDialogProps {
  leads: Lead[];
  users: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkReassignDialog({ leads, users, open, onOpenChange, onSuccess }: BulkReassignDialogProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    if (!selectedUser) {
      toast.error('Please select an assignee');
      return;
    }

    setIsSubmitting(true);

    try {
      const leadIds = leads.map(l => l.id);
      
      const { error } = await supabase
        .from('Lead')
        .update({ assignee: selectedUser })
        .in('id', leadIds);

      if (error) throw error;

      toast.success(`${leads.length} lead(s) reassigned successfully`);
      onOpenChange(false);
      setSelectedUser('');
      setShowConfirm(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to reassign leads:', error);
      toast.error('Failed to reassign leads');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeUsers = users.filter(u => u.status === 'active');
  const selectedUserName = activeUsers.find(u => u.email === selectedUser)?.name;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Bulk Reassign Leads
            </DialogTitle>
            <DialogDescription>
              Reassign {leads.length} selected lead(s) to another employee
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Selected Leads</Label>
              <div className="max-h-32 overflow-y-auto rounded-md border p-2 text-sm">
                {leads.map((lead) => (
                  <div key={lead.id} className="py-1">
                    {lead.leadName} ({lead.companyName})
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assign to</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {activeUsers.map((user) => (
                    <SelectItem key={user.id} value={user.email}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => setShowConfirm(true)} 
              disabled={!selectedUser}
            >
              Reassign
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reassignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reassign {leads.length} lead(s) to {selectedUserName}?
              This action will change the assignee for all selected leads.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
