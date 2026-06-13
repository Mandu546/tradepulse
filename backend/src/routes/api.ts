import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';

const router = Router();
const DERIV_REST_BASE = 'https://api.derivws.com';

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'AuthorizationRequired', message: 'Please log in first.' });
  }
  next();
}

router.get('/accounts', requireAuth, async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${DERIV_REST_BASE}/trading/v1/options/accounts`, {
      headers: { Authorization: req.headers.authorization! },
    });
    res.json(response.data);
  } catch (err: any) {
    const status = err?.response?.status || 500;
    const message = err?.response?.data?.message || 'Failed to fetch accounts';
    res.status(status).json({ error: err?.response?.data?.error || 'UnknownError', message });
  }
});

router.post('/otp/:accountId', requireAuth, async (req: Request, res: Response) => {
  const { accountId } = req.params;
  try {
    const response = await axios.post(
      `${DERIV_REST_BASE}/trading/v1/options/accounts/${accountId}/otp`,
      {},
      { headers: { Authorization: req.headers.authorization! } }
    );
    const wsUrl = response.data?.url || response.data?.ws_url;
    if (!wsUrl) {
      return res.status(500).json({ error: 'NoWSUrl', message: 'No WebSocket URL returned.' });
    }
    res.json({ url: wsUrl });
  } catch (err: any) {
    const status = err?.response?.status || 500;
    const message = err?.response?.data?.message || 'Failed to get OTP';
    res.status(status).json({ error: err?.response?.data?.error || 'UnknownError', message });
  }
});

export default router;
