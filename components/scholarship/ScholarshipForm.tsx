// components/scholarship/ScholarshipForm.tsx
// Client-side scholarship application form — submits (with uploaded
// documents) to app/api/apply-scholarship/route.ts, which emails it via
// Resend to the same inbox the contact form uses (CONTACT_TO_EMAIL).

'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'success' | 'error';

const RESEARCH_AREAS = [
  'Edge AI & TinyML',
  'Robotics & Autonomous Systems',
  'IoT & Wireless Sensor Networks',
  'Machine Learning & Data Science',
  'Climate & Environmental Intelligence',
  'Cybersecurity & Privacy-Preserving Systems',
];

// Icon-based file picker — the native "Choose File" button is ugly and
// inconsistent across browsers, so it's visually hidden and this styled
// label (linked to the same input id) triggers it instead. Shows the
// picked filename once one's chosen, same as the native control would.
function FileField({ id, name, required, hint }: { id: string; name: string; required?: boolean; hint: string }) {
  const [fileName, setFileName] = useState('');

  return (
    <div className="cl-form-file">
      <label htmlFor={id} className="cl-form-file-trigger">
        <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i>
        <span>{fileName || 'Choose File'}</span>
      </label>
      <input
        id={id}
        name={name}
        type="file"
        required={required}
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="cl-form-file-input"
        onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
      />
      <span className="cl-form-hint">{hint}</span>
    </div>
  );
}

export default function ScholarshipForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/apply-scholarship', { method: 'POST', body: formData });
      const result = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(result.error || 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
      setErrorMessage('Network error — please check your connection and try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="cl-form-success">
        <div className="cl-form-success-icon">✓</div>
        <h3>Application Submitted!</h3>
        <p>Thanks for applying — our team will review your application and get back to you by email.</p>
        <button type="button" className="cl-btn-blue" onClick={() => setStatus('idle')}>
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <form className="cl-form" onSubmit={handleSubmit}>
      <div className="cl-form-section">
        <h3 className="cl-form-section-title">Personal Information</h3>
        <div className="cl-form-row">
          <div>
            <label htmlFor="firstName">First Name *</label>
            <input id="firstName" name="firstName" type="text" required />
          </div>
          <div>
            <label htmlFor="lastName">Last Name *</label>
            <input id="lastName" name="lastName" type="text" required />
          </div>
        </div>
        <div className="cl-form-row">
          <div>
            <label htmlFor="email">Email Address *</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div>
            <label htmlFor="phone">Phone Number *</label>
            <input id="phone" name="phone" type="tel" required />
          </div>
        </div>
        <div>
          <label htmlFor="nationality">Nationality *</label>
          <input id="nationality" name="nationality" type="text" required />
        </div>
      </div>

      <div className="cl-form-section">
        <h3 className="cl-form-section-title">Academic Background</h3>
        <div>
          <label htmlFor="program">Program Applying For *</label>
          <select id="program" name="program" required defaultValue="">
            <option value="" disabled>Select Program</option>
            <option value="phd">PhD</option>
            <option value="mphil">MPhil</option>
          </select>
        </div>
        <div>
          <label htmlFor="undergrad">Undergraduate Degree *</label>
          <input id="undergrad" name="undergrad" type="text" placeholder="Degree, Institution, Year" required />
        </div>
        <div>
          <label htmlFor="postgrad">Postgraduate Degree (if any)</label>
          <input id="postgrad" name="postgrad" type="text" placeholder="Degree, Institution, Year" />
        </div>
        <div>
          <label htmlFor="gpa">Undergraduate GPA/CGPA *</label>
          <input id="gpa" name="gpa" type="text" required />
        </div>
      </div>

      <div className="cl-form-section">
        <h3 className="cl-form-section-title">Research Interests</h3>
        <div>
          <label htmlFor="researchArea">Preferred Research Area *</label>
          <select id="researchArea" name="researchArea" required defaultValue="">
            <option value="" disabled>Select Research Area</option>
            {RESEARCH_AREAS.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="statement">Research Statement *</label>
          <textarea
            id="statement"
            name="statement"
            required
            placeholder="Describe your research interests, proposed research direction, and how it aligns with CAIRLab's focus areas..."
          />
        </div>
        <div>
          <label htmlFor="publications">List of Publications (if any)</label>
          <textarea
            id="publications"
            name="publications"
            placeholder="List any publications, pre-prints, or research projects..."
            style={{ minHeight: '100px' }}
          />
        </div>
      </div>

      <div className="cl-form-section">
        <h3 className="cl-form-section-title">Required Documents</h3>
        <div>
          <label htmlFor="personalStatement">Personal Statement *</label>
          <FileField id="personalStatement" name="personalStatement" required hint="Upload Personal Statement (PDF/DOC) — Max 2MB" />
        </div>
        <div>
          <label htmlFor="transcripts">Academic Transcripts *</label>
          <FileField id="transcripts" name="transcripts" required hint="Upload Transcripts (PDF) — All degrees, Max 5MB total" />
        </div>
        <div>
          <label htmlFor="certificates">Certificates &amp; Diplomas *</label>
          <FileField id="certificates" name="certificates" required hint="Upload Certificates (PDF) — Degree certificates, Max 5MB total" />
        </div>
        <div>
          <label htmlFor="recommendations">Recommendation Letters *</label>
          <FileField id="recommendations" name="recommendations" required hint="Upload Recommendation Letters (PDF/DOC) — At least 2 letters, Max 3MB each" />
        </div>
        <div>
          <label htmlFor="publicationsUpload">Publications (Optional)</label>
          <FileField id="publicationsUpload" name="publicationsUpload" hint="Upload Publications (PDF) — Max 10MB total" />
        </div>
        <div>
          <label htmlFor="cv">CV/Resume *</label>
          <FileField id="cv" name="cv" required hint="Upload CV/Resume (PDF/DOC) — Max 2MB" />
        </div>
      </div>

      <div className="cl-form-section">
        <div className="cl-form-checkbox-row">
          <input id="certifyAccurate" name="certifyAccurate" type="checkbox" required />
          <label htmlFor="certifyAccurate">I certify that all information provided is accurate and complete *</label>
        </div>
        <div className="cl-form-checkbox-row">
          <input id="agreeDataProcessing" name="agreeDataProcessing" type="checkbox" required />
          <label htmlFor="agreeDataProcessing">I agree to the processing of my personal data for application purposes *</label>
        </div>

        {status === 'error' && <p className="cl-form-error">{errorMessage}</p>}

        <button type="submit" className="cl-btn-blue" style={{ marginTop: '8px' }} disabled={status === 'sending'}>
          {status === 'sending' ? 'Submitting…' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
}
