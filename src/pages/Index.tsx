import { useEffect, useState } from "react";
import { PipelineVisualization } from "@/components/PipelineVisualization";
import { Navbar } from "@/components/Navbar";
import { Activity, BarChart3, RefreshCw, GitBranch, Clock, User, ExternalLink, Sparkles, AlertTriangle, CheckCircle2, Wand2, Loader2, Menu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { io, Socket } from "socket.io-client";

type StageStatus = "pending" | "running" | "success" | "failed";

interface Stage {
  id: string;
  name: string;
  status: StageStatus;
  duration?: string;
  logs?: string[];
  startTime?: string;
  conclusion?: string;
}

interface GitHubWorkflow {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  head_branch: string;
  head_sha: string;
  html_url: string;
  actor?: {
    login: string;
    avatar_url: string;
  };
  jobs?: GitHubJob[];
}

interface GitHubJob {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string;
  completed_at: string | null;
  html_url: string;
  steps?: GitHubStep[];
}

interface GitHubStep {
  name: string;
  status: string;
  conclusion: string | null;
  number: number;
  started_at: string;
  completed_at: string | null;
}

const Index = () => {
  const [workflows, setWorkflows] = useState<GitHubWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<GitHubWorkflow | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState<{
    summary: string;
    rootCause: string;
    errorCategory: string;
    suggestedFixes: string[];
  } | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState("");
  const [githubAuthFailed, setGithubAuthFailed] = useState(false);

  const diagnoseWorkflow = async () => {
    if (!selectedWorkflow) return;
    setIsDiagnosing(true);
    setDiagnosisError("");
    setDiagnosis(null);

    try {
      const response = await fetch(`/api/github/workflows/${selectedWorkflow.id}/diagnose`, {
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
        setDiagnosis(data.diagnosis);
      } else {
        throw new Error("Invalid diagnosis format received from server.");
      }
    } catch (error) {
      console.error("Diagnosis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during diagnosis.";
      setDiagnosisError(errorMessage);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Fetch GitHub workflows
  const fetchWorkflows = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else if (!workflows.length) {
        setIsLoading(true);
      }

      const response = await fetch(`/api/github/workflows`);
      if (response.ok) {
        const data = await response.json();
        const newWorkflows = data.workflow_runs || [];
        setGithubAuthFailed(!!data.auth_failed);

        // Update workflows
        setWorkflows(newWorkflows);

        // If we have a selected workflow, try to find its updated version
        if (selectedWorkflow) {
          const updatedWorkflow = newWorkflows.find(w => w.id === selectedWorkflow.id);
          if (updatedWorkflow) {
            setSelectedWorkflow(updatedWorkflow);
            convertWorkflowToStages(updatedWorkflow);
          }
        } else if (newWorkflows.length > 0) {
          // Select the latest workflow if none selected
          setSelectedWorkflow(newWorkflows[0]);
          convertWorkflowToStages(newWorkflows[0]);
        }

        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Convert GitHub workflow to pipeline stages
  const convertWorkflowToStages = (workflow: GitHubWorkflow) => {
    const workflowStages: Stage[] = [
      {
        id: "setup",
        name: "Setup Workflow",
        status: mapGitHubStatusToStageStatus(workflow.status, workflow.conclusion),
        startTime: workflow.created_at,
        duration: workflow.conclusion ? calculateDuration(workflow.created_at, workflow.updated_at) : undefined,
        logs: [
          `🔄 Workflow: ${workflow.name}`,
          `📋 Branch: ${workflow.head_branch}`,
          `📝 Commit: ${workflow.head_sha.substring(0, 7)}`,
          `👤 Actor: ${workflow.actor?.login || 'Unknown'}`
        ]
      }
    ];

    // Add default CI/CD stages based on workflow status
    const defaultStages = [
      { id: "build", name: "Build & Test", icon: "🏗️" },
      { id: "deploy", name: "Deploy", icon: "🚀" }
    ];

    defaultStages.forEach((stage, index) => {
      const isCompleted = workflow.conclusion === 'success';
      const isFailed = workflow.conclusion === 'failure' || workflow.conclusion === 'cancelled';
      const isCurrent = workflow.status === 'in_progress' && index === 0;

      let stageStatus: StageStatus = 'pending';
      if (isCompleted) stageStatus = 'success';
      else if (isFailed) stageStatus = 'failed';
      else if (isCurrent || workflow.status === 'in_progress') stageStatus = 'running';

      workflowStages.push({
        id: stage.id,
        name: stage.name,
        status: stageStatus,
        startTime: workflow.created_at,
        duration: isCompleted ? calculateDuration(workflow.created_at, workflow.updated_at) : undefined,
        logs: [
          isCompleted ? `✅ ${stage.name} completed successfully` :
            isFailed ? `❌ ${stage.name} failed` :
              isCurrent ? `🔄 ${stage.name} in progress...` :
                `⏳ ${stage.name} pending`
        ]
      });
    });

    setStages(workflowStages);
  };

  // Map GitHub status to our stage status
  const mapGitHubStatusToStageStatus = (status: string, conclusion: string | null): StageStatus => {
    if (status === 'completed') {
      if (conclusion === 'success') return 'success';
      if (conclusion === 'failure' || conclusion === 'cancelled') return 'failed';
    }
    if (status === 'in_progress' || status === 'queued') return 'running';
    return 'pending';
  };

  // Calculate duration between two timestamps
  const calculateDuration = (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

    if (duration < 60) return `${duration}s`;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_WS_URL || window.location.origin);
    setSocket(newSocket);    // Listen for GitHub workflow events
    newSocket.on('github:workflow', (data) => {
      const { action, workflow } = data;
      console.log('GitHub workflow event:', action, workflow);

      // Immediately refresh workflows when there's a new event
      if (action === 'requested' || action === 'in_progress' || action === 'completed') {
        fetchWorkflows(true);
      }
    });

    return () => {
      newSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch workflows on component mount and set up polling
  useEffect(() => {
    fetchWorkflows();

    // Poll for updates every 15 seconds to avoid rate limiting
    const interval = setInterval(fetchWorkflows, 15000);

    // Add event listener for when the page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchWorkflows(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update stages when selected workflow changes
  useEffect(() => {
    if (selectedWorkflow) {
      convertWorkflowToStages(selectedWorkflow);
      setDiagnosis(null);
      setDiagnosisError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkflow]);

  const refreshWorkflows = async () => {
    await fetchWorkflows(true);
  };

  const getOverallStatus = (): string => {
    if (!selectedWorkflow) return "No Data";

    const status = selectedWorkflow.status;
    const conclusion = selectedWorkflow.conclusion;

    if (status === 'completed') {
      if (conclusion === 'success') return "Success";
      if (conclusion === 'failure') return "Failed";
      if (conclusion === 'cancelled') return "Cancelled";
    }
    if (status === 'in_progress') return "Running";
    if (status === 'queued') return "Queued";
    return "Pending";
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Success": return "text-green-600";
      case "Failed": case "Cancelled": return "text-red-600";
      case "Running": case "Queued": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#212121] selection:bg-[#ffad9b] selection:text-[#17171c] font-sans antialiased">
      {/* 1. Announcement Bar */}
      <div className="bg-[#000000] text-white text-[12px] h-[36px] flex items-center justify-between px-6 border-b border-white/10 select-none font-mono tracking-wider uppercase">
        <div className="flex-1 text-center">
          🚀 Gemini AI Build Diagnostics engine is live.{" "}
          <span className="underline cursor-pointer hover:text-[#ffad9b] transition-colors ml-2 font-semibold">
            Read Deployment Manual →
          </span>
        </div>
      </div>

      {/* 2. Global Navigation */}
      <Navbar onRefresh={refreshWorkflows} isRefreshing={isRefreshing} />

      {/* 3. Hero Section (Monumental Display Headline) */}
      <section className="bg-white pt-16 pb-12 px-8 border-b border-[#d9d9dd]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eeece7] text-[#212121] font-mono text-[11px] uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-[#1863dc] cohere-pulse-indicator" />
              Engine Status: <span className="font-bold">{getOverallStatus().toUpperCase()}</span>
            </div>
            
            <h1 className="cohere-hero-title">
              CONTROL YOUR DEPLOYMENT ENGINE.
            </h1>
            
            <p className="text-lg md:text-xl text-[#75758a] font-sans leading-relaxed tracking-tight max-w-3xl">
              An elegant, self-healing pipeline console engineered for high-assurance CI/CD operations. 
              Review build runs, pinpoint failure bottlenecks with real-time logs, and diagnose errors 
              using automated Gemini telemetry.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link to="/dashboard">
                <Button className="cohere-pill-primary text-xs h-10 px-5 font-mono font-bold uppercase tracking-wider shadow-none rounded-lg flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#ff7759]" />
                  Performance Insights Dashboard →
                </Button>
              </Link>
            </div>
          </div>

          {/* Trust Logo Strip */}
          <div className="mt-16 pt-8 border-t border-[#d9d9dd]/50">
            <p className="text-[10px] font-mono text-[#93939f] uppercase tracking-widest mb-6">
              SUPPORTED WORKFLOW PLATFORMS & PARTNERS
            </p>
            <div className="flex flex-wrap items-center gap-x-12 gap-y-4 text-xs font-mono font-medium text-[#93939f]">
              <span className="hover:text-black transition-colors cursor-pointer">SCALE AI</span>
              <span className="hover:text-black transition-colors cursor-pointer">REPLICATE</span>
              <span className="hover:text-black transition-colors cursor-pointer">WEIGHTS &amp; BIASES</span>
              <span className="hover:text-black transition-colors cursor-pointer">VERCEL RUNTIME</span>
              <span className="hover:text-black transition-colors cursor-pointer">GITHUB ACTIONS</span>
              <span className="hover:text-black transition-colors cursor-pointer">GEMINI INTELLIGENCE</span>
            </div>
          </div>
        </div>
      </section>

      {/* GitHub Auth Failed Warning Banner (Swiss Design Styling) */}
      {githubAuthFailed && (
        <div className="bg-[#fffcf0] border-b border-[#ebd7a0] py-4 px-8 text-[#57430e]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[#c48e02] shrink-0 mt-0.5" />
              <div>
                <p className="font-sans font-semibold text-sm leading-snug">
                  GitHub API Connection running in Demo Mode (Bad Credentials)
                </p>
                <p className="font-sans text-xs text-[#735c24] mt-1 leading-normal max-w-4xl">
                  The configured <code className="bg-amber-100/60 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold text-[#b57a02]">GITHUB_TOKEN</code> returned a <code className="font-mono font-bold text-[#b57a02]">"Bad credentials"</code> response from GitHub. 
                  Currently running with high-fidelity simulated workflow runs, letting you test fully featured AI diagnostics and pipeline flows. To sync your real repository, please update your token settings.
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noreferrer"
                className="px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-mono font-medium border border-neutral-300 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                Create Token
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. Deep Enterprise Green Band (Console View) */}
      {selectedWorkflow && (
        <section className="bg-[#003c33] text-white py-16 px-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Console Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">
                  DEPLOYMENT ENVIRONMENT // COMMAND ACTIVE
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-sans tracking-tight font-light text-white">
                    {selectedWorkflow.name}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider font-semibold ${
                    selectedWorkflow.conclusion === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    selectedWorkflow.conclusion === 'failure' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    selectedWorkflow.status === 'in_progress' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                    'bg-white/10 text-white/70'
                  }`}>
                    {selectedWorkflow.conclusion || selectedWorkflow.status}
                  </span>
                </div>
              </div>

              {/* Console Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-black/20 p-5 rounded-xl border border-white/5 backdrop-blur-sm">
                <div>
                  <span className="text-[10px] font-mono text-emerald-300/60 uppercase tracking-wider block mb-1">BRANCH</span>
                  <span className="text-sm font-mono font-medium text-white break-all">{selectedWorkflow.head_branch}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-300/60 uppercase tracking-wider block mb-1">COMMIT</span>
                  <span className="text-sm font-mono font-medium text-white">{selectedWorkflow.head_sha.substring(0, 7)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-300/60 uppercase tracking-wider block mb-1">ACTOR</span>
                  <span className="text-sm font-mono font-medium text-white">{selectedWorkflow.actor?.login || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-300/60 uppercase tracking-wider block mb-1">TRIGGERED</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium text-white">{formatDate(selectedWorkflow.created_at)}</span>
                    <a 
                      href={selectedWorkflow.html_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-emerald-300 hover:text-white transition-colors"
                      title="Open on GitHub"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline Stage Visualization */}
            {stages.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-mono text-emerald-300 uppercase tracking-widest">
                    ACTIVE PIPELINE FLOW
                  </h3>
                  <span className="text-xs text-emerald-300/60">Horizontal overview</span>
                </div>
                <div className="p-6 bg-[#17171c]/90 rounded-2xl border border-white/10 shadow-xl">
                  <PipelineVisualization stages={stages} />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. Main Content Columns */}
      <main className="max-w-7xl mx-auto px-8 py-16 space-y-16">
        
        {/* Diagnostics & AI Remediation Section */}
        {selectedWorkflow && selectedWorkflow.conclusion === 'failure' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-[#ff7759]/10 text-[#ff7759] border border-[#ff7759]/20 px-2.5 py-1 rounded-full uppercase tracking-widest font-semibold">
                COHERE RESEARCH // GEMINI DIAGNOSTICS
              </span>
            </div>

            <div className="rounded-[22px] border border-[#d9d9dd] bg-white overflow-hidden shadow-none p-8 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff7759]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-[#eeece7]">
                <div className="space-y-1">
                  <h2 className="text-2xl font-sans tracking-tight font-bold text-[#212121] flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-[#ff7759] animate-pulse" />
                    Gemini AI Build Diagnostics
                  </h2>
                  <p className="text-sm text-[#75758a]">Automated workflow log triage and code resolution recommendations</p>
                </div>

                {!diagnosis && !isDiagnosing && (
                  <Button 
                    onClick={diagnoseWorkflow} 
                    className="cohere-pill-primary"
                  >
                    <Wand2 className="h-4 w-4" />
                    Diagnose Failure
                  </Button>
                )}
              </div>

              {isDiagnosing && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <Loader2 className="h-8 w-8 text-[#1863dc] animate-spin" />
                  <div className="space-y-1 max-w-md">
                    <p className="font-semibold text-[#212121] text-sm">Gemini is analyzing the failed build...</p>
                    <p className="text-xs text-[#75758a] leading-relaxed">
                      Fetching run logs, evaluating compile-time issues, testing steps, and parsing GitHub execution parameters.
                    </p>
                  </div>
                </div>
              )}

              {diagnosisError && (
                <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl text-[#b30000] text-sm flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
                  <div className="space-y-1">
                    <p className="font-semibold">Unable to Complete AI Diagnostics</p>
                    <p className="text-xs text-[#75758a]">{diagnosisError}</p>
                  </div>
                </div>
              )}

              {diagnosis && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Category and Summary */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#ff7759]/10 text-[#ff7759] border border-[#ff7759]/20 font-semibold uppercase tracking-wider">
                          {diagnosis.errorCategory}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-sans font-medium text-lg text-[#212121]">Failure Summary</h3>
                        <p className="text-sm text-[#75758a] leading-relaxed">
                          {diagnosis.summary}
                        </p>
                      </div>
                    </div>

                    {/* Root Cause Monospace Box */}
                    <div className="p-5 bg-[#eeece7] rounded-xl border border-[#d9d9dd] flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-[#75758a] uppercase tracking-widest block font-semibold">ROOT CAUSE</span>
                        <p className="text-xs font-mono text-[#212121] break-all leading-normal">
                          {diagnosis.rootCause}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Remediation Steps */}
                  <div className="pt-6 border-t border-[#eeece7] space-y-4">
                    <h3 className="font-sans font-medium text-base text-[#212121] flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Recommended Remediation Steps
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {diagnosis.suggestedFixes.map((fix, idx) => (
                        <div key={idx} className="p-4 bg-white border border-[#d9d9dd] rounded-xl flex items-start gap-4 hover:border-black transition-colors">
                          <span className="h-6 w-6 rounded bg-[#17171c] text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-[#75758a] leading-relaxed">{fix}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={diagnoseWorkflow}
                      className="text-[#75758a] hover:text-[#212121] text-xs font-mono flex items-center gap-1.5"
                    >
                      <RefreshCw className="h-3 w-3" />
                      RE-RUN DIAGNOSTICS
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workflows List Table (Cohere Research Index Style) */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-sans tracking-tight font-medium text-[#212121]">
                Workflows Repository Index
              </h2>
              <p className="text-xs font-mono text-[#93939f] uppercase tracking-wider">
                {isRefreshing ? 'REFRESHING RUNS IN BACKSTAGE...' : `LIVE PIPELINE INDEX // LAST SYNC: ${lastUpdate || 'PENDING'}`}
              </p>
            </div>
            
            {/* Outline Segment Controls / Filters */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-mono text-[#93939f] uppercase tracking-wider mr-2">Quick filters:</span>
                <button 
                  onClick={refreshWorkflows}
                  className="px-3.5 py-1 rounded-full border border-[#d9d9dd] text-xs font-mono text-[#212121] hover:border-black transition-colors"
                >
                  ALL RUNS
                </button>
              </div>

              <Button
                onClick={refreshWorkflows}
                disabled={isRefreshing}
                variant="outline"
                className="h-9 px-4 text-xs font-mono font-bold uppercase tracking-wider border-[#d9d9dd] hover:border-black hover:bg-neutral-50 transition-all rounded-lg shadow-none"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 text-[#1863dc] ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Syncing..." : "Sync Monitor"}
              </Button>
            </div>
          </div>

          {/* Table Container */}
          {workflows.length > 0 ? (
            <div className="border border-[#d9d9dd] rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#fcfbfa] border-b border-[#d9d9dd] font-mono text-[10px] text-[#93939f] uppercase tracking-widest">
                      <th className="py-4 px-6 font-medium">WORKFLOW RUN</th>
                      <th className="py-4 px-6 font-medium">TRIGGER EVENT</th>
                      <th className="py-4 px-6 font-medium">BRANCH &amp; REPO</th>
                      <th className="py-4 px-6 font-medium">ACTOR</th>
                      <th className="py-4 px-6 font-medium text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeece7] text-sm">
                    {workflows.map((workflow) => {
                      const isSelected = selectedWorkflow?.id === workflow.id;
                      return (
                        <tr 
                          key={workflow.id} 
                          onClick={() => setSelectedWorkflow(workflow)}
                          className={`cursor-pointer group transition-colors hover:bg-[#fcfbfa] ${
                            isSelected ? "bg-[#fcfbfa]" : ""
                          }`}
                        >
                          {/* Name & Title */}
                          <td className="py-5 px-6">
                            <div className="space-y-1">
                              <span className={`font-sans font-medium text-sm block group-hover:text-[#1863dc] transition-colors ${
                                isSelected ? "text-[#1863dc] font-semibold" : "text-[#212121]"
                              }`}>
                                {workflow.name}
                              </span>
                              <span className="text-[11px] font-mono text-[#93939f]">
                                SHA: {workflow.head_sha.substring(0, 7)}
                              </span>
                            </div>
                          </td>

                          {/* Trigger Event with Badge */}
                          <td className="py-5 px-6">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#f1f5ff] text-[#1863dc] border border-[#1863dc]/10 font-mono text-[10px] uppercase font-medium">
                              {workflow.conclusion === 'failure' ? 'failure_trigger' : 'active_run'}
                            </span>
                          </td>

                          {/* Branch & Created */}
                          <td className="py-5 px-6 font-mono text-xs text-[#75758a]">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1">
                                <GitBranch className="h-3 w-3 text-[#93939f]" />
                                <span className="font-medium text-[#212121]">{workflow.head_branch}</span>
                              </div>
                              <div className="text-[10px] text-[#93939f]">{formatDate(workflow.created_at)}</div>
                            </div>
                          </td>

                          {/* Actor */}
                          <td className="py-5 px-6">
                            {workflow.actor ? (
                              <div className="flex items-center gap-2">
                                <img 
                                  src={workflow.actor.avatar_url} 
                                  alt={workflow.actor.login} 
                                  referrerPolicy="no-referrer"
                                  className="h-5 w-5 rounded-full border border-[#d9d9dd]" 
                                />
                                <span className="text-xs font-mono text-[#212121]">{workflow.actor.login}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-[#93939f] font-mono">system</span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-5 px-6 text-right">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider font-medium ${
                              workflow.conclusion === 'success' ? 'bg-[#edfce9] text-[#003c33] border border-[#003c33]/10' :
                              workflow.conclusion === 'failure' ? 'bg-red-500/10 text-[#b30000] border border-[#b30000]/10' :
                              workflow.status === 'in_progress' ? 'bg-[#f1f5ff] text-[#1863dc] border border-[#1863dc]/10' :
                              'bg-[#eeece7] text-[#75758a]'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                workflow.conclusion === 'success' ? 'bg-[#003c33]' :
                                workflow.conclusion === 'failure' ? 'bg-[#b30000]' :
                                workflow.status === 'in_progress' ? 'bg-[#1863dc] animate-pulse' :
                                'bg-[#75758a]'
                              }`} />
                              {workflow.conclusion || workflow.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* No Workflows Block */
            <div className="border border-[#d9d9dd] rounded-xl p-16 text-center bg-white">
              <Activity className="h-10 w-10 text-[#93939f] mx-auto mb-4" />
              <h3 className="text-lg font-sans font-medium text-[#212121] mb-2">No Active Workflows</h3>
              <p className="text-sm text-[#75758a] max-w-sm mx-auto mb-6 leading-relaxed">
                We couldn't retrieve any GitHub Actions workflows from your configuration. Please verify your repository parameters and credentials.
              </p>
              <Button onClick={refreshWorkflows} className="cohere-pill-primary">
                <RefreshCw className="h-4 w-4 mr-2" />
                Trigger Repository Sync
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* 6. Footer (Cohere Minimalist Newsletter Theme) */}
      <footer className="bg-[#17171c] text-white py-16 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Newsletter / Claim */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono text-[#ff7759] uppercase tracking-widest block font-bold">
              AI MOVES FAST // PIPELINES CAN TOO
            </span>
            <h3 className="text-3xl font-sans tracking-tight font-medium text-white leading-tight">
              A high-assurance DevOps ecosystem for leading research operations.
            </h3>
            <p className="text-xs text-[#93939f] leading-relaxed">
              Stay synchronized with deployment states, live workflows, and automated triage. Built with Google AI Studio.
            </p>
          </div>

          {/* Links 1 */}
          <div className="space-y-4 lg:pl-16">
            <h4 className="text-xs font-mono uppercase text-[#93939f] tracking-widest font-bold">ENGINE RESOURCES</h4>
            <ul className="space-y-2 text-sm text-[#93939f]">
              <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#models" className="hover:text-white transition-colors">Supported Models</a></li>
              <li><a href="#research" className="hover:text-white transition-colors">CI/CD Research Papers</a></li>
              <li><a href="#security" className="hover:text-white transition-colors">Data Isolation &amp; Security</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase text-[#93939f] tracking-widest font-bold">COHERE ECOSYSTEM</h4>
            <ul className="space-y-2 text-sm text-[#93939f]">
              <li><a href="#cohere" className="hover:text-white transition-colors">Cohere platform</a></li>
              <li><a href="#command" className="hover:text-white transition-colors">Command R+</a></li>
              <li><a href="#embed" className="hover:text-white transition-colors">Embed API</a></li>
              <li><a href="#playground" className="hover:text-white transition-colors">Developer Sandbox</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#75758a]">
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

export default Index;

