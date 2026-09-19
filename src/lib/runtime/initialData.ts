import { Agent, StructuredResult } from './types';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-orchestrator',
    name: 'Orchestrator',
    role: 'ORCHESTRATOR',
    symbol: '⚡',
    tagline: 'Central Coordinator & Replan Engine',
    description: 'Decomposes research objectives into dependency graphs, delegates execution, coordinates message exchange, and triggers dynamic replanning.',
    state: 'IDLE',
    currentTask: 'Awaiting research objective...',
    progress: 100,
    color: '#0254EC',
    accentColor: '#3B82F6',
    workstationPos: [0, 0, 0], // Center
    capabilities: [
      'Objective Decomposition',
      'Dependency Graph Routing',
      'Dynamic Replanning',
      'State Convergence',
      'Execution Trace Audit'
    ],
    tools: [
      { name: 'LangGraph Runtime', status: 'CONNECTED' },
      { name: 'Dependency Resolver', status: 'CONNECTED' },
      { name: 'Replanning Policy Engine', status: 'CONNECTED' }
    ],
    memorySummary: [
      'Initialized with standard organic synthesis disconnections.',
      'Replanning threshold set to constraint confidence < 80%.'
    ],
    recentEvents: [
      'System ready. Orchestrator initialized.',
      'Connected to 6 specialized agents via internal bus.'
    ],
    executionHistory: [
      {
        id: 'exec-orch-1',
        runId: 'NC-RUN-2026-08',
        timestamp: '10:42:01',
        objectiveOrInput: 'Propose a retrosynthetic route for Paracetamol and verify key disconnections.',
        actionTaken: 'Parsed target SMILES (CC(=O)Nc1ccc(O)cc1). Constructed a 6-task directed acyclic graph (DAG) routing literature search to Research Agent and bond analysis to Retrosynthesis Agent.',
        outputProduced: 'Executable Task Graph [t-1 through t-6] with state synchronization channels.',
        toolsUsed: ['LangGraph State Engine', 'DAG Compiler'],
        findings: [
          'Target recognized as 4-acetamidophenol.',
          'Detected parallelizable tasks: Research & Analysis can run concurrently.'
        ],
        status: 'SUCCESS'
      },
      {
        id: 'exec-orch-2',
        runId: 'NC-RUN-2026-08',
        timestamp: '10:42:18',
        objectiveOrInput: 'Critic Agent rejection directive for Route B (isomer contamination hazard).',
        actionTaken: 'Received adversarial critique. Halted Route B execution. Reallocated synthesis focus to single-step aqueous N-acetylation from commercial 4-aminophenol.',
        outputProduced: 'Updated execution plan favoring Route A. Emitted replanning broadcast.',
        toolsUsed: ['Replanning Policy Engine', 'Agent Bus'],
        findings: [
          'Successfully circumvented low-yield ortho/para separation step.',
          'Reduced total synthesis risk score by 58%.'
        ],
        status: 'REVISED'
      }
    ]
  },
  {
    id: 'agent-research',
    name: 'Research Agent',
    role: 'RESEARCH',
    symbol: '🔬',
    tagline: 'Scientific Literature & Citation Extraction',
    description: 'Searches peer-reviewed literature, extracts reaction conditions, checks patent clearances, and identifies empirical evidence for proposed transformations.',
    state: 'IDLE',
    currentTask: 'Literature index synchronized.',
    progress: 100,
    color: '#5B7553',
    accentColor: '#10B981',
    workstationPos: [-5, 0, -3], // Left rear
    capabilities: [
      'Literature Corpus Search',
      'Evidence Extraction',
      'Reaction Condition Mining',
      'DOI / Source Verification',
      'Claim Grounding'
    ],
    tools: [
      { name: 'Reaxys Literature Index', status: 'CONNECTED' },
      { name: 'PubChem BioAssay API', status: 'CONNECTED' },
      { name: 'Patent Prior-Art Engine', status: 'AVAILABLE' }
    ],
    memorySummary: [
      'Cached 14,200 indexed organic transformations.',
      'Last retrieved: 4-aminophenol acetylation procedures (Org. Synth. 1928).'
    ],
    recentEvents: [
      'Literature corpus ready.',
      'Zero dead citations verified.'
    ],
    executionHistory: [
      {
        id: 'exec-res-1',
        runId: 'NC-RUN-2026-08',
        timestamp: '10:42:04',
        objectiveOrInput: 'Query precedents for 4-aminophenol N-acetylation vs O-acetylation.',
        actionTaken: 'Queried Reaxys and CrossRef corpora. Extracted foundational Morse (1878) procedure and modern Ellis (2021) flow synthesis.',
        outputProduced: '2 peer-reviewed citations with full DOI links and verified reaction conditions.',
        toolsUsed: ['Reaxys API', 'CrossRef Resolver'],
        findings: [
          'Foundational Morse paper proves chemoselectivity of amine in aqueous medium.',
          'Ellis 2021 flow chemistry report demonstrates 94% yield without organic solvent.'
        ],
        status: 'SUCCESS'
      }
    ]
  },
  {
    id: 'agent-retrosynthesis',
    name: 'Retrosynthesis Agent',
    role: 'RETROSYNTHESIS',
    symbol: '🧪',
    tagline: 'Chemical Route Planning & Disconnection Engine',
    description: 'Proposes strategic chemical bond disconnections, evaluates forward feasibility, ranks synthetic pathways, and constructs multi-step reaction trees.',
    state: 'IDLE',
    currentTask: 'Disconnection rules loaded.',
    progress: 100,
    color: '#E57D25',
    accentColor: '#F97316',
    workstationPos: [5, 0, -3], // Right rear
    capabilities: [
      'Disconnection Tree Search',
      'Synthons & Reagents Mapping',
      'Forward Feasibility Scoring',
      'Protecting Group Analysis',
      'Green Chemistry Metrics'
    ],
    tools: [
      { name: 'AiZynthFinder Model', status: 'CONNECTED' },
      { name: 'RDKit Reaction Pipeline', status: 'CONNECTED' },
      { name: 'USPTO Reaction Templates', status: 'CONNECTED' }
    ],
    memorySummary: [
      'Prioritizes commercial starting materials with vendor availability > 95%.',
      'Avoids hazardous azides or toxic heavy metal couplings unless specified.'
    ],
    recentEvents: [
      'Template database compiled (45,000 rules).',
      'Tree search depth limit: 6 levels.'
    ],
    executionHistory: [
      {
        id: 'exec-retro-1',
        runId: 'NC-RUN-2026-08',
        timestamp: '10:42:08',
        objectiveOrInput: 'Disconnection analysis of Paracetamol amide linkage C(=O)-N.',
        actionTaken: 'Executed AiZynthFinder policy tree search. Generated Route A (amide condensation with acetic anhydride) and Route B (phenol nitration followed by reduction).',
        outputProduced: 'Two multi-step synthetic candidate trees with precursor SMILES and yield estimates.',
        toolsUsed: ['AiZynthFinder Engine', 'RDKit Synthon Transformer'],
        findings: [
          'Route A: 1-step commercial precursor disconnection (96.5% confidence).',
          'Route B: 2-step nitration/hydrogenation sequence (42.0% confidence).'
        ],
        status: 'SUCCESS'
      }
    ]
  },
  {
    id: 'agent-validation',
    name: 'Validation Agent',
    role: 'VALIDATION',
    symbol: '🛡️',
    tagline: 'Chemical Feasibility & Constraint Checker',
    description: 'Verifies reaction constraints, inspects intermediate compatibility, checks stereochemical consistency, and certifies chemical validity.',
    state: 'IDLE',
    currentTask: 'Constraint checker active.',
    progress: 100,
    color: '#7B6B8A',
    accentColor: '#8B5CF6',
    workstationPos: [-5, 0, 3], // Left front
    capabilities: [
      'Reaction Feasibility Validation',
      'Functional Group Tolerance Check',
      'Stereochemical Verification',
      'Solvent & Temperature Bounds',
      'Hazard & Safety Clearance'
    ],
    tools: [
      { name: 'RDKit Constraint Validator', status: 'CONNECTED' },
      { name: 'Reaction Feasibility Scorer', status: 'CONNECTED' },
      { name: 'Safety & REACH Audit Database', status: 'CONNECTED' }
    ],
    memorySummary: [
      'Strict filter: flagged hazardous nitration of activated phenolics.',
      'Approved mild acetylation under neutral/buffered aqueous conditions.'
    ],
    recentEvents: [
      'Constraint engine online.',
      'Safety filter active.'
    ],
    executionHistory: [
      {
        id: 'exec-val-1',
        runId: 'NC-RUN-2026-08',
        timestamp: '10:42:12',
        objectiveOrInput: 'Validate chemical feasibility and reaction conditions for proposed routes.',
        actionTaken: 'Inspected functional group tolerance of phenolic -OH during amine acylation. Verified that pKa differences ensure selective N-acetylation in aqueous acetate buffer.',
        outputProduced: 'Feasibility score: 98/100 for Route A. Safety certification verified.',
        toolsUsed: ['pKa Predictor', 'RDKit Constraint Validator'],
        findings: [
          'Zero hazardous runaway exotherm in buffered aqueous solution.',
          'Reaction temperature (60°C) is benign and energy-efficient.'
        ],
        status: 'SUCCESS'
      }
    ]
  },
  {
    id: 'agent-knowledge',
    name: 'Knowledge Agent',
    role: 'KNOWLEDGE',
    symbol: '🧠',
    tagline: 'Scientific Ontology & Research Memory',
    description: 'Maintains project-wide long-term memory, links ontological concepts across runs, identifies analogous mechanisms, and enriches agent problem spaces.',
    state: 'IDLE',
    currentTask: 'Knowledge graph synchronized.',
    progress: 100,
    color: '#DBC9A0',
    accentColor: '#EAB308',
    workstationPos: [0, 0, -5], // Center rear
    capabilities: [
      'Knowledge Graph Traversal',
      'Cross-Run Research Memory',
      'Reaction Class Ontology',
      'Analogue Retrieval',
      'Missing Context Detection'
    ],
    tools: [
      { name: 'NeoChems Graph Ontology', status: 'CONNECTED' },
      { name: 'ChEMBL Semantic Store', status: 'CONNECTED' },
      { name: 'Vector Knowledge Store', status: 'CONNECTED' }
    ],
    memorySummary: [
      'Knowledge nodes active: 82,400 concepts.',
      'Connected to analgesics & antipyretic class trees.'
    ],
    recentEvents: [
      'Ontology cache initialized.',
      'Semantic embeddings linked.'
    ],
    executionHistory: [
      {
        id: 'exec-know-1',
        runId: 'NC-RUN-2026-08',
        timestamp: '10:42:06',
        objectiveOrInput: 'Identify pharmacological class analogues and historical synthetic precedents.',
        actionTaken: 'Traversed analgesic ontological subtree. Connected acetaminophen to phenacetin and acetanilide historical synthesis data.',
        outputProduced: 'Ontology context packet delivered to Research and Analysis agents.',
        toolsUsed: ['ChEMBL Ontology Traverser', 'NeoChems Semantic Graph'],
        findings: [
          'Acetaminophen is the active metabolite of both phenacetin and acetanilide.',
          'Eliminates nephrotoxicity associated with historical ethoxy ether derivatives.'
        ],
        status: 'SUCCESS'
      }
    ]
  },
  {
    id: 'agent-analysis',
    name: 'Analysis Agent',
    role: 'ANALYSIS',
    symbol: '📊',
    tagline: 'Physicochemical Property & Dataset Analytics',
    description: 'Computes molecular properties, evaluates Lipinski parameters, estimates aqueous solubility, and generates structured comparative analytics.',
    state: 'IDLE',
    currentTask: 'Property calculators online.',
    progress: 100,
    color: '#0D9488',
    accentColor: '#14B8A6',
    workstationPos: [5, 0, 3], // Right front
    capabilities: [
      'Molecular Weight & TPSA Calculation',
      'LogP / LogS Solubility Bounds',
      'Lipinski Rule of 5 Evaluation',
      'Pharmacophore Profiling',
      'Comparative Radar Analytics'
    ],
    tools: [
      { name: 'RDKit Descriptor Calculator', status: 'CONNECTED' },
      { name: 'Chemprop Solubility Model', status: 'CONNECTED' },
      { name: 'ADMET Property Suite', status: 'AVAILABLE' }
    ],
    memorySummary: [
      'Calculated benchmark for acetaminophen: MW 151.16, LogP 0.91.',
      'Target solubility profile: High aqueous bio-absorption.'
    ],
    recentEvents: [
      'Calculator suite loaded.',
      'ADMET models calibrated.'
    ],
    executionHistory: [
      {
        id: 'exec-ana-1',
        runId: 'NC-RUN-2026-08',
        timestamp: '10:42:09',
        objectiveOrInput: 'Compute physicochemical properties and drug-likeness for target SMILES.',
        actionTaken: 'Executed RDKit descriptor calculation suite. Evaluated Lipinski Rule of 5, topological polar surface area (TPSA), and logP.',
        outputProduced: 'MW: 151.16 g/mol, LogP: 0.91, TPSA: 49.33 Å², HBD: 2, HBA: 2.',
        toolsUsed: ['RDKit Descriptor Calculator', 'Lipinski Evaluator'],
        findings: [
          'Zero Lipinski violations.',
          'Favorable oral bioavailability profile with rapid gastrointestinal absorption.'
        ],
        status: 'SUCCESS'
      }
    ]
  },
  {
    id: 'agent-critic',
    name: 'Critic Agent',
    role: 'CRITIC',
    symbol: '⚖️',
    tagline: 'Independent Quality Control & Challenge Layer',
    description: 'Independent oversight agent that challenges weak conclusions, detects contradictory assumptions, rejects poor yields or harsh conditions, and triggers replanning.',
    state: 'IDLE',
    currentTask: 'Review protocol active.',
    progress: 100,
    color: '#C1847B',
    accentColor: '#EF4444',
    workstationPos: [0, 0, 5], // Center front
    capabilities: [
      'Adversarial Reasoning Review',
      'Contradiction Detection',
      'Yield & Regioselectivity Challenge',
      'Replanning Directive Emission',
      'Zero-False-Claim Verification'
    ],
    tools: [
      { name: 'Adversarial Review Engine', status: 'CONNECTED' },
      { name: 'Regioselectivity Evaluator', status: 'CONNECTED' },
      { name: 'Audit Trail Verifier', status: 'CONNECTED' }
    ],
    memorySummary: [
      'Flagged: Direct nitration of phenol produces unwanted ortho-isomer (2-nitrophenol).',
      'Approved: One-pot reduction & N-acetylation from commercial 4-aminophenol.'
    ],
    recentEvents: [
      'Critic layer standing by.',
      'Adversarial test rules active.'
    ],
    executionHistory: [
      {
        id: 'exec-crit-1',
        runId: 'NC-RUN-2026-08',
        timestamp: '10:42:15',
        objectiveOrInput: 'Adversarial audit of Route B (nitration of phenol to 4-nitrophenol).',
        actionTaken: 'Analyzed electrophilic aromatic substitution regioselectivity. Determined ortho/para ratio of 1.5:1 yields severe 2-nitrophenol waste (65% loss) and requires hazardous steam distillation.',
        outputProduced: 'REJECTION DIRECTIVE emitted to Orchestrator. Requested replan targeting Route A.',
        toolsUsed: ['Regioselectivity Auditor', 'Atom Economy Calculator'],
        findings: [
          'Route B is economically and environmentally unacceptable on pilot scale.',
          'Emitted mandatory replan directive.'
        ],
        status: 'FLAGGED'
      },
      {
        id: 'exec-crit-2',
        runId: 'NC-RUN-2026-08',
        timestamp: '10:42:22',
        objectiveOrInput: 'Final audit of revised Route A (4-aminophenol acetylation).',
        actionTaken: 'Inspected atom economy, precursor commercial availability (CAS 123-30-8), and absence of heavy metal catalysts.',
        outputProduced: 'FINAL APPROVAL CERTIFICATE. Zero false claims verified.',
        toolsUsed: ['Audit Trail Verifier', 'Final Approval Signer'],
        findings: [
          'Route A meets green chemistry standards (88% isolated yield).',
          'Audit verified.'
        ],
        status: 'SUCCESS'
      }
    ]
  }
];

export const SAMPLE_RESULTS: Record<string, StructuredResult> = {
  paracetamol: {
    targetName: 'Acetaminophen (Paracetamol)',
    smiles: 'CC(=O)Nc1ccc(O)cc1',
    summary: 'A validated retrosynthetic route starting from 4-aminophenol via selective N-acetylation with acetic anhydride under mild aqueous conditions (88% yield, high atom economy). Adversarially inspected and cleared of hazardous nitration routes.',
    routes: [
      {
        id: 'route-optimal',
        title: 'Route A: Direct Catalytic N-Acetylation (Approved)',
        confidence: 96.5,
        stepsCount: 1,
        startingMaterials: ['4-Aminophenol (CAS 123-30-8)', 'Acetic Anhydride (CAS 108-24-7)'],
        disconnections: ['C(sp²)-N Amide Disconnection', 'Selective Acylation'],
        status: 'VALIDATED',
        criticVerdict: 'Approved with zero reservations. Chemoselective for aromatic amine over phenolic hydroxyl in aqueous medium.',
        steps: [
          {
            stepNumber: 1,
            transformation: 'Selective N-Acylation of 4-Aminophenol',
            reactants: ['4-Aminophenol', 'Acetic Anhydride'],
            product: 'Acetaminophen (Paracetamol)',
            reagents: 'H2O / NaOAc buffer',
            conditions: '60°C, 30 min, atmospheric pressure',
            yield: '88% - 92%',
            feasibility: 98,
            validationStatus: 'VERIFIED',
            notes: 'High chemoselectivity: amine nucleophilicity dominates in weakly acidic to neutral aqueous buffer, avoiding O-acetylation.'
          }
        ]
      },
      {
        id: 'route-alternative',
        title: 'Route B: Direct Phenol Nitration Followed by Reduction (Rejected by Critic)',
        confidence: 42.0,
        stepsCount: 2,
        startingMaterials: ['Phenol', 'HNO3 / H2SO4'],
        disconnections: ['Electrophilic Aromatic Substitution (C-NO2)', 'Catalytic Hydrogenation'],
        status: 'REJECTED',
        criticVerdict: 'Rejected by Critic Agent: Nitration of phenol suffers from poor regioselectivity (ortho/para ratio ~1.5:1) requiring tedious steam distillation, plus high exothermic hazard.',
        steps: [
          {
            stepNumber: 1,
            transformation: 'Nitration of Phenol to 4-Nitrophenol',
            reactants: ['Phenol', 'Dilute HNO3'],
            product: '4-Nitrophenol + 2-Nitrophenol',
            reagents: 'H2SO4 catalyst',
            conditions: '0°C - 20°C',
            yield: '35% (para isomer isolated)',
            feasibility: 45,
            validationStatus: 'REJECTED',
            notes: 'Severe regioselectivity issue. Critic rejected pathway in favor of commercial 4-aminophenol feedstock.'
          }
        ]
      }
    ],
    properties: {
      formula: 'C8H9NO2',
      molecularWeight: 151.16,
      logP: 0.91,
      tpsa: 49.33,
      hbd: 2,
      hba: 2,
      rotatableBonds: 1,
      solubility: 'High aqueous solubility',
      solubilityValue: '14.0 mg/mL at 25°C',
      drugLikeness: 'High'
    },
    evidence: [
      {
        id: 'ev-1',
        title: 'Selective N-acetylation of aminophenols under aqueous buffered conditions',
        authors: 'Morse, H. N.',
        source: 'Berichte der deutschen chemischen Gesellschaft',
        year: 1878,
        doi: '10.1002/cber.18780110158',
        relevance: 'Foundational synthesis establishing chemoselective N-acylation over O-acylation.',
        confidenceScore: 0.98,
        verified: true
      },
      {
        id: 'ev-2',
        title: 'Industrial Synthesis and Crystallization Kinetics of Acetaminophen',
        authors: 'Ellis, F. et al.',
        source: 'Organic Process Research & Development',
        year: 2021,
        doi: '10.1021/acs.oprd.1c00245',
        relevance: 'Modern flow chemistry validation demonstrating 94% yield with zero organic solvent waste.',
        confidenceScore: 0.97,
        verified: true
      }
    ],
    criticNotes: [
      'Replanning round 1: Critic identified isomer separation barrier on Route B.',
      'Orchestrator successfully re-routed synthesis to single-step buffered N-acylation (Route A).',
      'Zero hazardous intermediates, zero toxic transition-metal catalysts required.'
    ],
    validationPassed: true,
    completionTime: '4.2s'
  },
  ibuprofen: {
    targetName: 'Ibuprofen (2-(4-isobutylphenyl)propanoic acid)',
    smiles: 'CC(C)Cc1ccc(C(C)C(=O)O)cc1',
    summary: 'A modern atom-economic BHC green synthesis route involving 3 catalytic steps from isobutylbenzene: Friedel-Crafts acylation, catalytic reduction, and carbonylation (99% atom economy). Cleared by Validation Agent with zero hazardous wastes.',
    routes: [
      {
        id: 'route-bhc-green',
        title: 'Route A: Boots-Hoechst-Celanese (BHC) Green Catalytic Process',
        confidence: 94.8,
        stepsCount: 3,
        startingMaterials: ['Isobutylbenzene', 'Acetic Anhydride', 'CO'],
        disconnections: ['C-C Carbonylation', 'Benzylic Reduction'],
        status: 'VALIDATED',
        criticVerdict: 'Approved: 77% overall chemical yield, 99% atom utilization using recyclable HF catalyst and Pd carbonylation.',
        steps: [
          {
            stepNumber: 1,
            transformation: 'Friedel-Crafts Acylation',
            reactants: ['Isobutylbenzene', 'Acetic Anhydride'],
            product: '4-Isobutylacetophenone',
            reagents: 'HF (anhydrous, recyclable)',
            conditions: '80°C, 1 hr',
            yield: '90%',
            feasibility: 96,
            validationStatus: 'VERIFIED'
          },
          {
            stepNumber: 2,
            transformation: 'Catalytic Hydrogenation',
            reactants: ['4-Isobutylacetophenone', 'H2'],
            product: '1-(4-Isobutylphenyl)ethanol',
            reagents: 'Raney Ni catalyst',
            conditions: '25°C, 30 psi H2',
            yield: '98%',
            feasibility: 99,
            validationStatus: 'VERIFIED'
          },
          {
            stepNumber: 3,
            transformation: 'Pd-Catalyzed Carbonylation',
            reactants: ['1-(4-Isobutylphenyl)ethanol', 'CO', 'H2O'],
            product: 'Ibuprofen',
            reagents: 'PdCl2(PPh3)2 catalyst',
            conditions: '130°C, 500 psi CO',
            yield: '96%',
            feasibility: 92,
            validationStatus: 'VERIFIED'
          }
        ]
      }
    ],
    properties: {
      formula: 'C13H18O2',
      molecularWeight: 206.28,
      logP: 3.50,
      tpsa: 37.30,
      hbd: 1,
      hba: 2,
      rotatableBonds: 4,
      solubility: 'Sparingly soluble in water',
      solubilityValue: '0.021 mg/mL at 20°C',
      drugLikeness: 'High'
    },
    evidence: [
      {
        id: 'ev-ib-1',
        title: 'The BHC Company Ibuprofen Process: A Model for Green Chemistry',
        authors: 'Cann, M. C. & Connelly, M. E.',
        source: 'Real-World Cases in Green Chemistry',
        year: 2000,
        doi: '10.1021/bk-2000-0764.ch002',
        relevance: 'Presidential Green Chemistry Award winner showing replacement of 6-step stoichiometric Boots route.',
        confidenceScore: 0.99,
        verified: true
      }
    ],
    criticNotes: [
      'Critic verified absence of stoichiometric chromium/aluminum waste.',
      'Validation confirmed compliance with international pharmacopeia monograph standards.'
    ],
    validationPassed: true,
    completionTime: '5.1s'
  }
};
