/**
 * Mario 8-Bit Pixel Canvas Simulator
 * Draws Mario running across pipes and stages, jumping on correct BPMN blocks,
 * bumping on bugs, and sliding down the flagpole on 100% course clear!
 */

class MarioSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.state = 'idle'; // 'idle', 'running', 'jumping', 'bumped', 'flagpole', 'castle'
    this.marioX = 40;
    this.marioY = this.height - 52;
    this.targetX = 40;
    this.frame = 0;
    this.animId = null;

    this.currentStepIndex = 0;
    this.totalSteps = 6;
    this.fireworks = [];

    this.onStepReached = null;
    this.onSimulationEnd = null;

    this.initResize();
    this.render();
  }

  initResize() {
    const resize = () => {
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width > 0) {
        this.canvas.width = rect.width;
        this.width = this.canvas.width;
        this.marioY = this.height - 52;
        this.render();
      }
    };
    window.addEventListener('resize', resize);
    setTimeout(resize, 100);
  }

  // Draw Pixel Art Mario using crisp rectangle matrix
  drawMario(x, y, pose = 'idle') {
    const ctx = this.ctx;
    const p = 2.5; // pixel unit scale
    ctx.save();
    ctx.translate(x, y);

    // Color Palette
    const RED = '#d82800';
    const BROWN = '#8c5200';
    const SKIN = '#fcbc00';
    const BLUE = '#0058f8';
    const WHITE = '#ffffff';

    // 12x16 pixel Mario matrix
    // pose: 'idle', 'run1', 'run2', 'jump', 'bump', 'slide'
    let hat = [
      [3,0],[4,0],[5,0],[6,0],[7,0],
      [2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1]
    ];

    let face = [
      [2,2],[3,2],[5,2],[6,2],[7,2],
      [1,3],[2,3],[3,3],[5,3],[6,3],[7,3],[8,3],
      [1,4],[2,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],
      [2,5],[3,5],[4,5],[5,5],[6,5],[7,5]
    ];

    let hairMustache = [
      [2,2],[3,2],[2,3],[1,4],[2,4],[3,4],
      [4,5],[5,5],[6,5],[7,5],[8,5]
    ];

    let eyes = [[6,2],[7,2]];

    let body = [
      [2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],
      [1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],[8,7],[9,7],
      [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],[9,8],[10,8]
    ];

    let overalls = [
      [3,9],[4,9],[5,9],[6,9],[7,9],
      [2,10],[3,10],[4,10],[5,10],[6,10],[7,10],[8,10],
      [1,11],[2,11],[3,11],[4,11],[5,11],[6,11],[7,11],[8,11],[9,11]
    ];

    let legs = [];
    if (pose === 'idle') {
      legs = [
        [2,12],[3,12],[4,12],[6,12],[7,12],[8,12],
        [1,13],[2,13],[3,13],[7,13],[8,13],[9,13],
        [0,14],[1,14],[2,14],[3,14],[7,14],[8,14],[9,14],[10,14]
      ];
    } else if (pose === 'run1') {
      legs = [
        [1,12],[2,12],[3,12],[7,12],[8,12],
        [0,13],[1,13],[2,13],[8,13],[9,13],
        [0,14],[1,14],[9,14],[10,14]
      ];
    } else if (pose === 'run2') {
      legs = [
        [3,12],[4,12],[5,12],[6,12],[7,12],
        [2,13],[3,13],[4,13],[7,13],[8,13],
        [1,14],[2,14],[8,14],[9,14]
      ];
    } else if (pose === 'jump') {
      legs = [
        [0,11],[1,11],[2,11],[8,11],[9,11],[10,11],
        [0,12],[1,12],[9,12],[10,12],
        [0,13],[1,13],[9,13]
      ];
    } else if (pose === 'bump') {
      legs = [
        [1,12],[2,12],[3,12],[7,12],[8,12],
        [0,13],[1,13],[8,13],[9,13]
      ];
    }

    // Draw helper
    const drawPixels = (arr, color) => {
      ctx.fillStyle = color;
      for (let i = 0; i < arr.length; i++) {
        ctx.fillRect(arr[i][0] * p, arr[i][1] * p, p, p);
      }
    };

    // Draw layers
    drawPixels(hat, RED);
    drawPixels(face, SKIN);
    drawPixels(hairMustache, BROWN);
    drawPixels(eyes, '#000000');
    drawPixels(body, RED);
    drawPixels(overalls, BLUE);
    drawPixels(legs, BROWN);

    // Overalls yellow buttons
    ctx.fillStyle = '#fce400';
    ctx.fillRect(3 * p, 10 * p, p, p);
    ctx.fillRect(7 * p, 10 * p, p, p);

    // If bumped, draw dizzy stars
    if (pose === 'bump') {
      ctx.fillStyle = '#ffe600';
      ctx.font = '10px monospace';
      ctx.fillText('💫', 8, -5);
      ctx.fillText('💥', -12, 10);
    }

    ctx.restore();
  }

  // Draw Ground & Pipe scenery
  drawScenery() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Sky Background gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#5c94fc');
    skyGrad.addColorStop(1, '#94b8fc');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Clouds
    this.drawPixelCloud(60, 20);
    this.drawPixelCloud(w * 0.45, 12);
    this.drawPixelCloud(w * 0.8, 25);

    // Ground: Brick & Dirt layers (Retro Mario Ground)
    const groundHeight = 28;
    const groundY = h - groundHeight;

    // Grass green line
    ctx.fillStyle = '#00a800';
    ctx.fillRect(0, groundY, w, 4);

    // Ground block pattern
    ctx.fillStyle = '#c84c0c';
    ctx.fillRect(0, groundY + 4, w, groundHeight - 4);

    // Brick outlines
    ctx.fillStyle = '#000000';
    for (let x = 0; x < w; x += 16) {
      ctx.fillRect(x, groundY + 4, 1, groundHeight - 4);
      ctx.fillRect(x, groundY + 14, 16, 1);
    }

    // Draw Level Steps Indicators (Warp Pipes or Question Blocks on the track)
    const stepSpacing = (w - 140) / Math.max(1, this.totalSteps);
    for (let i = 0; i < this.totalSteps; i++) {
      const stepX = 70 + i * stepSpacing;
      this.drawStepMarker(stepX, groundY, i + 1, i === this.currentStepIndex);
    }

    // Flagpole at the end
    const flagX = w - 45;
    this.drawFlagpole(flagX, groundY);
  }

  drawPixelCloud(x, y) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(x, y + 10, 12, 0, Math.PI * 2);
    ctx.arc(x + 14, y + 6, 14, 0, Math.PI * 2);
    ctx.arc(x + 28, y + 10, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  drawStepMarker(x, groundY, number, isActive) {
    const ctx = this.ctx;
    // Warp Pipe mini
    const pipeW = 26;
    const pipeH = 22;
    const pipeX = x - pipeW / 2;
    const pipeY = groundY - pipeH;

    // Pipe Lip
    ctx.fillStyle = isActive ? '#48d848' : '#00a800';
    ctx.fillRect(pipeX - 2, pipeY, pipeW + 4, 7);
    ctx.fillStyle = '#006800';
    ctx.fillRect(pipeX - 2, pipeY + 6, pipeW + 4, 1);

    // Pipe Body
    ctx.fillStyle = isActive ? '#24c424' : '#008800';
    ctx.fillRect(pipeX, pipeY + 7, pipeW, pipeH - 7);

    // Highlight
    ctx.fillStyle = '#a8e8a8';
    ctx.fillRect(pipeX + 3, pipeY + 1, 2, 5);
    ctx.fillRect(pipeX + 4, pipeY + 7, 2, pipeH - 7);

    // Step Number Badge on top
    ctx.fillStyle = isActive ? '#ffe600' : '#ffffff';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${number}`, x, pipeY - 6);
  }

  drawFlagpole(x, groundY) {
    const ctx = this.ctx;
    const poleH = 75;
    const poleY = groundY - poleH;

    // Ball on top
    ctx.fillStyle = '#00a800';
    ctx.beginPath();
    ctx.arc(x, poleY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Pole
    ctx.fillStyle = '#9c9c9c';
    ctx.fillRect(x - 2, poleY + 5, 4, poleH - 5);

    // Flag (Triangle)
    const flagY = this.state === 'flagpole' || this.state === 'castle' ? groundY - 24 : poleY + 10;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(x - 2, flagY);
    ctx.lineTo(x - 22, flagY + 10);
    ctx.lineTo(x - 2, flagY + 20);
    ctx.fill();
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawScenery();

    // Determine pose
    let pose = 'idle';
    if (this.state === 'running') {
      pose = (Math.floor(this.frame / 5) % 2 === 0) ? 'run1' : 'run2';
    } else if (this.state === 'jumping') {
      pose = 'jump';
    } else if (this.state === 'bumped') {
      pose = 'bump';
    } else if (this.state === 'flagpole') {
      pose = 'slide';
    }

    this.drawMario(this.marioX, this.marioY, pose);

    // Draw Fireworks if Course Clear
    if (this.fireworks.length > 0) {
      this.updateAndDrawFireworks();
    }
  }

  updateAndDrawFireworks() {
    const ctx = this.ctx;
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const f = this.fireworks[i];
      f.x += f.vx;
      f.y += f.vy;
      f.alpha -= 0.025;
      if (f.alpha <= 0) {
        this.fireworks.splice(i, 1);
        continue;
      }
      ctx.fillStyle = f.color;
      ctx.globalAlpha = f.alpha;
      ctx.fillRect(f.x, f.y, f.size, f.size);
      ctx.globalAlpha = 1.0;
    }
  }

  spawnFireworks(x, y) {
    const colors = ['#ffe600', '#ff3838', '#38b6ff', '#00ff73', '#ff66cc'];
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      this.fireworks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0
      });
    }
  }

  reset(totalSteps = 6) {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.totalSteps = totalSteps;
    this.marioX = 40;
    this.marioY = this.height - 52;
    this.targetX = 40;
    this.state = 'idle';
    this.currentStepIndex = 0;
    this.frame = 0;
    this.fireworks = [];
    this.render();
  }

  // Start step-by-step verification run
  runVerification(stepsEvaluation, onStepCheck, onFinish) {
    this.reset(stepsEvaluation.length);
    this.state = 'running';

    const stepSpacing = (this.width - 140) / Math.max(1, this.totalSteps);
    let currentIdx = 0;

    const moveToStep = () => {
      if (currentIdx >= stepsEvaluation.length) {
        // Complete! Flagpole leap
        this.reachGoal(onFinish);
        return;
      }

      const step = stepsEvaluation[currentIdx];
      this.currentStepIndex = currentIdx;
      const targetX = 70 + currentIdx * stepSpacing;

      // Animate movement to step
      this.animateMoveTo(targetX, () => {
        // Arrived at step: trigger evaluation
        if (onStepCheck) onStepCheck(currentIdx, step);

        if (step.isOrderCorrect && step.isSymbolCorrect) {
          // STEP SUCCESS! Mario jumps with coin
          window.retroAudio.playJump();
          setTimeout(() => window.retroAudio.playCoin(), 120);

          this.state = 'jumping';
          this.animateJump(() => {
            this.state = 'running';
            currentIdx++;
            setTimeout(moveToStep, 350);
          });
        } else {
          // BUG ENCOUNTERED! Mario bumps obstacle
          this.state = 'bumped';
          window.retroAudio.playBump();
          this.render();

          // Wait then end simulation with error info
          setTimeout(() => {
            window.retroAudio.playFail();
            if (onFinish) onFinish(false, currentIdx, step);
          }, 800);
        }
      });
    };

    moveToStep();
  }

  animateMoveTo(targetX, onArrive) {
    const speed = 4;
    const step = () => {
      this.frame++;
      if (Math.abs(this.marioX - targetX) <= speed) {
        this.marioX = targetX;
        this.render();
        if (onArrive) onArrive();
      } else {
        this.marioX += (this.marioX < targetX ? speed : -speed);
        this.render();
        this.animId = requestAnimationFrame(step);
      }
    };
    this.animId = requestAnimationFrame(step);
  }

  animateJump(onFinish) {
    let jumpFrame = 0;
    const initialY = this.height - 52;
    const jumpH = 26;

    const jumpStep = () => {
      jumpFrame++;
      // Parabolic jump arc
      const progress = jumpFrame / 14;
      if (progress >= 1) {
        this.marioY = initialY;
        this.render();
        if (onFinish) onFinish();
      } else {
        this.marioY = initialY - Math.sin(progress * Math.PI) * jumpH;
        this.render();
        this.animId = requestAnimationFrame(jumpStep);
      }
    };
    this.animId = requestAnimationFrame(jumpStep);
  }

  reachGoal(onFinish) {
    const flagX = this.width - 55;
    this.state = 'running';

    this.animateMoveTo(flagX, () => {
      // Mario reaches flagpole!
      this.state = 'flagpole';
      window.retroAudio.playVictory();

      // Fireworks!
      this.spawnFireworks(this.width - 60, 40);
      setTimeout(() => this.spawnFireworks(this.width - 120, 30), 250);
      setTimeout(() => this.spawnFireworks(this.width - 180, 50), 500);

      let fireworksLoop = 0;
      const fLoop = () => {
        if (fireworksLoop < 150) {
          fireworksLoop++;
          this.render();
          requestAnimationFrame(fLoop);
        } else {
          if (onFinish) onFinish(true, this.totalSteps - 1, null);
        }
      };
      fLoop();
    });
  }
}

window.MarioSimulator = MarioSimulator;
