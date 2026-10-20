/**
 * BPMN Swimlane & Pool Visualizer Engine
 * Renders authentic BPMN 2.0 Pools, Swimlanes, Nodes (Start, Task, Gateway, End),
 * Orthogonal Sequence Flow Connectors across lanes, and animated Mario path runner!
 */

class BPMNSwimlaneVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.level = null;
    this.cardsInSlots = [];
    this.nodePositions = []; // Array of { x, y, width, height, laneId, cardId, index }
    this.isAnimating = false;
    this.marioEl = null;

    window.addEventListener('resize', () => {
      if (this.level && this.cardsInSlots.length > 0) {
        this.calculatePositions();
        this.drawArrows();
        this.positionMarioAtStart();
      }
    });
  }

  // Set data and render diagram
  render(level, cardsInSlots) {
    this.level = level;
    this.cardsInSlots = cardsInSlots;
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
          // Empty cell: clean without text clutter, still clickable to move step to this lane
          cell.style.cursor = 'pointer';
          cell.title = `Pindahkan Step ${stepIdx + 1} ke Lane ${lane.name}`;
          cell.onclick = (e) => {
            if (e.target.closest('.bpmn-diagram-node')) return;
            if (window.game && !window.game.isSimulating) {
              window.game.setCardLane(stepIdx, lane.id);
            }
          };
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

    // Node content with Symbol and Swimlane quick switch buttons
    const symbolButtonText = symInfo.shortLabel || symInfo.name.split(' ')[0];
    nodeEl.innerHTML = `
      <div class="node-step-badge">#${stepIndex + 1}</div>
      ${shapeHtml}
      <div class="node-label-caption">${card.text}</div>
      <div class="node-buttons-row">
        <button type="button" class="node-quick-sym-btn" title="Ganti Simbol BPMN">
          ${symbolButtonText} ▾
        </button>
        <button type="button" class="node-quick-lane-btn" title="Pindah Swimlane">
          ${laneNameShort} ▾
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

    // Click handler for swimlane picker
    const laneBtn = nodeEl.querySelector('.node-quick-lane-btn');
    if (laneBtn) {
      laneBtn.onclick = (e) => {
        e.stopPropagation();
        if (window.game) {
          window.game.toggleLanePopover(card.id, stepIndex, laneBtn);
        }
      };
    }

    if (window.game && window.game.selectedForSwapIndex === stepIndex) {
      nodeEl.classList.add('selected-for-swap');
    }

    nodeEl.onclick = (e) => {
      if (e.target.closest('.node-quick-sym-btn') || e.target.closest('.node-quick-lane-btn')) return;
      if (window.game && !window.game.isSimulating) {
        window.game.handleNodeTap(stepIndex);
      }
    };

    return nodeEl;
  }

  // Calculate coordinates of each node shape in the lanes body
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

        this.nodePositions[i] = {
          index: i,
          x: centerX,
          y: centerY,
          startX: shapeRect.right - bodyRect.left, // Right border of the shape
          endX: shapeRect.left - bodyRect.left,   // Left border of the shape
          width: shapeRect.width,
          height: shapeRect.height,
          card: this.cardsInSlots[i],
          laneId: this.cardsInSlots[i].laneId,
          element: nodeEl,
          shapeElement: shapeEl
        };
      }
    }
  }

  // Generate SVG path data for orthogonal BPMN Sequence Flow connecting two shapes
  createOrthogonalPath(curr, next) {
    const isSameLane = (curr.laneId === next.laneId);
    
    // When both nodes are in the same swimlane, use the exact average Y so the line is 100% straight and horizontal
    const startY = isSameLane ? Math.round((curr.y + next.y) / 2) : curr.y;
    const endY = isSameLane ? startY : next.y;
    const startX = curr.startX;
    const endX = next.endX;

    if (startX >= endX) {
      // Loopback or reverse direction with smooth corners
      const midY = (startY + endY) / 2;
      return `M ${startX} ${startY} L ${startX + 12} ${startY} L ${startX + 12} ${midY} L ${endX - 12} ${midY} L ${endX - 12} ${endY} L ${endX} ${endY}`;
    }

    if (isSameLane) {
      // Direct, 100% smooth & straight horizontal line within the same swimlane
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    } else {
      // Orthogonal corner connector with smooth rounded turns between swimlanes
      const midX = Math.round(startX + (endX - startX) * 0.5);
      const radius = Math.min(12, Math.abs(endY - startY) * 0.45, Math.abs(midX - startX) * 0.45);

      if (startY < endY) {
        // Flow going downward to a lower swimlane
        return `M ${startX} ${startY} ` +
               `L ${midX - radius} ${startY} ` +
               `Q ${midX} ${startY} ${midX} ${startY + radius} ` +
               `L ${midX} ${endY - radius} ` +
               `Q ${midX} ${endY} ${midX + radius} ${endY} ` +
               `L ${endX} ${endY}`;
      } else {
        // Flow going upward to an upper swimlane
        return `M ${startX} ${startY} ` +
               `L ${midX - radius} ${startY} ` +
               `Q ${midX} ${startY} ${midX} ${startY - radius} ` +
               `L ${midX} ${endY + radius} ` +
               `Q ${midX} ${endY} ${midX + radius} ${endY} ` +
               `L ${endX} ${endY}`;
      }
    }
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

    // Determine sequence flow edges (supporting BPMN 2.0 Parallel Gateway Split & Join)
    const edges = [];
    const pBranch = this.level ? this.level.parallelBranch : null;

    let isParallelStructureActive = false;
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
          isParallelStructureActive = true;

          // Before split
          for (let i = 0; i < splitIdx; i++) {
            edges.push({ from: i, to: i + 1, id: `flow-arrow-${i}` });
          }

          // Split -> Branch 1 Start (Dapur Oven)
          edges.push({ from: splitIdx, to: b1StartIdx, id: `flow-arrow-${splitIdx}-b1` });

          // Branch 1 internal
          for (let k = 0; k < pBranch.branch1CardIds.length - 1; k++) {
            const fIdx = getIdx(pBranch.branch1CardIds[k]);
            const tIdx = getIdx(pBranch.branch1CardIds[k + 1]);
            edges.push({ from: fIdx, to: tIdx, id: `flow-arrow-${fIdx}` });
          }

          // Branch 1 End -> Join
          edges.push({ from: b1EndIdx, to: joinIdx, id: `flow-arrow-${b1EndIdx}-join` });

          // Split -> Branch 2 Start (Parallel fork ke Kurir!)
          edges.push({ from: splitIdx, to: b2StartIdx, id: `flow-arrow-${splitIdx}-b2` });

          // Branch 2 internal
          for (let k = 0; k < pBranch.branch2CardIds.length - 1; k++) {
            const fIdx = getIdx(pBranch.branch2CardIds[k]);
            const tIdx = getIdx(pBranch.branch2CardIds[k + 1]);
            edges.push({ from: fIdx, to: tIdx, id: `flow-arrow-${fIdx}` });
          }

          // Branch 2 End -> Join (Kurir armada -> Rejoin)
          edges.push({ from: b2EndIdx, to: joinIdx, id: `flow-arrow-${b2EndIdx}-join` });

          // After join
          for (let i = joinIdx; i < this.nodePositions.length - 1; i++) {
            edges.push({ from: i, to: i + 1, id: `flow-arrow-${i}` });
          }
        }
      }
    }

    if (!isParallelStructureActive) {
      // Default linear connections
      for (let i = 0; i < this.nodePositions.length - 1; i++) {
        edges.push({ from: i, to: i + 1, id: `flow-arrow-${i}` });
      }
    }

    // Render each edge as an SVG orthogonal sequence flow
    edges.forEach((edge) => {
      const curr = this.nodePositions[edge.from];
      const next = this.nodePositions[edge.to];
      if (!curr || !next) return;

      const pathD = this.createOrthogonalPath(curr, next);
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', pathD);
      pathEl.setAttribute('class', 'bpmn-sequence-flow-path');
      pathEl.setAttribute('id', edge.id);
      pathEl.setAttribute('marker-end', 'url(#bpmnArrowHead)');

      svg.appendChild(pathEl);
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
