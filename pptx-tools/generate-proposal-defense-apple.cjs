/* eslint-disable no-console */
/**
 * Apple Monochrome Minimal (Strict Light Mode)
 * Target: Graduation proposal defense deck for the Equivocal Legal "Law Agent" project.
 *
 * Design goals:
 * - Apple Keynote-like minimalism (warm white, strong hierarchy, strict alignment)
 * - High projector readability (large type, high contrast, no flashy effects)
 * - Consistent component language (cards / chips / hairline dividers)
 *
 * Output: ../Equivocal_Legal_开题答辩_final.pptx
 */
const path = require("path");
const pptxgen = require("pptxgenjs");

const SLIDE_W = 13.333; // inches, LAYOUT_WIDE
const SLIDE_H = 7.5;
const TOTAL_SLIDES = 10;

function cmToIn(cm) {
  return cm / 2.54;
}

const GRID = {
  cols: 6,
  colW: cmToIn(4.5),
  gutter: cmToIn(0.5),
  marginX: cmToIn(2.18),
  marginTop: cmToIn(1.5),
  marginBottom: cmToIn(1.2),
};

const COLORS = {
  bg: "FBFBFD", // Apple Web Background
  card: "F5F5F7", // Apple System Gray 6
  ink: "1D1D1F", // Primary Label
  muted: "86868B", // Secondary Label
  line: "D2D2D7", // Separator
  risk: "DC2626", // System Red
};

const FONTS = {
  zh: "Microsoft YaHei",
  en: "Arial",
};

function xCol(colIndex) {
  return GRID.marginX + colIndex * (GRID.colW + GRID.gutter);
}

function wCols(span) {
  return span * GRID.colW + (span - 1) * GRID.gutter;
}

function chipWidth(text) {
  // Heuristic width in inches; good enough for Latin tags (LangGraph/RAG/FastAPI...).
  return cmToIn(1.2) + Math.max(0, String(text).length - 6) * 0.12;
}

function addHeader(slide, { section = "EQUIVOCAL LEGAL", page, total = TOTAL_SLIDES } = {}) {
  const y = 0.25;
  slide.addText(section, {
    x: GRID.marginX,
    y,
    w: SLIDE_W - GRID.marginX * 2,
    h: 0.25,
    fontFace: FONTS.en,
    fontSize: 10,
    color: COLORS.muted,
  });
  if (page) {
    slide.addText(`${String(page).padStart(2, "0")}/${String(total).padStart(2, "0")}`, {
      x: SLIDE_W - GRID.marginX - 1.0,
      y,
      w: 1.0,
      h: 0.25,
      fontFace: FONTS.en,
      fontSize: 10,
      color: COLORS.muted,
      align: "right",
    });
  }
  slide.addShape("line", {
    x: GRID.marginX,
    y: y + 0.32,
    w: SLIDE_W - GRID.marginX * 2,
    h: 0,
    line: { color: COLORS.line, width: 0.5 },
  });
}

function addTitle(slide, { title, subtitle } = {}) {
  const x = GRID.marginX;
  const y = GRID.marginTop * 0.9;
  const lines = String(title).split("\n").length;
  const fontSize = lines > 1 ? 30 : 32;

  slide.addText(title, {
    x,
    y,
    w: SLIDE_W - GRID.marginX * 2,
    h: lines > 1 ? 0.95 : 0.55,
    fontFace: FONTS.zh,
    fontSize,
    bold: true,
    color: COLORS.ink,
    lineSpacingMultiple: 1.1,
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x,
      y: y + 0.75,
      w: SLIDE_W - GRID.marginX * 2,
      h: 0.45,
      fontFace: FONTS.zh,
      fontSize: 14,
      color: COLORS.muted,
      lineSpacingMultiple: 1.2,
    });
  }
}

function addCard(slide, { x, y, w, h, title, lines, risk = false } = {}) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    fill: { color: COLORS.card },
    line: { color: COLORS.line, width: 0.5 },
    radius: cmToIn(0.32), // ~12px
  });

  slide.addText(title, {
    x: x + cmToIn(0.4),
    y: y + cmToIn(0.35),
    w: w - cmToIn(0.8),
    h: 0.35,
    fontFace: FONTS.zh,
    fontSize: 24,
    bold: true,
    color: risk ? COLORS.risk : COLORS.ink,
  });

  slide.addText(lines.join("\n"), {
    x: x + cmToIn(0.4),
    y: y + cmToIn(1.1),
    w: w - cmToIn(0.8),
    h: h - cmToIn(1.4),
    fontFace: FONTS.zh,
    fontSize: 20,
    color: COLORS.muted,
    valign: "top",
    lineSpacingMultiple: 1.5,
  });
}

function addChip(slide, { x, y, text, risk = false } = {}) {
  const w = chipWidth(text);
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h: 0.32,
    fill: { color: COLORS.line },
    line: { color: COLORS.line, width: 0.5 },
    radius: cmToIn(0.25),
  });
  slide.addText(text, {
    x: x + cmToIn(0.25),
    y: y + 0.07,
    w: w - cmToIn(0.5),
    h: 0.22,
    fontFace: FONTS.en,
    fontSize: 10,
    color: risk ? COLORS.risk : COLORS.muted,
  });
  return w;
}

function addFooter(slide) {
  slide.addText("EQUIVOCAL LEGAL // VERSION: proposal_final", {
    x: GRID.marginX,
    y: SLIDE_H - 0.35,
    w: SLIDE_W - GRID.marginX * 2,
    h: 0.22,
    fontFace: FONTS.en,
    fontSize: 10,
    color: COLORS.ink,
    transparency: 30,
  });
}

function build() {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Equivocal Legal";
  pptx.company = "Equivocal";
  pptx.subject = "毕设开题答辩（法律智能体 · Apple 黑白极简 · Strict Light Mode）";
  pptx.title = "Equivocal Legal 毕设开题答辩（Apple Monochrome Minimal）";
  pptx.theme = { headFontFace: FONTS.zh, bodyFontFace: FONTS.zh, lang: "zh-CN" };

  // Slide 1: Cover
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    addHeader(slide, { section: "COVER", page: 1 });

    slide.addText("EQUIVOCAL LEGAL", {
      x: GRID.marginX,
      y: 2.05,
      w: SLIDE_W - GRID.marginX * 2,
      h: 0.8,
      fontFace: FONTS.en,
      fontSize: 48,
      bold: true,
      color: COLORS.ink,
    });
    slide.addText("基于 LangGraph 的法律智能体系统", {
      x: GRID.marginX,
      y: 2.98,
      w: SLIDE_W - GRID.marginX * 2,
      h: 0.4,
      fontFace: FONTS.zh,
      fontSize: 24,
      bold: true,
      color: COLORS.ink,
    });
    slide.addText("毕设开题答辩 · 可追溯 · 可验收", {
      x: GRID.marginX,
      y: 3.38,
      w: SLIDE_W - GRID.marginX * 2,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 20,
      color: COLORS.muted,
    });

    // Tech chips (minimal, low-risk, projector-friendly)
    {
      const y = 3.74;
      let x = GRID.marginX;
      const gap = cmToIn(0.22);
      ["LangGraph", "RAG", "FastAPI", "Vectorize", "R2"].forEach((t) => {
        const w = addChip(slide, { x, y, text: t });
        x += w + gap;
      });
    }

    slide.addShape("line", {
      x: GRID.marginX,
      y: 4.2,
      w: 4.0,
      h: 0,
      line: { color: COLORS.ink, width: 1 },
    });

    slide.addText(
      [
        "姓名：__________",
        "学号：__________",
        "学院/专业：__________",
        "指导教师：__________",
        "日期：____年__月__日",
      ].join("\n"),
      {
        x: GRID.marginX,
        y: 4.5,
        w: 6.8,
        h: 1.6,
        fontFace: FONTS.zh,
        fontSize: 20,
        color: COLORS.muted,
        lineSpacingMultiple: 1.5,
      },
    );

    addFooter(slide);
  }

  // Slide 2: Overview
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    addHeader(slide, { section: "OVERVIEW", page: 2 });
    addTitle(slide, {
      title: "一句话概览：把法律咨询做成“可追溯服务”",
      subtitle: "LangGraph 编排 + RAG 引用 + 工具链 → 建议 / 风险提示 / 证据链",
    });

    slide.addShape("roundRect", {
      x: xCol(0),
      y: 2.35,
      w: wCols(6),
      h: 1.2,
      fill: { color: COLORS.card },
      line: { color: COLORS.line, width: 0.5 },
      radius: cmToIn(0.32),
    });
    slide.addText("目标：让用户在 3 分钟内得到“可执行的下一步”，并能回放与评测每一次咨询。", {
      x: xCol(0) + cmToIn(0.4),
      y: 2.67,
      w: wCols(6) - cmToIn(0.8),
      h: 0.55,
      fontFace: FONTS.zh,
      fontSize: 24,
      bold: true,
      color: COLORS.ink,
    });

    const y = 3.85;
    const w = wCols(2);
    addCard(slide, {
      x: xCol(0),
      y,
      w,
      h: 3.2,
      title: "问题",
      lines: ["风险点难识别", "资料分散、检索成本高", "咨询结果难复现/难验收"],
      risk: true,
    });
    addCard(slide, {
      x: xCol(2),
      y,
      w,
      h: 3.2,
      title: "方法",
      lines: [
        "LangGraph 把咨询拆成流程",
        "RAG 给出引用来源（Vectorize）",
        "工具链处理文件/OCR/文档（R2）",
      ],
    });
    addCard(slide, {
      x: xCol(4),
      y,
      w,
      h: 3.2,
      title: "价值",
      lines: ["结构化建议 + 风险提示", "明确边界与不确定性", "可回放、可评测、可改进"],
    });

    addFooter(slide);
  }

  // Slide 3: Background
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    addHeader(slide, { section: "BACKGROUND", page: 3 });
    addTitle(slide, {
      title: "研究背景：法律咨询的三类难题",
      subtitle: "成本、风险、检索 —— 三个问题都指向“工程化与可追溯”。",
    });

    const y = 2.4;
    const w = wCols(2);

    addCard(slide, {
      x: xCol(0),
      y,
      w,
      h: 3.6,
      title: "成本与门槛",
      lines: ["咨询成本高且不透明", "普通用户缺乏判断标准", "需要低门槛的“第一步建议”"],
    });
    addCard(slide, {
      x: xCol(2),
      y,
      w,
      h: 3.6,
      title: "风险与责任",
      lines: ["条款晦涩、风险点隐藏深", "错误建议后果严重", "必须显式边界与风险提示"],
      risk: true,
    });
    addCard(slide, {
      x: xCol(4),
      y,
      w,
      h: 3.6,
      title: "检索碎片化",
      lines: ["法规/案例/流程分散", "语境难对齐、检索成本高", "需要可扩展知识挂载（RAG）"],
    });

    slide.addShape("roundRect", {
      x: GRID.marginX,
      y: 6.25,
      w: SLIDE_W - GRID.marginX * 2,
      h: 0.75,
      fill: { color: COLORS.card },
      line: { color: COLORS.line, width: 0.5 },
      radius: cmToIn(0.32),
    });
    slide.addText("机会点：用可追溯流程降低不确定性，把“风险”显式化并纳入验收口径。", {
      x: GRID.marginX + cmToIn(0.4),
      y: 6.42,
      w: SLIDE_W - GRID.marginX * 2 - cmToIn(0.8),
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 20,
      bold: true,
      color: COLORS.ink,
    });

    addFooter(slide);
  }

  // Slide 4: Goals & scope
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    addHeader(slide, { section: "GOAL & SCOPE", page: 4 });
    addTitle(slide, {
      title: "研究目标与范围：先做可验收的 MVP",
      subtitle: "开题阶段只做关键链路：登录 → 咨询 → 引用 → 工具 → 评测。",
    });

    slide.addShape("roundRect", {
      x: xCol(0),
      y: 2.35,
      w: wCols(4),
      h: 4.9,
      fill: { color: COLORS.card },
      line: { color: COLORS.line, width: 0.5 },
      radius: cmToIn(0.32),
    });
    slide.addShape("roundRect", {
      x: xCol(4),
      y: 2.35,
      w: wCols(2),
      h: 4.9,
      fill: { color: COLORS.card },
      line: { color: COLORS.line, width: 0.5 },
      radius: cmToIn(0.32),
    });

    slide.addText("目标（开题阶段可演示）", {
      x: xCol(0) + cmToIn(0.4),
      y: 2.55,
      w: wCols(4) - cmToIn(0.8),
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 24,
      bold: true,
      color: COLORS.ink,
    });
    slide.addText(
      [
        "• 鉴权与权限边界（邮箱验证码 + JWT）",
        "• 对话咨询（支持流式输出）与会话管理",
        "• RAG 检索引用（Vectorize）与知识库挂载",
        "• 工具能力：文件解析/OCR、文档生成与存储（R2）",
        "• 评测指标定义：引用准确、拒答边界、延迟与稳定性",
      ].join("\n"),
      {
        x: xCol(0) + cmToIn(0.4),
        y: 3.05,
        w: wCols(4) - cmToIn(0.8),
        h: 3.0,
        fontFace: FONTS.zh,
        fontSize: 18,
        color: COLORS.muted,
        lineSpacingMultiple: 1.45,
      },
    );

    slide.addShape("line", {
      x: xCol(0) + cmToIn(0.4),
      y: 6.0,
      w: wCols(4) - cmToIn(0.8),
      h: 0,
      line: { color: COLORS.line, width: 0.5 },
    });
    slide.addText("非目标（明确不做）", {
      x: xCol(0) + cmToIn(0.4),
      y: 6.13,
      w: wCols(4) - cmToIn(0.8),
      h: 0.28,
      fontFace: FONTS.zh,
      fontSize: 14,
      bold: true,
      color: COLORS.muted,
    });
    slide.addText(
      [
        "• 不替代律师，不提供最终法律意见",
        "• 不承诺覆盖全部法律领域",
        "• 不追求复杂动画与花哨特效",
      ].join("\n"),
      {
        x: xCol(0) + cmToIn(0.4),
        y: 6.43,
        w: wCols(4) - cmToIn(0.8),
        h: 0.7,
        fontFace: FONTS.zh,
        fontSize: 14,
        color: COLORS.muted,
        lineSpacingMultiple: 1.35,
      },
    );

    slide.addText("开题交付", {
      x: xCol(4) + cmToIn(0.35),
      y: 2.55,
      w: wCols(2) - cmToIn(0.7),
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 24,
      bold: true,
      color: COLORS.ink,
    });
    slide.addText(
      [
        "• 可跑通端到端 Demo",
        "• 可上传文档并可检索",
        "• 可复现实验与评测",
        "• 论文结构与计划确定",
      ].join("\n"),
      {
        x: xCol(4) + cmToIn(0.35),
        y: 3.1,
        w: wCols(2) - cmToIn(0.7),
        h: 3.7,
        fontFace: FONTS.zh,
        fontSize: 18,
        color: COLORS.muted,
        lineSpacingMultiple: 1.5,
      },
    );

    addFooter(slide);
  }

  // Slide 5: Constraints & mitigations
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    addHeader(slide, { section: "CONSTRAINTS", page: 5 });
    addTitle(slide, {
      title: "关键约束：合规、安全、引用可追溯",
      subtitle: "把风险显式化：先保证“可靠与可控”，再谈“更聪明”。",
    });

    addCard(slide, {
      x: xCol(0),
      y: 2.35,
      w: wCols(3),
      h: 2.35,
      title: "边界与免责声明",
      lines: ["明确不构成法律意见", "鼓励用户补充证据材料", "对高风险问题优先提示咨询律师"],
      risk: true,
    });
    addCard(slide, {
      x: xCol(3),
      y: 2.35,
      w: wCols(3),
      h: 2.35,
      title: "引用与证据链",
      lines: ["回答尽量附引用来源", "无法引用则明确不确定性", "引用格式可验收（便于复查）"],
    });
    addCard(slide, {
      x: xCol(0),
      y: 4.95,
      w: wCols(3),
      h: 2.3,
      title: "隐私与数据安全",
      lines: ["合同/文件可能含敏感信息", "最小化存储与必要脱敏", "对象存储与向量库分权"],
    });
    addCard(slide, {
      x: xCol(3),
      y: 4.95,
      w: wCols(3),
      h: 2.3,
      title: "稳定与降级策略",
      lines: ["超时/重试/限流", "上游不可用时降级输出", "关键路径可测试、可回放"],
    });

    addFooter(slide);
  }

  // Slide 6: Architecture (main visual)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    addHeader(slide, { section: "ARCHITECTURE", page: 6 });
    addTitle(slide, {
      title: "系统架构：Web → Java → FastAPI → LangGraph",
      subtitle: "把鉴权、会话、资源管理放在 Java；把智能编排与检索放在 Agent。",
    });

    const layers = [
      { name: "前端层（Next.js）", desc: "UI / SSE 流式展示 / 用户交互" },
      { name: "服务层（Spring Boot）", desc: "鉴权（验证码+JWT）/ 会话 / 文件接口 / 网关" },
      { name: "智能体层（FastAPI）", desc: "LangGraph 编排 / 工具调用 / 质量控制" },
      { name: "数据层", desc: "关系库（用户/会话）/ Vectorize（RAG）/ R2（文件）" },
    ];

    const x = xCol(0);
    const y0 = 2.35;
    const w = wCols(6);
    const h = 4.9;
    slide.addShape("roundRect", {
      x,
      y: y0,
      w,
      h,
      fill: { color: COLORS.card },
      line: { color: COLORS.line, width: 0.5 },
      radius: cmToIn(0.32),
    });

    const rowH = h / 4;
    layers.forEach((l, i) => {
      const y = y0 + i * rowH;
      if (i > 0) {
        slide.addShape("line", {
          x: x + cmToIn(0.4),
          y,
          w: w - cmToIn(0.8),
          h: 0,
          line: { color: COLORS.line, width: 0.5 },
        });
      }
      slide.addText(l.name, {
        x: x + cmToIn(0.5),
        y: y + 0.25,
        w: 5.2,
        h: 0.35,
        fontFace: FONTS.zh,
        fontSize: 24,
        bold: true,
        color: COLORS.ink,
      });
      slide.addText(l.desc, {
        x: x + cmToIn(0.5),
        y: y + 0.75,
        w: w - cmToIn(1.0),
        h: 0.45,
        fontFace: FONTS.zh,
        fontSize: 18,
        color: COLORS.muted,
      });
    });

    // Bottom chips as a compact "stack" signature
    {
      const y = 7.0 - 0.32;
      let x = GRID.marginX;
      const gap = cmToIn(0.22);
      ["Next.js", "Spring Boot", "FastAPI", "LangGraph", "Vectorize", "R2"].forEach((t) => {
        const w = addChip(slide, { x, y, text: t });
        x += w + gap;
      });
    }

    addFooter(slide);
  }

  // Slide 7: Agent workflow (LangGraph)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    addHeader(slide, { section: "AGENT FLOW", page: 7 });
    addTitle(slide, {
      title: "智能体工作流：检索—推理—生成—引用",
      subtitle: "工具调用优先：先取证，再组织答案与风险提示。",
    });

    const steps = [
      { t: "01 输入", d: "用户问题 / 合同条款 / 文件" },
      { t: "02 解析", d: "意图识别 + 约束与边界" },
      { t: "03 取证", d: "RAG 检索（Vectorize）" },
      { t: "04 工具", d: "OCR / 文档生成 / 知识库管理（可选）" },
      { t: "05 生成", d: "建议 + 风险提示 + 引用" },
      { t: "06 输出", d: "结构化呈现 + 明确不确定性" },
    ];

    const x0 = xCol(0);
    const y0 = 2.5;
    const w = wCols(6);
    const h = 4.7;
    slide.addShape("roundRect", {
      x: x0,
      y: y0,
      w,
      h,
      fill: { color: COLORS.card },
      line: { color: COLORS.line, width: 0.5 },
      radius: cmToIn(0.32),
    });

    steps.forEach((s, i) => {
      const yy = y0 + 0.45 + i * 0.72;
      addChip(slide, { x: x0 + cmToIn(0.4), y: yy, text: s.t });
      slide.addText(s.d, {
        x: x0 + cmToIn(2.3),
        y: yy + 0.05,
        w: w - cmToIn(2.7),
        h: 0.7,
        fontFace: FONTS.zh,
        fontSize: 18,
        color: COLORS.muted,
      });
      if (i < steps.length - 1) {
        slide.addShape("line", {
          x: x0 + cmToIn(0.75),
          y: yy + 0.36,
          w: 0,
          h: 0.72,
          line: { color: COLORS.line, width: 0.5, dash: "dash" },
        });
      }
    });

    slide.addShape("roundRect", {
      x: x0 + cmToIn(0.4),
      y: y0 + 3.95,
      w: w - cmToIn(0.8),
      h: 0.9,
      fill: { color: COLORS.bg },
      line: { color: COLORS.line, width: 0.5 },
      radius: cmToIn(0.32),
    });
    slide.addText(
      "失败/降级：检索为空 → 明确不确定性并引导补充材料；上游不可用 → 降级输出与重试。",
      {
        x: x0 + cmToIn(0.65),
        y: y0 + 4.2,
        w: w - cmToIn(1.3),
        h: 0.5,
        fontFace: FONTS.zh,
        fontSize: 14,
        color: COLORS.muted,
      },
    );

    addFooter(slide);
  }

  // Slide 8: Knowledge base pipeline
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    addHeader(slide, { section: "KNOWLEDGE", page: 8 });
    addTitle(slide, {
      title: "知识库构建：文档入库到可检索",
      subtitle: "R2 存原文，Vectorize 存向量；两者用文档 ID 关联。",
    });

    slide.addShape("roundRect", {
      x: xCol(0),
      y: 2.35,
      w: wCols(6),
      h: 4.9,
      fill: { color: COLORS.card },
      line: { color: COLORS.line, width: 0.5 },
      radius: cmToIn(0.32),
    });

    const y = 3.25;
    const boxW = (wCols(6) - GRID.gutter * 5 - cmToIn(0.8)) / 6;
    const boxH = 1.65;
    const items = [
      { t: "上传", d: "PDF/图片/文档" },
      { t: "存储", d: "R2 原文" },
      { t: "解析", d: "OCR/提取" },
      { t: "分块", d: "Chunking" },
      { t: "向量化", d: "Embedding" },
      { t: "入库", d: "Vectorize" },
    ];
    items.forEach((it, i) => {
      const bx = xCol(0) + cmToIn(0.4) + i * (boxW + GRID.gutter);
      slide.addShape("roundRect", {
        x: bx,
        y,
        w: boxW,
        h: boxH,
        fill: { color: COLORS.bg },
        line: { color: COLORS.line, width: 0.5 },
        radius: cmToIn(0.32),
      });
      slide.addText(it.t, {
        x: bx + 0.1,
        y: y + 0.25,
        w: boxW - 0.2,
        h: 0.35,
        fontFace: FONTS.zh,
        fontSize: 18,
        bold: true,
        color: COLORS.ink,
        align: "center",
      });
      slide.addText(it.d, {
        x: bx + 0.1,
        y: y + 0.75,
        w: boxW - 0.2,
        h: 0.7,
        fontFace: FONTS.zh,
        fontSize: 12,
        color: COLORS.muted,
        align: "center",
      });
      if (i < items.length - 1) {
        slide.addShape("rightArrow", {
          x: bx + boxW + 0.05,
          y: y + 0.65,
          w: 0.28,
          h: 0.35,
          fill: { color: COLORS.muted },
          line: { color: COLORS.muted },
        });
      }
    });

    slide.addText("要点：支持增量更新；检索引用与原文可回溯；知识库可扩展（按领域/标签）。", {
      x: xCol(0) + cmToIn(0.4),
      y: 5.35,
      w: wCols(6) - cmToIn(0.8),
      h: 0.6,
      fontFace: FONTS.zh,
      fontSize: 18,
      color: COLORS.muted,
    });

    addFooter(slide);
  }

  // Slide 9: Evaluation
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    addHeader(slide, { section: "EVALUATION", page: 9 });
    addTitle(slide, {
      title: "评测设计：正确性、引用、鲁棒性",
      subtitle: "开题阶段先把指标定义清楚，确保后续可验收。",
    });

    const y = 2.35;
    addCard(slide, {
      x: xCol(0),
      y,
      w: wCols(2),
      h: 4.9,
      title: "指标",
      lines: ["引用准确率（可复查）", "边界/拒答覆盖率", "检索召回与相关性", "延迟与成功率"],
    });
    addCard(slide, {
      x: xCol(2),
      y,
      w: wCols(2),
      h: 4.9,
      title: "场景",
      lines: ["合同条款风险识别", "常见咨询问答", "材料缺失/冲突", "文件解析与引用"],
    });
    addCard(slide, {
      x: xCol(4),
      y,
      w: wCols(2),
      h: 4.9,
      title: "对比/消融",
      lines: ["无 RAG vs 有 RAG", "不同分块策略", "工具调用开关", "不同模型/降级策略"],
    });

    addFooter(slide);
  }

  // Slide 10: Plan & deliverables + Q&A
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    addHeader(slide, { section: "PLAN", page: 10 });
    addTitle(slide, {
      title: "计划与预期成果",
      subtitle: "可演示 Demo + 可复现实验 + 可写入论文。  Q&A",
    });

    // Left: milestones + deliverables
    slide.addShape("roundRect", {
      x: xCol(0),
      y: 2.35,
      w: wCols(4),
      h: 4.9,
      fill: { color: COLORS.card },
      line: { color: COLORS.line, width: 0.5 },
      radius: cmToIn(0.32),
    });

    slide.addText("里程碑（按周推进）", {
      x: xCol(0) + cmToIn(0.4),
      y: 2.6,
      w: wCols(4) - cmToIn(0.8),
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 20,
      bold: true,
      color: COLORS.ink,
    });

    const weeks = [
      { t: "W1", d: "需求/边界\n大纲与接口" },
      { t: "W2", d: "鉴权/会话\n端到端链路" },
      { t: "W3", d: "Agent 接入\n流式咨询" },
      { t: "W4", d: "知识库入库\nRAG 引用" },
      { t: "W5", d: "评测/消融\n稳定与降级" },
      { t: "W6", d: "打磨演示\n论文撰写" },
    ];
    const boxW = (wCols(4) - GRID.gutter * 5 - cmToIn(0.8)) / 6;
    weeks.forEach((wk, i) => {
      const bx = xCol(0) + cmToIn(0.4) + i * (boxW + GRID.gutter);
      slide.addShape("roundRect", {
        x: bx,
        y: 3.05,
        w: boxW,
        h: 2.35,
        fill: { color: COLORS.bg },
        line: { color: COLORS.line, width: 0.5 },
        radius: cmToIn(0.32),
      });
      slide.addText(wk.t, {
        x: bx,
        y: 3.18,
        w: boxW,
        h: 0.3,
        fontFace: FONTS.en,
        fontSize: 14,
        bold: true,
        color: COLORS.ink,
        align: "center",
      });
      slide.addText(wk.d, {
        x: bx + 0.08,
        y: 3.55,
        w: boxW - 0.16,
        h: 1.7,
        fontFace: FONTS.zh,
        fontSize: 12,
        color: COLORS.muted,
        align: "center",
        valign: "top",
        lineSpacingMultiple: 1.25,
      });
    });

    slide.addShape("line", {
      x: xCol(0) + cmToIn(0.4),
      y: 5.55,
      w: wCols(4) - cmToIn(0.8),
      h: 0,
      line: { color: COLORS.line, width: 0.5 },
    });
    slide.addText("预期成果（答辩口径）", {
      x: xCol(0) + cmToIn(0.4),
      y: 5.7,
      w: wCols(4) - cmToIn(0.8),
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 18,
      bold: true,
      color: COLORS.ink,
    });
    slide.addText(
      [
        "• 可运行系统与演示视频（可选）",
        "• 可上传/检索/引用的知识库",
        "• 评测报告（指标 + 消融）",
        "• 论文与开源说明文档",
      ].join("\n"),
      {
        x: xCol(0) + cmToIn(0.4),
        y: 6.1,
        w: wCols(4) - cmToIn(0.8),
        h: 1.1,
        fontFace: FONTS.zh,
        fontSize: 14,
        color: COLORS.muted,
        lineSpacingMultiple: 1.35,
      },
    );

    // Right: Q&A panel
    slide.addShape("roundRect", {
      x: xCol(4),
      y: 2.35,
      w: wCols(2),
      h: 4.9,
      fill: { color: COLORS.bg },
      line: { color: COLORS.line, width: 0.5 },
      radius: cmToIn(0.32),
    });
    slide.addText("Q&A", {
      x: xCol(4),
      y: 3.7,
      w: wCols(2),
      h: 1.0,
      fontFace: FONTS.en,
      fontSize: 48,
      bold: true,
      color: COLORS.ink,
      align: "center",
      valign: "mid",
    });

    addFooter(slide);
  }

  const outPath = path.resolve(__dirname, "..", "Equivocal_Legal_开题答辩_final.pptx");
  return pptx.writeFile({ fileName: outPath });
}

build().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
