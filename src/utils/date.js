/**
 * 时间相关工具函数
 */

// 格式化为24小时制中国时间
export const formatChineseTime = (date = new Date()) => {
  const chinaTime = new Date(date);
  const year = chinaTime.getFullYear();
  const month = String(chinaTime.getMonth() + 1).padStart(2, "0");
  const day = String(chinaTime.getDate()).padStart(2, "0");
  const hours = String(chinaTime.getHours()).padStart(2, "0");
  const minutes = String(chinaTime.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 判断当前时间段
export const getChineseGreeting = (date = new Date()) => {
  const hours = date.getHours();

  if (hours >= 0 && hours < 6) {
    return "凌晨";
  } else if (hours >= 6 && hours < 11) {
    return "早上";
  } else if (hours >= 11 && hours < 14) {
    return "中午";
  } else if (hours >= 14 && hours < 18) {
    return "下午";
  } else {
    return "晚上";
  }
};

// 格式化为标准日期
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};
