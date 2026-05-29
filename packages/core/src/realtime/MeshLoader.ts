import { DSPNode } from '../node/DSPNode';
import { PeerReputationManager } from '../reputation/PeerReputationManager';
import { CID } from 'multiformats/cid';

export class MeshLoader {
  private node: DSPNode;
  private reputation: PeerReputationManager;

  constructor(node: DSPNode, reputation: PeerReputationManager) {
    this.node = node;
    this.reputation = reputation;
  }

  async loadChunk(cid: CID): Promise<Uint8Array | null> {
    const providers = await this.node.findProviders(cid);

    const rankedProviders = providers.sort((a, b) => {
      const scoreA = this.reputation.getPeerReputation(a.id.toString())?.overall || 0.3;
      const scoreB = this.reputation.getPeerReputation(b.id.toString())?.overall || 0.3;
      return scoreB - scoreA;
    });

    for (const provider of rankedProviders) {
      const peerId = provider.id.toString();
      try {
        const data = await this._fetchWithReputation(peerId, cid);
        if (data) {
          this.reputation.updatePeerStats(peerId, {
            reliability: 0.95,
            latency: 80,
            throughput: data.length * 100
          });
          return data;
        }
      } catch (err) {
        this.reputation.updatePeerStats(peerId, { reliability: 0.4 });
        console.warn(`Failed from peer ${peerId}`);
      }
    }
    return null;
  }

  private async _fetchWithReputation(peerId: string, cid: CID): Promise<Uint8Array> {
    const connection = await this.node.node.dial(peerId);
    const stream = await connection.newStream('/dsp/video-chunk/1.0.0');
    await stream.sink([cid.bytes]);

    const result = await stream.source.next();
    return result.value!;
  }

  async loadChunkBatch(cids: CID[]) {
    const results = new Map<string, Uint8Array>();
    const promises = cids.map(async (cid) => {
      const data = await this.loadChunk(cid);
      if (data) results.set(cid.toString(), data);
    });

    await Promise.allSettled(promises);
    return results;
  }
}
