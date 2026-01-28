"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Lock, Activity, Globe, ShieldCheck } from "lucide-react";
import { CardSlide, type Card } from "@/components/ui/hero-preview-walls";
import { Spotlight } from "@/components/ui/spotlight-aceternity";
import { useRouter } from "next/navigation";

interface IntroScreenProps {
  showSelector: boolean;
  onToggleSelector: (_open: boolean) => void;
  onConfirm: (type: any) => void;
  selectedType: any | null;
  onStartChat?: () => void;
}

/**
 * 法律服务着陆页 - "The Architect's Vision" 版
 * 
 * 设计理念：
 * 1. 非对称平衡 (Asymmetrical Balance): 左侧重信息密度，右侧重视觉张力。
 * 2. 功能主义 (Functionalism): 每一个像素都有其存在的理由。去除装饰性废话。
 * 3. 瑞士风格 (Swiss Style): 严格的网格，巨大的无衬线字体，极致的留白。
 */
export function IntroScreen({
  showSelector: _showSelector,
  onToggleSelector: _onToggleSelector,
  onConfirm: onConfirm,
  selectedType: _selectedType,
  onStartChat,
}: IntroScreenProps) {
  const router = useRouter();
  
  const cards: Card[] = [
    {
      id: 0,
      name: "合同审查",
      designation: "风险分析",
      image: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/dashboard-gradient.png",
      content: (
        <p>
          AI 引擎以毫秒级速度扫描合同文本，识别潜在的法律漏洞。这不仅仅是审查，这是对您权益的
          <span className="font-bold text-slate-900 dark:text-white mx-1">绝对防御</span>。
        </p>
      ),
      onClick: () => router.push("/contract-review"),
    },
    {
      id: 1,
      name: "法律咨询",
      designation: "法律顾问",
      image: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/crm-featured.png",
      content: (
        <p>
          基于海量判例数据库的即时响应。我们不提供模棱两可的建议，只提供
          <span className="font-bold text-slate-900 dark:text-white mx-1">可执行的决策依据</span>。
        </p>
      ),
      onClick: () => onConfirm("法律咨询"),
    },
    {
      id: 2,
      name: "合规分析",
      designation: "合规检查",
      image: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/featured-06.png",
      content: (
        <p>
          从数据安全到劳动用工，全方位的合规性扫描。在监管风险发生之前，将其
          <span className="font-bold text-slate-900 dark:text-white mx-1">彻底消灭</span>。
        </p>
      ),
      onClick: () => onConfirm("合规分析"),
    },
  ];

  return (
    <div className="h-full w-full relative bg-[#F8F9FA] dark:bg-[#0A0A0A] overflow-hidden flex flex-col lg:flex-row font-sans">
      
      {/* ===== 背景纹理 (The Noise) ===== */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply dark:mix-blend-overlay z-0"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Spotlight Effect - Adds depth and focus */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20 opacity-0 animate-spotlight"
          fill="#2563EB" // 使用更纯粹的 Brand Royal Blue，增加不透明度以提升氛围感
        />
      </div>

      {/* Global Ambient Glow - Moved from right column to prevent clipping */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#2563EB]/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[-10%] left-[40%] w-[500px] h-[500px] bg-[#3B82F6]/5 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      {/* ===== 左侧：信息控制台 (The Console) ===== */}
      <div className="relative z-10 w-full lg:w-[45%] h-full flex flex-col justify-between px-8 sm:px-12 lg:px-16 py-12 lg:py-16">
        
        {/* Top: Status Indicators */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-6"
        >
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="relative flex h-2.5 w-2.5">
              {/* 将在线状态指示灯改为蓝色 */}
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75 group-hover:bg-[#60A5FA] transition-colors"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2563EB] group-hover:bg-[#3B82F6] transition-colors"></span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase group-hover:text-[#2563EB] dark:group-hover:text-[#3B82F6] transition-colors">系统在线</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
          <div className="flex items-center gap-2 text-slate-400 group cursor-pointer">
            <Globe className="w-3.5 h-3.5 group-hover:text-[#2563EB] transition-colors" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase group-hover:text-[#2563EB] dark:group-hover:text-[#3B82F6] transition-colors">全球访问</span>
          </div>
        </motion.div>

        {/* Middle: The Manifesto */}
        <div className="flex flex-col gap-10 mt-12 lg:mt-0 relative">
          {/* Decorative line */}
          <div className="absolute -left-16 top-10 w-8 h-[1px] bg-slate-900 dark:bg-white hidden lg:block" />

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
              <span className="block text-slate-900 dark:text-white/90">法律</span>
              <span className="relative block mt-1">
                {/* 增强的光晕效果，让蓝色更具穿透力 */}
                <span className="absolute -inset-4 bg-[#2563EB]/20 dark:bg-[#2563EB]/10 blur-3xl rounded-full opacity-0 animate-fade-in-up"></span>
                {/* 使用更纯粹、更具科技感的蓝色渐变，摒弃偏紫的 Indigo */}
                <span className="relative text-transparent bg-clip-text bg-gradient-to-br from-[#2563EB] via-[#3B82F6] to-[#60A5FA] dark:from-[#3B82F6] dark:via-[#60A5FA] dark:to-[#93C5FD] filter drop-shadow-sm">
                  智能
                </span>
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-md border-l-2 border-slate-200 dark:border-white/10 pl-6">
              法律服务不应该只是昂贵的咨询。
              <br className="hidden sm:block" />
              我们重新定义了<span className="text-slate-900 dark:text-white font-bold decoration-blue-500/30 underline decoration-2 underline-offset-4">获取正义的方式</span>。
              <br />
              <span className="text-sm uppercase tracking-widest text-slate-400 mt-2 block">即时 · 精准 · 无偏见</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={() => {
                if (onStartChat) onStartChat();
                router.push("/chat");
              }}
              className="group relative min-w-[200px] px-8 py-4 bg-[#2563EB] dark:bg-[#3B82F6] text-white text-sm font-bold tracking-widest uppercase overflow-hidden shadow-xl shadow-[#2563EB]/20 hover:shadow-[#2563EB]/40 transition-shadow duration-300"
            >
              <span className="relative z-10 flex items-center justify-center gap-3 group-hover:text-white transition-colors">
                开始对话
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              {/* 按钮 Hover 态：使用更深的蓝色 */}
              <div className="absolute inset-0 bg-[#1D4ED8] dark:bg-[#2563EB] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
            </button>
            
            <button
              onClick={() => onConfirm("法律咨询")}
              className="group min-w-[200px] px-8 py-4 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-bold tracking-widest uppercase hover:bg-[#2563EB]/5 dark:hover:bg-[#2563EB]/10 transition-all duration-300 hover:border-[#2563EB]/20 dark:hover:border-[#2563EB]/30 hover:text-[#2563EB] dark:hover:text-[#3B82F6]"
            >
              <span className="flex items-center justify-center gap-2">
                浏览模块
                <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">↓</span>
              </span>
            </button>
          </motion.div>
        </div>

        {/* Bottom: Technical Specs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-200/60 dark:border-white/5"
        >
          <div className="space-y-3 group">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
              <Lock className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">安全架构</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-mono pl-6 border-l border-slate-200 dark:border-white/10 group-hover:border-[#2563EB] transition-colors">
              AES-256 端到端加密
              <br />
              <span className="text-slate-400">零知识证明隐私保护</span>
            </p>
          </div>
          <div className="space-y-3 group">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">性能指标</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-mono pl-6 border-l border-slate-200 dark:border-white/10 group-hover:border-[#3B82F6] transition-colors">
              {"< 100ms 推理延迟"}
              <br />
              <span className="text-slate-400">99.99% 系统可用性</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* ===== 右侧：视觉展示 (The Viewport) ===== */}
      <div className="relative w-full lg:w-[55%] h-full overflow-hidden flex items-center justify-center p-8 sm:p-16 lg:p-20 z-0">

        {/* Main Visual Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-6xl flex flex-col items-center justify-center perspective-1000"
        >
          {/* The "Wall" Background Image */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/10] min-h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl border-[1px] border-white/20 dark:border-white/5 bg-neutral-200 dark:bg-neutral-900 transition-all duration-500 group">
            {/* Inner Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#2563EB]/20 to-[#3B82F6]/20 rounded-[2.6rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <img
              src="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/abstract-glass-walls.jpg"
              alt="法律智能背景"
              className="relative z-10 w-full h-full object-cover rounded-[2.5rem] opacity-90 dark:opacity-80 grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
            />
            
            {/* Glass Overlay Effect */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-transparent to-white/5 rounded-[2.5rem] pointer-events-none" />

            {/* Anchored Card Stack - Positioned inside */}
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center z-30 perspective-1000">
               <div className="transform scale-90 sm:scale-95 lg:scale-100 origin-bottom">
                 <CardSlide items={cards} scaleFactor={0.06} offset={15} />
               </div>
            </div>
          </div>
        </motion.div>
        
        {/* Bottom Right Badge */}
        <div className="absolute bottom-8 right-8 flex items-center gap-3 px-5 py-2.5 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-lg hover:scale-105 transition-transform cursor-default">
           <div className="relative">
             {/* 底部状态徽章：绿色 -> 蓝色 */}
             <div className="absolute inset-0 bg-[#3B82F6] blur-sm opacity-50 animate-pulse" />
             <Activity className="relative w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
           </div>
           <div className="flex flex-col">
             <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Status</span>
             <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-200">
               AI Core Active
             </span>
           </div>
         </div>

      </div>
    </div>
  );
}
