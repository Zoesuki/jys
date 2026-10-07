/**
 * 全局状态枚举（数据库设计.md §1.4 机读码唯一来源，与 docs/数据库设计.md 一一对应）
 * 采用 const 对象 + 字面量联合（结构化类型，与 Prisma 生成的枚举字符串值直接兼容）。
 * 文案→徽章映射在前端设计系统层。
 */

/** 用户账号状态（状态机 4.1） */
export const UserStatus = {
  PendingActivation: 'pending_activation', // 待激活
  ActiveNoMember: 'active_no_member', // 已激活_未入会
  Normal: 'normal', // 正常_普通成员
  Muted: 'muted', // 已禁言
  Banned: 'banned', // 已封禁
  DeactivationCooling: 'deactivation_cooling', // 注销冷静期
  Deactivated: 'deactivated', // 已注销
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

/** 叠加角色（SRS 2.3；成员=无行） */
export const ExtraRole = {
  Moderator: 'moderator',
  Organizer: 'organizer',
  Admin: 'admin',
} as const;
export type ExtraRole = (typeof ExtraRole)[keyof typeof ExtraRole];

/** 入会申请状态（状态机 4.2） */
export const ApplicationStatus = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
} as const;
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

/** 帖子/回帖内容状态（状态机 4.3，先发后审 Q7/R4） */
export const ContentStatus = {
  Published: 'published',
  PendingReview: 'pending_review',
  Rejected: 'rejected',
  Hidden: 'hidden',
  Deleted: 'deleted',
} as const;
export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];

/** 版块可见性（Q4） */
export const BoardVisibility = {
  Public: 'public',
  MembersOnly: 'members_only',
} as const;
export type BoardVisibility = (typeof BoardVisibility)[keyof typeof BoardVisibility];

/** 举报工单状态（状态机 4.4；Tab 词：待受理/处理中/已办结） */
export const ReportStatus = {
  Pending: 'pending',
  Processing: 'processing',
  ResolvedAction: 'resolved_action', // 已办结_属实处置
  ResolvedDismiss: 'resolved_dismiss', // 已办结_驳回
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

/** 举报处置动作 */
export const ReportAction = {
  DeletePost: 'delete_post',
  HideContent: 'hide_content',
  MuteUser: 'mute_user',
  BanUser: 'ban_user',
  Dismiss: 'dismiss',
} as const;
export type ReportAction = (typeof ReportAction)[keyof typeof ReportAction];

/** 活动状态（状态机 4.5） */
export const ActivityStatus = {
  SignupOpen: 'signup_open', // 报名中
  SignupClosed: 'signup_closed', // 报名截止
  Ongoing: 'ongoing', // 进行中
  Finished: 'finished', // 已结束
  RewardGranted: 'reward_granted', // 奖励已发放
  Cancelled: 'cancelled', // 已取消
} as const;
export type ActivityStatus = (typeof ActivityStatus)[keyof typeof ActivityStatus];

/** 报名/候补状态（状态机 4.6） */
export const RegistrationStatus = {
  SignedUp: 'signed_up', // 已报名
  WaitlistPending: 'waitlist_pending', // 候补中 #n
  WaitlistExpired: 'waitlist_expired', // 已递补超时·已顺延
  Cancelled: 'cancelled', // 已取消
  Attended: 'attended', // 已出席
  Absent: 'absent', // 未出席
} as const;
export type RegistrationStatus = (typeof RegistrationStatus)[keyof typeof RegistrationStatus];

/** 组队状态（状态机 4.7，P9-22） */
export const TeamStatus = {
  Recruiting: 'recruiting', // 招募中
  Full: 'full', // 已满员
  Disbanded: 'disbanded', // 已解散
  Archived: 'archived', // 已归档（关联活动结束）
} as const;
export type TeamStatus = (typeof TeamStatus)[keyof typeof TeamStatus];

/** 赛事状态（状态机 4.8，P2） */
export const TournamentStatus = {
  Signup: 'signup',
  Scheduling: 'scheduling',
  Ongoing: 'ongoing',
  Settled: 'settled',
} as const;
export type TournamentStatus = (typeof TournamentStatus)[keyof typeof TournamentStatus];

/** 账务流水来源（4.9，只增不减；余额=流水汇总） */
export const XpLedgerSource = {
  Checkin: 'checkin',
  ActivityReward: 'activity_reward',
  AdminGift: 'admin_gift',
  Adjustment: 'adjustment', // 冲正调整（P9-18）
} as const;
export type XpLedgerSource = (typeof XpLedgerSource)[keyof typeof XpLedgerSource];

export const PointLedgerSource = {
  Tournament: 'tournament',
  ActivityReward: 'activity_reward',
  AdminGift: 'admin_gift',
  Adjustment: 'adjustment',
} as const;
export type PointLedgerSource = (typeof PointLedgerSource)[keyof typeof PointLedgerSource];

/** 通知类型（F1，Tab：全部/回复与@/点赞/审核与报名/经验·积分） */
export const NotificationType = {
  ReplyAt: 'reply_at',
  Like: 'like',
  ReviewSignup: 'review_signup',
  XpPoint: 'xp_point',
  System: 'system',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

/** 等级段位（G2，Lv1–20 / 5 段位；阈值见 level_tier 快照表） */
export const LEVEL_TIERS = [
  { name: '见习', minLevel: 1, maxLevel: 4 },
  { name: '常驻', minLevel: 5, maxLevel: 8 },
  { name: '活跃', minLevel: 9, maxLevel: 12 },
  { name: '元老', minLevel: 13, maxLevel: 16 },
  { name: '传奇', minLevel: 17, maxLevel: 20 },
] as const;

/** 升级曲线：Lv n→n+1 需 100×n；累计 E(n)=50×n×(n−1)；Lv20 需 19,000（P9-16 默认，后台可改） */
export function xpThreshold(level: number): number {
  return 50 * level * (level - 1);
}
export const MAX_LEVEL = 20;
