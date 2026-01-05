import { format, parseISO } from 'date-fns';

interface FollowUp {
  id: number;
  createdAt: string | null;
  description: string;
  notes: string | null;
  status: string | null;
  priority: string | null;
  Lead?: {
    id: number;
    leadName: string;
    companyName: string;
    assignee: string | null;
  };
}

export function useFollowUpExport() {
  const exportToCSV = (followUps: FollowUp[], filename = 'followups-export') => {
    const headers = [
      'Date',
      'Lead Name',
      'Company Name',
      'Description',
      'Status',
      'Priority',
      'Assignee',
      'Notes',
    ];

    const csvRows = [
      headers.join(','),
      ...followUps.map((followUp) => {
        const values = [
          followUp.createdAt ? format(parseISO(followUp.createdAt), 'yyyy-MM-dd HH:mm') : '',
          escapeCSV(followUp.Lead?.leadName || ''),
          escapeCSV(followUp.Lead?.companyName || ''),
          escapeCSV(followUp.description || ''),
          followUp.status || '',
          followUp.priority || '',
          escapeCSV(followUp.Lead?.assignee || ''),
          escapeCSV(followUp.notes || ''),
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
