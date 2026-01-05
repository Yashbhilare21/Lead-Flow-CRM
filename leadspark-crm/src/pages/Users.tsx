import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole, UserStatus } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Plus, Search, Mail, Phone, Building2, UserCheck, UserX, Edit } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Users() {
  const { user: currentUser, signUp } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Create form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Employee' as UserRole,
    department: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      toast.error('Failed to fetch users');
    } else {
      setUsers(data as User[]);
    }
    setIsLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      toast.error('Name, email, and password are required');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const { error } = await signUp(formData.email, formData.password, {
      name: formData.name.trim(),
      phone: formData.phone.trim() || null,
      role: formData.role,
      department: formData.department.trim() || null,
    });

    if (error) {
      toast.error(error.message || 'Failed to create user');
    } else {
      toast.success('User created successfully');
      setIsCreateOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'Employee',
        department: '',
      });
      fetchUsers();
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const { error } = await supabase
      .from('User')
      .update({
        name: editingUser.name,
        phone: editingUser.phone,
        role: editingUser.role,
        department: editingUser.department,
        status: editingUser.status,
      })
      .eq('id', editingUser.id);

    if (error) {
      toast.error('Failed to update user');
    } else {
      toast.success('User updated successfully');
      setIsEditOpen(false);
      setEditingUser(null);
      fetchUsers();
    }
  };

  const toggleUserStatus = async (user: User) => {
    const newStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';

    const { error } = await supabase
      .from('User')
      .update({ status: newStatus })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update user status');
    } else {
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchUsers();
    }
  };

  // Filter users
  const filteredUsers = users.filter(
    (user) =>
      searchQuery === '' ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const columns = [
    {
      key: 'name',
      header: 'User',
      cell: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-foreground">{user.name}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (user: User) => (
        <Badge
          variant={user.role === 'Admin' ? 'default' : 'secondary'}
          className={cn(
            user.role === 'Admin' && 'bg-primary text-primary-foreground'
          )}
        >
          {user.role}
        </Badge>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      cell: (user: User) => (
        <span className="text-sm flex items-center gap-1">
          <Building2 className="w-3 h-3 text-muted-foreground" />
          {user.department || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user: User) => (
        <Badge
          variant={user.status === 'active' ? 'default' : 'secondary'}
          className={cn(
            user.status === 'active'
              ? 'bg-success/10 text-success border-success/20'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {user.status === 'active' ? (
            <UserCheck className="w-3 h-3 mr-1" />
          ) : (
            <UserX className="w-3 h-3 mr-1" />
          )}
          {user.status}
        </Badge>
      ),
    },
    {
      key: 'stats',
      header: 'Leads',
      cell: (user: User) => (
        <div className="text-sm">
          <span className="text-foreground font-medium">{user.leadsAssigned}</span>
          <span className="text-muted-foreground"> assigned</span>
          <span className="mx-1">·</span>
          <span className="text-success font-medium">{user.leadsConverted}</span>
          <span className="text-muted-foreground"> converted</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (user: User) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditingUser(user);
              setIsEditOpen(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleUserStatus(user);
            }}
            disabled={user.id === currentUser?.id}
            className={cn(
              user.status === 'active'
                ? 'text-destructive hover:text-destructive'
                : 'text-success hover:text-success'
            )}
          >
            {user.status === 'active' ? (
              <UserX className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
          </Button>
        </div>
      ),
      className: 'w-24',
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="User Management"
          description="Manage users and their access"
          actions={
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the system
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="user@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Minimum 6 characters"
                    />
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
                        placeholder="+1 234..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value: UserRole) =>
                          setFormData({ ...formData, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Employee">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      placeholder="e.g., Sales, Marketing"
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
                    <Button type="submit">Create User</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users Table */}
        <DataTable
          columns={columns}
          data={filteredUsers}
          emptyMessage={isLoading ? 'Loading users...' : 'No users found'}
        />

        {/* Edit User Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <form onSubmit={handleEditUser} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={editingUser.email} disabled className="bg-muted" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={editingUser.phone || ''}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={editingUser.role}
                      onValueChange={(value: UserRole) =>
                        setEditingUser({ ...editingUser, role: value })
                      }
                      disabled={editingUser.id === currentUser?.id}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input
                      value={editingUser.department || ''}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, department: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editingUser.status}
                      onValueChange={(value: UserStatus) =>
                        setEditingUser({ ...editingUser, status: value })
                      }
                      disabled={editingUser.id === currentUser?.id}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
