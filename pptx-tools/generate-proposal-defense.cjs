/* eslint-disable no-console */
/**
 * Scheme B (aggressive): product-launch narrative
 * - Fewer words, stronger hierarchy
 * - Semantic colors (risk=red, done=green, AI=purple)
 * - Clean white canvas (no heavy top bars)
 */
const path = require("path");
const pptxgen = require("pptxgenjs");

const SLIDE_W = 13.333; // inches, LAYOUT_WIDE
const SLIDE_H = 7.5;

const COLORS = {
  bg: "F8FAFC",
  ink: "0F172A",
  slate: "334155",
  muted: "64748B",
  line: "E2E8F0",
  card: "FFFFFF",
  navy: "0B1220",
  purple: "A855F7", // AI
  green: "22C55E", // pass / MVP
  red: "EF4444", // risk
  orange: "F97316", // emphasis
};

const FONTS = {
  zh: "Microsoft YaHei",
  en: "Arial",
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function addSlideNumber(slide, n, onDark = false) {
  slide.addText(String(n), {
    x: SLIDE_W - 0.75,
    y: SLIDE_H - 0.48,
    w: 0.55,
    h: 0.28,
    fontFace: FONTS.en,
    fontSize: 10,
    color: onDark ? "94A3B8" : COLORS.muted,
    align: "right",
  });
}

function addTitle(slide, { title, subtitle, accent = COLORS.orange, onDark = false }) {
  const x = 0.9;
  const y = 0.82;
  const titleLines = String(title).split("\n").length;
  const isTwoLineTitle = titleLines >= 2;
  const titleFontSize = isTwoLineTitle ? 36 : 40;
  const titleBoxH = isTwoLineTitle ? 1.1 : 0.72;

  slide.addText(title, {
    x,
    y,
    w: SLIDE_W - 1.8,
    h: titleBoxH,
    fontFace: FONTS.zh,
    fontSize: titleFontSize,
    bold: true,
    color: onDark ? "FFFFFF" : COLORS.ink,
  });

  const subtitleY = y + titleBoxH + 0.05;

  if (subtitle) {
    slide.addText(subtitle, {
      x,
      y: subtitleY,
      w: SLIDE_W - 1.8,
      h: 0.42,
      fontFace: FONTS.zh,
      fontSize: 16,
      color: onDark ? "CBD5E1" : COLORS.muted,
    });
  }

  const underlineY = subtitle ? subtitleY + 0.55 : y + titleBoxH + 0.25;
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
    line: { color: onDark ? "1F2937" : COLORS.line, width: 1 },
  });
}

function addKicker(slide, text, { x, y, color = COLORS.muted, onDark = false } = {}) {
  slide.addText(text, {
    x: x ?? 0.9,
    y: y ?? 0.28,
    w: SLIDE_W - 1.8,
    h: 0.25,
    fontFace: FONTS.en,
    fontSize: 11,
    letterSpacing: 1,
    color: onDark ? "94A3B8" : color,
  });
}

function addCard(slide, { x, y, w, h, accent, title, lines, titleColor = COLORS.ink }) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    fill: { color: COLORS.card },
    line: { color: COLORS.line, width: 1 },
    radius: 0.18,
    shadow: { color: "000000", opacity: 0.08, blur: 6, angle: 45, distance: 2 },
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
    y: y + 0.18,
    w: w - 0.35,
    h: 0.35,
    fontFace: FONTS.zh,
    fontSize: 16,
    bold: true,
    color: titleColor,
  });

  slide.addText(lines.join("\n"), {
    x: x + 0.22,
    y: y + 0.6,
    w: w - 0.35,
    h: h - 0.8,
    fontFace: FONTS.zh,
    fontSize: 13,
    color: COLORS.slate,
    valign: "top",
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

function addStepRow(slide, { x, y, w, steps }) {
  const stepW = w / steps.length;
  const midY = y + 0.26;

  slide.addShape("line", {
    x: x + 0.25,
    y: midY,
    w: w - 0.5,
    h: 0,
    line: { color: COLORS.line, width: 2 },
  });

  steps.forEach((s, idx) => {
    const cx = x + idx * stepW;
    const bubbleX = cx + 0.05;
    const bubbleColor = s.accent ?? COLORS.orange;

    slide.addShape("ellipse", {
      x: bubbleX,
      y,
      w: 0.52,
      h: 0.52,
      fill: { color: bubbleColor },
      line: { color: bubbleColor },
    });
    slide.addText(String(idx + 1), {
      x: bubbleX,
      y: y + 0.12,
      w: 0.52,
      h: 0.3,
      fontFace: FONTS.en,
      fontSize: 12,
      bold: true,
      color: "FFFFFF",
      align: "center",
    });

    slide.addText(s.title, {
      x: bubbleX + 0.65,
      y: y + 0.02,
      w: stepW - 0.75,
      h: 0.25,
      fontFace: FONTS.zh,
      fontSize: 12,
      bold: true,
      color: COLORS.ink,
    });
    slide.addText(s.desc, {
      x: bubbleX + 0.65,
      y: y + 0.28,
      w: stepW - 0.75,
      h: 0.45,
      fontFace: FONTS.zh,
      fontSize: 11,
      color: COLORS.muted,
    });
  });
}

function build() {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Equivocal Legal";
  pptx.company = "Equivocal";
  pptx.subject = "开题答辩（方案B：重叙事重设计）";
  pptx.title = "Equivocal Legal 开题答辩";
  pptx.theme = { headFontFace: FONTS.zh, bodyFontFace: FONTS.zh, lang: "zh-CN" };

  const logoPath = path.resolve(__dirname, "..", "public", "placeholder-logo.png");

  // Cover typically has no slide number; start numbering from slide 2.
  let slideNo = 2;

  // Slide 1: Cover (dark, minimal, product-ish)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.navy };

    slide.addShape("rect", {
      x: 0,
      y: 0,
      w: 0.18,
      h: SLIDE_H,
      fill: { color: COLORS.purple },
      line: { color: COLORS.purple },
    });

    slide.addShape("ellipse", {
      x: SLIDE_W - 4.7,
      y: -1.0,
      w: 5.6,
      h: 5.6,
      fill: { color: COLORS.purple, transparency: 88 },
      line: { color: COLORS.purple, transparency: 88 },
    });
    slide.addShape("ellipse", {
      x: SLIDE_W - 3.4,
      y: 3.9,
      w: 3.2,
      h: 3.2,
      fill: { color: COLORS.orange, transparency: 90 },
      line: { color: COLORS.orange, transparency: 90 },
    });

    slide.addImage({ path: logoPath, x: 0.9, y: 0.75, w: 0.95, h: 0.95 });

    addKicker(slide, "PROPOSAL DEFENSE", { x: 2.05, y: 0.95, onDark: true });

    slide.addText("Equivocal Legal", {
      x: 0.9,
      y: 1.85,
      w: SLIDE_W - 1.8,
      h: 0.65,
      fontFace: FONTS.en,
      fontSize: 44,
      bold: true,
      color: "FFFFFF",
    });
    slide.addText("法律助手系统", {
      x: 0.9,
      y: 2.55,
      w: SLIDE_W - 1.8,
      h: 0.5,
      fontFace: FONTS.zh,
      fontSize: 30,
      bold: true,
      color: "E2E8F0",
    });

    slide.addShape("line", {
      x: 0.9,
      y: 3.25,
      w: 3.2,
      h: 0,
      line: { color: COLORS.orange, width: 5 },
    });

    slide.addText(
      ["姓名：__________", "学号：__________", "学院/专业：__________", "指导教师：__________", "日期：____年__月__日"].join(
        "\n"
      ),
      {
        x: 0.9,
        y: 3.6,
        w: 6.8,
        h: 1.5,
        fontFace: FONTS.zh,
        fontSize: 14,
        color: "CBD5E1",
      }
    );

    slide.addText("定位：咨询对话 + 合同审查 + 会话追溯（可扩展 RAG/OCR/文书生成）", {
      x: 0.9,
      y: 6.9,
      w: SLIDE_W - 1.8,
      h: 0.3,
      fontFace: FONTS.zh,
      fontSize: 12,
      color: "94A3B8",
    });
  }

  // Slide 2: Problem statement (one big truth)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };

    addKicker(slide, "PROBLEM", { color: COLORS.muted });
    addTitle(slide, {
      title: "法律服务的高门槛\n= 信息不对称 + 成本不透明",
      subtitle: "我们要做的不是“聊天”，而是把咨询流程变得可用、可控、可追溯。",
      accent: COLORS.orange,
    });

    const y = 2.35;
    const w = (SLIDE_W - 0.9 * 2 - 0.5 * 2) / 3;

    addCard(slide, {
      x: 0.9,
      y,
      w,
      h: 3.2,
      accent: COLORS.orange,
      title: "获取建议成本高",
      lines: ["价格/时间不可预期", "普通用户缺乏入口与判断标准", "（可替换：调研数据/案例）"],
    });
    addCard(slide, {
      x: 0.9 + w + 0.5,
      y,
      w,
      h: 3.2,
      accent: COLORS.red,
      title: "合同风险难识别",
      lines: ["条款专业、隐藏风险多", "常见场景：违约/赔偿/争议条款", "（可替换：风险点样例）"],
    });
    addCard(slide, {
      x: 0.9 + (w + 0.5) * 2,
      y,
      w,
      h: 3.2,
      accent: COLORS.purple,
      title: "知识检索碎片化",
      lines: ["法规/案例/流程分散", "检索成本高、难以对齐语境", "（可替换：知识库范围）"],
    });

    slide.addText("一句话机会：让用户在 3 分钟内得到“可执行的下一步”，并把对话沉淀为可追溯记录。", {
      x: 0.9,
      y: 6.35,
      w: SLIDE_W - 1.8,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 15,
      bold: true,
      color: COLORS.ink,
    });

    addSlideNumber(slide, slideNo++);
  }

  // Slide 3: Scope (MVP vs enhancements)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };

    addKicker(slide, "SCOPE", { color: COLORS.muted });
    addTitle(slide, {
      title: "最小可交付闭环：\n认证 + 咨询对话 + 会话追溯",
      subtitle: "开题阶段先把“能用且可验收”做出来，再谈增强。",
      accent: COLORS.green,
    });

    slide.addShape("roundRect", {
      x: 0.9,
      y: 2.35,
      w: 6.15,
      h: 4.75,
      fill: { color: COLORS.card },
      line: { color: COLORS.line },
      radius: 0.18,
    });
    slide.addShape("roundRect", {
      x: 7.25,
      y: 2.35,
      w: 5.18,
      h: 4.75,
      fill: { color: COLORS.card },
      line: { color: COLORS.line },
      radius: 0.18,
    });

    slide.addText("MVP（必须交付）", {
      x: 1.15,
      y: 2.55,
      w: 5.7,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 16,
      bold: true,
      color: COLORS.ink,
    });

    addBullets(slide, ["邮箱验证码注册/登录", "JWT 鉴权与权限控制", "咨询对话（支持流式）", "会话列表/消息落库/删除", "基础管理统计（可选）"], {
      x: 1.15,
      y: 3.05,
      w: 5.75,
      h: 3.8,
      fontSize: 15,
      color: COLORS.slate,
    });

    slide.addText("增强项（可选）", {
      x: 7.5,
      y: 2.55,
      w: 4.75,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 16,
      bold: true,
      color: COLORS.ink,
    });

    addBullets(slide, ["合同文件上传/解析（OCR）", "RAG：引用法律知识库", "文书生成（Word/PDF）", "对象存储与向量库接入", "更丰富的沉浸式动效"], {
      x: 7.5,
      y: 3.05,
      w: 4.8,
      h: 3.8,
      fontSize: 15,
      color: COLORS.slate,
    });

    slide.addShape("rect", {
      x: 0.9,
      y: 2.35,
      w: 0.08,
      h: 4.75,
      fill: { color: COLORS.green },
      line: { color: COLORS.green },
    });
    slide.addShape("rect", {
      x: 7.25,
      y: 2.35,
      w: 0.08,
      h: 4.75,
      fill: { color: COLORS.purple },
      line: { color: COLORS.purple },
    });

    addSlideNumber(slide, slideNo++);
  }

  // Slide 4: User journey
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };

    addKicker(slide, "USER JOURNEY", { color: COLORS.muted });
    addTitle(slide, {
      title: "用户旅程：把“咨询”变成一条可走通的路",
      subtitle: "每一步都可解释：输入是什么、系统做了什么、结果怎么追溯。",
      accent: COLORS.purple,
    });

    addStepRow(slide, {
      x: 0.9,
      y: 2.45,
      w: SLIDE_W - 1.8,
      steps: [
        { title: "登录/验证", desc: "邮箱验证码\nJWT 鉴权", accent: COLORS.green },
        { title: "选择服务", desc: "咨询/合同\n场景化入口", accent: COLORS.orange },
        { title: "对话咨询", desc: "多轮问答\n支持 Streaming", accent: COLORS.purple },
        { title: "生成结果", desc: "风险提示/建议\n可下载", accent: COLORS.orange },
        { title: "历史追溯", desc: "会话列表\n消息落库", accent: COLORS.green },
      ],
    });

    addCard(slide, {
      x: 0.9,
      y: 4.1,
      w: 12.55,
      h: 2.65,
      accent: COLORS.ink,
      title: "我们的底线：不做“万能回答”，只输出“可执行的下一步”",
      lines: ["对 AI 输出加“风险提示模板”与“边界声明”", "需要更高可信度时：使用 RAG 引用来源（可选）", "所有结果绑定会话，便于复盘与验收"],
      titleColor: COLORS.ink,
    });

    addSlideNumber(slide, slideNo++);
  }

  // Slide 5: Architecture (core chain only)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };

    addKicker(slide, "ARCHITECTURE", { color: COLORS.muted });
    addTitle(slide, {
      title: "核心链路：前端 → 后端 → AI → 数据",
      subtitle: "拆分的目的只有一个：把“可控与可审计”留在服务端，把“体验”留在前端。",
      accent: COLORS.orange,
    });

    const y = 2.6;
    const boxH = 1.15;
    const boxW = 2.65;
    const gap = 0.4;
    const startX = 0.85;

    const boxes = [
      { label: "Next.js 前端", sub: "动效/3D/交互", accent: COLORS.ink },
      { label: "Java 后端", sub: "鉴权/落库/网关", accent: COLORS.ink },
      { label: "AI 服务", sub: "Coze / LangGraph", accent: COLORS.purple },
      { label: "数据层", sub: "MySQL +（可选）R2/Vector", accent: COLORS.green },
    ];

    boxes.forEach((b, i) => {
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
      slide.addShape("rect", {
        x,
        y,
        w: 0.08,
        h: boxH,
        fill: { color: b.accent },
        line: { color: b.accent },
      });
      slide.addText(b.label, {
        x: x + 0.22,
        y: y + 0.18,
        w: boxW - 0.35,
        h: 0.3,
        fontFace: FONTS.zh,
        fontSize: 15,
        bold: true,
        color: COLORS.ink,
      });
      slide.addText(b.sub, {
        x: x + 0.22,
        y: y + 0.55,
        w: boxW - 0.35,
        h: 0.3,
        fontFace: FONTS.zh,
        fontSize: 12,
        color: COLORS.muted,
      });

      if (i < boxes.length - 1) {
        slide.addShape("rightArrow", {
          x: x + boxW + 0.12,
          y: y + 0.33,
          w: 0.45,
          h: 0.5,
          fill: { color: "94A3B8" },
          line: { color: "94A3B8" },
        });
      }
    });

    addCard(slide, {
      x: 0.9,
      y: 4.25,
      w: 12.55,
      h: 2.4,
      accent: COLORS.orange,
      title: "为什么这样设计？（可当答辩口径）",
      lines: [
        "1) 后端统一鉴权与审计：避免前端直接暴露密钥与逻辑",
        "2) AI 可切换/可降级：Coze 默认可用，自建 Agent 作为增强路线",
        "3) 会话落库：结果可追溯、可复盘、可验收",
      ],
    });

    addSlideNumber(slide, slideNo++);
  }

  // Slide 6: Data model (cards instead of tables)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };

    addKicker(slide, "DATA MODEL", { color: COLORS.muted });
    addTitle(slide, {
      title: "数据模型：让对话可追溯、可管理",
      subtitle: "只保留最关键的 4 张表：users / sessions / messages / codes。",
      accent: COLORS.green,
    });

    const y = 2.55;
    const cardW = 3.5;
    const cardH = 2.05;
    const x1 = 0.9;
    const x2 = x1 + cardW + 0.7;
    const x3 = x2 + cardW + 0.7;

    addCard(slide, {
      x: x1,
      y,
      w: cardW,
      h: cardH,
      accent: COLORS.ink,
      title: "users",
      lines: ["id (PK)", "email (UNIQUE)", "password (BCrypt)", "role, email_verified"],
    });
    addCard(slide, {
      x: x2,
      y,
      w: cardW,
      h: cardH,
      accent: COLORS.orange,
      title: "chat_sessions",
      lines: ["id (PK)", "user_id (FK)", "title", "created_at, updated_at"],
    });
    addCard(slide, {
      x: x3,
      y,
      w: cardW,
      h: cardH,
      accent: COLORS.purple,
      title: "chat_messages",
      lines: ["id (AUTO)", "session_id (FK)", "role", "content, content_type, created_at"],
    });

    // Relationship arrows
    slide.addShape("rightArrow", {
      x: x1 + cardW + 0.15,
      y: y + 0.78,
      w: 0.4,
      h: 0.4,
      fill: { color: "94A3B8" },
      line: { color: "94A3B8" },
    });
    slide.addShape("rightArrow", {
      x: x2 + cardW + 0.15,
      y: y + 0.78,
      w: 0.4,
      h: 0.4,
      fill: { color: "94A3B8" },
      line: { color: "94A3B8" },
    });

    addCard(slide, {
      x: 0.9,
      y: 4.9,
      w: 6.2,
      h: 1.75,
      accent: COLORS.green,
      title: "verification_codes",
      lines: ["email, code, type(register/login)", "expires_at, used, attempts", "作用：降低垃圾注册，提高账号安全性"],
    });

    addCard(slide, {
      x: 7.35,
      y: 4.9,
      w: 6.1,
      h: 1.75,
      accent: COLORS.red,
      title: "验收点（开题阶段就能说清楚）",
      lines: ["每条 AI 回复都能定位到 session + message", "可按用户拉取历史会话", "删除会话后数据一致性正确"],
    });

    addSlideNumber(slide, slideNo++);
  }

  // Slide 7: 3 hard problems (no fluff)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };

    addKicker(slide, "ENGINEERING", { color: COLORS.muted });
    addTitle(slide, {
      title: "三个难题，我们不绕弯",
      subtitle: "把风险讲清楚，老师才会信你能做完。",
      accent: COLORS.red,
    });

    const rows = [
      {
        problem: "AI 输出不确定性",
        pColor: COLORS.red,
        solution: ["输出边界声明 + 风险提示模板", "需要可信度：RAG 引用来源（可选）", "会话落库，便于追责与复盘"],
        sColor: COLORS.green,
      },
      {
        problem: "LLM API 兼容性/稳定性",
        pColor: COLORS.orange,
        solution: ["超时/重试/降级：工具不可用时回退纯对话", "支持 Coze ↔ 自建 Agent 两条路线", "接口层做适配，避免 UI 绑死供应商"],
        sColor: COLORS.green,
      },
      {
        problem: "隐私与安全（法律场景更敏感）",
        pColor: COLORS.purple,
        solution: ["JWT 鉴权 + 权限控制 + CORS 策略", "敏感信息最小化存储/脱敏", "文件上传权限控制（可选接 R2）"],
        sColor: COLORS.green,
      },
    ];

    rows.forEach((r, idx) => {
      const y = 2.45 + idx * 1.65;

      slide.addShape("roundRect", {
        x: 0.9,
        y,
        w: 12.55,
        h: 1.35,
        fill: { color: COLORS.card },
        line: { color: COLORS.line },
        radius: 0.18,
      });

      slide.addShape("roundRect", {
        x: 1.05,
        y: y + 0.28,
        w: 3.6,
        h: 0.78,
        fill: { color: r.pColor, transparency: 6 },
        line: { color: r.pColor },
        radius: 0.18,
      });
      slide.addText(`问题：${r.problem}`, {
        x: 1.15,
        y: y + 0.46,
        w: 3.45,
        h: 0.4,
        fontFace: FONTS.zh,
        fontSize: 14,
        bold: true,
        color: "FFFFFF",
      });

      addBullets(slide, r.solution, {
        x: 4.9,
        y: y + 0.32,
        w: 8.35,
        h: 1.05,
        fontSize: 14,
        color: COLORS.slate,
      });
    });

    addSlideNumber(slide, slideNo++);
  }

  // Slide 8: Evaluation & testing
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };

    addKicker(slide, "VALIDATION", { color: COLORS.muted });
    addTitle(slide, {
      title: "如何验收：指标 + 测试",
      subtitle: "没有验收口径的项目就是“做着玩”。这里把口径提前写死。",
      accent: COLORS.green,
    });

    slide.addShape("roundRect", {
      x: 0.9,
      y: 2.35,
      w: 6.15,
      h: 4.75,
      fill: { color: COLORS.card },
      line: { color: COLORS.line },
      radius: 0.18,
    });
    slide.addShape("roundRect", {
      x: 7.25,
      y: 2.35,
      w: 5.18,
      h: 4.75,
      fill: { color: COLORS.card },
      line: { color: COLORS.line },
      radius: 0.18,
    });

    slide.addText("指标（建议写进开题报告）", {
      x: 1.15,
      y: 2.55,
      w: 5.7,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 16,
      bold: true,
      color: COLORS.ink,
    });
    addBullets(
      slide,
      [
        "核心接口成功率：≥ 99%（开发环境）",
        "关键流程耗时：登录 → 发起咨询 → 落库 ≤ X 秒（自行定义）",
        "RAG（可选）：命中率/相关性采用抽样人工评估",
        "安全：未登录不可访问会话与上传接口",
      ],
      { x: 1.15, y: 3.05, w: 5.75, h: 3.85, fontSize: 14 }
    );

    slide.addText("测试分层（从连通到端到端）", {
      x: 7.5,
      y: 2.55,
      w: 4.75,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 16,
      bold: true,
      color: COLORS.ink,
    });

    const testTable = [
      [
        { text: "层级", options: { fill: { color: COLORS.ink }, color: "FFFFFF", bold: true } },
        { text: "关注点", options: { fill: { color: COLORS.ink }, color: "FFFFFF", bold: true } },
      ],
      ["前端", "页面渲染/交互/错误提示"],
      ["后端", "鉴权、会话接口、上传接口"],
      ["AI", "对话/降级策略（工具不可用）"],
      ["系统", "咨询→保存→历史追溯闭环"],
    ];

    slide.addTable(testTable, {
      x: 7.5,
      y: 3.05,
      w: 4.75,
      h: 2.35,
      colW: [1.3, 3.45],
      rowH: [0.42, 0.45, 0.45, 0.45, 0.45],
      border: { pt: 1, color: "CBD5E1" },
      fontFace: FONTS.zh,
      fontSize: 12,
      valign: "middle",
    });

    slide.addText("仓库证据：已存在连通性测试报告（前端/后端/AI Agent）。", {
      x: 7.5,
      y: 5.55,
      w: 4.75,
      h: 0.6,
      fontFace: FONTS.zh,
      fontSize: 12,
      color: COLORS.muted,
    });

    addSlideNumber(slide, slideNo++);
  }

  // Slide 9: Schedule + risks (combined)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };

    addKicker(slide, "PLAN", { color: COLORS.muted });
    addTitle(slide, {
      title: "计划：8 周推进，风险前置",
      subtitle: "进度不是许愿，是拆任务、定验收、控范围。",
      accent: COLORS.orange,
    });

    // Left: simplified timeline
    slide.addShape("roundRect", {
      x: 0.9,
      y: 2.35,
      w: 7.05,
      h: 4.75,
      fill: { color: COLORS.card },
      line: { color: COLORS.line },
      radius: 0.18,
    });
    slide.addText("里程碑（示例，可替换为课程周次/日期）", {
      x: 1.15,
      y: 2.55,
      w: 6.6,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 16,
      bold: true,
      color: COLORS.ink,
    });

    const milestones = [
      { w: "W1–W2", text: "需求/用例/原型 + 数据库设计", color: COLORS.orange },
      { w: "W3–W4", text: "后端：鉴权/会话/上传 + 基础联调", color: COLORS.ink },
      { w: "W5–W6", text: "AI 接入：Coze 默认 + 降级策略", color: COLORS.purple },
      { w: "W7", text: "端到端测试 + 文档补齐", color: COLORS.green },
      { w: "W8", text: "演示材料/答辩彩排", color: COLORS.orange },
    ];

    milestones.forEach((m, i) => {
      const y = 3.15 + i * 0.75;
      slide.addShape("roundRect", {
        x: 1.15,
        y,
        w: 0.95,
        h: 0.42,
        fill: { color: "E2E8F0" },
        line: { color: "CBD5E1" },
        radius: 0.12,
      });
      slide.addText(m.w, {
        x: 1.15,
        y: y + 0.1,
        w: 0.95,
        h: 0.25,
        fontFace: FONTS.en,
        fontSize: 11,
        bold: true,
        color: COLORS.slate,
        align: "center",
      });
      slide.addShape("roundRect", {
        x: 2.2,
        y,
        w: 5.45,
        h: 0.42,
        fill: { color: m.color, transparency: 12 },
        line: { color: m.color },
        radius: 0.12,
      });
      slide.addText(m.text, {
        x: 2.35,
        y: y + 0.1,
        w: 5.25,
        h: 0.25,
        fontFace: FONTS.zh,
        fontSize: 12,
        color: COLORS.ink,
      });
    });

    // Right: risk list
    slide.addShape("roundRect", {
      x: 8.15,
      y: 2.35,
      w: 4.28,
      h: 4.75,
      fill: { color: COLORS.card },
      line: { color: COLORS.line },
      radius: 0.18,
    });
    slide.addText("Top 风险（必须讲）", {
      x: 8.4,
      y: 2.55,
      w: 3.9,
      h: 0.35,
      fontFace: FONTS.zh,
      fontSize: 16,
      bold: true,
      color: COLORS.ink,
    });

    const risks = [
      { t: "LLM 不兼容/不稳定", d: "降级 + 切换路线（Coze↔自建）", c: COLORS.red },
      { t: "范围膨胀导致延期", d: "MVP 优先：认证+咨询+追溯", c: COLORS.orange },
      { t: "隐私与合规风险", d: "最小化存储 + 权限控制 + 脱敏", c: COLORS.purple },
    ];

    risks.forEach((r, i) => {
      const y = 3.12 + i * 1.25;
      slide.addShape("roundRect", {
        x: 8.4,
        y,
        w: 3.78,
        h: 1.05,
        fill: { color: "F1F5F9" },
        line: { color: COLORS.line },
        radius: 0.16,
      });
      slide.addShape("rect", {
        x: 8.4,
        y,
        w: 0.08,
        h: 1.05,
        fill: { color: r.c },
        line: { color: r.c },
      });
      slide.addText(r.t, {
        x: 8.55,
        y: y + 0.15,
        w: 3.6,
        h: 0.28,
        fontFace: FONTS.zh,
        fontSize: 13,
        bold: true,
        color: COLORS.ink,
      });
      slide.addText(`对策：${r.d}`, {
        x: 8.55,
        y: y + 0.48,
        w: 3.6,
        h: 0.4,
        fontFace: FONTS.zh,
        fontSize: 12,
        color: COLORS.slate,
      });
    });

    addSlideNumber(slide, slideNo++);
  }

  // Slide 10: Q&A (dark, clean)
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.navy };

    slide.addShape("ellipse", {
      x: -1.9,
      y: SLIDE_H - 5.3,
      w: 6.2,
      h: 6.2,
      fill: { color: COLORS.purple, transparency: 90 },
      line: { color: COLORS.purple, transparency: 90 },
    });
    slide.addShape("ellipse", {
      x: SLIDE_W - 3.6,
      y: -1.3,
      w: 4.4,
      h: 4.4,
      fill: { color: COLORS.orange, transparency: 92 },
      line: { color: COLORS.orange, transparency: 92 },
    });

    slide.addText("Q & A", {
      x: 0.9,
      y: 2.4,
      w: SLIDE_W - 1.8,
      h: 1.0,
      fontFace: FONTS.en,
      fontSize: 72,
      bold: true,
      color: "FFFFFF",
    });
    slide.addText("谢谢。欢迎质疑我的边界与验收口径。", {
      x: 0.9,
      y: 3.5,
      w: SLIDE_W - 1.8,
      h: 0.4,
      fontFace: FONTS.zh,
      fontSize: 18,
      color: "CBD5E1",
    });

    slide.addText("（联系信息/演示地址可放这里）", {
      x: 0.9,
      y: 6.95,
      w: SLIDE_W - 1.8,
      h: 0.3,
      fontFace: FONTS.zh,
      fontSize: 12,
      color: "94A3B8",
    });

    addSlideNumber(slide, slideNo++, true);
  }

  const outputPath = path.resolve(__dirname, "..", "Equivocal_Legal_开题答辩.pptx");
  return pptx.writeFile({ fileName: outputPath }).then(() => outputPath);
}

build()
  .then((out) => console.log(`Generated: ${out}`))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
