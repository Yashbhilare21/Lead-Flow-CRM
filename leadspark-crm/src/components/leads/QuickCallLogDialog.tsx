import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Phone, User, Mail, Clock, Loader2 } from 'lucide-react';
import { Lead } from '@/types/database';

interface QuickCallLogDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QuickCallLogDialog({ lead, open, onOpenChange, onSuccess }: QuickCallLogDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    duration_minutes: '',
  });

  // Auto-populate when lead changes
  useState(() => {
    if (lead) {
      setFormData({
        name: lead.contactPerson || lead.leadName,
        email: lead.email || '',
        phone: lead.phone || '',
        description: '',
        duration_minutes: '',
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    if (!formData.description.trim()) {
      toast.error('Please add a call description');
      return;
    }

    if (!formData.duration_minutes || parseInt(formData.duration_minutes) <= 0) {
      toast.error('Please enter call duration');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('CallLog').insert({
        leadId: lead.id,
        name: formData.name || lead.leadName,
        email: formData.email || null,
        phone: formData.phone || null,
        description: formData.description.trim(),
        duration_minutes: parseInt(formData.duration_minutes),
      });

      if (error) throw error;

      toast.success('Call logged successfully');
      onOpenChange(false);
      setFormData({ name: '', email: '', phone: '', description: '', duration_minutes: '' });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to log call:', error);
      toast.error('Failed to log call');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when opening with new lead
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && lead) {
      setFormData({
        name: lead.contactPerson || lead.leadName,
        email: lead.email || '',
        phone: lead.phone || '',
        description: '',
        duration_minutes: '',
      });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Log Call - {lead?.leadName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Contact Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                  placeholder="Contact name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  className="pl-10"
                  placeholder="Duration"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10"
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  placeholder="Email address"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Call Notes *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the call conversation, key points discussed, next steps..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Call Log
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
