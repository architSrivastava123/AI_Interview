import { analyzeSpeech } from '../../server/src/engines/speechEngine.js';

describe('Speech Engine', () => {
  test('calculates correct word count and WPM for timed transcript', () => {
    const text = 'React uses a virtual DOM to optimize rendering performance across component updates.';
    const result = analyzeSpeech(text, 6); // 12 words in 6 seconds = 120 WPM

    expect(result.wordCount).toBe(12);
    expect(result.wpm).toBe(120);
    expect(result.fillerCount).toBe(0);
    expect(result.fillerWords).toEqual([]);
  });

  test('identifies multiple filler words accurately', () => {
    const text = 'So like basically we use um React hooks and you know useEffect for side effects.';
    const result = analyzeSpeech(text, 10);

    expect(result.fillerCount).toBe(4);
    expect(result.fillerWords).toContain('like');
    expect(result.fillerWords).toContain('basically');
    expect(result.fillerWords).toContain('um');
    expect(result.fillerWords).toContain('you know');
    expect(result.fillerDensity).toBeGreaterThan(0.2);
  });

  test('handles empty text gracefully', () => {
    const result = analyzeSpeech('', 0);
    expect(result.wordCount).toBe(0);
    expect(result.wpm).toBe(0);
    expect(result.fillerCount).toBe(0);
  });
});
