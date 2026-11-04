'use client';

// components/ai-for-professionals/RegistrationFlow.tsx
// Registration for the KNUST–GIZ AI for Professionals programme. Visitors pick:
//  1. Partner organisation staff — type/select their company from the partner
//     list and enter their email; it must match a nomination on that partner
//     (app/api/ai-for-professionals/verify). Only then do they get the
//     Employees Survey step and the (pre-filled) details form. The employer's
//     nomination is their approval, so there's no separate approval email.
//  2. Partner organisation manager — picks their company and email; if it's
//     on the partner's record we email a secure link to view/add nominees
//     (app/api/ai-for-professionals/manager-link, .../manage).
//  3. Not a partner yet — shown the Train-2, Place-2 offer, the partnership
//     proposal PDF and the Partnership Commitment & Nomination Form.
//  4. Graduate — application form with transcript + CV uploads.
// Kobo can't tell us who completed the survey, so that step is self-declared.
// Submits to app/api/ai-for-professionals/register/route.ts.

import { useState, type FormEvent } from 'react';
import {
  DOCUMENT_EXTENSIONS,
  EMAIL_PATTERN,
  EMPLOYEES_SURVEY_URL,
  GENDERS,
  MAX_DOCUMENT_BYTES,
  MOTIVATION_MAX_WORDS,
  countWords,
  PARTNERSHIP_FORM_URL,
  PARTNERSHIP_PROPOSAL_PDF,
  PROGRAMME_CONTACT,
  QUALIFICATIONS,
  STUDY_STATUSES,
  TRACKS,
} from '@/lib/aiForProfessionals';

export type Role = 'partner' | 'manager' | 'nonPartner' | 'graduate';
type Status = 'idle' | 'sending' | 'error';
type Nominee = { fullName: string; email: string; jobTitle: string; track: string; hub: string };
type Verified = { partner: string; nominee: Nominee; emailed: boolean };

export default function RegistrationFlow({ initialRole, partners }: { initialRole?: Role; partners: string[] }) {
  const [role, setRole] = useState<Role | null>(initialRole ?? null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [done, setDone] = useState<{ role: Role; partner?: string } | null>(null);

  // Partner staff
  const [company, setCompany] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [verified, setVerified] = useState<Verified | null>(null);
  const [surveyOpened, setSurveyOpened] = useState(false);
  const [surveyDone, setSurveyDone] = useState(false);
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);

  function choose(r: Role) {
    setRole(r);
    setErrorMessage('');
    setStatus('idle');
  }

  async function post(url: string, body: BodyInit, json = true) {
    setStatus('sending');
    setErrorMessage('');
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: json ? { 'Content-Type': 'application/json' } : undefined,
        body,
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setErrorMessage(result.error || 'Something went wrong. Please try again.');
        return null;
      }
      setStatus('idle');
      return result;
    } catch {
      setStatus('error');
      setErrorMessage('Network error — please check your connection and try again.');
      return null;
    }
  }

  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(workEmail.trim())) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    const result = await post('/api/ai-for-professionals/verify', JSON.stringify({ company, email: workEmail }));
    if (result) setVerified({ partner: result.partner, nominee: result.nominee, emailed: Boolean(result.emailed) });
  }

  async function handleManagerLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await post('/api/ai-for-professionals/manager-link', JSON.stringify({ company, email: workEmail }));
    if (result) setLinkSentTo(workEmail.trim());
  }

  async function handleStaffDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!verified) return;
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const result = await post(
      '/api/ai-for-professionals/register',
      JSON.stringify({ ...data, role: 'employee', company: verified.partner, email: verified.nominee.email, surveyCompleted: surveyDone })
    );
    if (result) setDone({ role: 'partner', partner: verified.partner });
  }

  async function handleGraduate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    for (const [key, label] of [['transcript', 'transcript'], ['cv', 'CV']] as const) {
      const file = data.get(key);
      if (file instanceof File && file.size > MAX_DOCUMENT_BYTES) {
        setStatus('error');
        setErrorMessage(`Your ${label} is too large — please keep each file under 4 MB.`);
        return;
      }
    }
    data.set('role', 'graduate');
    const result = await post('/api/ai-for-professionals/register', data, false);
    if (result) setDone({ role: 'graduate' });
  }

  // ---------------- finished screens ----------------
  if (done) {
    return (
      <div className="cl-form-success">
        <div className="cl-form-success-icon">✓</div>
        {done.role === 'graduate' ? (
          <>
            <h3>Application received!</h3>
            <p>
              Thank you for applying. We&apos;ve received your application, transcript and CV, and sent a confirmation to
              your email. We&apos;ll contact you about the next steps in the selection process.
            </p>
          </>
        ) : (
          <>
            <h3>You&apos;re registered!</h3>
            <p>
              Thank you — you&apos;re registered for the programme as a nominee of <strong>{done.partner}</strong>.
              We&apos;ve sent a confirmation to your email and will be in touch with your training schedule.
            </p>
          </>
        )}
        <SpamNotice>
          Don&apos;t see our email? Check your <strong>spam or junk folder</strong> and mark it as &ldquo;Not spam&rdquo; so
          you don&apos;t miss our updates.
        </SpamNotice>
      </div>
    );
  }

  const error = status === 'error' && errorMessage && <p className="cl-form-error">{errorMessage}</p>;

  return (
    <div className="cl-aipro">
      <h2 className="cl-aipro-step-title">I am registering as…</h2>
      <div className="cl-aipro-roles" role="radiogroup" aria-label="Registering as">
        <RoleCard active={role === 'partner'} onClick={() => choose('partner')} icon="fa-handshake" title="Partner organisation staff">
          Your organisation is a programme partner and has nominated you.
        </RoleCard>
        <RoleCard active={role === 'manager'} onClick={() => choose('manager')} icon="fa-user-tie" title="Partner organisation manager">
          Nominate your staff or check who you&apos;ve nominated.
        </RoleCard>
        <RoleCard active={role === 'nonPartner'} onClick={() => choose('nonPartner')} icon="fa-building" title="Not a partner yet">
          Your organisation isn&apos;t a partner but would like to join.
        </RoleCard>
        <RoleCard active={role === 'graduate'} onClick={() => choose('graduate')} icon="fa-graduation-cap" title="Graduate">
          Completed your studies? Apply with your transcript and CV.
        </RoleCard>
      </div>

      {/* ---------------- partner staff ---------------- */}
      {role === 'partner' && !verified && (
        <form className="cl-form" onSubmit={handleVerify}>
          <h3 className="cl-form-section-title">Step 1: Confirm your nomination</h3>
          <p className="cl-aipro-lead">
            Only staff nominated by a partner organisation can register. Select your company and enter the email address
            your employer nominated you with.
          </p>
          <div>
            <label htmlFor="company">Your company *</label>
            <input
              id="company"
              list="aipro-partners"
              autoComplete="organization"
              placeholder="Start typing your company's name…"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <datalist id="aipro-partners">
              {partners.map((p) => <option key={p} value={p} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="workEmail">Your email address *</label>
            <input
              id="workEmail"
              type="email"
              required
              placeholder="the email your employer nominated"
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
            />
          </div>
          {error}
          <button type="submit" className="cl-btn-blue" disabled={status === 'sending'}>
            {status === 'sending' ? 'Checking…' : 'Check my nomination →'}
          </button>
          <p className="cl-form-hint">
            Company not in the list? <button type="button" className="cl-aipro-linkbtn" onClick={() => choose('nonPartner')}>See how it can become a partner</button>.
          </p>
        </form>
      )}

      {role === 'partner' && verified && (
        <>
          <div className="cl-aipro-verified">
            <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
            <div>
              <strong>Nomination confirmed</strong>
              <span>{verified.nominee.fullName || verified.nominee.email} · {verified.partner}</span>
            </div>
          </div>
          <div className="cl-aipro-next-steps">
            <strong><i className="fa-solid fa-list-check" aria-hidden="true"></i> You&apos;re not registered yet — please finish these steps:</strong>
            <ol>
              <li><b>Step 2:</b> complete the Employees Survey below.</li>
              <li><b>Step 3:</b> confirm your details and click &ldquo;Complete Registration&rdquo;.</li>
            </ol>
            <span>
              {verified.emailed
                ? <>We&apos;ve also emailed these steps to <strong>{verified.nominee.email}</strong> (check your spam folder too). </>
                : null}
              You&apos;ll get a &ldquo;You&apos;re registered&rdquo; email once you&apos;ve finished.
            </span>
          </div>

          <div className={`cl-aipro-survey-step${surveyDone ? ' done' : ''}`}>
            <div className="cl-aipro-step-badge">{surveyDone ? <i className="fa-solid fa-check" aria-hidden="true"></i> : '2'}</div>
            <div className="cl-aipro-survey-body">
              <h3>Step 2: Complete the Employees Survey</h3>
              <p>Please fill in the programme&apos;s Employees Survey. It opens in a new tab — come back here when you&apos;ve submitted it.</p>
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
                <input id="surveyDone" type="checkbox" checked={surveyDone} disabled={!surveyOpened && !surveyDone} onChange={(e) => setSurveyDone(e.target.checked)} />
                <label htmlFor="surveyDone">
                  I have completed and submitted the Employees Survey
                  {!surveyOpened && !surveyDone && <span className="cl-form-hint">Open the survey first to tick this box.</span>}
                </label>
              </div>
            </div>
          </div>

          {surveyDone && (
            <form className="cl-form" onSubmit={handleStaffDetails}>
              <h3 className="cl-form-section-title">Step 3: Confirm your details</h3>
              <HoneypotField />
              <div className="cl-form-row">
                <Field id="fullName" label="Full name *" required defaultValue={verified.nominee.fullName} />
                <div>
                  <label htmlFor="emailShown">Email address</label>
                  <input id="emailShown" value={verified.nominee.email} readOnly />
                </div>
              </div>
              <div className="cl-form-row">
                <Field id="phone" label="Phone number" type="tel" />
                <Field id="jobTitle" label="Job title" defaultValue={verified.nominee.jobTitle} />
              </div>
              <Select id="track" label="Track *" options={TRACKS} required defaultValue={verified.nominee.track} placeholder="Select a track" />
              <ConsentRow />
              {error}
              <button type="submit" className="cl-btn-blue" disabled={status === 'sending'}>
                {status === 'sending' ? 'Submitting…' : 'Complete Registration →'}
              </button>
            </form>
          )}
        </>
      )}

      {/* ---------------- partner managers ---------------- */}
      {role === 'manager' && !linkSentTo && (
        <form className="cl-form" onSubmit={handleManagerLink}>
          <h3 className="cl-form-section-title">Manage your organisation&apos;s nominations</h3>
          <p className="cl-aipro-lead">
            Select your organisation and enter the email address it gave the programme. We&apos;ll email you a secure link to view
            your nominated staff and nominate more people.
          </p>
          <div>
            <label htmlFor="company">Your organisation *</label>
            <input
              id="company"
              list="aipro-partners"
              autoComplete="organization"
              placeholder="Start typing your organisation's name…"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <datalist id="aipro-partners">
              {partners.map((p) => <option key={p} value={p} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="workEmail">Your email address *</label>
            <input id="workEmail" type="email" required placeholder="you@your-organisation.com" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} />
          </div>
          {error}
          <button type="submit" className="cl-btn-blue" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Email me a secure link →'}
          </button>
        </form>
      )}

      {role === 'manager' && linkSentTo && (
        <div className="cl-form-success">
          <div className="cl-form-success-icon"><i className="fa-solid fa-envelope" aria-hidden="true"></i></div>
          <h3>Check your email</h3>
          <p>
            We&apos;ve sent a secure link to <strong>{linkSentTo}</strong>. Open it to view your nominated staff and nominate more
            people. The link works for 24 hours.
          </p>
          <SpamNotice>Can&apos;t find it? Check your <strong>spam or junk folder</strong>.</SpamNotice>
          <button type="button" className="cl-aipro-linkbtn" onClick={() => setLinkSentTo(null)}>Use a different email</button>
        </div>
      )}

      {/* ---------------- not a partner ---------------- */}
      {role === 'nonPartner' && (
        <div className="cl-aipro-partner-offer">
          <h3>Become a programme partner — &ldquo;Train-2, Place-2&rdquo;</h3>
          <p>
            Registration for staff is open to partner organisations. Partnering is free and non-binding:
          </p>
          <div className="cl-aipro-t2p2">
            <div>
              <strong>Train 2</strong>
              <span>Nominate two of your staff for free, 160-hour practical AI training.</span>
            </div>
            <div>
              <strong>Place 2</strong>
              <span>Offer two placement slots (internship, project or hire) to programme graduates.</span>
            </div>
          </div>
          <p>
            Partners also help shape the curriculum, can submit real business challenges for capstone projects, and are
            recognised across KNUST, GIZ and Ministry platforms.
          </p>
          <div className="cl-aipro-offer-actions">
            <a href={PARTNERSHIP_PROPOSAL_PDF} target="_blank" rel="noopener noreferrer" className="cl-btn-white">
              <i className="fa-solid fa-file-pdf" aria-hidden="true"></i>&nbsp; Read the Partnership Proposal (PDF)
            </a>
            <a href={PARTNERSHIP_FORM_URL} target="_blank" rel="noopener noreferrer" className="cl-btn-blue">
              Partnership Commitment &amp; Nomination Form ↗
            </a>
          </div>
          <p className="cl-form-hint">
            Questions? Contact {PROGRAMME_CONTACT.name} at <a href={`mailto:${PROGRAMME_CONTACT.email}`}>{PROGRAMME_CONTACT.email}</a> or {PROGRAMME_CONTACT.phone}.
            Once your organisation is listed as a partner and has nominated you, come back and choose &ldquo;Partner organisation staff&rdquo;.
          </p>
        </div>
      )}

      {/* ---------------- graduates ---------------- */}
      {role === 'graduate' && (
        <form className="cl-form" onSubmit={handleGraduate} encType="multipart/form-data">
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
          <MotivationField />
          <div className="cl-form-row">
            <FileField id="transcript" label="Academic transcript *" />
            <FileField id="cv" label="CV / résumé *" />
          </div>
          <ConsentRow />
          {error}
          <button type="submit" className="cl-btn-blue" disabled={status === 'sending'}>
            {status === 'sending' ? 'Uploading…' : 'Submit Application →'}
          </button>
        </form>
      )}
    </div>
  );
}

function RoleCard({ active, onClick, icon, title, children }: { active: boolean; onClick: () => void; icon: string; title: string; children: React.ReactNode }) {
  return (
    <button type="button" role="radio" aria-checked={active} className={`cl-aipro-role${active ? ' active' : ''}`} onClick={onClick}>
      <span className="cl-aipro-role-icon"><i className={`fa-solid ${icon}`} aria-hidden="true"></i></span>
      <span className="cl-aipro-role-title">{title}</span>
      <span className="cl-aipro-role-desc">{children}</span>
    </button>
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

// "Why do you want to join?" with a live word count, capped at MOTIVATION_MAX_WORDS.
// setCustomValidity blocks submitting while it's over the limit.
function MotivationField() {
  const [words, setWords] = useState(0);
  const over = words > MOTIVATION_MAX_WORDS;
  return (
    <div>
      <label htmlFor="motivation">Why do you want to join this programme? *</label>
      <textarea
        id="motivation"
        name="motivation"
        required
        placeholder={`A few sentences about your interest in AI and what you hope to achieve (up to ${MOTIVATION_MAX_WORDS} words)…`}
        onChange={(e) => {
          const n = countWords(e.target.value);
          setWords(n);
          e.target.setCustomValidity(n > MOTIVATION_MAX_WORDS ? `Please keep this to ${MOTIVATION_MAX_WORDS} words or fewer.` : '');
        }}
      />
      <span className={`cl-aipro-wordcount${over ? ' over' : ''}`}>
        {words} / {MOTIVATION_MAX_WORDS} words{over ? ` — please remove ${words - MOTIVATION_MAX_WORDS}` : ''}
      </span>
    </div>
  );
}

// Upload box with an icon instead of the browser's plain "Choose File" button.
// The real input stays in the form (visually hidden) so "required" still works.
function FileField({ id, label }: { id: string; label: string }) {
  const [fileName, setFileName] = useState('');
  return (
    <div>
      <span className="cl-aipro-upload-label">{label}</span>
      <label htmlFor={id} className={`cl-aipro-upload${fileName ? ' has-file' : ''}`}>
        <i className={`fa-solid ${fileName ? 'fa-file-circle-check' : 'fa-cloud-arrow-up'}`} aria-hidden="true"></i>
        <span className="cl-aipro-upload-text">
          <strong>{fileName || 'Click to upload'}</strong>
          <small>{fileName ? 'Click to choose a different file' : 'PDF or Word, up to 4 MB'}</small>
        </span>
        <input
          id={id}
          name={id}
          type="file"
          required
          accept={DOCUMENT_EXTENSIONS.join(',')}
          className="cl-aipro-upload-input"
          onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
        />
      </label>
    </div>
  );
}

function Select({
  id,
  label,
  options,
  required,
  placeholder = 'Select',
  defaultValue = '',
}: {
  id: string;
  label: string;
  options: readonly string[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <select id={id} name={id} required={required} defaultValue={options.includes(defaultValue) ? defaultValue : ''}>
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
      <label htmlFor="consent">I agree to CAIRLab and GIZ processing these details for the purposes of this programme *</label>
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
