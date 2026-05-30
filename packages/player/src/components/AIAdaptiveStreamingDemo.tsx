import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DSPNode, MeshLoader, PeerReputationManager, TorrentBridge } from '@dsp/core';
import { MSEStreamEngine } from '../lib/MSEStreamEngine';

export default function AIAdaptiveStreamingDemo() {
  const [node, setNode] = useState<DSPNode | null>(null);
  const [meshLoader, setMeshLoader] = useState<MeshLoader | null>(null);
  const [reputation, setReputation] = useState<PeerReputationManager | null>(null);
  const [torrentBridge, setTorrentBridge] = useState<TorrentBridge | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('4K');
  const [bestPeers, setBestPeers] = useState<any[]>([]);
  const [inputMagnet, setInputMagnet] = useState('');
  const [metrics, setMetrics] = useState([
    { label: 'Bandwidth', value: '18.4 Mbps', trend: 'up' },
    { label: 'Latency', value: '24 ms', trend: 'down' },
    { label: 'Buffer Health', value: '92%', trend: 'up' },
    { label: 'AI Prediction', value: '4K Stable', trend: 'up' },
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mseRef = useRef<MSEStreamEngine | null>(null);

  useEffect(() => {
    const init = async () => {
      const dspNode = new DSPNode();
      await dspNode.start();

      setNode(dspNode);
      setMeshLoader(dspNode.meshLoader);
      setReputation(dspNode.reputation);

      if (dspNode.meshLoader) {
        setTorrentBridge(new TorrentBridge(dspNode, dspNode.meshLoader));
      }

      setInterval(() => {
        if (dspNode.reputation) {
          setBestPeers(dspNode.reputation.getBestPeers(3));
        }
      }, 3000);
    };
    init();
  }, []);

  const startStreaming = useCallback(async () => {
    if (!meshLoader || !videoRef.current) return;
    setIsStreaming(true);

    const mse = new MSEStreamEngine();
    mseRef.current = mse;
    await mse.initialize(videoRef.current);

    console.log("🚀 Starting P2P stream using best reputation peers...");
  }, [meshLoader]);

  const handleMagnetSubmit = async () => {
    if (!torrentBridge || !inputMagnet) return;
    await torrentBridge.loadFromMagnet(inputMagnet);
    setInputMagnet('');
    startStreaming();
  };

  const handleTorrentFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !torrentBridge) return;
    await torrentBridge.loadFromTorrentFile(file);
    startStreaming();
  };

  const switchQuality = (quality: string) => {
    setCurrentQuality(quality);
    setMetrics(prev => prev.map(m =>
      m.label === 'AI Prediction'
        ? { ...m, value: `${quality} • AI Switched` }
        : m
    ));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">Nexlify</h1>
          <p className="text-zinc-400 text-lg">
            Decentralized • AI-Powered • P2P Adaptive Streaming
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="aspect-video bg-black relative">
              <video ref={videoRef} className="w-full h-full" controls autoPlay muted />
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                  <button
                    onClick={startStreaming}
                    className="px-10 py-4 bg-white text-black rounded-2xl text-xl font-semibold hover:bg-emerald-400 transition"
                  >▶ Start P2P Stream</button>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-800">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((metric, i) => (
                  <div key={i} className="rounded-2xl bg-zinc-800/50 border border-zinc-700 p-4">
                    <p className="text-sm text-zinc-400">{metric.label}</p>
                    <p className="text-xl font-semibold mt-1">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6">
            <h3 className="text-2xl font-semibold mb-6">Stream Variants</h3>
            <div className="space-y-4">
              {[
                { quality: '1080p', bitrate: '6 Mbps', active: currentQuality === '1080p' },
                { quality: '1440p', bitrate: '12 Mbps', active: currentQuality === '1440p' },
                { quality: '4K', bitrate: '18 Mbps', active: currentQuality === '4K' },
              ].map((variant) => (
                <div
                  key={variant.quality}
                  onClick={() => switchQuality(variant.quality)}
                  className={`rounded-2xl p-4 cursor-pointer transition-all ${variant.active ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-700 hover:border-zinc-600'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-medium">{variant.quality}</h4>
                      <p className="text-zinc-400 text-sm">{variant.bitrate}</p>
                    </div>
                    {variant.active && <span className="text-emerald-400 text-sm">● LIVE</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-zinc-800 pt-6">
              <h3 className="text-xl font-semibold mb-4">Top Peers</h3>
              <div className="space-y-3">
                {bestPeers.map((peer, i) => (
                  <div key={i} className="bg-zinc-800 rounded-2xl p-4">
                    <div className="flex justify-between">
                      <code className="text-sm text-zinc-400">{peer.peerId?.slice(0, 12)}...</code>
                      <span className="text-emerald-400 font-medium">{(peer.overall * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6">
          <h3 className="text-2xl font-semibold mb-4">Load from Torrent</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMagnet}
                onChange={(e) => setInputMagnet(e.target.value)}
                placeholder="magnet:?xt=urn:btih:..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-sm"
              />
              <button
                onClick={handleMagnetSubmit}
                className="px-8 bg-violet-600 hover:bg-violet-700 rounded-2xl font-medium"
              >Load Magnet</button>
            </div>
            <label className="block">
              <div className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-3xl p-8 text-center cursor-pointer">
                <p className="text-lg">Drop .torrent file or click to upload</p>
                <input type="file" accept=".torrent" onChange={handleTorrentFile} className="hidden" />
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
