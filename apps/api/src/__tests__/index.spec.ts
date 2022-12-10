import app from '@/app';

describe('APIs', () => {
  it('/', async () => {
    const res = await app.request('http://localhost').then((r) => r.text());
    expect(res).toBe('Hello Hono!');
  });
});
