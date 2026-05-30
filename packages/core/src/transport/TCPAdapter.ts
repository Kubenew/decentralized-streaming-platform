import { TransportAdapter } from './TransportAdapter';

export class TCPAdapter implements TransportAdapter {
  readonly name = 'tcp';
  private socket: WebSocket | null = null;
  private pending = new TransformStream<Uint8Array>();
  private rtt = 0;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  async connect(url: string) {
    this.socket = new WebSocket(url);
    await new Promise<void>((resolve, reject) => {
      this.socket!.onopen = () => resolve();
      this.socket!.onerror = () => reject(new Error('TCP connect failed'));
    });
    this.socket.binaryType = 'arraybuffer';

    this.socket.onmessage = (ev) => {
      const writer = this.pending.writable.getWriter();
      writer.write(new Uint8Array(ev.data));
      writer.releaseLock();
    };

    this.pingInterval = setInterval(() => {
      const start = performance.now();
      this.socket?.send(new Uint8Array([0]));
      this.rtt = performance.now() - start;
    }, 5000);
  }

  async send(data: Uint8Array) {
    this.socket?.send(data);
  }

  async *receive() {
    const reader = this.pending.readable.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      yield value;
    }
  }

  latency(): number {
    return this.rtt || Infinity;
  }

  async close() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.socket?.close();
  }
}
