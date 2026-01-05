import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Phone, Plus, Search, Calendar, User, Mail, Loader2, Download, History } from 'lucide-react';
import { format } from 'date-fns';
import { CallLog, Lead } from '@/types/database';
import { useCallLogExport } from '@/hooks/useCallLogExport';
import { cn } from '@/lib/utils';

export default function CallHistory() {
  const { isAdmin, user } = useAuth();
  const queryClient = useQueryClient();
  const { exportToCSV } = useCallLogExport();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [callName, setCallName] = useState('');
  const [callEmail, setCallEmail] = useState('');
  const [callPhone, setCallPhone] = useState('');
  const [callDescription, setCallDescription] = useState('');

  // Fetch leads for the dropdown
  const { data: leads = [] } = useQuery({
    queryKey: ['leads-for-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Lead')
        .select('id, leadName, companyName, contactPerson, email, phone')
        .order('leadName');
      
      if (error) throw error;
      return data as Lead[];
    },
  });

  // Fetch call logs
  const { data: callLogs = [], isLoading } = useQuery({
    queryKey: ['call-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('CallLog')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      return data as CallLog[];
    },
  });

  // Create call log mutation
  const createCallLog = useMutation({
    mutationFn: async (callData: Omit<CallLog, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('CallLog')
        .insert(callData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-logs'] });
      toast.success('Call log recorded successfully');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record call');
    },
  });

  const resetForm = () => {
    setSelectedLeadId('');
    setCallName('');
    setCallEmail('');
    setCallPhone('');
    setCallDescription('');
  };

  const handleLeadSelect = (leadId: string) => {
    setSelectedLeadId(leadId);
    const lead = leads.find(l => l.id.toString() === leadId);
    if (lead) {
      setCallName(lead.contactPerson || lead.leadName);
      setCallEmail(lead.email || '');
      setCallPhone(lead.phone || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLeadId) {
      toast.error('Please select a lead');
      return;
    }
    
    if (!callDescription.trim()) {
      toast.error('Please add a call description');
      return;
    }

    createCallLog.mutate({
      leadId: parseInt(selectedLeadId),
      name: callName,
      email: callEmail || null,
      phone: callPhone || null,
      description: callDescription,
    });
  };

  const getLeadInfo = (leadId: number) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? `${lead.leadName} (${lead.companyName})` : `Lead #${leadId}`;
  };

  const filteredLogs = callLogs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    return (
      log.name.toLowerCase().includes(searchLower) ||
      log.description.toLowerCase().includes(searchLower) ||
      (log.email?.toLowerCase().includes(searchLower)) ||
      (log.phone?.includes(searchTerm))
    );
  });

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      toast.error('No call logs to export');
      return;
    }
    exportToCSV(filteredLogs, getLeadInfo, 'call-logs');
    toast.success(`Exported ${filteredLogs.length} call log(s)`);
  };

  return (
    <AppLayout>
      {/* 
          FIX: Added container with padding and max-width 
          to align with the Dashboard and sidebar.
      */}
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
        
        <PageHeader
          title="Call History"
          description="View and record all call interactions with leads"
        />

        {/* Search and Actions Bar */}
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search calls by name, notes, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-muted"
                />
              </div>
              
              <div className="flex w-full md:w-auto gap-3">
                <Button variant="outline" onClick={handleExport} className="flex-1 md:flex-none gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 md:flex-none gap-2 shadow-md">
                      <Plus className="w-4 h-4" />
                      Record Call
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Record New Call</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="lead">Select Lead <span className="text-destructive">*</span></Label>
                        <Select value={selectedLeadId} onValueChange={handleLeadSelect}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Choose a lead" />
                          </SelectTrigger>
                          <SelectContent>
                            {leads.map((lead) => (
                              <SelectItem key={lead.id} value={lead.id.toString()}>
                                {lead.leadName} — {lead.companyName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Contact Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="name"
                              value={callName}
                              onChange={(e) => setCallName(e.target.value)}
                              className="pl-10 bg-background"
                              placeholder="Contact person"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              value={callPhone}
                              onChange={(e) => setCallPhone(e.target.value)}
                              className="pl-10 bg-background"
                              placeholder="Phone number"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={callEmail}
                            onChange={(e) => setCallEmail(e.target.value)}
                            className="pl-10 bg-background"
                            placeholder="Email address"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Call Notes <span className="text-destructive">*</span></Label>
                        <Textarea
                          id="description"
                          value={callDescription}
                          onChange={(e) => setCallDescription(e.target.value)}
                          placeholder="What did you discuss? What are the next steps?"
                          className="min-h-[120px] bg-background resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createCallLog.isPending} className="px-8">
                          {createCallLog.isPending && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          )}
                          Save Log
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table Section */}
        <Card className="border-none shadow-xl overflow-hidden rounded-xl bg-card">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <History className="w-4 h-4" />
              Call History Log ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary/60" />
                <p className="text-sm text-muted-foreground animate-pulse">Loading history...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-24 text-muted-foreground">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Phone className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-medium text-foreground">No call records found</p>
                <p className="text-sm max-w-[250px] mx-auto mt-1">Start recording your client interactions to build your history.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[180px]">Date & Time</TableHead>
                      <TableHead>Lead Information</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Phone / Email</TableHead>
                      <TableHead className="min-w-[320px]">Call Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              {log.createdAt ? format(new Date(log.createdAt), 'MMM d, yyyy') : 'N/A'}
                            </div>
                            <span className="text-[10px] text-muted-foreground uppercase ml-5">
                              {log.createdAt ? format(new Date(log.createdAt), 'h:mm a') : ''}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <p className="font-semibold text-sm truncate">{getLeadInfo(log.leadId)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">{log.name}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {log.phone ? (
                              <a href={`tel:${log.phone}`} className="text-xs text-primary hover:underline flex items-center gap-1.5">
                                <Phone className="w-3 h-3" /> {log.phone}
                              </a>
                            ) : <span className="text-xs text-muted-foreground">-</span>}
                            {log.email && (
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                <Mail className="w-3 h-3" /> {log.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 italic">
                            "{log.description}"
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}