import { CID } from 'multiformats/cid';

export interface ChunkInfo {
  cid: CID;
  index: number;
  duration: number;
  bitrate: number;
  size: number;
}

export interface VideoManifest {
  id: string;
  title: string;
  version: string;
  createdAt: number;
  totalDuration: number;
  variants: BitrateVariant[];
  chunks: ChunkInfo[];
  metadata: {
    codec: string;
    resolution: string;
    fps?: number;
    audioTracks?: string[];
    subtitles?: string[];
  };
  signature?: string;
}

export interface BitrateVariant {
  quality: string;
  bitrate: number;
  chunks: ChunkInfo[];
}

export class ManifestManager {
  static createManifest(
    title: string,
    chunks: ChunkInfo[],
    variants: BitrateVariant[]
  ): VideoManifest {
    return {
      id: `nexlify-${Date.now()}`,
      title,
      version: '1.0.0',
      createdAt: Date.now(),
      totalDuration: chunks.reduce((sum, c) => sum + c.duration, 0),
      variants,
      chunks,
      metadata: {
        codec: 'av01',
        resolution: '2160p'
      }
    };
  }

  static getChunkByIndex(manifest: VideoManifest, index: number): ChunkInfo | undefined {
    return manifest.chunks.find(c => c.index === index);
  }
}
