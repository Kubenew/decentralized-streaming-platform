export interface Volunteer {
  peerId: string;
  capacity: number;
  supportedCodecs: string[];
  currentLoad: number;
  reliability: number;
}

export class VolunteerManager {
  private volunteers = new Map<string, Volunteer>();

  register(volunteer: Volunteer) {
    this.volunteers.set(volunteer.peerId, volunteer);
  }

  unregister(peerId: string) {
    this.volunteers.delete(peerId);
  }

  findBest(targetCodec: string, count = 3): Volunteer[] {
    return Array.from(this.volunteers.values())
      .filter(v => v.supportedCodecs.includes(targetCodec) && v.currentLoad < v.capacity)
      .sort((a, b) => (b.reliability * (b.capacity - b.currentLoad)) - (a.reliability * (a.capacity - a.currentLoad)))
      .slice(0, count);
  }

  assignLoad(peerId: string, load: number) {
    const v = this.volunteers.get(peerId);
    if (v) v.currentLoad += load;
  }

  releaseLoad(peerId: string, load: number) {
    const v = this.volunteers.get(peerId);
    if (v) v.currentLoad = Math.max(0, v.currentLoad - load);
  }

  getStats(): { active: number; totalCapacity: number; totalLoad: number } {
    const list = Array.from(this.volunteers.values());
    return {
      active: list.length,
      totalCapacity: list.reduce((s, v) => s + v.capacity, 0),
      totalLoad: list.reduce((s, v) => s + v.currentLoad, 0),
    };
  }
}
