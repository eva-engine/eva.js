import {
  PeeringBitIndex,
  NO_NEIGHBOR,
  pickAutotileCandidate,
  NEIGHBOR_DIRECTIONS,
  type AutotileCandidate,
  type PeeringBitsRecord,
} from '../lib/peering-bit-index';

function cand(over: Partial<AutotileCandidate>): AutotileCandidate {
  return {
    sourceSlot: 1,
    col: 0,
    row: 0,
    altIdx: 0,
    probability: 1,
    terrain: 0,
    ...over,
  };
}

function fullBits(...vals: number[]): PeeringBitsRecord {
  const bits: PeeringBitsRecord = {};
  for (let i = 0; i < 8; i++) bits[NEIGHBOR_DIRECTIONS[i]!] = vals[i] ?? 0;
  return bits;
}

describe('PeeringBitIndex / exact match', () => {
  it('hashes full-exact tiles into the exact bucket', () => {
    const idx = new PeeringBitIndex(0);
    idx.add(cand({ col: 1, row: 0 }), fullBits(1, 1, 1, 1, 1, 1, 1, 1));
    expect(idx.exactBucketCount).toBe(1);
    expect(idx.wildcardCount).toBe(0);
  });

  it('returns exact match in O(1)', () => {
    const idx = new PeeringBitIndex(0);
    idx.add(cand({ col: 0, row: 0 }), fullBits(0, 0, 0, 0, 0, 0, 0, 0));
    idx.add(cand({ col: 1, row: 0 }), fullBits(1, 1, 1, 1, 1, 1, 1, 1));
    const result = idx.match([1, 1, 1, 1, 1, 1, 1, 1]);
    expect(result.exactMatch).toBe(true);
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]!.col).toBe(1);
  });

  it('handles ambiguous exact matches (returns all candidates with same key)', () => {
    const idx = new PeeringBitIndex(0);
    idx.add(cand({ col: 0, row: 0, altIdx: 0, probability: 2 }), fullBits(1, 1, 1, 1, 1, 1, 1, 1));
    idx.add(cand({ col: 0, row: 0, altIdx: 1, probability: 1 }), fullBits(1, 1, 1, 1, 1, 1, 1, 1));
    const result = idx.match([1, 1, 1, 1, 1, 1, 1, 1]);
    expect(result.candidates).toHaveLength(2);
  });
});

describe('PeeringBitIndex / wildcard fallback', () => {
  it('places tiles with partial bits into the wildcard list', () => {
    const idx = new PeeringBitIndex(0);
    idx.add(cand({ col: 0, row: 0 }), { top: 1, bottom: 1 });
    expect(idx.exactBucketCount).toBe(0);
    expect(idx.wildcardCount).toBe(1);
  });

  it('matches an actual neighborhood compatible with the partial bits', () => {
    const idx = new PeeringBitIndex(0);
    idx.add(cand({ col: 0, row: 0 }), { top: 1, bottom: 1 });
    const result = idx.match([0, 1, 0, 0, 0, 1, 0, 0]); // top=1 bottom=1, rest=0
    expect(result.candidates).toHaveLength(1);
    expect(result.bestHammingDistance).toBe(0);
  });

  it('returns best Hamming distance when no zero-distance match exists', () => {
    const idx = new PeeringBitIndex(0);
    idx.add(cand({ col: 0, row: 0 }), { top: 1, right: 1 });
    const result = idx.match([0, 2, 0, 1, 0, 0, 0, 0]); // top=2 (mismatch) right=1 (ok)
    expect(result.candidates).toHaveLength(1);
    expect(result.bestHammingDistance).toBe(1);
  });

  it('returns empty when no candidate has any bits at all', () => {
    const idx = new PeeringBitIndex(0);
    const result = idx.match([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(result.candidates).toHaveLength(0);
  });
});

describe('pickAutotileCandidate', () => {
  it('returns null on empty candidate list', () => {
    expect(pickAutotileCandidate([], () => 0)).toBeNull();
  });

  it('returns the single candidate without consuming rng', () => {
    let called = 0;
    const rng = () => {
      called++;
      return 0;
    };
    expect(pickAutotileCandidate([cand({ col: 1 })], rng)?.col).toBe(1);
    expect(called).toBe(0);
  });

  it('picks deterministically with a seeded rng', () => {
    const candidates = [cand({ col: 0, probability: 1 }), cand({ col: 1, probability: 1 }), cand({ col: 2, probability: 1 })];
    const picks = [0.0, 0.34, 0.67, 0.99].map((t) => pickAutotileCandidate(candidates, () => t)?.col);
    expect(picks).toEqual([0, 1, 2, 2]);
  });

  it('respects probability weights', () => {
    const candidates = [cand({ col: 0, probability: 9 }), cand({ col: 1, probability: 1 })];
    // total = 10, t=0.5 → col 0 (acc 9 > 5); t=0.95 → col 1 (acc 10 > 9.5)
    expect(pickAutotileCandidate(candidates, () => 0.5)?.col).toBe(0);
    expect(pickAutotileCandidate(candidates, () => 0.95)?.col).toBe(1);
  });
});

describe('NO_NEIGHBOR sentinel', () => {
  it('is nibble-sized so packed key fits in a 32-bit number', () => {
    expect(NO_NEIGHBOR).toBeLessThanOrEqual(0xf);
    expect(NO_NEIGHBOR & 0xf).toBe(NO_NEIGHBOR);
  });
});
