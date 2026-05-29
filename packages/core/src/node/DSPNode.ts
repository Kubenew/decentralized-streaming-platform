import { createLibp2p } from 'libp2p'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { webTransport } from '@libp2p/webtransport'
import { webRTC } from '@libp2p/webrtc'
import { kadDHT } from '@libp2p/kad-dht'
import { identify } from '@libp2p/identify'
import { CID } from 'multiformats/cid'
import { PeerReputationManager } from '../reputation/PeerReputationManager'
import { MeshLoader } from '../realtime/MeshLoader'
import { RelayManager } from '../realtime/RelayManager'

export class DSPNode {
  public node: any
  public peerId: string = ''
  public reputation: PeerReputationManager
  public meshLoader: MeshLoader | null = null
  public relayManager: RelayManager

  constructor() {
    this.reputation = new PeerReputationManager()
    this.relayManager = new RelayManager(this)
  }

  async start() {
    this.node = await createLibp2p({
      addresses: {
        listen: [
          '/webtransport/ceramic',
          '/webrtc'
        ]
      },
      transports: [
        webTransport(),
        webRTC()
      ],
      connectionEncryption: [noise()],
      streamMuxers: [yamux()],
      services: {
        dht: kadDHT({
          clientMode: true,
          protocol: '/dsp/kad/1.0.0'
        }),
        identify: identify()
      }
    })

    await this.node.start()
    this.peerId = this.node.peerId.toString()

    this.reputation.startDecayInterval()
    this.meshLoader = new MeshLoader(this, this.reputation)

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
