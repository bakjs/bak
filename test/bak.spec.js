const setup = require('./_setup')

describe('bak', () => {
  setup.call(this, 'basic')

  this.init()

  test('/api/hello/world', async () => {
    const res = await this.get('/api/hello/world!')
    expect(res).toBe('Hello world!')
  })

  this.stop()
})
