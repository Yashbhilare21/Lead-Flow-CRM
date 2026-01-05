import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Mail, Phone, Building2, Lock, Loader2, Shield, Users } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  department: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const adminPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Settings() {
  const { user, isAdmin, refreshUser, updatePassword, session } = useAuth();
  const navigate = useNavigate();
  
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isAdminPasswordLoading, setIsAdminPasswordLoading] = useState(false);
  
  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Admin password reset form
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [adminPasswordErrors, setAdminPasswordErrors] = useState<Record<string, string>>({});

  // Fetch employees for admin password reset
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-password-reset'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('User')
        .select('id, name, email, auth_user_id, role')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});

    const result = profileSchema.safeParse({ name, phone, department });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path[0]] = issue.message;
      });
      setProfileErrors(errors);
      return;
    }

    if (!user) return;

    setIsProfileLoading(true);
    const { error } = await supabase
      .from('User')
      .update({
        name,
        phone: phone || null,
        department: department || null,
      })
      .eq('id', user.id);
    
    setIsProfileLoading(false);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
      await refreshUser();
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    const result = passwordSchema.safeParse({ 
      currentPassword, 
      newPassword, 
      confirmPassword 
    });
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path[0]] = issue.message;
      });
      setPasswordErrors(errors);
      return;
    }

    setIsPasswordLoading(true);
    const { error } = await updatePassword(newPassword);
    setIsPasswordLoading(false);

    if (error) {
      toast.error(error.message || 'Failed to update password');
    } else {
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleAdminPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPasswordErrors({});

    if (!selectedUserId) {
      toast.error('Please select an employee');
      return;
    }

    const result = adminPasswordSchema.safeParse({ 
      newPassword: adminNewPassword, 
      confirmPassword: adminConfirmPassword 
    });
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path[0]] = issue.message;
      });
      setAdminPasswordErrors(errors);
      return;
    }

    const selectedEmployee = employees.find(emp => emp.id.toString() === selectedUserId);
    if (!selectedEmployee?.auth_user_id) {
      toast.error('Employee does not have an associated auth account');
      return;
    }

    setIsAdminPasswordLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: {
          userId: selectedEmployee.auth_user_id,
          newPassword: adminNewPassword,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Password updated for ${selectedEmployee.name}`);
      setSelectedUserId('');
      setAdminNewPassword('');
      setAdminConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsAdminPasswordLoading(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <AppLayout>
      {/* 
          FIX: Standardized container with padding and animation 
          to match your Dashboard and Leads pages.
      */}
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
        
        <PageHeader
          title="Settings"
          description="Manage your account settings and preferences"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Profile Settings */}
          <Card className="border-none shadow-xl rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-muted/30 border-b pb-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <User className="w-5 h-5" />
                </div>
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-background/50 border-muted"
                      placeholder="Your name"
                    />
                  </div>
                  {profileErrors.name && (
                    <p className="text-xs text-destructive font-medium ml-1">{profileErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="pl-10 bg-muted/50 text-muted-foreground border-dashed"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic ml-1">* Email address is fixed and cannot be changed.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 bg-background/50 border-muted"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Department</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="pl-10 bg-background/50 border-muted"
                        placeholder="Sales, Marketing..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-muted/40 p-3 rounded-lg flex items-center justify-between text-xs border border-muted mt-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Account Role: <strong className="text-foreground uppercase">{user.role}</strong></span>
                  </div>
                  <Badge variant="outline" className="bg-background text-[10px] font-bold uppercase">{user.status}</Badge>
                </div>

                <Button type="submit" className="w-full shadow-md mt-4" disabled={isProfileLoading}>
                  {isProfileLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Profile Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card className="border-none shadow-xl rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-muted/30 border-b pb-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Lock className="w-5 h-5" />
                </div>
                Change Password
              </CardTitle>
              <CardDescription>
                Update your security credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password text-xs font-semibold uppercase text-muted-foreground tracking-wider ml-1">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-10 bg-background/50 border-muted"
                      placeholder="••••••••"
                    />
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-destructive font-medium ml-1">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password text-xs font-semibold uppercase text-muted-foreground tracking-wider ml-1">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 bg-background/50 border-muted"
                      placeholder="••••••••"
                    />
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-destructive font-medium ml-1">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password text-xs font-semibold uppercase text-muted-foreground tracking-wider ml-1">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-new-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-background/50 border-muted"
                      placeholder="••••••••"
                    />
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-destructive font-medium ml-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <Button type="submit" className="w-full shadow-md mt-4" disabled={isPasswordLoading}>
                  {isPasswordLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update Security Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Admin Password Reset - Only visible to admins */}
          {isAdmin && (
            <Card className="lg:col-span-2 border-none shadow-xl rounded-xl overflow-hidden border-t-4 border-t-primary bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-primary/5 border-b pb-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-primary/20 rounded-lg text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                  Reset Employee Password
                </CardTitle>
                <CardDescription>
                  Administrative access to reset employee passwords without verification.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleAdminPasswordReset} className="space-y-6 max-w-xl mx-auto">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-primary ml-1">Step 1: Select Employee</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="bg-background border-muted h-12">
                        <SelectValue placeholder="Search for an employee..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employees
                          .filter(emp => emp.auth_user_id && emp.id !== user?.id)
                          .map((emp) => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                              {emp.name} — {emp.email} ({emp.role})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-primary ml-1">Step 2: Set New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="admin-new-password"
                          type="password"
                          value={adminNewPassword}
                          onChange={(e) => setAdminNewPassword(e.target.value)}
                          className="pl-10 bg-background border-muted h-11"
                          placeholder="••••••••"
                        />
                      </div>
                      {adminPasswordErrors.newPassword && (
                        <p className="text-xs text-destructive font-medium ml-1">{adminPasswordErrors.newPassword}</p>
                      )}
                    </div>

                    <div className="space-y-2 pt-[22px] sm:pt-0">
                      <Label className="hidden sm:block text-xs font-bold uppercase tracking-widest text-primary ml-1">Step 3: Confirm</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="admin-confirm-password"
                          type="password"
                          value={adminConfirmPassword}
                          onChange={(e) => setAdminConfirmPassword(e.target.value)}
                          className="pl-10 bg-background border-muted h-11"
                          placeholder="••••••••"
                        />
                      </div>
                      {adminPasswordErrors.confirmPassword && (
                        <p className="text-xs text-destructive font-medium ml-1">{adminPasswordErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto px-10 h-11 shadow-lg bg-primary hover:bg-primary/90 transition-all" 
                    disabled={isAdminPasswordLoading || !selectedUserId}
                  >
                    {isAdminPasswordLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Confirm Administrative Reset
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

// Simple Badge component for status if you don't have one in ui folder
function Badge({ children, variant, className }: any) {
  const variants: any = {
    outline: "border border-muted-foreground/30 text-muted-foreground"
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold", variants[variant], className)}>
      {children}
    </span>
  );
}