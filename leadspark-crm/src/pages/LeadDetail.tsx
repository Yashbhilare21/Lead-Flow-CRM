import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { StatusBadge, PriorityBadge } from '@/components/ui/status-badge';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus, LeadPriority, FollowUpHistory, CallLog, User } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Plus,
  Trash2,
  Edit,
  PhoneCall,
  History,
  User as UserIcon,
  Briefcase,
  Save,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { LeadNotesTimeline } from '@/components/leads/LeadNotesTimeline';
import { getOverdueStatus } from '@/hooks/useOverdueLeads';
import { Badge } from '@/components/ui/badge';

const statusOptions: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const priorityOptions: LeadPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [lead, setLead] = useState<Lead | null>(null);
  const [followUps, setFollowUps] = useState<FollowUpHistory[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Lead>>({});

  // Follow-up form
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [followUpData, setFollowUpData] = useState({
    description: '',
    notes: '',
    status: '',
    priority: '',
  });

  // Call log form
  const [isCallLogOpen, setIsCallLogOpen] = useState(false);
  const [callLogData, setCallLogData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
  });

  useEffect(() => {
    if (id) {
      fetchLead();
      fetchFollowUps();
      fetchCallLogs();
      if (isAdmin) {
        fetchUsers();
      }
    }
  }, [id, isAdmin]);

  const fetchLead = async () => {
    const { data, error } = await supabase
      .from('Lead')
      .select('*')
      .eq('id', parseInt(id!))
      .single();

    if (error) {
      toast.error('Lead not found');
      navigate('/leads');
    } else {
      setLead(data as Lead);
      setEditData(data as Lead);
    }
    setIsLoading(false);
  };

  const fetchFollowUps = async () => {
    const { data, error } = await supabase
      .from('FollowUpHistory')
      .select('*')
      .eq('leadId', parseInt(id!))
      .order('createdAt', { ascending: false });

    if (!error && data) {
      setFollowUps(data as FollowUpHistory[]);
    }
  };

  const fetchCallLogs = async () => {
    const { data, error } = await supabase
      .from('CallLog')
      .select('*')
      .eq('leadId', parseInt(id!))
      .order('createdAt', { ascending: false });

    if (!error && data) {
      setCallLogs(data as CallLog[]);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('status', 'active');

    if (!error && data) {
      setUsers(data as User[]);
    }
  };

  const handleSave = async () => {
    if (!lead) return;

    const { error } = await supabase
      .from('Lead')
      .update({
        leadName: editData.leadName,
        companyName: editData.companyName,
        email: editData.email,
        contactPerson: editData.contactPerson,
        phone: editData.phone,
        assignee: editData.assignee,
        priority: editData.priority,
        status: editData.status,
        leadSource: editData.leadSource,
        service: editData.service,
        location: editData.location,
        notes: editData.notes,
        nextFollowUpDate: editData.nextFollowUpDate,
      })
      .eq('id', lead.id);

    if (error) {
      toast.error('Failed to update lead');
    } else {
      toast.success('Lead updated successfully');
      setLead({ ...lead, ...editData } as Lead);
      setIsEditing(false);

      // Create follow-up history entry
      await supabase.from('FollowUpHistory').insert({
        leadId: lead.id,
        description: 'Lead information updated',
        status: editData.status,
        priority: editData.priority,
      });
      fetchFollowUps();
    }
  };

  const handleDelete = async () => {
    if (!lead) return;

    const { error } = await supabase.from('Lead').delete().eq('id', lead.id);

    if (error) {
      toast.error('Failed to delete lead');
    } else {
      toast.success('Lead deleted successfully');
      navigate('/leads');
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !followUpData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    const { error } = await supabase.from('FollowUpHistory').insert({
      leadId: lead.id,
      description: followUpData.description.trim(),
      notes: followUpData.notes.trim() || null,
      status: followUpData.status || null,
      priority: followUpData.priority || null,
    });

    if (error) {
      toast.error('Failed to add follow-up');
    } else {
      toast.success('Follow-up added');
      setIsFollowUpOpen(false);
      setFollowUpData({ description: '', notes: '', status: '', priority: '' });
      fetchFollowUps();
    }
  };

  const handleAddCallLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !callLogData.description.trim() || !callLogData.name.trim()) {
      toast.error('Name and description are required');
      return;
    }

    const { error } = await supabase.from('CallLog').insert({
      leadId: lead.id,
      name: callLogData.name.trim(),
      email: callLogData.email.trim() || null,
      phone: callLogData.phone.trim() || null,
      description: callLogData.description.trim(),
    });

    if (error) {
      toast.error('Failed to add call log');
    } else {
      toast.success('Call log added');
      setIsCallLogOpen(false);
      setCallLogData({ name: '', email: '', phone: '', description: '' });
      fetchCallLogs();
    }
  };

  if (isLoading || !lead) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/leads')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-semibold text-foreground">
                {lead.leadName}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {lead.companyName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this lead? This action cannot be
                          undone and will also delete all associated follow-ups and call logs.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Lead Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Lead Name</Label>
                      <Input
                        value={editData.leadName || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, leadName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input
                        value={editData.companyName || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, companyName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Person</Label>
                      <Input
                        value={editData.contactPerson || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, contactPerson: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={editData.phone || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Lead Source</Label>
                      <Input
                        value={editData.leadSource || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, leadSource: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={editData.status}
                        onValueChange={(value: LeadStatus) =>
                          setEditData({ ...editData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={editData.priority}
                        onValueChange={(value: LeadPriority) =>
                          setEditData({ ...editData, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {isAdmin && (
                      <div className="space-y-2">
                        <Label>Assignee</Label>
                        <Select
                          value={editData.assignee || ''}
                          onValueChange={(value) =>
                            setEditData({ ...editData, assignee: value || null })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((u) => (
                              <SelectItem key={u.id} value={u.email}>
                                {u.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Service</Label>
                      <Input
                        value={editData.service || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, service: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={editData.location || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, location: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Next Follow-up</Label>
                      <Input
                        type="date"
                        value={
                          editData.nextFollowUpDate
                            ? editData.nextFollowUpDate.split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          setEditData({ ...editData, nextFollowUpDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={editData.notes || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, notes: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Contact Person</p>
                        <p className="font-medium flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-muted-foreground" />
                          {lead.contactPerson || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {lead.email || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {lead.phone || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {lead.location || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <StatusBadge status={lead.status} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Priority</p>
                        <PriorityBadge priority={lead.priority} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lead Source</p>
                        <p className="font-medium">{lead.leadSource || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Service</p>
                        <p className="font-medium">{lead.service || '-'}</p>
                      </div>
                    </div>
                    {lead.notes && (
                      <div className="col-span-2 pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Notes</p>
                        <p className="text-foreground whitespace-pre-wrap">{lead.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Follow-up History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Follow-up History
                </CardTitle>
                <Dialog open={isFollowUpOpen} onOpenChange={setIsFollowUpOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Follow-up
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Follow-up</DialogTitle>
                      <DialogDescription>
                        Record a follow-up activity for this lead
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddFollowUp} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          value={followUpData.description}
                          onChange={(e) =>
                            setFollowUpData({ ...followUpData, description: e.target.value })
                          }
                          placeholder="What happened during this follow-up?"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={followUpData.status}
                            onValueChange={(value) =>
                              setFollowUpData({ ...followUpData, status: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select
                            value={followUpData.priority}
                            onValueChange={(value) =>
                              setFollowUpData({ ...followUpData, priority: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              {priorityOptions.map((priority) => (
                                <SelectItem key={priority} value={priority}>
                                  {priority}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={followUpData.notes}
                          onChange={(e) =>
                            setFollowUpData({ ...followUpData, notes: e.target.value })
                          }
                          placeholder="Additional notes..."
                          rows={2}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsFollowUpOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Add Follow-up</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {followUps.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No follow-up history yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {followUps.map((fu) => (
                      <div
                        key={fu.id}
                        className="flex gap-4 p-4 rounded-lg bg-muted/50 border"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(fu.createdAt), 'MMM d, yyyy h:mm a')}
                            </p>
                            {fu.status && (
                              <StatusBadge status={fu.status as LeadStatus} />
                            )}
                          </div>
                          <p className="text-foreground">{fu.description}</p>
                          {fu.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {fu.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Call Logs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <PhoneCall className="w-5 h-5" />
                  Call Logs
                </CardTitle>
                <Dialog open={isCallLogOpen} onOpenChange={setIsCallLogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Log Call
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log Call</DialogTitle>
                      <DialogDescription>Record a call with this lead</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddCallLog} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Contact Name *</Label>
                        <Input
                          value={callLogData.name}
                          onChange={(e) =>
                            setCallLogData({ ...callLogData, name: e.target.value })
                          }
                          placeholder="Who did you speak with?"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={callLogData.email}
                            onChange={(e) =>
                              setCallLogData({ ...callLogData, email: e.target.value })
                            }
                            placeholder="email@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            value={callLogData.phone}
                            onChange={(e) =>
                              setCallLogData({ ...callLogData, phone: e.target.value })
                            }
                            placeholder="+1 234..."
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          value={callLogData.description}
                          onChange={(e) =>
                            setCallLogData({ ...callLogData, description: e.target.value })
                          }
                          placeholder="What was discussed?"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCallLogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Log Call</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {callLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No call logs yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {callLogs.map((cl) => (
                      <div
                        key={cl.id}
                        className="flex gap-4 p-4 rounded-lg bg-muted/50 border"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-foreground">{cl.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(cl.createdAt), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                          <p className="text-foreground">{cl.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            {cl.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {cl.email}
                              </span>
                            )}
                            {cl.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {cl.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lead Notes Timeline */}
            <LeadNotesTimeline leadId={lead.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Assignee</span>
                  <span className="font-medium">
                    {lead.assignee?.split('@')[0] || 'Unassigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Next Follow-up</span>
                  <span className="font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {lead.nextFollowUpDate
                      ? format(parseISO(lead.nextFollowUpDate), 'MMM d, yyyy')
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {lead.createdAt
                      ? format(parseISO(lead.createdAt), 'MMM d, yyyy')
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="font-medium">
                    {lead.updatedAt
                      ? format(parseISO(lead.updatedAt), 'MMM d, yyyy')
                      : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display">Activity Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Follow-ups
                  </span>
                  <span className="font-semibold text-primary">{followUps.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-success" />
                    Calls Logged
                  </span>
                  <span className="font-semibold text-success">{callLogs.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
