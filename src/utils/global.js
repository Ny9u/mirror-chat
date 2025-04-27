import _ from "lodash";
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
    }
  }
  return obj;
};

let Global = {
  getRandomKey,
  sortThinkingMessages,
};

export default Global;
