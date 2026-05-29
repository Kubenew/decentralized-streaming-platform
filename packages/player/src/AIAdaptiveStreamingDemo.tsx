import React, { useState, useEffect, useRef } from 'react';
import { DSPNode } from '@dsp/core';
import { MeshLoader } from '@dsp/core';
import { CID } from 'multiformats/cid';

export default function AIAdaptiveStreamingDemo() {
  const [node, setNode] = useState<DSPNode | null>(null);
  const [meshLoader, setMeshLoader] = useState<MeshLoader | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('4K');
  const [metrics, setMetrics] = useState([
    { label: 'Bandwidth', value: '18.4 Mbps', trend: 'up' },
    { label: 'Latency', value: '24 ms', trend: 'down' },
    { label: 'Buffer Health', value: '92%', trend: 'up' },
    { label: 'AI Prediction', value: '4K Stable', trend: 'up' },
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);

  // Initialize libp2p + MeshLoader
  useEffect(() => {
    const initNode = async () => {
      const dspNode = new DSPNode();
      await dspNode.start();
      setNode(dspNode);

      const loader = new MeshLoader(dspNode);
      setMeshLoader(loader);

      console.log('🎉 DSP Node & MeshLoader initialized');
    };

    initNode();

    return () => {
      node?.stop();
    };
  }, []);

  const startStreaming = async () => {
    if (!meshLoader) return;

    setIsStreaming(true);

    // Example: Simulate loading first few chunks
    const exampleCIDs = [
      CID.parse('bafkrei...example-chunk-1'), // Replace with real CIDs later
      CID.parse('bafkrei...example-chunk-2'),
    ];

    const chunks = await meshLoader.loadChunkBatch(exampleCIDs);

    console.log('Loaded chunks:', chunks.size);

    // TODO: Feed chunks into MSE (Media Source Extensions)
    initializeMSE();
  };

  const initializeMSE = () => {
    if (!videoRef.current) return;

    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;

    videoRef.current.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener('sourceopen', () => {
      const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="av01.0.08M.08"');
      sourceBufferRef.current = sourceBuffer;
      console.log('✅ MSE SourceBuffer ready for P2P chunks');
    });
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
          <h1 className="text-5xl font-bold tracking-tight">
            Nexlify
          </h1>
          <p className="text-zinc-400 text-lg">
            Decentralized • AI-Powered • P2P Adaptive Streaming
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="aspect-video bg-black relative">
              <video 
                ref={videoRef}
                className="w-full h-full"
                controls
                autoPlay
                muted
              />
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                  <button
                    onClick={startStreaming}
                    className="px-10 py-4 bg-white text-black rounded-2xl text-xl font-semibold hover:bg-emerald-400 transition"
                  >
                    ▶ Start P2P Stream
                  </button>
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

          {/* Quality Variants */}
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
                  className={`rounded-2xl p-4 cursor-pointer transition-all ${
                    variant.active ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-700 hover:border-zinc-600'
                  }`}
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
          </div>
        </div>
      </div>
    </div>
  );
}
