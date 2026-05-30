export class ErasureCoder {
  private readonly PARITY_COUNT = 4;

  encode(chunks: Uint8Array[]): { data: Uint8Array[]; parity: Uint8Array[] } {
    const data = [...chunks];
    const parity: Uint8Array[] = [];

    for (let i = 0; i < this.PARITY_COUNT; i++) {
      const p = new Uint8Array(chunks[0].length);
      for (let j = 0; j < chunks.length; j++) {
        const coeff = this.gfValue(i + 1, j + 1);
        for (let k = 0; k < p.length; k++) {
          p[k] ^= this.gfMul(chunks[j][k], coeff);
        }
      }
      parity.push(p);
    }

    return { data, parity };
  }

  decode(received: (Uint8Array | null)[], indices: number[], total: number): Uint8Array[] {
    const result: Uint8Array[] = new Array(total);
    const available = received.filter((c): c is Uint8Array => c !== null);

    for (let i = 0; i < available.length && i < total; i++) {
      result[indices[i] ?? i] = available[i];
    }

    const missing = result.findIndex(c => c === undefined);
    if (missing >= 0 && received.length >= total) {
      return available.slice(0, total);
    }

    return result;
  }

  private gfValue(row: number, col: number): number {
    return ((row + col) % 255) + 1;
  }

  private gfMul(a: number, b: number): number {
    let p = 0;
    for (let i = 0; i < 8; i++) {
      if (b & 1) p ^= a;
      const hi = a & 0x80;
      a = (a << 1) & 0xff;
      if (hi) a ^= 0x1d;
      b >>= 1;
    }
    return p;
  }

  getParityCount(): number {
    return this.PARITY_COUNT;
  }
}
