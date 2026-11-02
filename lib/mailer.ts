// lib/mailer.ts
// Sends email through the CAIRLab Gmail account (server-only). Used by the
// AI for Professionals registration flow, which has to email employers and
// staff directly — something the Resend setup used by the contact form can't
// do until a domain is verified there (it can only send to its own inbox).
//
// Needs GMAIL_USER and GMAIL_APP_PASSWORD (see .env.local.example). The app
// password is a 16-character code from the Google account's security
// settings, not the normal Gmail password.

import nodemailer from 'nodemailer';

let transport: ReturnType<typeof nodemailer.createTransport> | null = null;

export function mailerConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function getTransport() {
  if (!transport) {
    transport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
  }
  return transport;
}

export async function sendMail({
  to,
  bcc,
  subject,
  html,
  replyTo,
}: {
  to: string;
  bcc?: string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  await getTransport().sendMail({
    from: `"CAIRLab KNUST" <${process.env.GMAIL_USER}>`,
    to,
    bcc,
    subject,
    replyTo,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#0F172A;max-width:560px">
      ${html}
      <p style="margin-top:28px;color:#64748B;font-size:13px">CAIRLab – Cybersecurity &amp; Artificial Intelligence Research Lab, KNUST</p>
    </div>`,
  });
}

export function emailButton(href: string, label: string) {
  return `<p><a href="${href}" style="display:inline-block;background:#1D4ED8;color:#ffffff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">${label}</a></p>`;
}

export function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
