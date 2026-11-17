// sanity/components/AddStaff.tsx
// Studio panes (AI for Professionals) for adding people by hand:
//  - AddNominee: nominate a staff member under a partner organisation, the
//    same as a manager would on the website (but no email is sent).
//  - AddRegisteredStaff: record a staff member as already registered (e.g.
//    registered on paper or by phone). Also lists them as a nominee of the
//    organisation if they aren't already, so the two stay in step.
// Both check for duplicates and keep records under the private "aiPro." path.

import { useEffect, useState } from 'react';
import { Box, Button, Card, Flex, Grid, Select, Stack, Text, TextInput } from '@sanity/ui';
import { useClient } from 'sanity';
import { useRouter } from 'sanity/router';
import { HUBS, TRACKS, nominationTrackLabel } from '../../lib/aiForProfessionals';

type Mode = 'nominee' | 'registered';
type Partner = { _id: string; name: string };
type Form = { partnerId: string; fullName: string; email: string; phone: string; jobTitle: string; track: string; hub: string; qualification: string };

const EMPTY: Form = { partnerId: '', fullName: '', email: '', phone: '', jobTitle: '', track: '', hub: '', qualification: '' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const newKey = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12);

function AddStaff({ mode }: { mode: Mode }) {
  const client = useClient({ apiVersion: '2025-01-01' });
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string; openId?: string; openType?: string } | null>(null);

  useEffect(() => {
    client
      .fetch<Partner[]>('*[_type == "aiProPartner" && !(_id in path("drafts.**")) && defined(name)] | order(lower(name) asc){ _id, name }')
      .then(setPartners)
      .catch((err) => setMessage({ tone: 'error', text: `Couldn't load organisations: ${err}` }));
  }, [client]);

  const set = (key: keyof Form) => (e: { currentTarget: { value: string } }) => setForm({ ...form, [key]: e.currentTarget.value });
  const registered = mode === 'registered';
  const ready = form.partnerId && form.fullName.trim() && EMAIL.test(form.email.trim()) && (!registered || form.track);

  async function save() {
    if (!ready) return;
    setBusy(true);
    setMessage(null);
    const email = form.email.trim().toLowerCase();
    const partner = partners.find((p) => p._id === form.partnerId)!;
    try {
      const found = await client.fetch<{ nominatedBy: { _id: string; name: string } | null; registration: string | null }>(
        `{
          "nominatedBy": *[_type == "aiProPartner" && !(_id in path("drafts.**")) && count(nominees[lower(email) == $email]) > 0][0]{ _id, name },
          "registration": *[_type == "aiProRegistration" && role == "employee" && lower(email) == $email][0]._id
        }`,
        { email }
      );
      if (found.nominatedBy && found.nominatedBy._id !== partner._id) {
        setMessage({ tone: 'error', text: `${email} is already nominated by ${found.nominatedBy.name}. Use that organisation, or remove them there first.` });
        return;
      }
      if (!registered && found.nominatedBy) {
        setMessage({ tone: 'error', text: `${email} is already nominated by ${partner.name}.` });
        return;
      }
      if (registered && found.registration) {
        setMessage({ tone: 'error', text: `${email} is already registered.`, openId: found.registration, openType: 'aiProRegistration' });
        return;
      }

      const now = new Date().toISOString();
      const tx = client.transaction();
      if (!found.nominatedBy) {
        tx.patch(partner._id, (p) =>
          p.setIfMissing({ nominees: [] }).append('nominees', [
            {
              _key: newKey(),
              _type: 'nominee',
              fullName: form.fullName.trim(),
              email,
              ...(form.phone.trim() && { phone: form.phone.trim() }),
              ...(form.jobTitle.trim() && { jobTitle: form.jobTitle.trim() }),
              ...(form.track && { track: nominationTrackLabel(form.track) }),
              ...(form.hub && { hub: form.hub }),
              ...(form.qualification.trim() && { qualification: form.qualification.trim() }),
              addedBy: 'Studio (added by hand)',
              addedAt: now,
            },
          ])
        );
      }
      let registrationId = '';
      if (registered) {
        registrationId = `aiPro.${crypto.randomUUID()}`;
        tx.create({
          _id: registrationId,
          _type: 'aiProRegistration',
          role: 'employee',
          status: 'nominated',
          fullName: form.fullName.trim(),
          email,
          phone: form.phone.trim(),
          organisation: partner.name,
          jobTitle: form.jobTitle.trim(),
          track: form.track,
          hub: form.hub,
          enteredManually: true,
          submittedAt: now,
        });
      }
      await tx.commit();

      setForm({ ...EMPTY, partnerId: form.partnerId });
      setMessage(
        registered
          ? { tone: 'ok', text: `${form.fullName.trim()} is now registered under ${partner.name}.`, openId: registrationId, openType: 'aiProRegistration' }
          : { tone: 'ok', text: `${form.fullName.trim()} is now nominated by ${partner.name}. No email was sent — let them know they can register.`, openId: partner._id, openType: 'aiProPartner' }
      );
    } catch (err) {
      setMessage({ tone: 'error', text: String(err) });
    } finally {
      setBusy(false);
    }
  }

  const open = (id: string, type: string) => router.navigateUrl({ path: router.resolveIntentLink('edit', { id, type }) });

  return (
    <Box padding={4}>
      <Card padding={4} radius={3} shadow={1}>
        <Stack gap={4}>
          <Text size={3} weight="semibold">{registered ? 'Add a registered staff member' : 'Add a nominee'}</Text>
          <Text size={1} muted>
            {registered
              ? 'For staff who registered another way (on paper, by phone…). They will appear under "Registered staff", and as a nominee of their organisation. No email is sent.'
              : 'Nominate a staff member under their organisation. They can then register on the website with this exact email. No email is sent — let them know yourself.'}
          </Text>

          <Stack gap={2}>
            <Text size={1} weight="medium">Organisation *</Text>
            <Select value={form.partnerId} onChange={set('partnerId')}>
              <option value="">Select the organisation…</option>
              {partners.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </Select>
            <Text size={0} muted>Not in the list? Create it first under &ldquo;Add a partner organisation&rdquo;.</Text>
          </Stack>

          <Grid gridTemplateColumns={[1, 2]} gap={3}>
            <Stack gap={2}><Text size={1} weight="medium">Full name *</Text><TextInput value={form.fullName} onChange={set('fullName')} /></Stack>
            <Stack gap={2}><Text size={1} weight="medium">Email *</Text><TextInput value={form.email} onChange={set('email')} placeholder="the email they will register with" /></Stack>
            <Stack gap={2}><Text size={1} weight="medium">Phone</Text><TextInput value={form.phone} onChange={set('phone')} /></Stack>
            <Stack gap={2}><Text size={1} weight="medium">Job title</Text><TextInput value={form.jobTitle} onChange={set('jobTitle')} /></Stack>
            <Stack gap={2}>
              <Text size={1} weight="medium">Track{registered ? ' *' : ''}</Text>
              <Select value={form.track} onChange={set('track')}>
                <option value="">{registered ? 'Select a track…' : 'Not decided (they choose when registering)'}</option>
                {TRACKS.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Stack>
            <Stack gap={2}>
              <Text size={1} weight="medium">Preferred hub</Text>
              <Select value={form.hub} onChange={set('hub')}>
                <option value="">Select</option>
                {HUBS.map((h) => <option key={h} value={h}>{h}</option>)}
              </Select>
            </Stack>
          </Grid>
          {!registered && (
            <Stack gap={2}><Text size={1} weight="medium">Highest qualification</Text><TextInput value={form.qualification} onChange={set('qualification')} placeholder="e.g. BSc Computer Science" /></Stack>
          )}

          {message && (
            <Card padding={3} radius={2} tone={message.tone === 'ok' ? 'positive' : 'critical'}>
              <Flex align="center" gap={3} wrap="wrap">
                <Text size={1}>{message.text}</Text>
                {message.openId && message.openType && (
                  <Button text="Open" mode="ghost" fontSize={1} padding={2} onClick={() => open(message.openId!, message.openType!)} />
                )}
              </Flex>
            </Card>
          )}

          <Button
            text={busy ? 'Saving…' : registered ? 'Add registered staff member' : 'Add nominee'}
            tone="primary"
            disabled={busy || !ready}
            onClick={save}
          />
        </Stack>
      </Card>
    </Box>
  );
}

export function AddNominee() {
  return <AddStaff mode="nominee" />;
}

export function AddRegisteredStaff() {
  return <AddStaff mode="registered" />;
}
