import type { CID } from 'multiformats/cid';

export interface SwarmConfig {
  kuboApiUrl?: string;
  ipfsGateway?: string;
  dhtAnnounce?: boolean;
  hotTtlMs?: number;
}

export class SwarmPersister {
  private config: Required<SwarmConfig>;
  private hotCache = new Map<string, { data: Uint8Array; expires: number }>();

  constructor(config: SwarmConfig = {}) {
    this.config = {
      kuboApiUrl: config.kuboApiUrl ?? 'http://127.0.0.1:5001',
      ipfsGateway: config.ipfsGateway ?? 'https://ipfs.io/ipfs/',
      dhtAnnounce: config.dhtAnnounce ?? true,
      hotTtlMs: config.hotTtlMs ?? 300_000,
    };
  }

  async store(cid: CID, data: Uint8Array, ttl?: number): Promise<void> {
    const key = cid.toString();
    this.hotCache.set(key, {
      data,
      expires: Date.now() + (ttl ?? this.config.hotTtlMs),
    });

    if (this.config.dhtAnnounce) {
      console.log(`📢 Announcing ${key} via DHT`);
    }

    try {
      const res = await fetch(`${this.config.kuboApiUrl}/api/v0/add`, {
        method: 'POST',
        body: new Blob([data]),
      });
      if (res.ok) console.log(`📦 Pinned to Kubo: ${key}`);
    } catch {
      console.warn('⚠️ Kubo unavailable, using hot cache only');
    }
  }

  async retrieve(cid: CID): Promise<Uint8Array | null> {
    const key = cid.toString();
    const cached = this.hotCache.get(key);
    if (cached && cached.expires > Date.now()) return cached.data;

    try {
      const res = await fetch(`${this.config.ipfsGateway}${key}`);
      if (res.ok) return new Uint8Array(await res.arrayBuffer());
    } catch {
      return null;
    }

    return null;
  }

  isHot(cid: CID): boolean {
    const cached = this.hotCache.get(cid.toString());
    return cached !== undefined && cached.expires > Date.now();
  }

  prune() {
    const now = Date.now();
    for (const [key, entry] of this.hotCache) {
      if (entry.expires < now) this.hotCache.delete(key);
    }
  }
}
