/* ============================================================
   吉悠社成员中心 · 原型共享脚本（零依赖）
   职责：1) 注入统一页头（导航+用户态） 2) 需求追溯条 3) 状态演示切换器
   页面约定：body class="jys" data-page-title data-page-group data-trace data-states
   ============================================================ */
(function () {
  'use strict';

  var GROUPS = {
    guest:     { label: '游客', cls: 'jys-role-guest' },
    member:    { label: '普通成员', cls: 'jys-role-member' },
    moderator: { label: '版主', cls: 'jys-role-moderator' },
    organizer: { label: '活动组织者', cls: 'jys-role-organizer' },
    admin:     { label: '管理员', cls: 'jys-role-admin' }
  };

  /* ---------- 0) 细线 SVG 图标（lucide 风格 · 1.5px 描边 · currentColor） ---------- */
  var ICONS = {
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    'layout-dashboard': '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    'clipboard-check': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'flag': '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
    'layers': '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    'calendar': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    'scroll': '<path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
    'gift': '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    'inbox': '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    'party-popper': '<path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/>',
    'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'gamepad-2': '<line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>',
    'dice-5': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M16 8h.01"/><path d="M12 12h.01"/><path d="M8 16h.01"/><path d="M8 8h.01"/><path d="M16 16h.01"/>',
    'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'shield': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    'tags': '<path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42Z"/><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"/>',
    'trophy': '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'hourglass': '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
    'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    'ticket': '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
    'scan-line': '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" x2="17" y1="12" y2="12"/>',
    'key-round': '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
    'smile': '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
    'image': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    'pencil': '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    'sparkles': '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
    'bar-chart-3': '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>'
  };

  function jysIcon(name) {
    /* v1.1 图标修订：优先渲染本地化彩色图标（微软 Fluent Color，assets/jys-icons.js，
       存储为完整 <svg> 字符串、自带 viewBox）；未覆盖语义回退细线单色 SVG */
    var colored = window.JYS_ICON_SVGS && window.JYS_ICON_SVGS[name];
    if (colored) return colored;
    var d = ICONS[name] || '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }
  window.jysIcon = jysIcon; // 供页面脚本/调试使用

  /* 静态 HTML 占位填充：<span data-jys-icon="name"></span> → 内联 SVG */
  function fillIcons(root) {
    (root || document).querySelectorAll('[data-jys-icon]').forEach(function (n) {
      if (!n.firstChild) n.innerHTML = jysIcon(n.getAttribute('data-jys-icon'));
    });
  }

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* 相对路径：根据当前页面所在目录计算跨目录链接 */
  function rel(group, page) {
    var path = location.pathname.replace(/\\/g, '/');
    var m = path.match(/\/pages\/([^/]+)\//);
    var cur = m ? m[1] : null;
    if (!cur) return page;                    // 根目录（index/design-system）
    if (group === 'root') return '../' + page;
    if (!group || group === cur) return page; // 同目录
    return '../' + group + '/' + page;        // 跨目录
  }

  /* ---------- 1) 统一页头 ---------- */
  function buildTopbar(body) {
    var title = body.dataset.pageTitle || document.title;
    var group = body.dataset.pageGroup || 'guest';
    var g = GROUPS[group] || GROUPS.guest;

    var bar = el('header', { class: 'jys-topbar', id: 'jys-topbar' });
    bar.innerHTML =
      '<div class="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">' +
          '<a href="' + rel('root','index.html') + '" class="flex items-center gap-2 shrink-0" title="返回原型导航">' +
          '<span style="width:32px;height:32px;border-radius:8px;background:var(--jys-primary);display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px;">吉</span>' +
          '<span style="font-family:var(--jys-font-display);font-weight:800;font-size:16px;color:var(--jys-text-1);">吉悠社<span style="color:var(--jys-primary);">成员中心</span></span>' +
        '</a>' +
        '<nav class="hidden md:flex items-center gap-1 text-sm">' +
          '<a class="jys-nav-link" href="' + rel('guest','home.html') + '">首页</a>' +
          '<a class="jys-nav-link" href="' + rel('guest','board.html') + '">论坛</a>' +
          '<a class="jys-nav-link" href="' + rel('guest','activity-calendar.html') + '">活动</a>' +
          '<a class="jys-nav-link" href="' + rel('guest','members.html') + '">成员</a>' +
          '<a class="jys-nav-link" href="' + rel('member','teams.html') + '">组队</a>' +
          '<a class="jys-nav-link" href="' + rel('member','tournament.html') + '">赛事</a>' +
        '</nav>' +
        '<div class="ml-auto flex items-center gap-3">' +
          '<a href="' + rel('guest','search.html') + '" class="jys-nav-link hidden md:inline-flex" title="搜索"><span class="jys-ic">' + jysIcon('search') + '</span></a>' +
          '<a href="' + rel('member','notifications.html') + '" class="jys-nav-link relative hidden md:inline-flex" title="通知中心"><span class="jys-ic">' + jysIcon('bell') + '</span><span class="jys-dot">5</span></a>' +
          '<a href="' + rel('member','profile.html') + '" class="flex items-center gap-2">' +
            '<span class="jys-avatar" style="width:32px;height:32px;font-size:13px;">夜</span>' +
          '</a>' +
          '<span class="jys-role ' + g.cls + '">' + g.label + '</span>' +
        '</div>' +
      '</div>';
    // 后台页面使用侧边栏布局时，顶部导航仍保留（简化模式）
    if (group === 'admin') {
      bar.innerHTML =
        '<div class="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">' +
          '<a href="' + rel('root','index.html') + '" class="flex items-center gap-2 shrink-0">' +
            '<span style="width:32px;height:32px;border-radius:8px;background:var(--jys-primary);display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:800;">吉</span>' +
            '<span style="font-family:var(--jys-font-display);font-weight:800;">吉悠社 · 管理后台</span>' +
          '</a>' +
          '<span class="ml-auto flex items-center gap-3 text-sm">' +
            '<a class="jys-nav-link" href="dashboard.html">看板</a>' +
            '<a class="jys-nav-link" href="applications.html">审核</a>' +
            '<a class="jys-nav-link" href="settings.html">配置</a>' +
            '<span class="jys-role jys-role-admin">管理员</span>' +
            '<span class="jys-avatar" style="width:30px;height:30px;font-size:12px;">社</span>' +
          '</span>' +
        '</div>';
    }

    // 页面标题条
    var titleBar = el('div', { class: 'max-w-7xl mx-auto px-4 pt-5 pb-1 flex items-end justify-between gap-4 flex-wrap' });
    titleBar.innerHTML =
      '<div>' +
        '<h1 style="font-size:24px;line-height:1.3;">' + title + '</h1>' +
        '<p style="color:var(--jys-text-2);font-size:13px;margin-top:2px;">' +
          '需求追溯：<span style="color:var(--jys-primary-hover);font-weight:700;">' + (body.dataset.trace || '—') + '</span>' +
          (body.dataset.pageNote ? ' · ' + body.dataset.pageNote : '') +
        '</p>' +
      '</div>' +
      '<div class="text-xs" style="color:var(--jys-text-3);">UI 契约 v1.1 已冻结（2026-10-07）· 改动需走变更确认</div>';

    var main = body.querySelector('main');
    body.insertBefore(titleBar, main);
    body.insertBefore(bar, titleBar);
  }

  /* ---------- 2) 需求追溯条（左下角固定） ---------- */
  function buildTraceBar(body) {
    var t = el('div', { id: 'jys-trace-bar', title: '本页对应需求章节' });
    t.textContent = (body.dataset.trace || '未标注');
    document.body.appendChild(t);
  }

  /* ---------- 3) 状态演示切换器（右下角固定） ---------- */
  function buildStateSwitcher(body) {
    var states = (body.dataset.states || 'normal,empty,loading,error,validation').split(',');
    if (states.indexOf('normal') === -1) states.unshift('normal');
    var hasRegion = body.querySelector('[data-when]');
    if (!hasRegion && states.length <= 1) return;

    var sw = el('div', { id: 'jys-state-switcher', title: '状态演示切换器' });
    var labels = { normal: '正常', empty: '空状态', loading: '加载', error: '错误', validation: '校验' };
    states.forEach(function (s, i) {
      var b = el('button', { 'data-state-btn': s, class: i === 0 ? 'active' : '' }, labels[s] || s);
      b.addEventListener('click', function () {
        body.classList.remove('jys-state-normal', 'jys-state-empty', 'jys-state-loading', 'jys-state-error', 'jys-state-validation');
        body.classList.add('jys-state-' + s);
        sw.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
      });
      sw.appendChild(b);
    });
    document.body.appendChild(sw);
    // 初始状态
    body.classList.add('jys-state-normal');
  }

  /* ---------- 4) 页脚 ---------- */
  function buildFooter(body) {
    var f = el('footer', {});
    f.style.cssText = 'text-align:center;padding:40px 16px 64px;color:var(--jys-text-3);font-size:12px;';
    f.innerHTML = '吉悠社成员中心 · 高保真原型（纯静态） · 对应 PRD v1.2 / SRS v1.1（含等级系统增补） · <a class="jys-link" href="' + rel('root','index.html') + '">返回原型导航</a>';
    document.body.appendChild(f);
  }

  /* ---------- init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    var body = document.body;
    fillIcons(body); // 静态占位图标（含非 jys 页面引入本脚本时）
    if (!body.classList.contains('jys')) return; // 非产品页面（如 index/design-system 自行处理）
    try { buildTopbar(body); } catch (e) { console.error('topbar', e); }
    buildStateSwitcher(body);
    buildTraceBar(body);
    buildFooter(body);
  });
})();
