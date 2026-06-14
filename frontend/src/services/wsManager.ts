import { WSMessage } from '../types/deriv';

type MessageHandler = (msg: WSMessage) => void;
type StatusHandler = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;

interface PendingRequest {
  resolve: (msg: WSMessage) => void;
  reject: (err: Error) => void;
}

export class WSManager {
  private ws: WebSocket | null = null;
  private url: string;
  private queue: string[] = [];
  private reqHandlers = new Map<number, PendingRequest>();
  private msgTypeHandlers = new Map<string, MessageHandler[]>();
  private statusHandlers: StatusHandler[] = [];
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reqIdCounter = 1;
  private isManualClose = false;
  private currentStatus: 'connecting'|'connected'|'disconnected'|'error' = 'disconnected';

  constructor(url: string) { this.url = url; }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    if (this.ws?.readyState === WebSocket.CONNECTING) return;
    this.isManualClose = false;
    this.notifyStatus('connecting');
    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.notifyStatus('connected');
        this.startPing();
        this.flushQueue();
      };
      this.ws.onmessage = (event) => {
        try { this.handleMessage(JSON.parse(event.data)); } catch {}
      };
      this.ws.onerror = () => {
        this.notifyStatus('error');
      };
      this.ws.onclose = (e) => {
        this.stopPing();
        if (!this.isManualClose) {
          this.notifyStatus('disconnected');
          this.scheduleReconnect();
        }
      };
    } catch {
      this.notifyStatus('error');
      this.scheduleReconnect();
    }
  }

  private handleMessage(msg: WSMessage): void {
    // Handle ping/pong
    if ((msg as any).pong) return;

    if (msg.req_id !== undefined) {
      const handler = this.reqHandlers.get(msg.req_id);
      if (handler) {
        this.reqHandlers.delete(msg.req_id);
        if (msg.error) { handler.reject(new Error((msg.error as any).message || 'WS error')); }
        else { handler.resolve(msg); }
      }
    }

    if (msg.msg_type) {
      const handlers = this.msgTypeHandlers.get(msg.msg_type) || [];
      handlers.forEach(h => { try { h(msg); } catch {} });
    }
  }

  send(payload: Record<string, unknown>): Promise<WSMessage> {
    const reqId = this.reqIdCounter++;
    const message = JSON.stringify({ ...payload, req_id: reqId });
    return new Promise((resolve, reject) => {
      this.reqHandlers.set(reqId, { resolve, reject });
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(message);
      } else {
        this.queue.push(message);
        // Trigger connect if not connected
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
          this.connect();
        }
      }
      setTimeout(() => {
        if (this.reqHandlers.has(reqId)) {
          this.reqHandlers.delete(reqId);
          reject(new Error('Request timed out'));
        }
      }, 20000);
    });
  }

  subscribe(msgType: string, handler: MessageHandler): () => void {
    const existing = this.msgTypeHandlers.get(msgType) || [];
    this.msgTypeHandlers.set(msgType, [...existing, handler]);
    return () => {
      const handlers = this.msgTypeHandlers.get(msgType) || [];
      this.msgTypeHandlers.set(msgType, handlers.filter(h => h !== handler));
    };
  }

  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.push(handler);
    // Immediately notify current status
    handler(this.currentStatus);
    return () => {
      this.statusHandlers = this.statusHandlers.filter(h => h !== handler);
    };
  }

  forget(subscriptionId: string): Promise<WSMessage> {
    return this.send({ forget: subscriptionId });
  }

  forgetAll(type?: string): Promise<WSMessage> {
    return this.send(type ? { forget_all: type } : { forget_all: 'all' });
  }

  close(): void {
    this.isManualClose = true;
    this.stopPing();
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.ws?.close();
    this.ws = null;
    this.queue = [];
    this.reqHandlers.forEach(h => h.reject(new Error('Connection closed')));
    this.reqHandlers.clear();
    this.notifyStatus('disconnected');
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private flushQueue(): void {
    const q = [...this.queue];
    this.queue = [];
    q.forEach(msg => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(msg);
      } else {
        this.queue.push(msg);
      }
    });
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ ping: 1 }));
      }
    }, 25000);
  }

  private stopPing(): void {
    if (this.pingInterval) { clearInterval(this.pingInterval); this.pingInterval = null; }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    this.reconnectTimeout = setTimeout(() => { this.connect(); }, delay);
  }

  private notifyStatus(status: 'connecting'|'connected'|'disconnected'|'error'): void {
    this.currentStatus = status;
    this.statusHandlers.forEach(h => { try { h(status); } catch {} });
  }
}
