import { computeSkillGaps } from '../../server/src/engines/skillGapEngine.js';

describe('Skill Gap Engine', () => {
  test('evaluates scores against Frontend benchmarks and assigns status correctly', () => {
    const scores = {
      technical: 85,    // target 75 -> gap +10 -> strong
      fluency: 70,      // target 70 -> gap 0 -> on-track
      pace: 60,         // target 70 -> gap -10 -> needs-work
      confidence: 50,   // target 72 -> gap -22 -> critical
      communication: 75,// target 73 -> gap +2 -> on-track
    };

    const gaps = computeSkillGaps(scores, 'Frontend');

    const techGap = gaps.find(g => g.dimension === 'technical');
    expect(techGap.status).toBe('strong');
    expect(techGap.gap).toBe(10);

    const paceGap = gaps.find(g => g.dimension === 'pace');
    expect(paceGap.status).toBe('needs-work');
    expect(paceGap.gap).toBe(-10);

    const confGap = gaps.find(g => g.dimension === 'confidence');
    expect(confGap.status).toBe('critical');
    expect(confGap.gap).toBe(-22);
  });

  test('falls back to General role when unknown role is provided', () => {
    const gaps = computeSkillGaps({ technical: 70, fluency: 70, pace: 70, confidence: 70, communication: 70 }, 'UnknownRole');
    expect(gaps.length).toBe(5);
    expect(gaps.every(g => g.status === 'on-track')).toBe(true);
  });
});
