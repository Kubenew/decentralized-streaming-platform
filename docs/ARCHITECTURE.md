# Architecture

## Core Components

- libp2p networking
- WebTransport/QUIC transport
- WebRTC fallback
- CID-addressed chunks
- Adaptive bitrate mesh
- MSE playback
- Optional IPFS persistence

## Streaming Flow

1. Publisher transcodes stream into fMP4 chunks
2. Chunks hashed into CID identifiers
3. Manifest distributed via DHT
4. Peers fetch chunks from mesh
5. Player appends chunks into MSE buffer
6. AI-assisted bitrate logic adapts quality
