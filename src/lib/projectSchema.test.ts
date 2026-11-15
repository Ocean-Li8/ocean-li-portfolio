import { describe, it, expect } from 'vitest';
import { z } from 'astro/zod';
import { projectSchema } from './projectSchema';

const schema = projectSchema(() => z.string());
const valid = { title: 'Arm', summary: 'A robotic arm.', date: '2026-10-01' };

describe('projectSchema', () => {
  it('accepts the smallest valid project', () => expect(schema.safeParse(valid).success).toBe(true));
  it('accepts a YAML date object', () =>
    expect(schema.safeParse({ ...valid, date: new Date('2026-10-01') }).success).toBe(true));
  it('rejects a misspelled field instead of dropping it', () =>
    expect(schema.safeParse({ ...valid, Draft: true }).success).toBe(false));
  it('rejects a misspelled link name', () =>
    expect(schema.safeParse({ ...valid, links: { repository: 'https://github.com/x/y' } }).success).toBe(false));
  it('rejects a year-only date', () => expect(schema.safeParse({ ...valid, date: 2026 }).success).toBe(false));
  it('rejects a missing title', () => expect(schema.safeParse({ summary: 'x', date: '2026-10-01' }).success).toBe(false));
});
