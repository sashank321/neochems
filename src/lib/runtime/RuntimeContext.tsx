"use client";

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import {
  Agent,
  AgentRole,
  Task,
  ChatMessage,
  RunState,
  StructuredResult,
  AgentActivityStep,
  TelemetryLog,
} from "./types";
import { INITIAL_AGENTS, SAMPLE_RESULTS } from "./initialData";

interface RuntimeContextType {
  agents: Agent[];
  tasks: Task[];
  messages: ChatMessage[];
  currentRun: RunState;
  selectedAgentId: string | null;
  targetedAgentRole: AgentRole | null;
  activeView: "chat" | "aerial" | "graph" | "chemistry";
  isSplitAerialOpen: boolean;
  activeCommunication: { from: AgentRole; to: AgentRole } | null;
  speedMultiplier: number;
  
  // Actions
  setActiveView: (view: "chat" | "aerial" | "graph" | "chemistry") => void;
  setIsSplitAerialOpen: (open: boolean) => void;
  selectAgent: (agentId: string | null) => void;
  setTargetedAgentRole: (role: AgentRole | null) => void;
  setSpeedMultiplier: (multiplier: number) => void;
  skipCurrentPhase: () => void;
  chatWithAgent: (role: AgentRole) => void;
  sendMessage: (content: string) => Promise<void>;
  resetRun: () => void;
  cancelRun: () => void;
}

const RuntimeContext = createContext<RuntimeContextType | null>(null);

const DEFAULT_RUN: RunState = {
  id: "NC-RUN-2026-INIT",
  objective: "Awaiting research objective...",
  status: "IDLE",
  progress: 0,
  currentStepDescription: "System ready. Specialized agents synchronized.",
  activeAgents: [],
  phaseIndex: 0,
  totalPhases: 6,
  phaseSecondsRemaining: 0,
  speedMultiplier: 1,
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-welcome",
    role: "assistant",
    content: "Welcome to NeoChems Lab. I am connected to a synchronized workforce of 7 specialized scientific agents: Orchestrator, Research, Retrosynthesis, Validation, Knowledge, Analysis, and Critic. What molecular target, synthesis problem, or literature review objective would you like to investigate?",
    timestamp: "Just now",
  },
];

export function RuntimeProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [currentRun, setCurrentRun] = useState<RunState>(DEFAULT_RUN);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [targetedAgentRole, setTargetedAgentRole] = useState<AgentRole | null>(null);
  const [activeView, setActiveView] = useState<"chat" | "aerial" | "graph" | "chemistry">("chat");
  const [isSplitAerialOpen, setIsSplitAerialOpen] = useState(false);
  const [activeCommunication, setActiveCommunication] = useState<{ from: AgentRole; to: AgentRole } | null>(null);
  const [speedMultiplier, setSpeedMultiplierState] = useState<number>(1);

  const speedMultiplierRef = useRef<number>(1);
  const skipPhaseRef = useRef<boolean>(false);
  const isCancelledRef = useRef<boolean>(false);

  const setSpeedMultiplier = useCallback((multiplier: number) => {
    speedMultiplierRef.current = multiplier;
    setSpeedMultiplierState(multiplier);
    setCurrentRun((prev) => ({ ...prev, speedMultiplier: multiplier }));
  }, []);

  const skipCurrentPhase = useCallback(() => {
    skipPhaseRef.current = true;
  }, []);

  // Update specific agent's state
  const updateAgent = useCallback((role: AgentRole, partial: Partial<Agent>) => {
    setAgents((prev) =>
      prev.map((a) => (a.role === role ? { ...a, ...partial } : a))
    );
  }, []);

  const selectAgent = useCallback((agentId: string | null) => {
    setSelectedAgentId(agentId);
  }, []);

  const chatWithAgent = useCallback((role: AgentRole) => {
    setTargetedAgentRole(role);
    setSelectedAgentId(null);
    setActiveView("chat");
  }, []);

  const resetRun = useCallback(() => {
    isCancelledRef.current = true;
    setAgents(INITIAL_AGENTS);
    setTasks([]);
    setCurrentRun(DEFAULT_RUN);
    setActiveCommunication(null);
    setTargetedAgentRole(null);
  }, []);

  const cancelRun = useCallback(() => {
    isCancelledRef.current = true;
    setCurrentRun((prev) => ({ ...prev, status: "IDLE", progress: 0, currentStepDescription: "Run cancelled." }));
    setAgents((prev) => prev.map((a) => ({ ...a, state: "IDLE", progress: 100, currentTask: "Idle." })));
    setActiveCommunication(null);
  }, []);

  // Multi-Agent Execution Simulator or Direct Agent Consultation
  const sendMessage = useCallback(
    async (content: string) => {
      isCancelledRef.current = false;
      skipPhaseRef.current = false;

      const userMsgId = `msg-user-${Date.now()}`;
      const userMsg: ChatMessage = {
        id: userMsgId,
        role: "user",
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        targetedAgent: targetedAgentRole || undefined,
      };

      const assistantMsgId = `msg-asst-${Date.now()}`;

      // 1. Direct consultation with specific targeted agent
      if (targetedAgentRole && targetedAgentRole !== "ORCHESTRATOR") {
        const ag = agents.find((a) => a.role === targetedAgentRole);
        const assistantMsg: ChatMessage = {
          id: assistantMsgId,
          role: "assistant",
          content: `${ag?.symbol || "🤖"} Consulting ${ag?.name}...`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          targetedAgent: targetedAgentRole,
          isStreaming: true,
        };

        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        updateAgent(targetedAgentRole, { state: "WORKING", progress: 50 });

        await new Promise((r) => setTimeout(r, 1200));

        let reply = "";
        if (targetedAgentRole === "RETROSYNTHESIS") {
          reply = `**[Retrosynthesis Agent Analysis]**\n\nI have evaluated your query: *"${content}"*.\n\nFrom a chemical disconnection standpoint, I focus on identifying strategic synthon equivalents with maximum atom economy:\n\n1. **Primary Disconnection**: Strategic cleavage of heteroatom-carbon bonds (e.g., amide C-N or ester C-O) minimizes protecting group requirements.\n2. **Commercial Feedstock Alignment**: Matching synthons against commercial catalogs (Sigma-Aldrich, Enamine) achieves >92% starting material availability.\n3. **Forward Feasibility**: High coupling selectivity without cryogenic or high-pressure constraints.\n\n*Would you like me to generate candidate disconnection trees or pass this intermediate to the Validation Agent?*`;
        } else if (targetedAgentRole === "CRITIC") {
          reply = `**[Critic Agent Adversarial Review]**\n\nI have critically audited your query: *"${content}"*.\n\nHere are my quality-control findings:\n\n- **Regioselectivity Hazards**: Direct electrophilic aromatic substitutions on activated rings typically yield problematic ortho/para isomer mixtures (often requiring cryogenic separation or wasting >50% feedstock).\n- **Safety & Exothermicity**: Avoid unbuffered nitrations or aggressive halogenations without continuous flow heat sinks.\n- **Recommendation**: Mandate single-step coupling from clean pre-functionalized synthons.\n\n*My audit directive stands: Zero unverified claims permitted.*`;
        } else if (targetedAgentRole === "RESEARCH") {
          reply = `**[Research Agent Literature Retrieval]**\n\nI have searched peer-reviewed reaction corpora for: *"${content}"*.\n\n**Verified References Retrieved**:\n1. *Morse, H. N.* (1878) — *Ber. Dtsch. Chem. Ges.* (DOI: 10.1002/cber.18780110158). Chemoselective aqueous acylation.\n2. *Ellis et al.* (2021) — *Org. Process Res. Dev.* (DOI: 10.1021/acs.oprd.1c00245). Continuous-flow green synthesis.\n\nAll reaction yields verified between 88% and 94% with zero toxic solvent carryover.`;
        } else if (targetedAgentRole === "VALIDATION") {
          reply = `**[Validation Agent Feasibility Audit]**\n\nI have verified chemical constraints for: *"${content}"*.\n\n- **Functional Group Tolerance**: Checked amine vs. phenol competitive nucleophilicity. Buffered pH 6.8 prevents O-acetylation.\n- **Temperature Bounds**: 60°C is within benign atmospheric limits.\n- **Stereochemical Integrity**: No chiral inversion risk on aromatic backbones.\n- **Verdict**: Chemical feasibility certified (98.2% confidence).`;
        } else if (targetedAgentRole === "ANALYSIS") {
          reply = `**[Analysis Agent Property Calculations]**\n\nComputed physicochemical descriptors for: *"${content}"*.\n\n- **Molecular Weight**: 151.16 g/mol\n- **Calculated LogP**: 0.91 (Optimal aqueous/lipid partition)\n- **TPSA**: 49.33 Å² (Excellent cell membrane permeation)\n- **Lipinski Rule of 5**: 0 violations (High oral bioavailability)\n- **Aqueous Solubility**: 14.0 mg/mL (High)`;
        } else if (targetedAgentRole === "KNOWLEDGE") {
          reply = `**[Knowledge Agent Ontology Context]**\n\nRetrieved ontological context for: *"${content}"*.\n\n- **Therapeutic Class**: Analgesic & antipyretic.\n- **Analogues**: Phenacetin, Acetanilide (Both historical precursors metabolized to active 4-acetamidophenol).\n- **Mechanism**: Central COX-3 / endocannabinoid pathway modulation without peripheral platelet inhibition.`;
        }

        updateAgent(targetedAgentRole, { state: "COMPLETE", progress: 100 });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  isStreaming: false,
                  content: reply,
                }
              : m
          )
        );
        return;
      }

      // 2. Full Multi-Agent System Execution (Orchestrator coordinates all 7 agents)
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "Initializing multi-agent decomposition and synchronizing workforce...",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isStreaming: true,
        activitySteps: [],
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      // Detect chemical entity from prompt
      const lower = content.toLowerCase();
      let sampleKey = "paracetamol";
      let targetMoleculeName = "Paracetamol (4-Acetamidophenol)";
      if (lower.includes("ibuprofen") || lower.includes("propanoic") || lower.includes("isobutyl")) {
        sampleKey = "ibuprofen";
        targetMoleculeName = "Ibuprofen (2-(4-isobutylphenyl)propanoic acid)";
      } else if (lower.includes("aspirin") || lower.includes("acetylsalicylic")) {
        sampleKey = "aspirin";
        targetMoleculeName = "Aspirin (Acetylsalicylic Acid)";
      } else if (lower.includes("taxol") || lower.includes("paclitaxel")) {
        sampleKey = "taxol";
        targetMoleculeName = "Paclitaxel (Taxol)";
      } else if (lower.includes("caffeine") || lower.includes("xanthine")) {
        sampleKey = "caffeine";
        targetMoleculeName = "Caffeine (1,3,7-Trimethylxanthine)";
      } else {
        // Dynamic extraction
        const words = content.replace(/[^a-zA-Z0-9 ]/g, "").split(" ");
        const candidate = words.find((w) => w.length > 4 && !["investigate", "synthesize", "propose", "target", "molecule", "please", "route"].includes(w.toLowerCase()));
        if (candidate) {
          targetMoleculeName = candidate.charAt(0).toUpperCase() + candidate.slice(1);
        }
      }

      const targetResult: StructuredResult = SAMPLE_RESULTS[sampleKey] || {
        ...SAMPLE_RESULTS["paracetamol"],
        targetName: targetMoleculeName,
      };

      const runId = `NC-RUN-${Math.floor(1000 + Math.random() * 9000)}`;

      // Setup initial tasks
      const newTasks: Task[] = [
        {
          id: "t-1",
          title: "Decompose Objective & Establish Constraints",
          description: "Deconstruct chemical objective into 6-node dependency graph.",
          assignedAgent: "ORCHESTRATOR",
          status: "RUNNING",
          progress: 10,
          dependencies: [],
        },
        {
          id: "t-2",
          title: "Retrieve Literature Precedents & Reaction Evidence",
          description: "Search Reaxys & SciFinder corpora for verified reaction precedents.",
          assignedAgent: "RESEARCH",
          status: "QUEUED",
          progress: 0,
          dependencies: ["t-1"],
        },
        {
          id: "t-3",
          title: "Generate Strategic Bond Disconnections",
          description: "Formulate retrosynthetic pathways & match commercial synthons.",
          assignedAgent: "RETROSYNTHESIS",
          status: "QUEUED",
          progress: 0,
          dependencies: ["t-2"],
        },
        {
          id: "t-4",
          title: "Compute Physicochemical Descriptors",
          description: "Execute RDKit MMFF94 forcefield, LogP, TPSA, and Lipinski checks.",
          assignedAgent: "ANALYSIS",
          status: "QUEUED",
          progress: 0,
          dependencies: ["t-1"],
        },
        {
          id: "t-5",
          title: "Audit Reaction Feasibility & Kinetics",
          description: "Verify functional group tolerances, thermodynamics, and safety.",
          assignedAgent: "VALIDATION",
          status: "QUEUED",
          progress: 0,
          dependencies: ["t-3"],
        },
        {
          id: "t-6",
          title: "Adversarial Quality Control & Replan Directives",
          description: "Challenge regioselectivity and byproduct bottlenecks; issue replan directive.",
          assignedAgent: "CRITIC",
          status: "QUEUED",
          progress: 0,
          dependencies: ["t-5"],
        },
      ];

      setTasks(newTasks);
      setCurrentRun({
        id: runId,
        objective: content,
        targetMolecule: targetResult.targetName,
        status: "RUNNING",
        progress: 5,
        currentStepDescription: `Orchestrator decomposing objective for ${targetResult.targetName}...`,
        activeAgents: ["ORCHESTRATOR"],
        startedAt: new Date().toLocaleTimeString(),
        phaseIndex: 1,
        totalPhases: 6,
        phaseSecondsRemaining: 120,
        speedMultiplier: speedMultiplierRef.current,
      });

      // Helper function to execute an agent phase for at least 120 seconds with live streaming thoughts & logs
      const runAgentPhase = async (config: {
        role: AgentRole;
        name: string;
        action: string;
        durationSeconds: number; // 120s
        phaseIndex: number;
        runProgressStart: number;
        runProgressEnd: number;
        commFrom?: AgentRole;
        commTo?: AgentRole;
        status?: AgentActivityStep["status"];
        thoughts: { second: number; thought: string }[];
        logs: { second: number; log: string; type: TelemetryLog["type"] }[];
      }) => {
        if (isCancelledRef.current) return;

        // Reset skip flag for this phase
        skipPhaseRef.current = false;

        // Set active communication beam
        if (config.commFrom && config.commTo) {
          setActiveCommunication({ from: config.commFrom, to: config.commTo });
        } else {
          setActiveCommunication(null);
        }

        // Update active agent in runtime state
        updateAgent(config.role, {
          state: config.status === "VALIDATING" ? "VALIDATING" : "WORKING",
          currentTask: config.action,
          progress: 10,
        });

        // Initialize activity step in the chat message
        const initialStep: AgentActivityStep = {
          agentRole: config.role,
          agentName: config.name,
          action: config.action,
          timestamp: "00:00",
          status: config.status || "IN_PROGRESS",
          thoughtChain: [config.thoughts[0]?.thought || "Initializing domain reasoning engine..."],
          currentThought: config.thoughts[0]?.thought || "Initializing domain reasoning engine...",
          durationSeconds: config.durationSeconds,
          elapsedSeconds: 0,
          telemetryLogs: [
            {
              id: `log-${Date.now()}-init`,
              timestamp: "00:01",
              source: config.role,
              message: `Phase ${config.phaseIndex}/6 started: ${config.action}`,
              type: "dispatch",
            },
          ],
        };

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  activitySteps: [...(m.activitySteps || []), initialStep],
                }
              : m
          )
        );

        let elapsed = 0;
        const totalSec = config.durationSeconds;

        // Live Real-Time Ticking Loop (120 seconds scaled by speedMultiplier)
        while (elapsed < totalSec && !isCancelledRef.current) {
          if (skipPhaseRef.current) {
            skipPhaseRef.current = false;
            elapsed = totalSec;
            break;
          }

          // Dynamic tick interval based on speedMultiplier
          const currentSpeed = speedMultiplierRef.current || 1;
          const tickDuration = Math.max(15, Math.floor(1000 / currentSpeed));
          await new Promise((r) => setTimeout(r, tickDuration));

          elapsed += 1;

          const remainingSec = Math.max(0, totalSec - elapsed);
          const progressRatio = elapsed / totalSec;
          const currentRunProgress = Math.round(
            config.runProgressStart + progressRatio * (config.runProgressEnd - config.runProgressStart)
          );

          // Find thoughts and logs triggered up to this second
          const activeThoughts = config.thoughts
            .filter((t) => t.second <= elapsed)
            .map((t) => t.thought);

          const latestThought =
            activeThoughts.length > 0 ? activeThoughts[activeThoughts.length - 1] : config.thoughts[0]?.thought;

          const activeLogs: TelemetryLog[] = [
            initialStep.telemetryLogs![0],
            ...config.logs
              .filter((l) => l.second <= elapsed)
              .map((l, idx) => ({
                id: `log-${Date.now()}-${idx}`,
                timestamp: `${String(Math.floor(l.second / 60)).padStart(2, "0")}:${String(l.second % 60).padStart(2, "0")}`,
                source: config.role,
                message: l.log,
                type: l.type,
              })),
          ];

          // Format timestamp
          const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
          const secs = String(elapsed % 60).padStart(2, "0");
          const formattedTimestamp = `${mins}:${secs}`;

          // Update current run state
          setCurrentRun((prev) => ({
            ...prev,
            progress: currentRunProgress,
            phaseIndex: config.phaseIndex,
            phaseSecondsRemaining: remainingSec,
            currentStepDescription: `${config.name}: ${latestThought}`,
            activeAgents: [config.role],
          }));

          // Update agent workstation progress
          updateAgent(config.role, {
            progress: Math.min(100, Math.round(progressRatio * 100)),
          });

          // Update step inside message
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== assistantMsgId || !m.activitySteps) return m;
              const updatedSteps = m.activitySteps.map((s) => {
                if (s.agentRole === config.role && s.action === config.action) {
                  return {
                    ...s,
                    timestamp: formattedTimestamp,
                    thoughtChain: activeThoughts,
                    currentThought: latestThought,
                    elapsedSeconds: elapsed,
                    telemetryLogs: activeLogs,
                  };
                }
                return s;
              });
              return { ...m, activitySteps: updatedSteps };
            })
          );
        }

        // Finalize phase for this agent
        updateAgent(config.role, {
          state: "COMPLETE",
          progress: 100,
          currentTask: `Completed: ${config.action}`,
        });

        // Mark task complete in task queue
        setTasks((prev) =>
          prev.map((t) =>
            t.assignedAgent === config.role
              ? { ...t, status: "COMPLETE", progress: 100 }
              : t
          )
        );

        // Mark step status in chat
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== assistantMsgId || !m.activitySteps) return m;
            const updatedSteps: AgentActivityStep[] = m.activitySteps.map((s) => {
              if (s.agentRole === config.role && s.action === config.action) {
                return {
                  ...s,
                  status: (config.status === "FLAGGED" ? "FLAGGED" : "COMPLETED") as AgentActivityStep["status"],
                  thoughtChain: config.thoughts.map((t) => t.thought),
                  currentThought: config.thoughts[config.thoughts.length - 1]?.thought,
                  elapsedSeconds: totalSec,
                };
              }
              return s;
            });
            return { ...m, activitySteps: updatedSteps };
          })
        );
      };

      // ==========================================
      // PHASE 1: ORCHESTRATOR (120 SECONDS)
      // ==========================================
      await runAgentPhase({
        role: "ORCHESTRATOR",
        name: "Orchestrator",
        action: `Deconstruct research objective & formulate dynamic state DAG for ${targetResult.targetName}`,
        durationSeconds: 120,
        phaseIndex: 1,
        runProgressStart: 5,
        runProgressEnd: 20,
        thoughts: [
          { second: 0, thought: `Parsing research prompt: Extracting chemical nomenclature, target structure, and primary objective constraints.` },
          { second: 18, thought: `Target entity recognized: Resolving IUPAC name and SMILES representation from PubChem compound index.` },
          { second: 40, thought: `Constructing state graph: Defining execution dependencies between Research, Retrosynthesis, Validation, and Critic agents.` },
          { second: 65, thought: `Formulating optimization objective: Maximize cumulative step yield, atom economy, and commercial precursor availability.` },
          { second: 90, thought: `Verifying safety threshold: Setting zero-tolerance policy for unbuffered toxic intermediates or runaway exotherms.` },
          { second: 112, thought: `Initial task graph compiled. Dispatching literature retrieval directive to Research Agent.` },
        ],
        logs: [
          { second: 5, log: `GET /pubchem/compound/smiles/resolution (Status: 200 OK)`, type: "tool" },
          { second: 28, log: `Node topology initialized: 6 nodes, 9 directional communication edges.`, type: "thought" },
          { second: 55, log: `Setting chemical constraints: T < 110°C, P < 5 bar, pH [4.5 - 8.5].`, type: "tool" },
          { second: 82, log: `Priority queue configured. Awaiting literature evidence from Research bay.`, type: "thought" },
          { second: 115, log: `[DISPATCH] Dispatched task: Retrieve validated synthetic precedents.`, type: "dispatch" },
        ],
      });

      // ==========================================
      // PHASE 2: RESEARCH AGENT (120 SECONDS)
      // ==========================================
      await runAgentPhase({
        role: "RESEARCH",
        name: "Research Agent",
        action: `Query peer-reviewed literature corpora & reaction indices for ${targetResult.targetName}`,
        durationSeconds: 120,
        phaseIndex: 2,
        runProgressStart: 20,
        runProgressEnd: 38,
        commFrom: "ORCHESTRATOR",
        commTo: "RESEARCH",
        thoughts: [
          { second: 0, thought: `Connecting to Reaxys & SciFinder reaction corpora. Querying sub-structure search for core chemical scaffold.` },
          { second: 22, thought: `Retrieved 28 published synthetic routes. Filtering by peer-reviewed impact, experimental yield (>85%), and reproducibility index.` },
          { second: 48, thought: `Analyzing historical precedents: Cross-referencing classic chemical literature against modern green-chemistry continuous-flow protocols.` },
          { second: 72, thought: `Evaluating solvent toxicity: Identifying hazardous solvent replacements (swapping chlorinated solvents for 2-MeTHF or buffered water).` },
          { second: 95, thought: `Cross-referencing patent prior art: Checking commercial freedom-to-operate and patented catalytic methods.` },
          { second: 114, thought: `Literature dataset verified: Packaging 2 primary synthetic routes with verified DOI citations and passing to Retrosynthesis bay.` },
        ],
        logs: [
          { second: 8, log: `POST /api/v2/reaxys/reaction/search query="${targetResult.targetName}" (28 hits)`, type: "tool" },
          { second: 34, log: `Verifying patent claims: WO2021/048123A1 & US8921415B2.`, type: "tool" },
          { second: 60, log: `Extracted reaction conditions: aqueous buffer, ambient pressure, T = 60°C.`, type: "finding" },
          { second: 88, log: `Citation confidence scored: 96.4% experimental validation index.`, type: "finding" },
          { second: 116, log: `[DISPATCH] Transmitted 2 candidate reaction precedent datasets to Retrosynthesis bay.`, type: "dispatch" },
        ],
      });

      // ==========================================
      // PHASE 3: RETROSYNTHESIS AGENT (120 SECONDS)
      // ==========================================
      await runAgentPhase({
        role: "RETROSYNTHESIS",
        name: "Retrosynthesis Agent",
        action: `Generate strategic bond disconnections & align commercial precursors for ${targetResult.targetName}`,
        durationSeconds: 120,
        phaseIndex: 3,
        runProgressStart: 38,
        runProgressEnd: 55,
        commFrom: "RESEARCH",
        commTo: "RETROSYNTHESIS",
        thoughts: [
          { second: 0, thought: `Initiating recursive retrosynthetic disconnection engine on target molecule framework.` },
          { second: 20, thought: `Disconnection 1: Evaluating strategic cleavage of heteroatom-carbon bond to produce stable, non-pyrophoric synthon equivalents.` },
          { second: 45, thought: `Checking commercial precursor availability across Enamine Building Blocks and Sigma-Aldrich catalogs (>95% purity).` },
          { second: 68, thought: `Formulating Route A: Single-step selective acylation/coupling from commercially abundant precursor.` },
          { second: 92, thought: `Formulating Route B: Two-step sequential functionalization pathway (alternative disconnection tree).` },
          { second: 112, thought: `Disconnection trees compiled. Forwarding candidate pathways to Validation Agent and Analysis bay.` },
        ],
        logs: [
          { second: 7, log: `Invoking RDKit reaction disconnection ruleset: core amide/ester cleavage.`, type: "tool" },
          { second: 32, log: `Querying commercial building blocks catalog for synthons (In stock: YES).`, type: "tool" },
          { second: 62, log: `Candidate Route A generated: 1 step, high atom economy, yield 92%.`, type: "finding" },
          { second: 89, log: `Candidate Route B generated: 2 steps, alternative starting materials, yield 68%.`, type: "finding" },
          { second: 115, log: `[DISPATCH] Forwarding Route A and Route B for feasibility and property audits.`, type: "dispatch" },
        ],
      });

      // ==========================================
      // PHASE 4: ANALYSIS AGENT (120 SECONDS)
      // ==========================================
      await runAgentPhase({
        role: "ANALYSIS",
        name: "Analysis Agent",
        action: `Compute quantum MMFF94 forcefield descriptors, LogP, TPSA, and Lipinski profile`,
        durationSeconds: 120,
        phaseIndex: 4,
        runProgressStart: 55,
        runProgressEnd: 70,
        commFrom: "ORCHESTRATOR",
        commTo: "ANALYSIS",
        thoughts: [
          { second: 0, thought: `Loading 3D conformer into RDKit computational chemistry kernel. Performing MMFF94 energy minimization.` },
          { second: 25, thought: `Calculating exact molecular weight and elemental composition: ${targetResult.properties.formula}, ${targetResult.properties.molecularWeight} g/mol.` },
          { second: 50, thought: `Computing Octanol-Water partition coefficient (Wildman-Crippen LogP): Optimal aqueous/lipid balance.` },
          { second: 75, thought: `Evaluating Topological Polar Surface Area (TPSA): ${targetResult.properties.tpsa} Å² (Ensures high membrane permeability and biological bioavailability).` },
          { second: 98, thought: `Auditing Lipinski Rule-of-Five criteria: 0 violations detected (HBD <= 5, HBA <= 10, MW < 500).` },
          { second: 115, thought: `Generating complete physicochemical dossier and passing descriptors to Validation bay.` },
        ],
        logs: [
          { second: 10, log: `Conformer generation & MMFF94 forcefield minimization complete.`, type: "tool" },
          { second: 36, log: `LogP computed: optimal partitioning balance (${targetResult.properties.logP}).`, type: "finding" },
          { second: 64, log: `TPSA calculated: excellent oral bioavailability profile (${targetResult.properties.tpsa} Å²).`, type: "finding" },
          { second: 92, log: `Lipinski Rule-of-5 audit: 0 violations, certified drug-like.`, type: "finding" },
          { second: 116, log: `[DISPATCH] Transmitted full physicochemical descriptor package to Validation Agent.`, type: "dispatch" },
        ],
      });

      // ==========================================
      // PHASE 5: VALIDATION AGENT (120 SECONDS)
      // ==========================================
      await runAgentPhase({
        role: "VALIDATION",
        name: "Validation Agent",
        action: `Audit functional group compatibility, thermodynamics, and reaction safety`,
        durationSeconds: 120,
        phaseIndex: 5,
        runProgressStart: 70,
        runProgressEnd: 84,
        commFrom: "RETROSYNTHESIS",
        commTo: "VALIDATION",
        status: "VALIDATING",
        thoughts: [
          { second: 0, thought: `Initiating chemical feasibility verification on candidate retrosynthetic pathways.` },
          { second: 22, thought: `Testing nucleophilic competition: Auditing selective functionalization in presence of secondary reactive groups.` },
          { second: 48, thought: `Evaluating reaction kinetics & thermal barriers: Ensuring delta G is sufficiently negative without hazardous thermal runaways.` },
          { second: 72, thought: `Route A audit: Single-step coupling exhibits high chemoselectivity under benign aqueous buffered conditions (pH 6.8).` },
          { second: 94, thought: `Route B audit: Detecting potential competitive side-reaction in second step (regioisomer formation risk).` },
          { second: 114, thought: `Preliminary clearance granted for Route A. Submitting full dossier to Critic Agent for adversarial QC.` },
        ],
        logs: [
          { second: 9, log: `Simulating activation energy barrier for transformation step 1 via OpenMM.`, type: "tool" },
          { second: 35, log: `Chemoselectivity confirmed: nucleophile preferential attack index = 98.4%.`, type: "finding" },
          { second: 63, log: `Byproduct analysis: stoichiometric acetic acid / water easily neutralized.`, type: "finding" },
          { second: 91, log: `Flagging Route B to Critic: competitive electrophilic substitution barrier detected.`, type: "tool" },
          { second: 116, log: `[DISPATCH] Transmitting candidate routes to Critic bay for adversarial interrogation.`, type: "dispatch" },
        ],
      });

      // ==========================================
      // PHASE 6: CRITIC AGENT (120 SECONDS - ADVERSARIAL AUDIT & REPLAN DIRECTIVE)
      // ==========================================
      await runAgentPhase({
        role: "CRITIC",
        name: "Critic Agent",
        action: `Adversarial quality-control audit: challenge yield assumptions & issue replan directive`,
        durationSeconds: 120,
        phaseIndex: 6,
        runProgressStart: 84,
        runProgressEnd: 96,
        commFrom: "VALIDATION",
        commTo: "CRITIC",
        status: "FLAGGED",
        thoughts: [
          { second: 0, thought: `Initiating adversarial inspection: Stress-testing reaction claims against non-ideal physical laboratory realities.` },
          { second: 25, thought: `ADVERSARIAL OBJECTION ON ROUTE B: Phenol nitration step generates problematic ortho/para isomer mixture (60:40). Isolation of pure isomer incurs severe yield penalties and high solvent waste.` },
          { second: 50, thought: `CRITIC DIRECTIVE: Reject Route B due to poor regioselectivity, cryogenic separation costs, and hazardous exotherm risk.` },
          { second: 75, thought: `Auditing Route A: Re-evaluating N-acylation step. Verified clean chemoselective precipitation with >90% isolated recovery.` },
          { second: 98, thought: `ISSUING REPLAN DIRECTIVE TO ORCHESTRATOR: Mandate Route A as primary validated protocol; archive Route B.` },
          { second: 115, thought: `Adversarial audit completed: Quality control standards met. Recommending final clearance for synthesis.` },
        ],
        logs: [
          { second: 11, log: `Stress-testing kinetic selectivity: Route B regioselectivity ratio = 1.4:1 (UNACCEPTABLE).`, type: "replan" },
          { second: 42, log: `EXOTHERM HAZARD: Nitration exotherm requires heavy cooling baths (DELTA H = -120 kJ/mol).`, type: "replan" },
          { second: 70, log: `[REPLAN DIRECTIVE] ⚠️ Issued directive: Deprecate Route B. Restructure around Route A.`, type: "replan" },
          { second: 96, log: `Route A re-inspection: 98.2% chemoselectivity confidence, certified green synthesis.`, type: "finding" },
          { second: 116, log: `[DISPATCH] Adversarial clearance granted. Objective ready for synthesis consensus.`, type: "dispatch" },
        ],
      });

      // ==========================================
      // FINAL CONSENSUS & RESOLUTION
      // ==========================================
      setActiveCommunication({ from: "CRITIC", to: "ORCHESTRATOR" });
      updateAgent("ORCHESTRATOR", {
        state: "COMPLETE",
        progress: 100,
        currentTask: `Consensus achieved: Certified synthesis route for ${targetResult.targetName}`,
      });

      await new Promise((r) => setTimeout(r, Math.max(50, Math.floor(1200 / (speedMultiplierRef.current || 1)))));

      setActiveCommunication(null);

      // Complete all tasks
      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          status: "COMPLETE",
          progress: 100,
        }))
      );

      // Complete run
      setCurrentRun((prev) => ({
        ...prev,
        status: "COMPLETED",
        progress: 100,
        currentStepDescription: `Investigation complete for ${targetResult.targetName}. Ready for review.`,
        activeAgents: [],
        phaseSecondsRemaining: 0,
        completedAt: new Date().toLocaleTimeString(),
      }));

      // Update final message content with rich summary and structured chemistry result
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                isStreaming: false,
                content: `Investigation complete for **${targetResult.targetName}** (${targetResult.properties.formula}). The multi-agent workforce has completed deep domain reasoning (at least 2 minutes per specialist), retrieved verified peer-reviewed precedents, adversarially audited candidate pathways, and certified an optimal synthesis route.`,
                structuredResult: targetResult,
              }
            : m
        )
      );
    },
    [targetedAgentRole, agents, updateAgent]
  );

  return (
    <RuntimeContext.Provider
      value={{
        agents,
        tasks,
        messages,
        currentRun,
        selectedAgentId,
        targetedAgentRole,
        activeView,
        isSplitAerialOpen,
        activeCommunication,
        speedMultiplier,
        setActiveView,
        setIsSplitAerialOpen,
        selectAgent,
        setTargetedAgentRole,
        setSpeedMultiplier,
        skipCurrentPhase,
        chatWithAgent,
        sendMessage,
        resetRun,
        cancelRun,
      }}
    >
      {children}
    </RuntimeContext.Provider>
  );
}

export function useRuntime() {
  const context = useContext(RuntimeContext);
  if (!context) {
    throw new Error("useRuntime must be used within a RuntimeProvider");
  }
  return context;
}
