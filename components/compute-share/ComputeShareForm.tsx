// components/compute-share/ComputeShareForm.tsx
'use client';

import { ShieldCheck, Mail } from 'lucide-react';

const EMAIL = 'aheneemmanuel@knust.edu.gh';

export default function ComputeShareForm() {
  return (
    <div style={{ maxWidth: '24rem', margin: '0 auto', padding: '1rem' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        {/* Top Header Row with Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={20} />
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 600,
              color: '#0f172a',
              lineHeight: 1.25
            }}
          >
            Compute Share Initiative
          </h3>
        </div>

        {/* Description Text */}
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            lineHeight: 1.5,
            color: '#475569'
          }}
        >
          Want to write your EC-Council exams? Send us an email.
        </p>

        {/* Styled Email Button */}
        <a
          href={`mailto:${EMAIL}?subject=EC-Council%20Exam%20Inquiry`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            textDecoration: 'none',
            boxSizing: 'border-box'
          }}
        >
          <Mail size={16} style={{ flexShrink: 0 }} />
          <span>Email {EMAIL}</span>
        </a>
      </div>
    </div>
  );
}