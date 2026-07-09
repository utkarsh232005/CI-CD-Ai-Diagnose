import React, { useState, useEffect, useCallback } from "react";

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
}
import { io, Socket } from "socket.io-client";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Activity, Terminal, GitBranch, Shield, Zap, Sparkles, ExternalLink, Trash2, Menu, AlertTriangle, CheckCircle2, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PipelineHeatmap } from "./PipelineHeatmap";
import { Navbar } from "./Navbar";

interface DeploymentStartedEvent {
  timestamp: string;
}

interface DeploymentProgressEvent {
  progress: number;
  step: string;
  message: string;
  timestamp: string;
}

interface DeploymentLogEvent {
  type: string;
  message: string;
  timestamp: string;
}

interface DeploymentCompletedEvent {
  url: string;
  timestamp: string;
}

interface DeploymentFailedEvent {
  error: string;
  timestamp: string;
}

interface GitHubWorkflowEvent {
  workflow: {
    name: string;
  };
  action: string;
  timestamp: string;
}

const DeploymentDashboard = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("github_token"));
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(() => {
    const cached = localStorage.getItem("selected_repo");
    try {
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [deploymentStatus, setDeploymentStatus] = useState({
    stage: "idle",
    progress: 0,
    logs: [] as { type: string; message: string; timestamp: string }[],
    isActive: false,
    startTime: null as string | null,
    currentStep: "",
  });

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("github_token");
    localStorage.removeItem("selected_repo");
    setToken(null);
    setRepos([]);
    setSelectedRepo(null);
    window.location.href = "/";
  }, []);

  const handleSelectRepo = (repo: GitHubRepository) => {
    setSelectedRepo(repo);
    localStorage.setItem("selected_repo", JSON.stringify(repo));
  };

  useEffect(() => {
    if (token && token !== "demo_mode_token") {
      fetch("/api/github/user/repos", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.status === 401) {
          handleLogout();
        }
        return res.json();
      })
      .then(data => {
        if (data.repositories) {
          setRepos(data.repositories);
        }
      })
      .catch(err => console.error("Error fetching repos on dashboard:", err));
    } else if (token === "demo_mode_token") {
      setRepos([
        {
          id: 111,
          name: "CI-CD-pipeline",
          full_name: "demo-user/CI-CD-pipeline",
          owner: { login: "demo-user" }
        },
        {
          id: 222,
          name: "production-release",
          full_name: "demo-user/production-release",
          owner: { login: "demo-user" }
        }
      ]);
    }
  }, [token, handleLogout]);

  const [diagnosingRunId, setDiagnosingRunId] = useState<number | null>(null);
  const [activeDiagnosis, setActiveDiagnosis] = useState<{
    summary: string;
    rootCause: string;
    errorCategory: string;
    suggestedFixes: string[];
  } | null>(null);
  const [diagnosisError, setDiagnosisError] = useState("");
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const diagnoseWorkflow = async (runId: number) => {
    setIsDiagnosing(true);
    setDiagnosingRunId(runId);
    setDiagnosisError("");
    setActiveDiagnosis(null);

    try {
      const response = await fetch(`/api/github/workflows/${runId}/diagnose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to diagnose workflow run.");
      }

      const data = await response.json();
      if (data.success && data.diagnosis) {
        setActiveDiagnosis(data.diagnosis);
      } else {
        throw new Error("Invalid diagnosis format received from server.");
      }
    } catch (error) {
      console.error("Diagnosis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during diagnosis.";
      setDiagnosisError(errorMessage);
    } finally {
      setIsDiagnosing(false);
      setDiagnosingRunId(null);
    }
  };

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const newSocket = io(import.meta.env.VITE_WS_URL || window.location.origin);
    setSocket(newSocket);

    // Listen for deployment events
    newSocket.on("deployment:started", (data: DeploymentStartedEvent) => {
      setDeploymentStatus((prev) => ({
        ...prev,
        isActive: true,
        stage: "started",
        startTime: data.timestamp,
        logs: [...prev.logs, { type: "info", message: "Deployment started", timestamp: data.timestamp }],
      }));
    });

    newSocket.on("deployment:progress", (data: DeploymentProgressEvent) => {
      setDeploymentStatus((prev) => ({
        ...prev,
        progress: data.progress,
        currentStep: data.step,
        logs: [...prev.logs, { type: "info", message: data.message, timestamp: data.timestamp }],
      }));
    });

    newSocket.on("deployment:log", (data: DeploymentLogEvent) => {
      setDeploymentStatus((prev) => ({
        ...prev,
        logs: [...prev.logs, { type: data.type, message: data.message, timestamp: data.timestamp }],
      }));
    });

    newSocket.on("deployment:completed", (data: DeploymentCompletedEvent) => {
      setDeploymentStatus((prev) => ({
        ...prev,
        isActive: false,
        stage: "completed",
        progress: 100,
        logs: [...prev.logs, { type: "success", message: `Deployment completed successfully. Live URL: ${data.url}`, timestamp: data.timestamp }],
      }));
    });

    newSocket.on("deployment:failed", (data: DeploymentFailedEvent) => {
      setDeploymentStatus((prev) => ({
        ...prev,
        isActive: false,
        stage: "failed",
        logs: [...prev.logs, { type: "error", message: `Deployment failed: ${data.error}`, timestamp: data.timestamp }],
      }));
    });

    newSocket.on("github:workflow", (data: GitHubWorkflowEvent) => {
      const statusMessage = `GitHub Workflow: ${data.workflow.name} - ${data.action}`;
      setDeploymentStatus((prev) => ({
        ...prev,
        logs: [...prev.logs, { type: "info", message: statusMessage, timestamp: data.timestamp }],
      }));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const triggerDeployment = async (branchName = "main") => {
    setActiveDiagnosis(null);
    setDiagnosisError("");
    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch: branchName }),
      });

      if (response.ok) {
        setDeploymentStatus((prev) => ({
          ...prev,
          logs: [
            ...prev.logs,
            { type: "info", message: `Deployment command dispatched to cluster (branch: ${branchName})`, timestamp: new Date().toISOString() },
          ],
        }));
      }
    } catch (error) {
      console.error("Failed to trigger deployment:", error);
    }
  };

  const clearLogs = () => {
    setDeploymentStatus((prev) => ({
      ...prev,
      logs: [],
    }));
  };

  const getStatusColorClass = (stage: string) => {
    switch (stage) {
      case "idle":
        return "text-[#75758a] bg-[#eeece7] border-[#d9d9dd]";
      case "started":
        return "text-[#1863dc] bg-[#f1f5ff] border-[#1863dc]/20";
      case "completed":
        return "text-[#003c33] bg-[#edfce9] border-[#003c33]/20";
      case "failed":
        return "text-[#b30000] bg-red-500/10 border-red-500/20";
      default:
        return "text-[#75758a] bg-[#eeece7] border-[#d9d9dd]";
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "error":
        return "text-[#b30000] font-semibold";
      case "success":
        return "text-[#003c33] font-semibold";
      case "warning":
        return "text-[#ff7759]";
      default:
        return "text-[#75758a]";
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#212121] selection:bg-[#ffad9b] selection:text-[#17171c] font-sans antialiased">
      {/* 1. Navigation Header */}
      <Navbar 
        token={token}
        repos={repos}
        selectedRepo={selectedRepo}
        onSelectRepo={handleSelectRepo}
        onLogout={handleLogout}
      />

      {/* 2. Hero Section */}
      <section className="bg-white pt-16 pb-12 px-8 border-b border-[#d9d9dd]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f1f5ff] text-[#1863dc] border border-[#1863dc]/10 font-mono text-[11px] uppercase tracking-wider font-semibold">
              <Zap className="h-3 w-3" />
              DEPLOYMENT CONTROLLER ACTIVE
            </div>
            <h1 className="cohere-hero-title">
              MANAGE &amp; DISPATCH RUNS.
            </h1>
            <p className="text-lg md:text-xl text-[#75758a] font-sans leading-relaxed tracking-tight max-w-3xl">
              Initiate instant cluster builds, trace terminal process output live, and observe repository commit synchronization within a unified dashboard interface.
            </p>

            {token && repos && repos.length > 0 && (
              <div className="flex flex-col gap-2 pt-4">
                <span className="text-[10px] font-mono text-[#93939f] uppercase tracking-widest font-bold">
                  Active Repository In Focus
                </span>
                <div className="relative inline-block w-full max-w-md">
                  <select
                    value={selectedRepo ? selectedRepo.full_name : ""}
                    onChange={(e) => {
                      const repo = repos.find(r => r.full_name === e.target.value);
                      if (repo) handleSelectRepo(repo);
                    }}
                    className="w-full bg-[#fcfbfa] hover:bg-[#eeece7] border border-[#d9d9dd] hover:border-black text-[#212121] text-xs font-mono font-bold uppercase tracking-wider py-3 px-4 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#ff7759] pr-10 shadow-sm transition-all"
                  >
                    <option value="" disabled>Select a repository...</option>
                    {repos.map((r) => (
                      <option key={r.id} value={r.full_name}>
                        {r.full_name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#75758a]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Main Split View Grid */}
      <main className="max-w-7xl mx-auto px-8 py-16 space-y-12">
        
        {/* D3-based 30-day activity & health heatmap */}
        <PipelineHeatmap />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Columns (Console & Deployment Trigger) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-mono text-[#93939f] uppercase tracking-widest block font-bold">
                CLUSTER TELEMETRY
              </span>
              
              {/* Status & Control Panel */}
              <div className="border border-[#d9d9dd] rounded-2xl bg-[#fcfbfa] p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#75758a] font-medium font-sans">Active Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider font-semibold border ${getStatusColorClass(deploymentStatus.stage)}`}>
                      {deploymentStatus.stage}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={clearLogs}
                      className="cohere-pill-outline text-xs h-9 py-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Clear Console
                    </Button>
                    {!deploymentStatus.isActive && (
                      <Button 
                        variant="outline" 
                        onClick={() => triggerDeployment("fail-branch")}
                        className="border-red-200 hover:border-red-300 bg-red-50 text-red-700 text-xs h-9 py-1.5 font-medium transition-all"
                        title="Simulate a compilation build failure to test diagnostics"
                      >
                        <Zap className="h-3.5 w-3.5 mr-1 text-red-500 animate-pulse" />
                        Deploy Fail Build
                      </Button>
                    )}
                    <Button 
                      onClick={() => triggerDeployment("main")}
                      disabled={deploymentStatus.isActive}
                      className="cohere-pill-primary text-xs h-9 py-1.5"
                    >
                      <Zap className="h-3.5 w-3.5 mr-1" />
                      {deploymentStatus.isActive ? "Deploying..." : "Deploy Live Now"}
                    </Button>
                  </div>
                </div>

                {/* Simulated Failure & Diagnosis Trigger */}
                {deploymentStatus.stage === "failed" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-red-950 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                        Build Error Detected on Deployment Card
                      </p>
                      <p className="text-xs text-red-700 leading-normal max-w-lg">
                        The pipeline failed on step 'Building application' with circular utility apply rules. You can run automated Gemini AI Diagnostics to analyze logs.
                      </p>
                    </div>
                    <Button
                      onClick={() => diagnoseWorkflow(10001)}
                      disabled={isDiagnosing}
                      className="bg-red-600 hover:bg-red-700 text-white border-0 text-xs h-9 font-medium shrink-0 flex items-center gap-1.5"
                    >
                      {isDiagnosing && diagnosingRunId === 10001 ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      Diagnose with Gemini
                    </Button>
                  </div>
                )}

                {/* Live Progress Bar */}
                {deploymentStatus.isActive && (
                  <div className="space-y-2 p-4 bg-white rounded-xl border border-[#d9d9dd]">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#1863dc] font-semibold uppercase">{deploymentStatus.currentStep || "Running build steps..."}</span>
                      <span className="text-black font-bold">{deploymentStatus.progress}%</span>
                    </div>
                    <div className="w-full bg-[#eeece7] rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-[#1863dc] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${deploymentStatus.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Start Time Metadata */}
                {deploymentStatus.startTime && (
                  <div className="text-[11px] font-mono text-[#93939f]">
                    DISPATCH TIME: {new Date(deploymentStatus.startTime).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Gemini AI Diagnosis Result Panel */}
            {(isDiagnosing || activeDiagnosis || diagnosisError) && (
              <div className="border border-[#d9d9dd] bg-white rounded-2xl p-6 shadow-sm space-y-6 relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff7759]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-[#eeece7] pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#ff7759] uppercase tracking-widest font-bold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#ff7759]" />
                      GEMINI DEVOPS INTELLIGENCE
                    </span>
                    <h3 className="text-lg font-sans font-bold text-black uppercase tracking-tight">
                      Automated Build Analysis
                    </h3>
                  </div>
                  
                  {activeDiagnosis && (
                    <span className="text-[10px] font-mono bg-[#ff7759]/10 text-[#ff7759] border border-[#ff7759]/20 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                      {activeDiagnosis.errorCategory}
                    </span>
                  )}
                </div>

                {isDiagnosing && (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="h-8 w-8 text-[#1863dc] animate-spin" />
                    <div className="space-y-1 max-w-md">
                      <p className="font-semibold text-[#212121] text-sm">Gemini is analyzing the logs...</p>
                      <p className="text-xs text-[#75758a] leading-relaxed">
                        Evaluating compile-time errors, investigating package configurations, and scanning workspace logs for resolving suggestions.
                      </p>
                    </div>
                  </div>
                )}

                {diagnosisError && (
                  <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
                    <div className="space-y-1">
                      <p className="font-semibold text-red-950">Unable to Complete Diagnostics</p>
                      <p className="text-xs text-red-700">{diagnosisError}</p>
                    </div>
                  </div>
                )}

                {activeDiagnosis && !isDiagnosing && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-3">
                        <h4 className="text-xs font-mono text-[#93939f] uppercase tracking-wider font-bold">FAILURE SUMMARY</h4>
                        <p className="text-sm text-[#75758a] leading-relaxed font-sans font-medium">
                          {activeDiagnosis.summary}
                        </p>
                      </div>

                      <div className="bg-[#fcfbfa] p-4 rounded-xl border border-[#d9d9dd] flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-[#93939f] uppercase tracking-widest block font-bold">IDENTIFIED ROOT CAUSE</span>
                          <p className="text-xs font-mono text-red-600 break-all leading-normal font-semibold">
                            {activeDiagnosis.rootCause}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#eeece7] space-y-4">
                      <h4 className="text-xs font-mono text-[#93939f] uppercase tracking-widest font-bold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Recommended Action Plan
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeDiagnosis.suggestedFixes.map((fix, idx) => (
                          <div key={idx} className="p-4 bg-[#fcfbfa] border border-[#d9d9dd] rounded-xl flex items-start gap-3 hover:border-black transition-colors font-sans">
                            <span className="h-6 w-6 rounded bg-black text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-[#75758a] leading-relaxed font-medium">{fix}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Live Interactive Logger */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono text-[#93939f] uppercase tracking-widest font-bold flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Real-time Terminal Logs
                </h3>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Stream
                </span>
              </div>

              <div className="bg-[#17171c] text-white rounded-2xl border border-white/5 p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="h-96 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2.5 scrollbar-thin scrollbar-thumb-white/10 pr-2">
                  {deploymentStatus.logs.length === 0 ? (
                    <div className="text-white/40 text-center py-20 font-sans text-sm space-y-2">
                      <Terminal className="h-8 w-8 mx-auto text-white/10" />
                      <p>No active deployment logs in memory.</p>
                      <p className="text-xs text-white/20">Trigger a manual run above to stream live infrastructure events.</p>
                    </div>
                  ) : (
                    deploymentStatus.logs.map((log, index) => (
                      <div key={index} className="flex items-start gap-3 border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-white/30 select-none whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`whitespace-nowrap ${getLogTypeColor(log.type)}`}>
                          [{log.type.toUpperCase()}]
                        </span>
                        <span className="text-white/80 break-all whitespace-pre-wrap">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (GitHub Action status overview) */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-mono text-[#93939f] uppercase tracking-widest block font-bold">
                GITHUB RUNS HISTORY
              </span>
              
              <div className="border border-[#d9d9dd] rounded-2xl bg-white p-6 space-y-6">
                <div>
                  <h3 className="font-sans font-medium text-base text-black mb-1">Recent Executions</h3>
                  <p className="text-xs text-[#75758a]">Latest status outputs reported from actions cluster.</p>
                </div>

                <GitHubActionsStatus 
                  onDiagnose={diagnoseWorkflow} 
                  diagnosingRunId={diagnosingRunId} 
                  isDiagnosing={isDiagnosing} 
                  selectedRepo={selectedRepo}
                  token={token}
                />
              </div>
            </div>

            {/* Quality Statement Box */}
            <div className="border border-[#d9d9dd] rounded-2xl p-6 bg-[#eeece7]/40 space-y-3">
              <Shield className="h-5 w-5 text-black" />
              <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-black">
                HIGH ASSURANCE BUILD POLICY
              </h4>
              <p className="text-xs text-[#75758a] leading-relaxed">
                Every code bundle in our enterprise registry complies with secure workspace compilation. Changes undergo rigid automated checks before container ingress.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* 4. Footer */}
      <footer className="bg-[#17171c] text-white py-16 px-8 border-t border-white/5 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#75758a]">
          <span>© 2026 COHERE DEPLOYMENT LABORATORY // ALL RIGHTS RESERVED.</span>
          <div className="flex gap-6">
            <a href="#terms" className="hover:text-white transition-colors">TERMS OF USE</a>
            <a href="#privacy" className="hover:text-white transition-colors">PRIVACY POLICY</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface GitHubWorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  head_commit?: {
    message: string;
  };
}
// Component to show GitHub Actions status
interface GitHubActionsStatusProps {
  onDiagnose: (runId: number) => void;
  diagnosingRunId: number | null;
  isDiagnosing: boolean;
  selectedRepo: GitHubRepository | null;
  token: string | null;
}

const GitHubActionsStatus = ({ 
  onDiagnose, 
  diagnosingRunId, 
  isDiagnosing,
  selectedRepo,
  token
}: GitHubActionsStatusProps) => {
  const [workflows, setWorkflows] = useState<GitHubWorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflowRuns = useCallback(async () => {
    try {
      const repoParam = selectedRepo ? `?owner=${selectedRepo.owner.login}&repo=${selectedRepo.name}` : "";
      const response = await fetch(`/api/github/workflows${repoParam}`);
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflow_runs || []);
      }
    } catch (error) {
      console.error("Failed to fetch workflow runs:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedRepo]);

  useEffect(() => {
    setLoading(true);
    fetchWorkflowRuns();
    const interval = setInterval(fetchWorkflowRuns, 30000); // Update every 30 seconds
    return () => {
      clearInterval(interval);
    };
  }, [fetchWorkflowRuns]);

  const getStatusTextClass = (status: string, conclusion: string | null) => {
    if (status === "in_progress") return "text-[#1863dc] bg-[#f1f5ff] border-[#1863dc]/25";
    if (conclusion === "success") return "text-[#003c33] bg-[#edfce9] border-[#003c33]/25";
    if (conclusion === "failure") return "text-[#b30000] bg-red-50/10 border-red-500/25";
    return "text-[#75758a] bg-[#eeece7] border-[#d9d9dd]";
  };

  if (loading) {
    return (
      <div className="text-center py-12 space-y-3">
        <RefreshCw className="h-6 w-6 text-[#1863dc] animate-spin mx-auto" />
        <p className="text-xs font-mono text-[#75758a]">POLLING REGISTRY STATUS...</p>
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-[#75758a]">
        No recent workflow runs found in this registry.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workflows.slice(0, 5).map((workflow) => (
        <div 
          key={workflow.id} 
          className="border-b border-[#eeece7] pb-4 last:border-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <span className="font-sans font-medium text-sm text-black block hover:text-[#1863dc] transition-colors">
              {workflow.name}
            </span>
            <span className="text-xs font-mono text-[#75758a] line-clamp-1 block">
              {workflow.head_commit?.message || "No commit message payload"}
            </span>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-medium border ${getStatusTextClass(workflow.status, workflow.conclusion)}`}>
                {workflow.status === "in_progress" ? "Running" : workflow.conclusion || "Queued"}
              </span>
              
              {workflow.conclusion === "failure" && (
                <button
                  onClick={() => onDiagnose(workflow.id)}
                  disabled={isDiagnosing}
                  className="h-5 px-1.5 py-0 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-[9px] font-mono uppercase tracking-wider font-bold transition-all flex items-center gap-1 rounded cursor-pointer disabled:opacity-50"
                  title="Run automated Gemini AI Diagnostics"
                >
                  {isDiagnosing && diagnosingRunId === workflow.id ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-2.5 w-2.5 text-red-500" />
                  )}
                  Diagnose
                </button>
              )}
            </div>
            <span className="text-[10px] font-mono text-[#93939f]">
              {new Date(workflow.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      ))}

      <div className="pt-2 text-center border-t border-[#eeece7]">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="cohere-text-link text-xs hover:underline inline-flex items-center gap-1 font-mono font-semibold"
        >
          VIEW REPOSITORY ACTIONS <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default DeploymentDashboard;
