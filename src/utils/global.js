import _ from "lodash";
import Models from "@/config/models.js";

const getRandomKey = () => {
  return Math.random().toString(36).substring(2, 15);
};

const sortThinkingMessages = (chatHistory) => {
  let obj = _.cloneDeep(chatHistory);
  for (let i = 0; i < obj.length; i++) {
    if (Array.isArray(obj[i].content)) {
      let arr = obj[i].content;
      for (let j = 0; j < arr.length; j++) {
        if (arr[j].type === "thinking") continue;
        obj[i].content = arr[j].data;
      }
      if (typeof obj[i].content !== "string") {
        obj[i].content = JSON.stringify(obj[i].content);
      }
    }
  }
  return obj;
};

const getInitials = (name) => {
  if (!name) return "U";
  const initials = name.charAt(0).toUpperCase();
  return initials;
};

const isEnableThinkingMode = (model) => {
  const config = Models.find((m) => m.key === model);
  return config?.thinkingMode || false;
};

let Global = {
  getRandomKey,
  sortThinkingMessages,
  getInitials,
  isEnableThinkingMode,
};

export default Global;
