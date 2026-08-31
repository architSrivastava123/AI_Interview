import { cosineSimilarity, searchSimilarVectors } from '../../server/src/rag/vectorStore/vectorStore.js';

describe('Vector Store & Cosine Similarity', () => {
  test('calculates exact cosine similarity for identical vectors (1.0)', () => {
    const vecA = [1, 2, 3, 4];
    const vecB = [1, 2, 3, 4];
    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0, 5);
  });

  test('calculates 0 for orthogonal vectors', () => {
    const vecA = [1, 0];
    const vecB = [0, 1];
    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(0.0, 5);
  });

  test('correctly ranks documents by similarity score', () => {
    const query = [1, 1, 0];
    const docs = [
      { id: '1', title: 'Doc A', embedding: [1, 1, 0] },     // exact match
      { id: '2', title: 'Doc B', embedding: [1, 0, 0] },     // partial match
      { id: '3', title: 'Doc C', embedding: [0, 0, 1] },     // orthogonal
    ];

    const results = searchSimilarVectors(query, docs, 2);
    expect(results.length).toBe(2);
    expect(results[0].document.id).toBe('1');
    expect(results[0].score).toBeCloseTo(1.0, 5);
    expect(results[1].document.id).toBe('2');
  });

  test('applies metadata filter function properly', () => {
    const query = [1, 1, 0];
    const docs = [
      { id: '1', topic: 'React', embedding: [1, 1, 0] },
      { id: '2', topic: 'Node', embedding: [1, 1, 0] },
    ];

    const results = searchSimilarVectors(query, docs, 2, (d) => d.topic === 'Node');
    expect(results.length).toBe(1);
    expect(results[0].document.id).toBe('2');
  });
});
