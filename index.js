const http = require('http');
const url = require('url');
const Parser = require('rss-parser');

const parser = new Parser({ timeout: 10000 });

// 简化的RSS源配置 - 中国媒体为主
const RSS_SOURCES = {
  '人民日报': {
    name: '人民日报',
    url: 'https://r.jina.ai/http://www.people.com.cn/rss/politics.xml',
    weight: 95
  },
  '新华社': {
    name: '新华社', 
    url: 'https://r.jina.ai/http://www.xinhuanet.com/politics/news_politics.xml',
    weight: 93
  },
  '财新网': {
    name: '财新网',
    url: 'https://r.jina.ai/http://china.caixin.com/rss.xml',
    weight: 88
  },
  '第一财经': {
    name: '第一财经',
    url: 'https://r.jina.ai/http://www.yicai.com/rss/news.xml',
    weight: 85
  }
};

// 备用数据（中文）
const MOCK_NEWS = [
  {
    id: '1',
    title: '美联储暗示可能在下次会议暂停加息',
    summary: '美联储最新会议纪要显示，多数官员认为通胀压力正在缓解...',
    content: '美联储最新会议纪要显示，多数官员认为通胀压力正在缓解，可能考虑在下次会议上暂停加息步伐。',
    source: '财新网',
    url: '#',
    publishTime: new Date().toISOString(),
    category: 'finance',
    impact: 'high',
    goldWeight: 88,
    keywords: ['美联储', '加息'],
    entities: ['美联储'],
    sentiment: 'positive',
    isBreaking: false
  },
  {
    id: '2',
    title: '黄金价格创历史新高，突破3100美元',
    summary: '受全球经济不确定性影响，黄金价格持续攀升...',
    content: '国际金价周一创下历史新高，现货黄金价格上涨至每盎司3115美元。',
    source: '第一财经',
    url: '#',
    publishTime: new Date(Date.now() - 1*60*60*1000).toISOString(),
    category: 'finance',
    impact: 'critical',
    goldWeight: 92,
    keywords: ['黄金', '避险'],
    entities: ['美联储'],
    sentiment: 'positive',
    isBreaking: true
  },
  {
    id: '3',
    title: '中东局势升级：多国关闭领空',
    summary: '随着地区冲突升级，多个中东国家宣布临时关闭领空...',
    content: '随着地区冲突升级，多个中东国家宣布临时关闭领空，国际航班大面积取消。',
    source: '新华社',
    url: '#',
    publishTime: new Date(Date.now() - 2*60*60*1000).toISOString(),
    category: 'military',
    impact: 'critical',
    goldWeight: 94,
    keywords: ['中东', '冲突'],
    entities: ['联合国'],
    sentiment: 'negative',
    isBreaking: true
  },
  {
    id: '4',
    title: '中国央行宣布降准0.5个百分点',
    summary: '中国人民银行宣布下调金融机构存款准备金率...',
    content: '中国人民银行宣布下调金融机构存款准备金率0.5个百分点，释放长期资金约1万亿元。',
    source: '人民日报',
    url: '#',
    publishTime: new Date(Date.now() - 3*60*60*1000).toISOString(),
    category: 'finance',
    impact: 'high',
    goldWeight: 86,
    keywords: ['央行', '降准'],
    entities: ['中国人民银行'],
    sentiment: 'positive',
    isBreaking: false
  },
  {
    id: '5',
    title: 'OpenAI发布GPT-5，推理能力大幅提升',
    summary: 'OpenAI正式发布GPT-5模型，在数学推理方面实现突破...',
    content: 'OpenAI正式发布GPT-5模型，在数学推理和代码生成方面实现重大突破。',
    source: '财新网',
    url: '#',
    publishTime: new Date(Date.now() - 4*60*60*1000).toISOString(),
    category: 'technology',
    impact: 'high',
    goldWeight: 82,
    keywords: ['AI', 'GPT-5'],
    entities: ['OpenAI'],
    sentiment: 'positive',
    isBreaking: false
  }
];

let cachedNews = [...MOCK_NEWS];
let lastFetchTime = Date.now();

// 简单的关键词提取
function extractKeywords(text) {
  const map = {
    '黄金': ['黄金'], '美联储': ['美联储', '加息', '降息'], '央行': ['央行', '降准'],
    '比特币': ['比特币', 'BTC'], 'AI': ['AI', '人工智能'], '中东': ['中东', '伊朗'],
    '股市': ['股市', '股票'], '通胀': ['通胀', 'CPI'], '原油': ['原油', '石油']
  };
  const keywords = [];
  for (const [k, v] of Object.entries(map)) {
    if (v.some(w => text.includes(w))) keywords.push(k);
  }
  return keywords.slice(0, 5);
}

// 解析RSS
async function parseRSS(name, config) {
  try {
    const feed = await parser.parseURL(config.url);
    if (!feed.items) return [];
    
    return feed.items.slice(0, 5).map((item, i) => {
      const title = item.title || '无标题';
      const content = item.contentSnippet || item.content || title;
      return {
        id: `${name}-${i}`,
        title: title.slice(0, 100),
        summary: content.slice(0, 200),
        content: content.slice(0, 500),
        source: config.name,
        url: item.link || '#',
        publishTime: new Date(item.pubDate || Date.now()).toISOString(),
        category: title.includes('军') || title.includes('战') ? 'military' : 
                  title.includes('股') || title.includes('金') ? 'finance' : 'politics',
        impact: 'medium',
        goldWeight: config.weight - Math.floor(Math.random() * 20),
        keywords: extractKeywords(title),
        entities: [],
        sentiment: 'neutral',
        isBreaking: false
      };
    });
  } catch (e) {
    console.log(`${name}抓取失败:`, e.message);
    return [];
  }
}

// 获取新闻
async function getNews() {
  // 每10分钟尝试更新
  if (Date.now() - lastFetchTime > 10 * 60 * 1000) {
    console.log('尝试抓取RSS...');
    const results = await Promise.all(
      Object.entries(RSS_SOURCES).map(([n, c]) => parseRSS(n, c))
    );
    const rssNews = results.flat();
    if (rssNews.length > 0) {
      cachedNews = [...rssNews, ...MOCK_NEWS].slice(0, 20);
      lastFetchTime = Date.now();
      console.log(`抓取成功: ${rssNews.length}条`);
    } else {
      console.log('RSS抓取失败，使用备用数据');
    }
  }
  return cachedNews;
}

// 服务器
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/api/news') {
    const news = await getNews();
    res.end(JSON.stringify({
      success: true,
      count: news.length,
      data: news
    }));
  } else if (req.url === '/api/health') {
    res.end(JSON.stringify({ status: 'ok', count: cachedNews.length }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
