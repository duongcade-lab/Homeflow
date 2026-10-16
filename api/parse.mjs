/* HomeFlow — serverless LLM parser for "Nói với HomeFlow".
   Runs server-side on Vercel. Calls Google Gemini via the AI SDK.
   The GEMINI_API_KEY env var never leaves the server. */

import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const MODELS = (process.env.HOME_FLOW_MODEL || "gemini-3.8-flash,gemini-3.5-flash,gemini-2.5-flash-lite")
  .split(",").map((s) => s.trim()).filter(Boolean);
const TODAY = 4; // thứ 6 — matches the demo calendar

const DAY_MAP = {
  "thứ 2": 0, "thứ 3": 1, "thứ 4": 2, "thứ 5": 3, "thứ 6": 4,
  "thứ 7": 5, "chủ nhật": 6, "hôm nay": TODAY, "cuối tuần": 6,
};

const ItemSchema = z.object({
  kind: z.enum(["event", "task"]),
  title: z.string().min(2).max(80),
  day: z.enum(["thứ 2", "thứ 3", "thứ 4", "thứ 5", "thứ 6", "thứ 7", "chủ nhật", "hôm nay", "cuối tuần"]),
  time: z.string().regex(/^\d{1,2}:\d{2}$/).nullable(),
  cat: z.enum(["home", "school", "bill", "event"]),
  emoji: z.string().max(8),
  planning: z.string().max(10),
  doers: z.array(z.string().max(10)).min(1).max(4),
});
const ResultSchema = z.object({
  items: z.array(ItemSchema).min(1).max(6),
  summary: z.string().max(200),
});

function normalizeTime(t) {
  const [h, m] = t.split(":");
  return `${String(+h).padStart(2, "0")}:${m}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Bad JSON body" });
  }
  const text = String(body?.text || "").trim();
  const members = Array.isArray(body?.members)
    ? body.members.filter((m) => m && typeof m.id === "string" && typeof m.name === "string")
    : [];
  if (!text) return res.status(400).json({ error: "Missing text" });

  const roster = members.length
    ? members
    : [
        { id: "me", name: "Mẹ", role: "Lan" },
        { id: "bo", name: "Bố", role: "Minh" },
        { id: "bin", name: "Bạn lớn", role: "Bin" },
        { id: "su", name: "Bạn nhỏ", role: "Su" },
      ];
  const rosterLine = roster
    .map((m) => `- ${m.id}: ${m.name}${m.role && m.role !== m.name ? ` (biệt danh: ${m.role})` : ""}`)
    .join("\n");
  const validIds = new Set([...roster.map((m) => m.id), "all"]);

  const system = `Bạn là HomeFlow, trợ lý gia đình thân thiện của một gia đình Việt Nam. Nhiệm vụ: nghe câu nói tự nhiên của cả nhà và chuyển thành việc cần sắp xếp.

Thành viên gia đình (dùng đúng id trong cột đầu):
${rosterLine}

Nguyên tắc của HomeFlow:
- Mỗi việc có "planning" (người NGHĨ VÀ LO: lên kế hoạch, chuẩn bị, nhắc nhở) và "doers" (người LÀM) — hai vai trò có thể khác nhau. Cha mẹ thường đảm nhận việc lo lắng, con cái làm việc phù hợp lứa tuổi.
- Phân chia công bằng, phù hợp lứa tuổi, giảm gánh nặng tinh thần cho cha mẹ.
- "event" = sự kiện có giờ cụ thể (lớp học, khám bệnh, sinh nhật...). "task" = việc cần làm chung.
- day: dùng "thứ 2".."thứ 7", "chủ nhật"; nếu không rõ ngày dùng "hôm nay"; nếu nói cuối tuần dùng "cuối tuần".
- time: định dạng "HH:MM" (ví dụ "14:00"), chỉ khi có giờ cụ thể, ngược lại null. Buổi chiều/tối nhớ cộng 12 giờ ("chiều 2h" = "14:00").
- emoji: chọn emoji phù hợp với việc.
- title: tiếng Việt tự nhiên, ngắn gọn, viết hoa chữ cái đầu, nêu rõ tên người/việc (ví dụ "Bo đi công viên", "Mua quà sinh nhật bà").
- Luôn trả về ít nhất 1 việc. Nếu không hiểu câu nói, tạo 1 task chung "Việc cần làm".
- summary: tóm tắt 1 câu tự nhiên bằng tiếng Việt về những việc vừa tạo, ngắn gọn ấm áp (tối đa 200 ký tự).
Trả về đúng JSON schema.`;

  try {
    let object = null;
    let lastErr = null;
    for (const m of MODELS) {
      try {
        const provider = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
        const r = await generateObject({
          model: provider(m),
          schema: ResultSchema,
          system,
          prompt: text,
          temperature: 0.3,
          maxRetries: 1,
        });
        object = r.object;
        break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (!object) throw lastErr || new Error("no model available");

    const items = object.items
      .map((it) => ({
        kind: it.kind,
        title: it.title.trim(),
        day: DAY_MAP[it.day] ?? TODAY,
        time: it.time && /^\d{1,2}:\d{2}$/.test(it.time) ? normalizeTime(it.time) : null,
        cat: it.cat,
        emoji: it.emoji || "📌",
        planning: validIds.has(it.planning) && it.planning !== "all" ? it.planning : "me",
        doers: it.doers.filter((d) => validIds.has(d)),
      }))
      .filter((it) => it.title && it.doers.length);

    if (!items.length) {
      return res.status(422).json({ error: "Không hiểu được câu này" });
    }
    return res.status(200).json({ items, summary: object.summary || "" });
  } catch (err) {
    const sanitize = (s) => String(s).replace(/[A-Za-z0-9_-]{20,}/g, "[redacted]");
    const status = err && typeof err.status === "number" ? err.status : "";
    const msg = sanitize(err instanceof Error ? err.message : String(err));
    console.error("[HomeFlow] LLM parse failed:", status, msg);
    const keySet = !!process.env.GEMINI_API_KEY;
    return res.status(500).json({
      error: "AI Gateway temporarily unavailable",
      detail: keySet ? `${status} ${msg}` : "GEMINI_API_KEY not set",
    });
  }
}