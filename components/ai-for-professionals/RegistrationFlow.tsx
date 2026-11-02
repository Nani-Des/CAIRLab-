'use client';

// components/ai-for-professionals/RegistrationFlow.tsx
// Registration for the KNUST–GIZ AI for Professionals programme:
//  1. Visitor picks Employer, Employee, or Graduate.
//  2. Employer fills in the organisation / labour-market survey -> done.
//  3. Employee first completes the Employees Survey (KoboToolbox, opens in
//     a new tab) and confirms it, which unlocks their details form; then a
//     pop-up asks for their employer's / line manager's email before
//     submitting -> "pending approval" until the employer clicks the link.
// Kobo can't tell us who completed the survey, so the confirmation is
// self-declared — staff can cross-check emails against the Kobo export.
//  4. Graduate fills in an application -> done (no
//     employer approval needed).
// Submits to app/api/ai-for-professionals/register/route.ts.

import { useState, type FormEvent } from 'react';
import {
  COMPANY_SIZES,
  EMAIL_PATTERN,
  EMPLOYEES_SURVEY_URL,
  GENDERS,
  NOMINATION_FORM_URL,
  QUALIFICATIONS,
  STUDY_STATUSES,
  TRACKS,
} from '@/lib/aiForProfessionals';

type Role = 'employer' | 'employee' | 'graduate';
type Status = 'idle' | 'sending' | 'error';
type Done = { role: Role; employerEmail?: string } | null;

export default function RegistrationFlow({ initialRole }: { initialRole?: Role }) {
  const [role, setRole] = useState<Role | null>(initialRole ?? null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [done, setDone] = useState<Done>(null);
  const [surveyOpened, setSurveyOpened] = useState(false);
  const [surveyDone, setSurveyDone] = useState(false);

  // Employee details are held here while the employer-email pop-up is open.
  const [pendingEmployee, setPendingEmployee] = useState<Record<string, string> | null>(null);
  const [employerEmail, setEmployerEmail] = useState('');
  const [modalError, setModalError] = useState('');

  async function submit(payload: Record<string, unknown>) {
    setStatus('sending');
    setErrorMessage('');
    setModalError('');
    try {
      const res = await fetch('/api/ai-for-professionals/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        setStatus('error');
        return result.error || 'Something went wrong. Please try again.';
      }
      setStatus('idle');
      return null;
    } catch {
      setStatus('error');
      return 'Network error — please check your connection and try again.';
    }
  }

  async function handleEmployer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const error = await submit({
      role: 'employer',
      organisation: data.get('organisation'),
      fullName: data.get('fullName'),
      jobTitle: data.get('jobTitle'),
      email: data.get('email'),
      phone: data.get('phone'),
      sector: data.get('sector'),
      companySize: data.get('companySize'),
      skillsNeeded: data.getAll('skillsNeeded'),
      staffToNominate: data.get('staffToNominate'),
      skillsGaps: data.get('skillsGaps'),
      consent: data.get('consent'),
      website: data.get('website'),
    });
    if (error) setErrorMessage(error);
    else setDone({ role: 'employer' });
  }

  async function handleGraduate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const error = await submit({ role: 'graduate', ...Object.fromEntries(Array.from(data.entries()).map(([k, v]) => [k, String(v)])) });
    if (error) setErrorMessage(error);
    else setDone({ role: 'graduate' });
  }

  function handleEmployeeDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setPendingEmployee(Object.fromEntries(Array.from(data.entries()).map(([k, v]) => [k, String(v)])));
    setModalError('');
  }

  async function handleEmployerEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pendingEmployee) return;
    const value = employerEmail.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setModalError('Please enter a valid email address.');
      return;
    }
    if (value.toLowerCase() === (pendingEmployee.email || '').trim().toLowerCase()) {
      setModalError("This must be your employer's email, not your own.");
      return;
    }
    const error = await submit({ role: 'employee', ...pendingEmployee, employerEmail: value, surveyCompleted: surveyDone });
    if (error) {
      setModalError(error);
      return;
    }
    setPendingEmployee(null);
    setDone({ role: 'employee', employerEmail: value });
  }

  if (done?.role === 'graduate') {
    return (
      <div className="cl-form-success">
        <div className="cl-form-success-icon">✓</div>
        <h3>Application received!</h3>
        <p>
          Thank you for applying to the AI for Professionals programme. We&apos;ve sent a confirmation to your email
          and will contact you about the next steps in the selection process.
        </p>
        <SpamNotice>
          Don&apos;t see our confirmation email? Check your <strong>spam or junk folder</strong> and mark it as
          &ldquo;Not spam&rdquo; so you don&apos;t miss our updates.
        </SpamNotice>
      </div>
    );
  }

  if (done) {
    return done.role === 'employer' ? (
      <div className="cl-form-success">
        <div className="cl-form-success-icon">✓</div>
        <h3>Thank you for registering!</h3>
        <p>
          We&apos;ve received your organisation&apos;s details and sent a confirmation to your email.
        </p>
        <div className="cl-aipro-next-step">
          <strong><i className="fa-solid fa-user-plus" aria-hidden="true"></i> One more step to complete your registration</strong>
          <p>Use the Nomination Form to nominate the employees you&apos;d like to put forward for the training.</p>
          <a href={NOMINATION_FORM_URL} target="_blank" rel="noopener noreferrer" className="cl-btn-blue">
            Open the Nomination Form ↗
          </a>
        </div>
        <p className="cl-form-hint">
          When your staff register on this site, they&apos;ll list your email address and you&apos;ll receive a link to
          approve their participation.
        </p>
        <SpamNotice>
          Don&apos;t see our confirmation email? Check your <strong>spam or junk folder</strong> — approval requests
          from your staff will come from the same address, so mark it as &ldquo;Not spam&rdquo;.
        </SpamNotice>
      </div>
    ) : (
      <div className="cl-form-success">
        <div className="cl-aipro-pending-icon"><i className="fa-solid fa-hourglass-half" aria-hidden="true"></i></div>
        <h3>Registration received — pending approval</h3>
        <p>
          We&apos;ve emailed <strong>{done.employerEmail}</strong> to approve your participation. Your application will
          remain <strong>pending</strong> until your employer approves it, and we&apos;ll email you as soon as they do.
        </p>
        <SpamNotice>
          Our emails sometimes land in <strong>spam or junk</strong>. Check yours for the confirmation and approval
          emails — and if you haven&apos;t been approved yet, ask your employer to check their spam folder for our
          request.
        </SpamNotice>
      </div>
    );
  }

  return (
    <div className="cl-aipro">
      <h2 className="cl-aipro-step-title">I am registering as…</h2>
      <div className="cl-aipro-roles" role="radiogroup" aria-label="Registering as">
        <button
          type="button"
          role="radio"
          aria-checked={role === 'employer'}
          className={`cl-aipro-role${role === 'employer' ? ' active' : ''}`}
          onClick={() => { setRole('employer'); setErrorMessage(''); }}
        >
          <span className="cl-aipro-role-icon"><i className="fa-solid fa-building" aria-hidden="true"></i></span>
          <span className="cl-aipro-role-title">Employer / Manager</span>
          <span className="cl-aipro-role-desc">Register your organisation and tell us about your AI skills needs.</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={role === 'employee'}
          className={`cl-aipro-role${role === 'employee' ? ' active' : ''}`}
          onClick={() => { setRole('employee'); setErrorMessage(''); }}
        >
          <span className="cl-aipro-role-icon"><i className="fa-solid fa-id-badge" aria-hidden="true"></i></span>
          <span className="cl-aipro-role-title">Employee / Staff member</span>
          <span className="cl-aipro-role-desc">Register for training. Your employer will be asked to approve.</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={role === 'graduate'}
          className={`cl-aipro-role${role === 'graduate' ? ' active' : ''}`}
          onClick={() => { setRole('graduate'); setErrorMessage(''); }}
        >
          <span className="cl-aipro-role-icon"><i className="fa-solid fa-graduation-cap" aria-hidden="true"></i></span>
          <span className="cl-aipro-role-title">Graduate</span>
          <span className="cl-aipro-role-desc">Completed your studies? Apply to join the training.</span>
        </button>
      </div>

      {role === 'employer' && (
        <form className="cl-form" onSubmit={handleEmployer}>
          <h3 className="cl-form-section-title">Organisation details</h3>
          <HoneypotField />
          <div className="cl-form-row">
            <Field id="organisation" label="Organisation name *" required />
            <Field id="sector" label="Sector / industry" placeholder="e.g. Banking, Agriculture" />
          </div>
          <div className="cl-form-row">
            <Field id="fullName" label="Contact person full name *" required />
            <Field id="jobTitle" label="Job title" />
          </div>
          <div className="cl-form-row">
            <Field id="email" label="Contact email *" type="email" required />
            <Field id="phone" label="Phone number" type="tel" />
          </div>
          <div className="cl-form-row">
            <div>
              <label htmlFor="companySize">Number of employees</label>
              <select id="companySize" name="companySize" defaultValue="">
                <option value="">Select</option>
                {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Field id="staffToNominate" label="How many staff would you like to nominate?" type="number" min="0" />
          </div>
          <fieldset className="cl-aipro-fieldset">
            <legend>Which AI skills does your organisation need most?</legend>
            {TRACKS.map((t) => (
              <div className="cl-form-checkbox-row" key={t}>
                <input id={`skill-${t}`} name="skillsNeeded" type="checkbox" value={t} />
                <label htmlFor={`skill-${t}`}>{t}</label>
              </div>
            ))}
          </fieldset>
          <div>
            <label htmlFor="skillsGaps">What skills gaps do you see in your workforce?</label>
            <textarea id="skillsGaps" name="skillsGaps" placeholder="Tell us briefly…" />
          </div>
          <ConsentRow />
          {status === 'error' && errorMessage && <p className="cl-form-error">{errorMessage}</p>}
          <button type="submit" className="cl-btn-blue" disabled={status === 'sending'}>
            {status === 'sending' ? 'Submitting…' : 'Submit Registration →'}
          </button>
        </form>
      )}

      {role === 'employee' && (
        <div className={`cl-aipro-survey-step${surveyDone ? ' done' : ''}`}>
          <div className="cl-aipro-step-badge">{surveyDone ? <i className="fa-solid fa-check" aria-hidden="true"></i> : '1'}</div>
          <div className="cl-aipro-survey-body">
            <h3>Step 1: Complete the Employees Survey</h3>
            <p>
              Before requesting your employer&apos;s approval, please fill in the programme&apos;s Employees Survey.
              It opens in a new tab — come back to this page when you&apos;ve submitted it.
            </p>
            <a
              href={EMPLOYEES_SURVEY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={surveyOpened ? 'cl-btn-white' : 'cl-btn-blue'}
              onClick={() => setSurveyOpened(true)}
            >
              {surveyOpened ? 'Open the survey again ↗' : 'Open the Employees Survey ↗'}
            </a>
            <div className="cl-form-checkbox-row" style={{ marginTop: 16 }}>
              <input
                id="surveyDone"
                type="checkbox"
                checked={surveyDone}
                disabled={!surveyOpened && !surveyDone}
                onChange={(e) => setSurveyDone(e.target.checked)}
              />
              <label htmlFor="surveyDone">
                I have completed and submitted the Employees Survey
                {!surveyOpened && !surveyDone && <span className="cl-form-hint">Open the survey first to tick this box.</span>}
              </label>
            </div>
          </div>
        </div>
      )}

      {role === 'employee' && surveyDone && (
        <form className="cl-form" onSubmit={handleEmployeeDetails}>
          <h3 className="cl-form-section-title">Step 2: Your details</h3>
          <HoneypotField />
          <div className="cl-form-row">
            <Field id="fullName" label="Full name *" required />
            <Field id="email" label="Email address *" type="email" required />
          </div>
          <div className="cl-form-row">
            <Field id="phone" label="Phone number" type="tel" />
            <Field id="jobTitle" label="Job title" />
          </div>
          <div className="cl-form-row">
            <Field id="organisation" label="Organisation / company *" required />
            <div>
              <label htmlFor="track">Which track interests you? *</label>
              <select id="track" name="track" required defaultValue="">
                <option value="" disabled>Select a track</option>
                {TRACKS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <ConsentRow />
          <button type="submit" className="cl-btn-blue">Continue →</button>
        </form>
      )}

      {role === 'graduate' && (
        <form className="cl-form" onSubmit={handleGraduate}>
          <h3 className="cl-form-section-title">Your application</h3>
          <HoneypotField />
          <div className="cl-form-row">
            <Field id="fullName" label="Full name *" required />
            <Field id="email" label="Email address *" type="email" required />
          </div>
          <div className="cl-form-row">
            <Field id="phone" label="Phone number *" type="tel" required />
            <Select id="gender" label="Gender" options={GENDERS} placeholder="Select" />
          </div>
          <div className="cl-form-row">
            <Field id="organisation" label="Institution (university / college) *" required placeholder="e.g. KNUST" />
            <Field id="programmeOfStudy" label="Programme of study *" required placeholder="e.g. BSc Computer Science" />
          </div>
          <div className="cl-form-row">
            <Select id="qualification" label="Highest qualification *" options={QUALIFICATIONS} required />
            <Select id="studyStatus" label="Current status *" options={STUDY_STATUSES} required />
          </div>
          <div className="cl-form-row">
            <Field id="completionYear" label="Year you graduated *" type="number" min="1980" max={new Date().getFullYear()} required />
            <Field id="location" label="Town / region" placeholder="e.g. Kumasi, Ashanti" />
          </div>
          <Select id="track" label="Which track interests you? *" options={TRACKS} required placeholder="Select a track" />
          <div>
            <label htmlFor="motivation">Why do you want to join this programme? *</label>
            <textarea id="motivation" name="motivation" required placeholder="A few sentences about your interest in AI and what you hope to achieve…" />
          </div>
          <ConsentRow />
          {status === 'error' && errorMessage && <p className="cl-form-error">{errorMessage}</p>}
          <button type="submit" className="cl-btn-blue" disabled={status === 'sending'}>
            {status === 'sending' ? 'Submitting…' : 'Submit Application →'}
          </button>
        </form>
      )}

      {pendingEmployee && (
        <div className="cl-aipro-modal-backdrop" role="presentation" onClick={() => status !== 'sending' && setPendingEmployee(null)}>
          <div
            className="cl-aipro-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="aipro-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="cl-aipro-modal-close"
              aria-label="Close"
              onClick={() => setPendingEmployee(null)}
              disabled={status === 'sending'}
            >
              ✕
            </button>
            <div className="cl-aipro-modal-icon"><i className="fa-solid fa-user-check" aria-hidden="true"></i></div>
            <h3 id="aipro-modal-title">Your employer&apos;s approval</h3>
            <p>
              Enter the email address of your <strong>employer or line manager</strong>. We&apos;ll send them a link to
              approve your participation.
            </p>
            <form className="cl-aipro-modal-form" onSubmit={handleEmployerEmail}>
              <label htmlFor="employerEmail">Employer / line manager email *</label>
              <input
                id="employerEmail"
                type="email"
                required
                autoFocus
                placeholder="manager@company.com"
                value={employerEmail}
                onChange={(e) => setEmployerEmail(e.target.value)}
              />
              <p className="cl-aipro-modal-notice">
                <i className="fa-solid fa-circle-info" aria-hidden="true"></i> Your application will remain{' '}
                <strong>pending</strong> until your employer approves it. Ask them to check their spam folder if our
                email doesn&apos;t arrive.
              </p>
              {modalError && <p className="cl-form-error">{modalError}</p>}
              <button type="submit" className="cl-btn-blue" disabled={status === 'sending'}>
                {status === 'sending' ? 'Submitting…' : 'Submit Registration →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ id, label, type = 'text', ...rest }: { id: string; label: string; type?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} type={type} {...rest} />
    </div>
  );
}

function Select({
  id,
  label,
  options,
  required,
  placeholder = 'Select',
}: {
  id: string;
  label: string;
  options: readonly string[];
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <select id={id} name={id} required={required} defaultValue="">
        <option value="" disabled={required}>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function SpamNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="cl-aipro-spam-notice">
      <i className="fa-solid fa-envelope-circle-check" aria-hidden="true"></i>
      <span>{children}</span>
    </p>
  );
}

function ConsentRow() {
  return (
    <div className="cl-form-checkbox-row">
      <input id="consent" name="consent" type="checkbox" required />
      <label htmlFor="consent">
        I agree to CAIRLab and GIZ processing these details for the purposes of this programme *
      </label>
    </div>
  );
}

// Hidden from people (and screen readers); bots that fill every field give themselves away.
function HoneypotField() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
      <label htmlFor="website">Website</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
