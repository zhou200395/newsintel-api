const http = require('http');
const url = require('url');
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 20000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

// RSS源配置 - 使用多个备用源
const RSS_SOURCES = {
  'BBC': {
    name: 'BBC',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'politics',
    weight: 90
  },
  'Reuters': {
    name: 'Reuters',
    url: 'https://r.jina.ai/http://feeds.reuters.com/reuters/businessNews',
    category: 'finance',
    weight: 95
  },
  'CNBC': {
    name: 'CNBC',
    url: 'https://r.jina.ai/http://feeds.cnbc.com/id/100003114/device/rss/rss.html',
    category: 'finance',
    weight: 85
  }
};

// 备用模拟数据（当RSS抓取失败时使用）
const MOCK_NEWS = [
  {
    id: 'mock-1',
    title: '美联储暗示可能在下次会议暂停加息',
    summary: '美联储最新会议纪要显示，多数官员认为通胀压力正在缓解，可能考虑在下次会议上暂停加息步伐...',
    content: '美联储最新会议纪要显示，多数官员认为通胀压力正在缓解，可能考虑在下次会议上暂停加息步伐。这一信号被市场解读为鸽派转向，美股三大指数应声上涨。',
    source: 'Reuters',
    url: 'https://reuters.com/news/fed-pause',
    publishTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'finance',
    impact: 'high',
    goldWeight: 88,
    keywords: ['美联储', '加息', '通胀'],
    entities: ['美联储', '华尔街'],
    sentiment: 'positive',
    isBreaking: false
  },
  {
    id: 'mock-2',
    title: '中东局势升级：多国关闭领空',
    summary: '随着地区冲突升级，多个中东国家宣布临时关闭领空，国际航班大面积取消...',
    content: '随着地区冲突升级，多个中东国家宣布临时关闭领空，国际航班大面积取消。国际油价突破每桶100美元，黄金价格上涨至3050美元。',
    source: 'BBC',
    url: 'https://bbc.com/news/middle-east',
    publishTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    category: 'military',
    impact: 'critical',
    goldWeight: 94,
    keywords: ['中东', '冲突', '原油', '黄金'],
    entities: ['联合国'],
    sentiment: 'negative',
    isBreaking: true
  },
  {
    id: 'mock-3',
    title: '黄金价格创历史新高，突破3100美元',
    summary: '受全球经济不确定性影响，黄金价格持续攀升，首次突破每盎司3100美元大关...',
    content: '国际金价周一创下历史新高，现货黄金价格上涨至每盎司3115美元，年内涨幅已超过20%。美联储降息预期、地缘政治紧张局势推动避险需求。',
    source: 'Reuters',
    url: 'https://reuters.com/news/gold-record',
    publishTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    category: 'finance',
    impact: 'critical',
    goldWeight: 92,
    keywords: ['黄金', '贵金属', '避险资产'],
    entities: ['美联储'],
    sentiment: 'positive',
    isBreaking: true
  },
  {
    id: 'mock-4',
    title: '比特币突破11万美元，加密货币市场创新高',
    summary: '比特币价格历史上首次突破11万美元大关，推动整个加密货币市场市值创新高...',
    content: '比特币价格突破11万美元，以太坊、Solana等主流加密货币跟随上涨。机构投资者持续流入，美国比特币ETF资金规模不断扩大。',
  // RSS源配置 - 中外权威媒体
const RSS_SOURCES = {
  // 中国权威媒体
  '人民日报': {
    name: '人民日报',
    url: 'https://r.jina.ai/http://www.people.com.cn/rss/politics.xml',
    category: 'politics',
    weight: 95
  },
  '新华社': {
    name: '新华社',
    url: 'https://r.jina.ai/http://www.xinhuanet.com/politics/news_politics.xml',
    category: 'politics',
    weight: 93
  },
  '财新网': {
    name: '财新网',
    url: 'https://r.jina.ai/http://china.caixin.com/rss.xml',
    category: 'finance',
    weight: 88
  },
  '第一财经': {
    name: '第一财经',
    url: 'https://r.jina.ai/http://www.yicai.com/rss/news.xml',
    category: 'finance',
    weight: 85
  },
  '环球时报': {
    name: '环球时报',
    url: 'https://r.jina.ai/http://www.globaltimes.cn/rss.xml',
    category: 'politics',
    weight: 80
  },
  '澎湃新闻': {
    name: '澎湃新闻',
    url: 'https://r.jina.ai/http://www.thepaper.cn/rss.xml',
    category: 'politics',
    weight: 82
  },
  '华尔街见闻': {
    name: '华尔街见闻',
    url: 'https://r.jina.ai/http://wallstreetcn.com/rss.xml',
    category: 'finance',
    weight: 84
  },
  // 国际媒体
  'BBC': {
    name: 'BBC',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'politics',
    weight: 88
  },
  'Reuters': {
    name: 'Reuters',
    url: 'https://r.jina.ai/http://feeds.reuters.com/reuters/businessNews',
    category: 'finance',
    weight: 90
  },
  'CNBC': {
    name: 'CNBC',
    url: 'https://r.jina.ai/http://feeds.cnbc.com/id/100003114/device/rss/rss.html',
    category: 'finance',
    weight: 82
  }
};
    goldWeight: 82,
    keywords: ['OpenAI', 'GPT-5', 'AI'],
    entities: ['OpenAI', '微软'],
    sentiment: 'positive',
    isBreaking: true
  }
];

// 关键词提取
function extractKeywords(text) {
  const keywords = [];
  const keywordMap = {
    '黄金': ['黄金', 'gold'],
    '白银': ['白银', 'silver'],
    '原油': ['原油', '石油', 'oil', 'crude'],
    '美联储': ['美联储', 'Fed', '加息', '降息', '利率'],
    '比特币': ['比特币', 'bitcoin', 'BTC', '加密货币'],
    '伊朗': ['伊朗', 'Iran', '中东'],
    '美国': ['美国', 'USA', 'America', '美股'],
    '中国': ['中国', 'China', 'A股'],
    '俄罗斯': ['俄罗斯', 'Russia', '俄乌'],
    '以色列': ['以色列', 'Israel', '巴勒斯坦'],
    '股市': ['股市', '股票', 'stock', 'market', '指数'],
    '通胀': ['通胀', '通货膨胀', 'inflation', 'CPI'],
    '战争': ['战争', '冲突', 'war', 'conflict', '军事'],
    'AI': ['AI', '人工智能', 'artificial intelligence', 'ChatGPT'],
    '芯片': ['芯片', '半导体', 'chip', '台积电'],
    '关税': ['关税', 'tariff', '贸易'],
    'OPEC': ['OPEC', '欧佩克', '产油国'],
    '央行': ['央行', '中央银行', 'central bank', '货币政策']
  };

  for (const [key, variants] of Object.entries(keywordMap)) {
    if (variants.some(v => text.toLowerCase().includes(v.toLowerCase()))) {
      keywords.push(key);
    }
  }

  return [...new Set(keywords)].slice(0, 5);
}

// 提取实体
function extractEntities(text) {
  const entities = [];
  const patterns = [
    { name: '美联储', keywords: ['美联储', 'Federal Reserve', 'Fed'] },
    { name: '欧洲央行', keywords: ['欧洲央行', 'ECB'] },
    { name: '日本央行', keywords: ['日本央行', 'BOJ'] },
    { name: '联合国', keywords: ['联合国', 'United Nations', 'UN'] },
    { name: 'OPEC', keywords: ['OPEC', '欧佩克'] },
    { name: '北约', keywords: ['北约', 'NATO'] },
    { name: '华尔街', keywords: ['华尔街', 'Wall Street'] },
    { name: '道琼斯', keywords: ['道琼斯', 'Dow Jones'] },
    { name: '纳斯达克', keywords: ['纳斯达克', 'NASDAQ'] },
    { name: '标普500', keywords: ['标普', 'S&P 500'] },
    { name: '布伦特原油', keywords: ['布伦特', 'Brent'] },
    { name: 'WTI原油', keywords: ['WTI'] },
    { name: 'SWIFT', keywords: ['SWIFT'] }
  ];

  for (const { name, keywords } of patterns) {
    if (keywords.some(k => text.includes(k))) {
      entities.push(name);
    }
  }

  return [...new Set(entities)].slice(0, 5);
}

// 智能分类
function categorizeNews(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  
  const keywords = {
    politics: ['选举', '政府', '议会', '政策', '政党', '总统', '总理', '投票', '制裁', '外交'],
    finance: ['股票', '债券', '利率', '银行', '黄金', '白银', '比特币', '加密货币', 'ETF', '股市', '标普', '纳斯达克', '道琼斯'],
    military: ['军队', '导弹', '空袭', '军事', '战争', '冲突', '武器', '防御', '舰队', '轰炸', '袭击'],
    economy: ['GDP', '通胀', '就业', '贸易', '产业', '能源', '石油', '天然气', '关税', 'CPI'],
    diplomacy: ['外交', '谈判', '条约', '峰会', '访问', '关系', '制裁', '协议'],
    technology: ['AI', '人工智能', '科技', '芯片', '半导体', '互联网', '区块链', 'ChatGPT']
  };

  const scores = { politics: 0, finance: 0, military: 0, economy: 0, diplomacy: 0, technology: 0 };
  
  for (const [category, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (text.includes(word.toLowerCase())) {
        scores[category]++;
      }
    }
  }
  
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

// 情感分析
function analyzeSentiment(text) {
  const positive = ['上涨', '增长', '突破', '成功', '积极', '乐观', '利好', '强劲', '创新', '合作', '复苏', '反弹', '创新高'];
  const negative = ['下跌', '衰退', '危机', '冲突', '战争', '制裁', '紧张', '担忧', '风险', '威胁', '暴跌', '崩盘', '衰退'];
  
  let pos = 0, neg = 0;
  for (const w of positive) if (text.includes(w)) pos++;
  for (const w of negative) if (text.includes(w)) neg++;
  
  if (pos > neg) return 'positive';
  if (neg > pos) return 'negative';
  return 'neutral';
}

// 判断突发新闻
function isBreakingNews(title, category) {
  const breaking = ['突发', 'breaking', '紧急', 'urgent', '快讯', 'alert', '刚刚', '立即'];
  return breaking.some(k => title.toLowerCase().includes(k.toLowerCase())) || 
         ['military', 'politics'].includes(category);
}

// 计算含金量
function calculateGoldWeight(news, sourceWeight) {
  let score = sourceWeight * 0.25;
  score += Math.min(news.keywords.length * 10, 100) * 0.20;
  
  const categoryWeights = { finance: 1.0, politics: 0.9, military: 0.95, economy: 0.85, diplomacy: 0.8, technology: 0.75 };
  score += (categoryWeights[news.category] * 80) * 0.25;
  
  const hoursAgo = (Date.now() - new Date(news.publishTime).getTime()) / (1000 * 60 * 60);
  let timeliness = hoursAgo <= 1 ? 100 : hoursAgo <= 6 ? 90 : hoursAgo <= 24 ? 80 : 60;
  score += timeliness * 0.15;
  
  let global = news.isBreaking ? 90 : 70;
  if (news.entities.includes('联合国') || news.entities.includes('美联储')) global += 10;
  score += Math.min(global, 100) * 0.15;
  
  return Math.round(Math.min(score, 100));
}

// 解析单个RSS源
async function parseRSS(sourceKey, config) {
  const newsItems = [];
  
  try {
    const feed = await parser.parseURL(config.url);
    
    if (!feed.items || feed.items.length === 0) {
      return newsItems;
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const item of feed.items.slice(0, 15)) {
      const pubDate = item.pubDate || item.isoDate;
      if (!pubDate) continue;
      
      const publishTime = new Date(pubDate);
      if (publishTime < oneDayAgo) continue;

      const id = `${sourceKey}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const title = item.title || '无标题';
      const content = item.contentSnippet || item.content || title;
      
      const keywords = extractKeywords(title + ' ' + content);
      const entities = extractEntities(title + ' ' + content);
      const category = categorizeNews(title, content);
      const sentiment = analyzeSentiment(title + ' ' + content);
      const isBreaking = isBreakingNews(title, category);

      const news = {
        id,
        title,
        summary: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
        content,
        source: config.name,
        url: item.link || '',
        publishTime: publishTime.toISOString(),
        category,
        impact: 'medium',
        goldWeight: 0,
        keywords,
        entities,
        sentiment,
        isBreaking
      };

      news.goldWeight = calculateGoldWeight(news, config.weight);
      
      if (news.goldWeight >= 90) news.impact = 'critical';
      else if (news.goldWeight >= 80) news.impact = 'high';
      else if (news.goldWeight >= 60) news.impact = 'medium';
      else news.impact = 'low';

      newsItems.push(news);
    }
  } catch (error) {
    console.error(`RSS解析失败 ${config.name}:`, error.message);
  }

  return newsItems;
}

// 缓存
let cachedNews = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

// 获取新闻
async function getNews() {
  const now = Date.now();
  
  if (now - lastFetchTime > CACHE_DURATION || cachedNews.length === 0) {
    console.log('抓取新新闻...', new Date().toISOString());
    
    const results = await Promise.all(
      Object.entries(RSS_SOURCES).map(([key, config]) => parseRSS(key, config))
    );

    let allNews = results.flat();
    
    // 如果RSS抓取失败，使用备用模拟数据
    if (allNews.length === 0) {
      console.log('RSS抓取失败，使用备用数据');
      allNews = [...MOCK_NEWS];
    }
    
    // 去重
    const seen = new Set();
    allNews = allNews.filter(news => {
      if (seen.has(news.url)) return false;
      seen.add(news.url);
      return true;
    });

    allNews.sort((a, b) => b.goldWeight - a.goldWeight);
    
    cachedNews = allNews.slice(0, 50);
    lastFetchTime = now;
    
    console.log(`抓取完成: ${cachedNews.length} 条新闻`);
  }

  return cachedNews;
}

// 创建服务器
const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === '/api/news') {
    try {
      const news = await getNews();
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        count: news.length,
        lastUpdate: new Date(lastFetchTime).toISOString(),
        data: news
      }));
    } catch (error) {
      console.error('API错误:', error);
      res.writeHead(500);
      res.end(JSON.stringify({
        success: false,
        error: error.message,
        data: cachedNews
      }));
    }
  } else if (parsedUrl.pathname === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      cachedNews: cachedNews.length,
      lastUpdate: new Date(lastFetchTime).toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`NewsIntel API 服务器运行在端口 ${PORT}`);
  console.log(`API地址: http://localhost:${PORT}/api/news`);
});

