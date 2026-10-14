import { handleRequest } from "../../src/handle_request.js";

// 包装层：修一个上游 bug（2026-10-14 定位）
//
//   src/openai.mjs 的 fixCors() 会把 Google 的响应头整份抄给客户端，
//   其中包括 content-encoding: gzip。但正文那边已经被 fetch 自动解开了
//   （await response.text()），于是变成「头说 gzip、正文是明文」。
//   任何按头解压的客户端 —— Node 的 fetch、浏览器、curl --compressed ——
//   都会报 Z_DATA_ERROR / "incorrect header check"。
//   跑在 Node 上的机器人正好就是这种客户端。
export default async (req, context) => {
  const res = await handleRequest(req);
  const headers = new Headers(res.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
};
