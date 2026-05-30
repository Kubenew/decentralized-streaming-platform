export class MSEStreamEngine {
  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;
  private queue: Uint8Array[] = [];
  private isAppending = false;

  async initialize(video: HTMLVideoElement, mimeCodec = 'video/mp4; codecs="av01.0.08M.08"') {
    this.mediaSource = new MediaSource();
    video.src = URL.createObjectURL(this.mediaSource);

    return new Promise<void>((resolve) => {
      this.mediaSource!.addEventListener('sourceopen', () => {
        this.sourceBuffer = this.mediaSource!.addSourceBuffer(mimeCodec);
        this.sourceBuffer.addEventListener('updateend', () => this.flushQueue());
        resolve();
      });
    });
  }

  enqueueChunk(data: Uint8Array) {
    this.queue.push(data);
    this.flushQueue();
  }

  private flushQueue() {
    if (this.isAppending || !this.sourceBuffer || this.queue.length === 0) return;
    this.isAppending = true;
    try {
      this.sourceBuffer.appendBuffer(this.queue.shift()!);
    } catch (err) {
      console.warn('MSE append error:', err);
    }
    this.isAppending = false;
  }

  get buffered(): TimeRanges | null {
    return this.sourceBuffer?.buffered ?? null;
  }

  destroy() {
    this.queue = [];
    if (this.mediaSource && this.mediaSource.readyState === 'open') {
      this.mediaSource.endOfStream();
    }
  }
}
