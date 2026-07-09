import React from "react";
import { CheckCircle2, Circle, Loader2, XCircle, Terminal, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export type StageStatus = "pending" | "running" | "success" | "failed";

interface PipelineStageProps {
  name: string;
  status: StageStatus;
  duration?: string;
  logs?: string[];
}

const statusConfig = {
  pending: {
    icon: Circle,
    color: "text-[#75758a]",
    bgColor: "bg-[#fcfbfa]",
    borderColor: "border-[#d9d9dd]",
    badgeColor: "bg-[#eeece7] text-[#75758a]",
    glowColor: "rgba(117, 117, 138, 0)",
  },
  running: {
    icon: Loader2,
    color: "text-[#1863dc]",
    bgColor: "bg-[#f1f5ff]",
    borderColor: "border-[#1863dc]/40",
    badgeColor: "bg-[#1863dc]/10 text-[#1863dc]",
    glowColor: "rgba(24, 99, 220, 0.15)",
  },
  success: {
    icon: CheckCircle2,
    color: "text-[#003c33]",
    bgColor: "bg-[#edfce9]",
    borderColor: "border-[#003c33]/20",
    badgeColor: "bg-[#003c33]/10 text-[#003c33]",
    glowColor: "rgba(0, 60, 51, 0.05)",
  },
  failed: {
    icon: XCircle,
    color: "text-[#b30000]",
    bgColor: "bg-red-500/5",
    borderColor: "border-[#b30000]/30",
    badgeColor: "bg-[#b30000]/10 text-[#b30000]",
    glowColor: "rgba(179, 0, 0, 0.1)",
  },
};

export const PipelineStage = ({ name, status, duration, logs }: PipelineStageProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isRunning = status === "running";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        boxShadow: isRunning 
          ? "0 10px 25px -5px rgba(24, 99, 220, 0.08), 0 8px 10px -6px rgba(24, 99, 220, 0.08)"
          : "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        borderColor: isRunning ? "#1863dc" : "rgba(217, 217, 221, 1)"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 24 
      }}
      whileHover={{ 
        y: -3, 
        boxShadow: isRunning
          ? "0 12px 30px -5px rgba(24, 99, 220, 0.12), 0 10px 15px -6px rgba(24, 99, 220, 0.12)"
          : "0 10px 20px -10px rgba(0, 0, 0, 0.08)"
      }}
      className={cn(
        "rounded-xl border p-5 bg-white relative overflow-hidden transition-colors duration-300 select-none",
        isRunning && "border-2"
      )}
    >
      {/* Running Animated Flow Bar (pulsing line on top of running cards) */}
      {isRunning && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.8, 
            ease: "easeInOut" 
          }}
          className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#1863dc] to-transparent"
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Animated Status Icon container */}
          <motion.div 
            animate={isRunning ? { 
              scale: [1, 1.08, 1],
            } : { scale: 1 }}
            transition={{ repeat: isRunning ? Infinity : 0, duration: 2, ease: "easeInOut" }}
            className={cn("p-2 rounded-lg shrink-0 flex items-center justify-center", config.bgColor)}
          >
            {isRunning ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              >
                <Icon className={cn("h-5 w-5", config.color)} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <Icon className={cn("h-5 w-5", config.color)} />
              </motion.div>
            )}
          </motion.div>

          <div className="space-y-0.5">
            <h3 className="font-sans font-bold text-sm text-[#17171c] tracking-tight">
              {name}
            </h3>
            {duration ? (
              <p className="text-[10px] font-mono text-[#93939f] font-semibold tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-pulse" />
                {duration}
              </p>
            ) : (
              <p className="text-[10px] font-mono text-[#93939f] tracking-wider uppercase">
                {status === "pending" ? "Queued" : status}
              </p>
            )}
          </div>
        </div>

        <span className={cn(
          "px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest font-bold border shrink-0",
          config.badgeColor,
          status === "running" ? "border-[#1863dc]/20 animate-pulse" : "border-transparent"
        )}>
          {status}
        </span>
      </div>
      
      {/* Animated Collapsible Console Logs */}
      <AnimatePresence initial={false}>
        {logs && logs.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1, 
              marginTop: 16 
            }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-[#17171c] border border-black text-[#e4e4e7] rounded-lg p-3 font-mono text-[10px] space-y-2 max-h-36 overflow-y-auto custom-scrollbar shadow-inner relative">
              <div className="absolute top-1 right-2 flex items-center gap-1 text-[8px] text-[#93939f] uppercase tracking-widest font-bold select-none">
                <Terminal className="h-2.5 w-2.5 text-[#1863dc]" />
                LIVE_FEED
              </div>
              
              <div className="space-y-1.5 pt-1">
                {logs.map((log, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                    key={index} 
                    className="flex items-start gap-2 leading-relaxed"
                  >
                    <span className="text-[#ff7759] select-none font-bold shrink-0">&gt;</span>
                    <span className="break-all whitespace-pre-wrap font-mono text-neutral-300">{log}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
