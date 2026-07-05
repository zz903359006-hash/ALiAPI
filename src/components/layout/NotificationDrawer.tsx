"use client";

import { useRouter } from "next/navigation";

interface NotificationItem {
  id: number;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const fakeNotifications: NotificationItem[] = [
  { id: 1, title: "额度不足提醒", body: "您的 API 调用额度已使用 85%，请及时充值。", time: "10 分钟前", read: false },
  { id: 2, title: "新版本发布", body: "AliAPI v2.3.0 已发布，新增 Auto 路由权重配置功能。", time: "1 小时前", read: false },
  { id: 3, title: "Key 即将过期", body: "调用 Key sk-xxx...abc 将在 7 天后过期，请及时续期。", time: "3 小时前", read: true },
  { id: 4, title: "团队邀请", body: "zhang@example.com 已接受您的团队邀请。", time: "昨天", read: true },
  { id: 5, title: "账单生成", body: "2026 年 5 月账单已生成，请前往查看。", time: "2 天前", read: true },
];

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const router = useRouter();
  if (!open) return null;

  const unreadCount = fakeNotifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-lg"
        style={{
          width: 380,
          maxWidth: "100vw",
          backgroundColor: "var(--color-canvas)",
          borderLeft: "1px solid var(--color-hairline)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            height: 64,
            paddingLeft: "var(--spacing-lg)",
            paddingRight: "var(--spacing-lg)",
            borderBottom: "1px solid var(--color-hairline)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
            <h2
              style={{
                fontSize: "var(--text-title-md)",
                fontWeight: 600,
                lineHeight: "var(--text-title-md--line-height)",
                color: "var(--color-ink)",
                fontFamily: "var(--font-display)",
              }}
            >
              通知
            </h2>
            {unreadCount > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 20,
                  minWidth: 20,
                  paddingLeft: "var(--spacing-xxs)",
                  paddingRight: "var(--spacing-xxs)",
                  fontSize: "var(--text-caption)",
                  fontWeight: 500,
                  color: "var(--color-on-primary)",
                  backgroundColor: "var(--color-primary)",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-full)",
              border: "none",
              backgroundColor: "transparent",
              color: "var(--color-muted)",
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {fakeNotifications.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "var(--spacing-md) var(--spacing-lg)",
                borderBottom: "1px solid var(--color-hairline-soft)",
                backgroundColor: item.read ? "transparent" : "var(--color-surface-soft)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--text-body-sm)",
                  fontWeight: 600,
                  lineHeight: "var(--text-body-sm--line-height)",
                  color: "var(--color-ink)",
                  marginBottom: "var(--spacing-xxs)",
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontSize: "var(--text-caption)",
                  fontWeight: 400,
                  lineHeight: "var(--text-caption--line-height)",
                  color: "var(--color-body)",
                  marginBottom: "var(--spacing-xxs)",
                }}
              >
                {item.body}
              </div>
              <div
                style={{
                  fontSize: "var(--text-caption)",
                  fontWeight: 400,
                  color: "var(--color-muted)",
                }}
              >
                {item.time}
              </div>
            </div>
          ))}
        </div>

        {/* Footer — "查看全部通知设置" */}
        <div
          className="shrink-0"
          style={{
            padding: "var(--spacing-md) var(--spacing-lg)",
            borderTop: "1px solid var(--color-hairline)",
          }}
        >
          <button
            onClick={() => {
              onClose();
              router.push("/settings?tab=通知与告警");
            }}
            style={{
              width: "100%",
              height: 40,
              fontSize: "var(--text-button)",
              fontWeight: 600,
              lineHeight: "var(--text-button--line-height)",
              color: "var(--color-ink)",
              backgroundColor: "var(--color-canvas)",
              border: "1px solid var(--color-hairline)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
            }}
          >
            查看全部通知设置
          </button>
        </div>
      </div>
    </>
  );
}
