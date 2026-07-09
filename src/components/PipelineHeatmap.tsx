import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Activity, Clock, RefreshCw, GitBranch, Terminal, ShieldAlert, CheckCircle2, XCircle, ArrowRight, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Interfaces
export interface PipelineRun {
  id: string;
  idShort: string;
  time: string;
  commit: string;
  branch: string;
  status: "success" | "failure";
  duration: string;
  author: string;
}

export interface DayData {
  date: Date;
  dateStr: string;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, etc.
  weekIndex: number;
  totalRuns: number;
  successes: number;
  failures: number;
  runs: PipelineRun[];
}

const COMMIT_MESSAGES = [
  "feat: add google oauth flow redirects",
  "fix(ws): clean up stale socket connections on unmount",
  "chore(release): version 1.4.2",
  "test: update pipeline integration test suites",
  "refactor: optimize database query caching layer",
  "docs: update API authentication guide",
  "fix(api): handle connection pool starvation gracefully",
  "feat: integrate d3-based health metrics dashboard",
  "ci: optimize build runner container caching",
  "style: polished typography and sidebar transition states"
];

const BRANCHES = ["main", "feature/auth-hooks", "bugfix/connection-leak", "release/v1.4", "feature/d3-analytics"];
const AUTHORS = ["utkarsh232005", "cohere-bot", "john-ops", "sarah-dev"];

// Stable deterministic data generator for 30 days
const generate30DaysData = (): DayData[] => {
  const data: DayData[] = [];
  const today = new Date();
  
  // Create 30 days starting from 29 days ago
  for (let i = 29; i >= 0; i--) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - i);
    currentDate.setHours(0, 0, 0, 0);
    
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayOfWeek = currentDate.getDay(); // 0 = Sun, 1 = Mon, ...
    
    // Deterministic run count based on the day's timestamp to keep it consistent
    const seed = currentDate.getTime();
    const runCount = seed % 6 === 0 ? 0 : (seed % 5) + 1; // 0 to 5 runs
    
    const runs: PipelineRun[] = [];
    let successes = 0;
    let failures = 0;
    
    for (let r = 0; r < runCount; r++) {
      const runSeed = seed + r * 100000;
      const isSuccess = runSeed % 7 !== 0; // Deterministic success/failure
      if (isSuccess) successes++;
      else failures++;
      
      const hoursOffset = 9 + (r * 2) % 10;
      const minutesOffset = (r * 15) % 60;
      const timeStr = `${hoursOffset.toString().padStart(2, "0")}:${minutesOffset.toString().padStart(2, "0")}`;
      
      const durationSec = 45 + (runSeed % 120);
      const durationStr = `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`;
      const idVal = Math.floor(runSeed / 1000) % 100000;
      
      runs.push({
        id: `run-${idVal}`,
        idShort: `#${idVal}`,
        time: timeStr,
        commit: COMMIT_MESSAGES[runSeed % COMMIT_MESSAGES.length],
        branch: BRANCHES[runSeed % BRANCHES.length],
        status: isSuccess ? "success" : "failure",
        duration: durationStr,
        author: AUTHORS[runSeed % AUTHORS.length]
      });
    }
    
    // Sort runs chronologically by time
    runs.sort((a, b) => a.time.localeCompare(b.time));

    data.push({
      date: currentDate,
      dateStr,
      dayOfWeek,
      weekIndex: 0, // calculated later
      totalRuns: runCount,
      successes,
      failures,
      runs
    });
  }
  
  // Group weeks chronologically
  // To keep alignment neat, we group by week starting on Sunday/Monday
  let currentWeekIdx = 0;
  
  for (let idx = 0; idx < data.length; idx++) {
    if (idx > 0 && data[idx].dayOfWeek === 1) { // start a new week column on Monday
      currentWeekIdx++;
    }
    data[idx].weekIndex = currentWeekIdx;
  }
  
  return data;
};

export const PipelineHeatmap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [data] = useState<DayData[]>(generate30DaysData());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 160 });

  // Handle ResizeObserver for Fluid SVG Responsiveness
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({
          width: width,
          height: width < 500 ? 180 : 150
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Set initial selected day to today (the last day in the array)
  useEffect(() => {
    if (data.length > 0 && !selectedDay) {
      setSelectedDay(data[data.length - 1]);
    }
  }, [data, selectedDay]);

  // Draw Heatmap using D3
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clean container

    const margin = { top: 20, right: 10, bottom: 20, left: 45 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Days of Week labels (Y Axis)
    const daysOfWeekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const yMap = [1, 2, 3, 4, 5, 6, 0]; // Monday = 0 index in drawing to Sunday = 6 index in drawing
    
    // Calculate weeks count
    const maxWeekIndex = d3.max(data, d => d.weekIndex) || 0;
    const weeksCount = maxWeekIndex + 1;

    // Scales
    const xScale = d3.scaleBand()
      .domain(d3.range(weeksCount).map(String))
      .range([0, width])
      .padding(0.15);

    const yScale = d3.scaleBand()
      .domain(["1", "2", "3", "4", "5", "6", "0"]) // Day values matching dayOfWeek
      .range([0, height])
      .padding(0.15);

    // Color mapper based on success/failure ratio and density
    const getCellColor = (d: DayData) => {
      if (d.totalRuns === 0) return "#f4f3f0"; // Neutral light warm white
      
      const isSelected = selectedDay?.dateStr === d.dateStr;

      if (d.failures === 0) {
        // All Successful runs
        if (d.totalRuns <= 2) return isSelected ? "#4ade80" : "#bbf7d0"; // light green
        return isSelected ? "#15803d" : "#22c55e"; // robust green
      } else if (d.successes === 0) {
        // All Failed runs
        if (d.totalRuns <= 2) return isSelected ? "#f87171" : "#fecaca"; // light red
        return isSelected ? "#b91c1c" : "#ef4444"; // robust red
      } else {
        // Mixed outcomes
        return isSelected ? "#ea580c" : "#fdba74"; // amber/orange
      }
    };

    // Y Axis labels
    chart.append("g")
      .selectAll("text")
      .data(daysOfWeekLabels)
      .enter()
      .append("text")
      .attr("x", -10)
      .attr("y", (_, i) => (yScale(String(yMap[i])) || 0) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("class", "fill-[#75758a] font-mono text-[10px] uppercase font-bold")
      .text(d => d);

    // X Axis Labels (Weeks labels - just simple indicators)
    const weekLabelIndexes = [0, Math.floor(weeksCount / 2), weeksCount - 1];
    chart.append("g")
      .selectAll("text")
      .data(weekLabelIndexes)
      .enter()
      .append("text")
      .attr("x", i => (xScale(String(i)) || 0) + xScale.bandwidth() / 2)
      .attr("y", -6)
      .attr("text-anchor", "middle")
      .attr("class", "fill-[#93939f] font-mono text-[9px] uppercase tracking-wider")
      .text((i) => {
        if (i === 0) return "30 Days Ago";
        if (i === weeksCount - 1) return "Today";
        return "15 Days Ago";
      });

    // Drawing the Heatmap Cells
    const cells = chart.append("g")
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => xScale(String(d.weekIndex)) || 0)
      .attr("y", d => yScale(String(d.dayOfWeek)) || 0)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", getCellColor)
      .attr("stroke", d => selectedDay?.dateStr === d.dateStr ? "#17171c" : "#0000000c")
      .attr("stroke-width", d => selectedDay?.dateStr === d.dateStr ? 2 : 1)
      .style("cursor", "pointer")
      .style("transition", "all 0.15s ease");

    // Add interactivity
    cells.on("mouseover", function(event, d) {
      d3.select(this)
        .attr("stroke", "#17171c")
        .attr("stroke-width", 2);
    })
    .on("mouseout", function(event, d) {
      if (selectedDay?.dateStr !== d.dateStr) {
        d3.select(this)
          .attr("stroke", "#0000000c")
          .attr("stroke-width", 1);
      }
    })
    .on("click", (event, d) => {
      setSelectedDay(d);
    });

  }, [dimensions, data, selectedDay]);

  return (
    <div className="border border-[#d9d9dd] rounded-2xl bg-white p-6 shadow-sm space-y-6">
      {/* Heatmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#93939f] uppercase tracking-widest block font-bold flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-[#1863dc]" />
            D3 ANALYTICS ENGINE
          </span>
          <h2 className="text-lg font-sans font-bold text-black tracking-tight uppercase">
            Pipeline Activity &amp; Health Density
          </h2>
          <p className="text-xs text-[#75758a]">
            Observe successful and failed compilation volumes distributed across a rolling 30-day index.
          </p>
        </div>
        
        {/* Color Legend */}
        <div className="flex flex-wrap items-center gap-3 bg-[#eeece7]/45 p-2 rounded-xl border border-[#d9d9dd]/50 text-[10px] font-mono text-[#75758a]">
          <span className="font-semibold mr-1">LEGEND:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#f4f3f0] border border-black/5" />
            <span>Idle</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#bbf7d0] border border-black/5" />
            <span>Success (Low)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#22c55e] border border-black/5" />
            <span>Success (High)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#fdba74] border border-black/5" />
            <span>Mixed Out</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#fecaca] border border-black/5" />
            <span>Fail (Low)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#ef4444] border border-black/5" />
            <span>Fail (High)</span>
          </div>
        </div>
      </div>

      {/* Main Heatmap Container */}
      <div className="bg-[#fcfbfa] border border-[#d9d9dd] rounded-xl p-4">
        <div ref={containerRef} className="w-full h-auto overflow-hidden">
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Explorer Drawer / Panel for the Selected Day */}
      {selectedDay && (
        <div className="border-t border-[#eeece7] pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          {/* Day Metrics Column */}
          <div className="md:col-span-1 bg-[#fcfbfa] p-4 rounded-xl border border-[#d9d9dd] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#75758a]" />
                <span className="font-mono text-xs text-[#93939f] font-bold uppercase tracking-wider">
                  Selected Session
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-extrabold text-xl text-black">
                  {new Date(selectedDay.dateStr).toLocaleDateString([], {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </h3>
                <p className="font-mono text-[11px] text-[#93939f] tracking-wider uppercase">
                  UTC Index: {selectedDay.dateStr}
                </p>
              </div>
            </div>

            <div className="pt-4 grid grid-cols-3 gap-2 text-center border-t border-[#eeece7] mt-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#93939f] uppercase block font-bold">Runs</span>
                <span className="font-sans font-bold text-lg text-[#17171c]">
                  {selectedDay.totalRuns}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-600 uppercase block font-bold">Pass</span>
                <span className="font-sans font-bold text-lg text-emerald-600">
                  {selectedDay.successes}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-red-600 uppercase block font-bold">Fail</span>
                <span className="font-sans font-bold text-lg text-red-600">
                  {selectedDay.failures}
                </span>
              </div>
            </div>
          </div>

          {/* Runs Timeline List Column */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-mono text-[#93939f] uppercase tracking-widest font-bold flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5" />
              Run Register History ({selectedDay.runs.length})
            </h4>

            {selectedDay.runs.length === 0 ? (
              <div className="border border-[#d9d9dd] border-dashed rounded-xl py-12 text-center text-sm text-[#75758a] space-y-1 bg-white">
                <p className="font-sans font-medium">No pipelines were dispatched on this date.</p>
                <p className="text-xs text-[#93939f]">Select another cell on the graph to audit build registries.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                {selectedDay.runs.map((run) => (
                  <div
                    key={run.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-[#d9d9dd] bg-white hover:bg-[#fcfbfa] transition-all gap-4"
                  >
                    <div className="flex items-start gap-3">
                      {run.status === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-extrabold text-black">
                            {run.idShort}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f1f5ff] text-[#1863dc] rounded-full text-[10px] font-mono font-semibold">
                            <GitBranch className="h-3 w-3" />
                            {run.branch}
                          </span>
                          <span className="text-[10px] font-mono text-[#93939f]">
                            by @{run.author}
                          </span>
                        </div>
                        <p className="text-xs text-[#75758a] font-sans font-medium leading-relaxed">
                          {run.commit}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-1 shrink-0 font-mono text-[10px] text-[#75758a]">
                      <span className="font-semibold text-[#17171c] bg-[#eeece7]/60 px-2 py-0.5 rounded">
                        {run.duration}
                      </span>
                      <span>
                        Disp: {run.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
