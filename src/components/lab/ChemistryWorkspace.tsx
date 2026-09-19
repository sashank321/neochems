"use client";

import React, { useState } from "react";
import { useRuntime } from "@/lib/runtime/RuntimeContext";
import { RetrosynthesisRoute, ReactionStep } from "@/lib/runtime/types";
import { SAMPLE_RESULTS } from "@/lib/runtime/initialData";

export function ChemistryWorkspace() {
  const { currentRun } = useRuntime();

  // Pick target result from active run or fallback to paracetamol
  const targetKey =
    currentRun.targetMolecule?.toLowerCase().includes("ibuprofen")
      ? "ibuprofen"
      : "paracetamol";

  const result = SAMPLE_RESULTS[targetKey] || SAMPLE_RESULTS.paracetamol;
  const [selectedRouteId, setSelectedRouteId] = useState<string>(result.routes[0].id);

  const selectedRoute = result.routes.find((r) => r.id === selectedRouteId) || result.routes[0];

  return (
    <div className="w-full h-full min-h-[620px] bg-[#FAF8F2] rounded-2xl overflow-hidden border border-[#E0DCCF] p-6 flex flex-col space-y-6 text-[#0F0F0F] shadow-xs">
      {/* Top Banner Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#E0DCCF] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0EDE0] border border-[#E0DCCF] flex items-center justify-center text-2xl">
              ⚗️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl font-bold text-[#0F0F0F]">{result.targetName}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                  STRUCTURE VERIFIED
                </span>
              </div>
              <p className="font-mono text-xs text-[#5A564C] mt-0.5">SMILES: {result.smiles}</p>
            </div>
          </div>
        </div>

        {/* Quick Molecular Stats */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-[#F0EDE0] border border-[#E0DCCF]">
            <span className="text-[#8A8A8A] block text-[9px] font-bold uppercase">FORMULA</span>
            <span className="font-bold text-[#E57D25]">{result.properties.formula}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#F0EDE0] border border-[#E0DCCF]">
            <span className="text-[#8A8A8A] block text-[9px] font-bold uppercase">MOL WEIGHT</span>
            <span className="font-bold text-[#0F0F0F]">{result.properties.molecularWeight} g/mol</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#F0EDE0] border border-[#E0DCCF]">
            <span className="text-[#8A8A8A] block text-[9px] font-bold uppercase">LOG P</span>
            <span className="font-bold text-[#0F0F0F]">{result.properties.logP}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#F0EDE0] border border-[#E0DCCF]">
            <span className="text-[#8A8A8A] block text-[9px] font-bold uppercase">TPSA</span>
            <span className="font-bold text-[#0F0F0F]">{result.properties.tpsa} Å²</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Col: Molecular 2D Canvas & Physicochemical Properties (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-5">
          {/* Molecular Structure Visualizer Box */}
          <div className="p-5 rounded-xl bg-white border border-[#E0DCCF] flex flex-col items-center justify-center relative min-h-[220px] shadow-xs">
            <span className="absolute top-3 left-3 font-mono text-[10px] text-[#8A8A8A] uppercase tracking-wider font-bold">
              2D Chemical Representation
            </span>

            {/* Custom SVG Molecular Diagram */}
            <svg viewBox="0 0 220 140" className="w-48 h-32 mt-4 text-[#0F0F0F]">
              {/* Benzene Ring */}
              <polygon
                points="110,40 140,55 140,85 110,100 80,85 80,55"
                fill="none"
                stroke="#0F0F0F"
                strokeWidth="2.5"
              />
              {/* Inner Double Bonds */}
              <line x1="110" y1="46" x2="134" y2="58" stroke="#0F0F0F" strokeWidth="1.8" />
              <line x1="134" y1="82" x2="110" y2="94" stroke="#0F0F0F" strokeWidth="1.8" />
              <line x1="86" y1="58" x2="86" y2="82" stroke="#0F0F0F" strokeWidth="1.8" />

              {/* Bottom Hydroxyl OH */}
              <line x1="110" y1="100" x2="110" y2="120" stroke="#0284C7" strokeWidth="2.5" />
              <text x="110" y="133" fill="#0284C7" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                OH
              </text>

              {/* Top Amide Chain */}
              <line x1="110" y1="40" x2="110" y2="24" stroke="#E57D25" strokeWidth="2.5" />
              <text x="110" y="17" fill="#E57D25" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                NH-Ac
              </text>
            </svg>

            <span className="font-mono text-xs text-[#5A564C] mt-1 font-semibold">{result.targetName}</span>
          </div>

          {/* Properties Table */}
          <div className="p-5 rounded-xl bg-white border border-[#E0DCCF] flex-1 flex flex-col shadow-xs">
            <span className="font-mono text-[10px] text-[#8A8A8A] uppercase tracking-wider font-bold mb-3">
              Calculated Descriptors (RDKit)
            </span>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#E0DCCF]/60">
                <span className="text-[#5A564C]">H-Bond Donors (HBD)</span>
                <span className="font-mono font-bold text-[#0F0F0F]">{result.properties.hbd}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E0DCCF]/60">
                <span className="text-[#5A564C]">H-Bond Acceptors (HBA)</span>
                <span className="font-mono font-bold text-[#0F0F0F]">{result.properties.hba}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E0DCCF]/60">
                <span className="text-[#5A564C]">Rotatable Bonds</span>
                <span className="font-mono font-bold text-[#0F0F0F]">{result.properties.rotatableBonds}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E0DCCF]/60">
                <span className="text-[#5A564C]">Aqueous Solubility</span>
                <span className="font-mono text-emerald-700 font-bold">{result.properties.solubilityValue}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E0DCCF]/60">
                <span className="text-[#5A564C]">Drug-likeness (Lipinski)</span>
                <span className="font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                  {result.properties.drugLikeness}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Retrosynthetic Pathway & Disconnections (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-5">
          {/* Route Tabs Selector */}
          <div className="flex items-center gap-2.5">
            {result.routes.map((rt) => (
              <button
                key={rt.id}
                type="button"
                onClick={() => setSelectedRouteId(rt.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 border shadow-xs ${
                  selectedRouteId === rt.id
                    ? "bg-[#0F0F0F] border-[#0F0F0F] text-[#FAF8F2] font-bold"
                    : "bg-white border-[#E0DCCF] text-[#5A564C] hover:text-[#0F0F0F]"
                }`}
              >
                <span>{rt.status === "VALIDATED" ? "✓" : "⚠️"}</span>
                <span>{rt.title.split(":")[0]}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                    rt.status === "VALIDATED"
                      ? selectedRouteId === rt.id ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {rt.confidence}%
                </span>
              </button>
            ))}
          </div>

          {/* Selected Route Detailed Card */}
          <div className="p-5 rounded-xl bg-white border border-[#E0DCCF] flex-1 flex flex-col space-y-5 overflow-y-auto shadow-xs">
            {/* Critic Verdict Alert */}
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                selectedRoute.status === "VALIDATED"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                  : "bg-red-50 border-red-200 text-red-950"
              }`}
            >
              <span className="text-base">{selectedRoute.status === "VALIDATED" ? "🛡️" : "⚖️"}</span>
              <div>
                <span className="font-bold block font-mono">
                  {selectedRoute.status === "VALIDATED" ? "CRITIC APPROVAL CLEARANCE" : "CRITIC ADVERSARIAL OBJECTION"}
                </span>
                <span className="mt-0.5 block font-body leading-relaxed">{selectedRoute.criticVerdict}</span>
              </div>
            </div>

            {/* Reaction Steps Breakdown */}
            <div className="space-y-4">
              <span className="font-mono text-[10px] text-[#8A8A8A] uppercase tracking-wider font-bold block">
                Reaction Transformation Steps
              </span>

              {selectedRoute.steps.map((step) => (
                <div key={step.stepNumber} className="p-4 rounded-xl bg-[#FAF8F2] border border-[#E0DCCF] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#E57D25] font-bold">
                      STEP {step.stepNumber} // {step.transformation}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F0EDE0] border border-[#E0DCCF] text-[#0F0F0F] font-semibold">
                      Yield: {step.yield}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-white border border-[#E0DCCF]">
                      <span className="text-[#8A8A8A] block text-[9px] font-bold">REACTANTS</span>
                      <span className="text-[#0F0F0F] font-medium">{step.reactants.join(" + ")}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#E0DCCF]">
                      <span className="text-[#8A8A8A] block text-[9px] font-bold">PRODUCT</span>
                      <span className="text-emerald-700 font-bold">{step.product}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#5A564C] font-mono pt-1">
                    <span>Reagents: <strong className="text-[#0F0F0F]">{step.reagents}</strong></span>
                    <span>·</span>
                    <span>Conditions: <strong className="text-[#0F0F0F]">{step.conditions}</strong></span>
                    <span>·</span>
                    <span className="text-emerald-700 font-bold">Feasibility: {step.feasibility}%</span>
                  </div>

                  {step.notes && (
                    <p className="text-xs text-[#5A564C] italic border-t border-[#E0DCCF]/60 pt-2 font-body">
                      Note: {step.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Literature Evidence Citations */}
            <div className="pt-3 border-t border-[#E0DCCF]">
              <span className="font-mono text-[10px] text-[#8A8A8A] uppercase tracking-wider font-bold block mb-2">
                Verified Literature Citations (Research Agent)
              </span>
              <div className="space-y-2">
                {result.evidence.map((ev) => (
                  <div key={ev.id} className="p-3 rounded-lg bg-[#FAF8F2] border border-[#E0DCCF] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0F0F0F]">{ev.title}</span>
                      <span className="font-mono text-[10px] text-emerald-700 font-bold">Score: {ev.confidenceScore * 100}%</span>
                    </div>
                    <p className="text-[#5A564C] text-[11px] font-mono">
                      {ev.authors} · {ev.source} ({ev.year}) · DOI: {ev.doi}
                    </p>
                    <p className="text-[#2B2B2B] text-[11px] italic font-body">{ev.relevance}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
