import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Octokit } from '@octokit/rest';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { GoogleGenAI, Type } from '@google/genai';

// Load environment variables from .env file
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure CORS for development and production
const frontendUrls = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : [];

const allowedOrigins = [
    ...frontendUrls,
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
    "http://127.0.0.1:3000"
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        if (origin.match(/^https:\/\/.*\.vercel\.app$/)) {
            return callback(null, true);
        }
        if (origin.match(/^https:\/\/.*\.netlify\.app$/)) {
            return callback(null, true);
        }
        return callback(null, true); // Fallback to allow dev proxy URLs
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200
};

const io = new Server(httpServer, {
    cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json());

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

// Helper to get Octokit instance dynamically based on client authorization header
const getOctokit = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (token === 'demo_mode_token') {
            return null; // Return null to signal demo/simulator mode
        }
        return new Octokit({ auth: token });
    }
    if (process.env.GITHUB_TOKEN) {
        return octokit;
    }
    return null;
};

// Log authentication status on startup
console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
console.log('🌍 Configured Frontend URLs:', frontendUrls.join(', ') || 'None');
console.log('🌍 Allowed Origins:', allowedOrigins.join(', '));
console.log('🔑 GitHub Token configured:', !!process.env.GITHUB_TOKEN);
if (process.env.GITHUB_TOKEN) {
    console.log('🔐 Token starts with:', process.env.GITHUB_TOKEN.substring(0, 10) + '...');
}
console.log('📦 GitHub Repo:', `${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`);

// Store active deployments
const activeDeployments = new Map();
let lastWorkflowCheck = new Map(); // Store last known workflow statuses

// High-fidelity fallback simulated workflow runs
const mockWorkflows = [
    {
        id: 10001,
        name: "Production Release Pipeline",
        status: "completed",
        conclusion: "failure",
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(), // 4h ago
        updated_at: new Date(Date.now() - 3600000 * 3.8).toISOString(),
        head_branch: "main",
        head_sha: "7fbc8d3e91a34b2f8a1a2b3c4d5e6f7a8b9c0d1e",
        html_url: "https://github.com/utkarsh232005/CI-CD/actions/runs/10001",
        head_commit: {
            message: "chore(release): version 1.4.2"
        },
        actor: {
            login: "utkarsh232005",
            avatar_url: "https://avatars.githubusercontent.com/u/84224021?v=4"
        }
    },
    {
        id: 10002,
        name: "CI / Code Quality Check",
        status: "completed",
        conclusion: "success",
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 24h ago
        updated_at: new Date(Date.now() - 3600000 * 23.9).toISOString(),
        head_branch: "feature/auth-hooks",
        head_sha: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
        html_url: "https://github.com/utkarsh232005/CI-CD/actions/runs/10002",
        head_commit: {
            message: "feat(auth): add google oauth flow redirects"
        },
        actor: {
            login: "cohere-bot",
            avatar_url: "https://avatars.githubusercontent.com/u/123456?v=4"
        }
    },
    {
        id: 10003,
        name: "Pull Request Validation",
        status: "in_progress",
        conclusion: null,
        created_at: new Date(Date.now() - 600000).toISOString(), // 10m ago
        updated_at: new Date(Date.now() - 600000).toISOString(),
        head_branch: "bugfix/connection-leak",
        head_sha: "9a8b7c6d5e4f3g2h1i0j",
        html_url: "https://github.com/utkarsh232005/CI-CD/actions/runs/10003",
        head_commit: {
            message: "fix(ws): clean up stale socket connections on unmount"
        },
        actor: {
            login: "utkarsh232005",
            avatar_url: "https://avatars.githubusercontent.com/u/84224021?v=4"
        }
    }
];

// Function to check for workflow status changes
const checkWorkflowChanges = async () => {
    try {
        const response = await octokit.rest.actions.listWorkflowRunsForRepo({
            owner: process.env.GITHUB_OWNER || 'utkarsh232005',
            repo: process.env.GITHUB_REPO || 'CI-CD',
            per_page: 5 // Reduce the number of items to decrease API usage
        });

        const workflows = response.data.workflow_runs || [];

        // Check for status changes
        workflows.forEach(workflow => {
            const lastKnown = lastWorkflowCheck.get(workflow.id);

            if (!lastKnown || lastKnown.status !== workflow.status || lastKnown.conclusion !== workflow.conclusion) {
                // Status changed, emit update
                io.emit('github:workflow', {
                    action: workflow.status === 'in_progress' ? 'in_progress' :
                        workflow.status === 'completed' ? 'completed' : 'requested',
                    workflow: {
                        id: workflow.id,
                        name: workflow.name,
                        status: workflow.status,
                        conclusion: workflow.conclusion,
                        html_url: workflow.html_url,
                        created_at: workflow.created_at,
                        updated_at: workflow.updated_at
                    },
                    timestamp: new Date().toISOString()
                });

                console.log(`Workflow status change detected: ${workflow.name} - ${workflow.status}`);
            }

            // Update last known status
            lastWorkflowCheck.set(workflow.id, {
                status: workflow.status,
                conclusion: workflow.conclusion
            });
        });
    } catch (error) {
        if (error.status === 403 && error.message.includes('rate limit')) {
            console.log('Rate limit hit, will retry next cycle');
        } else {
            console.error('Error checking workflow changes:', error.message);
        }
    }
};

// Check for workflow changes every 30 seconds to avoid rate limiting
// Only runs if a default token is configured
if (process.env.GITHUB_TOKEN) {
    setInterval(checkWorkflowChanges, 30000);
}

// Keep track of active socket subscriptions
const socketSubscriptions = new Map();

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('subscribe:repo', ({ owner, repo, token }) => {
        console.log(`Socket ${socket.id} subscribing to ${owner}/${repo}`);
        
        // Clean up existing subscription for this socket
        if (socketSubscriptions.has(socket.id)) {
            clearInterval(socketSubscriptions.get(socket.id).intervalId);
        }

        if (!owner || !repo) {
            return;
        }

        // Return early for demo/simulation token to avoid API polling
        if (token === 'demo_mode_token') {
            console.log(`[Socket ${socket.id}] Subscribed to ${owner}/${repo} in demo mode`);
            return;
        }

        const userOctokit = token ? new Octokit({ auth: token }) : octokit;
        const lastWorkflowCheckForSocket = new Map();

        const checkWorkflows = async () => {
            try {
                const response = await userOctokit.rest.actions.listWorkflowRunsForRepo({
                    owner,
                    repo,
                    per_page: 5
                });
                const workflows = response.data.workflow_runs || [];

                workflows.forEach(workflow => {
                    const lastKnown = lastWorkflowCheckForSocket.get(workflow.id);
                    if (!lastKnown || lastKnown.status !== workflow.status || lastKnown.conclusion !== workflow.conclusion) {
                        socket.emit('github:workflow', {
                            action: workflow.status === 'in_progress' ? 'in_progress' :
                                    workflow.status === 'completed' ? 'completed' : 'requested',
                            workflow: {
                                id: workflow.id,
                                name: workflow.name,
                                status: workflow.status,
                                conclusion: workflow.conclusion,
                                html_url: workflow.html_url,
                                created_at: workflow.created_at,
                                updated_at: workflow.updated_at
                            },
                            timestamp: new Date().toISOString()
                        });
                        console.log(`[Socket ${socket.id}] Workflow status change detected: ${workflow.name} - ${workflow.status}`);
                    }
                    lastWorkflowCheckForSocket.set(workflow.id, {
                        status: workflow.status,
                        conclusion: workflow.conclusion
                    });
                });
            } catch (error) {
                if (error.status === 403 && error.message.includes('rate limit')) {
                    console.log(`[Socket ${socket.id}] Rate limit hit, will retry next cycle`);
                } else {
                    console.error(`[Socket ${socket.id}] Error checking workflow changes:`, error.message);
                }
            }
        };

        // Poll every 30 seconds
        const intervalId = setInterval(checkWorkflows, 30000);
        
        // Run immediately on subscription
        checkWorkflows();

        socketSubscriptions.set(socket.id, {
            owner,
            repo,
            intervalId
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        if (socketSubscriptions.has(socket.id)) {
            clearInterval(socketSubscriptions.get(socket.id).intervalId);
            socketSubscriptions.delete(socket.id);
        }
    });
});

// API Routes
app.post('/api/deploy', async (req, res) => {
    try {
        const { branch = 'main' } = req.body;
        const deploymentId = Date.now().toString();

        // Store deployment info
        activeDeployments.set(deploymentId, {
            id: deploymentId,
            branch,
            startTime: new Date().toISOString(),
            status: 'started'
        });

        // Emit deployment started
        io.emit('deployment:started', {
            id: deploymentId,
            branch,
            timestamp: new Date().toISOString()
        });

        // Trigger deployment simulation
        simulateDeployment(deploymentId, branch);

        res.json({ success: true, deploymentId });
    } catch (error) {
        console.error('Deployment error:', error);
        res.status(500).json({ error: error.message });
    }
});

// OAuth Authentication Routes
app.get('/api/auth/github', (req, res) => {
    console.log('🔄 OAuth: Initiating GitHub login redirection...');
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
        console.warn('⚠️ OAuth: Missing GitHub App Client ID or Secret in environment variables!');
        return res.status(400).send(`
            <h2>GitHub OAuth App is not configured on the server.</h2>
            <p>Please add <code>GITHUB_CLIENT_ID</code> and <code>GITHUB_CLIENT_SECRET</code> to your <code>.env</code> file.</p>
            <p>You can create a GitHub OAuth application at <a href="https://github.com/settings/developers" target="_blank">GitHub Developer Settings</a> with the callback URL: <code>${req.protocol}://${req.get('host')}/api/auth/github/callback</code></p>
        `);
    }
    
    let githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,workflow`;
    const redirectUri = process.env.GITHUB_REDIRECT_URI;
    if (redirectUri) {
        console.log(`🔗 OAuth: Using configured redirect_uri: ${redirectUri}`);
        githubUrl += `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    } else {
        console.log('🔗 OAuth: Omitting redirect_uri to let GitHub fall back to default callback URL');
    }
    res.redirect(githubUrl);
});

app.get('/api/auth/github/callback', async (req, res) => {
    const { code } = req.query;
    let frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    if (frontendUrl.includes(',')) {
        frontendUrl = frontendUrl.split(',')[0].trim();
    }
    console.log('📥 OAuth: Callback received. Code query parameter present:', !!code);
    if (!code) {
        console.warn('⚠️ OAuth: No authorization code received from GitHub.');
        return res.redirect(`${frontendUrl}/?error=no_code_provided`);
    }
    try {
        console.log('⚡ OAuth: Exchanging authorization code for GitHub access token...');
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            })
        });
        const data = await response.json();
        if (data.error) {
            console.error('❌ OAuth: Token exchange error:', data.error_description || data.error);
            return res.redirect(`${frontendUrl}/?error=${encodeURIComponent(data.error_description || data.error)}`);
        }
        const token = data.access_token;
        console.log(`✅ OAuth: Token exchanged successfully! Redirecting to frontend: ${frontendUrl}`);
        res.redirect(`${frontendUrl}/?token=${token}`);
    } catch (error) {
        console.error('❌ OAuth: Callback exception occurred:', error);
        res.redirect(`${frontendUrl}/?error=${encodeURIComponent(error.message)}`);
    }
});

app.get('/api/github/user/repos', async (req, res) => {
    try {
        const userOctokit = getOctokit(req);
        if (!userOctokit) {
            return res.status(401).json({ error: 'GitHub Authentication Required' });
        }
        const response = await userOctokit.rest.repos.listForAuthenticatedUser({
            sort: 'pushed',
            per_page: 100
        });
        res.json({ repositories: response.data || [] });
    } catch (error) {
        console.error('Failed to fetch repositories:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/github/workflows', async (req, res) => {
    try {
        const owner = req.query.owner || process.env.GITHUB_OWNER || 'utkarsh232005';
        const repo = req.query.repo || process.env.GITHUB_REPO || 'CI-CD';
        
        const userOctokit = getOctokit(req);
        if (!userOctokit) {
            return res.json({
                workflow_runs: mockWorkflows,
                auth_failed: true,
                error: 'Demo Mode: Running with simulated workflow telemetry.'
            });
        }

        const response = await userOctokit.rest.actions.listWorkflowRunsForRepo({
            owner,
            repo,
            per_page: 10
        });

        res.json({
            workflow_runs: response.data.workflow_runs || [],
            auth_failed: false
        });
    } catch (error) {
        console.warn('⚠️ GitHub API error, falling back to simulated workflows:', error.message);
        
        // Return 200 with fallback mock data and indicate auth failed
        res.json({
            workflow_runs: mockWorkflows,
            auth_failed: true,
            error: error.message
        });
    }
});

let aiClient = null;
function getGeminiClient() {
    if (!aiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable is missing.");
        }
        aiClient = new GoogleGenAI({
            apiKey,
            httpOptions: {
                headers: {
                    'User-Agent': 'aistudio-build',
                }
            }
        });
    }
    return aiClient;
}

app.post('/api/github/workflows/:run_id/diagnose', async (req, res) => {
    try {
        const { run_id } = req.params;
        const owner = req.query.owner || process.env.GITHUB_OWNER || 'utkarsh232005';
        const repo = req.query.repo || process.env.GITHUB_REPO || 'CI-CD';

        // Check if Gemini API key exists
        if (!process.env.GEMINI_API_KEY) {
            return res.status(400).json({
                error: "Gemini API Key is not configured. Please set GEMINI_API_KEY in Settings > Secrets."
            });
        }

        const runIdInt = parseInt(run_id);
        const isMockRun = runIdInt >= 10000 && runIdInt <= 10005;

        let run;
        let jobs = [];
        let logsContext = "";

        if (isMockRun) {
            const mockRun = mockWorkflows.find(w => w.id === runIdInt);
            run = mockRun || mockWorkflows[0];
            jobs = [
                {
                    id: 99991,
                    name: "Build & Test",
                    status: "completed",
                    conclusion: "failure",
                    started_at: run.created_at,
                    completed_at: run.updated_at,
                    steps: [
                        { name: "Checkout Code", status: "completed", conclusion: "success" },
                        { name: "Setup Node.js", status: "completed", conclusion: "success" },
                        { name: "Install Dependencies", status: "completed", conclusion: "success" },
                        { name: "Compile & Build", status: "completed", conclusion: "failure" }
                    ]
                }
            ];
            logsContext = `
--- LOGS FOR JOB: Build & Test (ID: 99991) ---
npm run build

> vite_react_shadcn_ts@0.0.0 build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 124 modules transformed.
[vite:css] [postcss] /src/index.css:220:1: You cannot \`@apply\` the \`gap-3\` utility here because it creates a circular dependency.
file: /src/index.css:220:0
    at Input.error (/node_modules/postcss/lib/input.js:135:16)
    at Rule.error (/node_modules/postcss/lib/node.js:149:32)
    at processApply (/node_modules/tailwindcss/lib/lib/expandApplyAtRules.js:443:32)
    at /node_modules/tailwindcss/lib/lib/expandApplyAtRules.js:551:9
    at /node_modules/tailwindcss/lib/processTailwindFeatures.js:55:50
    at async plugins (/node_modules/tailwindcss/lib/plugin.js:38:17)
    at async LazyResult.runAsync (/node_modules/postcss/lib/lazy-result.js:293:11)
Error: Build failed with 1 error:
/src/index.css:220:1: postcss: You cannot \`@apply\` the \`gap-3\` utility here because it creates a circular dependency.
`;
        } else {
            try {
                const userOctokit = getOctokit(req);
                if (!userOctokit) {
                    throw new Error("GitHub Authentication Required for live diagnostics");
                }

                // 1. Fetch workflow run details
                const runResponse = await userOctokit.rest.actions.getWorkflowRun({
                    owner,
                    repo,
                    run_id: runIdInt
                });
                run = runResponse.data;

                // 2. Fetch jobs
                const jobsResponse = await userOctokit.rest.actions.listJobsForWorkflowRun({
                    owner,
                    repo,
                    run_id: runIdInt
                });
                jobs = jobsResponse.data.jobs || [];

                // 3. Find failed jobs and try to get logs
                const failedJobs = jobs.filter(job => job.conclusion === 'failure');

                for (const job of failedJobs) {
                    logsContext += `\n--- LOGS FOR JOB: ${job.name} (ID: ${job.id}) ---\n`;
                    try {
                        const logRes = await userOctokit.rest.actions.downloadJobLogsForWorkflowRun({
                            owner,
                            repo,
                            job_id: job.id
                        });
                        let jobLog = "";
                        if (typeof logRes.data === 'string') {
                            jobLog = logRes.data;
                        } else if (logRes.data) {
                            jobLog = logRes.data.toString();
                        }

                        if (jobLog) {
                            const maxLength = 3000;
                            const truncatedLog = jobLog.length > maxLength 
                                ? "...\n" + jobLog.substring(jobLog.length - maxLength)
                                : jobLog;
                            logsContext += truncatedLog;
                        } else {
                            logsContext += "[No log text available]";
                        }
                    } catch (logErr) {
                        logsContext += `[Unable to download job logs: ${logErr.message}]`;
                    }
                }
            } catch (githubErr) {
                console.warn('⚠️ Octokit failed during diagnosis, falling back to simulated diagnosis info:', githubErr.message);
                // Fallback to mock run diagnostic payload
                const mockRun = mockWorkflows[0]; // failed release pipeline
                run = mockRun;
                jobs = [
                    {
                        id: 99991,
                        name: "Build & Test",
                        status: "completed",
                        conclusion: "failure",
                        started_at: run.created_at,
                        completed_at: run.updated_at,
                        steps: [
                            { name: "Checkout Code", status: "completed", conclusion: "success" },
                            { name: "Setup Node.js", status: "completed", conclusion: "success" },
                            { name: "Install Dependencies", status: "completed", conclusion: "success" },
                            { name: "Compile & Build", status: "completed", conclusion: "failure" }
                        ]
                    }
                ];
                logsContext = `[Simulation Fallback Mode - Live Octokit API returned error: ${githubErr.message}]`;
            }
        }

        // Format the structured job representation for Gemini
        const formattedJobs = jobs.map(job => ({
            name: job.name,
            status: job.status,
            conclusion: job.conclusion,
            steps: (job.steps || []).map(step => ({
                name: step.name,
                status: step.status,
                conclusion: step.conclusion
            }))
        }));

        // 4. Construct AI Prompt
        const prompt = `Please diagnose the failed CI/CD workflow run.
Workflow Name: ${run.name}
Trigger Event: ${run.event || 'push'}
Branch: ${run.head_branch}
Commit Message: ${run.head_commit?.message || 'N/A'}
Actor: ${run.actor?.login || 'N/A'}

Jobs and Steps Details:
${JSON.stringify(formattedJobs, null, 2)}

Log snippet / context:
${logsContext || 'No log details available.'}
`;

        const ai = getGeminiClient();
        const aiResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are an elite DevOps and CI/CD engineer specializing in GitHub Actions. Analyze the provided workflow runs, jobs, steps, and log files to identify the exact cause of a failure. Provide a concise, clear diagnosis, specify the category of error, pinpoint the root cause, and list highly actionable suggested fixes.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { 
                            type: Type.STRING, 
                            description: "Brief high-level summary of what happened." 
                        },
                        rootCause: { 
                            type: Type.STRING, 
                            description: "The pinpointed root cause of the failure." 
                        },
                        errorCategory: { 
                            type: Type.STRING, 
                            description: "Category of failure, e.g., 'Dependency Installation', 'Linting Failure', 'Testing Error', 'Compilation Error', 'Secrets/Env Missing', 'Workflow Syntax Error', or 'Deployment Error'." 
                        },
                        suggestedFixes: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Actionable steps or code changes required to resolve the failure."
                        }
                    },
                    required: ["summary", "rootCause", "errorCategory", "suggestedFixes"]
                }
            }
        });

        const diagnosisResult = JSON.parse(aiResponse.text.trim());
        res.json({
            success: true,
            diagnosis: diagnosisResult
        });

    } catch (error) {
        console.error('Diagnosis error:', error);
        res.status(500).json({
            error: error.message || "Failed to complete AI diagnosis"
        });
    }
});

// Webhook handler for GitHub Actions
app.post('/api/webhook/github', (req, res) => {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    if (event === 'workflow_run') {
        const { action, workflow_run } = payload;

        io.emit('github:workflow', {
            action,
            workflow: {
                id: workflow_run.id,
                name: workflow_run.name,
                status: workflow_run.status,
                conclusion: workflow_run.conclusion,
                html_url: workflow_run.html_url,
                created_at: workflow_run.created_at
            },
            timestamp: new Date().toISOString()
        });
    }

    res.status(200).json({ received: true });
});

// Webhook handler for deployment notifications
app.post('/api/webhook/deployment', (req, res) => {
    const { action, step, progress, error, url } = req.body;

    const timestamp = new Date().toISOString();

    switch (action) {
        case 'started':
            io.emit('deployment:started', { timestamp });
            break;
        case 'progress':
            io.emit('deployment:progress', { step, progress, message: step, timestamp });
            break;
        case 'completed':
            io.emit('deployment:completed', { url, timestamp });
            break;
        case 'failed':
            io.emit('deployment:failed', { error, timestamp });
            break;
    }

    res.status(200).json({ received: true });
});

// Simulate deployment process
async function simulateDeployment(deploymentId, branch) {
    const steps = [
        { name: 'Checking out code', duration: 2000, progress: 10 },
        { name: 'Installing dependencies', duration: 5000, progress: 30 },
        { name: 'Running tests', duration: 3000, progress: 50 },
        { name: 'Building application', duration: 4000, progress: 70 },
        { name: 'Deploying to platform', duration: 6000, progress: 90 },
        { name: 'Finalizing deployment', duration: 2000, progress: 100 }
    ];

    try {
        for (const step of steps) {
            // Emit progress update
            io.emit('deployment:progress', {
                id: deploymentId,
                step: step.name,
                progress: step.progress,
                message: `${step.name}...`,
                timestamp: new Date().toISOString()
            });

            // Simulate step execution time
            await new Promise(resolve => setTimeout(resolve, step.duration));

            if (branch && branch.toLowerCase().includes('fail') && step.name === 'Building application') {
                throw new Error("[vite:css] [postcss] /src/index.css:220:1: postcss: You cannot `@apply` the `gap-3` utility here because it creates a circular dependency.");
            }

            // Emit step completion
            io.emit('deployment:log', {
                id: deploymentId,
                type: 'success',
                message: `✅ ${step.name} completed`,
                timestamp: new Date().toISOString()
            });
        }

        // Deployment completed
        const deploymentUrl = `https://ci-cd-${deploymentId.slice(-6)}.vercel.app`;
        io.emit('deployment:completed', {
            id: deploymentId,
            url: deploymentUrl,
            timestamp: new Date().toISOString()
        });

        activeDeployments.delete(deploymentId);
    } catch (error) {
        io.emit('deployment:failed', {
            id: deploymentId,
            error: error.message,
            timestamp: new Date().toISOString()
        });
        activeDeployments.delete(deploymentId);
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        activeDeployments: activeDeployments.size,
        connectedClients: io.engine.clientsCount || 0
    });
});

// API Info fallback
app.get('/api/info', (req, res) => {
    res.json({
        name: 'CI/CD API Server',
        status: 'running',
        version: '1.0.0',
        websocket: {
            status: 'active',
            connectedClients: io.engine.clientsCount || 0
        },
        github: {
            configured: !!process.env.GITHUB_TOKEN,
            repository: `${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`
        }
    });
});

// Integrate Vite Middleware
if (process.env.NODE_ENV !== "production") {
    console.log("⚡ Starting Vite Dev Server Middleware...");
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa"
    });
    app.use(vite.middlewares);
} else {
    console.log("📦 Serving Static Assets from /dist...");
    const distPath = join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(join(distPath, 'index.html'));
    });
}

const PORT = 3000;

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Unified server running on http://0.0.0.0:${PORT}`);
});
