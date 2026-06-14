import { Router, Request, Response } from 'express';
import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '../services/pkce';

const router = Router();
const DERIV_AUTH_URL = 'https://auth.deriv.com/oauth2/auth';
const DERIV_TOKEN_URL = 'https://auth.deriv.com/oauth2/token';
const stateStore = new Map<string, { codeVerifier: string; expires: number }>();

router.get('/login', (req: Request, res: Response) => {
  const clientId = process.env.DERIV_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'OAuth not configured.' });
  }
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();
  stateStore.set(state, { codeVerifier, expires: Date.now() + 10 * 60 * 1000 });
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'trade',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    prompt: 'consent',
  });
  res.json({ url: `${DERIV_AUTH_URL}?${params.toString()}` });
});

router.get('/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'https://frontend-sable-theta-60.vercel.app';
  if (error) {
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(String(error))}`);
  }
  if (!code || !state) {
    return res.redirect(`${frontendUrl}/login?error=missing_params`);
  }
  const stored = stateStore.get(String(state));
  if (!stored || stored.expires < Date.now()) {
    return res.redirect(`${frontendUrl}/login?error=state_expired`);
  }
  stateStore.delete(String(state));
  try {
    const tokenRes = await axios.post(DERIV_TOKEN_URL, new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.DERIV_CLIENT_ID!,
      code: String(code),
      redirect_uri: process.env.REDIRECT_URI!,
      code_verifier: stored.codeVerifier,
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const { access_token } = tokenRes.data;
    return res.redirect(`${frontendUrl}/accounts?token=${encodeURIComponent(access_token)}`);
  } catch (err: any) {
    console.error('Token exchange failed:', err?.response?.data || err.message);
    return res.redirect(`${frontendUrl}/login?error=token_exchange_failed`);
  }
});

router.get('/status', (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.json({ authenticated: false });
  }
  res.json({ authenticated: true });
});

router.post('/logout', (req: Request, res: Response) => {
  res.json({ success: true });
});

export default router;
