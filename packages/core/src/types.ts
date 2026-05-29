export interface PeerStats {
  peerId: string;
  latency: number;
  reliability: number;
  throughput: number;
  packetLoss: number;
  uptime: number;
  lastSeen: number;
  connectionCount: number;
}

export interface PeerScore {
  overall: number;
  latencyScore: number;
  reliabilityScore: number;
  throughputScore: number;
}

export type PeerReputation = PeerStats & PeerScore;
