'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/** Underline-only enquiry form. On success the form is replaced by the thank-you line. */
export function ContactForm({ subjects, success }: { subjects: string[]; success: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    const errs: Record<string, string> = {};
    if (!d.name.trim()) errs.name = 'Please tell me your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errs.email = 'Please enter a valid email.';
    if (!d.message.trim()) errs.message = 'Please write a short message.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (d.company) return setStatus('sent'); // honeypot: only bots fill the hidden field

    setStatus('sending');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: d.name,
          email: d.email,
          subject: d.subject || 'Other',
          need: d.subject || null,
          message: d.message,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') return <p role="status">{success}</p>;

  const err = (k: string) =>
    errors[k] && (
      <span role="alert" className="mt-1 block text-xs text-negative">
        {errors[k]}
      </span>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <label className="block">
        <span className="text-muted">Name</span>
        <input name="name" autoComplete="name" maxLength={120} aria-invalid={!!errors.name} className="line-field" />
        {err('name')}
      </label>
      <label className="block">
        <span className="text-muted">Email</span>
        <input name="email" type="email" autoComplete="email" maxLength={254} aria-invalid={!!errors.email} className="line-field" />
        {err('email')}
      </label>
      <label className="block">
        <span className="text-muted">Subject</span>
        <select name="subject" defaultValue="" className="line-field">
          <option value="">Choose one</option>
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-muted">Message</span>
        <textarea name="message" rows={4} maxLength={4000} aria-invalid={!!errors.message} className="line-field resize-none" />
        {err('message')}
      </label>

      {/* Honeypot: hidden from people and screen readers */}
      <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="sr-only" />

      <button type="submit" disabled={status === 'sending'} className="ulink min-h-11 disabled:opacity-60">
        {status === 'sending' ? 'Sending…' : 'Send →'}
      </button>
      <p role="status" className="text-xs text-negative">
        {status === 'error' && 'Something went wrong. Please try again or email me directly.'}
      </p>
    </form>
  );
}
