// sanity/components/AddPartner.tsx
// Studio pane (AI for Professionals > Add a partner organisation). Partner
// documents hold staff emails and phone numbers, so they must live under the
// private "aiPro." ID path (sanity/schemaTypes/aiProPartner.ts) — the normal
// "+" button would give them a public ID. This creates one with the right ID
// and opens it for editing.

import { useState } from 'react';
import { Box, Button, Card, Stack, Text, TextInput } from '@sanity/ui';
import { useClient } from 'sanity';
import { useRouter } from 'sanity/router';

export default function AddPartner() {
  const client = useClient({ apiVersion: '2025-01-01' });
  const router = useRouter();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function create() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    setError('');
    try {
      const exists = await client.fetch<number>('count(*[_type == "aiProPartner" && lower(name) == lower($name)])', { name: trimmed });
      if (exists) {
        setError('A partner with this name already exists — find it in "Partner organisations".');
        return;
      }
      const id = `aiPro.partner-${crypto.randomUUID()}`;
      await client.create({ _id: id, _type: 'aiProPartner', name: trimmed });
      router.navigateUrl({ path: router.resolveIntentLink('edit', { id, type: 'aiProPartner' }) });
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box padding={4}>
      <Card padding={4} radius={3} shadow={1}>
        <Stack gap={4}>
          <Text size={3} weight="semibold">Add a partner organisation</Text>
          <Text size={1} muted>
            Type the organisation&apos;s name exactly as staff should see it in the &ldquo;select your company&rdquo; list. You can add
            the contact person and nominated staff on the next screen.
          </Text>
          <TextInput
            placeholder="e.g. Data Nyansa"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && create()}
          />
          {error && <Text size={1} style={{ color: '#B91C1C' }}>{error}</Text>}
          <Button text={busy ? 'Creating…' : 'Create partner'} tone="primary" disabled={busy || !name.trim()} onClick={create} />
        </Stack>
      </Card>
    </Box>
  );
}
