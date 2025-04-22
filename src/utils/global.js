const getRandomKey = () => {
  return Math.random().toString(36).substring(2, 15);
};

let Global = {
  getRandomKey,
};

export default Global;
