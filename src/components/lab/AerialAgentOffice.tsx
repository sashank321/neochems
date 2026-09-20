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
    pos: new THREE.Vector3(21, 18, 22),
    lookAt: new THREE.Vector3(0, 1.4, 0),
  });

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  // Focus camera when agent is selected
  useEffect(() => {
    if (selectedAgent) {
      const [x, y, z] = selectedAgent.workstationPos;
      cameraTargetRef.current = {
        pos: new THREE.Vector3(x + 4.6, 5.8, z + 5.4),
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
        pos: new THREE.Vector3(21, 18, 22),
        lookAt: new THREE.Vector3(0, 1.4, 0),
      };
    } else if (preset === "orchestrator") {
      cameraTargetRef.current = {
        pos: new THREE.Vector3(0, 6.8, 9.2),
        lookAt: new THREE.Vector3(0, 1.5, 0),
      };
    } else if (preset === "synthesis") {
      cameraTargetRef.current = {
        pos: new THREE.Vector3(10.2, 6.2, 1.5),
        lookAt: new THREE.Vector3(5.0, 1.4, -3.0),
      };
    } else if (preset === "qc") {
      cameraTargetRef.current = {
        pos: new THREE.Vector3(-1.8, 5.8, 11.2),
        lookAt: new THREE.Vector3(0, 1.5, 5.2),
      };
    } else if (preset === "plan") {
      cameraTargetRef.current = {
        pos: new THREE.Vector3(0.01, 32, 0.01),
        lookAt: new THREE.Vector3(0, 0, 0),
      };
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup — Warm Vintage Paper Studio Palette
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf2efe6); // warm landing page background
    scene.fog = new THREE.FogExp2(0xf2efe6, 0.016);

    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
    camera.position.copy(cameraTargetRef.current.pos);
    const currentLookAt = cameraTargetRef.current.lookAt.clone();
    camera.lookAt(currentLookAt);

    // 2. High-Precision Physical Renderer
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
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Cinematic Architectural Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xfffaef, 1.3);
    scene.add(ambientLight);

    // Key studio sunlight (sharp warm sun casting long soft architectural shadows)
    const keySun = new THREE.DirectionalLight(0xfff5e4, 2.2);
    keySun.position.set(20, 32, 16);
    keySun.castShadow = true;
    keySun.shadow.mapSize.width = 2048;
    keySun.shadow.mapSize.height = 2048;
    keySun.shadow.camera.near = 1;
    keySun.shadow.camera.far = 85;
    keySun.shadow.bias = -0.0002;
    keySun.shadow.radius = 2.4;

    const shadowDist = 20;
    keySun.shadow.camera.left = -shadowDist;
    keySun.shadow.camera.right = shadowDist;
    keySun.shadow.camera.top = shadowDist;
    keySun.shadow.camera.bottom = -shadowDist;
    scene.add(keySun);

    // Cool architectural skylight fill
    const skyFill = new THREE.DirectionalLight(0xd9e4ee, 0.75);
    skyFill.position.set(-18, 22, -16);
    scene.add(skyFill);

    // Warm floor reflection bounce
    const floorBounce = new THREE.DirectionalLight(0xf5ecde, 0.6);
    floorBounce.position.set(0, -6, 0);
    scene.add(floorBounce);

    // Central core glowing light
    const centerPointLight = new THREE.PointLight(0xe57d25, 2.8, 24);
    centerPointLight.position.set(0, 3.2, 0);
    scene.add(centerPointLight);

    // 4. Architectural Pavilion Platform & Terrazzo Floor
    const platformGeo = new THREE.CylinderGeometry(16.5, 17.2, 0.8, 64);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0xe6e1d4, // Polished warm terrazzo
      roughness: 0.85,
      metalness: 0.08,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.4;
    platform.receiveShadow = true;
    scene.add(platform);

    // Outer double brass inlay rings
    const outerBrass1Geo = new THREE.TorusGeometry(16.5, 0.06, 16, 64);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
    });
    const outerBrass1 = new THREE.Mesh(outerBrass1Geo, brassMat);
    outerBrass1.rotation.x = Math.PI / 2;
    outerBrass1.position.y = 0.01;
    scene.add(outerBrass1);

    const outerBrass2Geo = new THREE.TorusGeometry(15.2, 0.03, 16, 64);
    const outerBrass2 = new THREE.Mesh(outerBrass2Geo, brassMat);
    outerBrass2.rotation.x = Math.PI / 2;
    outerBrass2.position.y = 0.01;
    scene.add(outerBrass2);

    // Sunken Central Conversation Amphitheater (3 stepped tiers)
    const tiers = [
      { rOuter: 5.2, rInner: 5.0, h: 0.1, col: 0xdcd7cb },
      { rOuter: 4.1, rInner: 3.9, h: 0.2, col: 0xd4cfc2 },
      { rOuter: 3.0, rInner: 2.8, h: 0.3, col: 0xcbc5b8 },
    ];

    tiers.forEach((t) => {
      const rimGeo = new THREE.RingGeometry(t.rInner, t.rOuter, 48);
      const rimMesh = new THREE.Mesh(rimGeo, brassMat);
      rimMesh.rotation.x = -Math.PI / 2;
      rimMesh.position.y = 0.02;
      scene.add(rimMesh);

      const stepGeo = new THREE.CylinderGeometry(t.rOuter, t.rOuter, t.h, 48);
      const stepMat = new THREE.MeshStandardMaterial({ color: t.col, roughness: 0.85 });
      const step = new THREE.Mesh(stepGeo, stepMat);
      step.position.y = -t.h / 2;
      step.receiveShadow = true;
      scene.add(step);
    });

    // Radial Brass Inlaid Floor Conduits
    const radialGroup = new THREE.Group();
    agents.forEach((ag) => {
      const [ax, , az] = ag.workstationPos;
      const start = new THREE.Vector3(0, 0.015, 0);
      const end = new THREE.Vector3(ax, 0.015, az);
      const dist = start.distanceTo(end);

      const conduitGeo = new THREE.PlaneGeometry(0.14, dist);
      const conduit = new THREE.Mesh(conduitGeo, brassMat);
      conduit.position.set((start.x + end.x) / 2, 0.016, (start.z + end.z) / 2);
      conduit.rotation.x = -Math.PI / 2;
      conduit.rotation.z = -Math.atan2(end.x - start.x, end.z - start.z);
      radialGroup.add(conduit);
    });
    scene.add(radialGroup);

    // Architectural Drafting Grid Overlay
    const grid = new THREE.GridHelper(32, 32, 0xc7c1b3, 0xe0dcd1);
    grid.position.y = 0.012;
    scene.add(grid);

    // Perimeter Colonnade of Architectural Vertical Louvers
    const louverGroup = new THREE.Group();
    const louverCount = 16;
    const louverRadius = 16.2;
    const louverGeo = new THREE.BoxGeometry(0.35, 6.0, 1.4);
    const louverMat = new THREE.MeshStandardMaterial({
      color: 0xd9d4c6,
      roughness: 0.82,
      metalness: 0.08,
    });

    for (let i = 0; i < louverCount; i++) {
      const angle = Math.PI * 0.7 + (i / (louverCount - 1)) * (Math.PI * 0.95);
      const lx = Math.cos(angle) * louverRadius;
      const lz = Math.sin(angle) * louverRadius;
      const louver = new THREE.Mesh(louverGeo, louverMat);
      louver.position.set(lx, 3.0, lz);
      louver.rotation.y = -angle + Math.PI / 4;
      louver.castShadow = true;
      louver.receiveShadow = true;
      louverGroup.add(louver);
    }
    scene.add(louverGroup);

    // 5. Central Holographic Science Reactor & Molecular Oculus
    const centralReactor = new THREE.Group();
    centralReactor.position.set(0, 0, 0);

    // Base cylindrical plinth with glowing recessed slit
    const reactorBaseGeo = new THREE.CylinderGeometry(2.0, 2.3, 0.45, 48);
    const reactorBaseMat = new THREE.MeshStandardMaterial({ color: 0x222529, roughness: 0.35, metalness: 0.6 });
    const reactorBase = new THREE.Mesh(reactorBaseGeo, reactorBaseMat);
    reactorBase.position.y = 0.22;
    reactorBase.castShadow = true;
    reactorBase.receiveShadow = true;
    centralReactor.add(reactorBase);

    // Glowing core ring on plinth
    const coreSlitGeo = new THREE.CylinderGeometry(1.85, 1.85, 0.08, 48);
    const coreSlitMat = new THREE.MeshBasicMaterial({ color: 0xe57d25 });
    const coreSlit = new THREE.Mesh(coreSlitGeo, coreSlitMat);
    coreSlit.position.y = 0.46;
    centralReactor.add(coreSlit);

    // Translucent laboratory glass containment cylinder
    const glassContainGeo = new THREE.CylinderGeometry(1.7, 1.7, 3.4, 32, 1, true);
    const glassContainMat = new THREE.MeshPhysicalMaterial({
      color: 0xf5f3ea,
      transmission: 0.88,
      opacity: 0.75,
      transparent: true,
      roughness: 0.15,
      ior: 1.5,
    });
    const glassContain = new THREE.Mesh(glassContainGeo, glassContainMat);
    glassContain.position.y = 2.2;
    centralReactor.add(glassContain);

    // Brass top cap collar for reactor
    const topCapGeo = new THREE.CylinderGeometry(1.8, 1.75, 0.2, 32);
    const topCap = new THREE.Mesh(topCapGeo, brassMat);
    topCap.position.y = 3.95;
    centralReactor.add(topCap);

    // Inside Containment: Floating Geodesic Carbon Buckyball Core
    const molecularCoreGroup = new THREE.Group();
    molecularCoreGroup.position.set(0, 2.2, 0);

    // Buckyball wireframe cage
    const buckyGeo = new THREE.IcosahedronGeometry(1.0, 1);
    const buckyMat = new THREE.MeshStandardMaterial({
      color: 0xe57d25,
      wireframe: true,
      emissive: 0xe57d25,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.8,
    });
    const buckyMesh = new THREE.Mesh(buckyGeo, buckyMat);
    molecularCoreGroup.add(buckyMesh);

    // Intricate atom spheres at vertices
    const atomGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const atomOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xe57d25,
      emissive: 0xe57d25,
      emissiveIntensity: 0.8,
    });
    const atomBlueMat = new THREE.MeshStandardMaterial({
      color: 0x0254ec,
      emissive: 0x0254ec,
      emissiveIntensity: 0.8,
    });

    const posAttr = buckyGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const atom = new THREE.Mesh(atomGeo, i % 2 === 0 ? atomOrangeMat : atomBlueMat);
      atom.position.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      molecularCoreGroup.add(atom);
    }

    // Inner glowing octahedral nucleus
    const nucleusGeo = new THREE.OctahedronGeometry(0.48);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x0254ec,
      emissive: 0x0254ec,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.8,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    molecularCoreGroup.add(nucleusMesh);

    // Triple concentric gyroscopic gimbal rings
    const gyro1Geo = new THREE.TorusGeometry(1.35, 0.022, 16, 48);
    const gyro1 = new THREE.Mesh(gyro1Geo, brassMat);
    gyro1.rotation.x = Math.PI / 4;
    molecularCoreGroup.add(gyro1);

    const gyro2Geo = new THREE.TorusGeometry(1.48, 0.022, 16, 48);
    const gyro2 = new THREE.Mesh(gyro2Geo, brassMat);
    gyro2.rotation.y = Math.PI / 3;
    molecularCoreGroup.add(gyro2);

    centralReactor.add(molecularCoreGroup);
    scene.add(centralReactor);

    // 6. Atmospheric Golden Dust Motes
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 28;
      particlePositions[i * 3 + 1] = Math.random() * 10 + 0.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 28;

      particleSpeeds[i * 3] = (Math.random() - 0.5) * 0.006;
      particleSpeeds[i * 3 + 1] = Math.random() * 0.007 + 0.002;
      particleSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.006;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffdfb0,
      size: 0.13,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Architectural Agent Workstations with High-Detail Furniture
    const agentMeshes: {
      group: THREE.Group;
      agent: Agent;
      avatarMesh: THREE.Mesh;
      hudRingMesh: THREE.Mesh;
      pointLight: THREE.PointLight;
      deskRimMesh: THREE.Mesh;
      screenMesh: THREE.Mesh;
    }[] = [];

    const interactiveObjects: THREE.Object3D[] = [];

    agents.forEach((ag) => {
      const group = new THREE.Group();
      group.position.set(ag.workstationPos[0], ag.workstationPos[1], ag.workstationPos[2]);

      // Orient workstation toward central reactor (0, 0, 0)
      const angleToCenter = Math.atan2(-ag.workstationPos[0], -ag.workstationPos[2]);
      group.rotation.y = angleToCenter;

      // Travertine Platform Pedestal
      const pedGeo = new THREE.CylinderGeometry(1.6, 1.75, 0.45, 32);
      const pedMat = new THREE.MeshStandardMaterial({
        color: 0xd9d4c7,
        roughness: 0.8,
        metalness: 0.08,
      });
      const pedestal = new THREE.Mesh(pedGeo, pedMat);
      pedestal.position.y = 0.22;
      pedestal.castShadow = true;
      pedestal.receiveShadow = true;
      group.add(pedestal);

      // Inlaid Brass Trim Ring on Pedestal
      const pedRimGeo = new THREE.TorusGeometry(1.62, 0.025, 16, 32);
      const pedRim = new THREE.Mesh(pedRimGeo, brassMat);
      pedRim.rotation.x = Math.PI / 2;
      pedRim.position.y = 0.45;
      group.add(pedRim);

      // --- Cantilevered Architectural Desk ---
      const deskTopGeo = new THREE.BoxGeometry(2.0, 0.1, 1.05);
      const deskTopMat = new THREE.MeshStandardMaterial({
        color: 0x1d2025, // Deep obsidian charcoal matte
        roughness: 0.35,
        metalness: 0.3,
      });
      const deskTop = new THREE.Mesh(deskTopGeo, deskTopMat);
      deskTop.position.set(0, 0.95, 0.2);
      deskTop.castShadow = true;
      deskTop.receiveShadow = true;
      group.add(deskTop);

      // Desk illuminated edge accent strip
      const edgeStripGeo = new THREE.BoxGeometry(2.02, 0.025, 0.035);
      const edgeStripMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(ag.accentColor),
        transparent: true,
        opacity: 0.85,
      });
      const edgeStrip = new THREE.Mesh(edgeStripGeo, edgeStripMat);
      edgeStrip.position.set(0, 0.95, -0.32);
      group.add(edgeStrip);

      // Slender Brushed Bronze Desk Legs
      const legMat = new THREE.MeshStandardMaterial({
        color: 0x9e9076,
        metalness: 0.85,
        roughness: 0.3,
      });
      const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.95, 12);

      const legPositions = [
        [0.85, 0.47, 0.6],
        [-0.85, 0.47, 0.6],
        [0.85, 0.47, -0.2],
        [-0.85, 0.47, -0.2],
      ];
      legPositions.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        group.add(leg);
      });

      // --- High-End Ergonomic Executive Studio Chair ---
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0, 0.45, 1.05); // positioned behind the desk facing console

      // Chair 5-star star caster base
      const chairBaseGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 5);
      const chairBase = new THREE.Mesh(chairBaseGeo, brassMat);
      chairGroup.add(chairBase);

      const chairPistonGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12);
      const chairPiston = new THREE.Mesh(chairPistonGeo, brassMat);
      chairPiston.position.y = 0.2;
      chairGroup.add(chairPiston);

      // Curved leather/fabric seat cushion
      const seatGeo = new THREE.BoxGeometry(0.65, 0.08, 0.6);
      const seatMat = new THREE.MeshStandardMaterial({ color: 0x222529, roughness: 0.65 });
      const seat = new THREE.Mesh(seatGeo, seatMat);
      seat.position.y = 0.4;
      seat.castShadow = true;
      chairGroup.add(seat);

      // Ergonomic curved backrest with polished brass spine
      const backGeo = new THREE.BoxGeometry(0.62, 0.65, 0.06);
      const back = new THREE.Mesh(backGeo, seatMat);
      back.position.set(0, 0.72, 0.28);
      back.rotation.x = 0.12;
      back.castShadow = true;
      chairGroup.add(back);

      const spineGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8);
      const spine = new THREE.Mesh(spineGeo, brassMat);
      spine.position.set(0, 0.65, 0.32);
      chairGroup.add(spine);

      group.add(chairGroup);

      // --- Next-Gen Curved Ultra-Wide Terminal Display ---
      const screenStandGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8);
      const screenStand = new THREE.Mesh(screenStandGeo, brassMat);
      screenStand.position.set(0, 1.15, 0.42);
      group.add(screenStand);

      // Ultra-wide curved screen
      const screenGeo = new THREE.BoxGeometry(1.4, 0.55, 0.035);
      const screenMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(ag.color),
        emissive: new THREE.Color(ag.color),
        emissiveIntensity: 0.6,
        roughness: 0.25,
      });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(0, 1.35, 0.38);
      screen.rotation.x = -0.15;
      group.add(screen);

      // Minimalist Mechanical Keyboard on Desk
      const kbGeo = new THREE.BoxGeometry(0.6, 0.02, 0.22);
      const kbMat = new THREE.MeshStandardMaterial({ color: 0x30343a, roughness: 0.4, metalness: 0.5 });
      const kb = new THREE.Mesh(kbGeo, kbMat);
      kb.position.set(-0.1, 1.01, 0.1);
      group.add(kb);

      // Circular Precision Dial / Trackpad
      const dialGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.015, 24);
      const dial = new THREE.Mesh(dialGeo, brassMat);
      dial.position.set(0.38, 1.01, 0.1);
      group.add(dial);

      // --- Role-Specific Scientific Desktop Accessories ---
      if (ag.role === "RETROSYNTHESIS" || ag.role === "VALIDATION") {
        // Borosilicate Erlenmeyer flask with glowing reagent
        const flaskGeo = new THREE.ConeGeometry(0.12, 0.25, 16);
        const flaskMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transmission: 0.9,
          roughness: 0.1,
          transparent: true,
          ior: 1.45,
        });
        const flask = new THREE.Mesh(flaskGeo, flaskMat);
        flask.position.set(-0.65, 1.12, 0.2);
        group.add(flask);

        const liquidGeo = new THREE.ConeGeometry(0.1, 0.14, 16);
        const liquidMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(ag.accentColor) });
        const liquid = new THREE.Mesh(liquidGeo, liquidMat);
        liquid.position.set(-0.65, 1.07, 0.2);
        group.add(liquid);
      } else if (ag.role === "RESEARCH" || ag.role === "KNOWLEDGE") {
        // Stack of research folio archival notebooks
        const bookMat = new THREE.MeshStandardMaterial({ color: 0xe57d25, roughness: 0.8 });
        const bookGeo = new THREE.BoxGeometry(0.28, 0.06, 0.38);
        const book = new THREE.Mesh(bookGeo, bookMat);
        book.position.set(-0.65, 1.04, 0.2);
        book.rotation.y = 0.25;
        group.add(book);
      }

      // Curved Brass Gooseneck Lamp with Downward Pool Light
      const lampBaseGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16);
      const lampBase = new THREE.Mesh(lampBaseGeo, brassMat);
      lampBase.position.set(0.75, 1.01, 0.38);
      group.add(lampBase);

      const lampArmGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.48, 8);
      const lampArm = new THREE.Mesh(lampArmGeo, brassMat);
      lampArm.position.set(0.72, 1.26, 0.38);
      lampArm.rotation.z = -0.28;
      group.add(lampArm);

      const lampHeadGeo = new THREE.ConeGeometry(0.09, 0.15, 16);
      const lampHead = new THREE.Mesh(lampHeadGeo, brassMat);
      lampHead.position.set(0.6, 1.48, 0.38);
      lampHead.rotation.z = Math.PI * 0.78;
      group.add(lampHead);

      const spotLight = new THREE.SpotLight(0xfffaea, 1.8, 4.0, Math.PI / 4, 0.4, 1.2);
      spotLight.position.set(0.6, 1.46, 0.38);
      spotLight.target.position.set(0.2, 0.98, 0.1);
      group.add(spotLight);
      group.add(spotLight.target);

      // --- Sculptural Kinetic Agent Avatar Hologram ---
      let avatarGeo: THREE.BufferGeometry;
      if (ag.role === "ORCHESTRATOR") {
        avatarGeo = new THREE.OctahedronGeometry(0.58);
      } else if (ag.role === "RETROSYNTHESIS") {
        avatarGeo = new THREE.IcosahedronGeometry(0.55);
      } else if (ag.role === "RESEARCH") {
        avatarGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 16);
      } else if (ag.role === "VALIDATION") {
        avatarGeo = new THREE.DodecahedronGeometry(0.52);
      } else if (ag.role === "CRITIC") {
        avatarGeo = new THREE.TetrahedronGeometry(0.62);
      } else if (ag.role === "ANALYSIS") {
        avatarGeo = new THREE.TorusGeometry(0.42, 0.16, 16, 32);
      } else {
        avatarGeo = new THREE.TorusKnotGeometry(0.34, 0.1, 48, 12);
      }

      const avatarMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(ag.color),
        emissive: new THREE.Color(ag.accentColor),
        emissiveIntensity: 0.65,
        roughness: 0.15,
        metalness: 0.8,
        clearcoat: 0.9,
        clearcoatRoughness: 0.15,
      });
      const avatar = new THREE.Mesh(avatarGeo, avatarMat);
      avatar.position.set(0, 2.25, 0.15);
      avatar.castShadow = true;
      group.add(avatar);

      // Multi-Layered Technical Holographic Orbit Ring
      const haloGeo = new THREE.TorusGeometry(0.92, 0.024, 16, 48);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(ag.accentColor),
        transparent: true,
        opacity: 0.85,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(0, 2.25, 0.15);
      halo.rotation.x = Math.PI / 3;
      group.add(halo);

      // Workstation Point Light
      const pLight = new THREE.PointLight(new THREE.Color(ag.accentColor), 1.3, 6);
      pLight.position.set(0, 2.45, 0.15);
      group.add(pLight);

      // Raycasting Hitbox for Clicking
      const hitGeo = new THREE.CylinderGeometry(1.75, 1.75, 3.8, 16);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitbox = new THREE.Mesh(hitGeo, hitMat);
      hitbox.position.y = 1.9;
      hitbox.userData = { agent: ag };
      group.add(hitbox);
      interactiveObjects.push(hitbox);

      scene.add(group);

      agentMeshes.push({
        group,
        agent: ag,
        avatarMesh: avatar,
        hudRingMesh: halo,
        pointLight: pLight,
        deskRimMesh: edgeStrip,
        screenMesh: screen,
      });
    });

    // 8. Dynamic Communication Energy Laser Arc
    let beamLine: THREE.Line | null = null;

    // 9. Camera Orbit & Drag Controls
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
        phi = Math.max(0.2, Math.min(1.48, phi));

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

    // 10. Master 60FPS Cinematic Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Cinematic Drone Flythrough Orbit Mode
      if (isAutoDrifting && !isDragging) {
        const driftRadius = 25;
        const driftHeight = 16.5 + Math.sin(elapsed * 0.22) * 2.8;
        const driftAngle = elapsed * 0.085;
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

      // Animate Central Science Reactor
      molecularCoreGroup.rotation.y = elapsed * 0.35;
      molecularCoreGroup.position.y = 2.2 + Math.sin(elapsed * 1.5) * 0.12;
      buckyMesh.rotation.x = elapsed * 0.2;
      nucleusMesh.rotation.z = -elapsed * 0.45;
      gyro1.rotation.z = elapsed * 0.5;
      gyro2.rotation.x = -elapsed * 0.4;

      // Animate Sunlight Dust Motes
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particleSpeeds[i * 3];
        positions[i * 3 + 1] += particleSpeeds[i * 3 + 1];
        positions[i * 3 + 2] += particleSpeeds[i * 3 + 2];

        if (positions[i * 3 + 1] > 11) positions[i * 3 + 1] = 0.5;
        if (positions[i * 3] > 15) positions[i * 3] = -15;
        if (positions[i * 3] < -15) positions[i * 3] = 15;
        if (positions[i * 3 + 2] > 15) positions[i * 3 + 2] = -15;
        if (positions[i * 3 + 2] < -15) positions[i * 3 + 2] = 15;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Animate Agent Workstations & Holograms
      agentMeshes.forEach(({ agent, avatarMesh, hudRingMesh, pointLight, deskRimMesh, screenMesh }) => {
        const liveAgent = agents.find((a) => a.id === agent.id) || agent;
        const isWorking = liveAgent.state === "WORKING" || liveAgent.state === "VALIDATING";
        const isSelected = selectedAgentId === agent.id;
        const isHovered = hoveredAgent?.id === agent.id;

        const speed = isWorking ? 3.4 : 0.85;
        avatarMesh.rotation.y = elapsed * speed;
        avatarMesh.rotation.x = Math.sin(elapsed * 1.6) * 0.12;
        avatarMesh.position.y = 2.25 + Math.sin(elapsed * (isWorking ? 4.5 : 2.2)) * (isWorking ? 0.15 : 0.07);

        hudRingMesh.rotation.z = elapsed * (isWorking ? 3.0 : 0.9);
        hudRingMesh.rotation.x = Math.PI / 3 + Math.sin(elapsed * 1.4) * 0.08;

        const mat = avatarMesh.material as THREE.MeshPhysicalMaterial;
        const rimMat = deskRimMesh.material as THREE.MeshBasicMaterial;
        const screenMat = screenMesh.material as THREE.MeshStandardMaterial;

        if (isWorking) {
          mat.emissiveIntensity = 1.0 + Math.sin(elapsed * 8) * 0.4;
          screenMat.emissiveIntensity = 0.95 + Math.sin(elapsed * 6) * 0.2;
          pointLight.intensity = 2.4;
          rimMat.opacity = 1.0;
        } else if (isSelected || isHovered) {
          mat.emissiveIntensity = 0.95;
          screenMat.emissiveIntensity = 0.85;
          pointLight.intensity = 2.0;
          rimMat.opacity = 1.0;
        } else {
          mat.emissiveIntensity = 0.35;
          screenMat.emissiveIntensity = 0.5;
          pointLight.intensity = 0.8;
          rimMat.opacity = 0.45;
        }
      });

      // Render Inter-Agent Communication Laser Arc
      if (activeCommunication) {
        const fromAg = agents.find((a) => a.role === activeCommunication.from);
        const toAg = agents.find((a) => a.role === activeCommunication.to);
        if (fromAg && toAg) {
          const start = new THREE.Vector3(fromAg.workstationPos[0], 2.3, fromAg.workstationPos[2]);
          const end = new THREE.Vector3(toAg.workstationPos[0], 2.3, toAg.workstationPos[2]);
          const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5).add(new THREE.Vector3(0, 3.4, 0));

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
