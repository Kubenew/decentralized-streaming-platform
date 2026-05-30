import { VolunteerManager } from './VolunteerManager';

export interface TranscodeJob {
  id: string;
  inputCid: string;
  targetCodec: string;
  targetBitrate: number;
  resolution: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  assignedPeer?: string;
}

export class TranscodingCoordinator {
  private volunteers = new VolunteerManager();
  private jobs: TranscodeJob[] = [];
  private maxConcurrent = 4;

  submitJob(params: Omit<TranscodeJob, 'id' | 'status'>): string {
    const id = `transcode-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const job: TranscodeJob = { ...params, id, status: 'queued' };
    this.jobs.push(job);
    this.schedule();
    return id;
  }

  private schedule() {
    const pending = this.jobs.filter(j => j.status === 'queued');
    const running = this.jobs.filter(j => j.status === 'running');
    const slots = this.maxConcurrent - running.length;

    for (let i = 0; i < Math.min(slots, pending.length); i++) {
      const job = pending[i];
      const candidate = this.volunteers.findBest(job.targetCodec, 1)[0];
      if (candidate) {
        job.status = 'running';
        job.assignedPeer = candidate.peerId;
        this.volunteers.assignLoad(candidate.peerId, 1);
        console.log(`🎬 Transcoding ${job.id} → ${candidate.peerId} (${job.targetCodec})`);
      }
    }
  }

  completeJob(id: string) {
    const job = this.jobs.find(j => j.id === id);
    if (job) {
      job.status = 'done';
      if (job.assignedPeer) this.volunteers.releaseLoad(job.assignedPeer, 1);
      console.log(`✅ Transcode job ${id} complete`);
      this.schedule();
    }
  }

  failJob(id: string) {
    const job = this.jobs.find(j => j.id === id);
    if (job) {
      job.status = 'failed';
      if (job.assignedPeer) this.volunteers.releaseLoad(job.assignedPeer, 1);
      this.schedule();
    }
  }

  getJobs(): TranscodeJob[] {
    return this.jobs;
  }

  getVolunteerManager(): VolunteerManager {
    return this.volunteers;
  }
}
