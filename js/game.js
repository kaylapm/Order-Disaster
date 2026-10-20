/**
 * THE ORDER DISASTER! - Core Game Engine
 * Digital Drag & Drop + BPMN Bug Fixer in Super Mario Bros 8-Bit Retro Style
 */

class OrderDisasterGame {
  constructor() {
    this.currentLevelIndex = 0;
    this.currentLevel = null;
    this.cardsInSlots = []; // Array of cards currently in slot order

    // Player Stats
    this.score = 0;
    this.coins = 0;
    this.lives = 3;
    this.timeLeft = 300;
    this.timerInterval = null;
    this.isTimerPaused = false;

    // Interaction State
    this.selectedForSwapIndex = null;
    this.draggedCardIndex = null;
    this.isSimulating = false;
    this.activePopoverCardId = null;

    // DOM Elements
    this.slotsContainer = document.getElementById('flowPipeline');
    this.scoreValEl = document.getElementById('scoreVal');
    this.coinsValEl = document.getElementById('coinsVal');
    this.worldValEl = document.getElementById('worldVal');
    this.timeValEl = document.getElementById('timeVal');
    this.livesValEl = document.getElementById('livesVal');

    this.levelTitleEl = document.getElementById('levelTitle');
    this.levelStoryEl = document.getElementById('levelStory');
    this.levelThemeBadgeEl = document.getElementById('levelThemeBadge');
    this.caseNarrativeTextEl = document.getElementById('caseNarrativeText');
    this.liveToastEl = document.getElementById('liveStatusToast');

    this.swimlaneVisualizer = null;
    this.currentScreen = 'welcomeScreen';
    this.init();
  }

  init() {
    // Initialize BPMN Swimlane Visualizer Engine
    this.swimlaneVisualizer = new BPMNSwimlaneVisualizer('bpmnSwimlaneVisualizer');

    // Render 5 Cases in Case Selection Screen
    this.renderCaseSelectionCards();

    // Setup Event Listeners
    this.setupControlButtons();
    this.setupModals();

    // Prepare first level in background without starting timer
    this.prepareLevel(0);

    // Initial Screen is Welcome Screen
    this.showScreen('welcomeScreen');

    // Auto-start BGM on first user interaction (browser autoplay policy requirement)
    this.setupAutoPlayMusic();
  }

  // Setup autoplay music on first user interaction
  setupAutoPlayMusic() {
    const triggerAudio = () => {
      if (!window.retroAudio) return;
      window.retroAudio.init();

      if (window.retroAudio.ctx && window.retroAudio.ctx.state === 'suspended') {
        window.retroAudio.ctx.resume().catch(() => {});
      }

      if (!window.retroAudio.bgmPlaying || !window.retroAudio.bgmTimer) {
        window.retroAudio.startBGM();
      }
    };

    const onUserInteract = () => {
      triggerAudio();
      ['click', 'keydown', 'touchstart', 'pointerdown', 'mousedown'].forEach((evt) => {
        window.removeEventListener(evt, onUserInteract, true);
        document.removeEventListener(evt, onUserInteract, true);
      });
    };

    ['click', 'keydown', 'touchstart', 'pointerdown', 'mousedown'].forEach((evt) => {
      window.addEventListener(evt, onUserInteract, { once: true, capture: true });
      document.addEventListener(evt, onUserInteract, { once: true, capture: true });
    });

    // Try immediate playback (works if browser previously allowed audio or policy permits)
    triggerAudio();
  }

  // Screen Management (Welcome -> Case Select -> Gameplay POV)
  showScreen(screenId) {
    this.currentScreen = screenId;
    document.querySelectorAll('.screen-view').forEach((s) => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
    }
    window.retroAudio.playPipe();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // If leaving gamePlayScreen, stop running timer so it doesn't run in the background
    if (screenId !== 'gamePlayScreen') {
      this.stopTimer();
    } else {
      // Start or resume timer when actively entering gameplay
      this.startTimer();
    }

    // Sync audio buttons across screens
    this.updateAudioButtonsUI();

    // When entering gameplay, recalculate diagram layout
    if (screenId === 'gamePlayScreen' && this.swimlaneVisualizer) {
      setTimeout(() => {
        this.swimlaneVisualizer.drawArrows();
        this.swimlaneVisualizer.positionMarioAtStart();
      }, 150);
    }
  }

  // Update text & active styles on all SFX and BGM buttons across screens
  updateAudioButtonsUI() {
    const sfxOn = window.retroAudio ? window.retroAudio.sfxEnabled : true;
    const bgmOn = window.retroAudio ? window.retroAudio.bgmPlaying : false;

    document.querySelectorAll('.audio-sfx-btn').forEach((btn) => {
      btn.innerText = sfxOn ? 'SFX: ON' : 'SFX: OFF';
      btn.classList.toggle('active', sfxOn);
    });

    document.querySelectorAll('.audio-bgm-btn').forEach((btn) => {
      btn.innerText = bgmOn ? 'BGM: ON' : 'BGM: OFF';
      btn.classList.toggle('active', bgmOn);
    });
  }

  // Render all 5 cases grouped by level tier (2 in Level 1, 2 in Level 2, 1 in Level 3)
  renderCaseSelectionCards() {
    const container = document.getElementById('casesCardsContainer');
    if (!container) return;
    container.innerHTML = '';

    const tiers = [
      { tier: 1, label: 'LEVEL 1: TINGKAT PEMULA', badgeClass: 'tier-1-badge' },
      { tier: 2, label: 'LEVEL 2: TINGKAT MENENGAH', badgeClass: 'tier-2-badge' },
      { tier: 3, label: 'LEVEL 3: BOSS STAGE / ADVANCED', badgeClass: 'tier-3-badge' }
    ];

    tiers.forEach((t) => {
      const casesInTier = DISASTER_LEVELS.filter((l) => l.levelTier === t.tier);
      if (casesInTier.length === 0) return;

      const groupEl = document.createElement('div');
      groupEl.className = 'case-tier-group';

      const headerEl = document.createElement('div');
      headerEl.className = 'tier-group-header';
      headerEl.innerHTML = `
        <span class="tier-label-badge ${t.badgeClass}">${t.label} (${casesInTier.length} KASUS)</span>
      `;
      groupEl.appendChild(headerEl);

      const gridEl = document.createElement('div');
      gridEl.className = 'cases-tier-grid';

      casesInTier.forEach((levelData) => {
        const globalIdx = DISASTER_LEVELS.findIndex((l) => l.id === levelData.id);

        const cardEl = document.createElement('div');
        cardEl.className = 'case-selection-card';
        cardEl.onclick = () => {
          this.loadLevel(globalIdx);
          this.showScreen('gamePlayScreen');
        };

        const lanesListText = levelData.lanes.map((lane) => lane.name.split(' ')[0]).join(', ');

        cardEl.innerHTML = `
          <div>
            <div class="case-card-top">
              <span class="case-world-tag">${levelData.world}</span>
              <span class="case-tier-pill" style="font-family: 'Press Start 2P'; font-size: 9px; color: #64748b;">LEVEL ${levelData.levelTier}</span>
            </div>
            <div class="case-card-title">${levelData.title}</div>
            <div class="case-card-story">"${levelData.story}"</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 10px; font-weight: 800; color: #0284c7;">
              POOL: ${levelData.pool.name}
            </div>
            <div class="case-card-lanes-preview">
              <span style="color: #64748b;">SWIMLANES:</span> ${lanesListText}
            </div>
            <div class="case-card-footer">
              <span class="case-time-limit">${Math.floor(levelData.timeLimit / 60)} MENIT</span>
              <button type="button" class="btn-play-case">
                MAINKAN KASUS
              </button>
            </div>
          </div>
        `;

        gridEl.appendChild(cardEl);
      });

      groupEl.appendChild(gridEl);
      container.appendChild(groupEl);
    });
  }

  // Render navigation pills for all 5 cases in gameplay banner
  renderLevelPills() {
    const nav = document.getElementById('levelSelectorNav');
    if (!nav) return;
    nav.innerHTML = '';

    DISASTER_LEVELS.forEach((level, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `level-pill-btn ${idx === this.currentLevelIndex ? 'active' : ''}`;
      btn.dataset.levelIndex = idx;
      btn.innerText = `${level.world.replace('WORLD ', '')}: ${level.id.split('-')[0].toUpperCase()}`;
      btn.title = level.title;
      btn.onclick = () => {
        window.retroAudio.playClick();
        this.loadLevel(idx);
      };
      nav.appendChild(btn);
    });
  }

  // Prepare level data and board without starting countdown (used before player enters gameplay)
  prepareLevel(levelIndex) {
    if (levelIndex < 0 || levelIndex >= DISASTER_LEVELS.length) return;
    this.currentLevelIndex = levelIndex;
    this.currentLevel = DISASTER_LEVELS[levelIndex];

    // Deep clone initial cards so original data is unchanged
    this.cardsInSlots = JSON.parse(JSON.stringify(this.currentLevel.initialCards));

    // Update Story, Narrative & HUD
    this.levelTitleEl.innerText = `${this.currentLevel.world}: ${this.currentLevel.title}`;
    this.levelStoryEl.innerText = `"${this.currentLevel.story}"`;
    if (this.caseNarrativeTextEl) {
      this.caseNarrativeTextEl.innerHTML = this.currentLevel.narrative || this.currentLevel.story;
    }
    if (this.levelThemeBadgeEl) {
      this.levelThemeBadgeEl.innerText = `DISASTER: ${this.currentLevel.theme}`;
    }
    this.worldValEl.innerText = this.currentLevel.world.replace('WORLD ', '');

    // Reset Level Timer value without starting interval
    this.stopTimer();
    this.timeLeft = this.currentLevel.timeLimit;
    this.updateHUD();

    // Update Level pill navigation active state for all 5 cases
    this.renderLevelPills();
    this.renderBoard();
  }

  // Load a disaster level (when chosen/played)
  loadLevel(levelIndex) {
    this.prepareLevel(levelIndex);
    // Start countdown if we are currently in gameplay screen
    if (this.currentScreen === 'gamePlayScreen') {
      this.startTimer();
    }
  }

  // Render the BPMN step slots & cards
  renderBoard() {
    if (this.slotsContainer) {
      this.slotsContainer.innerHTML = '';

      this.cardsInSlots.forEach((card, index) => {
        const slotEl = document.createElement('div');
        slotEl.className = 'step-slot';
        slotEl.dataset.slotIndex = index;
        slotEl.id = `slot-${index}`;

        const slotHeader = document.createElement('div');
        slotHeader.className = 'step-slot-header';
        slotHeader.innerHTML = `
          <span class="step-slot-num">STEP ${index + 1}</span>
          <span class="step-slot-connector">${index < this.cardsInSlots.length - 1 ? 'FLOW' : 'FINISH'}</span>
        `;
        slotEl.appendChild(slotHeader);

        const cardEl = this.createCardElement(card, index);
        slotEl.appendChild(cardEl);
        this.bindSlotDropEvents(slotEl, index);
        this.slotsContainer.appendChild(slotEl);
      });
    }

    // Sync with Live BPMN Swimlane Visualizer
    if (this.swimlaneVisualizer) {
      this.swimlaneVisualizer.render(this.currentLevel, this.cardsInSlots);
    }
  }

  // Handle Smartboard / Click tap on diagram node to swap steps
  handleNodeTap(index) {
    if (this.isSimulating) return;
    this.closeAllPopovers();

    if (this.selectedForSwapIndex === null) {
      // Select this node as Swap Source
      this.selectedForSwapIndex = index;
      window.retroAudio.playClick();
      this.renderBoard();
      this.showToast(`Pilih node lain untuk menukar posisi dengan Step ${index + 1}!`);
    } else if (this.selectedForSwapIndex === index) {
      // Deselect
      this.selectedForSwapIndex = null;
      this.renderBoard();
    } else {
      // SWAP with target node!
      this.swapCards(this.selectedForSwapIndex, index);
      this.selectedForSwapIndex = null;
    }
  }

  // Create interactive BPMN card element
  createCardElement(card, index) {
    const cardEl = document.createElement('div');
    cardEl.className = 'bpmn-card';
    cardEl.id = `card-${card.id}`;
    cardEl.draggable = !this.isSimulating;
    cardEl.dataset.cardIndex = index;

    if (this.selectedForSwapIndex === index) {
      cardEl.classList.add('selected-for-swap');
    }

    const currentSymbolKey = (card.currentSymbol || 'task').toUpperCase();
    const symbolInfo = BPMN_SYMBOLS[currentSymbolKey] || BPMN_SYMBOLS.TASK;

    // Card Header with Symbol Badge & Hint Button
    const headerRow = document.createElement('div');
    headerRow.className = 'card-symbol-badge-container';

    // Badge (Click to open quick symbol selector)
    const badgeBtn = document.createElement('button');
    badgeBtn.type = 'button';
    badgeBtn.className = `bpmn-symbol-badge badge-${card.currentSymbol}`;
    badgeBtn.innerHTML = `<span>${symbolInfo.icon}</span> <span>${symbolInfo.name}</span> ▾`;
    badgeBtn.title = 'Klik untuk ganti tipe simbol BPMN';
    badgeBtn.onclick = (e) => {
      e.stopPropagation();
      this.toggleSymbolPopover(card.id, index, badgeBtn);
    };

    // Hint toggle button
    const hintBtn = document.createElement('button');
    hintBtn.type = 'button';
    hintBtn.className = 'card-hint-btn';
    hintBtn.innerHTML = 'HINT';
    hintBtn.title = 'Tampilkan petunjuk bug';
    hintBtn.onclick = (e) => {
      e.stopPropagation();
      this.toggleBugNote(card.id);
    };

    headerRow.appendChild(badgeBtn);
    headerRow.appendChild(hintBtn);
    cardEl.appendChild(headerRow);

    // Lane Badge Indicator (Interactive Button to change Swimlane)
    const currentLane = (this.currentLevel && this.currentLevel.lanes) ? this.currentLevel.lanes.find(l => l.id === card.laneId) : null;
    const laneDisplayName = currentLane ? currentLane.name : (card.laneName || card.laneId);

    const laneBadge = document.createElement('button');
    laneBadge.type = 'button';
    laneBadge.className = 'card-lane-badge';
    laneBadge.innerHTML = `<span>SWIMLANE: <b>${laneDisplayName}</b> ▾</span>`;
    laneBadge.title = 'Klik untuk memindahkan aktivitas ini ke Swimlane lain';
    laneBadge.onclick = (e) => {
      e.stopPropagation();
      this.toggleLanePopover(card.id, index, laneBadge);
    };
    cardEl.appendChild(laneBadge);

    // Card Text Activity
    const textEl = document.createElement('div');
    textEl.className = 'card-activity-text';
    textEl.innerText = card.text;
    cardEl.appendChild(textEl);

    // Card Bug Warning Notice (Hidden by default, shown on hint or verify)
    const bugNoteEl = document.createElement('div');
    bugNoteEl.className = 'card-bug-note';
    bugNoteEl.id = `bug-note-${card.id}`;
    bugNoteEl.innerHTML = `⚠️ <b>Indikasi Bug:</b> ${card.bugNote}`;
    cardEl.appendChild(bugNoteEl);

    // Bind Drag & Touch Events on Card
    this.bindCardInteractions(cardEl, index);

    return cardEl;
  }

  // Toggle Global Symbol Selection Popover (Fixed, Never Clipped)
  toggleSymbolPopover(cardId, cardIndex, anchorEl) {
    if (this.isSimulating) return;
    window.retroAudio.playClick();

    const picker = document.getElementById('globalSymbolPicker');
    const optionsGrid = document.getElementById('pickerOptionsGrid');
    if (!picker || !optionsGrid) return;

    if (this.activePopoverCardId === cardId && picker.classList.contains('visible')) {
      this.closeAllPopovers();
      return;
    }

    this.activePopoverCardId = cardId;
    const card = this.cardsInSlots[cardIndex];

    // Populate all 4 BPMN options clearly
    optionsGrid.innerHTML = '';
    Object.keys(BPMN_SYMBOLS).forEach((symKey) => {
      const sym = BPMN_SYMBOLS[symKey];
      const isSelected = (card.currentSymbol === sym.id);
      const optBtn = document.createElement('div');
      optBtn.className = `picker-option-item ${isSelected ? 'selected' : ''}`;
      optBtn.innerHTML = `
        <div class="picker-opt-icon">${sym.icon}</div>
        <div class="picker-opt-info">
          <div class="picker-opt-name">${sym.name}</div>
          <div class="picker-opt-shape">${sym.shape}</div>
        </div>
      `;
      optBtn.onclick = (e) => {
        e.stopPropagation();
        this.setCardSymbol(cardIndex, sym.id);
        this.closeAllPopovers();
      };
      optionsGrid.appendChild(optBtn);
    });

    // Display and position relative to viewport using anchor element bounds
    picker.style.display = 'flex';
    picker.classList.add('visible');

    const rect = anchorEl.getBoundingClientRect();
    const pickerWidth = 290;
    const pickerHeight = 360;

    let left = rect.left;
    let top = rect.bottom + 8;

    // Viewport containment checks
    if (left + pickerWidth > window.innerWidth - 16) {
      left = window.innerWidth - pickerWidth - 16;
    }
    if (left < 16) left = 16;

    if (top + pickerHeight > window.innerHeight - 16) {
      top = rect.top - pickerHeight - 8;
    }
    if (top < 16) top = 16;

    picker.style.left = `${left}px`;
    picker.style.top = `${top}px`;
  }

  closeAllPopovers() {
    const symPicker = document.getElementById('globalSymbolPicker');
    if (symPicker) {
      symPicker.classList.remove('visible');
      symPicker.style.display = 'none';
    }
    const lanePicker = document.getElementById('globalLanePicker');
    if (lanePicker) {
      lanePicker.classList.remove('visible');
      lanePicker.style.display = 'none';
    }
    this.activePopoverCardId = null;
  }

  // Toggle Global Swimlane Selection Popover
  toggleLanePopover(cardId, cardIndex, anchorEl) {
    if (this.isSimulating) return;
    window.retroAudio.playClick();

    const picker = document.getElementById('globalLanePicker');
    const optionsGrid = document.getElementById('laneOptionsGrid');
    if (!picker || !optionsGrid) return;

    if (this.activePopoverCardId === cardId && picker.classList.contains('visible')) {
      this.closeAllPopovers();
      return;
    }

    this.activePopoverCardId = cardId;
    const card = this.cardsInSlots[cardIndex];

    // Populate all swimlanes for current level
    optionsGrid.innerHTML = '';
    this.currentLevel.lanes.forEach((lane) => {
      const isSelected = (card.laneId === lane.id);
      const optBtn = document.createElement('div');
      optBtn.className = `picker-option-item ${isSelected ? 'selected' : ''}`;
      optBtn.innerHTML = `
        <div class="picker-opt-icon">${lane.icon}</div>
        <div class="picker-opt-info">
          <div class="picker-opt-name">${lane.name}</div>
          <div class="picker-opt-shape">${lane.role}</div>
        </div>
      `;
      optBtn.onclick = (e) => {
        e.stopPropagation();
        this.setCardLane(cardIndex, lane.id);
        this.closeAllPopovers();
      };
      optionsGrid.appendChild(optBtn);
    });

    // Display and position relative to viewport using anchor element bounds
    picker.style.display = 'flex';
    picker.classList.add('visible');

    const rect = anchorEl.getBoundingClientRect();
    const pickerWidth = 290;
    const pickerHeight = 250;

    let left = rect.left;
    let top = rect.bottom + 8;

    if (left + pickerWidth > window.innerWidth - 16) {
      left = window.innerWidth - pickerWidth - 16;
    }
    if (left < 16) left = 16;

    if (top + pickerHeight > window.innerHeight - 16) {
      top = rect.top - pickerHeight - 8;
    }
    if (top < 16) top = 16;

    picker.style.left = `${left}px`;
    picker.style.top = `${top}px`;
  }

  // Update card's assigned Swimlane
  setCardLane(cardIndex, newLaneId) {
    if (!this.cardsInSlots[cardIndex]) return;
    const laneObj = this.currentLevel.lanes.find((l) => l.id === newLaneId);
    this.cardsInSlots[cardIndex].laneId = newLaneId;
    if (laneObj) {
      this.cardsInSlots[cardIndex].laneName = laneObj.name;
    }
    window.retroAudio.playPowerup();
    this.renderBoard();
    this.showToast(`Aktivitas dipindahkan ke ${laneObj ? laneObj.name : newLaneId}!`);
  }

  // Move or swap card directly from the diagram drag-drop
  moveCardInDiagram(sourceStep, targetStep, targetLaneId) {
    if (sourceStep < 0 || sourceStep >= this.cardsInSlots.length) return;

    // Update target swimlane
    if (targetLaneId) {
      this.cardsInSlots[sourceStep].laneId = targetLaneId;
      const laneObj = this.currentLevel.lanes.find((l) => l.id === targetLaneId);
      if (laneObj) {
        this.cardsInSlots[sourceStep].laneName = laneObj.name;
      }
    }

    // If dropped on a different step column, swap the steps
    if (sourceStep !== targetStep && targetStep >= 0 && targetStep < this.cardsInSlots.length) {
      const temp = this.cardsInSlots[sourceStep];
      this.cardsInSlots[sourceStep] = this.cardsInSlots[targetStep];
      this.cardsInSlots[targetStep] = temp;
    }

    window.retroAudio.playPipe();
    this.renderBoard();
    this.showToast(`Aktivitas berhasil dipindahkan ke Swimlane baru!`);
  }

  // Update card's BPMN symbol
  setCardSymbol(cardIndex, newSymbolId) {
    if (!this.cardsInSlots[cardIndex]) return;
    this.cardsInSlots[cardIndex].currentSymbol = newSymbolId;
    window.retroAudio.playPowerup();
    this.renderBoard();
    this.showToast(`Simbol diubah ke ${newSymbolId.toUpperCase()}!`);
  }

  // Toggle hint note
  toggleBugNote(cardId) {
    window.retroAudio.playClick();
    const noteEl = document.getElementById(`bug-note-${cardId}`);
    if (noteEl) {
      noteEl.classList.toggle('visible');
    }
  }

  // Card Touch / Tap-to-Swap & Drag Interactions
  bindCardInteractions(cardEl, index) {
    // 1. SMARTBOARD TAP-TO-SWAP (Touch / Click)
    cardEl.addEventListener('click', (e) => {
      if (this.isSimulating) return;
      this.closeAllPopovers();

      if (this.selectedForSwapIndex === null) {
        // Select this card as Swap Source
        this.selectedForSwapIndex = index;
        window.retroAudio.playClick();
        this.renderBoard();
        this.showToast(`Pilih kartu lain untuk menukar posisi dengan Step ${index + 1}!`);
      } else if (this.selectedForSwapIndex === index) {
        // Deselect
        this.selectedForSwapIndex = null;
        this.renderBoard();
      } else {
        // SWAP with target card!
        this.swapCards(this.selectedForSwapIndex, index);
        this.selectedForSwapIndex = null;
      }
    });

    // 2. HTML5 DRAG EVENTS
    cardEl.addEventListener('dragstart', (e) => {
      if (this.isSimulating) return;
      this.draggedCardIndex = index;
      e.dataTransfer.setData('text/plain', index);
      e.dataTransfer.effectAllowed = 'move';
      cardEl.style.opacity = '0.5';
      window.retroAudio.playClick();
    });

    cardEl.addEventListener('dragend', () => {
      cardEl.style.opacity = '1';
      this.draggedCardIndex = null;
      document.querySelectorAll('.step-slot').forEach((s) => s.classList.remove('drag-over'));
    });
  }

  // Slot Drop Events for HTML5 Drag & Drop
  bindSlotDropEvents(slotEl, targetIndex) {
    slotEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      slotEl.classList.add('drag-over');
    });

    slotEl.addEventListener('dragleave', () => {
      slotEl.classList.remove('drag-over');
    });

    slotEl.addEventListener('drop', (e) => {
      e.preventDefault();
      slotEl.classList.remove('drag-over');
      const sourceIndex = this.draggedCardIndex !== null ? this.draggedCardIndex : parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
        this.swapCards(sourceIndex, targetIndex);
      }
    });
  }

  // Swap two cards in the pipeline
  swapCards(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.cardsInSlots.length || toIndex < 0 || toIndex >= this.cardsInSlots.length) return;

    const temp = this.cardsInSlots[fromIndex];
    this.cardsInSlots[fromIndex] = this.cardsInSlots[toIndex];
    this.cardsInSlots[toIndex] = temp;

    window.retroAudio.playPipe();
    this.renderBoard();
    this.showToast(`Step ${fromIndex + 1} dan Step ${toIndex + 1} berhasil ditukar!`);
  }

  // RUN & VERIFY FLOW SIMULATION (Menit 4.5–6: Check & Reveal)
  runVerification() {
    if (this.isSimulating) return;
    this.isSimulating = true;
    this.closeAllPopovers();
    this.selectedForSwapIndex = null;

    // Reset visual slot states
    document.querySelectorAll('.step-slot').forEach((s) => {
      s.classList.remove('active-eval', 'correct-eval', 'error-eval');
    });

    window.retroAudio.playClick();
    this.showToast('🚀 Mario sedang menguji alur proses bisnismu...');

    // Build Evaluation Array (Order + Symbol + Swimlane)
    const evaluations = this.cardsInSlots.map((card, index) => {
      const expectedCardId = this.currentLevel.correctSequence[index];
      const isOrderCorrect = (card.id === expectedCardId);

      const expectedSymbol = this.currentLevel.correctSymbols[card.id];
      const isSymbolCorrect = (card.currentSymbol === expectedSymbol);

      const expectedLane = this.currentLevel.correctLanes ? this.currentLevel.correctLanes[card.id] : card.laneId;
      const isLaneCorrect = (card.laneId === expectedLane);

      return {
        cardIndex: index,
        card: card,
        expectedCardId: expectedCardId,
        isOrderCorrect: isOrderCorrect,
        expectedSymbol: expectedSymbol,
        isSymbolCorrect: isSymbolCorrect,
        expectedLane: expectedLane,
        isLaneCorrect: isLaneCorrect,
        explanation: this.currentLevel.explanations[card.id] || ''
      };
    });

    // Run Verification directly through the BPMN Swimlane Visualizer Engine
    this.swimlaneVisualizer.runVerification(
      evaluations,
      (currentIdx, stepEval) => {
        // Step arrived callback
        const slotEl = document.getElementById(`slot-${currentIdx}`);
        if (slotEl) {
          slotEl.classList.add('active-eval');
        }

        const isStepSuccess = (stepEval.isOrderCorrect && stepEval.isSymbolCorrect && stepEval.isLaneCorrect);

        if (isStepSuccess) {
          if (slotEl) {
            slotEl.classList.remove('active-eval');
            slotEl.classList.add('correct-eval');
          }
          this.coins++;
          this.score += 150;
          this.updateHUD();
        } else {
          if (slotEl) {
            slotEl.classList.remove('active-eval');
            slotEl.classList.add('error-eval');
          }
        }
      },
      (isAllSuccess, failedIndex, failedStep) => {
        // Finished callback
        this.isSimulating = false;

        if (isAllSuccess) {
          // 100% COURSE CLEAR!
          this.score += 1000 + this.timeLeft * 2;
          this.coins += 5;
          this.updateHUD();
          this.showVictoryModal();
        } else {
          // DISASTER BUG FOUND!
          this.lives = Math.max(0, this.lives - 1);
          this.updateHUD();
          this.showDisasterBugModal(failedIndex, failedStep);
        }
      }
    );
  }

  // Show Disaster Bug Modal without giving away the solutions (just tell them to try again)
  showDisasterBugModal(failedIndex, stepEval) {
    const errorTitle = `MASIH ADA YANG SALAH!`;

    const modalBody = document.getElementById('bugModalBody');
    modalBody.innerHTML = `
      <div style="font-family: 'Press Start 2P', monospace; font-size: 13px; color: #dc2626; margin-bottom: 12px; line-height: 1.4;">
        💥 ${errorTitle}
      </div>
      <div style="font-size: 13.5px; line-height: 1.6; color: #1f2937; margin-bottom: 16px;">
        Alur proses bisnis kamu <b>belum tepat</b>.<br>
        Periksa kembali urutan langkah, simbol BPMN, atau penempatan swimlane-nya.
      </div>
      <div style="background: #fef2f2; border: 2px dashed #f87171; padding: 12px; border-radius: 6px; font-size: 12.5px; color: #991b1b; line-height: 1.5;">
        🔁 <b>Coba lagi (Try Again):</b> Diskusikan bersama tim, teliti kembali cerita kasusnya, dan perbaiki susunan alurmu!
      </div>
    `;

    this.openModal('bugModal');
  }

  // Show Course Clear Victory Modal
  showVictoryModal() {
    const modalBody = document.getElementById('victoryModalBody');

    // Build solution review list
    let reviewHtml = '';
    this.currentLevel.correctSequence.forEach((cardId, idx) => {
      const originalCard = this.currentLevel.initialCards.find((c) => c.id === cardId);
      const symKey = this.currentLevel.correctSymbols[cardId].toUpperCase();
      const sym = BPMN_SYMBOLS[symKey];
      reviewHtml += `
        <div class="solution-item">
          <span style="font-family: 'Press Start 2P'; font-size: 9px; background: #22c55e; color:#fff; padding: 2px 6px; border: 1px solid #000;">#${idx + 1}</span>
          <span>${sym.icon} <b>${sym.name}</b>:</span>
          <span>${originalCard ? originalCard.text : ''}</span>
        </div>
      `;
    });

    modalBody.innerHTML = `
      <div class="victory-hero">
        <div class="course-clear-badge" style="font-family: 'Press Start 2P'; font-size: 11px; color: #166534; background: #dcfce7; padding: 6px 14px; border: 2px solid #16a34a; border-radius: 4px; display: inline-block;">100% EFISIENSI</div>
        <div class="victory-title">COURSE CLEAR!</div>
        <p style="font-size: 13px; font-weight: bold; color: #166534;">
          Efisiensi Alur Proses Bisnis: 100%! Semua Bug Teratasi!
        </p>

        <div class="victory-stats">
          <div>SKOR: ${this.score}</div>
          <div>KOIN: ${this.coins}</div>
          <div>SISA WAKTU: ${this.timeLeft}s</div>
        </div>
      </div>

      <div style="font-family: 'Press Start 2P', monospace; font-size: 10px; color: #1e3a8a; margin-top: 8px;">
        REVIEW ALUR BPMN RESMI:
      </div>
      <div style="display: flex; justify-content: center; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
        <button class="pixel-btn" style="background: #eab308; color: #000;" onclick="game.closeModal('victoryModal'); game.showScreen('caseSelectScreen');">
          PILIH KASUS LAIN
        </button>
        ${this.currentLevelIndex < DISASTER_LEVELS.length - 1 ? `
          <button class="pixel-btn" style="background: #22c55e; color: #000;" onclick="game.nextLevel()">
            KASUS BERIKUTNYA
          </button>
        ` : `
          <button class="pixel-btn" style="background: var(--mario-coin-gold); color: #000;" onclick="game.closeModal('victoryModal'); game.showScreen('caseSelectScreen');">
            SEMUA 5 KASUS SELESAI!
          </button>
        `}
      </div>
    `;

    this.openModal('victoryModal');
  }

  // Reveal Correct Solution (Check & Reveal Mode for teacher/facilitator at minute 4.5-6)
  revealSolution() {
    window.retroAudio.playPowerup();
    // Auto arrange cards to correct order, correct symbols, and correct swimlanes!
    const newCards = this.currentLevel.correctSequence.map((cardId) => {
      const original = this.currentLevel.initialCards.find((c) => c.id === cardId);
      const correctSymbol = this.currentLevel.correctSymbols[cardId];
      const correctLane = this.currentLevel.correctLanes ? this.currentLevel.correctLanes[cardId] : original.laneId;
      const laneObj = this.currentLevel.lanes.find(l => l.id === correctLane);
      return {
        ...original,
        currentSymbol: correctSymbol,
        laneId: correctLane,
        laneName: laneObj ? laneObj.name : original.laneName
      };
    });

    this.cardsInSlots = newCards;
    this.renderBoard();
    this.showToast('✨ KUNCI JAWABAN TERBUKA: Urutan, Simbol & Swimlane telah diselaraskan 100%!');
  }

  // Reset current board back to disaster state
  resetCurrentLevel() {
    window.retroAudio.playPipe();
    this.loadLevel(this.currentLevelIndex);
  }

  // Next level progression
  nextLevel() {
    this.closeModal('victoryModal');
    if (this.currentLevelIndex < DISASTER_LEVELS.length - 1) {
      this.loadLevel(this.currentLevelIndex + 1);
    }
  }

  // Timer Management
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerPaused = false;
  }

  startTimer() {
    this.stopTimer();

    this.timerInterval = setInterval(() => {
      if (this.isTimerPaused) return;

      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateHUD();

        // Audio warning when time is critical (< 30s)
        if (this.timeLeft <= 30 && this.timeLeft % 2 === 0) {
          window.retroAudio.playTick();
        }
      } else {
        // Time Over!
        clearInterval(this.timerInterval);
        window.retroAudio.playFail();
        this.showToast('⏰ WAKTU HABIS! Mari kita Check & Reveal hasilnya!');
        this.runVerification();
      }
    }, 1000);
  }

  togglePauseTimer() {
    this.isTimerPaused = !this.isTimerPaused;
    window.retroAudio.playClick();
    const btn = document.getElementById('pauseTimerBtn');
    if (btn) {
      btn.innerText = this.isTimerPaused ? '▶ RESUME' : '⏸ PAUSE';
      btn.classList.toggle('active', this.isTimerPaused);
    }
    this.showToast(this.isTimerPaused ? 'Timer Dijeda!' : 'Timer Dilanjutkan!');
  }

  addOneMinute() {
    window.retroAudio.playCoin();
    this.timeLeft += 60;
    this.updateHUD();
    this.showToast('+1 Menit Ditambahkan untuk Diskusi!');
  }

  // Update HUD text values
  updateHUD() {
    if (this.scoreValEl) this.scoreValEl.innerText = String(this.score).padStart(6, '0');
    if (this.coinsValEl) this.coinsValEl.innerText = `x${String(this.coins).padStart(2, '0')}`;

    // Format minutes:seconds
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (this.timeValEl) {
      this.timeValEl.innerText = timeFormatted;
      this.timeValEl.classList.toggle('time-warning', this.timeLeft < 45);
    }

    if (this.livesValEl) this.livesValEl.innerText = `x${this.lives}`;
  }

  // Show status toast notification (disabled to prevent black block overlay)
  showToast(text) {
    // Intentionally no-op to eliminate visual noise and overlay obstruction
  }

  // Setup Buttons
  setupControlButtons() {
    // RUN button
    const runBtn = document.getElementById('runVerifyBtn');
    if (runBtn) runBtn.onclick = () => this.runVerification();

    // Briefing button
    const briefBtn = document.getElementById('briefingBtn');
    if (briefBtn) briefBtn.onclick = () => this.openModal('briefingModal');

    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) resetBtn.onclick = () => this.resetCurrentLevel();

    // Reveal Solution button
    const revealBtn = document.getElementById('revealBtn');
    if (revealBtn) revealBtn.onclick = () => this.revealSolution();

    // Pause timer
    const pauseBtn = document.getElementById('pauseTimerBtn');
    if (pauseBtn) pauseBtn.onclick = () => this.togglePauseTimer();

    // +1 min button
    const addTimeBtn = document.getElementById('addTimeBtn');
    if (addTimeBtn) addTimeBtn.onclick = () => this.addOneMinute();

    // Unified Audio Controls (SFX / Soundboard & BGM Music) across all screens
    this.updateAudioButtonsUI();
    if (window.retroAudio) {
      window.retroAudio.onChange(() => this.updateAudioButtonsUI());
    }

    document.querySelectorAll('.audio-sfx-btn').forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (window.retroAudio) {
          const sfxState = window.retroAudio.toggleSFX();
          if (sfxState) window.retroAudio.playCoin();
        }
      };
    });

    document.querySelectorAll('.audio-bgm-btn').forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (window.retroAudio) {
          window.retroAudio.toggleBGM();
        }
      };
    });

    // Fullscreen toggle (Great for Smartboard)
    const fsBtn = document.getElementById('fullscreenBtn');
    if (fsBtn) {
      fsBtn.onclick = () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
          fsBtn.innerText = 'EXIT FS';
        } else {
          document.exitFullscreen().catch(() => {});
          fsBtn.innerText = 'FULLSCREEN';
        }
      };
    }

    // Responsive Layout Mode Switcher (HP, Tablet, Laptop)
    this.setupLayoutModeSwitcher();

    // Screen Navigation Buttons
    const welcomeStartBtn = document.getElementById('welcomeStartBtn');
    if (welcomeStartBtn) {
      welcomeStartBtn.onclick = () => this.showScreen('caseSelectScreen');
    }

    const qBlock = document.querySelector('.pixel-question-block');
    if (qBlock) {
      qBlock.onclick = () => {
        window.retroAudio.playCoin();
        this.coins++;
        this.updateHUD();
      };
    }

    const welcomeBriefingBtn = document.getElementById('welcomeBriefingBtn');
    if (welcomeBriefingBtn) {
      welcomeBriefingBtn.onclick = () => this.openModal('briefingModal');
    }

    const caseSelectBackBtn = document.getElementById('caseSelectBackBtn');
    if (caseSelectBackBtn) {
      caseSelectBackBtn.onclick = () => this.showScreen('welcomeScreen');
    }

    const caseSelectBriefingBtn = document.getElementById('caseSelectBriefingBtn');
    if (caseSelectBriefingBtn) {
      caseSelectBriefingBtn.onclick = () => this.openModal('briefingModal');
    }

    const hudHomeBtn = document.getElementById('hudHomeBtn');
    if (hudHomeBtn) {
      hudHomeBtn.onclick = () => this.showScreen('caseSelectScreen');
    }

    // Close button on global symbol picker
    const closePickerBtn = document.getElementById('closeSymbolPickerBtn');
    if (closePickerBtn) {
      closePickerBtn.onclick = () => this.closeAllPopovers();
    }

    // Close button on global lane picker
    const closeLaneBtn = document.getElementById('closeLanePickerBtn');
    if (closeLaneBtn) {
      closeLaneBtn.onclick = () => this.closeAllPopovers();
    }

    // Close popovers on background click outside pickers
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#globalSymbolPicker') &&
          !e.target.closest('#globalLanePicker') &&
          !e.target.closest('.bpmn-symbol-badge') &&
          !e.target.closest('.card-lane-badge') &&
          !e.target.closest('.node-quick-sym-btn') &&
          !e.target.closest('.node-quick-lane-btn')) {
        this.closeAllPopovers();
      }
    });
    document.addEventListener('keydown', (e) => {
      // Don't intercept if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.runVerification();
      } else if (e.key === 'm' || e.key === 'M') {
        if (soundBtn) soundBtn.click();
      } else if (e.key === 'b' || e.key === 'B') {
        if (bgmBtn) bgmBtn.click();
      } else if (e.key === 'r' || e.key === 'R') {
        this.resetCurrentLevel();
      } else if (e.key === 'f' || e.key === 'F') {
        if (fsBtn) fsBtn.click();
      } else if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach((m) => m.classList.remove('active'));
        this.closeAllPopovers();
      }
    });
  }

  // Modal Setup
  setupModals() {
    // Close buttons on any element with data-modal-close
    document.querySelectorAll('[data-modal-close]').forEach((btn) => {
      btn.onclick = () => {
        window.retroAudio.playClick();
        const modalId = btn.dataset.modalClose;
        this.closeModal(modalId);
      };
    });

    // Close on overlay backdrop click
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          window.retroAudio.playClick();
          overlay.classList.remove('active');
        }
      });
    });
  }

  openModal(modalId) {
    window.retroAudio.playClick();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  // Layout Switcher: HP (Mobile), Tablet, and Laptop (Desktop)
  setupLayoutModeSwitcher() {
    const layoutButtons = document.querySelectorAll('.layout-toggle-btn');
    if (!layoutButtons.length) return;

    // Detect initial screen size to set default mode
    let defaultMode = 'desktop';
    if (window.innerWidth <= 640) {
      defaultMode = 'mobile';
    } else if (window.innerWidth <= 1024) {
      defaultMode = 'tablet';
    }

    // Check localStorage if previously set by user
    const savedMode = localStorage.getItem('orderDisasterLayoutMode') || defaultMode;
    this.setLayoutMode(savedMode, false);

    layoutButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.dataset.layoutMode;
        if (mode) {
          window.retroAudio.playClick();
          this.setLayoutMode(mode, true);
        }
      });
    });

    // Lane Fit / Width Toggle (Wide Scroll vs Fit Screen)
    const laneFitBtns = document.querySelectorAll('[data-lane-fit]');
    const savedLaneFit = localStorage.getItem('orderDisasterLaneFit') || 'wide';
    this.setLaneFitMode(savedLaneFit, false);

    laneFitBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fitMode = btn.dataset.laneFit;
        if (fitMode) {
          window.retroAudio.playClick();
          this.setLaneFitMode(fitMode, true);
        }
      });
    });
  }

  setLaneFitMode(fitMode, showNotification = true) {
    if (fitMode !== 'fit' && fitMode !== 'wide') fitMode = 'wide';

    try {
      localStorage.setItem('orderDisasterLaneFit', fitMode);
    } catch (e) {}

    const body = document.body;
    body.classList.remove('lane-fit-fit', 'lane-fit-wide');
    body.classList.add(`lane-fit-${fitMode}`);

    document.querySelectorAll('[data-lane-fit]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.laneFit === fitMode);
    });

    if (showNotification) {
      const label = fitMode === 'fit' ? '🔍 Mode Muat 1 Layar Penuh' : '↔ Mode Lebar Lega (Scroll Bebas)';
      this.showToast(`Ukuran Jalur: ${label}`);
    }

    if (this.swimlaneVisualizer) {
      setTimeout(() => {
        this.swimlaneVisualizer.calculatePositions();
        this.swimlaneVisualizer.drawArrows();
        this.swimlaneVisualizer.positionMarioAtStart();
      }, 50);
    }
  }

  setLayoutMode(mode, showNotification = true) {
    const validModes = ['mobile', 'tablet', 'desktop'];
    if (!validModes.includes(mode)) mode = 'desktop';

    // Store preference
    try {
      localStorage.setItem('orderDisasterLayoutMode', mode);
    } catch (e) {}

    // Update body classes
    const body = document.body;
    validModes.forEach((m) => body.classList.remove(`layout-mode-${m}`));
    body.classList.add(`layout-mode-${mode}`);

    // Update active button state
    document.querySelectorAll('.layout-toggle-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.layoutMode === mode);
    });

    // Notify user with live toast if triggered manually
    if (showNotification) {
      const modeNames = {
        mobile: '📱 HP (Kompak & Ergonomis)',
        tablet: '📟 Tablet (Proporsional)',
        desktop: '💻 Laptop / Smartboard (Layar Lebar)'
      };
      this.showToast(`Layout diubah ke mode: ${modeNames[mode] || mode}`);
    }

    // Recalculate BPMN diagram sequence flow arrows and Mario positioning
    if (this.swimlaneVisualizer) {
      setTimeout(() => {
        this.swimlaneVisualizer.calculatePositions();
        this.swimlaneVisualizer.drawArrows();
        this.swimlaneVisualizer.positionMarioAtStart();
      }, 50);
    }
  }
}

// Instantiate game after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  window.game = new OrderDisasterGame();
});
