// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

class MemoryStorage {
  getItem(key) {
    return this[key] || null;
  }

  setItem(key, value) {
    this[key] = value;
  }

  removeItem(key) {
    delete this[key];
  }
}

window.memoryStorage = window.memoryStorage || new MemoryStorage();

export default window.memoryStorage;
export { MemoryStorage };
