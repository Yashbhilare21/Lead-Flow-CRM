import { format, parseISO } from 'date-fns';

interface CallLogWithDuration {
  id: number;
  createdAt: string | null;
  leadId: number;
  name: string;
  email: string | null;
  phone: string | null;
  description: string;
  duration_minutes?: number | null;
}

export function useCallLogExport() {
  const exportToCSV = (callLogs: CallLogWithDuration[], getLeadInfo: (leadId: number) => string, filename = 'call-logs-export') => {
    const headers = [
      'Date',
      'Lead',
      'Contact Name',
      'Email',
      'Phone',
      'Duration (mins)',
      'Description',
    ];

    const csvRows = [
      headers.join(','),
      ...callLogs.map((log) => {
        const values = [
          log.createdAt ? format(parseISO(log.createdAt), 'yyyy-MM-dd HH:mm') : '',
          escapeCSV(getLeadInfo(log.leadId)),
          escapeCSV(log.name || ''),
          escapeCSV(log.email || ''),
          escapeCSV(log.phone || ''),
          log.duration_minutes?.toString() || '',
          escapeCSV(log.description || ''),
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
