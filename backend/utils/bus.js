// In-process SSE fan-out. Correct for a single-node deployment;
// would need Postgres LISTEN/NOTIFY or Redis pub/sub to survive scale-out.
const clients = new Set();

export function addClient(client) {
  clients.add(client);
}

export function removeClient(client) {
  clients.delete(client);
}

export function broadcast(event, payload) {
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const c of clients) {
    try {
      c.res.write(data);
    } catch {
      clients.delete(c);
    }
  }
}