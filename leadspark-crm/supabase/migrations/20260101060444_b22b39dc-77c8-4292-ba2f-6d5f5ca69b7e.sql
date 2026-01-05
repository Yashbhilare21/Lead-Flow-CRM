-- Create LeadNoteHistory table for append-only notes
CREATE TABLE public."LeadNoteHistory" (
  id SERIAL PRIMARY KEY,
  "leadId" INTEGER NOT NULL REFERENCES public."Lead"(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public."LeadNoteHistory" ENABLE ROW LEVEL SECURITY;

-- Add duration_minutes to CallLog
ALTER TABLE public."CallLog" ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- RLS Policies for LeadNoteHistory

-- Admins can do everything
CREATE POLICY "Admins can do everything on lead notes"
ON public."LeadNoteHistory"
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'Admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'Admin'::user_role));

-- Employees can create notes for assigned leads
CREATE POLICY "Employees can create notes for assigned leads"
ON public."LeadNoteHistory"
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'Employee'::user_role) AND 
  EXISTS (
    SELECT 1 FROM public."Lead"
    WHERE "Lead".id = "LeadNoteHistory"."leadId"
    AND "Lead".assignee = get_user_email(auth.uid())
  )
);

-- Employees can view notes for assigned leads
CREATE POLICY "Employees can view notes for assigned leads"
ON public."LeadNoteHistory"
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'Employee'::user_role) AND 
  EXISTS (
    SELECT 1 FROM public."Lead"
    WHERE "Lead".id = "LeadNoteHistory"."leadId"
    AND "Lead".assignee = get_user_email(auth.uid())
  )
);

-- Create index for performance
CREATE INDEX idx_lead_note_history_lead_id ON public."LeadNoteHistory"("leadId");
CREATE INDEX idx_lead_note_history_created_at ON public."LeadNoteHistory"("createdAt" DESC);