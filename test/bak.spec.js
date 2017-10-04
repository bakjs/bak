const setup = require('./_setup')

describe('bak', async () => {
  setup.call(this, 'basic')

  test('/api/hello', async () => {
    const res = await this.get('/api/hello/world!')
    expect(res).toBe('Hello world!')
  })
})
