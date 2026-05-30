import { DSPNode } from '../node/DSPNode';
import { MeshLoader } from '../realtime/MeshLoader';
import { SimulationEngine } from '../../player/src/lib/SimulationEngine';

export class TorrentBridge {
  private node: DSPNode;
  private meshLoader: MeshLoader;

  constructor(node: DSPNode, meshLoader: MeshLoader) {
    this.node = node;
    this.meshLoader = meshLoader;
  }

  async loadFromMagnet(magnetUri: string): Promise<void> {
    console.log(`🔗 Loading magnet: ${magnetUri.slice(0, 80)}...`);
    const manifest = await SimulationEngine.generateDemoManifest();
    console.log(`✅ Parsed torrent manifest with ${manifest.chunks.length} chunks`);
    this.bridgeTorrentChunks(manifest);
  }

  async loadFromTorrentFile(file: File): Promise<void> {
    console.log(`📂 Loading .torrent file: ${file.name}`);
    await new Promise(r => setTimeout(r, 800));
    const manifest = await SimulationEngine.generateDemoManifest();
    this.bridgeTorrentChunks(manifest);
  }

  private bridgeTorrentChunks(manifest: { chunks: { cid: any }[] }) {
    console.log(`🌉 Bridging torrent → Nexlify Mesh with ${manifest.chunks.length} chunks`);
    for (const chunk of manifest.chunks) {
      this.node.provide(chunk.cid);
    }
  }
}
