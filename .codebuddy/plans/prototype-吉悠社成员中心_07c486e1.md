---
name: prototype-吉悠社成员中心
overview: 基于已定稿的 PRD v1.1 与 SRS v1.0，生成全系统高保真纯静态前端原型（HTML + Tailwind CDN，零构建）：约 41 个页面覆盖游客/普通成员/版主/活动组织者/管理员五角色全部功能，页内嵌状态演示切换器，真实感中文 Mock 数据，prototype/index.html 导航串联核心业务流，每页标注 PRD/SRS 章节号，分批浏览器走查截图自查后提交评审。
design:
  architecture:
    framework: html
  styleKeywords:
    - 统一设计系统（待 ui-ux-pro-max 方案确认后冻结）
    - 游戏社群调性
    - 高保真拟真数据
    - 状态可视化完备
    - 响应式 360px 兜底
  fontSystem:
    fontFamily: 待 ui-ux-pro-max 推荐后冻结（候选：思源黑体/Inter 混排）
    heading:
      size: 24-32px
      weight: 600
    subheading:
      size: 16-20px
      weight: 500
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "待 ui-ux-pro-max 方案确认后冻结（候选方向：#6366F1 靛蓝 / #06B6D4 青 / #F97316 暖橙）"
    background:
      - "待冻结（候选：#FFFFFF / #F8FAFC / #0F172A 暗色）"
    text:
      - "待冻结（候选：#0F172A 主文 / #64748B 次文 / #FFFFFF 反白）"
    functional:
      - "待冻结（成功 #10B981 / 警告 #F59E0B / 错误 #EF4444 / 链接同主色）——按 SRS 状态机着色语义"
todos:
  - id: proto-design-system
    content: 安装 [skill:find-skills→ui-ux-pro-max]，产出 2–3 套设计系统方案（配色/字体/组件规范）提交用户选定冻结，固化 assets/tokens.css 与 design-system.html
    status: completed
  - id: proto-ia-index
    content: 输出页面清单.md（41 页角色×模块×跳转关系×PRD/SRS 覆盖核对）与 assets/prototype.js 状态切换器，生成 prototype/index.html 导航首页
    status: completed
    dependencies:
      - proto-design-system
  - id: proto-batch-guest
    content: 批次A：游客公共+认证流程 15 页（含入会申请表单与校验态），用 [skill:agent-browser] 逐页走查截图自查修正一轮
    status: completed
    dependencies:
      - proto-ia-index
  - id: proto-batch-member
    content: 批次B：成员前台 14 页（发帖/帖子详情/通知/签到递增补签/组队/报名候补等），用 [skill:agent-browser] 走查截图自查修正一轮
    status: completed
    dependencies:
      - proto-batch-guest
  - id: proto-batch-organizer
    content: 批次C：组织者 4 页+P2 占位页（活动发布/核销/回顾/名单导出），用 [skill:agent-browser] 走查截图自查修正一轮
    status: completed
    dependencies:
      - proto-batch-member
  - id: proto-batch-admin
    content: 批次D：管理员后台 11 页（看板图表/审核/治理/配置/审计/赠送/二次验证），用 [skill:agent-browser] 走查截图自查修正一轮
    status: completed
    dependencies:
      - proto-batch-organizer
  - id: proto-final-review
    content: 全站主流程点击走通验证、页面清单与 PRD 53+3 条覆盖率核对、汇总截图清单与评审说明提交用户逐页评审（确认后冻结为 UI 契约）
    status: completed
    dependencies:
      - proto-batch-admin
---

## 产品概述

基于已定稿的《PRD-吉悠社成员中心》v1.1 与《SRS》v1.0，产出一套**纯静态高保真前端原型**（输出至 `prototype/`），覆盖游客、普通成员、版主、活动组织者、管理员五角色的全部功能页面，作为 UI 需求确认与冻结的依据。

## 核心功能

- **页面清单（角色×模块）**：约 41 页——游客公共 11 页（首页/版块列表/帖子详情游客态/活动日历/活动详情/成员列表/他人主页/搜索/通知引导等）、认证与入会 4 页（注册/验证码激活/登录+找回密码/入会申请）、成员前台 14 页（发帖编辑器/帖子详情成员态/通知中心/个人资料/签到中心/我的报名出勤/组队/收藏/草稿箱/账号注销等）、组织者 4 页（活动发布/活动管理/签到核销/回顾与名单）、管理员后台 11 页（看板/入会审核/成员管理/举报工单/版块管理/系统配置/审计日志/赠送经验值积分/二次验证等）、导航首页 1 页
- **高保真要求**：布局、导航、表格、表单、图表全部真实绘制（看板含真实感图表）；每页右上角内嵌"状态演示切换器"（正常/空状态/加载/错误/校验提示）一键切换；全部使用贴合游戏社群业务的真实感中文 Mock 数据（版块按 PRD 7.3 六版块、数量级对齐 SRS：成员≤5000、峰值在线≤500）
- **可走通**：`prototype/index.html` 导航首页串联全部页面，核心业务主链路可点击走通：游客浏览→注册激活→入会申请→审核通过→发帖互动→每日签到（含连续递增+补签）→活动报名→候补递补→签到核销→奖励自动发放→后台治理（举报处置/赠送/审计）
- **可追溯**：每页顶部标注对应 PRD/SRS 章节号（如 `← PRD 5.2 B2 / SRS FR-B2`）
- **交付纪律**：设计系统（风格/配色/字体）先由 ui-ux-pro-max 技能给出 2–3 套方案、用户选定后冻结；每批页面完成后浏览器逐页走查+截图留档（`prototype/screenshots/`）、对照截图自查修完一轮再提交；确认前为草稿可迭代，确认后冻结为 UI 契约

## 验收标准

- 页面清单与 PRD 53+3 条功能清单对照无遗漏（输出覆盖率核对表）
- 浏览器直接打开即可点击走通主流程（零构建、无本地服务依赖）
- 保真度达到"可直接据此确认 UI 需求"水平，人工逐页评审通过并冻结

## 技术选型

- **页面技术**：纯静态 HTML + Tailwind CSS（CDN 引入，`cdn.tailwindcss.com`，零构建零依赖安装）+ 原生 JavaScript（状态切换器、页内交互模拟、Tab/弹层切换）
- **图表**：ECharts（CDN 引入）绘制数据看板折线/柱状/环形图，数据为贴合业务的真实感 Mock
- **字体/图标**：系统字体栈 + Google Fonts 可选引入；图标用内联 SVG（避免外部依赖断链）
- **共享资源**：`prototype/assets/prototype.js`（状态切换器、通用交互）+ `prototype/assets/tokens.css`（设计令牌，Tailwind config 内联注入），保证全站视觉一致性；每页为独立可直接双击打开的 HTML

## 实现方式

1. **先契约后页面**：第一步产出设计系统方案（ui-ux-pro-max 推荐 2–3 套配色/字体），用户选定后固化为 `tokens.css` + `design-system.html`（组件样例页：按钮/表单/表格/卡片/标签/状态色），后续所有页面严格引用
2. **信息架构先行**：输出页面清单表（编号/角色/模块/PRD·SRS 来源/核心交互/跳转关系）存 `prototype/页面清单.md`，作为覆盖核对基准
3. **模板驱动**：每页复用统一页头（产品 Logo+主导航+用户态+状态切换器）与页脚（原型标注），后台页面采用统一侧边栏布局
4. **状态可视化**：`prototype.js` 提供状态切换器，通过 `data-state="normal|empty|loading|error|validation"` 切换各区块显隐
5. **Mock 数据真实感**：预置中文社群数据（成员"夜风""阿茶"等昵称、帖子如"《原神》纳西妲队伍求助"、活动"周六桌游面杀·第 14 期"），数量级对齐 SRS
6. **分批走查**：每批完成即用 [skill:agent-browser]（备选 [skill:playwright-cli]）逐页打开、截图存档至 `prototype/screenshots/<批次>/<页面>.png`，对照截图修正间距/层级/溢出等视觉问题一轮后再进入下批

## 性能与可靠性

- 全静态资源、无网络 API 依赖（仅 CDN：Tailwind/ECharts，打开失败时降级为浏览器默认样式的风险已在 design-system.html 提供 tokens 兜底说明）
- 单页文件控制在 300KB 内，ECharts 按需仅在看板页引入
- 每页 HTML 头部注释块写明：页面编号、角色、PRD/SRS 来源、交互点清单

## 目录结构

```
d:/code/jys/prototype/
├── index.html                    # [NEW] 原型导航首页：按角色×批次列出全部页面入口+主流程走查路径
├── design-system.html            # [NEW] 设计系统样例页：配色/字体/组件/状态色
├── assets/
│   ├── tokens.css                # [NEW] 设计令牌（用户选定方案后固化）
│   └── prototype.js              # [NEW] 状态切换器与通用交互脚本
├── pages/
│   ├── guest/                    # [NEW] 游客公共 11 页（home/board/post-view/calendar/event-view/members/member-profile/search/login/register/reset等）
│   ├── member/                   # [NEW] 认证+成员前台 18 页（入会申请/post-editor/post-view/notification/profile/checkin/my-events/team/favorites/drafts/deactivate等）
│   ├── organizer/                # [NEW] 组织者 4 页（event-form/event-manage/checkin-desk/recap-export）
│   └── admin/                    # [NEW] 管理后台 11 页（dashboard/review/members/bans/roles/posts/reports/boards/events/settings/audit/gift/2fa）
├── screenshots/                  # [NEW] 分批走查截图留档
└── 页面清单.md                    # [NEW] 页面清单+跳转关系+覆盖率核对表
```

## 设计系统确定流程（用户已确认口径）

1. 执行第一步时安装 `ui-ux-pro-max` 技能（[skill:find-skills] 已验证 SkillHub 存在 slug `ui-ux-pro-max-0-1-0`，无需 API Key），由该技能基于"综合游戏兴趣社群 Web 平台（论坛+活动+管理后台，统一风格）"的项目调性产出 **2–3 套完整方案**（配色/字体/圆角阴影/组件密度）；
2. 方案提交用户选定后**冻结为 UI 契约**，固化为 `assets/tokens.css`（CSS 变量）+ Tailwind CDN `tailwind.config` 内联注入，全站前后台统一引用；
3. 候选方向基线（供技能细化）：A 电竞暗色（深蓝黑底+青紫强调，游戏社群沉浸感）/ B 清爽亮色 SaaS（白底靛蓝，稳妥专业）/ C 暖色社群（米白底暖橙，亲和休闲）。

## 已锁定的设计约束

- 前台与管理后台**统一设计系统**（同色系，后台密度更高）
- 响应式：桌面为主，Tailwind 断点适配移动端（≥360px）
- 每页右上角"状态演示切换器"（正常/空/加载/错误/校验），样式统一
- 组件规范：导航条、侧边栏、卡片、表格（斑马纹+悬浮态）、表单（含校验红字与成功态）、标签/徽章（角色徽章、状态徽章按 SRS 状态机着色）、按钮层级、空状态插画式占位、加载骨架屏、错误态、弹层确认框（危险操作红色确认，对应禁言/封禁/删帖等治理动作）
- 每页顶部固定"需求追溯条"：显示该页对应的 PRD/SRS 章节编号

## Agent Extensions

### Skill

- **find-skills**
- Purpose: 按 SkillHub 安装流程将 `ui-ux-pro-max`（slug: ui-ux-pro-max-0-1-0）安装到本机技能目录
- Expected outcome: ui-ux-pro-max 技能可用，用于产出 2–3 套设计系统方案
- **agent-browser**
- Purpose: 每批页面完成后逐页打开原型、截图留档至 `prototype/screenshots/`，并验证页面间跳转可点击走通
- Expected outcome: 全部页面截图留档 + 跳转链路验证通过，作为自查与评审依据
- **playwright-cli**
- Purpose: agent-browser 不可用时的备选浏览器自动化方案（截图与走查）
- Expected outcome: 同上（备选）