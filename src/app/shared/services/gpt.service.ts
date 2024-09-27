import { ChatMessage } from "../models/chatmessage";

export async function chat(messageList: ChatMessage[]) {
  try {
    const result = await fetch("http://192.168.0.104:8001/api/prd/chat", {
      method: "post",
      // signal: AbortSignal.timeout(8000),https://openai.bida.ai/v1/chat/completions
      // 开启后到达设定时间会中断流式输出
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer xxxxx`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: messageList,
      }),
    });
    return result;
  } catch (error) {
    throw error;
  }
}
