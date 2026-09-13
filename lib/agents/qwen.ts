/**
 * Thin wrapper around the Qwen chat-completions API (OpenAI-compatible schema).
 *
 * Design decision: every caller treats a `null` return as "fall back to the
 * local rule-based reasoning". This means the entire product works perfectly
 * with ZERO configuration (no API key needed for a live demo), and gets
 * strictly better if a QWEN_API_KEY is provided in `.env.local`.
 *
 * In a production deployment, this file is also the seam where you would
 * swap in an EnterPro-managed model endpoint instead of calling the API
 * directly — the rest of the codebase never talks to Qwen directly, it only
 * ever calls `qwenComplete()`.
 */

export async function qwenComplete(prompt: string): Promise<string | null> {
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) return null;

  const baseUrl = process.env.QWEN_API_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
  const model = process.env.QWEN_MODEL || 'qwen-plus';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn('Qwen API returned non-OK status:', res.status);
      return null;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content : null;
  } catch (err) {
    console.warn('Qwen API call failed, falling back to local reasoning:', err);
    return null;
  }
}

/**
 * Vision-capable variant for the multimodal "attach a screenshot" flow.
 * Uses the same OpenAI-compatible schema with an image_url content block,
 * which DashScope's compatible-mode endpoint (and OpenRouter) both accept
 * for qwen-vl models. Returns null on any failure so callers can fall back
 * to an honest "visual analysis unavailable" message instead of a fake one.
 */
export async function qwenVisionDescribe(imageDataUrl: string, prompt: string): Promise<string | null> {
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) return null;

  const baseUrl = process.env.QWEN_API_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
  const model = process.env.QWEN_VISION_MODEL || 'qwen-vl-plus';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn('Qwen vision API returned non-OK status:', res.status);
      return null;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content : null;
  } catch (err) {
    console.warn('Qwen vision call failed, falling back to text-only investigation:', err);
    return null;
  }
}
