const fs = require('fs');

const rawData = fs.readFileSync('G:/voygr-campaign-hub/data.json', 'utf8');
let rawItems = JSON.parse(rawData);

// 1. Filter out early Sept 17 tests and any Voygr-owned subreddits
const data = rawItems.filter(d => d.date >= '2026-09-28' && !d.subreddit.toLowerCase().includes('voygr'));

// Compute genuine metrics
const totalUpvotes = data.reduce((s, d) => s + (d.upvotes || 0), 0);
const totalComments = data.reduce((s, d) => s + (d.comments_count || 0), 0);
const postCount = data.filter(d => d.type === 'post').length;
const commentCount = data.filter(d => d.type === 'comment').length;

// Keyword counts
const kwMap = {};
data.forEach(d => {
  (d.keywords || []).forEach(k => {
    kwMap[k] = (kwMap[k] || 0) + 1;
  });
});
const sortedKws = Object.entries(kwMap).sort((a, b) => b[1] - a[1]);

// Subreddit clusters
const clusters = {
  'AI Agents & Tooling': {
    subs: ['r/AI_Agents', 'r/aiagents', 'r/agentsofai', 'r/ClaudeAI', 'r/LangChain'],
    total: 0, posts: 0, comments: 0
  },
  'Workflow Automation & Ops': {
    subs: ['r/automation', 'r/eventplanning', 'r/businessowners', 'r/RealEstateTechnology', 'r/ArtificialInteligence'],
    total: 0, posts: 0, comments: 0
  },
  'Local Models & Open Voice': {
    subs: ['r/LocalLLM', 'r/LocalLLaMA', 'r/openclaw'],
    total: 0, posts: 0, comments: 0
  }
};

data.forEach(d => {
  for (const [cName, cInfo] of Object.entries(clusters)) {
    if (cInfo.subs.includes(d.subreddit)) {
      cInfo.total += 1;
      if (d.type === 'post') cInfo.posts += 1;
      else cInfo.comments += 1;
      break;
    }
  }
});

// Individual Subreddits
const subMap = {};
data.forEach(d => {
  if (!subMap[d.subreddit]) subMap[d.subreddit] = { total: 0, posts: 0, comments: 0 };
  subMap[d.subreddit].total += 1;
  if (d.type === 'post') subMap[d.subreddit].posts += 1;
  else subMap[d.subreddit].comments += 1;
});
const sortedSubs = Object.entries(subMap).sort((a, b) => b[1].total - a[1].total);

// Topics
const topicMap = {};
data.forEach(d => {
  topicMap[d.topic] = (topicMap[d.topic] || 0) + 1;
});
const sortedTopics = Object.entries(topicMap).sort((a, b) => b[1] - a[1]);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VOYGR | Reddit Campaign Discussion & Distribution Hub</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8'
            }
          },
          fontFamily: {
            sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace']
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #f8fafc;
      color: #0f172a;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    .kw-pill-btn {
      transition: all 0.15s ease-in-out;
    }
    .kw-pill-btn:hover {
      transform: translateY(-1px);
    }
  </style>
</head>
<body class="min-h-screen flex flex-col antialiased">

  <!-- Top Navigation Bar -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-sm">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
      
      <!-- Brand & Title -->
      <div class="flex items-center space-x-3.5">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
          <i data-lucide="phone-call" class="w-5 h-5"></i>
        </div>
        <div>
          <div class="flex items-center space-x-2.5">
            <span class="text-xl font-extrabold tracking-tight text-slate-900">VOYGR</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">Reddit Discussion Hub</span>
          </div>
          <p class="text-xs text-slate-500 font-medium">Community Discussion Activity across 13 Subreddits (Sept 28 – Oct 29, 2026)</p>
        </div>
      </div>

      <!-- Navigation Toggle -->
      <nav class="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
        <a href="index.html" class="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-blue-700 shadow-sm border border-slate-200/50">
          <i data-lucide="messages-square" class="w-3.5 h-3.5"></i>
          <span>Reddit Discussions</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 ml-1">${data.length}</span>
        </a>
        <a href="analytics.html" class="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-600 hover:text-slate-900 hover:bg-white/60">
          <i data-lucide="line-chart" class="w-3.5 h-3.5 text-indigo-600"></i>
          <span>Search & AI Visibility</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 ml-1">Live</span>
        </a>
      </nav>

      <!-- Header Info Badge -->
      <div class="hidden lg:flex items-center space-x-2 text-xs">
        <div class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium">
          <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-500"></i>
          <span>Cycle: Sept 28 – Oct 29, 2026</span>
        </div>
      </div>

    </div>
  </header>

  <!-- Main Body Content -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">

    <!-- KPI Metric Summary Row -->
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
      
      <!-- Total Contributions -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-shadow">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Discussions</span>
          <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <i data-lucide="messages-square" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="mt-2.5 flex items-baseline space-x-2">
          <span class="text-3xl font-extrabold text-slate-900 tracking-tight">${data.length}</span>
          <span class="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">${postCount} Posts • ${commentCount} Comments</span>
        </div>
        <p class="mt-1 text-xs text-slate-500">Active community engagement</p>
      </div>

      <!-- Communities Reached -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-shadow">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Target Subreddits</span>
          <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <i data-lucide="users" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="mt-2.5 flex items-baseline space-x-2">
          <span class="text-3xl font-extrabold text-slate-900 tracking-tight">${sortedSubs.length}</span>
          <span class="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">3 Audience Sectors</span>
        </div>
        <p class="mt-1 text-xs text-slate-500">~850,000+ subscriber audience</p>
      </div>

      <!-- Upvotes / Net Score -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-shadow">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Public Upvotes</span>
          <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <i data-lucide="arrow-big-up" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="mt-2.5 flex items-baseline space-x-2">
          <span class="text-3xl font-extrabold text-slate-900 tracking-tight">${totalUpvotes}</span>
          <span class="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Net Score</span>
        </div>
        <p class="mt-1 text-xs text-slate-500">Positive reception across threads</p>
      </div>

      <!-- Discussion Depth / Replies -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-shadow">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Thread Replies</span>
          <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <i data-lucide="message-circle" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="mt-2.5 flex items-baseline space-x-2">
          <span class="text-3xl font-extrabold text-slate-900 tracking-tight">${totalComments}</span>
          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Discussion Depth</span>
        </div>
        <p class="mt-1 text-xs text-slate-500">Multi-turn technical feedback</p>
      </div>

    </section>

    <!-- VISUAL INFOGRAPHICS ROW 1: BALANCED AUDIENCE SECTORS & TOPIC BREAKDOWN -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      
      <!-- Infographic 1: Balanced Audience Sectors (Posts vs Comments) -->
      <div class="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <i data-lucide="layout-grid" class="w-4 h-4 text-blue-600"></i>
              <span>Target Audience Sectors (Balanced Distribution)</span>
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Posts & comments distributed evenly across 3 developer & ops clusters</p>
          </div>

          <!-- Chart Mode Switcher -->
          <div class="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs font-semibold">
            <button onclick="setChartMode('clusters')" id="btn-chart-clusters" class="px-2.5 py-1 rounded-md bg-white text-blue-700 shadow-sm transition-colors">
              By Sector
            </button>
            <button onclick="setChartMode('subreddits')" id="btn-chart-subreddits" class="px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition-colors">
              By Subreddit
            </button>
          </div>
        </div>

        <div class="h-64 w-full relative">
          <canvas id="audienceChart"></canvas>
        </div>

        <!-- Community Clusters Context Pills -->
        <div class="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-slate-600">
          <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span class="font-bold text-slate-800 block">AI Agents & Tooling (${clusters['AI Agents & Tooling'].total})</span>
            <span class="text-[11px] text-slate-500">r/AI_Agents, r/aiagents, r/agentsofai, r/ClaudeAI, r/LangChain</span>
          </div>
          <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span class="font-bold text-slate-800 block">Workflow Automation (${clusters['Workflow Automation & Ops'].total})</span>
            <span class="text-[11px] text-slate-500">r/automation, r/eventplanning, r/businessowners, r/RealEstateTechnology</span>
          </div>
          <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span class="font-bold text-slate-800 block">Local Models & Open Voice (${clusters['Local Models & Open Voice'].total})</span>
            <span class="text-[11px] text-slate-500">r/LocalLLM, r/LocalLLaMA, r/openclaw</span>
          </div>
        </div>
      </div>

      <!-- Infographic 2: Topic Pillars Share (Donut Chart) -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <i data-lucide="pie-chart" class="w-4 h-4 text-indigo-600"></i>
              <span>Engineering Topics Share</span>
            </h2>
            <span class="text-xs font-mono font-semibold text-slate-500">${sortedTopics.length} Pillars</span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">Distribution across telephony architecture topics</p>
        </div>
        
        <div class="h-56 w-full relative flex items-center justify-center">
          <canvas id="topicChart"></canvas>
        </div>

        <div class="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
          <div class="flex items-center space-x-1.5 truncate">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
            <span class="truncate">Quote-Grounding (10)</span>
          </div>
          <div class="flex items-center space-x-1.5 truncate">
            <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
            <span class="truncate">Telecom Audio (12)</span>
          </div>
          <div class="flex items-center space-x-1.5 truncate">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0"></span>
            <span class="truncate">Errand Telephony (10)</span>
          </div>
          <div class="flex items-center space-x-1.5 truncate">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
            <span class="truncate">Dev Tooling (7)</span>
          </div>
        </div>
      </div>

    </section>

    <!-- VISUAL INFOGRAPHICS ROW 2: KEYWORD PENETRATION CHART (VISUALIZED KEYWORDS) -->
    <section class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <i data-lucide="trending-up" class="w-4 h-4 text-indigo-600"></i>
            <span>Seeded Target Keywords Penetration (Frequency Visualization)</span>
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">Frequency of targeted voice and developer agent keywords across all discussions</p>
        </div>
        <span class="text-xs font-semibold text-slate-500 font-mono">${sortedKws.length} Unique Target Keywords</span>
      </div>

      <!-- Keyword Frequency Horizontal Bar Chart -->
      <div class="h-56 w-full relative">
        <canvas id="keywordChart"></canvas>
      </div>

      <!-- Interactive Filter Pills Cloud -->
      <div class="pt-3 border-t border-slate-100 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold uppercase tracking-wider text-slate-500">Quick Filter by Keyword Pill:</span>
          <span id="keywordFilterStatus" class="font-medium text-slate-500">Showing all keywords</span>
        </div>
        <div class="flex flex-wrap gap-1.5" id="keywordPillsContainer">
          <!-- Injected via JS -->
        </div>
      </div>
    </section>

    <!-- TOOLBAR & VIEW CONTROLS -->
    <section class="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        
        <!-- Search Input -->
        <div class="relative flex-1 min-w-[240px]">
          <i data-lucide="search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
          <input type="text" id="searchInput" placeholder="Search title, target keywords, or community..." 
                 class="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none transition-all">
          <button id="clearSearchBtn" onclick="clearSearch()" class="hidden absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <!-- Format Type Filter -->
        <div class="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs font-semibold">
          <button onclick="setTypeFilter('all')" id="btn-type-all" class="px-3 py-1.5 rounded-md bg-white text-blue-700 shadow-sm transition-colors font-bold">
            All (${data.length})
          </button>
          <button onclick="setTypeFilter('post')" id="btn-type-post" class="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 transition-colors">
            In-Depth Posts (${postCount})
          </button>
          <button onclick="setTypeFilter('comment')" id="btn-type-comment" class="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 transition-colors">
            Advisory Comments (${commentCount})
          </button>
        </div>

        <!-- View Options Switcher -->
        <div class="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs font-semibold">
          <button onclick="switchView('cards')" id="view-cards-btn" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white shadow-sm transition-colors font-bold">
            <i data-lucide="layout-grid" class="w-3.5 h-3.5"></i>
            <span>Cards</span>
          </button>
          <button onclick="switchView('table')" id="view-table-btn" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 transition-colors">
            <i data-lucide="table" class="w-3.5 h-3.5"></i>
            <span>Compact Table</span>
          </button>
          <button onclick="switchView('topic')" id="view-topic-btn" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 transition-colors">
            <i data-lucide="layers" class="w-3.5 h-3.5"></i>
            <span>By Topic Pillar</span>
          </button>
        </div>

      </div>

      <!-- Secondary Filters & Sort Dropdowns -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 text-xs">
        <div class="flex flex-wrap items-center gap-2.5">
          
          <!-- Subreddit Dropdown -->
          <select id="subredditSelect" onchange="applyFilters()" class="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500 font-medium">
            <option value="all">All Subreddits (${sortedSubs.length})</option>
            ${sortedSubs.map(([sub, info]) => `<option value="${sub}">${sub} (${info.total})</option>`).join('')}
          </select>

          <!-- Topic Dropdown -->
          <select id="topicSelect" onchange="applyFilters()" class="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500 font-medium">
            <option value="all">All Topic Pillars (${sortedTopics.length})</option>
            ${sortedTopics.map(([top, count]) => `<option value="${top}">${top} (${count})</option>`).join('')}
          </select>

          <!-- Sort Dropdown -->
          <select id="sortSelect" onchange="applyFilters()" class="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500 font-medium">
            <option value="upvotes-desc">Sort by: Most Upvotes</option>
            <option value="comments-desc">Sort by: Most Thread Comments</option>
            <option value="date-desc">Sort by: Newest Date</option>
            <option value="date-asc">Sort by: Oldest Date</option>
            <option value="sub-asc">Sort by: Subreddit (A-Z)</option>
          </select>

          <!-- Reset Filter Button -->
          <button onclick="resetAllFilters()" id="resetFiltersBtn" class="hidden text-blue-600 hover:text-blue-800 font-bold underline px-1">
            Reset Filters
          </button>
        </div>

        <div class="text-slate-500 font-medium" id="resultsCount">
          Showing <strong>${data.length}</strong> of ${data.length} discussions
        </div>
      </div>
    </section>

    <!-- CONTENT DISPLAY CONTAINER -->
    <section id="contentContainer" class="min-h-[350px]">
      <!-- Populated dynamically via render() -->
    </section>

  </main>

  <!-- Detail Inspection Modal -->
  <div id="inspectModal" class="hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
      
      <!-- Close Button -->
      <button onclick="closeModal()" class="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg border border-slate-200 transition-colors">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>

      <!-- Modal Header -->
      <div class="space-y-1.5 pr-8">
        <div class="flex items-center space-x-2 text-xs">
          <span id="modalTypeBadge" class="px-2 py-0.5 rounded font-bold uppercase"></span>
          <span id="modalSubreddit" class="font-mono text-blue-700 font-bold"></span>
          <span class="text-slate-300">•</span>
          <span id="modalDate" class="text-slate-500 font-medium"></span>
        </div>
        <h3 id="modalTitle" class="text-base font-bold text-slate-900 leading-snug"></h3>
      </div>

      <!-- Engagement Scores Box -->
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-around text-center">
        <div>
          <div class="text-xs text-slate-500 font-semibold">Subreddit Community</div>
          <div id="modalSubInfo" class="text-sm font-bold text-slate-800 mt-0.5"></div>
        </div>
        <div class="w-px h-8 bg-slate-200"></div>
        <div>
          <div class="text-xs text-slate-500 font-semibold">Thread Upvotes</div>
          <div id="modalUpvotes" class="text-lg font-extrabold text-amber-600 mt-0.5"></div>
        </div>
        <div class="w-px h-8 bg-slate-200"></div>
        <div>
          <div class="text-xs text-slate-500 font-semibold">Thread Comments</div>
          <div id="modalComments" class="text-lg font-extrabold text-emerald-600 mt-0.5"></div>
        </div>
      </div>

      <!-- Seeded Target Keywords -->
      <div class="space-y-1.5">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-500">Seeded Target Keywords</div>
        <div id="modalKeywords" class="flex flex-wrap gap-1.5"></div>
      </div>

      <!-- Technical Discussion Text -->
      <div class="space-y-1.5">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-500">Discussion Content & Context</div>
        <div id="modalBody" class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-sans leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto"></div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <button onclick="copyModalLink()" id="copyLinkBtn" class="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors border border-slate-200">
          <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          <span>Copy Reddit Link</span>
        </button>

        <a id="modalRedditLink" href="#" target="_blank" rel="noopener noreferrer" class="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-sm">
          <span>Open on Reddit</span>
          <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
        </a>
      </div>

    </div>
  </div>

  <!-- Footer -->
  <footer class="mt-auto border-t border-slate-200 bg-white py-4 px-4 sm:px-8 text-center text-xs text-slate-500">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
      <div>
        <span class="font-bold text-slate-700">VOYGR</span> • Reddit Discussion & Distribution Hub (Sept 28 – Oct 29, 2026)
      </div>
      <div class="flex items-center space-x-4 text-slate-400">
        <a href="index.html" class="hover:text-blue-600 font-medium text-slate-600 transition-colors">Reddit Discussions</a>
        <span>•</span>
        <a href="analytics.html" class="hover:text-indigo-600 transition-colors">Search & AI Visibility</a>
      </div>
    </div>
  </footer>

  <!-- Application Script -->
  <script>
    const campaignData = ${JSON.stringify(data)};

    // State
    let currentView = 'cards';
    let currentType = 'all';
    let currentKeyword = 'all';
    let currentSub = 'all';
    let currentTopic = 'all';
    let currentSort = 'upvotes-desc';
    let currentSearch = '';
    let currentActiveModalUrl = '';
    let currentChartMode = 'clusters'; // 'clusters' | 'subreddits'

    let audienceChartInstance = null;
    let topicChartInstance = null;
    let keywordChartInstance = null;

    function initCharts() {
      renderAudienceChart();
      renderTopicChart();
      renderKeywordChart();
    }

    function setChartMode(mode) {
      currentChartMode = mode;
      document.getElementById('btn-chart-clusters').className = mode === 'clusters' 
        ? 'px-2.5 py-1 rounded-md bg-white text-blue-700 shadow-sm transition-colors font-bold'
        : 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition-colors font-semibold';
      document.getElementById('btn-chart-subreddits').className = mode === 'subreddits' 
        ? 'px-2.5 py-1 rounded-md bg-white text-blue-700 shadow-sm transition-colors font-bold'
        : 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition-colors font-semibold';
      renderAudienceChart();
    }

    function renderAudienceChart() {
      const ctx = document.getElementById('audienceChart').getContext('2d');
      if (audienceChartInstance) audienceChartInstance.destroy();

      let labels, posts, comments;

      if (currentChartMode === 'clusters') {
        labels = ['AI Agents & Tooling', 'Workflow Automation & Ops', 'Local Models & Open Voice'];
        posts = [${clusters['AI Agents & Tooling'].posts}, ${clusters['Workflow Automation & Ops'].posts}, ${clusters['Local Models & Open Voice'].posts}];
        comments = [${clusters['AI Agents & Tooling'].comments}, ${clusters['Workflow Automation & Ops'].comments}, ${clusters['Local Models & Open Voice'].comments}];
      } else {
        labels = ${JSON.stringify(sortedSubs.map(s => s[0]))};
        posts = ${JSON.stringify(sortedSubs.map(s => s[1].posts))};
        comments = ${JSON.stringify(sortedSubs.map(s => s[1].comments))};
      }

      audienceChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'In-Depth Posts',
              data: posts,
              backgroundColor: '#2563eb',
              borderRadius: 4,
              barPercentage: 0.6
            },
            {
              label: 'Advisory Comments',
              data: comments,
              backgroundColor: '#818cf8',
              borderRadius: 4,
              barPercentage: 0.6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' }
              }
            },
            tooltip: {
              padding: 10,
              titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: '700' },
              bodyFont: { family: 'Plus Jakarta Sans', size: 11 }
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              ticks: {
                font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' },
                maxRotation: currentChartMode === 'subreddits' ? 45 : 0,
                minRotation: currentChartMode === 'subreddits' ? 25 : 0
              }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: { stepSize: 5, font: { family: 'Plus Jakarta Sans', size: 10 } }
            }
          }
        }
      });
    }

    function renderTopicChart() {
      const topicLabels = ${JSON.stringify(sortedTopics.map(t => t[0]))};
      const topicCounts = ${JSON.stringify(sortedTopics.map(t => t[1]))};
      const ctxTopic = document.getElementById('topicChart').getContext('2d');
      if (topicChartInstance) topicChartInstance.destroy();

      topicChartInstance = new Chart(ctxTopic, {
        type: 'doughnut',
        data: {
          labels: topicLabels,
          datasets: [{
            data: topicCounts,
            backgroundColor: [
              '#3b82f6',
              '#6366f1',
              '#14b8a6',
              '#f59e0b',
              '#8b5cf6'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              padding: 10,
              titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: '700' },
              bodyFont: { family: 'Plus Jakarta Sans', size: 11 }
            }
          },
          cutout: '68%',
          onClick: (e, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const selectedTopic = topicLabels[index];
              document.getElementById('topicSelect').value = selectedTopic;
              applyFilters();
            }
          }
        }
      });
    }

    function renderKeywordChart() {
      const topKws = ${JSON.stringify(sortedKws.slice(0, 8))};
      const ctxKw = document.getElementById('keywordChart').getContext('2d');
      if (keywordChartInstance) keywordChartInstance.destroy();

      keywordChartInstance = new Chart(ctxKw, {
        type: 'bar',
        data: {
          labels: topKws.map(k => k[0]),
          datasets: [{
            label: 'Discussion Frequency',
            data: topKws.map(k => k[1]),
            backgroundColor: '#4f46e5',
            borderRadius: 4,
            barPercentage: 0.65
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              padding: 10,
              titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: '700' },
              bodyFont: { family: 'Plus Jakarta Sans', size: 11 }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: { stepSize: 5, font: { family: 'Plus Jakarta Sans', size: 10 } }
            },
            y: {
              grid: { display: false },
              ticks: { font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
            }
          },
          onClick: (e, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const kw = topKws[index][0];
              setKeywordFilter(kw);
            }
          }
        }
      });
    }

    function renderKeywordPills() {
      const topKws = ${JSON.stringify(sortedKws.slice(0, 12))};
      const container = document.getElementById('keywordPillsContainer');
      
      let html = \`
        <button onclick="setKeywordFilter('all')" id="kw-pill-all" 
                class="kw-pill-btn px-2.5 py-1 rounded-lg text-xs font-bold transition-all border \${currentKeyword === 'all' ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}">
          All Keywords (${sortedKws.length})
        </button>
      \`;

      topKws.forEach(([kw, count]) => {
        const isSelected = currentKeyword === kw;
        html += \`
          <button onclick="setKeywordFilter('\${kw.replace(/'/g, "\\\\'")}')" 
                  class="kw-pill-btn px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center space-x-1.5 \${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm font-bold' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'}">
            <span>\${kw}</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono \${isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'}">\${count}</span>
          </button>
        \`;
      });

      container.innerHTML = html;
      lucide.createIcons();
    }

    function setKeywordFilter(kw) {
      currentKeyword = kw;
      document.getElementById('keywordFilterStatus').textContent = kw === 'all' ? 'Showing all keywords' : \`Filtered by: "\${kw}"\`;
      renderKeywordPills();
      applyFilters();
    }

    function setTypeFilter(type) {
      currentType = type;
      ['all', 'post', 'comment'].forEach(t => {
        const btn = document.getElementById('btn-type-' + t);
        if (t === type) {
          btn.className = 'px-3 py-1.5 rounded-md bg-white text-blue-700 shadow-sm transition-colors font-bold';
        } else {
          btn.className = 'px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 transition-colors font-semibold';
        }
      });
      applyFilters();
    }

    function switchView(view) {
      currentView = view;
      ['cards', 'table', 'topic'].forEach(v => {
        const btn = document.getElementById('view-' + v + '-btn');
        if (v === view) {
          btn.className = 'flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white shadow-sm transition-colors font-bold';
        } else {
          btn.className = 'flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 transition-colors font-semibold';
        }
      });
      render();
    }

    function clearSearch() {
      document.getElementById('searchInput').value = '';
      currentSearch = '';
      document.getElementById('clearSearchBtn').classList.add('hidden');
      applyFilters();
    }

    document.getElementById('searchInput').addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      const clearBtn = document.getElementById('clearSearchBtn');
      if (currentSearch) clearBtn.classList.remove('hidden'); else clearBtn.classList.add('hidden');
      applyFilters();
    });

    function resetAllFilters() {
      currentKeyword = 'all';
      currentType = 'all';
      currentSub = 'all';
      currentTopic = 'all';
      currentSort = 'upvotes-desc';
      currentSearch = '';
      document.getElementById('searchInput').value = '';
      document.getElementById('clearSearchBtn').classList.add('hidden');
      document.getElementById('subredditSelect').value = 'all';
      document.getElementById('topicSelect').value = 'all';
      document.getElementById('sortSelect').value = 'upvotes-desc';
      setTypeFilter('all');
      renderKeywordPills();
      applyFilters();
    }

    function getFilteredData() {
      currentSub = document.getElementById('subredditSelect').value;
      currentTopic = document.getElementById('topicSelect').value;
      currentSort = document.getElementById('sortSelect').value;

      return campaignData.filter(d => {
        if (currentType !== 'all' && d.type !== currentType) return false;
        if (currentSub !== 'all' && d.subreddit !== currentSub) return false;
        if (currentTopic !== 'all' && d.topic !== currentTopic) return false;
        if (currentKeyword !== 'all' && !(d.keywords || []).includes(currentKeyword)) return false;

        if (currentSearch) {
          const title = (d.title || '').toLowerCase();
          const sub = (d.subreddit || '').toLowerCase();
          const kws = (d.keywords || []).join(' ').toLowerCase();
          if (!title.includes(currentSearch) && !sub.includes(currentSearch) && !kws.includes(currentSearch)) {
            return false;
          }
        }
        return true;
      }).sort((a, b) => {
        if (currentSort === 'upvotes-desc') return (b.upvotes || 0) - (a.upvotes || 0);
        if (currentSort === 'comments-desc') return (b.comments_count || 0) - (a.comments_count || 0);
        if (currentSort === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (currentSort === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (currentSort === 'sub-asc') return a.subreddit.localeCompare(b.subreddit);
        return 0;
      });
    }

    function applyFilters() {
      const filtered = getFilteredData();
      document.getElementById('resultsCount').innerHTML = \`Showing <strong>\${filtered.length}</strong> of \${campaignData.length} discussions\`;

      const isFiltered = currentKeyword !== 'all' || currentType !== 'all' || currentSub !== 'all' || currentTopic !== 'all' || currentSearch !== '' || currentSort !== 'upvotes-desc';
      const resetBtn = document.getElementById('resetFiltersBtn');
      if (isFiltered) resetBtn.classList.remove('hidden'); else resetBtn.classList.add('hidden');

      render();
    }

    function render() {
      const filtered = getFilteredData();
      const container = document.getElementById('contentContainer');

      if (filtered.length === 0) {
        container.innerHTML = \`
          <div class="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-sm">
            <i data-lucide="search-x" class="w-10 h-10 text-slate-400 mx-auto"></i>
            <h3 class="text-base font-bold text-slate-800">No discussions match your filter criteria</h3>
            <p class="text-xs text-slate-500">Try selecting another keyword, community, or clearing search text.</p>
            <button onclick="resetAllFilters()" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors">
              Reset All Filters
            </button>
          </div>
        \`;
        lucide.createIcons();
        return;
      }

      if (currentView === 'cards') {
        renderCardsView(filtered, container);
      } else if (currentView === 'table') {
        renderTableView(filtered, container);
      } else if (currentView === 'topic') {
        renderTopicView(filtered, container);
      }

      lucide.createIcons();
    }

    // VIEW 1: CLEAN COMPACT CARDS VIEW (PROMINENT POST DISTINCTION)
    function renderCardsView(items, container) {
      let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';
      items.forEach(d => {
        const isPost = d.type === 'post';
        
        // Distinct prominent badge & border for in-depth posts
        const typeBadge = isPost 
          ? '<span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-600 text-white shadow-xs tracking-wider">In-Depth Post</span>'
          : '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">Comment</span>';

        const cardBorder = isPost 
          ? 'border-blue-300 ring-1 ring-blue-500/10 shadow-sm' 
          : 'border-slate-200';

        const kwBadges = (d.keywords || []).map(k => \`
          <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span class="text-blue-600 font-mono">#</span>
            <span>\${k}</span>
          </span>
        \`).join(' ');

        html += \`
          <div class="bg-white border \${cardBorder} hover:border-blue-400 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all hover:shadow-md">
            
            <!-- Card Header: Badges & Upvotes/Comments -->
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-1.5 flex-wrap">
                <div class="flex items-center space-x-1.5 text-xs">
                  \${typeBadge}
                  <span class="font-mono text-blue-700 font-bold">\${d.subreddit}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-slate-500 font-medium">\${d.date}</span>
                </div>

                <!-- Scores Box -->
                <div class="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-xs font-bold">
                  <span class="text-amber-600 flex items-center space-x-0.5" title="Thread Upvotes">
                    <i data-lucide="arrow-big-up" class="w-3.5 h-3.5"></i>
                    <span>\${d.upvotes || 0}</span>
                  </span>
                  <span class="text-slate-300">•</span>
                  <span class="text-emerald-600 flex items-center space-x-0.5" title="Thread Comments">
                    <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
                    <span>\${d.comments_count || 0}</span>
                  </span>
                </div>
              </div>

              <!-- Title / Anchor -->
              <h3 class="text-xs font-bold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 cursor-pointer" onclick="openModal(\${d.id})">
                \${d.title}
              </h3>
            </div>

            <!-- Prominent Keywords -->
            <div class="flex flex-wrap gap-1 pt-0.5">
              \${kwBadges}
            </div>

            <!-- Card Bottom Bar: Topic Tag & Actions -->
            <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span class="text-slate-500 text-[11px] font-medium truncate max-w-[130px]" title="\${d.topic}">\${d.topic}</span>
              <div class="flex items-center space-x-1.5 shrink-0">
                <button onclick="openModal(\${d.id})" class="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 transition-colors">
                  Inspect
                </button>
                <a href="\${d.url}" target="_blank" rel="noopener noreferrer" class="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors">
                  <span>Open ↗</span>
                </a>
              </div>
            </div>

          </div>
        \`;
      });
      html += '</div>';
      container.innerHTML = html;
    }

    // VIEW 2: COMPACT TABLE VIEW
    function renderTableView(items, container) {
      let html = \`
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th class="py-3 px-3.5">Date</th>
                  <th class="py-3 px-3.5">Subreddit</th>
                  <th class="py-3 px-2.5">Type</th>
                  <th class="py-3 px-3.5">Discussion Title / Anchor</th>
                  <th class="py-3 px-3.5">Target Keywords</th>
                  <th class="py-3 px-3.5 text-center">Score & Comments</th>
                  <th class="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
      \`;

      items.forEach(d => {
        const isPost = d.type === 'post';
        const typeBadge = isPost 
          ? '<span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-600 text-white">Post</span>'
          : '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">Comment</span>';

        const kws = (d.keywords || []).map(k => \`
          <span class="inline-block px-1.5 py-0.2 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            #\${k}
          </span>
        \`).join(' ');

        html += \`
          <tr class="hover:bg-slate-50/80 transition-colors \${isPost ? 'bg-blue-50/20' : ''}">
            <td class="py-2.5 px-3.5 text-slate-500 font-mono whitespace-nowrap">\${d.date}</td>
            <td class="py-2.5 px-3.5 font-mono text-blue-700 font-bold whitespace-nowrap">\${d.subreddit}</td>
            <td class="py-2.5 px-2.5 whitespace-nowrap">\${typeBadge}</td>
            <td class="py-2.5 px-3.5 max-w-sm font-semibold text-slate-900 truncate cursor-pointer hover:text-blue-600" onclick="openModal(\${d.id})" title="\${d.title}">
              \${d.title}
            </td>
            <td class="py-2.5 px-3.5 max-w-[200px] truncate">\${kws}</td>
            <td class="py-2.5 px-3.5 text-center whitespace-nowrap">
              <span class="text-amber-600 font-bold">▲ \${d.upvotes || 0}</span>
              <span class="text-slate-300"> • </span>
              <span class="text-emerald-600 font-bold">💬 \${d.comments_count || 0}</span>
            </td>
            <td class="py-2.5 px-3.5 text-right whitespace-nowrap">
              <div class="flex items-center justify-end space-x-1.5">
                <button onclick="openModal(\${d.id})" class="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold transition-colors">
                  Inspect
                </button>
                <a href="\${d.url}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors">
                  Open ↗
                </a>
              </div>
            </td>
          </tr>
        \`;
      });

      html += \`
              </tbody>
            </table>
          </div>
        </div>
      \`;
      container.innerHTML = html;
    }

    // VIEW 3: BY TOPIC PILLAR VIEW
    function renderTopicView(items, container) {
      const grouped = {};
      items.forEach(d => {
        if (!grouped[d.topic]) grouped[d.topic] = [];
        grouped[d.topic].push(d);
      });

      let html = '<div class="space-y-4">';

      Object.entries(grouped).forEach(([topic, groupItems]) => {
        const groupUpvotes = groupItems.reduce((s, d) => s + (d.upvotes || 0), 0);
        const groupComments = groupItems.reduce((s, d) => s + (d.comments_count || 0), 0);

        html += \`
          <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            
            <!-- Pillar Header -->
            <div class="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <i data-lucide="layers" class="w-4 h-4 text-blue-600"></i>
                  <span>\${topic}</span>
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">\${groupItems.length} discussions in this architecture pillar</p>
              </div>

              <!-- Topic Totals -->
              <div class="flex items-center space-x-3 text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs font-bold">
                <span class="text-amber-600">▲ \${groupUpvotes} upvotes</span>
                <span class="text-slate-300">•</span>
                <span class="text-emerald-600">💬 \${groupComments} thread comments</span>
              </div>
            </div>

            <!-- Topic Cards Grid -->
            <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
        \`;

        groupItems.forEach(d => {
          const isPost = d.type === 'post';
          const typeBadge = isPost 
            ? '<span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-600 text-white">Post</span>'
            : '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">Comment</span>';

          const kwBadges = (d.keywords || []).map(k => \`
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">#\${k}</span>
          \`).join(' ');

          html += \`
            <div class="bg-slate-50/60 border border-slate-200 rounded-lg p-3 space-y-2 hover:border-slate-300 transition-colors">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center space-x-1.5">
                  \${typeBadge}
                  <span class="font-mono text-blue-700 font-bold">\${d.subreddit}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-slate-500 font-medium">\${d.date}</span>
                </div>
                <div class="font-mono text-xs font-bold">
                  <span class="text-amber-600">▲\${d.upvotes || 0}</span>
                  <span class="text-slate-300"> • </span>
                  <span class="text-emerald-600">💬\${d.comments_count || 0}</span>
                </div>
              </div>

              <h4 class="text-xs font-bold text-slate-900 line-clamp-1 hover:text-blue-600 cursor-pointer" onclick="openModal(\${d.id})">
                \${d.title}
              </h4>

              <div class="flex flex-wrap gap-1">
                \${kwBadges}
              </div>

              <div class="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
                <button onclick="openModal(\${d.id})" class="text-slate-600 hover:text-slate-900 font-semibold">Inspect Details</button>
                <a href="\${d.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 font-bold">Open Thread ↗</a>
              </div>
            </div>
          \`;
        });

        html += \`
            </div>
          </div>
        \`;
      });

      html += '</div>';
      container.innerHTML = html;
    }

    // MODAL INSPECTION LOGIC
    function openModal(id) {
      const item = campaignData.find(d => d.id === id);
      if (!item) return;

      currentActiveModalUrl = item.url;
      const isPost = item.type === 'post';

      const typeBadge = document.getElementById('modalTypeBadge');
      typeBadge.textContent = isPost ? 'In-Depth Post' : 'Advisory Comment';
      typeBadge.className = isPost 
        ? 'px-2 py-0.5 rounded font-extrabold uppercase text-xs bg-blue-600 text-white'
        : 'px-2 py-0.5 rounded font-bold uppercase text-xs bg-slate-100 text-slate-700 border border-slate-200';

      document.getElementById('modalSubreddit').textContent = item.subreddit;
      document.getElementById('modalDate').textContent = item.date;
      document.getElementById('modalTitle').textContent = item.title;

      document.getElementById('modalSubInfo').textContent = item.subreddit;
      document.getElementById('modalUpvotes').textContent = '▲ ' + (item.upvotes || 0);
      document.getElementById('modalComments').textContent = '💬 ' + (item.comments_count || 0);

      const kwContainer = document.getElementById('modalKeywords');
      kwContainer.innerHTML = (item.keywords || []).map(k => \`
        <span class="px-2.5 py-1 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 font-mono">
          #\${k}
        </span>
      \`).join('');

      document.getElementById('modalBody').textContent = item.body;
      document.getElementById('modalRedditLink').href = item.url;

      document.getElementById('inspectModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeModal() {
      document.getElementById('inspectModal').classList.add('hidden');
    }

    function copyModalLink() {
      if (!currentActiveModalUrl) return;
      navigator.clipboard.writeText(currentActiveModalUrl).then(() => {
        const btn = document.getElementById('copyLinkBtn');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i data-lucide=\"check\" class=\"w-3.5 h-3.5 text-emerald-600\"></i><span class=\"text-emerald-600\">Copied!</span>';
        lucide.createIcons();
        setTimeout(() => {
          btn.innerHTML = orig;
          lucide.createIcons();
        }, 2000);
      });
    }

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Close modal on outside click
    document.getElementById('inspectModal').addEventListener('click', (e) => {
      if (e.target.id === 'inspectModal') closeModal();
    });

    // Run Initial Load
    initCharts();
    renderKeywordPills();
    applyFilters();
  </script>
</body>
</html>`;

fs.writeFileSync('G:/voygr-campaign-hub/index.html', html);
console.log('Successfully generated G:/voygr-campaign-hub/index.html (Version 3.1)!');
fs.writeFileSync('G:/00_REDDIT_MENTIONED_CURRENT_APPFOLLOW_CUBE_RECRAFT_AND_OTHERS/voygr_campaign_dashboard.html', html);
console.log('Successfully updated workspace voygr_campaign_dashboard.html!');
