import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';

const router = Router();
const DERIV_REST_BASE = 'https://api.derivws.com';
const APP_ID = process.env.DERIV_CLIENT_ID || '';

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'AuthorizationRequired', message: 'Please log in first.' });
  }
  next();
}

function derivHeaders(req: Request) {
  return {
    Authorization: req.headers.authorization!,
    'Deriv-App-ID': APP_ID,
    'Content-Type': 'application/json',
  };
}

router.get('/accounts', requireAuth, async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${DERIV_REST_BASE}/trading/v1/options/accounts`, {
      headers: derivHeaders(req),
    });
    const accounts = response.data?.data || response.data;
    // If no accounts, create a demo one automatically
    if (Array.isArray(accounts) && accounts.length === 0) {
      try {
        const created = await axios.post(
          `${DERIV_REST_BASE}/trading/v1/options/accounts`,
          { currency: 'USD', group: 'row', account_type: 'demo' },
          { headers: derivHeaders(req) }
        );
        return res.json(created.data?.data || created.data || []);
      } catch (createErr: any) {
        console.error('Create account failed:', createErr?.response?.data);
      }
    }
    res.json(accounts);
  } catch (err: any) {
    const status = err?.response?.status || 500;
    const message = err?.response?.data?.message || 'Failed to fetch accounts';
    console.error('Accounts error:', err?.response?.data);
    res.status(status).json({ error: err?.response?.data?.error || 'UnknownError', message });
  }
});

router.post('/otp/:accountId', requireAuth, async (req: Request, res: Response) => {
  const { accountId } = req.params;
  try {
    const response = await axios.post(
      `${DERIV_REST_BASE}/trading/v1/options/accounts/${accountId}/otp`,
      {},
      { headers: derivHeaders(req) }
    );
    const wsUrl = response.data?.url || response.data?.ws_url || response.data?.data?.url;
    if (!wsUrl) {
      return res.status(500).json({ error: 'NoWSUrl', message: 'No WebSocket URL returned.', data: response.data });
    }
    res.json({ url: wsUrl });
  } catch (err: any) {
    const status = err?.response?.status || 500;
    const message = err?.response?.data?.message || 'Failed to get OTP';
    console.error('OTP error:', err?.response?.data);
    res.status(status).json({ error: err?.response?.data?.error || 'UnknownError', message });
  }
});

export default router;
