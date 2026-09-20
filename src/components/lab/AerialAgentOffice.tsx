"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useRuntime } from "@/lib/runtime/RuntimeContext";
import { Agent, AgentRole } from "@/lib/runtime/types";

interface AerialAgentOfficeProps {
  isCompact?: boolean;
}

type CameraPreset = "director" | "orchestrator" | "synthesis" | "qc" | "plan" | "cinematic";

export function AerialAgentOffice({ isCompact = false }: AerialAgentOfficeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    agents,
    selectedAgentId,
    selectAgent,
    chatWithAgent,
    activeCommunication,
    currentRun,
  } = useRuntime();

  const [hoveredAgent, setHoveredAgent] = useState<Agent | null>(null);
  const [activePreset, setActivePreset] = useState<CameraPreset>("director");
  const [isCinemaFraming, setIsCinemaFraming] = useState<boolean>(false);
  const [isAutoDrifting, setIsAutoDrifting] = useState<boolean>(false);

  // Camera target vector refs
  const cameraTargetRef = useRef<{
    pos: THREE.Vector3;
    lookAt: THREE.Vector3;
  }>({
    pos: new THREE.Vector3(20, 19, 21),
    lookAt: new THREE.Vector3(0, 1.2, 0),
  });

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  // Focus camera when agent is selected
  useEffect(() => {
    if (selectedAgent) {
      const [x, y, z] = selectedAgent.workstationPos;
      cameraTargetRef.current = {
        pos: new THREE.Vector3(x + 4.8, 6.2, z + 5.8),
        lookAt: new THREE.Vector3(x, 1.4, z),
      };
      setIsAutoDrifting(false);
    }
  }, [selectedAgent]);

  const handlePresetSelect = useCallback((preset: CameraPreset) => {
    setActivePreset(preset);
    if (preset === "cinematic") {
      setIsAutoDrifting(true);
      return;
    }

    setIsAutoDrifting(false);

    if (preset === "director") {
      cameraTargetRef.current = {
        pos: new THREE.Vector3(20, 19, 21),
        lookAt: new THREE.Vector3(0, 1.2, 0),
      };
    } else if (preset === "orchestrator") {
      cameraTargetRef.current = {
        pos: new THREE.Vector3(0, 7.5, 9.5),
        lookAt: new THREE.Vector3(0, 1.6, 0),
      };
    } else if (preset === "synthesis") {
      cameraTargetRef.current = {
        pos: new THREE.Vector3(10.5, 6.8, 1.2),
        lookAt: new THREE.Vector3(4.8, 1.5, -3.2),
      };
    } else if (preset === "qc") {
      cameraTargetRef.current = {
        pos: new THREE.Vector3(-1.5, 6.2, 11.5),
        lookAt: new THREE.Vector3(0, 1.6, 5.2),
      };
    } else if (preset === "plan") {
      cameraTargetRef.current = {
        pos: new THREE.Vector3(0.01, 30, 0.01),
        lookAt: new THREE.Vector3(0, 0, 0),
      };
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup — Warm Vintage Paper Studio Palette
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf2efe6); // --color-beige-bg warm paper tone
    scene.fog = new THREE.FogExp2(0xf2efe6, 0.018);

    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.copy(cameraTargetRef.current.pos);
    const currentLookAt = cameraTargetRef.current.lookAt.clone();
    camera.lookAt(currentLookAt);

    // 2. Renderer Setup — ACES Filmic Tone Mapping & High-Precision Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    // 3. Cinematic Architectural Lighting Rig
    // Ambient fill (warm ceiling bounce)
    const ambientLight = new THREE.AmbientLight(0xfefbf4, 1.25);
    scene.add(ambientLight);

    // Key studio sun (sharp, high-angle warm sunlight)
    const keySun = new THREE.DirectionalLight(0xfffaee, 2.0);
    keySun.position.set(18, 30, 15);
    keySun.castShadow = true;
    keySun.shadow.mapSize.width = 2048;
    keySun.shadow.mapSize.height = 2048;
    keySun.shadow.camera.near = 1;
    keySun.shadow.camera.far = 80;
    keySun.shadow.bias = -0.0002;
    keySun.shadow.radius = 2.0;

    const shadowDist = 18;
    keySun.shadow.camera.left = -shadowDist;
    keySun.shadow.camera.right = shadowDist;
    keySun.shadow.camera.top = shadowDist;
    keySun.shadow.camera.bottom = -shadowDist;
    scene.add(keySun);

    // Cool skylight fill from opposite side
    const skyFill = new THREE.DirectionalLight(0xdce5ed, 0.7);
    skyFill.position.set(-16, 20, -14);
    scene.add(skyFill);

    // Warm architectural bounce light from travertine floor
    const floorBounce = new THREE.DirectionalLight(0xf4ebdd, 0.5);
    floorBounce.position.set(0, -5, 0);
    scene.add(floorBounce);

    // Center focal amber glow
    const centerGlow = new THREE.PointLight(0xe57d25, 2.4, 28);
    centerGlow.position.set(0, 3.8, 0);
    scene.add(centerGlow);

    // 4. Architectural Pavilion Structure
    // Main circular travertine/limestone podium
    const platformGeo = new THREE.CylinderGeometry(15.5, 16.2, 0.7, 64);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0xe6e2d6, // Warm travertine stone
      roughness: 0.88,
      metalness: 0.05,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.35;
    platform.receiveShadow = true;
    scene.add(platform);

    // Outer brushed brass inlay rim
    const brassRingGeo = new THREE.TorusGeometry(15.5, 0.07, 16, 64);
    const brassRingMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
    });
    const brassRing = new THREE.Mesh(brassRingGeo, brassRingMat);
    brassRing.rotation.x = Math.PI / 2;
    brassRing.position.y = 0.01;
    scene.add(brassRing);

    // Multi-tiered sunken central rotunda (amphitheater conversation pit)
    const tiers = [
      { rOuter: 4.8, rInner: 4.6, h: 0.08, col: 0xdfdad0 },
      { rOuter: 3.8, rInner: 3.6, h: 0.16, col: 0xd8d2c6 },
      { rOuter: 2.8, rInner: 2.6, h: 0.24, col: 0xd0c9bc },
    ];

    tiers.forEach((t) => {
      const ringGeo = new THREE.RingGeometry(t.rInner, t.rOuter, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.8,
        roughness: 0.3,
        side: THREE.DoubleSide,
      });
      const rimMesh = new THREE.Mesh(ringGeo, ringMat);
      rimMesh.rotation.x = -Math.PI / 2;
      rimMesh.position.y = 0.02;
      scene.add(rimMesh);

      const stepGeo = new THREE.CylinderGeometry(t.rOuter, t.rOuter, t.h, 48);
      const stepMat = new THREE.MeshStandardMaterial({
        color: t.col,
        roughness: 0.85,
      });
      const step = new THREE.Mesh(stepGeo, stepMat);
      step.position.y = -t.h / 2;
      step.receiveShadow = true;
      scene.add(step);
    });

    // Colonnade of Architectural Louvers / Fins (casting rhythmic cinema shadows)
    const louverGroup = new THREE.Group();
    const louverCount = 14;
    const louverArcRadius = 15.2;
    const louverGeo = new THREE.BoxGeometry(0.3, 5.5, 1.2);
    const louverMat = new THREE.MeshStandardMaterial({
      color: 0xded9cc,
      roughness: 0.82,
      metalness: 0.08,
    });

    for (let i = 0; i < louverCount; i++) {
      const angle = (Math.PI * 0.75) + (i / (louverCount - 1)) * (Math.PI * 0.9);
      const lx = Math.cos(angle) * louverArcRadius;
      const lz = Math.sin(angle) * louverArcRadius;
      const louver = new THREE.Mesh(louverGeo, louverMat);
      louver.position.set(lx, 2.75, lz);
      louver.rotation.y = -angle + Math.PI / 4;
      louver.castShadow = true;
      louver.receiveShadow = true;
      louverGroup.add(louver);
    }
    scene.add(louverGroup);

    // Architectural Technical Drafting Grid Lines
    const grid = new THREE.GridHelper(30, 30, 0xc8c3b5, 0xe2ded3);
    grid.position.y = 0.012;
    scene.add(grid);

    // Inlaid concentric drafting arcs & rings
    const coreRingGeo = new THREE.RingGeometry(2.7, 2.82, 64);
    const coreRingMat = new THREE.MeshBasicMaterial({
      color: 0xe57d25,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const coreRing = new THREE.Mesh(coreRingGeo, coreRingMat);
    coreRing.rotation.x = -Math.PI / 2;
    coreRing.position.y = 0.025;
    scene.add(coreRing);

    const outerRingGeo = new THREE.RingGeometry(9.4, 9.48, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xa8a395,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.025;
    scene.add(outerRing);

    // Radial Brass Inlaid Conduits from Center to Each Agent
    const radialConduitsGroup = new THREE.Group();
    agents.forEach((ag) => {
      const [ax, , az] = ag.workstationPos;
      const start = new THREE.Vector3(0, 0.015, 0);
      const end = new THREE.Vector3(ax, 0.015, az);
      const dist = start.distanceTo(end);

      const conduitGeo = new THREE.PlaneGeometry(0.12, dist);
      const conduitMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.8,
        roughness: 0.3,
        side: THREE.DoubleSide,
      });
      const conduit = new THREE.Mesh(conduitGeo, conduitMat);
      conduit.position.set((start.x + end.x) / 2, 0.016, (start.z + end.z) / 2);
      conduit.rotation.x = -Math.PI / 2;
      conduit.rotation.z = -Math.atan2(end.x - start.x, end.z - start.z);
      radialConduitsGroup.add(conduit);
    });
    scene.add(radialConduitsGroup);

    // Central Floating Holographic Chemical Apparatus (Geodesic Molecule Lattice)
    const centralHoloGroup = new THREE.Group();
    centralHoloGroup.position.set(0, 3.8, 0);

    // 1. Fullerene geodesic cage
    const cageGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const cageMat = new THREE.MeshStandardMaterial({
      color: 0xe57d25,
      wireframe: true,
      emissive: 0xe57d25,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.65,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    centralHoloGroup.add(cageMesh);

    // 2. Inner core octahedron
    const innerCoreGeo = new THREE.OctahedronGeometry(0.85);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0x0254ec,
      emissive: 0x0254ec,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    centralHoloGroup.add(innerCoreMesh);

    // 3. Orbital atom electron rings
    const ring1Geo = new THREE.TorusGeometry(2.1, 0.02, 16, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xe57d25, transparent: true, opacity: 0.75 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    centralHoloGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.1, 0.02, 16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x0254ec, transparent: true, opacity: 0.65 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 3;
    centralHoloGroup.add(ring2);

    scene.add(centralHoloGroup);

    // 5. Cinematic Atmospheric Golden Dust Motes
    const particleCount = 130;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 26;
      particlePositions[i * 3 + 1] = Math.random() * 9 + 0.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 26;

      particleSpeeds[i * 3] = (Math.random() - 0.5) * 0.005;
      particleSpeeds[i * 3 + 1] = Math.random() * 0.008 + 0.002;
      particleSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffe2b8,
      size: 0.12,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Sculptural Agent Workstations (Dieter Rams Minimalist Architectural Furniture)
    const agentMeshes: {
      group: THREE.Group;
      agent: Agent;
      beaconMesh: THREE.Mesh;
      haloMesh: THREE.Mesh;
      deskLampLight: THREE.SpotLight;
      pointLight: THREE.PointLight;
      deskRimMesh: THREE.Mesh;
    }[] = [];

    const interactiveObjects: THREE.Object3D[] = [];

    agents.forEach((ag) => {
      const group = new THREE.Group();
      group.position.set(ag.workstationPos[0], ag.workstationPos[1], ag.workstationPos[2]);

      // Calculate orientation facing central rotunda (0, 0, 0)
      const angleToCenter = Math.atan2(-ag.workstationPos[0], -ag.workstationPos[2]);
      group.rotation.y = angleToCenter;

      // Solid Travertine Pedestal Base
      const baseGeo = new THREE.CylinderGeometry(1.4, 1.55, 0.45, 32);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0xdcd7ca,
        roughness: 0.8,
        metalness: 0.08,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.22;
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);

      // Inlaid Pedestal Brass Trim Ring
      const rimGeo = new THREE.TorusGeometry(1.42, 0.025, 16, 32);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.8,
        roughness: 0.3,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.45;
      group.add(rim);

      // Cantilevered Architectural Desk in Deep Charcoal Matte
      const deskTopGeo = new THREE.BoxGeometry(1.8, 0.12, 0.95);
      const deskTopMat = new THREE.MeshStandardMaterial({
        color: 0x1f2227, // Matte obsidian charcoal
        roughness: 0.45,
        metalness: 0.2,
      });
      const deskTop = new THREE.Mesh(deskTopGeo, deskTopMat);
      deskTop.position.set(0, 0.92, 0.2);
      deskTop.castShadow = true;
      deskTop.receiveShadow = true;
      group.add(deskTop);

      // Desk illuminated edge accent strip
      const edgeStripGeo = new THREE.BoxGeometry(1.82, 0.02, 0.04);
      const edgeStripMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(ag.accentColor),
        transparent: true,
        opacity: 0.8,
      });
      const edgeStrip = new THREE.Mesh(edgeStripGeo, edgeStripMat);
      edgeStrip.position.set(0, 0.92, -0.28);
      group.add(edgeStrip);

      // Slender Brushed Bronze Desk Legs
      const legMat = new THREE.MeshStandardMaterial({
        color: 0x8a7d65,
        metalness: 0.8,
        roughness: 0.35,
      });
      const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.9, 12);

      const leg1 = new THREE.Mesh(legGeo, legMat);
      leg1.position.set(0.75, 0.45, 0.55);
      leg1.castShadow = true;
      group.add(leg1);

      const leg2 = new THREE.Mesh(legGeo, legMat);
      leg2.position.set(-0.75, 0.45, 0.55);
      leg2.castShadow = true;
      group.add(leg2);

      const leg3 = new THREE.Mesh(legGeo, legMat);
      leg3.position.set(0.75, 0.45, -0.15);
      leg3.castShadow = true;
      group.add(leg3);

      const leg4 = new THREE.Mesh(legGeo, legMat);
      leg4.position.set(-0.75, 0.45, -0.15);
      leg4.castShadow = true;
      group.add(leg4);

      // Curved Brass Gooseneck Desk Lamp with downward pool light
      const lampBaseGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16);
      const lampBaseMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
      const lampBase = new THREE.Mesh(lampBaseGeo, lampBaseMat);
      lampBase.position.set(0.65, 0.99, 0.45);
      group.add(lampBase);

      const lampArmGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8);
      const lampArm = new THREE.Mesh(lampArmGeo, lampBaseMat);
      lampArm.position.set(0.65, 1.22, 0.45);
      lampArm.rotation.z = -0.25;
      group.add(lampArm);

      const lampHeadGeo = new THREE.ConeGeometry(0.1, 0.14, 16);
      const lampHead = new THREE.Mesh(lampHeadGeo, lampBaseMat);
      lampHead.position.set(0.55, 1.42, 0.45);
      lampHead.rotation.z = Math.PI * 0.75;
      group.add(lampHead);

      // Localized spot pool on desk
      const spotLight = new THREE.SpotLight(0xfffae8, 1.6, 3.5, Math.PI / 4, 0.4, 1.2);
      spotLight.position.set(0.55, 1.4, 0.45);
      spotLight.target.position.set(0.2, 0.95, 0.2);
      group.add(spotLight);
      group.add(spotLight.target);

      // Translucent Laboratory Workspace Glass Partition
      const partitionGeo = new THREE.BoxGeometry(1.6, 0.65, 0.03);
      const partitionMat = new THREE.MeshPhysicalMaterial({
        color: 0xf5f3ea,
        transmission: 0.75,
        opacity: 0.85,
        transparent: true,
        roughness: 0.25,
        ior: 1.45,
      });
      const partition = new THREE.Mesh(partitionGeo, partitionMat);
      partition.position.set(0, 1.35, 0.65);
      group.add(partition);

      // Sculptural Floating Agent Avatar Hologram
      let avatarGeo: THREE.BufferGeometry;
      if (ag.role === "ORCHESTRATOR") {
        avatarGeo = new THREE.OctahedronGeometry(0.55);
      } else if (ag.role === "RETROSYNTHESIS") {
        avatarGeo = new THREE.IcosahedronGeometry(0.52);
      } else if (ag.role === "RESEARCH") {
        avatarGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.75, 16);
      } else if (ag.role === "VALIDATION") {
        avatarGeo = new THREE.DodecahedronGeometry(0.5);
      } else if (ag.role === "CRITIC") {
        avatarGeo = new THREE.TetrahedronGeometry(0.58);
      } else if (ag.role === "ANALYSIS") {
        avatarGeo = new THREE.TorusGeometry(0.4, 0.16, 16, 32);
      } else {
        avatarGeo = new THREE.TorusKnotGeometry(0.32, 0.1, 48, 12);
      }

      const avatarMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(ag.color),
        emissive: new THREE.Color(ag.accentColor),
        emissiveIntensity: 0.55,
        roughness: 0.15,
        metalness: 0.75,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
      });
      const avatar = new THREE.Mesh(avatarGeo, avatarMat);
      avatar.position.set(0, 2.15, 0.1);
      avatar.castShadow = true;
      group.add(avatar);

      // Gyroscopic Orbital Ring
      const haloGeo = new THREE.TorusGeometry(0.88, 0.024, 16, 48);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(ag.accentColor),
        transparent: true,
        opacity: 0.8,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(0, 2.15, 0.1);
      halo.rotation.x = Math.PI / 3;
      group.add(halo);

      // Workstation Point Light
      const pLight = new THREE.PointLight(new THREE.Color(ag.accentColor), 1.2, 5.5);
      pLight.position.set(0, 2.35, 0.1);
      group.add(pLight);

      // Invisible Raycasting Hitbox for Clicking
      const hitGeo = new THREE.CylinderGeometry(1.65, 1.65, 3.6, 16);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitbox = new THREE.Mesh(hitGeo, hitMat);
      hitbox.position.y = 1.8;
      hitbox.userData = { agent: ag };
      group.add(hitbox);
      interactiveObjects.push(hitbox);

      scene.add(group);

      agentMeshes.push({
        group,
        agent: ag,
        beaconMesh: avatar,
        haloMesh: halo,
        deskLampLight: spotLight,
        pointLight: pLight,
        deskRimMesh: edgeStrip,
      });
    });

    // 7. Dynamic Communication Energy Laser Arc
    let beamLine: THREE.Line | null = null;
    let pulseParticles: THREE.Points | null = null;

    // 8. Interaction & Camera Orbit Controls
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      setIsAutoDrifting(false);
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;

        const offset = camera.position.clone().sub(currentLookAt);
        let radius = offset.length();
        let theta = Math.atan2(offset.x, offset.z) - deltaX * 0.005;
        let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius))) + deltaY * 0.005;
        phi = Math.max(0.22, Math.min(1.48, phi));

        camera.position.x = currentLookAt.x + radius * Math.sin(phi) * Math.sin(theta);
        camera.position.y = currentLookAt.y + radius * Math.cos(phi);
        camera.position.z = currentLookAt.z + radius * Math.sin(phi) * Math.cos(theta);
        camera.lookAt(currentLookAt);

        cameraTargetRef.current.pos.copy(camera.position);
        prevMousePos = { x: e.clientX, y: e.clientY };
      } else {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveObjects);
        if (intersects.length > 0) {
          const target = intersects[0].object.userData.agent as Agent;
          setHoveredAgent(target);
          container.style.cursor = "pointer";
        } else {
          setHoveredAgent(null);
          container.style.cursor = "grab";
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects);
      if (intersects.length > 0) {
        const target = intersects[0].object.userData.agent as Agent;
        selectAgent(target.id);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setIsAutoDrifting(false);
      const offset = camera.position.clone().sub(currentLookAt);
      let radius = offset.length();
      radius = Math.max(10, Math.min(48, radius + e.deltaY * 0.022));
      offset.setLength(radius);
      camera.position.copy(currentLookAt).add(offset);
      cameraTargetRef.current.pos.copy(camera.position);
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("click", onClick);
    container.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);

    // 9. Master 60FPS Cinematic Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Cinematic Drone Flythrough Orbit Mode
      if (isAutoDrifting && !isDragging) {
        const driftRadius = 24;
        const driftHeight = 16 + Math.sin(elapsed * 0.25) * 2.5;
        const driftAngle = elapsed * 0.08;
        cameraTargetRef.current.pos.set(
          Math.sin(driftAngle) * driftRadius,
          driftHeight,
          Math.cos(driftAngle) * driftRadius
        );
        cameraTargetRef.current.lookAt.set(0, 1.4, 0);
      }

      // Smooth camera interpolation toward target (cinematic spring easing)
      if (!isDragging) {
        camera.position.lerp(cameraTargetRef.current.pos, 0.045);
        currentLookAt.lerp(cameraTargetRef.current.lookAt, 0.045);
        camera.lookAt(currentLookAt);
      }

      // Slow architectural drafting ring rotation
      coreRing.rotation.z = elapsed * 0.05;
      outerRing.rotation.z = -elapsed * 0.025;

      // Rotate Central Holographic Molecular Apparatus
      centralHoloGroup.rotation.y = elapsed * 0.25;
      centralHoloGroup.position.y = 3.8 + Math.sin(elapsed * 1.4) * 0.12;
      cageMesh.rotation.x = elapsed * 0.15;
      innerCoreMesh.rotation.z = -elapsed * 0.35;
      ring1.rotation.z = elapsed * 0.45;
      ring2.rotation.x = -elapsed * 0.35;

      // Animate Sunlight Dust Motes
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particleSpeeds[i * 3];
        positions[i * 3 + 1] += particleSpeeds[i * 3 + 1];
        positions[i * 3 + 2] += particleSpeeds[i * 3 + 2];

        // Wrap around bounding box
        if (positions[i * 3 + 1] > 10) positions[i * 3 + 1] = 0.5;
        if (positions[i * 3] > 14) positions[i * 3] = -14;
        if (positions[i * 3] < -14) positions[i * 3] = 14;
        if (positions[i * 3 + 2] > 14) positions[i * 3 + 2] = -14;
        if (positions[i * 3 + 2] < -14) positions[i * 3 + 2] = 14;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Animate Agent Workstations & Holograms
      agentMeshes.forEach(({ agent, beaconMesh, haloMesh, pointLight, deskRimMesh }) => {
        const liveAgent = agents.find((a) => a.id === agent.id) || agent;
        const isWorking = liveAgent.state === "WORKING" || liveAgent.state === "VALIDATING";
        const isSelected = selectedAgentId === agent.id;
        const isHovered = hoveredAgent?.id === agent.id;

        const speed = isWorking ? 3.2 : 0.85;
        beaconMesh.rotation.y = elapsed * speed;
        beaconMesh.rotation.x = Math.sin(elapsed * 1.6) * 0.12;
        beaconMesh.position.y = 2.15 + Math.sin(elapsed * (isWorking ? 4.5 : 2.2)) * (isWorking ? 0.14 : 0.06);

        haloMesh.rotation.z = elapsed * (isWorking ? 2.8 : 0.9);
        haloMesh.rotation.x = Math.PI / 3 + Math.sin(elapsed * 1.4) * 0.08;

        const mat = beaconMesh.material as THREE.MeshPhysicalMaterial;
        const rimMat = deskRimMesh.material as THREE.MeshBasicMaterial;

        if (isWorking) {
          mat.emissiveIntensity = 0.95 + Math.sin(elapsed * 8) * 0.35;
          pointLight.intensity = 2.2;
          rimMat.opacity = 1.0;
        } else if (isSelected || isHovered) {
          mat.emissiveIntensity = 0.9;
          pointLight.intensity = 1.8;
          rimMat.opacity = 1.0;
        } else {
          mat.emissiveIntensity = 0.35;
          pointLight.intensity = 0.75;
          rimMat.opacity = 0.4;
        }
      });

      // Render Communication Laser Arc
      if (activeCommunication) {
        const fromAg = agents.find((a) => a.role === activeCommunication.from);
        const toAg = agents.find((a) => a.role === activeCommunication.to);
        if (fromAg && toAg) {
          const start = new THREE.Vector3(fromAg.workstationPos[0], 2.2, fromAg.workstationPos[2]);
          const end = new THREE.Vector3(toAg.workstationPos[0], 2.2, toAg.workstationPos[2]);
          const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5).add(new THREE.Vector3(0, 3.2, 0));

          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          const points = curve.getPoints(36);

          if (!beamLine) {
            const beamGeo = new THREE.BufferGeometry().setFromPoints(points);
            const beamMat = new THREE.LineBasicMaterial({ color: 0xe57d25, linewidth: 3 });
            beamLine = new THREE.Line(beamGeo, beamMat);
            scene.add(beamLine);
          } else {
            beamLine.geometry.setFromPoints(points);
            beamLine.visible = true;
          }
        }
      } else if (beamLine) {
        beamLine.visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("click", onClick);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [agents, selectedAgentId, selectAgent, activeCommunication, isAutoDrifting, hoveredAgent]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-[#F2EFE6] rounded-2xl overflow-hidden border border-[#E0DCCF] shadow-xl select-none flex flex-col font-sans">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab" />

      {/* Cinematic Anamorphic Letterbox Bars & Viewfinder Framing (if toggled) */}
      {isCinemaFraming && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between">
          {/* Top Letterbox Bar */}
          <div className="h-12 sm:h-14 bg-black/90 backdrop-blur-sm border-b border-white/10 px-6 flex items-center justify-between text-white/70 font-mono text-[11px]">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-bold text-white tracking-widest uppercase">REC ● 24 FPS</span>
              <span className="text-white/40">|</span>
              <span>LENS: 35mm ANAMORPHIC T1.5</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-white/50">
              <span>SHUTTER: 1/48s</span>
              <span>ISO: 400</span>
              <span>WB: 4800K STUDIO</span>
            </div>
          </div>

          {/* Viewfinder Reticle Target */}
          <div className="self-center flex items-center justify-center opacity-35">
            <div className="w-16 h-16 border border-white/40 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-accent-orange rounded-full" />
            </div>
          </div>

          {/* Bottom Letterbox Bar */}
          <div className="h-12 sm:h-14 bg-black/90 backdrop-blur-sm border-t border-white/10 px-6 flex items-center justify-between text-white/70 font-mono text-[11px]">
            <span className="tracking-widest">ASPECT: 2.39:1 CINEMASCOPE</span>
            <span className="text-accent-orange font-bold">NEOCHEMS ARCHITECTURAL RIG</span>
          </div>
        </div>
      )}

      {/* Studio Top Control Bar (Matching Vintage Paper & Ink Aesthetic) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Studio Brand Pill */}
        <div className="pointer-events-auto px-4 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-[#E0DCCF] shadow-md flex items-center gap-2.5 text-[#0F0F0F]">
          <span className="w-2 h-2 rounded-full bg-[#E57D25] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold">
            NEOCHEMS STUDIO · CINEMATIC 3D
          </span>
        </div>

        {/* Center: Camera Director Presets */}
        <div className="pointer-events-auto hidden md:flex items-center p-1 rounded-xl bg-white/95 backdrop-blur-md border border-[#E0DCCF] shadow-md text-xs font-mono">
          <button
            type="button"
            onClick={() => handlePresetSelect("director")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activePreset === "director"
                ? "bg-[#0F0F0F] text-[#FAF8F2] font-bold shadow-xs"
                : "text-[#5A564C] hover:text-[#0F0F0F]"
            }`}
          >
            Director 35mm
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect("orchestrator")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activePreset === "orchestrator"
                ? "bg-[#0F0F0F] text-[#FAF8F2] font-bold shadow-xs"
                : "text-[#5A564C] hover:text-[#0F0F0F]"
            }`}
          >
            Orchestrator
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect("synthesis")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activePreset === "synthesis"
                ? "bg-[#0F0F0F] text-[#FAF8F2] font-bold shadow-xs"
                : "text-[#5A564C] hover:text-[#0F0F0F]"
            }`}
          >
            Synthesis Bay
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect("qc")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activePreset === "qc"
                ? "bg-[#0F0F0F] text-[#FAF8F2] font-bold shadow-xs"
                : "text-[#5A564C] hover:text-[#0F0F0F]"
            }`}
          >
            Critic QC
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect("plan")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activePreset === "plan"
                ? "bg-[#0F0F0F] text-[#FAF8F2] font-bold shadow-xs"
                : "text-[#5A564C] hover:text-[#0F0F0F]"
            }`}
          >
            Floor Plan
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect("cinematic")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              isAutoDrifting
                ? "bg-[#E57D25] text-white font-bold shadow-xs"
                : "text-[#5A564C] hover:text-[#0F0F0F]"
            }`}
            title="Auto-drifting 360 cinematic drone orbit"
          >
            <span>🎥</span>
            <span>Drone Orbit</span>
          </button>
        </div>

        {/* Right: Mode Toggles */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Cinema Frame Toggle */}
          <button
            type="button"
            onClick={() => setIsCinemaFraming(!isCinemaFraming)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all shadow-md flex items-center gap-1.5 font-bold ${
              isCinemaFraming
                ? "bg-[#0F0F0F] text-[#FAF8F2] border-[#0F0F0F]"
                : "bg-white/95 text-[#0F0F0F] border-[#E0DCCF] hover:bg-[#F0EDE0]"
            }`}
          >
            <span>🎬</span>
            <span>{isCinemaFraming ? "Standard View" : "Cinema Scope"}</span>
          </button>

          {/* Active Dispatch Pulse Indicator */}
          {activeCommunication && (
            <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E57D25] text-[#0F0F0F] font-mono text-xs flex items-center gap-1.5 shadow-md animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#E57D25]" />
              <span className="font-bold">{activeCommunication.from}</span>
              <span>→</span>
              <span className="font-bold">{activeCommunication.to}</span>
            </div>
          )}
        </div>
      </div>

      {/* Selected / Hovered Agent Interactive HUD Card at Bottom Left */}
      {(selectedAgent || hoveredAgent) && (
        <div className="absolute bottom-5 left-5 z-20 pointer-events-auto p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E0DCCF] shadow-2xl max-w-sm transition-all animate-fade-in text-[#0F0F0F]">
          {(() => {
            const ag = selectedAgent || hoveredAgent!;
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-[#F0EDE0] border border-[#E0DCCF]"
                      style={{ color: ag.accentColor }}
                    >
                      {ag.symbol}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-lg leading-tight text-[#0F0F0F]">{ag.name}</h4>
                      <p className="font-mono text-[10px] text-[#5A564C]">{ag.tagline}</p>
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold border"
                    style={{
                      backgroundColor: `${ag.color}15`,
                      borderColor: `${ag.color}40`,
                      color: ag.accentColor,
                    }}
                  >
                    {ag.state}
                  </span>
                </div>

                <p className="text-xs font-body text-[#2B2B2B] line-clamp-2 leading-relaxed">
                  {ag.currentTask || ag.description}
                </p>

                {/* Direct Action Buttons: Chat with Agent & What did it do? */}
                <div className="pt-2.5 border-t border-[#E0DCCF] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => chatWithAgent(ag.role)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-[#E57D25] hover:bg-[#d06e1c] text-white font-mono text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>💬</span>
                    <span>Chat with {ag.name.split(" ")[0]}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectAgent(ag.id)}
                    className="py-1.5 px-3 rounded-lg bg-[#F0EDE0] hover:bg-[#E0DCCF] text-[#0F0F0F] font-mono text-xs transition-colors flex items-center gap-1 font-bold border border-[#E0DCCF]"
                    title="Inspect what this agent did"
                  >
                    <span>📋 What it did</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Quick Agent Workstation Switcher at Bottom Right */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-1.5 p-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E0DCCF] shadow-lg">
        {agents.map((ag) => (
          <button
            key={ag.id}
            type="button"
            onClick={() => selectAgent(ag.id)}
            title={`${ag.name} — Click to glide camera & inspect`}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
              selectedAgentId === ag.id
                ? "bg-[#0F0F0F] text-[#FAF8F2] scale-110 shadow-sm ring-2 ring-[#E57D25]"
                : "hover:bg-[#F0EDE0] text-[#0F0F0F]"
            }`}
          >
            {ag.symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
