import { api } from "@/config/api";

export const chat = async (messageData, onChunk, onComplete, onError) => {
  const response = await fetch(api.chat, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    },
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result = {
    reasoningContent: "",
    content: "",
    chatId: "",
  };

  return new Promise((resolve, reject) => {
    const read = () => {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) {
            if (onComplete) onComplete(result);
            resolve();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.reasoningContent) {
                  result.reasoningContent += data.reasoningContent;
                }
                if (data.content) {
                  result.content += data.content;
                }
                if (data.chatId) {
                  result.chatId = data.chatId;
                }
                if (onChunk) onChunk(data);
              } catch (e) {
                console.error("解析数据失败:", e);
              }
            }
          }

          buffer = lines[lines.length - 1];
          read();
        })
        .catch((error) => {
          if (onError) onError(error);
          reject(error);
        });
    };

    read();
  });
};
