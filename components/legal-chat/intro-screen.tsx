"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Lock, Activity, Globe } from "lucide-react";
import { CardSlide, type Card } from "@/components/ui/hero-preview-walls";
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
      designation: "RISK ANALYSIS",
      image: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/dashboard-gradient.png",
      content: (
        <p>
          AI 引擎以毫秒级速度扫描合同文本，识别潜在的法律漏洞。这不仅仅是审查，这是对您权益的
          <span className="font-bold text-slate-900 dark:text-white mx-1">绝对防御</span>。
        </p>
      ),
      onClick: () => onConfirm("合同审查"),
    },
    {
      id: 1,
      name: "法律咨询",
      designation: "LEGAL CONSULTANT",
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
      designation: "COMPLIANCE CHECK",
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
    <div className="h-full w-full relative bg-[#F8F9FA] dark:bg-[#0A0A0A] overflow-hidden flex flex-col lg:flex-row">
      
      {/* ===== 背景纹理 (The Noise) ===== */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply dark:mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* ===== 左侧：信息控制台 (The Console) ===== */}
      <div className="relative z-10 w-full lg:w-[45%] h-full flex flex-col justify-between px-8 sm:px-12 lg:px-16 py-12 lg:py-16 border-r border-slate-200/60 dark:border-white/5">
        
        {/* Top: Status Indicators */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-6"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">System Online</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
          <div className="flex items-center gap-2 text-slate-400">
            <Globe className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase">Global Access</span>
          </div>
        </motion.div>

        {/* Middle: The Manifesto */}
        <div className="flex flex-col gap-8 mt-12 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.95] mb-6">
              LEGAL
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-500">
                INTELLIGENCE
              </span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-md">
              法律服务不应该只是昂贵的咨询。
              <br />
              我们重新定义了<span className="text-slate-900 dark:text-white font-bold border-b border-slate-300 dark:border-white/30">获取正义的方式</span>。
              即时、精准、无偏见。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={() => {
                if (onStartChat) onStartChat();
                router.push("/chat");
              }}
              className="group relative min-w-[200px] px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold tracking-widest uppercase overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Initialize Chat
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-slate-800 dark:bg-slate-200 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            </button>
            
            <button
              onClick={() => onConfirm("法律咨询")}
              className="min-w-[200px] px-8 py-4 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-bold tracking-widest uppercase hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              Explore Modules
            </button>
          </motion.div>
        </div>

        {/* Bottom: Technical Specs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200/60 dark:border-white/5"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Lock className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Encryption</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">AES-256 End-to-End</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Latency</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">{"< 100ms Response"}</p>
          </div>
        </motion.div>
      </div>

      {/* ===== 右侧：视觉展示 (The Viewport) ===== */}
      <div className="relative w-full lg:w-[55%] h-full bg-slate-100 dark:bg-[#0A0A0A] overflow-hidden flex items-center justify-center p-8 sm:p-16 lg:p-20 z-0">
        
        {/* Background Decorative Elements (Subtle) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]" />
        </div>

        {/* Main Visual Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-6xl flex flex-col items-center justify-center"
        >
          {/* The "Wall" Background Image */}
          <div className="relative w-full aspect-[21/9] lg:aspect-[21/9] rounded-[2.5rem] overflow-visible shadow-2xl border-[10px] lg:border-[12px] border-white dark:border-neutral-900 bg-neutral-200 dark:bg-neutral-800 transition-all duration-500">
            <img
              src="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/abstract-glass-walls.jpg"
              alt="Legal Intelligence Background"
              className="w-full h-full object-cover rounded-[1.8rem] opacity-90 dark:opacity-100"
            />
            
            {/* Glass Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-[1.8rem]" />

            {/* Anchored Card Stack - Positioned to overlap the bottom edge */}
            <div className="absolute -bottom-12 lg:-bottom-16 left-0 right-0 flex justify-center z-10">
               <div className="transform scale-90 sm:scale-95 lg:scale-100 translate-y-1/2 pb-20">
                 <CardSlide items={cards} scaleFactor={0.05} offset={12} />
               </div>
            </div>
          </div>
        </motion.div>
        
        {/* Bottom Right Badge */}
        <div className="absolute bottom-8 right-8 flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full">
           <Activity className="w-4 h-4 text-emerald-500" />
           <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
             AI CORE: ACTIVE
           </span>
        </div>

      </div>
    </div>
  );
}