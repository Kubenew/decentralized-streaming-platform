import { TransportAdapter } from './TransportAdapter';

export class WebTransportAdapter implements TransportAdapter {
  readonly name = 'webtransport';
  private transport: WebTransport | null = null;
  private sendStream: WebTransportBidirectionalStream | null = null;
  private lastLatency = 0;

  async connect(url: string) {
    this.transport = new WebTransport(url);
    await this.transport.ready;
    this.sendStream = await this.transport.createBidirectionalStream();
  }

  async send(data: Uint8Array) {
    const writer = this.sendStream!.writable.getWriter();
    await writer.write(data);
    writer.releaseLock();
  }

  async *receive() {
    if (!this.transport) return;
    const reader = this.transport.incomingBidirectionalStreams.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      for await (const chunk of value.readable) {
        yield chunk;
      }
    }
  }

  latency(): number {
    if (!this.transport) return Infinity;
    const stats = (this.transport as any).stats;
    this.lastLatency = stats?.rtt ?? this.lastLatency;
    return this.lastLatency;
  }

  async close() {
    this.transport?.close();
  }
}
