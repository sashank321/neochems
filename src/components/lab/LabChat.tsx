"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRuntime } from "@/lib/runtime/RuntimeContext";
import { ChatMessage, AgentRole, AgentActivityStep } from "@/lib/runtime/types";

const STARTER_PROMPTS = [
  {
    title: "Paracetamol Retrosynthesis",
    desc: "Propose a chemoselective route from 4-aminophenol and audit nitration barriers.",
    prompt: "Investigate target molecule: Propose a retrosynthetic route for Paracetamol and verify key disconnections.",
  },
  {
    title: "Ibuprofen BHC Catalytic Route",
    desc: "Evaluate 3-step atom-economic green synthesis from isobutylbenzene.",
    prompt: "Synthesize Ibuprofen: Check reaction feasibility, hazardous intermediates, and literature evidence.",
  },
  {
    title: "Aspirin Synthesis & Solubility",
    desc: "Analyze salicylic acid esterification with aqueous solubility prediction.",
    prompt: "Aspirin (Acetylsalicylic Acid): Propose esterification pathway and validate aqueous solubility.",
  },
  {
    title: "Bioactive Alkaloid Screening",
    desc: "Search reaction evidence and verify cross-coupling feasibility.",
    prompt: "Analyze bioactive alkaloid core: Search reaction evidence and verify cross-coupling feasibility.",
  },
];

export function LabChat() {
  const {
    messages,
    sendMessage,
    currentRun,
    activeCommunication,
    setActiveView,
    setIsSplitAerialOpen,
    isSplitAerialOpen,
    selectAgent,
    agents,
    targetedAgentRole,
    setTargetedAgentRole,
    speedMultiplier,
    setSpeedMultiplier,
    skipCurrentPhase,
  } = useRuntime();

  const [inputPrompt, setInputPrompt] = useState("");
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const targetedAgent = targetedAgentRole ? agents.find((a) => a.role === targetedAgentRole) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentRun.progress, currentRun.currentStepDescription]);

  const handleSend = async () => {
    if (!inputPrompt.trim() || currentRun.status === "RUNNING" || currentRun.status === "REPLANNING") return;
    const promptToSend = inputPrompt;
    setInputPrompt("");
    await sendMessage(promptToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleThought = (stepKey: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [stepKey]: prev[stepKey] === undefined ? false : !prev[stepKey],
    }));
  };

  const toggleLogs = (stepKey: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const isExecuting = currentRun.status === "RUNNING" || currentRun.status === "REPLANNING";

  const phaseMins = Math.floor((currentRun.phaseSecondsRemaining || 0) / 60);
  const phaseSecs = (currentRun.phaseSecondsRemaining || 0) % 60;
  const formattedPhaseTime = `${String(phaseMins).padStart(2, "0")}:${String(phaseSecs).padStart(2, "0")}`;

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto relative select-text text-[#0F0F0F]">
      {/* Targeted Agent Direct Channel Banner */}
      {targetedAgent && (
        <div className="sticky top-0 z-30 mb-3 p-3.5 rounded-xl bg-[#FAF8F2] border-2 border-[#E57D25] shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-white border border-[#E0DCCF] shadow-sm"
              style={{ color: targetedAgent.accentColor }}
            >
              {targetedAgent.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-base text-[#0F0F0F]">
                  Direct Channel: {targetedAgent.name}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
                  style={{
                    backgroundColor: `${targetedAgent.color}20`,
                    borderColor: `${targetedAgent.color}40`,
                    color: targetedAgent.accentColor,
                  }}
                >
                  {targetedAgent.role}
                </span>
              </div>
              <p className="text-xs text-[#5A564C] font-body mt-0.5">
                Directly asking this agent. Queries are handled by its specific domain heuristics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => selectAgent(targetedAgent.id)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#E0DCCF] border border-[#E0DCCF] text-xs font-mono text-[#0F0F0F] font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>📋</span>
              <span>What it did</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetedAgentRole(null)}
              className="px-3 py-1.5 rounded-lg bg-[#0F0F0F] hover:bg-[#2b2b2b] text-xs font-mono text-[#FAF8F2] font-semibold transition-colors flex items-center gap-1"
            >
              <span>⚡</span>
              <span>Switch to All Agents</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Multi-Agent Execution Banner (with 2-Min Countdown & Speed Controls) */}
      {isExecuting && (
        <div className="sticky top-0 z-20 mb-3 p-4 rounded-2xl bg-white border-2 border-[#E57D25] shadow-xl flex flex-col gap-3 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-[#E57D25] animate-ping" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0F0F0F] uppercase tracking-wider">
                    {currentRun.status === "REPLANNING" ? "⚖️ REPLANNING DIRECTIVE ACTIVE" : "⚡ REAL-TIME MULTI-AGENT EXECUTION"}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E57D25]/15 text-[#E57D25] font-bold">
                    {currentRun.progress}% OVERALL
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0F0F0F] text-[#FAF8F2] font-bold">
                    PHASE {currentRun.phaseIndex || 1}/6
                  </span>
                </div>
                <p className="text-xs text-[#5A564C] font-mono mt-0.5 line-clamp-1">{currentRun.currentStepDescription}</p>
              </div>
            </div>

            {/* Live Phase Countdown Clock */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="px-3 py-1.5 rounded-xl bg-[#FAF8F2] border border-[#E0DCCF] flex items-center gap-2">
                <span className="text-base animate-pulse">⏱️</span>
                <div className="text-left">
                  <div className="font-mono text-xs font-bold text-[#0F0F0F]">{formattedPhaseTime}</div>
                  <div className="font-mono text-[9px] text-[#8A8A8A] uppercase">Phase Clock (2m)</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSplitAerialOpen(!isSplitAerialOpen)}
                className="px-3 py-2 rounded-xl bg-[#F0EDE0] hover:bg-[#E0DCCF] border border-[#E0DCCF] text-xs font-mono text-[#0F0F0F] transition-colors flex items-center gap-1.5 font-bold shadow-xs"
              >
                <span>🏢</span>
                <span>{isSplitAerialOpen ? "Hide 3D" : "View 3D"}</span>
              </button>
            </div>
          </div>

          {/* Pacing & Speed Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-[#E0DCCF] text-xs font-mono gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[#8A8A8A] font-bold text-[11px] uppercase">Simulation Speed:</span>
              <div className="flex items-center p-0.5 rounded-lg bg-[#F0EDE0] border border-[#E0DCCF]">
                <button
                  type="button"
                  onClick={() => setSpeedMultiplier(1)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    speedMultiplier === 1
                      ? "bg-[#0F0F0F] text-[#FAF8F2] shadow-xs"
                      : "text-[#5A564C] hover:text-[#0F0F0F]"
                  }`}
                  title="Real-time 2 minutes per agent"
                >
                  1x (Real-Time 2m)
                </button>
                <button
                  type="button"
                  onClick={() => setSpeedMultiplier(5)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    speedMultiplier === 5
                      ? "bg-[#0F0F0F] text-[#FAF8F2] shadow-xs"
                      : "text-[#5A564C] hover:text-[#0F0F0F]"
                  }`}
                  title="5x speed (24s per agent)"
                >
                  5x Fast
                </button>
                <button
                  type="button"
                  onClick={() => setSpeedMultiplier(10)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    speedMultiplier === 10
                      ? "bg-[#0F0F0F] text-[#FAF8F2] shadow-xs"
                      : "text-[#5A564C] hover:text-[#0F0F0F]"
                  }`}
                  title="10x speed (12s per agent)"
                >
                  10x Hyper
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={skipCurrentPhase}
                className="px-3 py-1 rounded-lg bg-[#E57D25] hover:bg-[#d06e1c] text-white font-mono text-[11px] font-bold transition-colors flex items-center gap-1 shadow-xs"
                title="Immediately complete this agent's 2-minute phase and proceed to next"
              >
                <span>⏭️</span>
                <span>Skip Current Phase</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-6">
        {/* If only 1 welcome message, show the starter prompt cards */}
        {messages.length <= 1 && (
          <div className="py-8 text-center space-y-8 animate-fade-in">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E57D25]/15 border border-[#E57D25]/30 text-[#E57D25] font-mono text-xs uppercase tracking-wider font-bold">
                <span>⚡ Multi-Agent Deep Runtime Online · 2-Min Execution / Specialist</span>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl font-light text-[#0F0F0F] tracking-tight">
                What are we <span className="italic font-normal text-[#E57D25]">investigating?</span>
              </h1>
              <p className="font-body text-[#5A564C] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Enter any target molecule, retrosynthetic challenge, or scientific query. Each specialist runs for at
                least 2 minutes, displaying its step-by-step chain of thought, querying live literature, and validating
                feasibility in real time.
              </p>
            </div>

            {/* Starter Prompt Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left max-w-2xl mx-auto">
              {STARTER_PROMPTS.map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(starter.prompt)}
                  className="p-4 rounded-xl bg-white hover:bg-[#FAF8F2] border border-[#E0DCCF] hover:border-[#E57D25] transition-all text-left group flex flex-col justify-between shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="font-heading font-bold text-[#0F0F0F] text-base group-hover:text-[#E57D25] transition-colors">
                      {starter.title}
                    </div>
                    <p className="font-body text-[#5A564C] text-xs mt-1 leading-normal">{starter.desc}</p>
                  </div>
                  <div className="mt-3.5 flex items-center gap-1.5 text-[11px] font-mono text-[#E57D25] font-bold">
                    <span>Investigate Objective</span>
                    <span>→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render Conversation Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} space-y-1.5`}
          >
            {/* Sender Label */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#5A564C] px-1">
              <span className="font-bold">
                {msg.role === "user"
                  ? msg.targetedAgent
                    ? `RESEARCHER → DIRECT TO ${msg.targetedAgent}`
                    : "RESEARCHER"
                  : "NEOCHEMS SCIENTIFIC WORKFORCE"}
              </span>
              <span>·</span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Message Bubble Container */}
            <div
              className={`p-5 rounded-2xl max-w-3xl leading-relaxed text-sm shadow-sm ${
                msg.role === "user"
                  ? "bg-[#0F0F0F] text-[#FAF8F2] rounded-tr-sm"
                  : "bg-white border border-[#E0DCCF] text-[#0F0F0F] rounded-tl-sm w-full"
              }`}
            >
              {/* Message Content */}
              <div className="font-body text-base space-y-3 leading-relaxed whitespace-pre-line">
                {msg.content}
              </div>

              {/* Multi-Agent Live Execution Trace with Dedicated Chain of Thought */}
              {msg.activitySteps && msg.activitySteps.length > 0 && (
                <div className="mt-5 pt-4 border-t border-[#E0DCCF] space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#5A564C] mb-2">
                    <span className="uppercase tracking-wider font-bold">
                      Multi-Agent Reasoning & Execution Trace ({msg.activitySteps.length} Agents)
                    </span>
                    <span>2 mins per specialist</span>
                  </div>

                  <div className="space-y-3">
                    {msg.activitySteps.map((step, idx) => {
                      const ag = agents.find((a) => a.role === step.agentRole);
                      const stepKey = `${msg.id}-${step.agentRole}-${idx}`;
                      const isThoughtOpen = expandedThoughts[stepKey] !== false; // open by default
                      const isLogsOpen = !!expandedLogs[stepKey];

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border text-xs font-mono flex flex-col space-y-3 transition-all ${
                            step.status === "FLAGGED"
                              ? "bg-red-50/70 border-red-200 text-red-950 shadow-xs"
                              : step.status === "REPLANNING"
                              ? "bg-amber-50/70 border-amber-200 text-amber-950 shadow-xs"
                              : "bg-[#F7F5EE] border-[#E0DCCF] text-[#0F0F0F] shadow-xs"
                          }`}
                        >
                          {/* Agent Card Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{ag?.symbol || "⚡"}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="font-bold text-xs font-heading"
                                    style={{ color: ag?.accentColor || "#0F0F0F" }}
                                  >
                                    {step.agentName}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold ${
                                      step.status === "COMPLETED"
                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                        : step.status === "FLAGGED"
                                        ? "bg-red-100 text-red-800 border border-red-300"
                                        : "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                                    }`}
                                  >
                                    {step.status === "COMPLETED" ? "CLEARED" : step.status}
                                  </span>
                                </div>
                                <p className="mt-0.5 font-body text-xs text-[#2B2B2B] leading-snug">{step.action}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => ag && selectAgent(ag.id)}
                                className="text-[10px] text-[#5A564C] hover:text-[#0F0F0F] underline font-mono"
                              >
                                What it did
                              </button>
                              <span className="text-[10px] text-[#8A8A8A] font-mono">{step.timestamp}</span>
                            </div>
                          </div>

                          {/* DEDICATED CHAIN OF THOUGHT ACCORDION */}
                          {step.thoughtChain && step.thoughtChain.length > 0 && (
                            <div className="mt-2 rounded-lg bg-white border border-[#E0DCCF] overflow-hidden shadow-xs">
                              <button
                                type="button"
                                onClick={() => toggleThought(stepKey)}
                                className="w-full px-3 py-2 bg-[#F0EDE0] hover:bg-[#E8E4D6] flex items-center justify-between text-[11px] font-mono text-[#0F0F0F] font-bold transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <span>🧠</span>
                                  <span>{step.agentName} Chain of Thought</span>
                                  <span className="text-[10px] text-[#5A564C] font-normal">
                                    ({step.thoughtChain.length} reasoning steps)
                                  </span>
                                </div>
                                <span className="text-xs">{isThoughtOpen ? "▲ Hide" : "▼ Show"}</span>
                              </button>

                              {isThoughtOpen && (
                                <div className="p-3.5 space-y-2.5 font-body text-xs text-[#2B2B2B] leading-relaxed">
                                  {step.thoughtChain.map((thought, ti) => (
                                    <div key={ti} className="flex items-start gap-2.5">
                                      <span className="text-[#E57D25] font-mono text-[10px] font-bold mt-0.5">
                                        {String(ti + 1).padStart(2, "0")}.
                                      </span>
                                      <p className="flex-1 text-xs">{thought}</p>
                                    </div>
                                  ))}

                                  {/* Active thinking indicator if phase still in progress */}
                                  {step.status !== "COMPLETED" && (
                                    <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#E57D25]">
                                      <span className="w-2 h-2 rounded-full bg-[#E57D25] animate-ping" />
                                      <span className="italic">Deliberating next chemical hypothesis in real-time...</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* DEDICATED TELEMETRY LOGS ACCORDION */}
                          {step.telemetryLogs && step.telemetryLogs.length > 0 && (
                            <div className="rounded-lg bg-[#FAF8F2] border border-[#E0DCCF] overflow-hidden">
                              <button
                                type="button"
                                onClick={() => toggleLogs(stepKey)}
                                className="w-full px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-[#5A564C] hover:text-[#0F0F0F] transition-colors"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span>📋</span>
                                  <span>Telemetry & Tool Logs ({step.telemetryLogs.length})</span>
                                </div>
                                <span>{isLogsOpen ? "▲ Hide Logs" : "▼ View Logs"}</span>
                              </button>

                              {isLogsOpen && (
                                <div className="p-2.5 bg-white border-t border-[#E0DCCF] space-y-1 font-mono text-[10px] text-[#5A564C] max-h-40 overflow-y-auto">
                                  {step.telemetryLogs.map((log) => (
                                    <div key={log.id} className="flex items-start gap-2">
                                      <span className="text-[#8A8A8A] font-bold">{log.timestamp}</span>
                                      <span
                                        className={`px-1 rounded text-[9px] uppercase font-bold ${
                                          log.type === "replan"
                                            ? "bg-red-100 text-red-800"
                                            : log.type === "finding"
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-[#F0EDE0] text-[#0F0F0F]"
                                        }`}
                                      >
                                        {log.type}
                                      </span>
                                      <span className="flex-1 text-[#0F0F0F]">{log.message}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Structured Chemistry Result Preview (if completed) */}
              {msg.structuredResult && (
                <div className="mt-5 pt-4 border-t border-[#E0DCCF] space-y-4">
                  {/* Molecule & Summary Card */}
                  <div className="p-4 rounded-xl bg-[#FAF8F2] border border-[#E0DCCF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🧪</span>
                        <h4 className="font-heading font-bold text-[#0F0F0F] text-lg">
                          {msg.structuredResult.targetName}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                          PASSED VALIDATION
                        </span>
                      </div>
                      <p className="font-mono text-xs text-[#5A564C] mt-1">SMILES: {msg.structuredResult.smiles}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveView("chemistry")}
                        className="px-3.5 py-1.5 rounded-lg bg-[#E57D25] hover:bg-[#d06e1c] text-white font-mono text-xs font-bold transition-colors shadow-sm"
                      >
                        Inspect in Chemistry Workspace →
                      </button>
                    </div>
                  </div>

                  {/* Summary Text */}
                  <p className="text-xs text-[#2B2B2B] font-body leading-relaxed">
                    {msg.structuredResult.summary}
                  </p>

                  {/* Quick Route Cards */}
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] text-[#5A564C] uppercase tracking-wider font-bold block">
                      Proposed Synthetic Pathways ({msg.structuredResult.routes.length})
                    </span>
                    {msg.structuredResult.routes.map((rt) => (
                      <div
                        key={rt.id}
                        className="p-3 rounded-lg bg-white border border-[#E0DCCF] flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span>{rt.status === "VALIDATED" ? "✅" : "⚠️"}</span>
                          <span className="font-bold text-[#0F0F0F]">{rt.title}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rt.status === "VALIDATED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                          }`}
                        >
                          {rt.confidence}% Confidence
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Critic Notes */}
                  {msg.structuredResult.criticNotes.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs">
                      <div className="flex items-center gap-2 text-red-900 font-mono font-bold text-[11px] mb-1">
                        <span>⚖️ Critic & Replanning Audit</span>
                      </div>
                      <ul className="space-y-1 text-red-950">
                        {msg.structuredResult.criticNotes.map((note, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-red-600 font-bold">·</span>
                            <span className="font-body leading-snug">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer Input Area */}
      <div className="sticky bottom-0 z-20 pt-2 pb-4 bg-gradient-to-t from-[#F4F1E6] via-[#F4F1E6] to-transparent">
        <div className="relative rounded-2xl bg-white border-2 border-[#E0DCCF] focus-within:border-[#E57D25] shadow-lg transition-all p-3.5 flex flex-col">
          <textarea
            ref={textareaRef}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            placeholder={
              targetedAgent
                ? `Ask ${targetedAgent.name} directly about ${targetedAgent.tagline.toLowerCase()}...`
                : "Ask NeoChems to investigate a molecule (each specialist works for 2 mins with live chain of thought)..."
            }
            className="w-full bg-transparent text-[#0F0F0F] placeholder-[#8A8A8A] text-sm font-body outline-none resize-none min-h-[58px] max-h-[160px] leading-relaxed p-1"
            rows={2}
          />

          <div className="flex items-center justify-between pt-2.5 border-t border-[#E0DCCF] mt-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#5A564C]">
              {targetedAgent ? (
                <>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: targetedAgent.accentColor }} />
                  <span className="font-bold">DIRECT CHANNEL: {targetedAgent.name.toUpperCase()}</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold">7 AGENTS SYNCHRONIZED · 2M TIMED EXECUTION</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputPrompt.trim() || isExecuting}
                className="px-4 py-1.5 rounded-xl bg-[#E57D25] hover:bg-[#d06e1c] disabled:opacity-40 disabled:hover:bg-[#E57D25] text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <span>{isExecuting ? "Executing (2m/agent)..." : targetedAgent ? `Ask ${targetedAgent.name}` : "Execute Objective"}</span>
                <span>↑</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
