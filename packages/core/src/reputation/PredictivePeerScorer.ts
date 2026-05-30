export interface ScoreInput {
  latency: number;
  bandwidth: number;
  packetLoss: number;
  historicalReliability: number;
  chunkAvailability: number;
}

export interface Prediction {
  congestionRisk: number;
  failureRisk: number;
  suggestedBitrate: number;
}

export class PredictivePeerScorer {
  private history = new Map<string, number[]>();
  private readonly ALPHA = 0.3;

  score(input: ScoreInput): number {
    const latencyScore = Math.max(0, 1 - input.latency / 500);
    const bandwidthScore = Math.min(1, input.bandwidth / (50 * 1024 * 1024));
    const lossScore = 1 - input.packetLoss;
    const reliabilityScore = input.historicalReliability;
    const availabilityScore = input.chunkAvailability;

    return (
      latencyScore * 0.20 +
      bandwidthScore * 0.25 +
      lossScore * 0.20 +
      reliabilityScore * 0.20 +
      availabilityScore * 0.15
    );
  }

  predict(peerId: string, recentScores: number[]): Prediction {
    const smoothed = this.ema(recentScores, this.ALPHA);
    this.history.set(peerId, smoothed);

    const slope = smoothed.length > 1
      ? smoothed[smoothed.length - 1] - smoothed[smoothed.length - 2]
      : 0;

    const congestionRisk = slope < -0.05 ? Math.min(1, Math.abs(slope) * 5) : 0;
    const failureRisk = smoothed[smoothed.length - 1] < 0.3 ? 0.8 : 0.1;
    const suggestedBitrate = smoothed[smoothed.length - 1] > 0.7 ? 18_000_000 : 6_000_000;

    return { congestionRisk, failureRisk, suggestedBitrate };
  }

  private ema(values: number[], alpha: number): number[] {
    const result: number[] = [];
    let prev = values[0] ?? 0;
    for (const v of values) {
      prev = alpha * v + (1 - alpha) * prev;
      result.push(prev);
    }
    return result;
  }

  getPredictionTrend(peerId: string): number[] {
    return this.history.get(peerId) ?? [];
  }
}
