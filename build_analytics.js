const fs = require('fs');

const googleRankings = [
  { keyword: "vapi vs retell", rank: 1, volume: 110, url: "https://www.reddit.com/r/b2bmarketing/comments/1ne55si/retell_ai_vs_vapi_for_ai_receptionists/", sub: "r/b2bmarketing", category: "Competitor Comparison" },
  { keyword: "Claude Code phone call plugin", rank: 1, volume: "High Intent", url: "https://www.reddit.com/r/ClaudeCode/comments/1xhvnjw/my_claude_code_now_calls_my_phone_when_it_needs/", sub: "r/ClaudeCode", category: "Tooling & Integrations" },
  { keyword: "vapi pricing", rank: 2, volume: 320, url: "https://www.reddit.com/r/AI_Agents/comments/1m58r4h/expensive_vapi_ai_agent/", sub: "r/AI_Agents", category: "Commercial Intent" },
  { keyword: "vapi alternative", rank: 2, volume: 480, url: "https://www.reddit.com/r/AI_Agents/comments/1lj1801/any_alternatives_to_vapi/", sub: "r/AI_Agents", category: "Competitor Comparison" },
  { keyword: "bland ai alternative", rank: 2, volume: 260, url: "https://www.reddit.com/r/AgentsOfAI/comments/1ndahha/what_are_the_best_alternatives_to_bland_vapi_and/", sub: "r/AgentsOfAI", category: "Competitor Comparison" },
  { keyword: "OpenClaw phone call skill", rank: 2, volume: 10, url: "https://www.reddit.com/r/OpenClawUseCases/comments/1rw87jo/the_easiest_way_to_make_real_phone_calls_with/", sub: "r/OpenClawUseCases", category: "Tooling & Integrations" },
  { keyword: "AI agent book appointment phone", rank: 2, volume: "High Intent", url: "https://www.reddit.com/r/AI_Agents/comments/1rxy6q0/i_built_an_ai_agent_that_can_book_appointments/", sub: "r/AI_Agents", category: "Use Cases & Workflows" },
  { keyword: "AI agent phone calls", rank: 2, volume: 20, url: "https://www.reddit.com/r/AI_Agents/comments/1orghkr/artificial_intelligence_phone_agent_with/", sub: "r/AI_Agents", category: "Core Category" },
  { keyword: "agent make phone calls businesses", rank: 2, volume: "High Intent", url: "https://www.reddit.com/r/AI_Agents/comments/1tv8085/just_launched_my_first_product_an_ai_call_agent/", sub: "r/AI_Agents", category: "Use Cases & Workflows" },
  { keyword: "Twilio AI voice agent outbound", rank: 3, volume: "High Intent", url: "https://www.reddit.com/r/AI_Agents/comments/1oovykl/which_is_the_best_phone_number_provider_for_ai/", sub: "r/AI_Agents", category: "Infrastructure" },
  { keyword: "ai calling app", rank: 3, volume: 260, url: "https://www.reddit.com/r/n8n/comments/1kqaxv3/what_tools_are_you_using_for_realtime_phone_calls/", sub: "r/n8n", category: "Core Category" },
  { keyword: "ai calling service", rank: 3, volume: 90, url: "https://www.reddit.com/r/n8n/comments/1kqaxv3/what_tools_are_you_using_for_realtime_phone_calls/", sub: "r/n8n", category: "Core Category" },
  { keyword: "AI book restaurant reservation phone", rank: 3, volume: "High Intent", url: "https://www.reddit.com/r/google/comments/1iimecp/ai_placed_a_reservation/", sub: "r/google", category: "Use Cases & Workflows" },
  { keyword: "retell ai alternative", rank: 8, volume: 50, url: "https://www.reddit.com/r/AiAgentsss/comments/1p3jssn/retell_ai_vs_other_voice_agents_what_i_learned/", sub: "r/AiAgentsss", category: "Competitor Comparison" },
  { keyword: "AI outbound calling API", rank: 9, volume: "High Intent", url: "https://www.reddit.com/r/AskProgramming/comments/1lbyefk/looking_for_a_platform_to_automate_outbound_voice/", sub: "r/AskProgramming", category: "Infrastructure" }
];

const aiSearchVisibility = [
  { brand: "Vapi", answers: 251, reddit_backed: 47, is_own: false },
  { brand: "Retell AI", answers: 226, reddit_backed: 46, is_own: false },
  { brand: "Bland AI", answers: 176, reddit_backed: 37, is_own: false },
  { brand: "Twilio", answers: 132, reddit_backed: 32, is_own: false },
  { brand: "ClawCall", answers: 74, reddit_backed: 18, is_own: false },
  { brand: "VOYGR", answers: 69, reddit_backed: 13, is_own: true },
  { brand: "Ring-a-Ding", answers: 19, reddit_backed: 8, is_own: false },
  { brand: "CALL-E", answers: 1, reddit_backed: 1, is_own: false }
];

const shareOfVoice = [
  { brand: "Vapi", mentions: 92, threads: 40, is_own: false },
  { brand: "VOYGR", mentions: 32, threads: 23, is_own: true },
  { brand: "Bland AI", mentions: 14, threads: 11, is_own: false },
  { brand: "Retell AI", mentions: 13, threads: 9, is_own: false },
  { brand: "ClawCall", mentions: 12, threads: 7, is_own: false },
  { brand: "CALL-E", mentions: 5, threads: 4, is_own: false }
];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VOYGR | Search Engine & AI Model Visibility Analytics</title>
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
    .rank-pill {
      transition: all 0.15s ease-in-out;
    }
    .rank-pill:hover {
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
            <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Analytics & Visibility</span>
          </div>
          <p class="text-xs text-slate-500 font-medium">Google Page 1 Rankings, AI Model Citations & Share of Voice</p>
        </div>
      </div>

      <!-- Navigation Toggle -->
      <nav class="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
        <a href="index.html" class="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-600 hover:text-slate-900 hover:bg-white/60">
          <i data-lucide="messages-square" class="w-3.5 h-3.5 text-blue-600"></i>
          <span>Reddit Discussions</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 ml-1">43</span>
        </a>
        <a href="analytics.html" class="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-indigo-700 shadow-sm border border-slate-200/50">
          <i data-lucide="line-chart" class="w-3.5 h-3.5"></i>
          <span>Search & AI Visibility</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 ml-1">Live</span>
        </a>
      </nav>

      <!-- Header Info Badge -->
      <div class="hidden lg:flex items-center space-x-2 text-xs">
        <div class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium">
          <i data-lucide="activity" class="w-3.5 h-3.5 text-slate-500"></i>
          <span>Tracking Engine: Active</span>
        </div>
      </div>

    </div>
  </header>

  <!-- Main Body Content -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">

    <!-- KPI Metric Summary Row -->
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
      
      <!-- Google Page 1 Rankings -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-shadow">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Google Page 1 SERPs</span>
          <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <i data-lucide="search" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="mt-2.5 flex items-baseline space-x-2">
          <span class="text-3xl font-extrabold text-slate-900 tracking-tight">15</span>
          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">2 at Rank #1</span>
        </div>
        <p class="mt-1 text-xs text-slate-500">Target Reddit threads on Google Page 1</p>
      </div>

      <!-- Top 3 Google Placements -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-shadow">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Top 3 Placements</span>
          <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <i data-lucide="trophy" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="mt-2.5 flex items-baseline space-x-2">
          <span class="text-3xl font-extrabold text-slate-900 tracking-tight">13 / 15</span>
          <span class="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">87% Dominance</span>
        </div>
        <p class="mt-1 text-xs text-slate-500">Ranking in Positions #1, #2, or #3</p>
      </div>

      <!-- AI Search Answers -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-shadow">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">AI Model Answers</span>
          <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <i data-lucide="bot" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="mt-2.5 flex items-baseline space-x-2">
          <span class="text-3xl font-extrabold text-slate-900 tracking-tight">69</span>
          <span class="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">13 Reddit-Cited</span>
        </div>
        <p class="mt-1 text-xs text-slate-500">Perplexity, ChatGPT, Gemini answers</p>
      </div>

      <!-- Reddit Share of Voice -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-shadow">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Reddit Share of Voice</span>
          <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <i data-lucide="pie-chart" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="mt-2.5 flex items-baseline space-x-2">
          <span class="text-3xl font-extrabold text-slate-900 tracking-tight">32</span>
          <span class="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">23 Threads</span>
        </div>
        <p class="mt-1 text-xs text-slate-500">#2 Voice Telephony Platform on Reddit</p>
      </div>

    </section>

    <!-- SECTION 1: Google Page 1 SERP Rankings -->
    <section class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div class="flex items-center space-x-2">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <h2 class="text-base font-extrabold text-slate-900">Google Page 1 SERP Rankings for Target Discussions</h2>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">High-intent search queries where Reddit discussions featuring Voygr hold Page 1 positions on Google</p>
        </div>
        
        <!-- Filter Controls -->
        <div class="flex items-center space-x-2">
          <div class="relative">
            <i data-lucide="search" class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input type="text" id="keywordSearch" placeholder="Search keywords..." class="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 w-48 sm:w-60">
          </div>
          <select id="rankFilter" class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium">
            <option value="all">All Positions (15)</option>
            <option value="top1">Position #1 (2)</option>
            <option value="top3">Top 3 (13)</option>
            <option value="competitor">Competitor Queries (5)</option>
          </select>
        </div>
      </div>

      <!-- Table Container -->
      <div class="overflow-x-auto border border-slate-100 rounded-lg">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th class="py-3 px-4 w-24">Google Rank</th>
              <th class="py-3 px-4">Search Keyword / Buyer Query</th>
              <th class="py-3 px-4 w-32">Monthly Vol.</th>
              <th class="py-3 px-4 w-44">Target Subreddit</th>
              <th class="py-3 px-4 w-32">Intent Cluster</th>
              <th class="py-3 px-4 w-28 text-right">Reddit Thread</th>
            </tr>
          </thead>
          <tbody id="rankingsTableBody" class="divide-y divide-slate-100">
            <!-- Dynamically populated via JavaScript -->
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
        <span id="rankingsCount">Showing 15 of 15 tracked Google SERP rankings</span>
        <span class="text-[11px] text-slate-400">Verified via Google Search API</span>
      </div>
    </section>

    <!-- SECTION 2: AI Search Engine & LLM Visibility & Share of Voice -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Chart 1: AI Search Model Citations -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div class="flex items-center space-x-2">
              <div class="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
              <h3 class="text-sm font-extrabold text-slate-900">AI Assistant Visibility</h3>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">Answers mentioning platform across 1,642 buyer queries (Perplexity, ChatGPT, Gemini)</p>
          </div>
          <span class="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">LLM Grounding</span>
        </div>

        <div class="h-64 relative">
          <canvas id="aiSearchChart"></canvas>
        </div>

        <div class="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs text-slate-600 space-y-1.5">
          <div class="flex items-center space-x-1.5 text-indigo-800 font-bold">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            <span>Reddit-to-LLM Synthesis Bridge</span>
          </div>
          <p class="leading-relaxed">
            Voygr is directly recommended in <strong>69 AI answers</strong>, with <strong>13 answers</strong> explicitly citing high-ranking Reddit discussions as the primary source for real-time PlaceCall code snippets and latency benchmarks.
          </p>
        </div>
      </div>

      <!-- Chart 2: Competitive Share of Voice on Reddit -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div class="flex items-center space-x-2">
              <div class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <h3 class="text-sm font-extrabold text-slate-900">Reddit Share of Voice (Voice AI)</h3>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">Mentions and discussion presence across developer & operational communities</p>
          </div>
          <span class="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">Community Presence</span>
        </div>

        <div class="h-64 relative">
          <canvas id="sovChart"></canvas>
        </div>

        <div class="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-slate-600 space-y-1.5">
          <div class="flex items-center space-x-1.5 text-blue-800 font-bold">
            <i data-lucide="trending-up" class="w-3.5 h-3.5"></i>
            <span>#2 Platform Presence</span>
          </div>
          <p class="leading-relaxed">
            With <strong>32 mentions across 23 discussions</strong>, Voygr has surpassed legacy alternatives like Bland AI (14), Retell AI (13), and ClawCall (12) in active Reddit technical conversations, establishing strong positioning right behind Vapi.
          </p>
        </div>
      </div>

    </div>

    <!-- Methodology & Architecture Note -->
    <section class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
      <div class="flex items-center space-x-2 font-bold text-slate-800">
        <i data-lucide="info" class="w-4 h-4 text-slate-500"></i>
        <span>Data Architecture & Verification Standard</span>
      </div>
      <p class="leading-relaxed">
        This view is compiled from automated Google Search crawls and AI assistant response audits across developer search surfaces. Thread links open the live community post directly on Reddit. Google SERP positions are recorded for US-based neutral searches.
      </p>
    </section>

  </main>

  <!-- Footer -->
  <footer class="mt-auto border-t border-slate-200 bg-white py-4 px-4 sm:px-8 text-center text-xs text-slate-500">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
      <div>
        <span class="font-bold text-slate-700">VOYGR</span> • Search Engine & AI Model Visibility Analytics
      </div>
      <div class="flex items-center space-x-4 text-slate-400">
        <a href="index.html" class="hover:text-blue-600 transition-colors">Reddit Discussion Hub</a>
        <span>•</span>
        <a href="analytics.html" class="hover:text-indigo-600 font-medium text-slate-600 transition-colors">Search & AI Visibility</a>
      </div>
    </div>
  </footer>

  <!-- Scripts -->
  <script>
    lucide.createIcons();

    const rawRankings = ${JSON.stringify(googleRankings)};
    const aiSearchData = ${JSON.stringify(aiSearchVisibility)};
    const sovData = ${JSON.stringify(shareOfVoice)};

    // Render Rankings Table
    function renderRankings(data) {
      const tbody = document.getElementById('rankingsTableBody');
      tbody.innerHTML = '';

      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-6 text-center text-slate-400 italic">No rankings match the selected filters.</td></tr>';
        document.getElementById('rankingsCount').innerText = 'Showing 0 rankings';
        return;
      }

      data.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50/80 transition-colors';

        // Rank badge
        let rankBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
        if (item.rank === 1) {
          rankBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
        } else if (item.rank === 2) {
          rankBadgeClass = 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
        } else if (item.rank === 3) {
          rankBadgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-200 font-bold';
        }

        // Volume badge
        let volDisplay = item.volume;
        if (typeof item.volume === 'number') {
          volDisplay = item.volume.toLocaleString() + ' / mo';
        }

        tr.innerHTML = \`
          <td class="py-3 px-4 font-mono">
            <span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs border \${rankBadgeClass}">
              #\${item.rank}
            </span>
          </td>
          <td class="py-3 px-4 font-bold text-slate-900">
            \${item.keyword}
          </td>
          <td class="py-3 px-4 font-mono text-slate-600">
            \${volDisplay}
          </td>
          <td class="py-3 px-4">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              \${item.sub}
            </span>
          </td>
          <td class="py-3 px-4">
            <span class="text-xs text-slate-500 font-medium">\${item.category}</span>
          </td>
          <td class="py-3 px-4 text-right">
            <a href="\${item.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-semibold text-[11px] transition-colors">
              <span>View</span>
              <i data-lucide="external-link" class="w-3 h-3"></i>
            </a>
          </td>
        \`;
        tbody.appendChild(tr);
      });

      document.getElementById('rankingsCount').innerText = \`Showing \${data.length} of \${rawRankings.length} tracked Google SERP rankings\`;
      lucide.createIcons();
    }

    // Filter Logic
    function filterRankings() {
      const q = document.getElementById('keywordSearch').value.toLowerCase().trim();
      const rankFilter = document.getElementById('rankFilter').value;

      const filtered = rawRankings.filter(item => {
        const matchesQ = !q || item.keyword.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
        
        let matchesRank = true;
        if (rankFilter === 'top1') matchesRank = item.rank === 1;
        else if (rankFilter === 'top3') matchesRank = item.rank <= 3;
        else if (rankFilter === 'competitor') matchesRank = item.category === 'Competitor Comparison';

        return matchesQ && matchesRank;
      });

      renderRankings(filtered);
    }

    document.getElementById('keywordSearch').addEventListener('input', filterRankings);
    document.getElementById('rankFilter').addEventListener('change', filterRankings);

    // Initial Render Table
    renderRankings(rawRankings);

    // Initialize Charts
    function initAnalyticsCharts() {
      // 1. AI Search Chart
      const aiCtx = document.getElementById('aiSearchChart').getContext('2d');
      new Chart(aiCtx, {
        type: 'bar',
        data: {
          labels: aiSearchData.map(d => d.brand),
          datasets: [
            {
              label: 'Total AI Answers Mentioning',
              data: aiSearchData.map(d => d.answers),
              backgroundColor: aiSearchData.map(d => d.is_own ? '#4f46e5' : '#cbd5e1'),
              borderColor: aiSearchData.map(d => d.is_own ? '#4338ca' : '#94a3b8'),
              borderWidth: 1,
              borderRadius: 5
            },
            {
              label: 'Reddit-Backed Citations',
              data: aiSearchData.map(d => d.reddit_backed),
              backgroundColor: aiSearchData.map(d => d.is_own ? '#06b6d4' : '#94a3b8'),
              borderColor: aiSearchData.map(d => d.is_own ? '#0891b2' : '#64748b'),
              borderWidth: 1,
              borderRadius: 5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
            },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  return \` \${ctx.dataset.label}: \${ctx.raw}\`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } }
            },
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: { font: { family: 'JetBrains Mono', size: 10 } }
            }
          }
        }
      });

      // 2. Share of Voice Chart
      const sovCtx = document.getElementById('sovChart').getContext('2d');
      new Chart(sovCtx, {
        type: 'bar',
        data: {
          labels: sovData.map(d => d.brand),
          datasets: [
            {
              label: 'Total Mentions',
              data: sovData.map(d => d.mentions),
              backgroundColor: sovData.map(d => d.is_own ? '#2563eb' : '#93c5fd'),
              borderRadius: 5
            },
            {
              label: 'Unique Buyer Threads',
              data: sovData.map(d => d.threads),
              backgroundColor: sovData.map(d => d.is_own ? '#3b82f6' : '#cbd5e1'),
              borderRadius: 5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } }
            },
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: { font: { family: 'JetBrains Mono', size: 10 } }
            }
          }
        }
      });
    }

    initAnalyticsCharts();
  </script>
</body>
</html>`;

fs.writeFileSync('G:/voygr-campaign-hub/analytics.html', html, 'utf8');
console.log('Successfully created G:/voygr-campaign-hub/analytics.html');
