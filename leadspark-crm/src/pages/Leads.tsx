import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge, PriorityBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus, LeadPriority, User } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { useOverdueLeads, getOverdueStatus } from '@/hooks/useOverdueLeads';
import { useAutosave, loadDraft, clearDraft, hasDraft } from '@/hooks/useAutosave';
import { toast } from 'sonner';
import { Plus, Building2, Mail, Phone, AlertTriangle, Clock, PhoneCall, Users } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LeadImportDialog } from '@/components/leads/LeadImportDialog';
import { InlineEditSelect } from '@/components/leads/InlineEditSelect';
import { QuickCallLogDialog } from '@/components/leads/QuickCallLogDialog';
import { BulkReassignDialog } from '@/components/leads/BulkReassignDialog';
import { useLeadExport } from '@/hooks/useLeadExport';
import { cn } from '@/lib/utils';

const statusOptions: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const priorityOptions: LeadPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

interface LeadFormData {
  leadName: string;
  companyName: string;
  email: string;
  contactPerson: string;
  phone: string;
  assignee: string;
  priority: LeadPriority;
  status: LeadStatus;
  leadSource: string;
  service: string;
  location: string;
  notes: string;
  nextFollowUpDate: string;
}

const defaultFormData: LeadFormData = {
  leadName: '',
  companyName: '',
  email: '',
  contactPerson: '',
  phone: '',
  assignee: '',
  priority: 'Medium',
  status: 'New',
  leadSource: '',
  service: '',
  location: '',
  notes: '',
  nextFollowUpDate: '',
};

export default function Leads() {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const { exportToCSV } = useLeadExport();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  // Bulk selection state
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [isBulkReassignOpen, setIsBulkReassignOpen] = useState(false);
  
  // Quick call log state
  const [quickCallLead, setQuickCallLead] = useState<Lead | null>(null);
  const [isQuickCallOpen, setIsQuickCallOpen] = useState(false);

  // Optimistic update hook
  const { updateLead, loadingId } = useOptimisticUpdate();

  // Overdue metrics
  const { overdueCount, dueTodayCount } = useOverdueLeads(leads);

  // Create form state with autosave
  const [formData, setFormData] = useState<LeadFormData>(() => {
    const draft = loadDraft<LeadFormData>('lead-create');
    return draft || defaultFormData;
  });

  // Autosave form data
  useAutosave({
    key: 'lead-create',
    data: formData,
    enabled: isCreateOpen && (formData.leadName !== '' || formData.companyName !== ''),
  });

  // Check for draft on mount
  useEffect(() => {
    if (hasDraft('lead-create') && isAdmin) {
      toast.info('You have an unsaved lead draft', {
        action: {
          label: 'Restore',
          onClick: () => {
            const draft = loadDraft<LeadFormData>('lead-create');
            if (draft) {
              setFormData(draft);
              setIsCreateOpen(true);
            }
          },
        },
        duration: 5000,
      });
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchLeads();
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('Lead')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      toast.error('Failed to fetch leads');
      console.error(error);
    } else {
      setLeads(data as Lead[]);
    }
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('status', 'active');

    if (error) {
      console.error('Failed to fetch users:', error);
    } else {
      setUsers(data as User[]);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leadName.trim() || !formData.companyName.trim()) {
      toast.error('Lead name and company name are required');
      return;
    }

    const leadData = {
      leadName: formData.leadName.trim(),
      companyName: formData.companyName.trim(),
      email: formData.email.trim() || null,
      contactPerson: formData.contactPerson.trim() || null,
      phone: formData.phone.trim() || null,
      assignee: formData.assignee || null,
      priority: formData.priority,
      status: formData.status,
      leadSource: formData.leadSource.trim() || null,
      service: formData.service.trim() || null,
      location: formData.location.trim() || null,
      notes: formData.notes.trim() || null,
      nextFollowUpDate: formData.nextFollowUpDate || null,
    };

    const { error } = await supabase.from('Lead').insert(leadData);

    if (error) {
      toast.error('Failed to create lead');
      console.error(error);
    } else {
      toast.success('Lead created successfully');
      clearDraft('lead-create');
      setIsCreateOpen(false);
      setFormData(defaultFormData);
      fetchLeads();
    }
  };

  // Inline update handlers
  const handleInlineStatusChange = useCallback(async (leadId: number, newStatus: LeadStatus) => {
    await updateLead(leadId, { status: newStatus }, leads, setLeads);
  }, [leads, updateLead]);

  const handleInlinePriorityChange = useCallback(async (leadId: number, newPriority: LeadPriority) => {
    await updateLead(leadId, { priority: newPriority }, leads, setLeads);
  }, [leads, updateLead]);

  const handleInlineAssigneeChange = useCallback(async (leadId: number, newAssignee: string) => {
    await updateLead(leadId, { assignee: newAssignee || null }, leads, setLeads);
  }, [leads, updateLead]);

  // Bulk selection handlers
  const toggleLeadSelection = (leadId: number) => {
    setSelectedLeads(prev => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      return next;
    });
  };

  const toggleAllSelection = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const getSelectedLeadObjects = () => {
    return leads.filter(l => selectedLeads.has(l.id));
  };

  // Filter leads with date range support
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchQuery === '' ||
      lead.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchQuery));

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    const matchesAssignee =
      assigneeFilter === 'all' ||
      (assigneeFilter === 'unassigned' && !lead.assignee) ||
      lead.assignee === assigneeFilter;

    // Date range filter
    let matchesDateRange = true;
    if (lead.createdAt) {
      const leadDate = parseISO(lead.createdAt);
      if (dateFrom && isBefore(leadDate, startOfDay(dateFrom))) {
        matchesDateRange = false;
      }
      if (dateTo && isAfter(leadDate, endOfDay(dateTo))) {
        matchesDateRange = false;
      }
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesDateRange;
  });

  const handleExport = () => {
    if (filteredLeads.length === 0) {
      toast.error('No leads to export');
      return;
    }
    exportToCSV(filteredLeads, 'leads');
    toast.success(`Exported ${filteredLeads.length} lead(s)`);
  };

  // Get row class based on overdue status
  const getRowClassName = (lead: Lead) => {
    const status = getOverdueStatus(lead);
    if (status === 'overdue') return 'bg-destructive/5 hover:bg-destructive/10';
    if (status === 'due-today') return 'bg-warning/5 hover:bg-warning/10';
    return '';
  };

  // Check if user can edit a lead
  const canEditLead = (lead: Lead) => {
    if (isAdmin) return true;
    return lead.assignee === user?.email;
  };

  return (
    <AppLayout>
      <div className="p-8 lg:p-10 space-y-6">
        <PageHeader
          title={isAdmin ? 'All Leads' : 'My Leads'}
          description={isAdmin ? 'Manage all leads in the system' : 'Leads assigned to you'}
          actions={
            <div className="flex items-center gap-2">
              {/* Overdue indicators */}
              {overdueCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {overdueCount} Overdue
                </Badge>
              )}
              {dueTodayCount > 0 && (
                <Badge variant="outline" className="flex items-center gap-1 border-warning text-warning">
                  <Clock className="w-3 h-3" />
                  {dueTodayCount} Due Today
                </Badge>
              )}
              
              {/* Bulk actions */}
              {isAdmin && selectedLeads.size > 0 && (
                <Button variant="outline" onClick={() => setIsBulkReassignOpen(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  Reassign ({selectedLeads.size})
                </Button>
              )}
              
              {isAdmin && (
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lead
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Lead</DialogTitle>
                      <DialogDescription>
                        Add a new lead to the system
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateLead} className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="leadName">Lead Name *</Label>
                          <Input
                            id="leadName"
                            value={formData.leadName}
                            onChange={(e) =>
                              setFormData({ ...formData, leadName: e.target.value })
                            }
                            placeholder="Enter lead name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name *</Label>
                          <Input
                            id="companyName"
                            value={formData.companyName}
                            onChange={(e) =>
                              setFormData({ ...formData, companyName: e.target.value })
                            }
                            placeholder="Enter company name"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactPerson">Contact Person</Label>
                          <Input
                            id="contactPerson"
                            value={formData.contactPerson}
                            onChange={(e) =>
                              setFormData({ ...formData, contactPerson: e.target.value })
                            }
                            placeholder="Contact name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            placeholder="email@company.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="leadSource">Lead Source</Label>
                          <Input
                            id="leadSource"
                            value={formData.leadSource}
                            onChange={(e) =>
                              setFormData({ ...formData, leadSource: e.target.value })
                            }
                            placeholder="e.g., Website, Referral"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: LeadStatus) =>
                              setFormData({ ...formData, status: value })
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
                          <Label htmlFor="priority">Priority</Label>
                          <Select
                            value={formData.priority}
                            onValueChange={(value: LeadPriority) =>
                              setFormData({ ...formData, priority: value })
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
                        <div className="space-y-2">
                          <Label htmlFor="assignee">Assignee</Label>
                          <Select
                            value={formData.assignee}
                            onValueChange={(value) =>
                              setFormData({ ...formData, assignee: value })
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
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="service">Service</Label>
                          <Input
                            id="service"
                            value={formData.service}
                            onChange={(e) =>
                              setFormData({ ...formData, service: e.target.value })
                            }
                            placeholder="Service interested in"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({ ...formData, location: e.target.value })
                            }
                            placeholder="City, Country"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nextFollowUpDate">Next Follow-up Date</Label>
                        <Input
                          id="nextFollowUpDate"
                          type="date"
                          value={formData.nextFollowUpDate}
                          onChange={(e) =>
                            setFormData({ ...formData, nextFollowUpDate: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          placeholder="Additional notes..."
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Create Lead</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          }
        />

        {/* Enhanced Filters */}
        <LeadFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          assigneeFilter={assigneeFilter}
          setAssigneeFilter={setAssigneeFilter}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          users={users}
          isAdmin={isAdmin}
          onExport={handleExport}
          onImport={() => setIsImportOpen(true)}
          resultCount={filteredLeads.length}
        />

        {/* Leads Table with Inline Edit */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {isAdmin && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={toggleAllSelection}
                    />
                  </TableHead>
                )}
                <TableHead>Lead</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Next Follow-up</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} className="h-24 text-center text-muted-foreground">
                    {isLoading ? 'Loading leads...' : 'No leads found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => {
                  const overdueStatus = getOverdueStatus(lead);
                  const canEdit = canEditLead(lead);
                  
                  return (
                    <TableRow
                      key={lead.id}
                      className={cn(
                        'cursor-pointer transition-colors',
                        getRowClassName(lead)
                      )}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      {isAdmin && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedLeads.has(lead.id)}
                            onCheckedChange={() => toggleLeadSelection(lead.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-foreground">{lead.leadName}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {lead.companyName}
                            </p>
                          </div>
                          {overdueStatus === 'overdue' && (
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                          )}
                          {overdueStatus === 'due-today' && (
                            <Badge variant="outline" className="text-xs border-warning text-warning">Due Today</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {lead.email && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </p>
                          )}
                          {lead.phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <InlineEditSelect
                          value={lead.status}
                          options={statusOptions}
                          onChange={(value) => handleInlineStatusChange(lead.id, value)}
                          disabled={!canEdit}
                          isLoading={loadingId === lead.id}
                          renderValue={(status) => <StatusBadge status={status} />}
                        />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <InlineEditSelect
                          value={lead.priority}
                          options={priorityOptions}
                          onChange={(value) => handleInlinePriorityChange(lead.id, value)}
                          disabled={!canEdit}
                          isLoading={loadingId === lead.id}
                          renderValue={(priority) => <PriorityBadge priority={priority} />}
                        />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {isAdmin ? (
                          <InlineEditSelect
                            value={lead.assignee || ''}
                            options={['', ...users.map(u => u.email)]}
                            onChange={(value) => handleInlineAssigneeChange(lead.id, value)}
                            isLoading={loadingId === lead.id}
                            renderValue={(email) => (
                              <span className="text-sm">
                                {email ? email.split('@')[0] : <span className="italic text-muted-foreground">Unassigned</span>}
                              </span>
                            )}
                          />
                        ) : (
                          <span className="text-sm">
                            {lead.assignee ? lead.assignee.split('@')[0] : (
                              <span className="text-muted-foreground italic">Unassigned</span>
                            )}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {lead.nextFollowUpDate
                            ? format(parseISO(lead.nextFollowUpDate), 'MMM d, yyyy')
                            : '-'}
                        </span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setQuickCallLead(lead);
                            setIsQuickCallOpen(true);
                          }}
                          title="Log Call"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Import Dialog */}
        <LeadImportDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          onSuccess={fetchLeads}
        />

        {/* Quick Call Log Dialog */}
        <QuickCallLogDialog
          lead={quickCallLead}
          open={isQuickCallOpen}
          onOpenChange={setIsQuickCallOpen}
          onSuccess={fetchLeads}
        />

        {/* Bulk Reassign Dialog */}
        <BulkReassignDialog
          leads={getSelectedLeadObjects()}
          users={users}
          open={isBulkReassignOpen}
          onOpenChange={setIsBulkReassignOpen}
          onSuccess={() => {
            setSelectedLeads(new Set());
            fetchLeads();
          }}
        />
      </div>
    </AppLayout>
  );
}
