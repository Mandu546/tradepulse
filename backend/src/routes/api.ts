import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';

const router = Router();

const DERIV_REST_BASE = 'https://api.derivws.com';

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: 'AuthorizationRequired', message: 'Please log in first.' });
  }
  next();
}

router.get('/accounts', requireAuth, async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${DERIV_REST_BASE}/trading/v1/options/accounts`, {
      headers: { Authorization: `Bearer ${req.session.accessToken}` },
    });
    res.json(response.data);
  } catch (err: any) {
    const status = err?.response?.status || 500;
    const message = err?.response?.data?.message || 'Failed to fetch accounts';
    if (status === 401) {
      req.session.accessToken = undefined;
      return res.status(401).json({ error: 'InvalidToken', message: 'Session expired. Please log in again.' });
    }
    if (status === 429) {
      return res.status(429).json({ error: 'RateLimit', message: 'Too many requests. Please slow down.' });
    }
    res.status(status).json({ error: err?.response?.data?.error || 'UnknownError', message });
  }
});

router.post('/otp/:accountId', requireAuth, async (req: Request, res: Response) => {
  const { accountId } = req.params;
  try {
    const response = await axios.post(
      `${DERIV_REST_BASE}/trading/v1/options/accounts/${accountId}/otp`,
      {},
      { headers: { Authorization: `Bearer ${req.session.accessToken}` } }
    );
    const wsUrl = response.data?.url || response.data?.ws_url;
    if (!wsUrl) {
      return res.status(500).json({ error: 'NoWSUrl', message: 'No WebSocket URL returned from OTP endpoint.' });
    }
    req.session.selectedAccountId = accountId;
    res.json({ url: wsUrl });
  } catch (err: any) {
    const status = err?.response?.status || 500;
    const message = err?.response?.data?.message || 'Failed to get OTP';
    if (status === 401) {
      req.session.accessToken = undefined;
      return res.status(401).json({ error: 'InvalidToken', message: 'Session expired. Please log in again.' });
    }
    res.status(status).json({ error: err?.response?.data?.error || 'UnknownError', message });
  }
});

export default router;
