import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { MetricCard } from '@/components/ui/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Lead, User } from '@/types/database';
import { StatusBadge, PriorityBadge } from '@/components/ui/status-badge';
import {
  Briefcase,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  ArrowRight,
  Target,
  AlertTriangle,
} from 'lucide-react';
import { format, isToday, parseISO, subDays, startOfDay, isAfter } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

const statusColors: Record<string, string> = {
  New: '#3b82f6',
  Contacted: '#06b6d4',
  Qualified: '#8b5cf6',
  Proposal: '#f59e0b',
  Negotiation: '#f97316',
  Won: '#22c55e',
  Lost: '#ef4444',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [leadsRes, usersRes] = await Promise.all([
        supabase.from('Lead').select('*').order('createdAt', { ascending: false }),
        supabase.from('User').select('*'),
      ]);

      if (leadsRes.data) setLeads(leadsRes.data as Lead[]);
      if (usersRes.data) setUsers(usersRes.data as User[]);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Calculate metrics
  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.status === 'Won').length;
  const lostLeads = leads.filter((l) => l.status === 'Lost').length;
  const inPipelineLeads = leads.filter((l) => !['Won', 'Lost'].includes(l.status)).length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const todayFollowUps = leads.filter(
    (l) => l.nextFollowUpDate && isToday(parseISO(l.nextFollowUpDate))
  ).length;
  const urgentLeads = leads.filter((l) => l.priority === 'Urgent' && !['Won', 'Lost'].includes(l.status)).length;

  // Status distribution for pie chart
  const statusData = Object.entries(
    leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Leads by assignee for bar chart
  const assigneeData = Object.entries(
    leads.reduce((acc, lead) => {
      const assignee = lead.assignee || 'Unassigned';
      acc[assignee] = (acc[assignee] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, leads]) => ({ name: name.split('@')[0], leads }))
    .slice(0, 6);

  // Leads trend over last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return {
      date: format(date, 'MMM d'),
      dateObj: startOfDay(date),
    };
  });

  const leadsTrend = last30Days.map(({ date, dateObj }) => {
    const count = leads.filter((lead) => {
      if (!lead.createdAt) return false;
      const leadDate = startOfDay(parseISO(lead.createdAt));
      return leadDate.getTime() === dateObj.getTime();
    }).length;
    return { date, count };
  });

  // Lead source distribution
  const sourceData = Object.entries(
    leads.reduce((acc, lead) => {
      const source = lead.leadSource || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Recent leads
  const recentLeads = leads.slice(0, 5);

  // Upcoming follow-ups
  const upcomingFollowUps = leads
    .filter((l) => l.nextFollowUpDate && isAfter(parseISO(l.nextFollowUpDate), startOfDay(new Date())))
    .sort((a, b) => 
      new Date(a.nextFollowUpDate!).getTime() - new Date(b.nextFollowUpDate!).getTime()
    )
    .slice(0, 5);

  return (
    <AppLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <PageHeader
          title="Dashboard"
          description="Overview of your lead management metrics and performance"
        />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Leads"
            value={totalLeads}
            icon={Briefcase}
            className="animate-slide-up"
          />
          <MetricCard
            title="In Pipeline"
            value={inPipelineLeads}
            icon={Target}
            iconClassName="bg-info/10"
            className="animate-slide-up"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${conversionRate}%`}
            icon={TrendingUp}
            iconClassName="bg-success/10"
            className="animate-slide-up"
          />
          <MetricCard
            title="Today's Follow-ups"
            value={todayFollowUps}
            icon={Calendar}
            iconClassName="bg-warning/10"
            className="animate-slide-up"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-success/15 rounded-xl">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{wonLeads}</p>
                <p className="text-sm text-muted-foreground font-medium">Won Deals</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20 card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-destructive/15 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{lostLeads}</p>
                <p className="text-sm text-muted-foreground font-medium">Lost Deals</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-primary/15 rounded-xl">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{activeUsers}</p>
                <p className="text-sm text-muted-foreground font-medium">Active Users</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-warning/15 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{urgentLeads}</p>
                <p className="text-sm text-muted-foreground font-medium">Urgent Leads</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Leads Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leadsTrend}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorLeads)"
                    strokeWidth={2}
                    name="Leads"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">Lead Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={statusColors[entry.name] || '#94a3b8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Leads by Assignee */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">Leads by Assignee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assigneeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="leads"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lists Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display">Recent Leads</CardTitle>
              <button
                onClick={() => navigate('/leads')}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">{lead.leadName}</p>
                      <p className="text-sm text-muted-foreground">{lead.companyName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={lead.status} />
                      <PriorityBadge priority={lead.priority} />
                    </div>
                  </div>
                ))}
                {recentLeads.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No leads yet. Create your first lead to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Follow-ups */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">Upcoming Follow-ups</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {upcomingFollowUps.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isToday(parseISO(lead.nextFollowUpDate!))
                            ? 'bg-warning/10 text-warning'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{lead.leadName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(lead.nextFollowUpDate!), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>
                ))}
                {upcomingFollowUps.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No upcoming follow-ups scheduled.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
