"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  Agent,
  AgentRole,
  Task,
  ChatMessage,
  RunState,
  StructuredResult,
  AgentActivityStep
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
  
  // Actions
  setActiveView: (view: "chat" | "aerial" | "graph" | "chemistry") => void;
  setIsSplitAerialOpen: (open: boolean) => void;
  selectAgent: (agentId: string | null) => void;
  setTargetedAgentRole: (role: AgentRole | null) => void;
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
    setAgents(INITIAL_AGENTS);
    setTasks([]);
    setCurrentRun(DEFAULT_RUN);
    setActiveCommunication(null);
    setTargetedAgentRole(null);
  }, []);

  const cancelRun = useCallback(() => {
    setCurrentRun((prev) => ({ ...prev, status: "IDLE", progress: 0, currentStepDescription: "Run cancelled." }));
    setAgents((prev) => prev.map((a) => ({ ...a, state: "IDLE", progress: 100, currentTask: "Idle." })));
    setActiveCommunication(null);
  }, []);

  // Multi-Agent Execution Simulator or Direct Agent Consultation
  const sendMessage = useCallback(
    async (content: string) => {
      const userMsgId = `msg-user-${Date.now()}`;
      const userMsg: ChatMessage = {
        id: userMsgId,
        role: "user",
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        targetedAgent: targetedAgentRole || undefined,
      };

      const assistantMsgId = `msg-asst-${Date.now()}`;

      // If user is chatting directly with a specific targeted agent
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

      // Default: Full Multi-Agent System Execution (Orchestrator coordinates all)
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "Initializing multi-agent decomposition...",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isStreaming: true,
        activitySteps: [],
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      // Detect sample dataset
      const lower = content.toLowerCase();
      let sampleKey = "paracetamol";
      if (lower.includes("ibuprofen") || lower.includes("propanoic") || lower.includes("isobutyl")) {
        sampleKey = "ibuprofen";
      }
      const targetResult: StructuredResult = SAMPLE_RESULTS[sampleKey] || SAMPLE_RESULTS["paracetamol"];
      const runId = `NC-RUN-${Math.floor(1000 + Math.random() * 9000)}`;

      // Setup initial tasks
      const newTasks: Task[] = [
        {
          id: "t-1",
          title: "Decompose Objective & Constraints",
          description: "Analyze molecular target and construct dynamic task graph.",
          assignedAgent: "ORCHESTRATOR",
          status: "RUNNING",
          progress: 10,
          dependencies: [],
        },
        {
          id: "t-2",
          title: "Retrieve Literature Evidence & Precedents",
          description: "Search peer-reviewed reactions and check patent prior art.",
          assignedAgent: "RESEARCH",
          status: "QUEUED",
          progress: 0,
          dependencies: ["t-1"],
        },
        {
          id: "t-3",
          title: "Generate Retrosynthetic Disconnections",
          description: "Propose bond disconnections and rank candidate synthetic pathways.",
          assignedAgent: "RETROSYNTHESIS",
          status: "QUEUED",
          progress: 0,
          dependencies: ["t-2"],
        },
        {
          id: "t-4",
          title: "Compute Physicochemical Properties",
          description: "Calculate Lipinski parameters, TPSA, LogP, and solubility.",
          assignedAgent: "ANALYSIS",
          status: "QUEUED",
          progress: 0,
          dependencies: ["t-1"],
        },
        {
          id: "t-5",
          title: "Validate Reaction Feasibility & Safety",
          description: "Check functional group tolerances and safety parameters.",
          assignedAgent: "VALIDATION",
          status: "QUEUED",
          progress: 0,
          dependencies: ["t-3"],
        },
        {
          id: "t-6",
          title: "Adversarial Quality Control & Replan Check",
          description: "Inspect reasoning, identify regioselectivity barriers, and challenge weak steps.",
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
        progress: 10,
        currentStepDescription: "Orchestrator decomposing objective...",
        activeAgents: ["ORCHESTRATOR"],
        startedAt: new Date().toLocaleTimeString(),
      });

      const addStep = (step: AgentActivityStep) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  activitySteps: [...(m.activitySteps || []), step],
                }
              : m
          )
        );
      };

      // STEP 1: Orchestrator
      updateAgent("ORCHESTRATOR", {
        state: "WORKING",
        currentTask: `Decomposing target: ${targetResult.targetName}`,
        progress: 30,
      });
      addStep({
        agentRole: "ORCHESTRATOR",
        agentName: "Orchestrator",
        action: `Objective mapped to 6-step dependency graph for ${targetResult.targetName}. Routing tasks.`,
        timestamp: "0.4s",
        status: "STARTED",
      });

      await new Promise((r) => setTimeout(r, 800));

      // STEP 2: Communication: Orchestrator -> Research & Retrosynthesis
      setActiveCommunication({ from: "ORCHESTRATOR", to: "RESEARCH" });
      updateAgent("ORCHESTRATOR", { state: "COMMUNICATING", progress: 60 });
      updateAgent("RESEARCH", {
        state: "WORKING",
        currentTask: "Querying literature corpora & reaction indices",
        progress: 25,
      });
      updateAgent("ANALYSIS", {
        state: "WORKING",
        currentTask: "Calculating MW, LogP, TPSA, and solubility bounds",
        progress: 30,
      });
      addStep({
        agentRole: "RESEARCH",
        agentName: "Research Agent",
        action: "Querying Reaxys & PubChem corpora for validated synthetic precedents.",
        timestamp: "1.2s",
        status: "IN_PROGRESS",
      });

      await new Promise((r) => setTimeout(r, 1000));

      // STEP 3: Retrosynthesis starts
      setActiveCommunication({ from: "RESEARCH", to: "RETROSYNTHESIS" });
      updateAgent("RESEARCH", { state: "COMPLETE", progress: 100, currentTask: "Extracted verified literature precedents." });
      updateAgent("RETROSYNTHESIS", {
        state: "WORKING",
        currentTask: "Generating disconnection tree & synthon equivalents",
        progress: 40,
      });
      setCurrentRun((prev) => ({
        ...prev,
        progress: 45,
        currentStepDescription: "Retrosynthesis Agent proposing candidate pathways...",
        activeAgents: ["RETROSYNTHESIS", "ANALYSIS"],
      }));
      addStep({
        agentRole: "RETROSYNTHESIS",
        agentName: "Retrosynthesis Agent",
        action: "Identified candidate pathways. Proposing Route A (N-Acylation) and Route B (Nitration/Reduction).",
        timestamp: "2.1s",
        status: "IN_PROGRESS",
      });

      await new Promise((r) => setTimeout(r, 1100));

      // STEP 4: Validation
      setActiveCommunication({ from: "RETROSYNTHESIS", to: "VALIDATION" });
      updateAgent("ANALYSIS", { state: "COMPLETE", progress: 100, currentTask: "Descriptors calculated." });
      updateAgent("RETROSYNTHESIS", { state: "WAITING", progress: 85, currentTask: "Awaiting validation clearance." });
      updateAgent("VALIDATION", {
        state: "VALIDATING",
        currentTask: "Checking functional group compatibility & temperature bounds",
        progress: 60,
      });
      setCurrentRun((prev) => ({
        ...prev,
        progress: 65,
        currentStepDescription: "Validation Agent testing chemical feasibility...",
        activeAgents: ["VALIDATION"],
      }));
      addStep({
        agentRole: "VALIDATION",
        agentName: "Validation Agent",
        action: "Evaluating chemoselectivity and stoichiometric byproduct risks.",
        timestamp: "3.2s",
        status: "IN_PROGRESS",
      });

      await new Promise((r) => setTimeout(r, 1000));

      // STEP 5: Critic Challenge & Replanning Loop!
      setActiveCommunication({ from: "VALIDATION", to: "CRITIC" });
      updateAgent("VALIDATION", { state: "WAITING", progress: 85 });
      updateAgent("CRITIC", {
        state: "VALIDATING",
        currentTask: "Adversarial inspection of Route B regioselectivity",
        progress: 75,
      });
      setCurrentRun((prev) => ({
        ...prev,
        status: "REPLANNING",
        progress: 78,
        currentStepDescription: "Critic Agent detected regioselectivity barrier. Initiating replan...",
        activeAgents: ["CRITIC", "ORCHESTRATOR"],
      }));
      addStep({
        agentRole: "CRITIC",
        agentName: "Critic Agent",
        action: "Flagged Route B: Phenol nitration produces unwanted ortho-isomer (2-nitrophenol, 65% loss) with high exothermic risk. Recommended rejection.",
        timestamp: "4.1s",
        status: "FLAGGED",
      });

      await new Promise((r) => setTimeout(r, 1200));

      // STEP 6: Orchestrator replans to Route A
      setActiveCommunication({ from: "CRITIC", to: "ORCHESTRATOR" });
      updateAgent("ORCHESTRATOR", {
        state: "WORKING",
        currentTask: "Replanning: Prioritizing chemoselective Route A from 4-aminophenol",
        progress: 90,
      });
      addStep({
        agentRole: "ORCHESTRATOR",
        agentName: "Orchestrator",
        action: "Replanning directive approved. Deprecating Route B. Prioritizing single-step aqueous buffered N-acetylation (Route A).",
        timestamp: "4.9s",
        status: "REPLANNING",
      });

      await new Promise((r) => setTimeout(r, 900));

      // STEP 7: Final Validation & Approval
      setActiveCommunication({ from: "ORCHESTRATOR", to: "VALIDATION" });
      updateAgent("VALIDATION", {
        state: "COMPLETE",
        progress: 100,
        currentTask: "Route A cleared with 98% confidence.",
      });
      updateAgent("CRITIC", {
        state: "COMPLETE",
        progress: 100,
        currentTask: "Zero false claims verified. Pathway approved.",
      });
      updateAgent("RETROSYNTHESIS", { state: "COMPLETE", progress: 100, currentTask: "Route A finalized." });
      updateAgent("ORCHESTRATOR", { state: "COMPLETE", progress: 100, currentTask: "Objective accomplished." });
      setActiveCommunication(null);

      addStep({
        agentRole: "VALIDATION",
        agentName: "Validation Agent",
        action: "Route A approved: 88-92% theoretical yield, high atom economy, zero hazardous wastes.",
        timestamp: "5.6s",
        status: "COMPLETED",
      });

      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          status: "COMPLETE",
          progress: 100,
        }))
      );

      setCurrentRun((prev) => ({
        ...prev,
        status: "COMPLETED",
        progress: 100,
        currentStepDescription: `Investigation complete for ${targetResult.targetName}. Ready for review.`,
        activeAgents: [],
        completedAt: new Date().toLocaleTimeString(),
      }));

      // STEP 8: Final message stream update
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                isStreaming: false,
                content: `Investigation complete for **${targetResult.targetName}** (${targetResult.properties.formula}). The multi-agent workforce has decomposed the objective, verified peer-reviewed precedents, adversarially audited candidate pathways, and certified an optimal synthesis route.`,
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
        setActiveView,
        setIsSplitAerialOpen,
        selectAgent,
        setTargetedAgentRole,
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
