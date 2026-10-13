'use client';

import type { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getBrowserDb } from '@/lib/supabase/browser';
import { btn, btnPrimary, field, label } from './adminUi';
import { Workspace } from './Workspace';

type State = 'loading' | 'signedout' | 'denied' | 'ok' | 'recovery';

/**
 * Lean admin. Sign-in is Supabase email + password (no sign-up form; accounts are created in the
 * Supabase dashboard). Access is decided by the database: is_admin() must be true, and every
 * write below is enforced by RLS, so this UI is a convenience, not the security boundary.
 */
export function AdminApp() {
  const db = useMemo(() => getBrowserDb(), []);
  const [state, setState] = useState<State>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // The editor is a tool, not a page: hide the site's header, footer, banners and custom cursor while it is open.
  useEffect(() => {
    document.documentElement.dataset.admin = '1';
    return () => void delete document.documentElement.dataset.admin;
  }, []);

  // Always ask for the password when the admin is opened: forget any session saved by older versions,
  // and sign out (on this device only) the moment the owner leaves the page.
  useEffect(() => {
    Object.keys(localStorage)
      .filter((k) => /^sb-.+-auth-token/.test(k))
      .forEach((k) => localStorage.removeItem(k));
    const leave = () => void db.auth.signOut({ scope: 'local' });
    addEventListener('pagehide', leave);
    return () => {
      removeEventListener('pagehide', leave);
      leave();
    };
  }, [db]);

  // Sign out after 30 minutes without any activity.
  useEffect(() => {
    if (state !== 'ok') return;
    const IDLE_MS = 30 * 60 * 1000;
    let t = window.setTimeout(() => void db.auth.signOut({ scope: 'local' }), IDLE_MS);
    const bump = () => {
      clearTimeout(t);
      t = window.setTimeout(() => void db.auth.signOut({ scope: 'local' }), IDLE_MS);
    };
    const events = ['pointerdown', 'keydown', 'scroll'] as const;
    events.forEach((e) => addEventListener(e, bump, { passive: true }));
    return () => {
      clearTimeout(t);
      events.forEach((e) => removeEventListener(e, bump));
    };
  }, [state, db]);

  useEffect(() => {
    // The reset-email link carries `type=recovery` in the URL hash; remember it before supabase-js clears it.
    if (/type=recovery/.test(location.hash)) recovering.current = true;
    const check = async (s: Session | null) => {
      setSession(s);
      if (!s) return setState('signedout');
      if (recovering.current) return setState('recovery'); // set a new password before anything else
      const { data } = await db.rpc('is_admin');
      setState(data === true ? 'ok' : 'denied');
    };
    db.auth.getSession().then(({ data }) => check(data.session));
    // Defer: calling Supabase inside this callback synchronously can deadlock the auth lock.
    // Opening a password-reset email link fires PASSWORD_RECOVERY: show the new-password form
    // instead of the dashboard, even though the link also signs the user in.
    const { data } = db.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') recovering.current = true;
      if (event === 'SIGNED_OUT') recovering.current = false;
      setTimeout(() => check(s), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [db]);

  const [notice, setNotice] = useState('');
  const recovering = useRef(false);
  const [newPw, setNewPw] = useState({ a: '', b: '' });

  const forgot = async () => {
    setError('');
    if (!form.email) return setError('Type your email above first, then press "Forgot password".');
    await db.auth.resetPasswordForEmail(form.email, { redirectTo: `${location.origin}/admin` });
    // Same message whether or not the address is an account, so this can't be used to probe emails.
    setNotice('If that email has an account, a reset link is on its way. Check spam too.');
  };

  const setPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPw.a.length < 10) return setError('Use at least 10 characters.');
    if (newPw.a !== newPw.b) return setError('The two passwords do not match.');
    setBusy(true);
    const { error } = await db.auth.updateUser({ password: newPw.a });
    setBusy(false);
    if (error) return setError(error.message);
    setNewPw({ a: '', b: '' });
    recovering.current = false;
    history.replaceState(null, '', '/admin'); // drop the recovery token from the URL
    const { data } = await db.auth.getSession();
    setNotice('Password updated.');
    const { data: ok } = await db.rpc('is_admin');
    setSession(data.session);
    setState(ok === true ? 'ok' : 'denied');
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await db.auth.signInWithPassword(form);
    if (error) setError('Email or password is incorrect.');
    setBusy(false);
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-[60] overflow-y-auto bg-bg px-(--gutter) pt-24 pb-0 [font-variation-settings:'wdth'_100,'wght'_400]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="t-display text-[clamp(40px,6vw,72px)]">Site editor</h1>
          <div className="t-label flex items-center gap-2">
            <Link href="/" className="inline-flex min-h-11 items-center hover:text-text">
              View site →
            </Link>
            {session && (
              <button type="button" onClick={() => db.auth.signOut()} className={btn}>
                Sign out
              </button>
            )}
          </div>
        </div>

        {state === 'loading' && <p className="t-body mt-10">Loading…</p>}

        {state === 'signedout' && (
          <form onSubmit={signIn} className="mt-10 max-w-sm space-y-4">
            <label className="block">
              <span className={label}>Email</span>
              <input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />
            </label>
            <label className="block">
              <span className={label}>Password</span>
              <input type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={field} />
            </label>
            {error && (
              <p role="alert" className="t-label !text-negative">
                {error}
              </p>
            )}
            <p className="text-[13px] text-muted">For your security you will be asked to sign in every time you open this page.</p>
            {notice && (
              <p role="status" className="t-label !text-positive">
                {notice}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <button type="submit" disabled={busy} className={btnPrimary}>
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
              <button type="button" onClick={forgot} className={btn}>
                Forgot password
              </button>
            </div>
          </form>
        )}

        {state === 'recovery' && (
          <form onSubmit={setPassword} className="mt-10 max-w-sm space-y-4">
            <p className="t-body">Choose a new password for {session?.user.email}.</p>
            <label className="block">
              <span className={label}>New password (10+ characters)</span>
              <input type="password" required autoComplete="new-password" value={newPw.a} onChange={(e) => setNewPw({ ...newPw, a: e.target.value })} className={field} />
            </label>
            <label className="block">
              <span className={label}>Repeat it</span>
              <input type="password" required autoComplete="new-password" value={newPw.b} onChange={(e) => setNewPw({ ...newPw, b: e.target.value })} className={field} />
            </label>
            {error && (
              <p role="alert" className="t-label !text-negative">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className={btnPrimary}>
              {busy ? 'Saving…' : 'Save new password'}
            </button>
          </form>
        )}

        {state === 'denied' && (
          <p className="t-body mt-10">
            Signed in as {session?.user.email}, but this account is not an admin. Ask the site owner to add it, or sign out and use another account.
          </p>
        )}

        {state === 'ok' && session && <Workspace db={db} userId={session.user.id} />}
      </div>
    </div>
  );
}
