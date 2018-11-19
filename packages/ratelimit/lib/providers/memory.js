class MemoryRateLimit {
  constructor (options = {}) {
    this.options = options
    this.limits = {}
  }

  check (id, limit, duration) {
    const now = Date.now()

    // If first time
    if (!this.limits[id]) {
      this.limits[id] = { used: 0, time: now }
    }

    // Get status
    const status = this.limits[id]

    // Calculate reset time
    const reset = (status.time + duration) - now

    if (reset <= 0) {
      // Time to reset
      status.used = 0
      status.time = now
      return this.check(id, limit, duration)
    }

    // Calculate remaining
    const remaining = limit - status.used

    // +1 used
    status.used++

    return { limit, remaining, reset }
  }
}

module.exports = MemoryRateLimit
