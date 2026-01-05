export type UserRole = 'Admin' | 'Employee';
export type UserStatus = 'active' | 'inactive';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
export type LeadPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface User {
  id: number;
  auth_user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  department: string | null;
  status: UserStatus;
  joinDate: string;
  leadsAssigned: number;
  leadsConverted: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: number;
  leadName: string;
  companyName: string;
  email: string | null;
  contactPerson: string | null;
  phone: string | null;
  assignee: string | null;
  priority: LeadPriority;
  status: LeadStatus;
  leadSource: string | null;
  notes: string | null;
  nextFollowUpDate: string | null;
  followUpTime: string | null;
  service: string | null;
  location: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowUpHistory {
  id: number;
  leadId: number;
  description: string;
  notes: string | null;
  status: string | null;
  priority: string | null;
  createdAt: string;
}

export interface CallLog {
  id: number;
  leadId: number;
  name: string;
  email: string | null;
  phone: string | null;
  description: string;
  createdAt: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user: User | null;
}
