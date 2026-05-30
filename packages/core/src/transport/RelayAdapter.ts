import { TransportAdapter } from './TransportAdapter';
import { WebTransportAdapter } from './WebTransportAdapter';

export class RelayAdapter implements TransportAdapter {
  readonly name = 'relay';
  private inner: TransportAdapter;
  private bridgeLatency = 0;

  constructor() {
    this.inner = new WebTransportAdapter();
  }

  async connect(relayAddr: string) {
    const start = performance.now();
    await this.inner.connect(relayAddr);
    this.bridgeLatency = performance.now() - start;
    console.log(`🔁 Connected via relay at ${relayAddr}`);
  }

  async send(data: Uint8Array) {
    await this.inner.send(data);
  }

  async *receive() {
    yield* this.inner.receive();
  }

  latency(): number {
    return this.inner.latency() + this.bridgeLatency;
  }

  async close() {
    await this.inner.close();
  }
}
