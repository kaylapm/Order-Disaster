/**
 * BPMN Swimlane & Pool Visualizer Engine
 * Renders authentic BPMN 2.0 Pools, Swimlanes, Nodes (Start, Task, Gateway, End),
 * Orthogonal Sequence Flow Connectors across lanes, and animated Mario path runner!
 */

class BPMNSwimlaneVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.nodePositions = []; // Array of { x, y, width, height, laneId, cardId, index }
    this.isAnimating = false;
    this.marioEl = null;
    this.routingMode = 'smart'; // 'smart' (BPMN 2.0 Orthogonal Rapi), 'curve' (Lengkung Halus), 'direct' (Garis Langsung)
    
    // bpmn.io 4-Port Connection Model:
    // Store user-customized port connections for each edge or step: { [edgeId]: { fromPort: 'right'|'bottom'|'top'|'left', toPort: 'left'|'top'|'bottom'|'right' } }
    this.customEdgePorts = {};
    this.activePortPickerNode = null;

    window.addEventListener('resize', () => {
      if (this.level && this.cardsInSlots.length > 0) {
        this.calculatePositions();
        this.drawArrows();
        this.positionMarioAtStart();
      }
    });
  }

  // Set user-selected arrow routing mode and redraw
  setRoutingMode(mode) {
    this.routingMode = mode;
    this.drawArrows();
  }

  // Set custom connection port (top/bottom/left/right) like in bpmn.io
  setEdgePort(edgeId, fromPort, toPort) {
    if (!this.customEdgePorts[edgeId]) {
      this.customEdgePorts[edgeId] = {};
    }
    if (fromPort) this.customEdgePorts[edgeId].fromPort = fromPort;
    if (toPort) this.customEdgePorts[edgeId].toPort = toPort;
    this.drawArrows();
  }

  // Set custom corridor coordinates (geser segmen siku horizontal/vertikal)
  setEdgeCorridor(edgeId, corridorX, corridorY) {
    if (!this.customEdgePorts[edgeId]) {
      this.customEdgePorts[edgeId] = {};
    }
    if (corridorX !== undefined) this.customEdgePorts[edgeId].corridorX = corridorX;
    if (corridorY !== undefined) this.customEdgePorts[edgeId].corridorY = corridorY;
    this.drawArrows();
  }

  // Reset custom ports back to standard bpmn.io auto-docking
  resetEdgePorts() {
    this.customEdgePorts = (this.level && this.level.defaultEdgePorts)
      ? JSON.parse(JSON.stringify(this.level.defaultEdgePorts))
      : {};
    this.drawArrows();
  }

  // Set data and render diagram
  render(level, cardsInSlots) {
    const isNewLevel = (!this.level || this.level.id !== level.id);
    this.level = level;
    this.cardsInSlots = cardsInSlots;

    if (isNewLevel && level && level.defaultEdgePorts) {
      this.customEdgePorts = JSON.parse(JSON.stringify(level.defaultEdgePorts));
    }
    if (!this.container) return;

    this.container.innerHTML = '';

    // Create Pool Wrapper
    const poolEl = document.createElement('div');
    poolEl.className = 'bpmn-pool-wrapper';

    // 1. Pool Header (Left Vertical Bar in BPMN 2.0)
    const poolHeader = document.createElement('div');
    poolHeader.className = 'bpmn-pool-header';
    poolHeader.innerHTML = `
      <div class="pool-vertical-title">${this.level.pool.name}</div>
      <div class="pool-sub">${this.level.pool.subtitle}</div>
    `;
    poolEl.appendChild(poolHeader);

    // 2. Swimlanes Body (Horizontal Rows)
    const lanesBody = document.createElement('div');
    lanesBody.className = 'bpmn-lanes-body';
    lanesBody.id = 'bpmnLanesBody';

    // SVG Overlay for Sequence Flow Arrows
    const svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgOverlay.setAttribute('class', 'bpmn-arrows-svg');
    svgOverlay.setAttribute('id', 'bpmnArrowsSvg');
    lanesBody.appendChild(svgOverlay);

    // Mario Character element inside the diagram
    const marioEl = document.createElement('div');
    marioEl.className = 'diagram-mario';
    marioEl.id = 'diagramMario';
    marioEl.innerHTML = `
      <div class="mario-sprite-pixel"></div>
      <div class="mario-dialog-bubble" id="marioSpeechBubble"></div>
    `;
    lanesBody.appendChild(marioEl);
    this.marioEl = marioEl;

    // Render Each Swimlane Row
    this.level.lanes.forEach((lane) => {
      const laneRow = document.createElement('div');
      laneRow.className = 'bpmn-swimlane-row';
      laneRow.dataset.laneId = lane.id;
      laneRow.id = `lane-${lane.id}`;

      // Lane Title Badge on Left
      const laneHeader = document.createElement('div');
      laneHeader.className = 'bpmn-lane-header';
      laneHeader.style.borderLeftColor = lane.border;
      laneHeader.innerHTML = `
        <div class="lane-info">
          <div class="lane-name">${lane.name}</div>
          <div class="lane-role">${lane.role}</div>
        </div>
      `;
      laneRow.appendChild(laneHeader);

      // Lane Step Grid (Columns 1 to N)
      const laneGrid = document.createElement('div');
      laneGrid.className = 'bpmn-lane-grid';
      laneGrid.style.gridTemplateColumns = `repeat(${this.cardsInSlots.length}, minmax(0, 1fr))`;

      for (let stepIdx = 0; stepIdx < this.cardsInSlots.length; stepIdx++) {
        const cell = document.createElement('div');
        cell.className = 'bpmn-lane-cell';
        cell.dataset.stepIndex = stepIdx;
        cell.dataset.laneId = lane.id;
        cell.id = `cell-${lane.id}-${stepIdx}`;

        // Enable Drag & Drop into this swimlane cell
        cell.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          cell.classList.add('drag-over-cell');
        });

        cell.addEventListener('dragleave', () => {
          cell.classList.remove('drag-over-cell');
        });

        cell.addEventListener('drop', (e) => {
          e.preventDefault();
          cell.classList.remove('drag-over-cell');
          try {
            const rawData = e.dataTransfer.getData('text/plain');
            if (rawData) {
              const data = JSON.parse(rawData);
              if (data && data.type === 'diagram-node' && window.game) {
                window.game.moveCardInDiagram(data.stepIndex, stepIdx, lane.id);
              }
            }
          } catch (err) {}
        });

        // Check if current card in this step belongs to this lane
        const card = this.cardsInSlots[stepIdx];
        if (card.laneId === lane.id) {
          const nodeEl = this.createBPMNNodeElement(card, stepIdx);
          cell.appendChild(nodeEl);
        } else {
          // Empty cell: clean swimlane slot, only accepts drag and drop
          cell.style.cursor = 'default';
        }

        laneGrid.appendChild(cell);
      }

      laneRow.appendChild(laneGrid);
      lanesBody.appendChild(laneRow);
    });

    poolEl.appendChild(lanesBody);
    this.container.appendChild(poolEl);

    // Calculate node positions and draw sequence flow arrows
    requestAnimationFrame(() => {
      this.calculatePositions();
      this.drawArrows();
      this.positionMarioAtStart();
    });
  }

  // Create real BPMN 2.0 Node Element (Start, Task, Gateway, End)
  createBPMNNodeElement(card, stepIndex) {
    const nodeEl = document.createElement('div');
    const symbolKey = (card.currentSymbol || 'task').toLowerCase();
    nodeEl.className = `bpmn-diagram-node node-${symbolKey}`;
    nodeEl.dataset.stepIndex = stepIndex;
    nodeEl.dataset.cardId = card.id;
    nodeEl.id = `bpmn-node-${stepIndex}`;
    nodeEl.draggable = true;

    // Node Drag & Drop Handlers
    nodeEl.addEventListener('dragstart', (e) => {
      if (window.game && window.game.isSimulating) return;
      nodeEl.classList.add('is-dragging');
      e.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'diagram-node',
        stepIndex: stepIndex,
        cardId: card.id,
        currentLaneId: card.laneId
      }));
      e.dataTransfer.effectAllowed = 'move';
      window.retroAudio.playClick();
    });

    nodeEl.addEventListener('dragend', () => {
      nodeEl.classList.remove('is-dragging');
      document.querySelectorAll('.bpmn-lane-cell').forEach((c) => c.classList.remove('drag-over-cell'));
    });

    const symInfo = BPMN_SYMBOLS[symbolKey.toUpperCase()] || BPMN_SYMBOLS.TASK;
    const laneInfo = (this.level && this.level.lanes) ? this.level.lanes.find((l) => l.id === card.laneId) : null;
    const laneNameShort = laneInfo ? laneInfo.name.split(' ')[0] : 'Lane';
    const laneIcon = laneInfo ? laneInfo.icon : '🏊';

    let shapeHtml = '';
    if (symbolKey === 'start') {
      shapeHtml = `
        <div class="node-shape circle-start" title="Start Event: Awal pemicu proses di lane ini">
          <div class="start-inner-icon"></div>
        </div>
      `;
    } else if (symbolKey === 'task') {
      shapeHtml = `
        <div class="node-shape box-task" title="Activity / Task (Verb-Object): Pekerjaan operasional di lane ini">
          <div class="task-step-tag">STEP ${stepIndex + 1}</div>
          <div class="task-text">${card.text}</div>
        </div>
      `;
    } else if (symbolKey === 'gateway') {
      shapeHtml = `
        <div class="node-shape diamond-gateway" style="width:38px; height:38px; border:3px solid #ca8a04; background:#fef08a; transform:rotate(45deg); display:flex; align-items:center; justify-content:center; box-sizing:border-box; margin:4px; box-shadow:2px 2px 0 rgba(0,0,0,0.15);" title="Exclusive Gateway (XOR): Percabangan keputusan salah satu jalur">
          <div class="gateway-cross" style="transform:rotate(-45deg); color:#854d0e; font-family:'Press Start 2P', monospace, sans-serif; font-size:13px; font-weight:900; line-height:1; display:flex; align-items:center; justify-content:center; user-select:none;">✕</div>
        </div>
      `;
    } else if (symbolKey === 'parallel') {
      shapeHtml = `
        <div class="node-shape diamond-gateway diamond-parallel" style="width:38px; height:38px; border:3px solid #ca8a04; background:#fef08a; transform:rotate(45deg); display:flex; align-items:center; justify-content:center; box-sizing:border-box; margin:4px; box-shadow:2px 2px 0 rgba(0,0,0,0.15);" title="Parallel Gateway (AND): Percabangan atau penggabungan serentak">
          <div class="gateway-cross gateway-plus" style="transform:rotate(-45deg); color:#854d0e; font-family:'Press Start 2P', monospace, sans-serif; font-size:15px; font-weight:900; line-height:1; display:flex; align-items:center; justify-content:center; user-select:none;">+</div>
        </div>
      `;
    } else if (symbolKey === 'timer') {
      shapeHtml = `
        <div class="node-shape circle-timer" title="Intermediate Timer Event: Menunggu durasi waktu tertentu">
          <div class="timer-clock-icon">⏱</div>
        </div>
      `;
    } else if (symbolKey === 'end') {
      shapeHtml = `
        <div class="node-shape circle-end" title="End Event: Hasil akhir proses selesai">
          <div class="end-inner-ring"></div>
        </div>
      `;
    }

    // Node content with bpmn.io 4 Connection Ports (Top, Bottom, Left, Right)
    const symbolButtonText = symInfo.shortLabel || symInfo.name.split(' ')[0];
    nodeEl.innerHTML = `
      <div class="node-step-badge">#${stepIndex + 1}</div>
      <div class="bpmn-shape-wrapper" data-step-index="${stepIndex}" data-card-id="${card.id}">
        <!-- 4 bpmn.io Connection Anchor Ports (Visual Drop Targets Only) -->
        <div class="bpmn-port-handle port-top" data-port="top" data-step="${stepIndex}"></div>
        <div class="bpmn-port-handle port-right" data-port="right" data-step="${stepIndex}"></div>
        <div class="bpmn-port-handle port-bottom" data-port="bottom" data-step="${stepIndex}"></div>
        <div class="bpmn-port-handle port-left" data-port="left" data-step="${stepIndex}"></div>
        ${shapeHtml}
      </div>
      <div class="node-label-caption">${card.text}</div>
      <div class="node-buttons-row">
        <button type="button" class="node-quick-sym-btn" title="Ganti Simbol BPMN">
          ${symbolButtonText} ▾
        </button>
      </div>
    `;

    // Click handler for symbol picker
    const symBtn = nodeEl.querySelector('.node-quick-sym-btn');
    if (symBtn) {
      symBtn.onclick = (e) => {
        e.stopPropagation();
        if (window.game) {
          window.game.toggleSymbolPopover(card.id, stepIndex, symBtn);
        }
      };
    }

    if (window.game && window.game.selectedForSwapIndex === stepIndex) {
      nodeEl.classList.add('selected-for-swap');
    }

    nodeEl.onclick = (e) => {
      if (e.target.closest('.node-quick-sym-btn') || e.target.closest('.node-quick-lane-btn') || e.target.closest('.bpmn-port-handle')) return;
      if (window.game && !window.game.isSimulating) {
        window.game.handleNodeTap(stepIndex);
      }
    };

    return nodeEl;
  }

  // Handle click on bpmn.io port handle to toggle port connection
  handlePortClick(stepIndex, portName, portBtn) {
    if (window.retroAudio) window.retroAudio.playClick();

    // Toggle port for outgoing or incoming connection
    // Check if user is clicking outgoing (Step N) or incoming
    // We update outgoing port for flow-arrow-${stepIndex} and incoming for flow-arrow-${stepIndex - 1}
    const currentCustom = this.customEdgePorts[`flow-arrow-${stepIndex}`] || {};
    
    // Cycle port or set directly
    if (portName === 'top' || portName === 'bottom') {
      // Toggle exit port for outgoing arrow to top/bottom
      const currentOut = currentCustom.fromPort;
      const nextOut = (currentOut === portName) ? 'right' : portName;
      this.setEdgePort(`flow-arrow-${stepIndex}`, nextOut, null);
      
      // Also if step has parallel branch split, allow custom out port
      if (this.level && this.level.parallelBranch) {
        const getIdx = (id) => this.cardsInSlots.findIndex((c) => c.id === id);
        const splitIdx = getIdx(this.level.parallelBranch.splitCardId);
        if (stepIndex === splitIdx) {
          this.setEdgePort(`flow-arrow-${splitIdx}-b2`, nextOut, null);
        }
      }
    } else {
      // Left or Right: set incoming/outgoing
      if (portName === 'left') {
        const inEdgeId = `flow-arrow-${stepIndex - 1}`;
        const currentIn = (this.customEdgePorts[inEdgeId] || {}).toPort;
        const nextIn = (currentIn === 'left') ? 'top' : 'left';
        this.setEdgePort(inEdgeId, null, nextIn);
      } else {
        const nextOut = (currentCustom.fromPort === 'right') ? 'bottom' : 'right';
        this.setEdgePort(`flow-arrow-${stepIndex}`, nextOut, null);
      }
    }

    if (window.game) {
      window.game.showToast(`Titik koneksi Step #${stepIndex + 1} diatur ke sisi: ${portName.toUpperCase()}!`);
    }
  }

  // Calculate coordinates of each node shape in the lanes body with 4 bpmn.io ports
  calculatePositions() {
    this.nodePositions = [];
    const lanesBody = document.getElementById('bpmnLanesBody');
    if (!lanesBody) return;
    const bodyRect = lanesBody.getBoundingClientRect();

    for (let i = 0; i < this.cardsInSlots.length; i++) {
      const nodeEl = document.getElementById(`bpmn-node-${i}`);
      if (nodeEl) {
        // Measure the inner actual BPMN shape element (.node-shape) for true geometric borders
        const shapeEl = nodeEl.querySelector('.node-shape') || nodeEl;
        const shapeRect = shapeEl.getBoundingClientRect();

        const centerX = shapeRect.left - bodyRect.left + shapeRect.width / 2;
        const centerY = shapeRect.top - bodyRect.top + shapeRect.height / 2;

        const leftX = shapeRect.left - bodyRect.left;
        const rightX = shapeRect.right - bodyRect.left;
        const topY = shapeRect.top - bodyRect.top;
        const bottomY = shapeRect.bottom - bodyRect.top;

        this.nodePositions[i] = {
          index: i,
          x: centerX,
          y: centerY,
          startX: rightX, // default right port
          endX: leftX,   // default left port
          width: shapeRect.width,
          height: shapeRect.height,
          card: this.cardsInSlots[i],
          laneId: this.cardsInSlots[i].laneId,
          element: nodeEl,
          shapeElement: shapeEl,
          // 4 bpmn.io geometric anchor ports:
          ports: {
            top: { x: centerX, y: topY, dir: 'up' },
            bottom: { x: centerX, y: bottomY, dir: 'down' },
            left: { x: leftX, y: centerY, dir: 'left' },
            right: { x: rightX, y: centerY, dir: 'right' }
          }
        };
      }
    }
  }

  // Generate SVG path data for BPMN Sequence Flow connecting two shapes using bpmn.io 4-directional ports
  createOrthogonalPath(curr, next, edgeMeta = {}) {
    const isSameLane = (curr.laneId === next.laneId);
    const edgeId = edgeMeta.id || `flow-arrow-${curr.index}`;
    const custom = this.customEdgePorts[edgeId] || {};

    // 1. Determine Output Port on curr node (bpmn.io: right, bottom, top, left)
    let outPortKey = custom.fromPort;
    if (!outPortKey) {
      if (edgeMeta.isBranchSplit && !isSameLane) {
        // Parallel branch split branching into lower lane: default exit from bottom diamond port!
        outPortKey = (curr.y < next.y) ? 'bottom' : 'top';
      } else {
        outPortKey = 'right';
      }
    }

    // 2. Determine Input Port on next node (bpmn.io: left, top, bottom, right)
    let inPortKey = custom.toPort;
    if (!inPortKey) {
      if (edgeMeta.isBranchJoin && !isSameLane) {
        // Parallel branch joining into upper lane: default enter into bottom/top diamond port!
        inPortKey = (curr.y > next.y) ? 'bottom' : 'top';
      } else {
        inPortKey = 'left';
      }
    }

    const startPt = (curr.ports && curr.ports[outPortKey]) ? curr.ports[outPortKey] : { x: curr.startX, y: curr.y, dir: 'right' };
    const endPt = (next.ports && next.ports[inPortKey]) ? next.ports[inPortKey] : { x: next.endX, y: next.y, dir: 'left' };

    const startX = startPt.x;
    const startY = startPt.y;
    const endX = endPt.x;
    const endY = endPt.y;

    // Direct mode if user explicitly selected direct line
    if (this.routingMode === 'direct') {
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }

    // Straight horizontal line auto-snap if ports are nearly level (selisih tipis < 16px langsung jepret lurus)
    const isHorizontalExit = (outPortKey === 'right' || outPortKey === 'left');
    const isHorizontalEnter = (inPortKey === 'left' || inPortKey === 'right');
    const isNaturalForward = (outPortKey === 'right' && inPortKey === 'left' && startX < endX);

    if (isHorizontalExit && isHorizontalEnter && isNaturalForward) {
      if (Math.abs(startY - endY) <= 15) {
        // Otomatis "tek" snap jadi garis lurus sempurna horizontal!
        return `M ${startX} ${startY} L ${endX} ${startY}`;
      }
    }

    // Smooth Bezier Curve if user selected curve mode
    if (this.routingMode === 'curve') {
      const c1x = Math.round(startX + (endX - startX) * 0.45);
      const c2x = Math.round(startX + (endX - startX) * 0.55);
      return `M ${startX} ${startY} C ${c1x} ${startY}, ${c2x} ${endY}, ${endX} ${endY}`;
    }

    // BPMN 2.0 Orthogonal / Siku routing: Clean, crisp, straight segments
    const baseMidX = Math.round(startX + (endX - startX) * 0.5);
    const midX = (custom.corridorX !== undefined) ? custom.corridorX : baseMidX;

    // Auto-snap corridorY jika digeser mendekati startY atau endY (selisih <= 12px)
    let effectiveCorridorY = custom.corridorY;
    if (effectiveCorridorY !== undefined) {
      if (Math.abs(effectiveCorridorY - startY) <= 12) effectiveCorridorY = startY;
      else if (Math.abs(effectiveCorridorY - endY) <= 12) effectiveCorridorY = endY;
    }

    // 1. Exiting Top or Bottom
    if (outPortKey === 'top' || outPortKey === 'bottom') {
      if (inPortKey === 'top' || inPortKey === 'bottom') {
        const defaultTurnY = (outPortKey === 'top' && inPortKey === 'top')
          ? Math.min(startY, endY) - 24
          : (outPortKey === 'bottom' && inPortKey === 'bottom')
            ? Math.max(startY, endY) + 24
            : Math.round(startY + (endY - startY) * 0.5);
        const turnY = (effectiveCorridorY !== undefined) ? effectiveCorridorY : defaultTurnY;
        return `M ${startX} ${startY} L ${startX} ${turnY} L ${endX} ${turnY} L ${endX} ${endY}`;
      } else {
        // Exit top/bottom -> horizontal corridor at startY offset -> enter target (left/right)
        const exitDir = (outPortKey === 'bottom') ? 1 : -1;
        const defaultCorridorY = (Math.abs(startY - endY) > 20) ? endY : (startY + exitDir * 24);
        const corridorY = (effectiveCorridorY !== undefined) ? effectiveCorridorY : defaultCorridorY;
        if (custom.corridorX !== undefined) {
          // If vertical segment position is adjusted
          return `M ${startX} ${startY} L ${startX} ${corridorY} L ${midX} ${corridorY} L ${midX} ${endY} L ${endX} ${endY}`;
        }
        if (corridorY === endY) {
          return `M ${startX} ${startY} L ${startX} ${endY} L ${endX} ${endY}`;
        } else {
          return `M ${startX} ${startY} L ${startX} ${corridorY} L ${endX} ${corridorY} L ${endX} ${endY}`;
        }
      }
    }

    // 2. Entering Top or Bottom (exiting from right or left)
    if (inPortKey === 'top' || inPortKey === 'bottom') {
      if (effectiveCorridorY !== undefined) {
        return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${effectiveCorridorY} L ${endX} ${effectiveCorridorY} L ${endX} ${endY}`;
      }
      // If user adjusted the vertical corridor left/right:
      if (custom.corridorX !== undefined) {
        return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
      }
      // Clean single or double bend:
      if (inPortKey === 'top' && startY < endY) {
        return `M ${startX} ${startY} L ${endX} ${startY} L ${endX} ${endY}`;
      }
      if (inPortKey === 'bottom' && startY > endY) {
        return `M ${startX} ${startY} L ${endX} ${startY} L ${endX} ${endY}`;
      }
      const approachY = (inPortKey === 'top') ? (endY - 24) : (endY + 24);
      return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${approachY} L ${endX} ${approachY} L ${endX} ${endY}`;
    }

    // 3. Standard Right -> Left (cross-lane or same-lane)
    if (Math.abs(startY - endY) <= 12 && effectiveCorridorY === undefined) {
      // Auto-snap jadi garis lurus sempurna jika tipis!
      return `M ${startX} ${startY} L ${endX} ${startY}`;
    }

    if (startY === endY && effectiveCorridorY === undefined) {
      if (custom.corridorX !== undefined && startX > endX) {
        const loopY = startY + 50;
        return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${loopY} L ${endX} ${loopY} L ${endX} ${endY}`;
      }
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }

    // If user dragged horizontal segment up/down
    if (effectiveCorridorY !== undefined) {
      if (Math.abs(effectiveCorridorY - startY) <= 12 && Math.abs(startY - endY) <= 12) {
        return `M ${startX} ${startY} L ${endX} ${startY}`;
      }
      return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${effectiveCorridorY} L ${endX} ${effectiveCorridorY} L ${endX} ${endY}`;
    }

    // Clean two-corner Z/S-bend with straight lines (adjustable left-right via midX)
    return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
  }

  // Draw authentic, sleek BPMN Orthogonal Sequence Flow Arrows with smooth rounded corners
  drawArrows() {
    const svg = document.getElementById('bpmnArrowsSvg');
    if (!svg) return;
    this.calculatePositions();

    svg.innerHTML = `
      <defs>
        <!-- Sleek, sharp BPMN Sequence Flow Arrowheads (userSpaceOnUse for constant crisp size) -->
        <marker id="bpmnArrowHead" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
          <path d="M 0 1.5 L 9 5 L 0 8.5 L 2 5 Z" fill="#334155" />
        </marker>
        <marker id="bpmnArrowHeadActive" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
          <path d="M 0 1.5 L 9 5 L 0 8.5 L 2 5 Z" fill="#16a34a" />
        </marker>
        <marker id="bpmnArrowHeadBug" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
          <path d="M 0 1.5 L 9 5 L 0 8.5 L 2 5 Z" fill="#dc2626" />
        </marker>
      </defs>
    `;

    // Determine sequence flow edges (supporting BPMN 2.0 Parallel & Exclusive Gateway Split & Join)
    const edges = [];
    const pBranch = this.level ? this.level.parallelBranch : null;
    const xBranch = this.level ? this.level.exclusiveBranch : null;

    let isBranchStructureActive = false;
    if (pBranch) {
      const getIdx = (id) => this.cardsInSlots.findIndex((c) => c.id === id);
      const splitIdx = getIdx(pBranch.splitCardId);
      const b1StartIdx = getIdx(pBranch.branch1CardIds[0]);
      const b1EndIdx = getIdx(pBranch.branch1CardIds[pBranch.branch1CardIds.length - 1]);
      const b2StartIdx = getIdx(pBranch.branch2CardIds[0]);
      const b2EndIdx = getIdx(pBranch.branch2CardIds[pBranch.branch2CardIds.length - 1]);
      const joinIdx = getIdx(pBranch.joinCardId);

      // Verify all parallel branch elements are present in sequential order
      if (splitIdx !== -1 && b1StartIdx !== -1 && b1EndIdx !== -1 && b2StartIdx !== -1 && b2EndIdx !== -1 && joinIdx !== -1) {
        if (splitIdx < b1StartIdx && b1StartIdx <= b1EndIdx && splitIdx < b2StartIdx && b2StartIdx <= b2EndIdx && b1EndIdx < joinIdx && b2EndIdx < joinIdx) {
          isBranchStructureActive = true;

          // Before split
          for (let i = 0; i < splitIdx; i++) {
            edges.push({ from: i, to: i + 1, id: `flow-arrow-${i}` });
          }

          // Split -> Branch 1 Start (Dapur Oven)
          edges.push({ from: splitIdx, to: b1StartIdx, id: `flow-arrow-${splitIdx}-b1`, isBranchSplit: true, label: pBranch.branch1Label || '' });

          // Branch 1 internal
          for (let k = 0; k < pBranch.branch1CardIds.length - 1; k++) {
            const fIdx = getIdx(pBranch.branch1CardIds[k]);
            const tIdx = getIdx(pBranch.branch1CardIds[k + 1]);
            edges.push({ from: fIdx, to: tIdx, id: `flow-arrow-${fIdx}` });
          }

          // Branch 1 End -> Join
          edges.push({ from: b1EndIdx, to: joinIdx, id: `flow-arrow-${b1EndIdx}-join`, isBranchJoin: true });

          // Split -> Branch 2 Start (Parallel fork ke Kurir!)
          edges.push({ from: splitIdx, to: b2StartIdx, id: `flow-arrow-${splitIdx}-b2`, isBranchSplit: true, label: pBranch.branch2Label || '' });

          // Branch 2 internal
          for (let k = 0; k < pBranch.branch2CardIds.length - 1; k++) {
            const fIdx = getIdx(pBranch.branch2CardIds[k]);
            const tIdx = getIdx(pBranch.branch2CardIds[k + 1]);
            edges.push({ from: fIdx, to: tIdx, id: `flow-arrow-${fIdx}` });
          }

          // Branch 2 End -> Join (Kurir armada -> Rejoin)
          edges.push({ from: b2EndIdx, to: joinIdx, id: `flow-arrow-${b2EndIdx}-join`, isBranchJoin: true });

          // After join
          for (let i = joinIdx; i < this.nodePositions.length - 1; i++) {
            edges.push({ from: i, to: i + 1, id: `flow-arrow-${i}` });
          }
        }
      }
    } else if (xBranch) {
      const getIdx = (id) => this.cardsInSlots.findIndex((c) => c.id === id);
      const splitIdx = getIdx(xBranch.splitCardId);
      const b1StartIdx = getIdx(xBranch.branch1CardIds[0]);
      const b1EndIdx = getIdx(xBranch.branch1CardIds[xBranch.branch1CardIds.length - 1]);
      const b2StartIdx = getIdx(xBranch.branch2CardIds[0]);
      const b2EndIdx = getIdx(xBranch.branch2CardIds[xBranch.branch2CardIds.length - 1]);
      const joinIdx = getIdx(xBranch.joinCardId);

      if (splitIdx !== -1 && b1StartIdx !== -1 && b1EndIdx !== -1 && b2StartIdx !== -1 && b2EndIdx !== -1 && joinIdx !== -1) {
        if (splitIdx < b1StartIdx && b1StartIdx <= b1EndIdx && splitIdx < b2StartIdx && b2StartIdx <= b2EndIdx && b1EndIdx < joinIdx && b2EndIdx < joinIdx) {
          isBranchStructureActive = true;

          // Before split
          for (let i = 0; i < splitIdx; i++) {
            edges.push({ from: i, to: i + 1, id: `flow-arrow-${i}` });
          }

          // Exclusive Split -> Branch 1 (Kondisi Tunai [Cash])
          edges.push({ from: splitIdx, to: b1StartIdx, id: `flow-arrow-${splitIdx}-b1`, isBranchSplit: true, label: xBranch.branch1Label || '[Tunai]' });

          // Branch 1 internal
          for (let k = 0; k < xBranch.branch1CardIds.length - 1; k++) {
            const fIdx = getIdx(xBranch.branch1CardIds[k]);
            const tIdx = getIdx(xBranch.branch1CardIds[k + 1]);
            edges.push({ from: fIdx, to: tIdx, id: `flow-arrow-${fIdx}` });
          }

          // Branch 1 End -> Join
          edges.push({ from: b1EndIdx, to: joinIdx, id: `flow-arrow-${b1EndIdx}-join`, isBranchJoin: true });

          // Exclusive Split -> Branch 2 (Kondisi QRIS)
          edges.push({ from: splitIdx, to: b2StartIdx, id: `flow-arrow-${splitIdx}-b2`, isBranchSplit: true, label: xBranch.branch2Label || '[QRIS]' });

          // Branch 2 internal
          for (let k = 0; k < xBranch.branch2CardIds.length - 1; k++) {
            const fIdx = getIdx(xBranch.branch2CardIds[k]);
            const tIdx = getIdx(xBranch.branch2CardIds[k + 1]);
            edges.push({ from: fIdx, to: tIdx, id: `flow-arrow-${fIdx}` });
          }

          // Branch 2 End -> Join
          edges.push({ from: b2EndIdx, to: joinIdx, id: `flow-arrow-${b2EndIdx}-join`, isBranchJoin: true });

          // After join
          for (let i = joinIdx; i < this.nodePositions.length - 1; i++) {
            edges.push({ from: i, to: i + 1, id: `flow-arrow-${i}` });
          }
        }
      }
    }

    if (!isBranchStructureActive) {
      // Default linear connections
      for (let i = 0; i < this.nodePositions.length - 1; i++) {
        edges.push({ from: i, to: i + 1, id: `flow-arrow-${i}` });
      }
    }

    // Render each edge as an SVG orthogonal sequence flow and create draggable arrowhead handle
    edges.forEach((edge) => {
      const curr = this.nodePositions[edge.from];
      const next = this.nodePositions[edge.to];
      if (!curr || !next) return;

      const custom = this.customEdgePorts[edge.id] || {};
      const isSameLane = (curr.laneId === next.laneId);

      // Determine active ports for start and end
      let outPortKey = custom.fromPort;
      if (!outPortKey) {
        if (edge.isBranchSplit && !isSameLane) {
          outPortKey = (curr.y < next.y) ? 'bottom' : 'top';
        } else {
          outPortKey = 'right';
        }
      }

      let inPortKey = custom.toPort;
      if (!inPortKey) {
        if (edge.isBranchJoin && !isSameLane) {
          inPortKey = (curr.y > next.y) ? 'bottom' : 'top';
        } else {
          inPortKey = 'left';
        }
      }

      const startPt = (curr.ports && curr.ports[outPortKey]) ? curr.ports[outPortKey] : { x: curr.startX, y: curr.y, dir: 'right' };
      const endPt = (next.ports && next.ports[inPortKey]) ? next.ports[inPortKey] : { x: next.endX, y: next.y, dir: 'left' };

      const pathD = this.createOrthogonalPath(curr, next, edge);
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', pathD);
      pathEl.setAttribute('class', 'bpmn-sequence-flow-path');
      pathEl.setAttribute('id', edge.id);
      pathEl.setAttribute('marker-end', 'url(#bpmnArrowHead)');

      svg.appendChild(pathEl);

      // Render Condition Label on Arrow if present (e.g., [Tunai], [QRIS])
      if (edge.label) {
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        // Clean position for condition text
        let labelX = startPt.x + 12;
        let labelY = startPt.y - 8;
        if (outPortKey === 'top') {
          labelX = startPt.x + 8;
          labelY = startPt.y - 12;
        } else if (outPortKey === 'bottom') {
          labelX = startPt.x + 8;
          labelY = startPt.y + 24;
        }
        textEl.setAttribute('x', labelX);
        textEl.setAttribute('y', labelY);
        textEl.setAttribute('class', 'bpmn-edge-condition-label');
        textEl.textContent = edge.label;
        svg.appendChild(textEl);
      }

      // 1. Draggable Origin Handle (pangkal panah / source port)
      const startHitCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      startHitCircle.setAttribute('cx', startPt.x);
      startHitCircle.setAttribute('cy', startPt.y);
      startHitCircle.setAttribute('r', '16');
      startHitCircle.setAttribute('class', 'bpmn-arrow-drag-hitarea');
      startHitCircle.setAttribute('data-edge-id', edge.id);
      startHitCircle.setAttribute('data-handle-type', 'start');
      startHitCircle.setAttribute('title', 'Klik & Drag pangkal panah ini ke salah satu dari 4 titik');

      // 2. Draggable Arrowhead Handle (ujung panah / target port)
      const endHitCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      endHitCircle.setAttribute('cx', endPt.x);
      endHitCircle.setAttribute('cy', endPt.y);
      endHitCircle.setAttribute('r', '16');
      endHitCircle.setAttribute('class', 'bpmn-arrow-drag-hitarea');
      endHitCircle.setAttribute('data-edge-id', edge.id);
      endHitCircle.setAttribute('data-handle-type', 'end');
      endHitCircle.setAttribute('title', 'Klik & Drag ujung panah ini ke salah satu dari 4 titik');

      svg.appendChild(startHitCircle);
      svg.appendChild(endHitCircle);

      this.initArrowEndpointDrag(startHitCircle, 'fromPort', edge, curr, next, pathEl);
      this.initArrowEndpointDrag(endHitCircle, 'toPort', edge, curr, next, pathEl);

      // 3. Draggable Orthogonal Segment Handles (Horizontal: up/down, Vertical: left/right seperti bpmn.io)
      const hasDisplacement = Math.abs(startPt.y - endPt.y) > 10 || Math.abs(startPt.x - endPt.x) > 20 || outPortKey === 'top' || outPortKey === 'bottom' || inPortKey === 'top' || inPortKey === 'bottom';
      if (hasDisplacement) {
        const baseMidX = Math.round(startPt.x + (endPt.x - startPt.x) * 0.5);
        const midX = (custom.corridorX !== undefined) ? custom.corridorX : baseMidX;

        // --- A. Vertical Segment Handle (Tarik Kiri - Kanan) ---
        // Exists when arrow bends vertically between startPt.y and endPt.y (or corridorY)
        let vY1 = startPt.y;
        let vY2 = (custom.corridorY !== undefined) ? custom.corridorY : endPt.y;
        let vX = midX;

        if (outPortKey === 'top' || outPortKey === 'bottom') {
          // If exiting top/bottom, first vertical drop is at startPt.x, but if custom.corridorX exists it's at midX
          vX = (custom.corridorX !== undefined) ? midX : startPt.x;
          const defaultTurnY = (outPortKey === 'top' && inPortKey === 'top')
            ? Math.min(startPt.y, endPt.y) - 24
            : (outPortKey === 'bottom' && inPortKey === 'bottom')
              ? Math.max(startPt.y, endPt.y) + 24
              : Math.round(startPt.y + (endPt.y - startPt.y) * 0.5);
          vY2 = (custom.corridorY !== undefined) ? custom.corridorY : defaultTurnY;
        }

        if (Math.abs(vY1 - vY2) > 12) {
          const vHandle = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          vHandle.setAttribute('x1', vX);
          vHandle.setAttribute('y1', Math.min(vY1, vY2) + 6);
          vHandle.setAttribute('x2', vX);
          vHandle.setAttribute('y2', Math.max(vY1, vY2) - 6);
          vHandle.setAttribute('stroke', 'transparent');
          vHandle.setAttribute('stroke-width', '18');
          vHandle.setAttribute('class', 'bpmn-arrow-corridor-handle-v');
          vHandle.setAttribute('data-edge-id', edge.id);
          vHandle.setAttribute('title', 'Tarik sudut / garis vertikal ini ke kanan atau ke kiri');

          svg.appendChild(vHandle);
          this.initVerticalCorridorDrag(vHandle, edge, curr, next, pathEl);
        }

        // --- B. Horizontal Segment Handle (Tarik Atas - Bawah) ---
        let cY = (custom.corridorY !== undefined) ? custom.corridorY : endPt.y;
        let cX1 = midX;
        let cX2 = endPt.x;

        if (outPortKey === 'top' || outPortKey === 'bottom') {
          const defaultTurnY = (outPortKey === 'top' && inPortKey === 'top')
            ? Math.min(startPt.y, endPt.y) - 24
            : (outPortKey === 'bottom' && inPortKey === 'bottom')
              ? Math.max(startPt.y, endPt.y) + 24
              : Math.round(startPt.y + (endPt.y - startPt.y) * 0.5);
          cY = (custom.corridorY !== undefined) ? custom.corridorY : defaultTurnY;
          cX1 = startPt.x;
          cX2 = endPt.x;
        }

        if (Math.abs(cX1 - cX2) > 12) {
          const corridorHandle = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          corridorHandle.setAttribute('x1', Math.min(cX1, cX2) + 6);
          corridorHandle.setAttribute('y1', cY);
          corridorHandle.setAttribute('x2', Math.max(cX1, cX2) - 6);
          corridorHandle.setAttribute('y2', cY);
          corridorHandle.setAttribute('stroke', 'transparent');
          corridorHandle.setAttribute('stroke-width', '18');
          corridorHandle.setAttribute('class', 'bpmn-arrow-corridor-handle');
          corridorHandle.setAttribute('data-edge-id', edge.id);
          corridorHandle.setAttribute('title', 'Tarik garis siku ini ke atas atau ke bawah');

          svg.appendChild(corridorHandle);
          this.initCorridorSegmentDrag(corridorHandle, edge, curr, next, pathEl);
        }
      }
    });

    // Update active visual indicator on port handles
    this.updateActivePortHandles();
  }

  // Pointer drag & drop interaction to move arrow endpoint between the 4 ports
  // Pointer drag & drop interaction to move arrow endpoint (origin or tip) between the 4 ports
  initArrowEndpointDrag(hitAreaCircle, portType, edge, curr, next, pathEl) {
    let isDragging = false;
    const svg = document.getElementById('bpmnArrowsSvg');
    const lanesBody = document.getElementById('bpmnLanesBody');
    const isStartHandle = (portType === 'fromPort');
    const relevantNode = isStartHandle ? curr : next;

    const onPointerDown = (e) => {
      e.stopPropagation();
      e.preventDefault();
      isDragging = true;
      try {
        hitAreaCircle.setPointerCapture(e.pointerId);
      } catch (err) {}

      // Highlight relevant node and its 4 ports
      const targetNodeEl = document.getElementById(`bpmn-node-${relevantNode.index}`);
      if (targetNodeEl) {
        targetNodeEl.classList.add('arrow-snap-target');
        targetNodeEl.querySelectorAll('.bpmn-port-handle').forEach((h) => h.classList.add('port-drag-available'));
      }

      if (window.retroAudio) window.retroAudio.playClick();
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const bodyRect = lanesBody.getBoundingClientRect();
      const mouseX = e.clientX - bodyRect.left;
      const mouseY = e.clientY - bodyRect.top;

      hitAreaCircle.setAttribute('cx', mouseX);
      hitAreaCircle.setAttribute('cy', mouseY);

      // Find nearest port among relevant node's 4 ports
      let nearestPort = null;
      let minDistance = 55; // snap threshold radius (px)

      if (relevantNode.ports) {
        Object.entries(relevantNode.ports).forEach(([portName, pt]) => {
          const dist = Math.hypot(mouseX - pt.x, mouseY - pt.y);
          if (dist < minDistance) {
            minDistance = dist;
            nearestPort = portName;
          }
        });
      }

      // Visual highlight on relevant node ports
      const targetNodeEl = document.getElementById(`bpmn-node-${relevantNode.index}`);
      if (targetNodeEl) {
        targetNodeEl.querySelectorAll('.bpmn-port-handle').forEach((h) => {
          if (h.dataset.port === nearestPort) {
            h.classList.add('port-hover-snap');
          } else {
            h.classList.remove('port-hover-snap');
          }
        });
      }

      // Live path preview: if near a port, preview the exact clean orthogonal route!
      if (nearestPort) {
        const savedCustom = this.customEdgePorts[edge.id];
        if (isStartHandle) {
          this.customEdgePorts[edge.id] = { ...(savedCustom || {}), fromPort: nearestPort };
        } else {
          this.customEdgePorts[edge.id] = { ...(savedCustom || {}), toPort: nearestPort };
        }
        pathEl.setAttribute('d', this.createOrthogonalPath(curr, next, edge));
        if (savedCustom) {
          this.customEdgePorts[edge.id] = savedCustom;
        } else {
          delete this.customEdgePorts[edge.id];
        }
      } else {
        // Freely pointing to cursor
        const custom = this.customEdgePorts[edge.id] || {};
        if (isStartHandle) {
          let inPortKey = custom.toPort || (edge.isBranchJoin && curr.laneId !== next.laneId ? ((curr.y > next.y) ? 'bottom' : 'top') : 'left');
          const endPt = (next.ports && next.ports[inPortKey]) ? next.ports[inPortKey] : { x: next.endX, y: next.y };
          pathEl.setAttribute('d', `M ${mouseX} ${mouseY} L ${endPt.x} ${endPt.y}`);
        } else {
          let outPortKey = custom.fromPort || (edge.isBranchSplit && curr.laneId !== next.laneId ? ((curr.y < next.y) ? 'bottom' : 'top') : 'right');
          const startPt = (curr.ports && curr.ports[outPortKey]) ? curr.ports[outPortKey] : { x: curr.startX, y: curr.y, dir: 'right' };
          pathEl.setAttribute('d', `M ${startPt.x} ${startPt.y} L ${mouseX} ${mouseY}`);
        }
      }
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        hitAreaCircle.releasePointerCapture(e.pointerId);
      } catch (err) {}

      const bodyRect = lanesBody.getBoundingClientRect();
      const mouseX = e.clientX - bodyRect.left;
      const mouseY = e.clientY - bodyRect.top;

      // Clean up highlights
      const targetNodeEl = document.getElementById(`bpmn-node-${relevantNode.index}`);
      if (targetNodeEl) {
        targetNodeEl.classList.remove('arrow-snap-target');
        targetNodeEl.querySelectorAll('.bpmn-port-handle').forEach((h) => {
          h.classList.remove('port-drag-available', 'port-hover-snap');
        });
      }

      // Detect closest port on relevant node
      let chosenPort = null;
      let minDistance = 60; // generous snap area

      if (relevantNode.ports) {
        Object.entries(relevantNode.ports).forEach(([portName, pt]) => {
          const dist = Math.hypot(mouseX - pt.x, mouseY - pt.y);
          if (dist < minDistance) {
            minDistance = dist;
            chosenPort = portName;
          }
        });
      }

      if (chosenPort) {
        // Successfully snapped onto a port!
        if (isStartHandle) {
          this.setEdgePort(edge.id, chosenPort, null);
        } else {
          this.setEdgePort(edge.id, null, chosenPort);
        }
        if (window.retroAudio) window.retroAudio.playPowerup();
        if (window.game) {
          const sideText = isStartHandle ? 'Pangkal' : 'Ujung';
          window.game.showToast(`${sideText} panah dihubungkan ke titik ${chosenPort.toUpperCase()} Step #${relevantNode.index + 1}!`);
        }
      } else {
        // Redraw back to last established state
        this.drawArrows();
      }
    };

    hitAreaCircle.onpointerdown = onPointerDown;
    hitAreaCircle.onpointermove = onPointerMove;
    hitAreaCircle.onpointerup = onPointerUp;
    hitAreaCircle.onpointercancel = onPointerUp;
  }

  // Pointer drag interaction to move the horizontal bend corridor of an orthogonal line up or down
  initCorridorSegmentDrag(handleEl, edge, curr, next, pathEl) {
    let isDragging = false;
    const lanesBody = document.getElementById('bpmnLanesBody');

    const onPointerDown = (e) => {
      e.stopPropagation();
      e.preventDefault();
      isDragging = true;
      try {
        handleEl.setPointerCapture(e.pointerId);
      } catch (err) {}
      if (window.retroAudio) window.retroAudio.playClick();
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const bodyRect = lanesBody.getBoundingClientRect();
      const mouseY = Math.round(e.clientY - bodyRect.top);

      if (!this.customEdgePorts[edge.id]) {
        this.customEdgePorts[edge.id] = {};
      }
      this.customEdgePorts[edge.id].corridorY = mouseY;

      pathEl.setAttribute('d', this.createOrthogonalPath(curr, next, edge));
      handleEl.setAttribute('y1', mouseY);
      handleEl.setAttribute('y2', mouseY);
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        handleEl.releasePointerCapture(e.pointerId);
      } catch (err) {}

      const bodyRect = lanesBody.getBoundingClientRect();
      let finalY = Math.round(e.clientY - bodyRect.top);

      // Snap logic: jika didekatkan ke startY atau endY (selisih <= 14px)
      const startPtY = curr.ports ? (curr.ports[this.customEdgePorts[edge.id]?.fromPort || 'right']?.y || curr.y) : curr.y;
      const endPtY = next.ports ? (next.ports[this.customEdgePorts[edge.id]?.toPort || 'left']?.y || next.y) : next.y;

      if (Math.abs(startPtY - endPtY) <= 15) {
        // Kedua node di ketinggian yang hampir sama -> snap lurus total!
        delete this.customEdgePorts[edge.id].corridorY;
        this.drawArrows();
      } else if (Math.abs(finalY - startPtY) <= 14) {
        finalY = startPtY;
        this.setEdgeCorridor(edge.id, undefined, finalY);
      } else if (Math.abs(finalY - endPtY) <= 14) {
        finalY = endPtY;
        this.setEdgeCorridor(edge.id, undefined, finalY);
      } else {
        this.setEdgeCorridor(edge.id, undefined, finalY);
      }

      if (window.retroAudio) window.retroAudio.playPowerup();
      if (window.game) {
        window.game.showToast('Garis siku otomatis menjepret lurus!');
      }
    };

    handleEl.onpointerdown = onPointerDown;
    handleEl.onpointermove = onPointerMove;
    handleEl.onpointerup = onPointerUp;
    handleEl.onpointercancel = onPointerUp;
  }

  // Pointer drag interaction to move the vertical bend segment of an orthogonal line left or right (like bpmn.io)
  initVerticalCorridorDrag(handleEl, edge, curr, next, pathEl) {
    let isDragging = false;
    const lanesBody = document.getElementById('bpmnLanesBody');

    const onPointerDown = (e) => {
      e.stopPropagation();
      e.preventDefault();
      isDragging = true;
      try {
        handleEl.setPointerCapture(e.pointerId);
      } catch (err) {}
      if (window.retroAudio) window.retroAudio.playClick();
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const bodyRect = lanesBody.getBoundingClientRect();
      const mouseX = Math.round(e.clientX - bodyRect.left);

      if (!this.customEdgePorts[edge.id]) {
        this.customEdgePorts[edge.id] = {};
      }
      this.customEdgePorts[edge.id].corridorX = mouseX;

      pathEl.setAttribute('d', this.createOrthogonalPath(curr, next, edge));
      handleEl.setAttribute('x1', mouseX);
      handleEl.setAttribute('x2', mouseX);
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        handleEl.releasePointerCapture(e.pointerId);
      } catch (err) {}

      const bodyRect = lanesBody.getBoundingClientRect();
      const finalX = Math.round(e.clientX - bodyRect.left);
      this.setEdgeCorridor(edge.id, finalX, undefined);

      if (window.retroAudio) window.retroAudio.playPowerup();
      if (window.game) {
        window.game.showToast('Posisi sudut vertikal panah berhasil digeser!');
      }
    };

    handleEl.onpointerdown = onPointerDown;
    handleEl.onpointermove = onPointerMove;
    handleEl.onpointerup = onPointerUp;
    handleEl.onpointercancel = onPointerUp;
  }


  updateActivePortHandles() {
    document.querySelectorAll('.bpmn-port-handle').forEach((handle) => {
      handle.classList.remove('port-active');
    });

    Object.keys(this.customEdgePorts).forEach((edgeId) => {
      const custom = this.customEdgePorts[edgeId];
      if (!custom) return;

      // Find step from edgeId
      const match = edgeId.match(/flow-arrow-(\d+)/);
      if (match) {
        const step = parseInt(match[1], 10);
        if (custom.fromPort) {
          const outHandle = document.querySelector(`.bpmn-port-handle[data-step="${step}"][data-port="${custom.fromPort}"]`);
          if (outHandle) outHandle.classList.add('port-active');
        }
        if (custom.toPort) {
          const inHandle = document.querySelector(`.bpmn-port-handle[data-step="${step + 1}"][data-port="${custom.toPort}"]`);
          if (inHandle) inHandle.classList.add('port-active');
        }
      }
    });
  }

  // Calculate safe, bounded coordinate for Mario so he never clips at top or right
  getSafeMarioPosition(targetPos, isVictory = false) {
    const lanesBody = document.getElementById('bpmnLanesBody');
    const maxX = lanesBody ? Math.max(100, lanesBody.clientWidth - 50) : 900;

    let posX = targetPos.x - 20;
    let posY = targetPos.y - 50;

    if (isVictory) {
      posY = targetPos.y - 48;
      posX = targetPos.x + 8;
    }

    // Safety clamp: top margin min 8px, right margin max
    posY = Math.max(8, posY);
    posX = Math.max(10, Math.min(maxX, posX));

    return { x: posX, y: posY };
  }

  // Position Mario at the initial step
  positionMarioAtStart() {
    if (!this.marioEl || this.nodePositions.length === 0) return;
    const startPos = this.nodePositions[0];
    if (startPos) {
      const pos = this.getSafeMarioPosition(startPos);
      this.marioEl.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      this.marioEl.style.opacity = '1';
    }
  }

  // Highlight active node in the diagram during simulation
  highlightStep(stepIndex, isSuccess) {
    document.querySelectorAll('.bpmn-diagram-node').forEach((n) => {
      n.classList.remove('node-eval-active', 'node-eval-success', 'node-eval-error');
    });

    const node = document.getElementById(`bpmn-node-${stepIndex}`);
    if (node) {
      node.classList.add(isSuccess ? 'node-eval-success' : 'node-eval-error');
    }

    const arrowIdsToHighlight = [`flow-arrow-${stepIndex - 1}`];

    if (this.level && this.level.parallelBranch) {
      const pBranch = this.level.parallelBranch;
      const getIdx = (id) => this.cardsInSlots.findIndex((c) => c.id === id);
      const splitIdx = getIdx(pBranch.splitCardId);
      const b1StartIdx = getIdx(pBranch.branch1CardIds[0]);
      const b1EndIdx = getIdx(pBranch.branch1CardIds[pBranch.branch1CardIds.length - 1]);
      const b2StartIdx = getIdx(pBranch.branch2CardIds[0]);
      const b2EndIdx = getIdx(pBranch.branch2CardIds[pBranch.branch2CardIds.length - 1]);
      const joinIdx = getIdx(pBranch.joinCardId);

      if (stepIndex === b1StartIdx) {
        arrowIdsToHighlight.push(`flow-arrow-${splitIdx}-b1`);
      }
      if (stepIndex === b2StartIdx) {
        arrowIdsToHighlight.push(`flow-arrow-${splitIdx}-b2`);
      }
      if (stepIndex === joinIdx) {
        arrowIdsToHighlight.push(`flow-arrow-${b1EndIdx}-join`);
        arrowIdsToHighlight.push(`flow-arrow-${b2EndIdx}-join`);
      }
    } else if (this.level && this.level.exclusiveBranch) {
      const xBranch = this.level.exclusiveBranch;
      const getIdx = (id) => this.cardsInSlots.findIndex((c) => c.id === id);
      const splitIdx = getIdx(xBranch.splitCardId);
      const b1StartIdx = getIdx(xBranch.branch1CardIds[0]);
      const b1EndIdx = getIdx(xBranch.branch1CardIds[xBranch.branch1CardIds.length - 1]);
      const b2StartIdx = getIdx(xBranch.branch2CardIds[0]);
      const b2EndIdx = getIdx(xBranch.branch2CardIds[xBranch.branch2CardIds.length - 1]);
      const joinIdx = getIdx(xBranch.joinCardId);

      if (stepIndex === b1StartIdx) {
        arrowIdsToHighlight.push(`flow-arrow-${splitIdx}-b1`);
      }
      if (stepIndex === b2StartIdx) {
        arrowIdsToHighlight.push(`flow-arrow-${splitIdx}-b2`);
      }
      if (stepIndex === joinIdx) {
        arrowIdsToHighlight.push(`flow-arrow-${b1EndIdx}-join`);
        arrowIdsToHighlight.push(`flow-arrow-${b2EndIdx}-join`);
      }
    }

    arrowIdsToHighlight.forEach((arrowId) => {
      const arrow = document.getElementById(arrowId);
      if (arrow) {
        arrow.classList.add(isSuccess ? 'arrow-success' : 'arrow-bug');
        arrow.setAttribute('marker-end', isSuccess ? 'url(#bpmnArrowHeadActive)' : 'url(#bpmnArrowHeadBug)');
      }
    });
  }

  // Animate Mario traversing to target step node across swimlanes
  animateMarioToStep(stepIndex, isSuccess, speechText, onFinish) {
    if (!this.marioEl || !this.nodePositions[stepIndex]) {
      if (onFinish) onFinish();
      return;
    }

    const targetPos = this.nodePositions[stepIndex];
    const bubble = document.getElementById('marioSpeechBubble');
    const pos = this.getSafeMarioPosition(targetPos);

    // Adapt speech bubble so it never overflows top or right
    if (bubble) {
      if (pos.y < 65) {
        bubble.classList.add('bubble-below');
      } else {
        bubble.classList.remove('bubble-below');
      }

      const lanesBody = document.getElementById('bpmnLanesBody');
      const bodyWidth = lanesBody ? lanesBody.clientWidth : 900;
      if (pos.x > bodyWidth - 170) {
        bubble.classList.add('align-right');
      } else {
        bubble.classList.remove('align-right');
      }
    }

    // Smooth transition
    this.marioEl.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
    this.marioEl.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

    setTimeout(() => {
      this.highlightStep(stepIndex, isSuccess);

      if (!isSuccess && bubble) {
        // Show speech bubble at the node inside that swimlane!
        bubble.innerText = speechText || 'Bug di lane ini!';
        bubble.classList.add('visible');
        setTimeout(() => bubble.classList.remove('visible'), 4000);
      }

      if (onFinish) onFinish();
    }, 480);
  }

  // Course clear victory animation in the swimlane diagram
  animateVictoryClear() {
    if (!this.marioEl) return;
    const lastPos = this.nodePositions[this.nodePositions.length - 1];
    if (lastPos) {
      const pos = this.getSafeMarioPosition(lastPos, true);
      this.marioEl.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(1.15)`;
    }
    const bubble = document.getElementById('marioSpeechBubble');
    if (bubble && lastPos) {
      const pos = this.getSafeMarioPosition(lastPos, true);
      if (pos.y < 65) {
        bubble.classList.add('bubble-below');
      } else {
        bubble.classList.remove('bubble-below');
      }
      const lanesBody = document.getElementById('bpmnLanesBody');
      const bodyWidth = lanesBody ? lanesBody.clientWidth : 900;
      if (pos.x > bodyWidth - 200) {
        bubble.classList.add('align-right');
      } else {
        bubble.classList.remove('align-right');
      }
      bubble.innerText = '⭐ COURSE CLEAR! 100% EFISIENSI!';
      bubble.classList.add('visible');
    }
  }

  // Step-by-step verification runner in the swimlanes
  runVerification(evaluations, onStepCheck, onFinish) {
    this.isAnimating = true;
    let currentIdx = 0;

    const nextStep = () => {
      if (currentIdx >= evaluations.length) {
        // Complete! Course clear
        this.animateVictoryClear();
        window.retroAudio.playVictory();
        setTimeout(() => {
          this.isAnimating = false;
          if (onFinish) onFinish(true, evaluations.length - 1, null);
        }, 1000);
        return;
      }

      const step = evaluations[currentIdx];
      const isSuccess = (step.isOrderCorrect && step.isSymbolCorrect && step.isLaneCorrect);

      let speechMsg = step.card.bugNote;
      if (!step.isLaneCorrect) {
        speechMsg = `Salah swimlane! Pindahkan ke lane yang tepat.`;
      } else if (!step.isSymbolCorrect) {
        speechMsg = `Simbol BPMN salah! Ganti ke simbol yang sesuai.`;
      } else if (!step.isOrderCorrect) {
        speechMsg = `Urutan terbalik! Tukar posisi langkah ini.`;
      }

      this.animateMarioToStep(currentIdx, isSuccess, speechMsg, () => {
        if (onStepCheck) onStepCheck(currentIdx, step);

        if (isSuccess) {
          window.retroAudio.playJump();
          setTimeout(() => window.retroAudio.playCoin(), 100);
          currentIdx++;
          setTimeout(nextStep, 450);
        } else {
          window.retroAudio.playBump();
          setTimeout(() => window.retroAudio.playFail(), 350);
          setTimeout(() => {
            this.isAnimating = false;
            if (onFinish) onFinish(false, currentIdx, step);
          }, 1100);
        }
      });
    };

    nextStep();
  }
}

window.BPMNSwimlaneVisualizer = BPMNSwimlaneVisualizer;
