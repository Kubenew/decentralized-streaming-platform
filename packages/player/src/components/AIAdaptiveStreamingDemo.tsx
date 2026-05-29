import React, { useState, useEffect, useRef } from 'react';
import { DSPNode } from '@dsp/core';
import { MeshLoader } from '@dsp/core';
import { PeerReputationManager } from '@dsp/core';

export default function AIAdaptiveStreamingDemo() {
  const [node, setNode] = useState<DSPNode | null>(null);
  const [meshLoader, setMeshLoader] = useState<MeshLoader | null>(null);
  const [reputation, setReputation] = useState<PeerReputationManager | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [bestPeers, setBestPeers] = useState<any[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const init = async () => {
      const dspNode = new DSPNode();
      await dspNode.start();

      setNode(dspNode);
      setMeshLoader(dspNode.meshLoader);
      setReputation(dspNode.reputation);

      setInterval(() => {
        if (dspNode.reputation) {
          setBestPeers(dspNode.reputation.getBestPeers(3));
        }
      }, 3000);
    };

    init();
  }, []);

  const startStreaming = async () => {
    if (!meshLoader) return;
    setIsStreaming(true);
    console.log("🚀 Starting P2P stream using best reputation peers...");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl font-bold mb-2">Nexlify</h1>
        <p className="text-emerald-400 text-xl mb-8">Decentralized AI-Powered Streaming</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <video ref={videoRef} className="w-full aspect-video bg-black" controls />

            <div className="p-6">
              <button
                onClick={startStreaming}
                disabled={isStreaming}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-semibold disabled:opacity-50"
              >
                {isStreaming ? "Streaming via P2P Mesh..." : "▶ Start Decentralized Stream"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 rounded-3xl bg-zinc-900 border border-zinc-800 p-6">
            <h3 className="text-xl font-semibold mb-4">Top Peers (by Reputation)</h3>
            <div className="space-y-3">
              {bestPeers.map((peer, i) => (
                <div key={i} className="bg-zinc-800 rounded-2xl p-4">
                  <div className="flex justify-between">
                    <code className="text-sm text-zinc-400">{peer.peerId.slice(0, 12)}...</code>
                    <span className="text-emerald-400 font-medium">{(peer.overall * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
