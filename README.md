# Nexlify

**Next-Gen Decentralized AI-Powered Streaming Platform**

A browser-first, P2P adaptive video streaming system built with **libp2p**, **WebTransport (QUIC)**, **WebRTC fallback**, **AI-driven bitrate prediction**, and **reputation-aware mesh networking**.

---

## Vision

A truly decentralized streaming platform that rivals centralized services in quality while being:
- Censorship-resistant
- AI-adaptive
- Low-latency
- Scalable through intelligent mesh + super peers

---

## Quick Start

```bash
git clone https://github.com/Kubenew/decentralized-streaming-platform.git
cd decentralized-streaming-platform
pnpm install
cd packages/core && pnpm build && cd ..
cd packages/player && pnpm dev
```

Open http://localhost:5173 — Click "Start P2P Stream" to test the mesh.

## Architecture

### Core Layers

- **node/** — libp2p node with WebTransport + WebRTC
- **realtime/** — Reputation-aware MeshLoader
- **reputation/** — Peer scoring & ranking system
- **manifest/** — CID-based adaptive manifests (HLS/DASH style)
- **relay/** — Super Peer & circuit relay support
- **torrent/** — Magnet link & .torrent bridge
- **player/** — React + MSE + WebCodecs-ready frontend

### Key Features

- AI-Assisted Adaptive Bitrate (predictive switching)
- Peer Reputation System (latency, reliability, throughput)
- Multi-source chunk striping
- WebTransport (QUIC) primary transport
- Media Source Extensions (MSE) pipeline
- Hybrid super-peer architecture
- Magnet link & .torrent file support

## Project Structure

```
/
├── packages/
│   ├── core/           Core P2P + reputation engine
│   └── player/         React streaming interface
├── protocols/          Custom mesh protocols
└── docs/
```

## Tech Stack

- **Networking:** libp2p, WebTransport, WebRTC
- **Streaming:** MSE, WebCodecs (planned), fMP4
- **Frontend:** React + Vite + Tailwind
- **Content Addressing:** Multiformats (CIDv1)
- **Language:** TypeScript

## License

Apache-2.0

Built with passion for a freer internet.
