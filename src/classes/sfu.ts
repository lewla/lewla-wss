import * as mediasoup from 'mediasoup'
import type { types } from 'mediasoup'

export class SFU {
    public servers: Map<mediasoup.types.Worker, mediasoup.types.WebRtcServer>
    public workers: Map<string, mediasoup.types.Worker>
    public routers: Map<string, mediasoup.types.Router>
    public transports: Map<string, types.WebRtcTransport>
    public producers: Map<string, mediasoup.types.Producer>
    public consumers: Map<string, mediasoup.types.Consumer>

    constructor () {
        this.servers = new Map()
        this.workers = new Map()
        this.routers = new Map()
        this.transports = new Map()
        this.producers = new Map()
        this.consumers = new Map()
        this.init()
    }

    init (): void {
        this.createWorker().then(
            async (worker) => {
                this.workers.set('test', worker)
            }
        ).catch((error) => { console.error(error) })
    }

    public async createRouter (): Promise<mediasoup.types.Router> {
        const router = await this.workers.get('test')?.createRouter({
            mediaCodecs: [
                { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 }
            ]
        })

        if (router instanceof mediasoup.types.Router) {
            return router
        } else {
            throw Error('Error creating SFU router')
        }
    }

    protected async createWorker (): Promise<mediasoup.types.Worker> {
        const worker = await mediasoup.createWorker({
            logLevel: 'debug'
        })
        const server = await worker.createWebRtcServer({
            listenInfos: [
                { protocol: 'tcp', port: 20000, ip: '0.0.0.0', announcedAddress: process.env.PUBLIC_HOSTNAME ?? '127.0.0.1' },
                { protocol: 'udp', port: 20000, ip: '0.0.0.0', announcedAddress: process.env.PUBLIC_HOSTNAME ?? '127.0.0.1' },
            ]
        })

        this.servers.set(worker, server)

        return worker
    }
}
