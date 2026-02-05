export type RentScamRiskLevel = "低" | "中" | "高";

export type RentScamTag =
  | "低价诱饵"
  | "押金定金"
  | "假房东"
  | "假中介"
  | "二房东"
  | "支付链接"
  | "异地看房";

export type RentScamCase = {
  slug: string;
  title: string;
  subtitle: string;
  risk: RentScamRiskLevel;
  tags: RentScamTag[];
  cover: { src: string; alt: string };
  summary: string;
  typicalLines: string[];
  redFlags: string[];
  safeMoves: string[];
};

export const rentScamCases: RentScamCase[] = [
  {
    slug: "too-good-to-be-true-low-price",
    title: "低价房源诱饵",
    subtitle: "用“超低价+急租”把你引到私聊",
    risk: "中",
    tags: ["低价诱饵"],
    cover: {
      src: "/rent-scam-cases/low-price-bait.svg",
      alt: "价格标签与房屋的插图",
    },
    summary:
      "房源图精修、价格明显低于市场，随后以“马上被订走”为由催促你跳过平台流程，转到微信/QQ/Telegram 私聊。",
    typicalLines: [
      "急租，今天定就给你最低价",
      "平台消息不方便，微信聊更快",
      "先付个定金我就给你留房",
    ],
    redFlags: [
      "价格显著低于同小区/同户型市场价",
      "拒绝在平台内沟通或拒绝出示可核验信息",
      "反复强调“马上被抢走”制造紧迫感",
    ],
    safeMoves: [
      "把同小区相似房源价格当“基准线”，低得离谱直接跳过",
      "坚持走平台官方沟通/签约/支付渠道",
      "要求线下实地看房+核验产权/出租授权，再谈付款",
    ],
  },
  {
    slug: "deposit-first",
    title: "先交定金/押金再看房",
    subtitle: "用“锁房费/保证金”卡住你",
    risk: "高",
    tags: ["押金定金"],
    cover: { src: "/rent-scam-cases/deposit-first.svg", alt: "钱包与箭头的插图" },
    summary:
      "对方以“看房名额/钥匙押金/锁房费”为由要求先转账，金额通常不大但难追回，甚至会继续加码让你分批转。",
    typicalLines: ["先交 200 锁房费，不然给别人了", "钥匙押金，见面就退", "付了我就发定位"],
    redFlags: [
      "不见面不看房就要求任何形式转账",
      "以“可退”为诱导但不给明确退还条件",
      "频繁更换收款方式/收款人",
    ],
    safeMoves: [
      "原则：未实地看房、未核验身份与授权，一分钱不付",
      "任何“可退”必须写入合同/平台订单规则并可举证",
      "坚持线下当面交付钥匙与签约后再支付押金/租金",
    ],
  },
  {
    slug: "fake-landlord-multi-lease",
    title: "假房东“一房多租”",
    subtitle: "伪造产权/租约，收完钱就失联",
    risk: "高",
    tags: ["假房东", "押金定金"],
    cover: { src: "/rent-scam-cases/fake-landlord.svg", alt: "房屋与证件的插图" },
    summary:
      "冒充房东或持伪造材料带人看房，收取押金/半年租金后消失；或同一套房同时签给多人，造成纠纷与损失。",
    typicalLines: ["我人在外地，家人带你看房", "合同先签，款打到我卡上", "你先付半年我给你再优惠"],
    redFlags: [
      "不愿出示可核验的产权信息/出租授权",
      "收款账户与房东身份信息不一致",
      "拒绝在合同中写明房屋权属与交付清单",
    ],
    safeMoves: [
      "核验：产权证/不动产登记信息 + 房东身份证一致性（可打码复印留存）",
      "若是代理/亲属：必须出示房东签署的授权委托与证件复印件",
      "大额付款尽量走平台托管或对公/可追溯方式，并保留收据/聊天记录",
    ],
  },
  {
    slug: "remote-viewing-vr",
    title: "异地“VR 看房”套路",
    subtitle: "用视频/直播替代实地，催你先付款",
    risk: "中",
    tags: ["异地看房", "支付链接"],
    cover: { src: "/rent-scam-cases/remote-viewing.svg", alt: "手机与房屋的插图" },
    summary:
      "对方提供“直播看房/VR 全景/短视频”，但拒绝线下见面或拖延到你付款后再安排；甚至视频根本不是该房源。",
    typicalLines: [
      "我现在不在本地，视频给你看得很清楚",
      "你先付定金，我同事明天带你签",
      "房源很抢手，先锁一下",
    ],
    redFlags: [
      "拒绝提供精确门牌/小区楼栋信息以便核验",
      "不允许你带朋友或中介一起到现场确认",
      "付款前不让你查看原件或交付物（钥匙/门禁卡）",
    ],
    safeMoves: [
      "坚持实地看房（含楼道、门牌、采光、噪音、周边）",
      "要求拍摄带当天报纸/手机时间的现场视频并核对门牌",
      "先小额订金也要走可追溯渠道，且必须有明确退还条款",
    ],
  },
  {
    slug: "fake-agency-fee",
    title: "假中介“带看费/茶水费”",
    subtitle: "各种名目收费，收完就消失",
    risk: "中",
    tags: ["假中介"],
    cover: { src: "/rent-scam-cases/agency-fee.svg", alt: "合同与印章的插图" },
    summary:
      "以“预约费/带看服务费/资料费/合同工本费”等名义先收费，随后房源下架、改口涨价或直接拉黑。",
    typicalLines: [
      "先交 99 元登记费才能安排带看",
      "不交服务费不给你留名额",
      "合同工本费，都是这样",
    ],
    redFlags: [
      "带看前要求先收费或签不透明的服务协议",
      "费用名目模糊、不开票不出收据",
      "拒绝提供公司资质与对公收款信息",
    ],
    safeMoves: [
      "优先选择正规中介/平台，核验营业执照与门店信息",
      "收费项目、标准与退费条件写清楚并留存凭证",
      "拒绝不合理前置收费：带看前仅接受公开透明的服务条款",
    ],
  },
  {
    slug: "sublet-runaway-landlord",
    title: "二房东转租“卷款跑路”",
    subtitle: "收完年付/季付后断供原房东",
    risk: "高",
    tags: ["二房东", "押金定金"],
    cover: { src: "/rent-scam-cases/sublet-chain.svg", alt: "钥匙与链条的插图" },
    summary:
      "二房东以“年付更便宜”诱导你一次性付款，但其未向原房东按时交租，最终你被清退或陷入三方纠纷。",
    typicalLines: ["年付再打 9 折", "原房东很忙不见人，我全权负责", "合同你放心，签我的就行"],
    redFlags: [
      "无法出示原租赁合同或原房东同意转租证明",
      "要求一次性大额付款且不愿走托管",
      "合同主体不清晰（房东/转租人/承租人关系）",
    ],
    safeMoves: [
      "让转租方出示原租赁合同+房东同意转租的书面证明",
      "尽量月付/季付并要求出具收据与付款明细",
      "在合同中写明：断供/被清退的责任与赔付条款",
    ],
  },
  {
    slug: "fake-payment-link-qr",
    title: "二维码/链接“支付陷阱”",
    subtitle: "伪装成平台付款页，盗刷或诱导转账",
    risk: "高",
    tags: ["支付链接"],
    cover: { src: "/rent-scam-cases/qr-phishing.svg", alt: "二维码与锁的插图" },
    summary:
      "对方发来“平台订单/合同签署/押金托管”链接或二维码，页面高度仿真，引导输入银行卡信息或跳转到陌生收款账户。",
    typicalLines: [
      "平台托管更安全，你扫这个码",
      "点链接签合同，签完再付款",
      "系统提示要验证银行卡信息",
    ],
    redFlags: [
      "链接域名不正规、短链/跳转过多",
      "要求输入银行卡号、验证码等敏感信息",
      "付款对象与平台订单信息不一致",
    ],
    safeMoves: [
      "只在官方 App/官网内完成支付与签约，不点陌生链接/不扫来历不明二维码",
      "核对域名、证书与收款主体；有疑问直接在平台内联系客服",
      "任何索要验证码/短信口令/屏幕共享的请求一律拒绝",
    ],
  },
  {
    slug: "impersonate-platform-customer-service",
    title: "冒充平台客服“退款/解冻”",
    subtitle: "让你“刷流水”或转账验证",
    risk: "高",
    tags: ["支付链接"],
    cover: { src: "/rent-scam-cases/friend-transfer.svg", alt: "聊天气泡与转账的插图" },
    summary:
      "假冒平台客服称“订单异常/押金冻结/需解冻”，要求你按指引转账到指定账户，或以“刷流水”名义套取资金。",
    typicalLines: [
      "你这笔押金冻结了，要刷流水解冻",
      "系统风控，需要你先转一笔验证",
      "客服通道不方便，走这个链接处理",
    ],
    redFlags: [
      "客服主动加你私聊，且不通过平台站内消息",
      "要求转账到个人账户或提供验证码",
      "用“风控/解冻/刷流水”制造专业感与恐惧感",
    ],
    safeMoves: [
      "直接在官方 App 内联系平台客服核验，不在私聊渠道处理资金问题",
      "不转账、不刷流水、不共享屏幕、不提供验证码",
      "保留证据并及时止付：联系银行+平台+反诈专线（如 96110）",
    ],
  },
];

export function getRentScamCase(slug: string) {
  return rentScamCases.find((c) => c.slug === slug);
}

export function getAllRentScamTags(): RentScamTag[] {
  const set = new Set<RentScamTag>();
  for (const c of rentScamCases) for (const t of c.tags) set.add(t);
  return Array.from(set);
}
