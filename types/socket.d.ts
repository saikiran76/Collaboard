interface ServerToClientEvents {
  socket_draw: (moves: [number, number][], options: CtxOptions) => void;
}

interface ClientToServerEvents {
  draw: (moves: [number, number][], options: CtxOptions) => void;
}

interface CtxOptions {
  lineColor: string;
  lineWidth: number;
}
