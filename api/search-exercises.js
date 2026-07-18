// Vercel Serverless Function：AI 搜索相似健身动作
// 密钥从环境变量 ANTHROPIC_API_KEY 读取，不会暴露给浏览器。

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '服务器未配置 ANTHROPIC_API_KEY，请在 Vercel 项目设置里添加环境变量' });
  }

  const { query } = req.body || {};
  if (!query) {
    return res.status(400).json({ error: '缺少搜索关键词' });
  }

  const prompt = `你是健身教练。用户想找类似"${query}"的健身/力量训练动作。
请给出6到8个真实存在、常见的健身动作中文名称，与描述相关或相似。

只返回一个JSON数组，不要有任何其他文字、不要markdown代码块标记，格式严格如下：
["动作1", "动作2", "动作3"]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: 'Anthropic API 请求失败', detail: errText });
    }

    const data = await response.json();
    const text = (data.content || []).map(b => b.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: '解析失败', detail: String(e) });
  }
}
