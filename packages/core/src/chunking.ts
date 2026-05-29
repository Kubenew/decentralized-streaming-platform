import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import { fromString } from 'uint8arrays'

export interface VideoChunk {
  cid: CID
  data: Uint8Array
  index: number
  bitrate: number
  duration: number // in seconds
}

export class VideoChunker {
  // Simulate chunking a video segment
  static async createChunk(data: Uint8Array, index: number, bitrate: number): Promise<VideoChunk> {
    const hash = await sha256.digest(data)
    const cid = CID.create(1, 0x55, hash) // raw codec

    return {
      cid,
      data,
      index,
      bitrate,
      duration: 4 // typical 4-second chunk for ABR
    }
  }

  static async verifyChunk(chunk: VideoChunk): Promise<boolean> {
    const hash = await sha256.digest(chunk.data)
    return CID.create(1, 0x55, hash).equals(chunk.cid)
  }
}
