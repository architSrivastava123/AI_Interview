import {
  calculateTechnicalScore,
  calculateFluencyScore,
  calculatePaceScore,
  calculateConfidenceScore,
  calculateCommunicationScore,
  computeOverallScore,
  scoreToGrade,
} from '../../server/src/engines/scoringEngine.js';

describe('Scoring Engine (Pure Business Logic)', () => {
  describe('calculateTechnicalScore', () => {
    test('maps 0 rating to 0', () => {
      expect(calculateTechnicalScore(0)).toBe(0);
    });

    test('maps 10 rating to 100', () => {
      expect(calculateTechnicalScore(10)).toBe(100);
    });

    test('applies non-linear reward curve for intermediate scores', () => {
      const score5 = calculateTechnicalScore(5);
      const score8 = calculateTechnicalScore(8);
      expect(score5).toBeGreaterThan(50);
      expect(score8).toBeGreaterThan(80);
    });

    test('handles out of bounds and non-numeric inputs', () => {
      expect(calculateTechnicalScore(-5)).toBe(0);
      expect(calculateTechnicalScore(15)).toBe(100);
      expect(calculateTechnicalScore('invalid')).toBe(0);
    });
  });

  describe('calculateFluencyScore', () => {
    test('returns 100 for 0 filler words', () => {
      expect(calculateFluencyScore(0, 100)).toBe(100);
    });

    test('decreases score proportionally with filler word density', () => {
      const scoreLowFillers = calculateFluencyScore(2, 100); // 2% density
      const scoreHighFillers = calculateFluencyScore(10, 100); // 10% density
      expect(scoreLowFillers).toBeGreaterThan(scoreHighFillers);
      expect(scoreHighFillers).toBeLessThan(50);
    });

    test('handles 0 word count safely', () => {
      expect(calculateFluencyScore(0, 0)).toBe(100);
    });
  });

  describe('calculatePaceScore', () => {
    test('returns 100 for optimal speaking pace (110-150 WPM)', () => {
      expect(calculatePaceScore(120)).toBe(100);
      expect(calculatePaceScore(135)).toBe(100);
      expect(calculatePaceScore(150)).toBe(100);
    });

    test('returns neutral 75 for typed response (0 WPM)', () => {
      expect(calculatePaceScore(0)).toBe(75);
    });

    test('penalizes overly slow pace (< 110 WPM)', () => {
      expect(calculatePaceScore(55)).toBeLessThan(60);
      expect(calculatePaceScore(20)).toBeLessThan(30);
    });

    test('penalizes overly fast pace (> 150 WPM)', () => {
      expect(calculatePaceScore(180)).toBeLessThan(80);
    });
  });

  describe('computeOverallScore & scoreToGrade', () => {
    test('calculates composite score matching standard weights (40/20/15/15/10)', () => {
      const composite = computeOverallScore({
        technical: 80,
        fluency: 80,
        pace: 80,
        confidence: 80,
        communication: 80,
      });
      expect(composite).toBe(80);
    });

    test('maps scores to correct letter grades', () => {
      expect(scoreToGrade(96)).toBe('A+');
      expect(scoreToGrade(89)).toBe('A');
      expect(scoreToGrade(84)).toBe('A-');
      expect(scoreToGrade(78)).toBe('B+');
      expect(scoreToGrade(72)).toBe('B');
      expect(scoreToGrade(55)).toBe('C');
      expect(scoreToGrade(30)).toBe('F');
    });
  });
});
