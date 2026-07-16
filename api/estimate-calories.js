// Vercel Serverless Function
// 这个文件运行在服务器端，不会被浏览器看到，所以可以安全地使用 API 密钥。
// 密钥本身不写在这里，而是从 Vercel 项目的环境变量 ANTHROPIC_API_KEY 读取，
// 部署教程里会讲怎么在 Vercel 后台配置这个环境变量。

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '服务器未配置 ANTHROPIC_API_KEY，请在 Vercel 项目设置里添加环境变量' });
  }

  const { description, mealType } = req.body || {};
  if (!description) {
    return res.status(400).json({ error: '缺少饮食描述' });
  }

  const prompt = `你是营养师助手。请根据这顿${mealType || '一餐'}的描述，估算总热量并给出简短建议。
描述：${description}

只返回一个JSON对象，不要有任何其他文字、不要markdown代码块标记，格式严格如下：
{"calories": 数字, "protein_g": 数字, "carbs_g": 数字, "fat_g": 数字, "suggestion": "一句话建议，20字以内"}`;

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
        max_tokens: 400,
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
