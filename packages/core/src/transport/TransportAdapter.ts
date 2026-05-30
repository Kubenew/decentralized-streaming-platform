export interface TransportAdapter {
  readonly name: string;
  connect(addr: string): Promise<void>;
  send(data: Uint8Array): Promise<void>;
  receive(): AsyncGenerator<Uint8Array>;
  latency(): number;
  close(): Promise<void>;
}
