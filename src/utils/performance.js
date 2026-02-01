// 性能优化工具类
const PerformanceUtils = {
  // 缓存 DOM 查询结果
  cache: new WeakMap(),

  // 使用 requestAnimationFrame 批量 DOM 操作
  rafQueue: new Set(),
  rafScheduled: false,

  // 获取缓存的样式或查询并缓存结果
  getCached(element, key) {
    if (!this.cache.has(element)) {
      this.cache.set(element, new Map());
    }
    return this.cache.get(element).get(key);
  },

  // 设置缓存
  setCached(element, key, value) {
    if (!this.cache.has(element)) {
      this.cache.set(element, new Map());
    }
    this.cache.get(element).set(key, value);
  },

  // 使用 RAF 批量 DOM 更新
  scheduleRAF(callback) {
    this.rafQueue.add(callback);
    if (!this.rafScheduled) {
      this.rafScheduled = true;
      requestAnimationFrame(() => {
        this.rafQueue.forEach((cb) => cb());
        this.rafQueue.clear();
        this.rafScheduled = false;
      });
    }
  },

  // 优化滚动操作，避免频繁触发
  debounceScroll(func, delay = 100) {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func(...args);
      }
    };
  },

  // 使用 CSS 类代替直接操作 style
  addClass(element, className) {
    if (!element.classList.contains(className)) {
      element.classList.add(className);
    }
  },

  removeClass(element, className) {
    if (element.classList.contains(className)) {
      element.classList.remove(className);
    }
  },
};

export default PerformanceUtils;
