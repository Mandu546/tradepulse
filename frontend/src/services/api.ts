import { DerivAccount } from '../types/deriv';

const API_BASE = 'https://tradepulse-production-84ce.up.railway.app';

export async function checkAuthStatus(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/status`, {
      credentials: 'include',
      mode: 'cors',
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.authenticated;
  } catch { return false; }
}

export async function initiateLogin(): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    credentials: 'include',
    mode: 'cors',
  });
  const data = await res.json();
  if (data.url) { window.location.href = data.url; }
  else { throw new Error(data.error || 'Failed to initiate login'); }
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    mode: 'cors',
  });
}

export async function fetchAccounts(): Promise<DerivAccount[]> {
  const res = await fetch(`${API_BASE}/api/accounts`, {
    credentials: 'include',
    mode: 'cors',
  });
  const data = await res.json();
  if (!res.ok) { throw new Error(data.message || 'Failed to fetch accounts'); }
  return Array.isArray(data) ? data : data.accounts || [];
}

export async function fetchOTP(accountId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/otp/${accountId}`, {
    method: 'POST',
    credentials: 'include',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) { throw new Error(data.message || 'Failed to get OTP'); }
  return data.url;
}
