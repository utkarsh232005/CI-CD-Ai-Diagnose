import React from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { PipelineStage, StageStatus } from "./PipelineStage";
import { motion } from "motion/react";

interface Stage {
  id: string;
  name: string;
  status: StageStatus;
  duration?: string;
  logs?: string[];
}

interface PipelineVisualizationProps {
  stages: Stage[];
}

export const PipelineVisualization = ({ stages }: PipelineVisualizationProps) => {
  // Stagger container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };

  return (
    <div className="w-full relative py-2">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex items-center gap-4 overflow-x-auto pb-6 pt-2 scrollbar-none scroll-smooth"
      >
        {stages.map((stage, index) => {
          const isCurrentRunning = stage.status === "running";
          const isNextPending = index < stages.length - 1 && stages[index + 1].status === "pending";
          const isPastCompleted = stage.status === "success";

          return (
            <div key={stage.id} className="flex items-center gap-4 flex-shrink-0">
              {/* Individual Stage Card with Motion Wrapper */}
              <motion.div 
                variants={itemVariants}
                className="min-w-[290px] sm:min-w-[320px] relative"
              >
                <PipelineStage
                  name={stage.name}
                  status={stage.status}
                  duration={stage.duration}
                  logs={stage.logs}
                />
              </motion.div>

              {/* Enhanced Interactive Animated Connector Link */}
              {index < stages.length - 1 && (
                <div className="flex flex-col items-center justify-center flex-shrink-0 w-16 relative">
                  {/* Decorative background connector line */}
                  <div className="absolute left-0 right-0 h-[2px] bg-neutral-200" />
                  
                  {/* Glowing flowing pulse representing pipeline execution */}
                  {isCurrentRunning && (
                    <motion.div 
                      initial={{ left: "0%" }}
                      animate={{ left: "100%" }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.2, 
                        ease: "easeInOut" 
                      }}
                      className="absolute w-3 h-3 rounded-full bg-blue-600 blur-[2px]"
                    />
                  )}

                  {isPastCompleted && !isNextPending && (
                    <motion.div 
                      initial={{ left: "0%" }}
                      animate={{ left: "100%" }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.6, 
                        ease: "linear" 
                      }}
                      className="absolute w-2 h-2 rounded-full bg-emerald-500"
                    />
                  )}

                  {/* Icon indicator with background shadow */}
                  <motion.div 
                    animate={isCurrentRunning ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    } : { scale: 1 }}
                    transition={{ repeat: isCurrentRunning ? Infinity : 0, duration: 2 }}
                    className={`h-7 w-7 rounded-full flex items-center justify-center border z-10 bg-white transition-all duration-300 ${
                      isCurrentRunning 
                        ? "text-[#1863dc] border-[#1863dc]/40 shadow-sm shadow-blue-100" 
                        : isPastCompleted 
                        ? "text-[#003c33] border-[#003c33]/20 bg-[#edfce9]" 
                        : "text-[#93939f] border-[#d9d9dd]"
                    }`}
                  >
                    <ChevronRight className={`h-4 w-4 ${isCurrentRunning ? "animate-pulse" : ""}`} />
                  </motion.div>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Decorative horizontal overflow gradient fade indicators */}
      <div className="absolute right-0 top-0 bottom-6 w-8 bg-gradient-to-l from-white/90 to-transparent pointer-events-none md:hidden" />
      <div className="absolute left-0 top-0 bottom-6 w-8 bg-gradient-to-r from-white/90 to-transparent pointer-events-none md:hidden" />
    </div>
  );
};
