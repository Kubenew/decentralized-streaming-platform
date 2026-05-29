# Decentralized Streaming Platform

Next-generation browser-first decentralized streaming platform using:

- libp2p
- QUIC/WebTransport
- WebRTC fallback
- CID content-addressed chunks
- Kademlia DHT discovery
- Adaptive bitrate mesh streaming
- Optional IPFS persistence
- React/Vite frontend
- Media Source Extensions (MSE)
- ffmpeg.wasm transcoding

## Features

- Browser-first architecture
- QUIC/WebTransport optimized delivery
- WebRTC DataChannel fallback
- Mesh-based adaptive chunk fetching
- Content-addressed immutable media chunks
- Peer discovery over DHT
- Optional IPFS persistence
- React player UI
- AI-assisted adaptive bitrate scaffolding

## Quick Start

```bash
pnpm install
pnpm dev
```

## Packages

- packages/core
- packages/player
- packages/transcoder
- packages/cli

## Future Ideas

- WebCodecs support
- WebTransport-native mesh
- AI peer scoring
- Distributed transcoding
- Decentralized recommendation engine
