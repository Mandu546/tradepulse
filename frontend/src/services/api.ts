import { DerivAccount } from '../types/deriv';

const API_BASE = 'https://tradepulse-production-84ce.up.railway.app';

let memoryToken: string | null = null;

export function setToken(token: string) {
  memoryToken = token;
}

export function getToken(): string | null {
  return memoryToken;
}

export function clearToken() {
  memoryToken = null;
}

function authHeaders(): HeadersInit {
  return memoryToken ? { Authorization: `Bearer ${memoryToken}` } : {};
}

export async function checkAuthStatus(): Promise<boolean> {
  if (!memoryToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/status`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    return data.authenticated;
  } catch { return false; }
}

export async function initiateLogin(): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/login`);
  const data = await res.json();
  if (data.url) { window.location.href = data.url; }
  else { throw new Error(data.error || 'Failed to initiate login'); }
}

export async function logout(): Promise<void> {
  clearToken();
}

export async function fetchAccounts(): Promise<DerivAccount[]> {
  const res = await fetch(`${API_BASE}/api/accounts`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) { throw new Error(data.message || 'Failed to fetch accounts'); }
  return Array.isArray(data) ? data : data.accounts || [];
}

export async function fetchOTP(accountId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/otp/${accountId}`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) { throw new Error(data.message || 'Failed to get OTP'); }
  return data.url;
}
