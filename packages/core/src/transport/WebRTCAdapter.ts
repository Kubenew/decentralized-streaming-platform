import { TransportAdapter } from './TransportAdapter';

export class WebRTCAdapter implements TransportAdapter {
  readonly name = 'webrtc';
  private pc: RTCPeerConnection | null = null;
  private channel: RTCDataChannel | null = null;
  private pending = new TransformStream<Uint8Array>();
  private startTime = 0;

  async connect(signal: string) {
    this.pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    this.channel = this.pc.createDataChannel('dsp-video');

    this.channel.onmessage = (ev) => {
      const writer = this.pending.writable.getWriter();
      writer.write(new Uint8Array(ev.data));
      writer.releaseLock();
    };

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    await this.pc.setRemoteDescription(JSON.parse(signal));
    this.startTime = performance.now();
  }

  async send(data: Uint8Array) {
    this.channel?.send(data);
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
    if (!this.pc) return Infinity;
    return (this.pc.currentRemoteDescription?.sdp.length ?? 0) > 0
      ? performance.now() - this.startTime
      : Infinity;
  }

  async close() {
    this.channel?.close();
    this.pc?.close();
  }
}
