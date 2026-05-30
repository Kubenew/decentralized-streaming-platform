export class Demuxer {
  private initSegment: Uint8Array | null = null;

  feed(data: Uint8Array): { type: 'video' | 'audio'; data: Uint8Array; timestamp: number } | null {
    if (!this.initSegment) {
      this.initSegment = data;
      return null;
    }
    return {
      type: 'video',
      data,
      timestamp: performance.now(),
    };
  }
}

export class WebCodecsPipeline {
  private videoDecoder: VideoDecoder | null = null;
  private audioDecoder: AudioDecoder | null = null;
  private canvas: OffscreenCanvas | null = null;
  private ctx: OffscreenCanvasRenderingContext2D | null = null;
  private demuxer = new Demuxer();

  async initialize() {
    this.videoDecoder = new VideoDecoder({
      output: (frame) => this.renderFrame(frame),
      error: (err) => console.error('VideoDecoder error:', err),
    });

    this.audioDecoder = new AudioDecoder({
      output: (data) => { /* queue for AudioContext */ },
      error: (err) => console.error('AudioDecoder error:', err),
    });
  }

  private renderFrame(frame: VideoFrame) {
    if (!this.canvas) {
      this.canvas = new OffscreenCanvas(frame.displayWidth, frame.displayHeight);
      this.ctx = this.canvas.getContext('2d')!;
    }
    this.ctx!.drawImage(frame, 0, 0);
    frame.close();
  }

  async feedChunk(data: Uint8Array, codec = 'av01.0.08M.08') {
    const packet = this.demuxer.feed(data);
    if (!packet) return;

    if (this.videoDecoder?.state === 'unconfigured') {
      const desc = this.detectCodecConfig(data);
      this.videoDecoder.configure({
        codec,
        codedWidth: 1920,
        codedHeight: 1080,
        description: desc,
      });
    }

    const chunk = new EncodedVideoChunk({
      type: 'key',
      timestamp: packet.timestamp * 1000,
      duration: 4_000_000,
      data: packet.data,
    });
    this.videoDecoder?.decode(chunk);
  }

  private detectCodecConfig(data: Uint8Array): Uint8Array | undefined {
    if (data.length < 8) return undefined;
    const av1Marker = data.slice(4, 8);
    if (av1Marker[0] === 0x81 && av1Marker[1] === 0x00) return data.slice(0, 32);
    return undefined;
  }

  getCanvas(): OffscreenCanvas | null {
    return this.canvas;
  }

  destroy() {
    this.videoDecoder?.close();
    this.audioDecoder?.close();
  }
}
