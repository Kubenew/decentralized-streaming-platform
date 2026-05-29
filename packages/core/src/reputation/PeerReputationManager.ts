import { PeerReputation, PeerStats } from '../types';

export class PeerReputationManager {
  private peers = new Map<string, PeerReputation>();
  private readonly DECAY_FACTOR = 0.95;
  private readonly WEIGHTS = {
    latency: 0.25,
    reliability: 0.35,
    throughput: 0.25,
    uptime: 0.15
  };

  updatePeerStats(peerId: string, stats: Partial<PeerStats>) {
    const now = Date.now();
    const existing = this.peers.get(peerId);

    const updated: PeerReputation = {
      peerId,
      latency: stats.latency ?? existing?.latency ?? 9999,
      reliability: stats.reliability ?? existing?.reliability ?? 0.5,
      throughput: stats.throughput ?? existing?.throughput ?? 0,
      packetLoss: stats.packetLoss ?? existing?.packetLoss ?? 0.1,
      uptime: stats.uptime ?? existing?.uptime ?? 50,
      lastSeen: now,
      connectionCount: (existing?.connectionCount ?? 0) + 1,
      overall: 0,
      latencyScore: 0,
      reliabilityScore: 0,
      throughputScore: 0,
    };

    updated.latencyScore = Math.max(0, 1 - (updated.latency / 500));
    updated.reliabilityScore = updated.reliability;
    updated.throughputScore = Math.min(1, updated.throughput / (5 * 1024 * 1024));

    updated.overall =
      updated.latencyScore * this.WEIGHTS.latency +
      updated.reliabilityScore * this.WEIGHTS.reliability +
      updated.throughputScore * this.WEIGHTS.throughput +
      (updated.uptime / 100) * this.WEIGHTS.uptime;

    this.peers.set(peerId, updated);
    return updated;
  }

  getBestPeers(count: number = 5): PeerReputation[] {
    return Array.from(this.peers.values())
      .sort((a, b) => b.overall - a.overall)
      .slice(0, count);
  }

  getPeerReputation(peerId: string): PeerReputation | null {
    return this.peers.get(peerId) || null;
  }

  decayScores() {
    for (const [id, peer] of this.peers) {
      peer.overall *= this.DECAY_FACTOR;
      peer.reliability *= this.DECAY_FACTOR;
      if (peer.overall < 0.1) this.peers.delete(id);
    }
  }

  startDecayInterval(intervalMs = 30000) {
    setInterval(() => this.decayScores(), intervalMs);
  }
}
