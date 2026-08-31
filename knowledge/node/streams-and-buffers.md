---
source: "node-streams-and-buffers.md"
topic: "Node.js"
difficulty: "hard"
role: "backend,fullstack"
technology: "Node.js"
title: "Node.js Streams, Buffers, and Memory Efficient I/O"
---

# Node.js Streams, Buffers, and Memory Efficient I/O

Streams are collections of data that might not be available all at once and don't have to fit in memory. Buffers represent fixed-length sequences of raw binary bytes allocated outside the V8 heap.

## Types of Streams
1. **Readable**: Sources of data (e.g., `fs.createReadStream`, HTTP incoming request `req`).
2. **Writable**: Destinations for data (e.g., `fs.createWriteStream`, HTTP response `res`).
3. **Duplex**: Both Readable and Writable (e.g., TCP `net.Socket`).
4. **Transform**: Duplex stream that modifies or transforms data as it is written and read (e.g., `zlib.createGzip`, crypto cipher).

## Backpressure Handling
- Backpressure occurs when the consumer (writable) is slower than the producer (readable).
- `readable.pipe(writable)` automatically handles backpressure by pausing reads when `writable.write()` returns `false` and resuming when the `'drain'` event fires.
- In modern Node.js, `pipeline(source, transform, destination, callback)` or `stream/promises` is preferred to handle error propagation safely and avoid memory leaks.
