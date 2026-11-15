import { describe, it, expect } from 'vitest';
import { slugFromEntryPath, shouldIncludeDrafts, visibleProjects } from './projects';

const p = (title: string, date: string, featured = false, draft = false) =>
  ({ data: { title, date: new Date(date), featured, draft } });

describe('slugFromEntryPath', () => {
  it('uses the folder name', () => expect(slugFromEntryPath('robotic-arm/index.md')).toBe('robotic-arm'));
  it('cleans capitals and spaces', () => expect(slugFromEntryPath('Robotic Arm/index.md')).toBe('robotic-arm'));
  it('collapses symbols', () => expect(slugFromEntryPath('  Brock -- Hackathon!/index.md')).toBe('brock-hackathon'));
});

describe('shouldIncludeDrafts', () => {
  it('dev shows drafts', () => expect(shouldIncludeDrafts({ dev: true })).toBe(true));
  it('vercel preview shows drafts', () => expect(shouldIncludeDrafts({ dev: false, vercelEnv: 'preview' })).toBe(true));
  it('vercel production hides drafts', () => expect(shouldIncludeDrafts({ dev: false, vercelEnv: 'production' })).toBe(false));
  it('local build hides drafts', () => expect(shouldIncludeDrafts({ dev: false })).toBe(false));
});

describe('visibleProjects', () => {
  it('hides drafts', () => expect(visibleProjects([p('A', '2026-01-01', false, true)], false)).toEqual([]));
  it('keeps drafts when asked', () => expect(visibleProjects([p('A', '2026-01-01', false, true)], true)).toHaveLength(1));
  it('handles an empty list', () => expect(visibleProjects([], false)).toEqual([]));
  it('orders featured, then newest, then title', () => {
    const out = visibleProjects([
      p('Old', '2024-01-01'), p('B', '2026-05-01'), p('A', '2026-05-01'), p('Star', '2023-01-01', true),
    ], false).map((x) => x.data.title);
    expect(out).toEqual(['Star', 'A', 'B', 'Old']);
  });
  it('does not mutate its input', () => {
    const input = [p('Old', '2024-01-01'), p('New', '2026-01-01')];
    visibleProjects(input, false);
    expect(input[0].data.title).toBe('Old');
  });
});
