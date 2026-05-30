import { createLibp2p } from 'libp2p'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { webTransport } from '@libp2p/webtransport'
import { webRTC } from '@libp2p/webrtc'
import { kadDHT } from '@libp2p/kad-dht'
import { identify } from '@libp2p/identify'
import { CID } from 'multiformats/cid'
import { PeerReputationManager } from '../reputation/PeerReputationManager'
import { PredictivePeerScorer } from '../reputation/PredictivePeerScorer'
import { MeshLoader } from '../realtime/MeshLoader'
import { RelayManager } from '../realtime/RelayManager'
import { WebCodecsPipeline } from '../realtime/WebCodecsPipeline'
import { ErasureCoder } from '../realtime/ErasureCoder'
import { SwarmPersister } from '../persistence/SwarmPersister'
import type { TransportAdapter } from '../transport/TransportAdapter'
import { WebTransportAdapter } from '../transport/WebTransportAdapter'
import { WebRTCAdapter } from '../transport/WebRTCAdapter'

export class DSPNode {
  public node: any
  public peerId: string = ''
  public reputation: PeerReputationManager
  public predictiveScorer: PredictivePeerScorer
  public meshLoader: MeshLoader | null = null
  public relayManager: RelayManager
  public webCodecs: WebCodecsPipeline
  public erasureCoder: ErasureCoder
  public swarm: SwarmPersister
  public transports: TransportAdapter[] = []

  constructor() {
    this.reputation = new PeerReputationManager()
    this.predictiveScorer = new PredictivePeerScorer()
    this.relayManager = new RelayManager(this)
    this.webCodecs = new WebCodecsPipeline()
    this.erasureCoder = new ErasureCoder()
    this.swarm = new SwarmPersister()
  }

  async start() {
    this.node = await createLibp2p({
      addresses: {
        listen: ['/webtransport/ceramic', '/webrtc']
      },
      transports: [webTransport(), webRTC()],
      connectionEncryption: [noise()],
      streamMuxers: [yamux()],
      services: {
        dht: kadDHT({ clientMode: true, protocol: '/dsp/kad/1.0.0' }),
        identify: identify()
      }
    })

    await this.node.start()
    this.peerId = this.node.peerId.toString()

    this.reputation.startDecayInterval()
    this.meshLoader = new MeshLoader(this, this.reputation)
    await this.webCodecs.initialize()

    this.transports = [
      new WebTransportAdapter(),
      new WebRTCAdapter(),
    ]

    console.log(`🚀 DSP Node started with Peer ID: ${this.peerId}`)

    this.node.addEventListener('peer:discovery', (evt: any) => {
      console.log('Discovered peer:', evt.detail.id.toString())
    })

    this.node.addEventListener('peer:connect', (evt: any) => {
      console.log('Connected to peer:', evt.detail.toString())
    })

    return this
  }

  async stop() {
    await this.node?.stop()
    this.webCodecs.destroy()
  }

  async findProviders(cid: CID) {
    const providers = []
    for await (const provider of this.node.services.dht.findProviders(cid)) {
      providers.push(provider)
    }
    return providers
  }

  async provide(cid: CID) {
    await this.node.services.dht.provide(cid)
  }
}
