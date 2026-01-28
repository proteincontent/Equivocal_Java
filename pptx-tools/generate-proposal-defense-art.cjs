/* eslint-disable no-console */
/**
 * Equivocal Legal (art edition) proposal defense deck generator.
 *
 * Design target:
 * - Ink Editorial Minimal: paper background, large whitespace, strict alignment
 * - Artistic but readable on projector: strong contrast, restrained accent color
 *
 * Output:
 * - ../Equivocal_Legal_开题答辩_艺术版.pptx
 */
"use strict";

const fs = require("fs");
const path = require("path");
const PptxGenJS = require("pptxgenjs");

// `sharp` is used only to generate subtle paper/ink backgrounds.
// It is available in the repo root dependencies; Node will resolve parent node_modules.
const sharp = require("sharp");

const SLIDE_W = 13.333; // inches, LAYOUT_WIDE
const SLIDE_H = 7.5;

const FONTS = {
  zh: "Microsoft YaHei",
  en: "Arial",
};

const COLORS = {
  paper: "F6F2EA",
  ink: "1B1B1B",
  muted: "6B6B6B",
  hairline: "DDD7CD",
  card: "FFFFFF",
  accent: "1F6F6D", // Qingdai
};

const META = {
  title: "法律智能体",
  product: "Equivocal Legal",
  deck: "开题答辩",
  name: "沈佳豪",
  date: "2026.1.9",
};

const ASSETS_DIR = path.resolve(__dirname, "assets", "ink");
const BG_BASE = path.join(ASSETS_DIR, "bg-base-1920.png");
const BG_COVER = path.join(ASSETS_DIR, "bg-cover-1920.png");
const BG_QA = path.join(ASSETS_DIR, "bg-qa-1920.png");

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function px(n) {
  // Convenience for stroke widths; pptx uses points for line width (approx).
  return n;
}

function addBg(slide, variant) {
  const bg = variant === "cover" ? BG_COVER : variant === "qa" ? BG_QA : BG_BASE;
  slide.addImage({ path: bg, x: 0, y: 0, w: SLIDE_W, h: SLIDE_H });
}

function addFooter(slide, { page, onDark = false } = {}) {
  const left = `${META.name} · ${META.date}`;
  const footerY = SLIDE_H - 0.42;

  slide.addShape("line", {
    x: 0.85,
    y: footerY - 0.12,
    w: SLIDE_W - 1.7,
    h: 0,
    line: { color: onDark ? "2B2B2B" : COLORS.hairline, width: px(1) },
  });

  slide.addText(left, {
    x: 0.85,
    y: footerY,
    w: 6.5,
    h: 0.25,
    fontFace: FONTS.zh,
    fontSize: 11,
    color: onDark ? "EAEAEA" : COLORS.muted,
  });

  if (page != null) {
    slide.addText(String(page).padStart(2, "0"), {
      x: SLIDE_W - 1.35,
      y: footerY,
      w: 0.5,
      h: 0.25,
      fontFace: FONTS.en,
      fontSize: 11,
      color: onDark ? "EAEAEA" : COLORS.muted,
      align: "right",
    });
  }
}

function addTitleBlock(slide, { kicker, title, subtitle, pageLabel } = {}) {
  const x = 0.85;
  const y = 0.58;

  if (kicker) {
    slide.addText(kicker, {
      x,
      y: y - 0.28,
      w: SLIDE_W - 1.7,
      h: 0.2,
      fontFace: FONTS.zh,
      fontSize: 11,
      color: COLORS.accent,
      letterSpacing: 1,
    });
  }

  slide.addText(title, {
    x,
    y,
    w: SLIDE_W - 1.7,
    h: 0.7,
    fontFace: FONTS.zh,
    fontSize: 40,
    bold: true,
    color: COLORS.ink,
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x,
      y: y + 0.65,
      w: SLIDE_W - 1.7,
      h: 0.4,
      fontFace: FONTS.zh,
      fontSize: 16,
      color: COLORS.muted,
    });
  }

  const underlineY = y + 1.12;
  slide.addShape("line", {
    x,
    y: underlineY,
    w: 2.2,
    h: 0,
    line: { color: COLORS.accent, width: px(4) },
  });
  slide.addShape("line", {
    x: x + 2.25,
    y: underlineY,
    w: SLIDE_W - (x + 2.25) - 0.85,
    h: 0,
    line: { color: COLORS.hairline, width: px(1) },
  });

  if (pageLabel) {
    slide.addText(pageLabel, {
      x: SLIDE_W - 4.5,
      y: y - 0.06,
      w: 3.65,
      h: 0.35,
      fontFace: FONTS.en,
      fontSize: 12,
      color: COLORS.muted,
      align: "right",
      letterSpacing: 1,
    });
  }
}

function addFaintIndex(slide, idx) {
  slide.addText(String(idx).padStart(2, "0"), {
    x: SLIDE_W - 3.2,
    y: 0.55,
    w: 2.4,
    h: 1.1,
    fontFace: FONTS.en,
    fontSize: 80,
    bold: true,
    color: "1B1B1B",
    transparency: 92,
    align: "right",
  });
}

function addCard(slide, { x, y, w, h, title, body, accent = false }) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    fill: { color: COLORS.card, transparency: 8 },
    line: { color: COLORS.hairline, width: px(1) },
    radius: 0.2,
    shadow: { color: "000000", opacity: 0.07, blur: 10, angle: 45, distance: 2 },
  });

  slide.addText(title, {
    x: x + 0.28,
    y: y + 0.22,
    w: w - 0.56,
    h: 0.35,
    fontFace: FONTS.zh,
    fontSize: 16,
    bold: true,
    color: accent ? COLORS.accent : COLORS.ink,
  });

  slide.addShape("line", {
    x: x + 0.28,
    y: y + 0.62,
    w: w - 0.56,
    h: 0,
    line: { color: COLORS.hairline, width: px(1) },
  });

  slide.addText(body, {
    x: x + 0.28,
    y: y + 0.78,
    w: w - 0.56,
    h: h - 1.0,
    fontFace: FONTS.zh,
    fontSize: 13,
    color: COLORS.muted,
    valign: "top",
    lineSpacingMultiple: 1.15,
  });
}

function addBullets(slide, bullets, { x, y, w, h, fontSize = 16, color = COLORS.ink } = {}) {
  const items = bullets.map((text) => ({
    text,
    options: { bullet: { indent: fontSize }, hanging: clamp(Math.round(fontSize * 0.32), 3, 7) },
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
    lineSpacingMultiple: 1.14,
  });
}

function addStepRow(slide, { x, y, w, steps }) {
  const stepW = w / steps.length;
  const midY = y + 0.26;

  slide.addShape("line", {
    x: x + 0.22,
    y: midY,
    w: w - 0.44,
    h: 0,
    line: { color: COLORS.hairline, width: px(2) },
  });

  steps.forEach((s, i) => {
    const cx = x + i * stepW;
    slide.addShape("ellipse", {
      x: cx + 0.02,
      y,
      w: 0.52,
      h: 0.52,
      fill: { color: i === 0 ? COLORS.accent : COLORS.card, transparency: i === 0 ? 0 : 10 },
      line: { color: i === 0 ? COLORS.accent : COLORS.hairline, width: px(2) },
    });
    slide.addText(String(i + 1), {
      x: cx + 0.02,
      y: y + 0.1,
      w: 0.52,
      h: 0.32,
      fontFace: FONTS.en,
      fontSize: 14,
      bold: true,
      color: i === 0 ? "FFFFFF" : COLORS.muted,
      align: "center",
    });
    slide.addText(s.title, {
      x: cx - 0.05,
      y: y + 0.62,
      w: stepW + 0.1,
      h: 0.32,
      fontFace: FONTS.zh,
      fontSize: 14,
      bold: i === 0,
      color: i === 0 ? COLORS.ink : COLORS.muted,
      align: "center",
    });
    slide.addText(s.desc, {
      x: cx - 0.12,
      y: y + 0.95,
      w: stepW + 0.24,
      h: 0.55,
      fontFace: FONTS.zh,
      fontSize: 11,
      color: COLORS.muted,
      align: "center",
      valign: "top",
    });
  });
}

function baseSvg({ variant }) {
  const paper = `#${COLORS.paper}`;
  const accent = `#${COLORS.accent}`;
  const ink = `#${COLORS.ink}`;

  const inkTopOpacity = variant === "cover" ? 0.12 : variant === "qa" ? 0.1 : 0.07;
  const inkBottomOpacity = variant === "cover" ? 0.08 : variant === "qa" ? 0.06 : 0.05;
  const gridOpacity = variant === "qa" ? 0.16 : 0.22;

  // SVG filter tricks keep the deck self-contained (no external images required).
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M 80 0 L 0 0 0 80" fill="none" stroke="${ink}" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>

    <filter id="paperNoise" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.18"/>
      </feComponentTransfer>
    </filter>

    <radialGradient id="inkTL" cx="18%" cy="14%" r="62%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="${inkTopOpacity}"/>
      <stop offset="55%" stop-color="${accent}" stop-opacity="${inkTopOpacity * 0.42}"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="inkBR" cx="86%" cy="92%" r="58%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="${inkBottomOpacity}"/>
      <stop offset="70%" stop-color="${accent}" stop-opacity="${inkBottomOpacity * 0.35}"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${ink}" stop-opacity="0.10"/>
      <stop offset="22%" stop-color="${ink}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="${paper}"/>
  <rect width="1920" height="1080" fill="url(#grid)" opacity="${gridOpacity}"/>
  <rect width="1920" height="1080" filter="url(#paperNoise)" opacity="0.22"/>

  <rect width="1920" height="1080" fill="url(#inkTL)"/>
  <rect width="1920" height="1080" fill="url(#inkBR)"/>

  <rect width="96" height="1080" fill="url(#edge)"/>

  ${
    variant === "cover"
      ? `<path d="M 420 250 C 520 120, 740 120, 860 250 C 940 340, 980 420, 1080 470"
             fill="none" stroke="${accent}" stroke-opacity="0.20" stroke-width="10" stroke-linecap="round"/>
         <path d="M 420 320 C 520 210, 720 200, 850 320 C 930 390, 990 470, 1080 520"
             fill="none" stroke="${accent}" stroke-opacity="0.12" stroke-width="8" stroke-linecap="round"/>`
      : ""
  }
</svg>`;
}

async function ensureAssets() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  const todo = [
    { p: BG_BASE, v: "base" },
    { p: BG_COVER, v: "cover" },
    { p: BG_QA, v: "qa" },
  ].filter(({ p }) => !fs.existsSync(p));

  for (const { p, v } of todo) {
    const svg = baseSvg({ variant: v });
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(p);
  }
}

function buildDeck() {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = META.name;
  pptx.company = "Equivocal Legal";
  pptx.subject = "开题答辩";

  // Slide 1: Cover
  {
    const slide = pptx.addSlide();
    addBg(slide, "cover");

    slide.addText(`${META.title}`, {
      x: 0.95,
      y: 2.05,
      w: 8.8,
      h: 0.9,
      fontFace: FONTS.zh,
      fontSize: 56,
      bold: true,
      color: COLORS.ink,
    });
    slide.addText(`${META.product}`, {
      x: 1.0,
      y: 3.0,
      w: 8.4,
      h: 0.4,
      fontFace: FONTS.en,
      fontSize: 18,
      color: COLORS.muted,
      letterSpacing: 1,
    });

    slide.addShape("line", {
      x: 0.95,
      y: 3.58,
      w: 3.2,
      h: 0,
      line: { color: COLORS.accent, width: px(5) },
    });

    slide.addText(`${META.deck}`, {
      x: 0.95,
      y: 3.78,
      w: 6.0,
      h: 0.45,
      fontFace: FONTS.zh,
      fontSize: 20,
      color: COLORS.ink,
    });

    slide.addText(`汇报人：${META.name}`, {
      x: 0.95,
      y: 5.75,
      w: 6.0,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 14,
      color: COLORS.muted,
    });
    slide.addText(`日期：${META.date}`, {
      x: 0.95,
      y: 6.15,
      w: 6.0,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 14,
      color: COLORS.muted,
    });

    slide.addText("让法律咨询更可追溯、更可理解、更可审计", {
      x: 0.95,
      y: 4.55,
      w: 8.6,
      h: 0.5,
      fontFace: FONTS.zh,
      fontSize: 18,
      color: COLORS.accent,
    });
  }

  let page = 1;

  // Slide 2: Background & pain points
  {
    const slide = pptx.addSlide();
    addBg(slide, "base");
    addFaintIndex(slide, page);
    addTitleBlock(slide, {
      kicker: `${META.product} · ${META.deck}`,
      title: "研究背景与问题",
      subtitle: "法律服务的高门槛来自信息不对称与专业壁垒",
      pageLabel: "BACKGROUND",
    });

    slide.addText("普通用户常见的三重困境：", {
      x: 0.85,
      y: 2.05,
      w: 6.5,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 18,
      bold: true,
      color: COLORS.ink,
    });
    slide.addShape("roundRect", {
      x: 0.85,
      y: 2.5,
      w: 11.65,
      h: 4.25,
      fill: { color: COLORS.card, transparency: 12 },
      line: { color: COLORS.hairline, width: px(1) },
      radius: 0.22,
    });

    const cardY = 2.78;
    const cardW = 3.6;
    const gap = 0.38;
    addCard(slide, {
      x: 1.05,
      y: cardY,
      w: cardW,
      h: 3.7,
      title: "成本高昂",
      body: "专业咨询常按小时计费。\n普通人难以长期承担。",
      accent: true,
    });
    addCard(slide, {
      x: 1.05 + cardW + gap,
      y: cardY,
      w: cardW,
      h: 3.7,
      title: "风险盲区",
      body: "合同条款晦涩难懂。\n风险常隐藏在“专业术语”之后。",
    });
    addCard(slide, {
      x: 1.05 + (cardW + gap) * 2,
      y: cardY,
      w: cardW,
      h: 3.7,
      title: "检索困难",
      body: "法条与案例分散在不同平台。\n非专业人士难以对齐语境与要点。",
    });

    addFooter(slide, { page: page++ });
  }

  // Slide 3: Goals & boundaries
  {
    const slide = pptx.addSlide();
    addBg(slide, "base");
    addFaintIndex(slide, page);
    addTitleBlock(slide, {
      kicker: `${META.product} · ${META.deck}`,
      title: "研究目标与边界",
      subtitle: "目标明确、边界清晰：能用、可控、可验收",
      pageLabel: "GOALS",
    });

    addCard(slide, {
      x: 0.85,
      y: 2.1,
      w: 6.25,
      h: 4.65,
      title: "研究目标（做什么）",
      body: "",
      accent: true,
    });
    addBullets(slide, ["低成本获取初步法律信息与行动建议", "对关键风险点进行提示与追问引导", "提供“依据/引用”以便复核（可追溯）", "形成可检索的历史记录与审计留痕"], {
      x: 1.12,
      y: 2.95,
      w: 5.7,
      h: 3.5,
      fontSize: 16,
      color: COLORS.ink,
    });

    addCard(slide, {
      x: 7.35,
      y: 2.1,
      w: 5.13,
      h: 4.65,
      title: "边界与假设（不做什么）",
      body: "",
    });
    addBullets(
      slide,
      [
        "不替代律师，不构成正式法律意见",
        "输出以“可复核”为原则：提示用户核验关键事实",
        "敏感数据最小化存储，默认脱敏与权限控制",
        "在不确定时优先给出澄清问题与风险提示",
      ],
      { x: 7.62, y: 2.95, w: 4.55, h: 3.5, fontSize: 15, color: COLORS.ink }
    );

    addFooter(slide, { page: page++ });
  }

  // Slide 4: User journey
  {
    const slide = pptx.addSlide();
    addBg(slide, "base");
    addFaintIndex(slide, page);
    addTitleBlock(slide, {
      kicker: `${META.product} · ${META.deck}`,
      title: "需求与场景：用户旅程",
      subtitle: "用一条路径串起体验与可追溯能力",
      pageLabel: "JOURNEY",
    });

    addStepRow(slide, {
      x: 1.0,
      y: 2.45,
      w: 11.3,
      steps: [
        { title: "登录鉴权", desc: "邮箱验证码 / Token" },
        { title: "选择场景", desc: "日常咨询 / 合同审查" },
        { title: "对话追问", desc: "流式响应\n风险提示" },
        { title: "结论建议", desc: "行动清单\n关键引用" },
        { title: "留痕追溯", desc: "会话归档\n审计记录" },
      ],
    });

    addCard(slide, {
      x: 0.85,
      y: 4.6,
      w: 11.65,
      h: 2.05,
      title: "场景示例",
      body:
        "• 租房合同：识别不合理条款（押金/违约金/维修责任）并给出注意事项\n" +
        "• 劳动争议：根据事实要点提示证据材料与可行路径（协商/仲裁/诉讼）\n" +
        "• 日常咨询：快速获取相关法条方向与风险提示，并保留追问记录",
    });

    addFooter(slide, { page: page++ });
  }

  // Slide 5: Capability breakdown
  {
    const slide = pptx.addSlide();
    addBg(slide, "base");
    addFaintIndex(slide, page);
    addTitleBlock(slide, {
      kicker: `${META.product} · ${META.deck}`,
      title: "总体方案：能力拆解",
      subtitle: "不只是“聊天”，而是带有证据链的咨询服务",
      pageLabel: "SOLUTION",
    });

    const x0 = 0.85;
    const y0 = 2.05;
    const w = 11.65;
    const colGap = 0.35;
    const colW = (w - colGap) / 2;
    const rowGap = 0.35;
    const rowH = 2.15;

    addCard(slide, {
      x: x0,
      y: y0,
      w: colW,
      h: rowH,
      title: "对话式咨询",
      body: "基于用户事实陈述进行追问与澄清。\n用结构化问题把信息补齐。",
      accent: true,
    });
    addCard(slide, {
      x: x0 + colW + colGap,
      y: y0,
      w: colW,
      h: rowH,
      title: "风险点提取",
      body: "识别关键条款/关键事实缺口。\n以“风险等级 + 原因”输出。",
    });
    addCard(slide, {
      x: x0,
      y: y0 + rowH + rowGap,
      w: colW,
      h: rowH,
      title: "依据/引用",
      body: "给出相关法条、常见裁判规则方向。\n支持用户复核（可追溯）。",
    });
    addCard(slide, {
      x: x0 + colW + colGap,
      y: y0 + rowH + rowGap,
      w: colW,
      h: rowH,
      title: "审计与可追溯",
      body: "会话、提示、关键输出留痕。\n便于回看、复盘与验收。",
      accent: true,
    });

    addFooter(slide, { page: page++ });
  }

  // Slide 6: Architecture
  {
    const slide = pptx.addSlide();
    addBg(slide, "base");
    addFaintIndex(slide, page);
    addTitleBlock(slide, {
      kicker: `${META.product} · ${META.deck}`,
      title: "系统架构（关注点分离）",
      subtitle: "体验在前端，审计在后端，能力在智能体层",
      pageLabel: "ARCH",
    });

    const box = (x, y, w, h, title, lines, isAccent) => {
      slide.addShape("roundRect", {
        x,
        y,
        w,
        h,
        fill: { color: COLORS.card, transparency: 10 },
        line: { color: COLORS.hairline, width: px(1) },
        radius: 0.22,
      });
      slide.addText(title, {
        x: x + 0.25,
        y: y + 0.18,
        w: w - 0.5,
        h: 0.35,
        fontFace: FONTS.zh,
        fontSize: 16,
        bold: true,
        color: isAccent ? COLORS.accent : COLORS.ink,
      });
      slide.addShape("line", {
        x: x + 0.25,
        y: y + 0.58,
        w: w - 0.5,
        h: 0,
        line: { color: COLORS.hairline, width: px(1) },
      });
      slide.addText(lines.join("\n"), {
        x: x + 0.25,
        y: y + 0.75,
        w: w - 0.5,
        h: h - 0.95,
        fontFace: FONTS.zh,
        fontSize: 12.5,
        color: COLORS.muted,
        valign: "top",
        lineSpacingMultiple: 1.15,
      });
    };

    box(0.85, 2.15, 3.1, 2.45, "前端层", ["Next.js / UI", "对话体验（SSE）", "表单与上传"], true);
    box(4.1, 2.15, 4.15, 2.45, "后端核心", ["鉴权与权限", "会话/消息持久化", "审计日志与策略"], false);
    box(8.45, 2.15, 4.05, 2.45, "智能体服务", ["提示工程与编排", "工具调用 / 降级", "引用与风险策略"], true);
    box(0.85, 4.95, 11.65, 1.75, "数据层", ["MySQL：Users / Sessions / Messages / Verification", "面向追溯与合规：可检索、可审计、可统计"], false);

    // connectors
    slide.addShape("line", { x: 3.95, y: 3.38, w: 0.15, h: 0, line: { color: COLORS.hairline, width: px(2) } });
    slide.addShape("line", { x: 8.3, y: 3.38, w: 0.15, h: 0, line: { color: COLORS.hairline, width: px(2) } });
    slide.addShape("line", { x: 2.4, y: 4.65, w: 0, h: 0.25, line: { color: COLORS.hairline, width: px(2) } });
    slide.addShape("line", { x: 6.2, y: 4.65, w: 0, h: 0.25, line: { color: COLORS.hairline, width: px(2) } });
    slide.addShape("line", { x: 10.35, y: 4.65, w: 0, h: 0.25, line: { color: COLORS.hairline, width: px(2) } });

    addFooter(slide, { page: page++ });
  }

  // Slide 7: Data model (added page)
  {
    const slide = pptx.addSlide();
    addBg(slide, "base");
    addFaintIndex(slide, page);
    addTitleBlock(slide, {
      kicker: `${META.product} · ${META.deck}`,
      title: "数据与可追溯（数据模型）",
      subtitle: "以“会话”为中心组织证据链与审计能力",
      pageLabel: "DATA",
    });

    const mkEntity = (x, y, title, fields) => {
      slide.addShape("roundRect", {
        x,
        y,
        w: 3.58,
        h: 3.05,
        fill: { color: COLORS.card, transparency: 10 },
        line: { color: COLORS.hairline, width: px(1) },
        radius: 0.22,
      });
      slide.addText(title, {
        x: x + 0.22,
        y: y + 0.2,
        w: 3.15,
        h: 0.35,
        fontFace: FONTS.en,
        fontSize: 15,
        bold: true,
        color: COLORS.accent,
      });
      slide.addShape("line", {
        x: x + 0.22,
        y: y + 0.62,
        w: 3.15,
        h: 0,
        line: { color: COLORS.hairline, width: px(1) },
      });
      slide.addText(fields.join("\n"), {
        x: x + 0.22,
        y: y + 0.78,
        w: 3.15,
        h: 2.2,
        fontFace: FONTS.en,
        fontSize: 12,
        color: COLORS.ink,
        valign: "top",
        lineSpacingMultiple: 1.15,
      });
    };

    mkEntity(0.85, 2.15, "Users", ["id (PK)", "email (UQ)", "password_hash", "role", "verified_at"]);
    mkEntity(4.05, 2.15, "Sessions", ["id (PK)", "user_id (FK)", "title", "context_meta", "created_at"]);
    mkEntity(7.25, 2.15, "Messages", ["id (PK)", "session_id (FK)", "role (user/ai)", "content", "created_at"]);
    mkEntity(10.45, 2.15, "Verification", ["email", "code", "expires_at", "attempts"]);

    addCard(slide, {
      x: 0.85,
      y: 5.45,
      w: 11.65,
      h: 1.25,
      title: "追溯点（示例）",
      body: "• 针对一条建议，可回溯：会话上下文 → 追问链 → 输出内容 → 引用依据 → 产生时间\n• 针对一次咨询，可审计：访问主体、数据范围、关键操作与异常事件",
    });

    addFooter(slide, { page: page++ });
  }

  // Slide 8: Compliance & security
  {
    const slide = pptx.addSlide();
    addBg(slide, "base");
    addFaintIndex(slide, page);
    addTitleBlock(slide, {
      kicker: `${META.product} · ${META.deck}`,
      title: "关键能力 1：合规与安全",
      subtitle: "把“能用”建立在“可控”的边界上",
      pageLabel: "SECURITY",
    });

    addCard(slide, { x: 0.85, y: 2.1, w: 5.75, h: 4.65, title: "鉴权与权限", body: "", accent: true });
    addBullets(slide, ["邮箱验证码登录，Token/JWT 鉴权", "角色与权限控制（基础 RBAC）", "敏感操作审计：谁在何时做了什么"], {
      x: 1.12,
      y: 2.95,
      w: 5.25,
      h: 3.5,
      fontSize: 16,
      color: COLORS.ink,
    });

    addCard(slide, { x: 6.75, y: 2.1, w: 5.75, h: 4.65, title: "隐私与数据治理", body: "" });
    addBullets(slide, ["最小化存储：只保存必要字段与摘要", "默认脱敏：手机号/身份证/地址等", "到期清理与可删除策略（可配置）", "提示层明确：不上传/不粘贴敏感信息"], {
      x: 7.02,
      y: 2.95,
      w: 5.25,
      h: 3.5,
      fontSize: 15,
      color: COLORS.ink,
    });

    addFooter(slide, { page: page++ });
  }

  // Slide 9: Quality & reliability
  {
    const slide = pptx.addSlide();
    addBg(slide, "base");
    addFaintIndex(slide, page);
    addTitleBlock(slide, {
      kicker: `${META.product} · ${META.deck}`,
      title: "关键能力 2：质量与可靠性",
      subtitle: "面向答辩的口径：风险、对策、以及可验证指标",
      pageLabel: "QUALITY",
    });

    const cardW = 3.75;
    const y = 2.15;
    addCard(slide, {
      x: 0.85,
      y,
      w: cardW,
      h: 3.25,
      title: "幻觉风险",
      body: "对策：\n• 强约束提示词边界\n• 引用/依据优先\n• 不确定先追问再结论",
      accent: true,
    });
    addCard(slide, {
      x: 0.85 + cardW + 0.2,
      y,
      w: cardW,
      h: 3.25,
      title: "稳定性风险",
      body: "对策：\n• 超时与重试\n• 服务降级（提示模板）\n• 关键路径监控告警",
    });
    addCard(slide, {
      x: 0.85 + (cardW + 0.2) * 2,
      y,
      w: cardW,
      h: 3.25,
      title: "误用与合规风险",
      body: "对策：\n• 明确免责声明与使用范围\n• 敏感内容拦截提示\n• 留痕便于复盘",
    });

    addCard(slide, {
      x: 0.85,
      y: 5.0,
      w: 11.65,
      h: 1.7,
      title: "可验证指标（示例）",
      body:
        "• 关键接口可用性：≥ 99%\n" +
        "• 交互延迟：常见请求 < 2s（流式响应首 token 更快）\n" +
        "• 追溯覆盖：会话/消息/关键输出 100% 可检索",
      accent: true,
    });

    addFooter(slide, { page: page++ });
  }

  // Slide 10: Timeline
  {
    const slide = pptx.addSlide();
    addBg(slide, "base");
    addFaintIndex(slide, page);
    addTitleBlock(slide, {
      kicker: `${META.product} · ${META.deck}`,
      title: "计划与里程碑（W1–W8）",
      subtitle: "按交付物推进，优先完成可演示的 MVP",
      pageLabel: "PLAN",
    });

    addCard(slide, { x: 0.85, y: 2.1, w: 7.05, h: 4.65, title: "里程碑", body: "", accent: true });
    const milestones = [
      { w: "W1–W2", t: "需求/用例/原型 + 数据库设计", a: false },
      { w: "W3–W4", t: "后端：鉴权/会话/审计 + 基础联调", a: true },
      { w: "W5–W6", t: "智能体接入：提示边界 + 降级策略 + 引用输出", a: false },
      { w: "W7", t: "测试与验收：E2E + 质量口径固化", a: false },
      { w: "W8", t: "演示与答辩材料：案例脚本 + 彩排", a: false },
    ];

    milestones.forEach((m, i) => {
      const yy = 2.92 + i * 0.78;
      slide.addShape("roundRect", {
        x: 1.15,
        y: yy,
        w: 0.95,
        h: 0.45,
        fill: { color: COLORS.card, transparency: 10 },
        line: { color: COLORS.hairline, width: px(1) },
        radius: 0.12,
      });
      slide.addText(m.w, {
        x: 1.15,
        y: yy + 0.12,
        w: 0.95,
        h: 0.25,
        fontFace: FONTS.en,
        fontSize: 11,
        bold: true,
        color: COLORS.muted,
        align: "center",
      });

      slide.addShape("roundRect", {
        x: 2.2,
        y: yy,
        w: 5.4,
        h: 0.45,
        fill: { color: m.a ? COLORS.accent : COLORS.card, transparency: m.a ? 86 : 10 },
        line: { color: COLORS.hairline, width: px(1) },
        radius: 0.12,
      });
      slide.addText(m.t, {
        x: 2.32,
        y: yy + 0.12,
        w: 5.2,
        h: 0.25,
        fontFace: FONTS.zh,
        fontSize: 13,
        color: COLORS.ink,
      });
    });

    addCard(slide, { x: 8.15, y: 2.1, w: 4.35, h: 4.65, title: "阶段性交付物", body: "" });
    addBullets(
      slide,
      ["可演示的 MVP：登录 + 咨询 + 会话留痕", "关键场景 Demo：合同审查/劳动争议", "验收口径：指标 + 测试脚本 + 演示脚本", "答辩材料：结构化叙事 + 风险与对策"],
      { x: 8.42, y: 2.95, w: 3.9, h: 3.6, fontSize: 15, color: COLORS.ink }
    );

    addFooter(slide, { page: page++ });
  }

  // Slide 11: Q&A
  {
    const slide = pptx.addSlide();
    addBg(slide, "qa");

    slide.addText("Q & A", {
      x: 0.9,
      y: 2.35,
      w: SLIDE_W - 1.8,
      h: 1.0,
      fontFace: FONTS.en,
      fontSize: 72,
      bold: true,
      color: COLORS.ink,
    });
    slide.addText("谢谢。欢迎提问与质疑我的边界与验收口径。", {
      x: 0.9,
      y: 3.55,
      w: SLIDE_W - 1.8,
      h: 0.5,
      fontFace: FONTS.zh,
      fontSize: 18,
      color: COLORS.muted,
    });
    slide.addText(`${META.name} · ${META.date}`, {
      x: 0.9,
      y: 6.9,
      w: SLIDE_W - 1.8,
      h: 0.3,
      fontFace: FONTS.zh,
      fontSize: 12,
      color: COLORS.muted,
    });
  }

  return pptx;
}

async function main() {
  await ensureAssets();

  const pptx = buildDeck();
  const outFile = path.resolve(__dirname, "..", "Equivocal_Legal_开题答辩_艺术版.pptx");
  await pptx.writeFile({ fileName: outFile });
  console.log(`Generated: ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

