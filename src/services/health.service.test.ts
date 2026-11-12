import { beforeEach, describe, expect, it, vi } from 'vitest';

const { envMock, prismaMock, connectMock, socketMock } = vi.hoisted(() => ({
  envMock: { redisUrl: 'redis://localhost:6379' as string | undefined },
  prismaMock: { $queryRaw: vi.fn() },
  connectMock: vi.fn(),
  socketMock: {
    setTimeout: vi.fn(),
    once: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock('@/config', () => ({ env: envMock }));
vi.mock('./prisma.service', () => ({ prisma: prismaMock }));
vi.mock('node:net', () => ({ connect: connectMock }));
vi.mock('node:tls', () => ({ connect: vi.fn() }));

import { getReadinessStatus } from './health.service';

beforeEach(() => {
  vi.clearAllMocks();
  envMock.redisUrl = 'redis://localhost:6379';
  prismaMock.$queryRaw.mockResolvedValue([]);
  connectMock.mockReturnValue(socketMock);
  socketMock.once.mockImplementation((event: string, listener: () => void) => {
    if (event === 'error') {
      queueMicrotask(listener);
    }
    return socketMock;
  });
});

describe('readiness status', () => {
  it('is unavailable when configured Redis cannot be reached', async () => {
    const status = await getReadinessStatus();

    expect(status.status).toBe('unavailable');
    expect(status.checks).toEqual({ database: 'ok', redis: 'error' });
    expect(socketMock.destroy).toHaveBeenCalledOnce();
  });

  it('does not require Redis when it is not configured', async () => {
    envMock.redisUrl = undefined;

    const status = await getReadinessStatus();

    expect(status.status).toBe('ready');
    expect(status.checks).toEqual({ database: 'ok', redis: 'not_configured' });
  });
});
