"use client";

import { useState, useEffect, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { siteConfig, demoModels } from "@/config/site-config";

const capabilities = [
  { index: "01", title: "统一 API 接入", text: "沿用熟悉的请求格式，让不同模型保持一致的接入体验。" },
  { index: "02", title: "Key 与额度", text: "按成员创建凭证、分配额度，并在需要时立即停用。" },
  { index: "03", title: "模型路由", text: "为不同任务预留清晰的模型选择与故障切换能力。" },
  { index: "04", title: "企业团队管理", text: "把成员、预算、用量、账单与发票收进一个工作台。" },
] as const;

export default function Home() {
  const router = useRouter();
  const [appsOpen, setAppsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAppsOpen, setMobileAppsOpen] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { setAppsOpen(false); setMobileOpen(false); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("modal-open", mobileOpen);
    return () => document.body.classList.remove("modal-open");
  }, [mobileOpen]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand-link" href="/">
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-name">{siteConfig.productName}</span>
          </a>
          <nav className="desktop-nav" aria-label="主导航">
            <a className="nav-link" href="/models">模型广场</a>
            <div className="nav-menu-wrap">
              <button className="nav-menu-button" type="button" aria-expanded={appsOpen} aria-controls="enterprise-menu"
                onClick={() => setAppsOpen((o) => !o)}>
                企业应用 <span className="chevron" aria-hidden="true">⌄</span>
              </button>
              {appsOpen && (
                <div className="enterprise-menu" id="enterprise-menu">
                  {siteConfig.enterpriseApps.map((app) => (
                    <a href={app.href} key={app.name} onClick={() => setAppsOpen(false)}>
                      <span className="menu-app-mark" aria-hidden="true">{app.short}</span>
                      <span><strong>{app.name}</strong><small>{app.type}</small></span>
                      <span className="menu-arrow" aria-hidden="true">→</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </nav>
          <div className="header-actions">
            <a className="auth-link" href="/login">登录</a>
            <a className="button button-primary header-console" href="/login">控制台</a>
          </div>
          <button className="mobile-toggle" type="button" aria-label={mobileOpen ? "关闭" : "菜单"} aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav className="mobile-drawer" aria-label="移动端导航">
          <a href="/models" onClick={() => setMobileOpen(false)}>模型广场 <span aria-hidden="true">→</span></a>
          <button className="mobile-accordion-button" type="button" aria-expanded={mobileAppsOpen}
            onClick={() => setMobileAppsOpen((o) => !o)}>
            企业应用 <span aria-hidden="true">{mobileAppsOpen ? "−" : "+"}</span>
          </button>
          {mobileAppsOpen && (
            <div className="mobile-apps">
              {siteConfig.enterpriseApps.map((app) => (
                <a href={app.href} key={app.name} onClick={() => setMobileOpen(false)}>
                  <span>{app.name}</span><small>{app.type}</small>
                </a>
              ))}
            </div>
          )}
          <div className="mobile-auth-actions">
            <a className="button button-secondary" href="/login">登录 / 注册</a>
            <a className="button button-primary" href="/login">控制台</a>
          </div>
        </nav>
      )}

      <main>
        <section className="hero section-container">
          <div className="hero-copy">
            <div className="eyebrow">limAPI · AI API Gateway</div>
            <h1>一个 API，连接<br />每一种 AI</h1>
            <p className="hero-lede">统一接入多种 AI 模型，集中管理 Key、团队额度、调用用量与账单。</p>
            <div className="button-row">
              <a className="button button-primary" href="/login">进入控制台</a>
              <a className="button button-secondary" href="/models">查看模型</a>
            </div>
            <div className="hero-proof" aria-label="平台特点">
              <span>一个接口</span><span>多种模型</span><span>人民币结算</span>
            </div>
          </div>
          <div className="api-window" aria-label="API 调用界面示意">
            <div className="window-bar">
              <div className="window-dots" aria-hidden="true"><span /><span /><span /></div>
              <span className="window-title">API 请求 · 静态演示</span>
              <span className="status-badge">200 OK</span>
            </div>
            <div className="api-content">
              <div className="endpoint-row"><span className="method">POST</span><code>/v1/chat/completions</code></div>
              <div className="code-block" aria-label="请求示例">
                <div><span className="code-muted">{`{`}</span></div>
                <div className="code-indent"><span className="code-key">&quot;model&quot;</span>: <span className="code-string">&quot;atlas-chat-v2&quot;</span>,</div>
                <div className="code-indent"><span className="code-key">&quot;messages&quot;</span>: <span className="code-muted">[...]</span>,</div>
                <div className="code-indent"><span className="code-key">&quot;stream&quot;</span>: <span className="code-value">true</span></div>
                <div><span className="code-muted">{`}`}</span></div>
              </div>
              <div className="response-card">
                <div className="response-head"><span>模拟响应</span><span className="response-meta">780 ms · ¥0.018</span></div>
                <p>统一接收请求，并按策略连接适合的模型服务。</p>
              </div>
              <div className="api-footnote"><span className="demo-dot" aria-hidden="true" /> 静态演示，不会发送请求或产生费用</div>
            </div>
          </div>
        </section>

        <section className="models-section section-pad" id="models">
          <div className="section-container">
            <div className="section-heading-row">
              <div className="section-heading">
                <div className="eyebrow">模型广场</div>
                <h2>需要的模型，都从这里调用</h2>
                <p>保持同一种接入方式，按任务选择合适的模型。</p>
              </div>
              <a className="text-link" href="/models">浏览全部模型 <span aria-hidden="true">→</span></a>
            </div>
            <div className="demo-notice" role="note">演示数据：模型、价格与状态仅用于界面预览，不代表已接入或可调用。</div>
            <div className="model-grid">
              {demoModels.slice(0, 6).map((model) => (
                <a className="model-card" href={`/models#${model.id}`} key={model.id}>
                  <div className="model-card-top">
                    <span className="provider-mark" aria-hidden="true">{model.mark}</span>
                    <span className={`model-status status-${model.statusTone}`}>{model.status}</span>
                  </div>
                  <h3>{model.name}</h3>
                  <code className="model-id">{model.id}</code>
                  <p>{model.summary}</p>
                  <div className="model-tags" aria-label="模型能力">{model.capabilities.slice(0, 3).map((c) => (<span key={c}>{c}</span>))}</div>
                  <div className="model-price-row">
                    <div><span>输入</span><strong>{model.inputPrice}</strong></div>
                    <div><span>输出</span><strong>{model.outputPrice}</strong></div>
                  </div>
                  <div className="model-card-bottom"><span>上下文 {model.context}</span><span aria-hidden="true">↗</span></div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="apps-section section-pad" id="enterprise-apps">
          <div className="section-container">
            <div className="section-heading centered-heading">
              <div className="eyebrow">企业应用</div>
              <h2>从开发到交付，连接企业 AI 场景</h2>
              <p>三项应用，共用清晰的品牌入口与登录体验。</p>
            </div>
            <div className="app-grid">
              {[
                { num: "01", name: "iSee Dev", type: "编程平台", href: "/login?app=isee-dev" },
                { num: "02", name: "QQSora", type: "视频生成平台", href: "/login?app=qqsora" },
                { num: "03", name: "limAPI 企业版", type: "企业中转站", href: "/login?app=aliapi-enterprise" },
              ].map((app) => (
                <article className="app-card" key={app.num}>
                  <div className="app-copy">
                    <span className="app-number">{app.num}</span>
                    <div><h3>{app.name}</h3><p>{app.type}</p></div>
                    <a href={app.href}>进入应用 <span aria-hidden="true">→</span></a>
                  </div>
                  <div className="app-preview" aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="capabilities-section section-pad">
          <div className="section-container">
            <div className="section-heading">
              <div className="eyebrow">平台能力</div>
              <h2>每一次调用，都更清楚</h2>
              <p>从第一把密钥到整支团队，保留必要的控制能力。</p>
            </div>
            <div className="capability-grid">
              {capabilities.map((cap) => (
                <article className="capability-card" key={cap.index}>
                  <span>{cap.index}</span>
                  <h3>{cap.title}</h3>
                  <p>{cap.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta section-container">
          <div>
            <div className="eyebrow">{siteConfig.brandLine}</div>
            <h2>从一次调用开始</h2>
            <p>先查看模型，再进入控制台完成你的第一步。</p>
          </div>
          <div className="button-row">
            <a className="button button-primary" href="/login">进入控制台</a>
            <a className="button button-secondary" href="/models">查看模型</a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="section-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a className="brand-link" href="/">
                <span className="brand-mark" aria-hidden="true" />
                <span className="brand-name">{siteConfig.productName}</span>
              </a>
              <p>{siteConfig.brandLine}</p>
              <small>{siteConfig.englishLine}</small>
            </div>
            <div className="footer-column"><h3>产品</h3><a href="/models">模型广场</a><a href="/login">控制台</a><a href="/login">Key 管理</a></div>
            <div className="footer-column"><h3>企业应用</h3>{siteConfig.enterpriseApps.map((app) => <a href={app.href} key={app.name}>{app.name}</a>)}</div>
            <div className="footer-column"><h3>服务</h3><a href="#">用户协议（示意）</a><a href="#">隐私政策（示意）</a><a href="#">联系我们</a></div>
          </div>
          <div className="footer-bottom"><span>{siteConfig.copyright}</span><a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">{siteConfig.icp}</a></div>
        </div>
      </footer>

      <style>{`
        .mobile-drawer { position: fixed; inset: 64px 0 0; z-index: 45; display: flex; flex-direction: column; padding: 20px 16px 24px; background: white; overflow-y: auto; }
        .mobile-drawer > a, .mobile-accordion-button { width: 100%; min-height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; border: 0; border-bottom: 1px solid var(--hairline-soft); background: white; font-size: 15px; font-weight: 500; text-align: left; }
        .mobile-apps { padding: 8px; background: var(--surface-soft); border-radius: 10px; }
        .mobile-apps a { display: flex; justify-content: space-between; padding: 14px 12px; border-bottom: 1px solid var(--hairline); font-size: 13px; text-decoration: none; color: inherit; }
        .mobile-auth-actions { margin-top: auto; padding-top: 24px; display: grid; gap: 10px; }
        .mobile-auth-actions a { width: 100%; text-decoration: none; }
        .footer-brand-link { color: white; }
      `}</style>
    </div>
  );
}
