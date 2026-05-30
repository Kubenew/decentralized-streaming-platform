import { CID } from 'multiformats/cid';
import type { VideoManifest, ChunkInfo } from '@dsp/core';

export class SimulationEngine {
  private static fakeVideoData = new Uint8Array(1024 * 1024 * 2);

  static async generateDemoManifest(): Promise<VideoManifest> {
    const chunks: ChunkInfo[] = [];

    for (let i = 0; i < 24; i++) {
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`chunk-${i}`));
      const cid = CID.create(1, 0x55, new Uint8Array(hash));

      chunks.push({
        cid,
        index: i,
        duration: 4,
        bitrate: 18000000,
        size: this.fakeVideoData.length
      });
    }

    return {
      id: 'demo-nexlify-4k',
      title: "Nexlify Tech Demo - Decentralized Streaming",
      version: "1.0",
      createdAt: Date.now(),
      totalDuration: 96,
      variants: [
        { quality: "4K", bitrate: 18000000, chunks },
        { quality: "1440p", bitrate: 12000000, chunks: chunks.slice(0, 20) }
      ],
      chunks,
      metadata: {
        codec: "av01",
        resolution: "3840x2160",
        fps: 60
      }
    };
  }

  static async simulateChunkLoad(cid: CID, delayMs = 180): Promise<Uint8Array> {
    await new Promise(r => setTimeout(r, delayMs));
    return this.fakeVideoData;
  }

  static getRandomLatency(): number {
    return Math.floor(15 + Math.random() * 65);
  }
}
