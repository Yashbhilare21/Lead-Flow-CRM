import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeadStatus, LeadPriority } from '@/types/database';
import { toast } from 'sonner';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const validStatuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const validPriorities: LeadPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export function useLeadImport() {
  const [isImporting, setIsImporting] = useState(false);

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const importFromCSV = async (file: File): Promise<ImportResult> => {
    setIsImporting(true);
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        throw new Error('CSV file must have headers and at least one data row');
      }

      const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, ''));
      const dataRows = rows.slice(1);

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        try {
          const getValue = (key: string) => {
            const index = headers.findIndex(h => h.includes(key));
            return index >= 0 ? row[index] || null : null;
          };

          const leadName = getValue('leadname') || getValue('lead');
          const companyName = getValue('companyname') || getValue('company');

          if (!leadName || !companyName) {
            result.errors.push(`Row ${i + 2}: Lead name and company name are required`);
            result.failed++;
            continue;
          }

          const statusRaw = getValue('status') || 'New';
          const priorityRaw = getValue('priority') || 'Medium';
          
          const status = validStatuses.find(s => s.toLowerCase() === statusRaw.toLowerCase()) || 'New';
          const priority = validPriorities.find(p => p.toLowerCase() === priorityRaw.toLowerCase()) || 'Medium';

          const leadData = {
            leadName,
            companyName,
            contactPerson: getValue('contactperson') || getValue('contact'),
            email: getValue('email'),
            phone: getValue('phone'),
            status,
            priority,
            assignee: getValue('assignee'),
            leadSource: getValue('leadsource') || getValue('source'),
            service: getValue('service'),
            location: getValue('location'),
            notes: getValue('notes'),
            nextFollowUpDate: getValue('nextfollowup') || getValue('followup'),
          };

          const { error } = await supabase.from('Lead').insert(leadData);

          if (error) {
            result.errors.push(`Row ${i + 2}: ${error.message}`);
            result.failed++;
          } else {
            result.success++;
          }
        } catch (err) {
          result.errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          result.failed++;
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse CSV');
    } finally {
      setIsImporting(false);
    }

    return result;
  };

  const downloadTemplate = () => {
    const headers = [
      'Lead Name',
      'Company Name',
      'Contact Person',
      'Email',
      'Phone',
      'Status',
      'Priority',
      'Assignee',
      'Lead Source',
      'Service',
      'Location',
      'Next Follow-up',
      'Notes',
    ];
    const exampleRow = [
      'John Doe',
      'Acme Corp',
      'Jane Smith',
      'jane@acme.com',
      '+1234567890',
      'New',
      'Medium',
      'sales@company.com',
      'Website',
      'Consulting',
      'New York',
      '2025-01-15',
      'Interested in services',
    ];

    const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leads-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { importFromCSV, downloadTemplate, isImporting };
}
