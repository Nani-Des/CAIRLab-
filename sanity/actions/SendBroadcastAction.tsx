// sanity/actions/SendBroadcastAction.tsx
// "Send to recipients" button on Broadcast Messages (see
// sanity/schemaTypes/aiProBroadcast.ts). Shows how many people the message
// will reach, asks for confirmation, marks the published message as queued
// (only possible for a logged-in Studio user) and asks the site to send it
// (app/api/ai-for-professionals/broadcast/route.ts).

import { useState } from 'react';
import { useToast } from '@sanity/ui/toast';
import { useClient, type DocumentActionComponent } from 'sanity';
import { audienceEmailsQuery, uniqueEmails } from '../../lib/aiProAudience';

type BroadcastDoc = { status?: string; subject?: string; message?: string; audience?: string[] };

export const SendBroadcastAction: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion: '2025-01-01' });
  const toast = useToast();
  const [confirming, setConfirming] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const doc = props.published as BroadcastDoc | null;
  const sent = doc?.status === 'sent';
  const reason = props.draft
    ? 'Publish your changes first'
    : !doc
      ? 'Publish the message first'
      : sent
        ? 'Already sent'
        : !doc.subject || !doc.message || !doc.audience?.length
          ? 'Add a subject, message and at least one group'
          : null;

  async function send() {
    setConfirming(null);
    setBusy(true);
    try {
      await client.patch(props.id).set({ status: 'queued' }).unset(['error']).commit();
      const res = await fetch('/api/ai-for-professionals/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: props.id }),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.push({ status: 'success', title: `Message sent to ${result.recipients} people` });
      } else {
        toast.push({ status: 'error', title: 'Message not sent', description: result.error || 'Something went wrong.' });
        if (res.status !== 409) await client.patch(props.id).set({ status: 'failed', error: result.error || 'Unknown error' }).commit().catch(() => {});
      }
    } catch (err) {
      toast.push({ status: 'error', title: 'Message not sent', description: String(err) });
    } finally {
      setBusy(false);
      props.onComplete();
    }
  }

  return {
    label: busy ? 'Sending…' : sent ? 'Sent' : 'Send to recipients',
    tone: 'primary',
    disabled: busy || Boolean(reason),
    title: reason || undefined,
    onHandle: async () => {
      const query = audienceEmailsQuery(doc?.audience || []);
      const count = query ? uniqueEmails(await client.fetch<(string | null)[]>(query)).length : 0;
      if (count === 0) {
        toast.push({ status: 'warning', title: 'Nobody to send to', description: 'Nobody has registered in the selected groups yet.' });
        return;
      }
      setConfirming(count);
    },
    dialog:
      confirming !== null && {
        type: 'confirm',
        tone: 'primary',
        message: `Send "${doc?.subject}" to ${confirming} ${confirming === 1 ? 'person' : 'people'}? This can't be undone.`,
        confirmButtonText: 'Send now',
        onConfirm: send,
        onCancel: () => setConfirming(null),
      },
  };
};
