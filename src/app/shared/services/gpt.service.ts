import { Subject } from 'rxjs';
/**
 * 
 * @param url 
 * @param bodyParams 
 * @returns 
 */
export async function chatStream(url: string, bodyParams: Record<string, any>) {
  try {
    const result = await fetch(url, {
      method: "post",
      // signal: AbortSignal.timeout(8000),https://openai.bida.ai/v1/chat/completions
      // 开启后到达设定时间会中断流式输出
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer xxxxx`,//携带本地的token
      },
      body: JSON.stringify(bodyParams),
    });
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * 读取流数据并解析为文本内容，通过 Subject 发送解析后的内容。
 * @param reader - ReadableStreamDefaultReader<Uint8Array> 对象，用于读取流数据。
 * @param status - HTTP 响应状态码。
 * @param subject - Subject<string> 对象，用于发送解析后的内容。
 */
export async function readStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  status: number,
  subject: Subject<string>
): Promise<void> {
  let partialLine = "";

  while (true) {
    // 读取流数据
    const { value, done } = await reader.read();
    if (done) break;

    // 解码读取到的 Uint8Array 数据
    const decoder = new TextDecoder("utf-8");
    const decodedText = decoder.decode(value, { stream: true });

    // 如果状态码不是 200，解析错误信息并发送
    if (status !== 200) {
      const json = JSON.parse(decodedText);
      const content = json.error.message ?? decodedText;
      subject.error(content);
      return;
    }

    // 处理解码后的文本数据
    const chunk = partialLine + decodedText;
    const newLines = chunk.split(/\r?\n/);

    // 保留未完成的部分行
    partialLine = newLines.pop() ?? "";

    // 逐行处理新行数据
    for (const line of newLines) {
      if (line.length === 0) continue; // 忽略空行
      if (line.startsWith(":")) continue; // 忽略 SSE 注释行
      if (line === "data: [DONE]") {
        subject.complete();
        return;
      }

      try {
        // 尝试解析 JSON 数据
        const json = JSON.parse(line);
        const content = status === 200
          ? json.choices[0].delta.content ?? ""
          : json.error.message;
        subject.next(content);
      } catch (error) {
        // 处理解析错误的情况
        const json = JSON.parse(line.substring(6)); // 去掉 "data: " 前缀
        const content = status === 200
          ? json.choices[0].delta.content ?? ""
          : json.error.message;
        subject.next(content);
      }
    }
  }

  // 完成数据发送
  subject.complete();
}