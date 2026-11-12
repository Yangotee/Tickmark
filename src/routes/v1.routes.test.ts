/**
 * v1 router mount regression tests (#867) — every feature router must be
 * mounted exactly once so no request can hit two handlers for one path.
 */

import { describe, expect, it } from 'vitest';

import { v1Router } from './v1.routes';

interface RouterLayer {
  readonly matchers?: readonly ((path: string) => false | { path: string })[];
}

function mountedPathCount(path: string): number {
  const stack = (v1Router as unknown as { stack?: RouterLayer[] }).stack ?? [];
  return stack.filter((layer) => layer.matchers?.some((matcher) => matcher(path) !== false)).length;
}

describe('v1Router mounts (#867)', () => {
  it('mounts /categories exactly once', () => {
    expect(mountedPathCount('/categories')).toBe(1);
  });

  it('mounts every feature path exactly once', () => {
    const featurePaths = [
      '/health',
      '/auth',
      '/users',
      '/profiles',
      '/portfolios',
      '/artworks',
      '/marketplace',
      '/search',
      '/categories',
      '/media',
      '/tags',
      '/orders',
      '/payments',
      '/commissions',
      '/reviews',
      '/threads',
      '/messages',
      '/notifications',
      '/admin',
      '/stats',
      '/analytics',
    ];

    for (const path of featurePaths) {
      expect(mountedPathCount(path), `${path} should be mounted exactly once`).toBe(1);
    }
  });
});
