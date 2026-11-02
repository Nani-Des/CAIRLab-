// sanity/components/RegistrationSummary.tsx
// Studio pane (AI for Professionals > Summary) showing how many people have
// registered, broken down by status and track. Counts refresh live as new
// registrations or approvals come in. The download buttons export every
// registration with all its details as a CSV that opens in Excel or Google
// Sheets. See sanity.config.ts.

import { useEffect, useState } from 'react';
import { Box, Button, Card, Flex, Grid, Heading, Spinner, Stack, Text } from '@sanity/ui';
import { useClient } from 'sanity';

type Counts = {
  employees: number;
  pending: number;
  approved: number;
  rejected: number;
  employers: number;
  graduates: number;
  tracks: { track: string; count: number }[];
};

const QUERY = `{
  "employees": count(*[_type == "aiProRegistration" && role == "employee"]),
  "pending": count(*[_type == "aiProRegistration" && status == "pending"]),
  "approved": count(*[_type == "aiProRegistration" && status == "approved"]),
  "rejected": count(*[_type == "aiProRegistration" && status == "rejected"]),
  "employers": count(*[_type == "aiProRegistration" && role == "employer"]),
  "graduates": count(*[_type == "aiProRegistration" && role == "graduate"]),
  "trackNames": array::unique(*[_type == "aiProRegistration" && role == "employee" && defined(track)].track),
  "employeeTracks": *[_type == "aiProRegistration" && role == "employee"].track
}`;

// Spreadsheet columns: [column heading, field]. Employees and employers
// are exported separately because they answer different questions.
const EMPLOYEE_COLUMNS: [string, string][] = [
  ['Status', 'status'],
  ['Full name', 'fullName'],
  ['Email', 'email'],
  ['Phone', 'phone'],
  ['Organisation', 'organisation'],
  ['Job title', 'jobTitle'],
  ['Track', 'track'],
  ['Employer / line manager email', 'employerEmail'],
  ['Said they completed the Employees Survey', 'surveyCompleted'],
  ['Agreed to data processing', 'consentGiven'],
  ['Submitted', 'submittedAt'],
  ['Approved / rejected', 'decidedAt'],
];
const GRADUATE_COLUMNS: [string, string][] = [
  ['Full name', 'fullName'],
  ['Email', 'email'],
  ['Phone', 'phone'],
  ['Gender', 'gender'],
  ['Institution', 'organisation'],
  ['Programme of study', 'programmeOfStudy'],
  ['Highest qualification', 'qualification'],
  ['Current status', 'studyStatus'],
  ['Year of completion', 'completionYear'],
  ['Town / region', 'location'],
  ['Track', 'track'],
  ['Why they want to join', 'motivation'],
  ['Agreed to data processing', 'consentGiven'],
  ['Submitted', 'submittedAt'],
];
const EMPLOYER_COLUMNS: [string, string][] = [
  ['Organisation', 'organisation'],
  ['Sector / industry', 'sector'],
  ['Contact person', 'fullName'],
  ['Job title', 'jobTitle'],
  ['Email', 'email'],
  ['Phone', 'phone'],
  ['Number of employees', 'companySize'],
  ['Staff to nominate', 'staffToNominate'],
  ['AI skills needed', 'skillsNeeded'],
  ['Skills gaps', 'skillsGaps'],
  ['Agreed to data processing', 'consentGiven'],
  ['Submitted', 'submittedAt'],
];

type ExportRole = 'employee' | 'employer' | 'graduate';
const EXPORTS: Record<ExportRole, { file: string; columns: [string, string][] }> = {
  employee: { file: 'employees', columns: EMPLOYEE_COLUMNS },
  employer: { file: 'employers', columns: EMPLOYER_COLUMNS },
  graduate: { file: 'graduates', columns: GRADUATE_COLUMNS },
};

function cell(value: unknown) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  const text = Array.isArray(value) ? value.join('; ') : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(filename: string, columns: [string, string][], rows: Record<string, unknown>[]) {
  const lines = [columns.map(([heading]) => cell(heading)).join(',')];
  rows.forEach((row) => lines.push(columns.map(([, field]) => cell(row[field])).join(',')));
  // The BOM makes Excel read accented names (e.g. “Kwáme”) correctly.
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type Raw = Omit<Counts, 'tracks'> & { trackNames: string[]; employeeTracks: (string | null)[] };

function toCounts(raw: Raw): Counts {
  const tracks = (raw.trackNames ?? [])
    .map((track) => ({ track, count: raw.employeeTracks.filter((t) => t === track).length }))
    .sort((a, b) => b.count - a.count);
  return { ...raw, tracks };
}

export default function RegistrationSummary() {
  const client = useClient({ apiVersion: '2025-01-01' });
  const [counts, setCounts] = useState<Counts | null>(null);
  const [exporting, setExporting] = useState<ExportRole | null>(null);

  async function exportRole(role: ExportRole) {
    setExporting(role);
    try {
      const rows = await client.fetch<Record<string, unknown>[]>(
        '*[_type == "aiProRegistration" && role == $role] | order(submittedAt desc)',
        { role }
      );
      const date = new Date().toISOString().slice(0, 10);
      const { file, columns } = EXPORTS[role];
      downloadCsv(`ai-for-professionals-${file}-${date}.csv`, columns, rows);
    } finally {
      setExporting(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      client.fetch<Raw>(QUERY).then((raw) => {
        if (!cancelled) setCounts(toCounts(raw));
      });
    load();
    // Re-count whenever a registration is created, approved, rejected or deleted.
    const sub = client
      .listen('*[_type == "aiProRegistration"]', {}, { includeResult: false })
      .subscribe(() => setTimeout(load, 1000));
    return () => {
      cancelled = true;
      sub.unsubscribe();
    };
  }, [client]);

  if (!counts) {
    return (
      <Flex align="center" justify="center" padding={5}>
        <Spinner />
      </Flex>
    );
  }

  const stat = (label: string, value: number, tone: 'default' | 'primary' | 'positive' | 'caution' | 'critical') => (
    <Card padding={4} radius={3} shadow={1} tone={tone}>
      <Stack gap={3}>
        <Text size={1} muted>{label}</Text>
        <Heading size={4}>{value}</Heading>
      </Stack>
    </Card>
  );

  return (
    <Box padding={4}>
      <Stack gap={5}>
        <Heading size={2}>AI for Professionals — Summary</Heading>

        <Stack gap={3}>
          <Text weight="semibold">Employees</Text>
          <Grid gridTemplateColumns={[1, 2, 4]} gap={3}>
            {stat('Total registered', counts.employees, 'primary')}
            {stat('Pending approval', counts.pending, 'caution')}
            {stat('Approved', counts.approved, 'positive')}
            {stat('Rejected', counts.rejected, 'critical')}
          </Grid>
        </Stack>

        <Stack gap={3}>
          <Text weight="semibold">Graduates &amp; employers</Text>
          <Grid gridTemplateColumns={[1, 2, 4]} gap={3}>
            {stat('Graduate applications', counts.graduates, 'primary')}
            {stat('Organisations registered', counts.employers, 'default')}
          </Grid>
        </Stack>

        {counts.tracks.length > 0 && (
          <Stack gap={3}>
            <Text weight="semibold">Employees by track</Text>
            <Card padding={3} radius={3} shadow={1}>
              <Stack gap={3}>
                {counts.tracks.map(({ track, count }) => (
                  <Flex key={track} justify="space-between">
                    <Text>{track}</Text>
                    <Text weight="semibold">{count}</Text>
                  </Flex>
                ))}
              </Stack>
            </Card>
          </Stack>
        )}

        <Stack gap={3}>
          <Text weight="semibold">Download all details (opens in Excel or Google Sheets)</Text>
          <Flex gap={3} wrap="wrap">
            <Button
              text={exporting === 'employee' ? 'Preparing…' : `Download employees (${counts.employees})`}
              tone="primary"
              disabled={exporting !== null || counts.employees === 0}
              onClick={() => exportRole('employee')}
            />
            <Button
              text={exporting === 'employer' ? 'Preparing…' : `Download employers (${counts.employers})`}
              mode="ghost"
              disabled={exporting !== null || counts.employers === 0}
              onClick={() => exportRole('employer')}
            />
            <Button
              text={exporting === 'graduate' ? 'Preparing…' : `Download graduates (${counts.graduates})`}
              mode="ghost"
              disabled={exporting !== null || counts.graduates === 0}
              onClick={() => exportRole('graduate')}
            />
          </Flex>
        </Stack>

        <Text size={1} muted>Updates automatically as people register and employers respond.</Text>
      </Stack>
    </Box>
  );
}
