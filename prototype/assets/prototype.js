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
          '<span style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#F97316,#FB923C);display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px;">吉</span>' +
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
          '<a href="' + rel('guest','search.html') + '" class="jys-nav-link hidden md:inline-flex" title="搜索">🔍</a>' +
          '<a href="' + rel('member','notifications.html') + '" class="jys-nav-link relative hidden md:inline-flex" title="通知中心">🔔<span class="jys-dot">5</span></a>' +
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
            '<span style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#F97316,#FB923C);display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:800;">吉</span>' +
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
      '<div class="text-xs" style="color:var(--jys-text-3);">原型草稿 v0.1 · 确认前可迭代 · 冻结后为 UI 契约</div>';

    var main = body.querySelector('main');
    body.insertBefore(titleBar, main);
    body.insertBefore(bar, titleBar);
  }

  /* ---------- 2) 需求追溯条（左下角固定） ---------- */
  function buildTraceBar(body) {
    var t = el('div', { id: 'jys-trace-bar', title: '本页对应需求章节' });
    t.textContent = '📌 ' + (body.dataset.trace || '未标注');
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
    f.innerHTML = '吉悠社成员中心 · 高保真原型（纯静态） · 对应 PRD v1.1 / SRS v1.0 · <a class="jys-link" href="' + rel('root','index.html') + '">返回原型导航</a>';
    document.body.appendChild(f);
  }

  /* ---------- init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    var body = document.body;
    if (!body.classList.contains('jys')) return; // 非产品页面（如 index/design-system 自行处理）
    try { buildTopbar(body); } catch (e) { console.error('topbar', e); }
    buildStateSwitcher(body);
    buildTraceBar(body);
    buildFooter(body);
  });
})();
