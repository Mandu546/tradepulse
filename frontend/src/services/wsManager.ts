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
  private maxReconnectAttempts = 5;
  private reqIdCounter = 1;
  private isManualClose = false;

  constructor(url: string) { this.url = url; }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;
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
      this.ws.onerror = () => { this.notifyStatus('error'); };
      this.ws.onclose = () => {
        this.stopPing();
        if (!this.isManualClose) { this.notifyStatus('disconnected'); this.scheduleReconnect(); }
      };
    } catch { this.notifyStatus('error'); this.scheduleReconnect(); }
  }

  private handleMessage(msg: WSMessage): void {
    if (msg.req_id !== undefined) {
      const handler = this.reqHandlers.get(msg.req_id);
      if (handler) {
        this.reqHandlers.delete(msg.req_id);
        if (msg.error) { handler.reject(new Error(msg.error.message)); }
        else { handler.resolve(msg); }
      }
    }
    if (msg.msg_type) {
      const handlers = this.msgTypeHandlers.get(msg.msg_type);
      if (handlers) { handlers.forEach(h => h(msg)); }
    }
  }

  send(payload: Record<string, unknown>): Promise<WSMessage> {
    const reqId = this.reqIdCounter++;
    const message = JSON.stringify({ ...payload, req_id: reqId });
    return new Promise((resolve, reject) => {
      this.reqHandlers.set(reqId, { resolve, reject });
      if (this.ws?.readyState === WebSocket.OPEN) { this.ws.send(message); }
      else { this.queue.push(message); }
      setTimeout(() => {
        if (this.reqHandlers.has(reqId)) {
          this.reqHandlers.delete(reqId);
          reject(new Error('Request timed out'));
        }
      }, 15000);
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
    return () => { this.statusHandlers = this.statusHandlers.filter(h => h !== handler); };
  }

  forget(subscriptionId: string): void { this.send({ forget: subscriptionId }); }
  forgetAll(): void { this.send({ forget_all: 'all' }); }

  close(): void {
    this.isManualClose = true;
    this.stopPing();
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.ws?.close();
    this.ws = null;
    this.queue = [];
    this.reqHandlers.clear();
  }

  isConnected(): boolean { return this.ws?.readyState === WebSocket.OPEN; }

  private flushQueue(): void {
    while (this.queue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(this.queue.shift()!);
    }
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) { this.ws.send(JSON.stringify({ ping: 1 })); }
    }, 30000);
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

  private notifyStatus(status: 'connecting' | 'connected' | 'disconnected' | 'error'): void {
    this.statusHandlers.forEach(h => h(status));
  }
}
