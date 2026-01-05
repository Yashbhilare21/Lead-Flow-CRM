import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge, PriorityBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Calendar, ExternalLink, Download, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFollowUpExport } from '@/hooks/useFollowUpExport';
import { toast } from 'sonner';
import type { LeadStatus, LeadPriority } from '@/types/database';

const priorityOptions: LeadPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
const statusOptions: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export default function FollowUps() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { exportToCSV } = useFollowUpExport();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: followUps, isLoading } = useQuery({
    queryKey: ['follow-ups', search, priorityFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('FollowUpHistory')
        .select(`
          *,
          Lead:leadId (
            id,
            leadName,
            companyName,
            assignee
          )
        `)
        .order('createdAt', { ascending: false });

      if (priorityFilter && priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      if (search) {
        const searchLower = search.toLowerCase();
        return data?.filter((f: any) => 
          f.description?.toLowerCase().includes(searchLower) ||
          f.notes?.toLowerCase().includes(searchLower) ||
          f.Lead?.leadName?.toLowerCase().includes(searchLower) ||
          f.Lead?.companyName?.toLowerCase().includes(searchLower)
        );
      }
      
      return data;
    },
  });

  const handleExport = () => {
    if (!followUps || followUps.length === 0) {
      toast.error('No follow-ups to export');
      return;
    }
    exportToCSV(followUps, 'follow-ups');
    toast.success(`Exported ${followUps.length} follow-up(s)`);
  };

  const columns = [
    {
      header: 'Date',
      key: 'createdAt',
      cell: (row: any) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span>{row.createdAt ? format(new Date(row.createdAt), 'MMM dd, yyyy') : '-'}</span>
            <span className="text-[10px] text-muted-foreground uppercase">
              {row.createdAt ? format(new Date(row.createdAt), 'h:mm a') : ''}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Lead',
      key: 'lead',
      cell: (row: any) => (
        <div className="max-w-[200px]">
          <p className="font-semibold text-sm truncate">{row.Lead?.leadName || 'Unknown'}</p>
          <p className="text-xs text-muted-foreground truncate">{row.Lead?.companyName}</p>
        </div>
      ),
    },
    {
      header: 'Description',
      key: 'description',
      cell: (row: any) => (
        <p className="max-w-xs md:max-w-md text-sm text-muted-foreground line-clamp-2">
          {row.description}
        </p>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      cell: (row: any) => row.status && <StatusBadge status={row.status as LeadStatus} />,
    },
    {
      header: 'Priority',
      key: 'priority',
      cell: (row: any) => row.priority && <PriorityBadge priority={row.priority as LeadPriority} />,
    },
    ...(isAdmin ? [{
      header: 'Assignee',
      key: 'assignee',
      cell: (row: any) => (
        <span className="text-xs font-medium text-muted-foreground">{row.Lead?.assignee || 'Unassigned'}</span>
      ),
    }] : []),
    {
      header: 'Actions',
      key: 'actions',
      cell: (row: any) => (
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() => navigate(`/leads/${row.leadId}`)}
        >
          <ExternalLink className="w-4 h-4 mr-1.5" />
          View Lead
        </Button>
      ),
    },
  ];

  const clearFilters = () => {
    setSearch('');
    setPriorityFilter('all');
    setStatusFilter('all');
  };

  return (
    <AppLayout>
      {/* 
          FIX: Added a container with padding and max-width 
          This ensures alignment matches the 'Dashboard' page 
      */}
      <div className="container mx-auto p-4 md:p-2 lg:p-8 space-y-4 animate-in fade-in duration-500">
        
        <PageHeader
          title="Follow-Up History"
          description="Track all follow-up activities across leads"
        />

        {/* Filters Section */}
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row flex-wrap gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search follow-ups..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-background/50 border-muted"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-background/50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px] bg-background/50">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {priorityOptions.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={clearFilters}
                  className="px-3 w-auto gap-2 text-muted-foreground"
                  title="Clear Filters"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear Filters</span>
                </Button>

                <Button 
                  variant="default" 
                  onClick={handleExport}
                  className="gap-2 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table Section */}
        <Card className="border-none shadow-xl overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={followUps || []}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}