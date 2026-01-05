import { Lead } from '@/types/database';
import { format, parseISO } from 'date-fns';

export function useLeadExport() {
  const exportToCSV = (leads: Lead[], filename = 'leads-export') => {
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
      'Created At',
    ];

    const csvRows = [
      headers.join(','),
      ...leads.map((lead) => {
        const values = [
          escapeCSV(lead.leadName),
          escapeCSV(lead.companyName),
          escapeCSV(lead.contactPerson || ''),
          escapeCSV(lead.email || ''),
          escapeCSV(lead.phone || ''),
          lead.status,
          lead.priority,
          escapeCSV(lead.assignee || ''),
          escapeCSV(lead.leadSource || ''),
          escapeCSV(lead.service || ''),
          escapeCSV(lead.location || ''),
          lead.nextFollowUpDate ? format(parseISO(lead.nextFollowUpDate), 'yyyy-MM-dd') : '',
          escapeCSV(lead.notes || ''),
          lead.createdAt ? format(parseISO(lead.createdAt), 'yyyy-MM-dd HH:mm') : '',
        ];
        return values.join(',');
      }),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { exportToCSV };
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
