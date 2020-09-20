class MemoryDatabase {
  constructor({ redisClient }) {
    this.memory = redisClient;
  }

  async keys(pattern) {
    return new Promise((resolve, reject) => {
      this.memory.keys(pattern, (err, keys) => {
        if (err) {
          reject(err);
        }

        resolve(keys);
      });
    });
  }

  async set(key, value) {
    return new Promise((resolve, reject) => {
      this.memory.set(key, JSON.stringify(value), err => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.memory.get(key, (err, value) => {
        if (err) {
          reject(err);
        }

        resolve(JSON.parse(value));
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.memory.del(key, err => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }
}

module.exports = { MemoryDatabase };
