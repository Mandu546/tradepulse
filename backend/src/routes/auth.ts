import { Router, Request, Response } from 'express';
import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '../services/pkce';

const router = Router();

const DERIV_AUTH_URL = 'https://oauth.deriv.com/oauth2/authorize';
const DERIV_TOKEN_URL = 'https://oauth.deriv.com/oauth2/token';

router.get('/login', (req: Request, res: Response) => {
  const clientId = process.env.DERIV_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'OAuth not configured. Set DERIV_CLIENT_ID and REDIRECT_URI in .env' });
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  req.session.codeVerifier = codeVerifier;
  req.session.oauthState = state;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read trade',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `${DERIV_AUTH_URL}?${params.toString()}`;
  res.json({ url: authUrl });
});

router.get('/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (error) {
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(String(error))}`);
  }

  if (!code || !state) {
    return res.redirect(`${frontendUrl}/login?error=missing_params`);
  }

  if (state !== req.session.oauthState) {
    return res.redirect(`${frontendUrl}/login?error=state_mismatch`);
  }

  const codeVerifier = req.session.codeVerifier;
  if (!codeVerifier) {
    return res.redirect(`${frontendUrl}/login?error=no_verifier`);
  }

  try {
    const tokenRes = await axios.post(DERIV_TOKEN_URL, new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.DERIV_CLIENT_ID!,
      code: String(code),
      redirect_uri: process.env.REDIRECT_URI!,
      code_verifier: codeVerifier,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token } = tokenRes.data;
    req.session.accessToken = access_token;
    req.session.codeVerifier = undefined;
    req.session.oauthState = undefined;

    res.redirect(`${frontendUrl}/accounts`);
  } catch (err: any) {
    console.error('Token exchange failed:', err?.response?.data || err.message);
    res.redirect(`${frontendUrl}/login?error=token_exchange_failed`);
  }
});

router.get('/status', (req: Request, res: Response) => {
  res.json({ authenticated: !!req.session.accessToken });
});

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

export default router;
