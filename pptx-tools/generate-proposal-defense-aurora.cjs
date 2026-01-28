/* eslint-disable no-console */
/**
 * Aurora Minimal Tech (Light Mode · Product Launch)
 * Target: 8-minute proposal defense, 10 slides, high readability on bright projectors.
 *
 * Output: ../Equivocal_Legal_Masterpiece_opening_v2.pptx
 */
const path = require("path");
const pptxgen = require("pptxgenjs");

const SLIDE_W = 13.333; // inches, LAYOUT_WIDE
const SLIDE_H = 7.5;

const COLORS = {
  bg: "FFFFFF",
  bgSoft: "F6F8FC",
  ink: "0B1220",
  slate: "334155",
  muted: "64748B",
  line: "E2E8F0",
  card: "FFFFFF",
  cardSoft: "F8FAFF",
  blue: "2D6BFF",
  purple: "6A5CFF",
  cyan: "00C2FF",
  red: "EF4444",
};

const FONTS = {
  zh: "Microsoft YaHei",
  en: "Segoe UI",
  mono: "Consolas",
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function addLightGrid(slide, { step = 0.6, transparency = 94 } = {}) {
  for (let x = 0; x <= SLIDE_W; x += step) {
    slide.addShape("line", {
      x,
      y: 0,
      w: 0,
      h: SLIDE_H,
      line: { color: COLORS.line, width: 0.35, transparency },
    });
  }
  for (let y = 0; y <= SLIDE_H; y += step) {
    slide.addShape("line", {
      x: 0,
      y,
      w: SLIDE_W,
      h: 0,
      line: { color: COLORS.line, width: 0.35, transparency },
    });
  }
}

function addAurora(slide) {
  // Corner glows (very subtle) – keep text area clean.
  slide.addShape("ellipse", {
    x: -2.1,
    y: -1.8,
    w: 6.2,
    h: 6.2,
    fill: { color: COLORS.blue, transparency: 92 },
    line: { color: COLORS.blue, transparency: 92 },
  });
  slide.addShape("ellipse", {
    x: SLIDE_W - 4.2,
    y: SLIDE_H - 4.4,
    w: 6.0,
    h: 6.0,
    fill: { color: COLORS.purple, transparency: 93 },
    line: { color: COLORS.purple, transparency: 93 },
  });
}

function addMeta(slide, { section, page, total = 10 } = {}) {
  const left = section ? `${section} // ` : "";
  slide.addText(`${left}EQUIVOCAL_LEGAL // PROPOSAL_DEFENSE`, {
    x: 0.9,
    y: 0.28,
    w: SLIDE_W - 1.8,
    h: 0.25,
    fontFace: FONTS.mono,
    fontSize: 10,
    color: COLORS.muted,
    letterSpacing: 1,
  });
  if (page) {
    slide.addText(`${String(page).padStart(2, "0")}/${String(total).padStart(2, "0")}`, {
      x: SLIDE_W - 1.7,
      y: 0.28,
      w: 0.8,
      h: 0.25,
      fontFace: FONTS.mono,
      fontSize: 10,
      color: COLORS.muted,
      align: "right",
      letterSpacing: 1,
    });
  }
}

function addTitle(slide, { title, subtitle, accent = COLORS.blue } = {}) {
  const x = 0.9;
  const y = 0.85;
  const titleLines = String(title).split("\n").length;
  const titleFontSize = titleLines >= 2 ? 34 : 38;
  const titleBoxH = titleLines >= 2 ? 1.05 : 0.72;

  slide.addText(title, {
    x,
    y,
    w: SLIDE_W - 1.8,
    h: titleBoxH,
    fontFace: FONTS.zh,
    fontSize: titleFontSize,
    bold: true,
    color: COLORS.ink,
    lineSpacingMultiple: 0.95,
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x,
      y: y + titleBoxH + 0.05,
      w: SLIDE_W - 1.8,
      h: 0.45,
      fontFace: FONTS.zh,
      fontSize: 16,
      color: COLORS.muted,
    });
  }

  const underlineY = y + titleBoxH + (subtitle ? 0.62 : 0.28);
  slide.addShape("line", {
    x,
    y: underlineY,
    w: 2.6,
    h: 0,
    line: { color: accent, width: 5 },
  });
  slide.addShape("line", {
    x: x + 2.7,
    y: underlineY,
    w: SLIDE_W - x - 2.9,
    h: 0,
    line: { color: COLORS.line, width: 1 },
  });
}

function addChip(slide, { x, y, text, accent = COLORS.blue } = {}) {
  const w = clamp(0.75 + String(text).length * 0.11, 1.4, 3.6);
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h: 0.36,
    fill: { color: COLORS.cardSoft },
    line: { color: accent, width: 1 },
    radius: 0.18,
  });
  slide.addText(text, {
    x: x + 0.16,
    y: y + 0.07,
    w: w - 0.3,
    h: 0.22,
    fontFace: FONTS.mono,
    fontSize: 10,
    color: accent,
    letterSpacing: 1,
  });
}

function addCard(slide, { x, y, w, h, accent, title, lines } = {}) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    fill: { color: COLORS.card },
    line: { color: COLORS.line, width: 1 },
    radius: 0.18,
    shadow: { color: "000000", opacity: 0.06, blur: 6, angle: 45, distance: 2 },
  });

  slide.addShape("rect", {
    x,
    y,
    w: 0.08,
    h,
    fill: { color: accent },
    line: { color: accent },
  });

  slide.addText(title, {
    x: x + 0.22,
    y: y + 0.2,
    w: w - 0.35,
    h: 0.35,
    fontFace: FONTS.zh,
    fontSize: 16,
    bold: true,
    color: COLORS.ink,
  });

  slide.addText(lines.join("\n"), {
    x: x + 0.22,
    y: y + 0.65,
    w: w - 0.35,
    h: h - 0.85,
    fontFace: FONTS.zh,
    fontSize: 13,
    color: COLORS.slate,
    valign: "top",
    lineSpacingMultiple: 1.1,
  });
}

function addBullets(slide, bullets, { x, y, w, h, fontSize = 16, color = COLORS.slate } = {}) {
  const items = bullets.map((text) => ({
    text,
    options: { bullet: { indent: fontSize }, hanging: clamp(Math.round(fontSize * 0.3), 3, 6) },
  }));
  slide.addText(items, {
    x,
    y,
    w,
    h,
    fontFace: FONTS.zh,
    fontSize,
    color,
    valign: "top",
    lineSpacingMultiple: 1.12,
  });
}

function addPipeline(slide, { x, y, w, items } = {}) {
  const boxW = (w - 0.4 * (items.length - 1)) / items.length;
  const boxH = 1.15;
  items.forEach((it, i) => {
    const bx = x + i * (boxW + 0.4);
    slide.addShape("roundRect", {
      x: bx,
      y,
      w: boxW,
      h: boxH,
      fill: { color: COLORS.card },
      line: { color: COLORS.line, width: 1 },
      radius: 0.18,
    });
    slide.addShape("rect", { x: bx, y, w: 0.08, h: boxH, fill: { color: it.accent }, line: { color: it.accent } });
    slide.addText(it.title, {
      x: bx + 0.22,
      y: y + 0.2,
      w: boxW - 0.35,
      h: 0.3,
      fontFace: FONTS.zh,
      fontSize: 14,
      bold: true,
      color: COLORS.ink,
    });
    slide.addText(it.desc, {
      x: bx + 0.22,
      y: y + 0.55,
      w: boxW - 0.35,
      h: 0.5,
      fontFace: FONTS.zh,
      fontSize: 11,
      color: COLORS.muted,
    });
    if (i < items.length - 1) {
      slide.addShape("rightArrow", {
        x: bx + boxW + 0.1,
        y: y + 0.33,
        w: 0.35,
        h: 0.5,
        fill: { color: "94A3B8" },
        line: { color: "94A3B8" },
      });
    }
  });
}

function build() {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Equivocal Legal";
  pptx.company = "Equivocal";
  pptx.subject = "毕业设计开题答辩（Light Mode · 产品发布会风）";
  pptx.title = "Equivocal Legal 开题答辩";
  pptx.theme = { headFontFace: FONTS.zh, bodyFontFace: FONTS.zh, lang: "zh-CN" };

  // Slide 1: Cover (Light mode, aurora + blueprint grid)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bgSoft };
    addLightGrid(slide, { transparency: 95 });
    addAurora(slide);
    addMeta(slide, { section: "COVER", page: 1 });

    slide.addShape("rect", { x: 0, y: 0, w: 0.16, h: SLIDE_H, fill: { color: COLORS.blue }, line: { color: COLORS.blue } });
    addChip(slide, { x: 0.9, y: 0.55, text: "LIGHT_MODE // LAUNCH_STYLE", accent: COLORS.blue });

    slide.addText("EQUIVOCAL LEGAL", {
      x: 0.9,
      y: 2.15,
      w: SLIDE_W - 1.8,
      h: 0.8,
      fontFace: FONTS.en,
      fontSize: 54,
      bold: true,
      color: COLORS.ink,
    });
    slide.addText("法律智能体系统 · 开题答辩", {
      x: 0.9,
      y: 3.05,
      w: SLIDE_W - 1.8,
      h: 0.4,
      fontFace: FONTS.zh,
      fontSize: 22,
      bold: true,
      color: COLORS.slate,
    });
    slide.addText("系统工程实现主线：可控、可追溯、可验收", {
      x: 0.9,
      y: 3.55,
      w: SLIDE_W - 1.8,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 16,
      color: COLORS.muted,
    });

    slide.addShape("line", { x: 0.9, y: 4.15, w: 4.0, h: 0, line: { color: COLORS.cyan, width: 4 } });

    slide.addText(
      ["姓名：__________", "学号：__________", "学院/专业：__________", "指导教师：__________", "日期：____年__月__日"].join("\n"),
      {
        x: 0.9,
        y: 4.55,
        w: 6.8,
        h: 1.7,
        fontFace: FONTS.zh,
        fontSize: 14,
        color: COLORS.slate,
      }
    );

    slide.addText("SYSTEM_STATUS: ONLINE  //  VERSION: v2.0  //  CN_REGION", {
      x: 0.9,
      y: 7.08,
      w: SLIDE_W - 1.8,
      h: 0.25,
      fontFace: FONTS.mono,
      fontSize: 10,
      color: "94A3B8",
      letterSpacing: 1,
    });
  }

  // Slide 2: Background & pain points
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    addMeta(slide, { section: "BACKGROUND", page: 2 });
    addTitle(slide, {
      title: "为什么需要法律智能体：\n成本高、风险大、检索难",
      subtitle: "开题阶段重点：把咨询链路工程化，让结果可追溯、可验收。",
      accent: COLORS.blue,
    });
    addChip(slide, { x: SLIDE_W - 3.2, y: 1.62, text: "BRIGHT_PROJECTOR_READY", accent: COLORS.cyan });

    const y = 2.55;
    const w = (SLIDE_W - 0.9 * 2 - 0.5 * 2) / 3;

    addCard(slide, {
      x: 0.9,
      y,
      w,
      h: 3.25,
      accent: COLORS.blue,
      title: "成本不可控",
      lines: ["咨询成本高且不透明", "普通用户缺乏入口与判断标准", "→ 需要更低门槛的“第一步建议”"],
    });
    addCard(slide, {
      x: 0.9 + w + 0.5,
      y,
      w,
      h: 3.25,
      accent: COLORS.red,
      title: "风险难识别",
      lines: ["合同条款晦涩", "风险点隐藏深、后果严肃", "→ 需要结构化风险提示与边界声明"],
    });
    addCard(slide, {
      x: 0.9 + (w + 0.5) * 2,
      y,
      w,
      h: 3.25,
      accent: COLORS.purple,
      title: "检索碎片化",
      lines: ["法规/案例/流程分散", "语境难对齐、检索成本高", "→ 需要可扩展的知识挂载（RAG）"],
    });

    slide.addShape("roundRect", {
      x: 0.9,
      y: 6.15,
      w: SLIDE_W - 1.8,
      h: 0.75,
      fill: { color: COLORS.bgSoft },
      line: { color: COLORS.line, width: 1 },
      radius: 0.18,
    });
    slide.addText("机会点：让用户在 3 分钟内得到“可执行的下一步”，并把对话沉淀为可追溯记录。", {
      x: 1.15,
      y: 6.33,
      w: SLIDE_W - 2.3,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 16,
      bold: true,
      color: COLORS.ink,
    });
  }

  // Slide 3: Goals & scope (MVP + non-goals)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    addMeta(slide, { section: "GOAL & SCOPE", page: 3 });
    addTitle(slide, {
      title: "目标与边界：先把“能用且可验收”做出来",
      subtitle: "系统工程口径：每个功能都要可追溯、可回放、可测试。",
      accent: COLORS.cyan,
    });

    slide.addShape("roundRect", {
      x: 0.9,
      y: 2.55,
      w: 6.25,
      h: 4.65,
      fill: { color: COLORS.card },
      line: { color: COLORS.line },
      radius: 0.18,
    });
    slide.addShape("roundRect", {
      x: 7.25,
      y: 2.55,
      w: 5.18,
      h: 4.65,
      fill: { color: COLORS.card },
      line: { color: COLORS.line },
      radius: 0.18,
    });

    slide.addText("目标（本次开题交付）", {
      x: 1.15,
      y: 2.75,
      w: 5.8,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 16,
      bold: true,
      color: COLORS.ink,
    });
    addBullets(
      slide,
      ["完成认证与权限边界（邮箱验证码 + JWT）", "实现咨询对话（流式输出）与会话管理", "输出风险提示/边界声明 + 审计日志落库"],
      { x: 1.15, y: 3.2, w: 5.9, h: 2.1, fontSize: 15, color: COLORS.slate }
    );

    slide.addShape("line", { x: 1.15, y: 5.45, w: 5.8, h: 0, line: { color: COLORS.line, width: 1 } });
    slide.addText("非目标（明确不做）", {
      x: 1.15,
      y: 5.62,
      w: 5.8,
      h: 0.28,
      fontFace: FONTS.zh,
      fontSize: 13,
      bold: true,
      color: COLORS.muted,
    });
    addBullets(slide, ["不承诺“万能回答”", "不做复杂动画与花哨特效", "不深度覆盖全部法律领域"], {
      x: 1.15,
      y: 5.92,
      w: 5.9,
      h: 1.2,
      fontSize: 13,
      color: COLORS.muted,
    });

    slide.addText("MVP 组成", {
      x: 7.5,
      y: 2.75,
      w: 4.8,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 16,
      bold: true,
      color: COLORS.ink,
    });
    addBullets(slide, ["认证系统（邮箱验证码）", "会话系统（sessions/messages）", "咨询接口（/chat/stream）", "日志审计（traceId）", "基础管理（可选）"], {
      x: 7.5,
      y: 3.2,
      w: 4.8,
      h: 3.7,
      fontSize: 15,
      color: COLORS.slate,
    });

    slide.addShape("rect", { x: 0.9, y: 2.55, w: 0.08, h: 4.65, fill: { color: COLORS.cyan }, line: { color: COLORS.cyan } });
  }

  // Slide 4: Solution overview (one sentence + pipeline)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bgSoft };
    addLightGrid(slide, { transparency: 95 });
    addMeta(slide, { section: "SOLUTION", page: 4 });
    addTitle(slide, {
      title: "一句话方案：把“咨询”工程化",
      subtitle: "前端负责体验，后端负责审计与持久化，AI 负责推理与生成，数据负责追溯与复盘。",
      accent: COLORS.purple,
    });
    addChip(slide, { x: SLIDE_W - 2.55, y: 1.62, text: "END_TO_END", accent: COLORS.blue });

    addPipeline(slide, {
      x: 0.9,
      y: 2.75,
      w: SLIDE_W - 1.8,
      items: [
        { title: "Frontend", desc: "交互/UI\nSSE 渲染", accent: COLORS.blue },
        { title: "Backend", desc: "鉴权/网关\n审计落库", accent: COLORS.cyan },
        { title: "AI", desc: "Agent/RAG\n工具调用", accent: COLORS.purple },
        { title: "Data", desc: "MySQL\n可追溯", accent: COLORS.blue },
      ],
    });

    addCard(slide, {
      x: 0.9,
      y: 4.35,
      w: 12.55,
      h: 2.65,
      accent: COLORS.blue,
      title: "发布会式口径（建议背诵）",
      lines: ["我做的不是“聊天机器人”，而是一个“有边界、有日志、有验收口径”的咨询系统。", "所有输出绑定会话，附带 traceId，便于复盘与评估。", "AI 可切换/可降级：默认可用 → 不可用时返回可执行的替代方案。"],
    });
  }

  // Slide 5: Architecture (main visual)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bgSoft };
    addLightGrid(slide, { transparency: 95 });
    addAurora(slide);
    addMeta(slide, { section: "ARCHITECTURE", page: 5 });
    addTitle(slide, {
      title: "系统总体架构：四层拆分保证可控与可追溯",
      subtitle: "边界清晰：密钥/审计/存储在服务端，前端只保留体验逻辑。",
      accent: COLORS.blue,
    });

    const y = 2.65;
    const boxH = 1.2;
    const boxW = 2.7;
    const gap = 0.42;
    const startX = 0.85;

    const layers = [
      { label: "Web 前端", sub: "Next.js / UI / SSE", accent: COLORS.blue },
      { label: "后端核心", sub: "Java / Auth / Audit", accent: COLORS.cyan },
      { label: "AI 服务", sub: "Agent / RAG / Tools", accent: COLORS.purple },
      { label: "数据层", sub: "MySQL / Object / Vector", accent: COLORS.blue },
    ];

    layers.forEach((b, i) => {
      const x = startX + i * (boxW + gap);
      slide.addShape("roundRect", {
        x,
        y,
        w: boxW,
        h: boxH,
        fill: { color: COLORS.card },
        line: { color: COLORS.line, width: 1 },
        radius: 0.18,
      });
      slide.addShape("rect", { x, y, w: 0.08, h: boxH, fill: { color: b.accent }, line: { color: b.accent } });
      slide.addText(b.label, { x: x + 0.22, y: y + 0.2, w: boxW - 0.35, h: 0.3, fontFace: FONTS.zh, fontSize: 15, bold: true, color: COLORS.ink });
      slide.addText(b.sub, { x: x + 0.22, y: y + 0.58, w: boxW - 0.35, h: 0.35, fontFace: FONTS.zh, fontSize: 11, color: COLORS.muted });

      if (i < layers.length - 1) {
        slide.addShape("rightArrow", {
          x: x + boxW + 0.12,
          y: y + 0.35,
          w: 0.42,
          h: 0.5,
          fill: { color: "94A3B8" },
          line: { color: "94A3B8" },
        });
      }
    });

    addCard(slide, {
      x: 0.9,
      y: 4.3,
      w: 12.55,
      h: 2.55,
      accent: COLORS.cyan,
      title: "关键工程点（评审最关心）",
      lines: ["统一鉴权与权限边界：避免前端直接暴露模型密钥与业务逻辑。", "审计与追溯：所有请求/响应绑定 traceId，支持回放与验收。", "可切换/可降级：AI 不可用时走规则化 fallback（降低失败成本）。"],
    });
  }

  // Slide 6: Core modules & APIs
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    addMeta(slide, { section: "MODULES", page: 6 });
    addTitle(slide, {
      title: "核心模块与接口：工程实现如何落地",
      subtitle: "重点不是“能调通”，而是“可维护、可测试、可追溯”。",
      accent: COLORS.blue,
    });

    // Left: modules
    addCard(slide, {
      x: 0.9,
      y: 2.6,
      w: 6.05,
      h: 4.35,
      accent: COLORS.blue,
      title: "模块拆分（Backend）",
      lines: [
        "Auth：邮箱验证码 / JWT / 角色权限",
        "Session：会话创建/列表/删除",
        "Chat：流式转发 / 限流 / 超时",
        "Audit：traceId / 事件日志 / 关键字段",
        "File（可选）：合同上传 / 解析入口",
      ],
    });

    // Right: API
    slide.addShape("roundRect", {
      x: 7.25,
      y: 2.6,
      w: 5.18,
      h: 4.35,
      fill: { color: COLORS.card },
      line: { color: COLORS.line, width: 1 },
      radius: 0.18,
      shadow: { color: "000000", opacity: 0.06, blur: 6, angle: 45, distance: 2 },
    });
    slide.addShape("rect", { x: 7.25, y: 2.6, w: 0.08, h: 4.35, fill: { color: COLORS.purple }, line: { color: COLORS.purple } });
    slide.addText("关键接口（示例）", {
      x: 7.47,
      y: 2.8,
      w: 4.75,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 16,
      bold: true,
      color: COLORS.ink,
    });
    const apiText = [
      "POST  /api/auth/code",
      "POST  /api/auth/login",
      "GET   /api/sessions",
      "POST  /api/chat/stream   (SSE)",
      "GET   /api/audit?traceId=…",
    ].join("\n");
    slide.addText(apiText, {
      x: 7.55,
      y: 3.25,
      w: 4.75,
      h: 2.0,
      fontFace: FONTS.mono,
      fontSize: 13,
      color: COLORS.slate,
      lineSpacingMultiple: 1.15,
    });
    slide.addText("关键约束：所有返回都带 traceId；失败也要可追溯。", {
      x: 7.55,
      y: 5.35,
      w: 4.75,
      h: 0.9,
      fontFace: FONTS.zh,
      fontSize: 13,
      color: COLORS.muted,
      lineSpacingMultiple: 1.1,
    });
  }

  // Slide 7: Data model
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    addMeta(slide, { section: "DATA", page: 7 });
    addTitle(slide, {
      title: "数据模型：让对话可追溯、可管理",
      subtitle: "开题阶段保持最小集合：users / sessions / messages / codes。",
      accent: COLORS.cyan,
    });

    const y = 2.7;
    const cardW = 3.45;
    const cardH = 2.05;
    const x1 = 0.9;
    const x2 = x1 + cardW + 0.7;
    const x3 = x2 + cardW + 0.7;

    addCard(slide, {
      x: x1,
      y,
      w: cardW,
      h: cardH,
      accent: COLORS.blue,
      title: "users",
      lines: ["id / email", "passwordHash", "role / createdAt"],
    });
    addCard(slide, {
      x: x2,
      y,
      w: cardW,
      h: cardH,
      accent: COLORS.cyan,
      title: "sessions",
      lines: ["id / userId", "title / status", "traceRoot / createdAt"],
    });
    addCard(slide, {
      x: x3,
      y,
      w: cardW,
      h: cardH,
      accent: COLORS.purple,
      title: "messages",
      lines: ["id / sessionId", "role / content", "traceId / tokens / createdAt"],
    });
    addCard(slide, {
      x: x1,
      y: y + cardH + 0.6,
      w: cardW,
      h: cardH,
      accent: COLORS.red,
      title: "codes",
      lines: ["email / code", "expiresAt / used", "anti-abuse fields"],
    });

    slide.addShape("roundRect", {
      x: x2,
      y: y + cardH + 0.6,
      w: cardW + 0.7 + cardW,
      h: cardH,
      fill: { color: COLORS.bgSoft },
      line: { color: COLORS.line, width: 1 },
      radius: 0.18,
    });
    slide.addText("追溯字段（关键）", {
      x: x2 + 0.22,
      y: y + cardH + 0.8,
      w: cardW + 0.7 + cardW - 0.35,
      h: 0.3,
      fontFace: FONTS.zh,
      fontSize: 15,
      bold: true,
      color: COLORS.ink,
    });
    slide.addText(["traceRoot（会话级）", "traceId（消息级）", "provider/model（模型信息）", "latency/tokens（性能信息）"].join("  ·  "), {
      x: x2 + 0.22,
      y: y + cardH + 1.2,
      w: cardW + 0.7 + cardW - 0.35,
      h: 0.8,
      fontFace: FONTS.zh,
      fontSize: 13,
      color: COLORS.slate,
    });
  }

  // Slide 8: Key flow (main visual)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bgSoft };
    addLightGrid(slide, { transparency: 95 });
    addAurora(slide);
    addMeta(slide, { section: "FLOW", page: 8 });
    addTitle(slide, {
      title: "关键流程：一次咨询如何被记录与验收",
      subtitle: "主路径清晰 + 失败可降级，避免“不可控的黑盒”。",
      accent: COLORS.purple,
    });

    addPipeline(slide, {
      x: 0.9,
      y: 2.75,
      w: SLIDE_W - 1.8,
      items: [
        { title: "Input", desc: "问题/合同片段\n脱敏（可选）", accent: COLORS.blue },
        { title: "Guard", desc: "鉴权/限流\n风险提示模板", accent: COLORS.cyan },
        { title: "AI", desc: "Agent 推理\nRAG 引用（可选）", accent: COLORS.purple },
        { title: "Output", desc: "建议 + 免责声明\n引用来源", accent: COLORS.blue },
      ],
    });

    // Fallback path (dashed look via thin short lines)
    const fx = 1.1;
    const fy = 4.35;
    slide.addShape("roundRect", { x: 0.9, y: 4.25, w: 12.55, h: 2.65, fill: { color: COLORS.card }, line: { color: COLORS.line }, radius: 0.18 });
    slide.addShape("rect", { x: 0.9, y: 4.25, w: 0.08, h: 2.65, fill: { color: COLORS.red }, line: { color: COLORS.red } });
    slide.addText("失败/降级策略（开题必须有）", { x: 1.12, y: 4.45, w: 12.2, h: 0.3, fontFace: FONTS.zh, fontSize: 15, bold: true, color: COLORS.ink });
    slide.addText(["上游模型不可用 → 返回“可执行的替代步骤”（例如：需要补充哪些事实）", "输出不确定 → 强制提示边界 + 引导用户咨询专业律师", "全链路写入审计日志：请求参数摘要、模型信息、latency、traceId"].join("\n"), {
      x: fx,
      y: fy,
      w: 12.2,
      h: 2.2,
      fontFace: FONTS.zh,
      fontSize: 13,
      color: COLORS.slate,
      lineSpacingMultiple: 1.15,
    });
  }

  // Slide 9: Plan & metrics & risks (combined)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    addMeta(slide, { section: "PLAN", page: 9 });
    addTitle(slide, {
      title: "8 周计划：里程碑 + 验收口径",
      subtitle: "每一周都有可交付物；每个里程碑都能被验证。",
      accent: COLORS.cyan,
    });

    // Timeline (left)
    addCard(slide, {
      x: 0.9,
      y: 2.6,
      w: 7.1,
      h: 4.35,
      accent: COLORS.cyan,
      title: "里程碑（W1–W8）",
      lines: [
        "W1–W2：数据库 + 认证系统 + 基础前端框架",
        "W3–W4：会话管理 + SSE 流式咨询接口",
        "W5–W6：审计日志/追溯字段 + 可靠性（降级/限流）",
        "W7：E2E 联调 + 关键场景用例",
        "W8：论文撰写 + 答辩材料 + 演示打磨",
      ],
    });

    // Metrics + risks (right)
    slide.addShape("roundRect", { x: 8.25, y: 2.6, w: 4.18, h: 4.35, fill: { color: COLORS.card }, line: { color: COLORS.line }, radius: 0.18, shadow: { color: "000000", opacity: 0.06, blur: 6, angle: 45, distance: 2 } });
    slide.addShape("rect", { x: 8.25, y: 2.6, w: 0.08, h: 4.35, fill: { color: COLORS.blue }, line: { color: COLORS.blue } });
    slide.addText("验收指标", { x: 8.47, y: 2.8, w: 3.9, h: 0.3, fontFace: FONTS.zh, fontSize: 15, bold: true, color: COLORS.ink });
    slide.addText(["可用性：> 99%", "首字延迟：< 2s（可调）", "审计覆盖：100% 关键链路", "追溯：traceId 可回放"].join("\n"), {
      x: 8.55,
      y: 3.2,
      w: 3.8,
      h: 1.25,
      fontFace: FONTS.zh,
      fontSize: 13,
      color: COLORS.slate,
    });

    slide.addShape("line", { x: 8.45, y: 4.65, w: 3.85, h: 0, line: { color: COLORS.line, width: 1 } });
    slide.addText("风险与对策", { x: 8.47, y: 4.82, w: 3.9, h: 0.3, fontFace: FONTS.zh, fontSize: 15, bold: true, color: COLORS.ink });
    slide.addText(["幻觉：边界声明 +（可选）RAG 引用", "稳定：超时/重试/降级", "隐私：最小化存储 + 脱敏"].join("\n"), {
      x: 8.55,
      y: 5.2,
      w: 3.8,
      h: 1.6,
      fontFace: FONTS.zh,
      fontSize: 13,
      color: COLORS.muted,
    });
  }

  // Slide 10: Q&A (Light mode)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bgSoft };
    addLightGrid(slide, { transparency: 95 });
    addAurora(slide);
    addMeta(slide, { section: "Q&A", page: 10 });

    slide.addText("Q & A", {
      x: 0.9,
      y: 2.65,
      w: SLIDE_W - 1.8,
      h: 1.0,
      fontFace: FONTS.en,
      fontSize: 84,
      bold: true,
      color: COLORS.ink,
    });
    slide.addText("欢迎提问：边界、追溯、验收口径。", {
      x: 0.9,
      y: 3.75,
      w: SLIDE_W - 1.8,
      h: 0.4,
      fontFace: FONTS.zh,
      fontSize: 18,
      color: COLORS.slate,
    });
    slide.addText("（可放：Demo 地址 / GitHub / 联系方式）", {
      x: 0.9,
      y: 7.05,
      w: SLIDE_W - 1.8,
      h: 0.3,
      fontFace: FONTS.zh,
      fontSize: 12,
      color: COLORS.muted,
    });
  }

  const outputPath = path.resolve(__dirname, "..", "Equivocal_Legal_Masterpiece_opening_v2.pptx");
  return pptx.writeFile({ fileName: outputPath }).then(() => outputPath);
}

build()
  .then((out) => console.log(`Generated: ${out}`))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });

