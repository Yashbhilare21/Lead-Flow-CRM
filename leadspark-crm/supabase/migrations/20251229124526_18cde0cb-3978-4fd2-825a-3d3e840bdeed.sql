-- Create enum types for consistent values
CREATE TYPE public.user_role AS ENUM ('Admin', 'Employee');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive');
CREATE TYPE public.lead_status AS ENUM ('New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost');
CREATE TYPE public.lead_priority AS ENUM ('Low', 'Medium', 'High', 'Urgent');

-- Create Role table (for role management)
CREATE TABLE public."Role" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Insert default roles
INSERT INTO public."Role" (name) VALUES ('Admin'), ('Employee');

-- Create User table (for application users)
CREATE TABLE public."User" (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'Employee',
  department TEXT,
  status user_status NOT NULL DEFAULT 'active',
  "joinDate" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "leadsAssigned" INTEGER DEFAULT 0,
  "leadsConverted" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Lead table
CREATE TABLE public."Lead" (
  id SERIAL PRIMARY KEY,
  "leadName" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  email TEXT,
  "contactPerson" TEXT,
  phone TEXT,
  assignee TEXT,
  priority lead_priority NOT NULL DEFAULT 'Medium',
  status lead_status NOT NULL DEFAULT 'New',
  "leadSource" TEXT,
  notes TEXT,
  "nextFollowUpDate" TIMESTAMP WITH TIME ZONE,
  "followUpTime" TIMESTAMP WITH TIME ZONE,
  service TEXT,
  location TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create FollowUpHistory table
CREATE TABLE public."FollowUpHistory" (
  id SERIAL PRIMARY KEY,
  "leadId" INTEGER NOT NULL REFERENCES public."Lead"(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  notes TEXT,
  status TEXT,
  priority TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create CallLog table
CREATE TABLE public."CallLog" (
  id SERIAL PRIMARY KEY,
  "leadId" INTEGER NOT NULL REFERENCES public."Lead"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  description TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table for RLS role checking (separate from User.role for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FollowUpHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CallLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user email from User table
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public."User" WHERE auth_user_id = _user_id LIMIT 1
$$;

-- RLS Policies for User table
CREATE POLICY "Admins can do everything on users"
ON public."User"
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Admin'))
WITH CHECK (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Users can view their own profile"
ON public."User"
FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

-- RLS Policies for Lead table
CREATE POLICY "Admins can do everything on leads"
ON public."Lead"
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Admin'))
WITH CHECK (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Employees can view assigned leads"
ON public."Lead"
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'Employee') 
  AND assignee = public.get_user_email(auth.uid())
);

CREATE POLICY "Employees can update assigned leads"
ON public."Lead"
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'Employee') 
  AND assignee = public.get_user_email(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'Employee') 
  AND assignee = public.get_user_email(auth.uid())
);

-- RLS Policies for FollowUpHistory table
CREATE POLICY "Admins can do everything on follow ups"
ON public."FollowUpHistory"
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Admin'))
WITH CHECK (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Employees can view follow ups for assigned leads"
ON public."FollowUpHistory"
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'Employee') 
  AND EXISTS (
    SELECT 1 FROM public."Lead" 
    WHERE id = "leadId" 
    AND assignee = public.get_user_email(auth.uid())
  )
);

CREATE POLICY "Employees can create follow ups for assigned leads"
ON public."FollowUpHistory"
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'Employee') 
  AND EXISTS (
    SELECT 1 FROM public."Lead" 
    WHERE id = "leadId" 
    AND assignee = public.get_user_email(auth.uid())
  )
);

-- RLS Policies for CallLog table
CREATE POLICY "Admins can do everything on call logs"
ON public."CallLog"
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Admin'))
WITH CHECK (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Employees can view call logs for assigned leads"
ON public."CallLog"
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'Employee') 
  AND EXISTS (
    SELECT 1 FROM public."Lead" 
    WHERE id = "leadId" 
    AND assignee = public.get_user_email(auth.uid())
  )
);

CREATE POLICY "Employees can create call logs for assigned leads"
ON public."CallLog"
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'Employee') 
  AND EXISTS (
    SELECT 1 FROM public."Lead" 
    WHERE id = "leadId" 
    AND assignee = public.get_user_email(auth.uid())
  )
);

-- RLS Policies for Role table (read only for authenticated users)
CREATE POLICY "Authenticated users can view roles"
ON public."Role"
FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for user_roles table
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Admin'))
WITH CHECK (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_lead_assignee ON public."Lead"(assignee);
CREATE INDEX idx_lead_status ON public."Lead"(status);
CREATE INDEX idx_lead_priority ON public."Lead"(priority);
CREATE INDEX idx_followup_leadid ON public."FollowUpHistory"("leadId");
CREATE INDEX idx_calllog_leadid ON public."CallLog"("leadId");
CREATE INDEX idx_user_email ON public."User"(email);
CREATE INDEX idx_user_auth_user_id ON public."User"(auth_user_id);

-- Create trigger for updating updatedAt
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON public."User"
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_updated_at
BEFORE UPDATE ON public."Lead"
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to sync user role to user_roles table
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete existing roles for this user
  DELETE FROM public.user_roles WHERE user_id = NEW.auth_user_id;
  
  -- Insert the new role
  IF NEW.auth_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.auth_user_id, NEW.role);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER sync_user_role_trigger
AFTER INSERT OR UPDATE OF role ON public."User"
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_role();