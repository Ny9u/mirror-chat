import { defineStore } from "pinia";

export const useHistoryStore = defineStore("history", {
  state: () => ({
    historyList: [],
    isHistoryListLoaded: false,
  }),
  actions: {
    setHistoryList(list) {
      this.historyList = list;
    },
    addToHistoryList(item) {
      this.historyList.push(item);
    },
    removeFromHistoryList(id) {
      this.historyList = this.historyList.filter((item) => item.id !== id);
    },
    updateHistoryListItem(id, updates) {
      const index = this.historyList.findIndex((item) => item.id === id);
      if (index !== -1) {
        Object.assign(this.historyList[index], updates);
      }
    },
    setHistoryListLoaded(loaded) {
      this.isHistoryListLoaded = loaded;
    },
  },
});
