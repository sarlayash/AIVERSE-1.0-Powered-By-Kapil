/**
 * SARLAYASH PRODUCTIONS PRESENTS: AIVERSE 1.0 (Powered By Kapil)
 * Main Game Controller
 * Orchestrates Board, Chess Agents, Bot Sparring, Multiplayer, Badges, 
 * Theme Toggling, User Onboarding & Avatars, Cinematic Level Transitions, and UI.
 */

class SynapseApp {
  constructor() {
    this.board = new NeuralBoard(CONFIG.GRID_SIZE);
    this.chessSystem = new ChessAgentSystem(this.board);
    this.botAI = new BotAI('DEEPSEEKER');
    this.multiplayer = null;

    // Theme & User Profile State
    this.theme = localStorage.getItem('aiverse_theme') || 'dark';
    this.userName = localStorage.getItem('aiverse_user_name') || localStorage.getItem('synapse_user_name') || 'Lead AI Architect';
    this.selectedAvatar = JSON.parse(localStorage.getItem('aiverse_avatar') || 'null') || (CONFIG.AVATARS && CONFIG.AVATARS[0]) || { id: 'av_synapse', name: 'Dr. Synapse', role: 'Chief Neural Architect', icon: '🧠', color: '#00f0ff' };
    this.completedLevels = JSON.parse(localStorage.getItem('aiverse_completed_levels') || '[]');

    // Game State
    this.currentMode = 'CAMPAIGN'; // 'CAMPAIGN', 'SPARRING_BOT', 'PASS_AND_PLAY', 'ONLINE_ROOM', 'TIMED'
    this.currentLevelIdx = 0;
    this.currentLevel = LEVELS_DATA[0];

    this.score = 0;
    this.loss = 0.50; // Initial loss
    this.movesLeft = 25;
    this.timeLeft = null;
    this.timerInterval = null;
    this.activePlayer = 'P1'; // 'P1' (Blue Swarm) or 'P2' (Red Collective)
    this.comboChain = 1;
    this.tokenStats = {};
    this.unlockedLevels = 1;

    // Interaction State
    this.selectedCell = null; // { r, c }
    this.selectedPiece = null; // piece object
    this.validPieceMoves = []; // array of { r, c }
    this.isProcessingTurn = false;

    // Announcements
    this.announcements = [
      'SARLAYASH PRODUCTIONS PRESENTS: Welcome to AIVERSE 1.0 Powered By Kapil!',
      '💡 Founder’s Vision: "Build more. Teach more. Learn every day." — Read the Note from Kapil below!',
      '🎖️ Milestone Badges: Complete Levels 1–10 to unlock verified badges for each AI architecture paradigm.',
      '🎓 60-Minute Assessment: 200 Industry-standard MCQs across Classical ML, GenAI, and Agentic AI. 90% required to pass!',
      '🔒 Official Certificate: Accredited to Google Cloud & Microsoft Azure standards, unlocked only after passing the exam.',
      '🍬 Candy Crush + ♟️ Chess + 🍄 Mario: Cascades, strategic piece harvesting, and power-up discovery combined!'
    ];
    this.announcementIndex = 0;
    this.announcementInterval = null;
    this.priorityAnnouncementTimeout = null;

    // PWA Install Prompt
    this.deferredInstallPrompt = null;

    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.updateUserProfileHeader();
    this.setupAnnouncements();
    this.setupMultiplayer();
    this.setupEventListeners();
    this.setupPwa();

    // Check if first-time user: trigger onboarding modal
    if (!localStorage.getItem('aiverse_onboarded')) {
      setTimeout(() => this.showOnboardingModal(), 200);
    }

    this.loadLevel(this.currentLevelIdx);
    this.renderCodex();
    this.updateLog('✨ SARLAYASH PRODUCTIONS PRESENTS: AIVERSE 1.0 (Powered By Kapil) initialized.');
  }

  // --- THEME SWITCHER (Light & Dark Mode) ---
  applyTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('aiverse_theme', theme);

    const toggleBtn = document.getElementById('btn-theme-toggle');
    if (toggleBtn) {
      toggleBtn.innerHTML = theme === 'light' ? '🌙 Dark' : '☀️ Light';
      toggleBtn.title = `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`;
    }
  }

  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    this.showAnnouncement(`🎨 Theme switched to ${newTheme.toUpperCase()} mode.`);
  }

  // --- USER PROFILE & AVATAR SELECTION ---
  updateUserProfileHeader() {
    const nameEl = document.getElementById('header-user-name');
    const iconEl = document.getElementById('header-avatar-icon');
    if (nameEl) nameEl.textContent = this.userName;
    if (iconEl) iconEl.textContent = this.selectedAvatar?.icon || '🧠';

    const certNameInput = document.getElementById('cert-user-name');
    if (certNameInput) certNameInput.value = this.userName;
  }

  showOnboardingModal() {
    const modal = document.getElementById('modal-onboarding');
    if (!modal) return;

    const nameInput = document.getElementById('onboarding-user-name');
    if (nameInput) nameInput.value = this.userName;

    const avatarGrid = document.getElementById('onboarding-avatar-grid');
    if (avatarGrid && CONFIG.AVATARS) {
      avatarGrid.innerHTML = '';
      CONFIG.AVATARS.forEach(av => {
        const card = document.createElement('div');
        card.className = `avatar-card ${this.selectedAvatar?.id === av.id ? 'selected' : ''}`;
        card.innerHTML = `
          <div class="avatar-card-icon">${av.icon}</div>
          <div class="avatar-card-name">${av.name}</div>
          <div class="avatar-card-role">${av.role}</div>
        `;
        card.addEventListener('click', () => {
          this.selectedAvatar = av;
          avatarGrid.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        });
        avatarGrid.appendChild(card);
      });
    }

    modal.classList.add('active');
  }

  saveOnboarding() {
    const nameInput = document.getElementById('onboarding-user-name');
    const nameVal = nameInput ? nameInput.value.trim() : '';
    if (nameVal) {
      this.userName = nameVal;
    }
    localStorage.setItem('aiverse_user_name', this.userName);
    localStorage.setItem('synapse_user_name', this.userName);
    localStorage.setItem('aiverse_avatar', JSON.stringify(this.selectedAvatar));
    localStorage.setItem('aiverse_onboarded', 'true');

    this.updateUserProfileHeader();
    document.getElementById('modal-onboarding')?.classList.remove('active');
    this.showAnnouncement(`👋 Welcome Candidate ${this.userName} (${this.selectedAvatar.name}) to AIVERSE 1.0!`);
    if (window.soundEngine) soundEngine.playPowerup();
  }

  // --- ANNOUNCEMENTS SYSTEM ---
  setupAnnouncements() {
    const textEl = document.getElementById('announcement-text');
    if (textEl && this.announcements.length > 0) {
      textEl.textContent = this.announcements[0];
    }

    if (this.announcementInterval) clearInterval(this.announcementInterval);
    this.announcementInterval = setInterval(() => {
      this.rotateAnnouncement();
    }, 7500);
  }

  rotateAnnouncement() {
    const textEl = document.getElementById('announcement-text');
    if (!textEl) return;
    this.announcementIndex = (this.announcementIndex + 1) % this.announcements.length;
    textEl.style.opacity = '0';
    setTimeout(() => {
      textEl.textContent = this.announcements[this.announcementIndex];
      textEl.style.opacity = '1';
    }, 300);
  }

  showAnnouncement(msg) {
    const textEl = document.getElementById('announcement-text');
    if (!textEl) return;
    if (this.priorityAnnouncementTimeout) clearTimeout(this.priorityAnnouncementTimeout);
    textEl.style.opacity = '0';
    setTimeout(() => {
      textEl.textContent = msg;
      textEl.style.opacity = '1';
    }, 200);

    this.priorityAnnouncementTimeout = setTimeout(() => {
      this.rotateAnnouncement();
    }, 9000);
  }

  // --- CINEMATIC LEVEL LOADING SCREEN ---
  showLevelLoadingScreen(lvl, callback) {
    const loader = document.getElementById('cinematic-level-loader');
    if (!loader) {
      if (callback) callback();
      return;
    }

    const titleEl = document.getElementById('cinematic-level-title');
    const conceptEl = document.getElementById('cinematic-level-concept');
    const goalEl = document.getElementById('cinematic-level-goal');
    const barFill = document.getElementById('cinematic-progress-bar');

    const lvlNumber = lvl.id > 100 ? `BLITZ ${lvl.id - 100}` : `LEVEL ${lvl.id}`;
    if (titleEl) titleEl.textContent = `LOADING ${lvlNumber}`;
    if (conceptEl) conceptEl.textContent = lvl.conceptTitle || lvl.title;
    if (goalEl) goalEl.textContent = `Objective: ${lvl.goalText}`;
    if (barFill) barFill.style.width = '0%';

    loader.classList.add('active');

    setTimeout(() => {
      if (barFill) barFill.style.width = '100%';
    }, 50);

    setTimeout(() => {
      loader.classList.remove('active');
      if (barFill) barFill.style.width = '0%';
      if (callback) callback();
    }, 650);
  }

  setupMultiplayer() {
    this.multiplayer = new MultiplayerManager(
      (moveData, sender) => this.handleRemoteMove(moveData, sender),
      (status, message) => this.handleMultiplayerStatus(status, message)
    );
  }

  setupEventListeners() {
    // Mode Switcher Buttons
    document.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.target.getAttribute('data-mode');
        this.switchMode(mode);
      });
    });

    // Theme Toggle
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // User Profile / Avatar
    const profileBtn = document.getElementById('btn-user-profile');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => this.showOnboardingModal());
    }

    // Save Onboarding
    const saveOnboardBtn = document.getElementById('btn-save-onboarding');
    if (saveOnboardBtn) {
      saveOnboardBtn.addEventListener('click', () => this.saveOnboarding());
    }

    // Scroll to Note from Kapil section
    const navFounderBtn = document.getElementById('btn-nav-founder');
    if (navFounderBtn) {
      navFounderBtn.addEventListener('click', () => {
        const sec = document.getElementById('section-founder-note');
        if (sec) {
          sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const card = sec.querySelector('.founder-card-inner');
          if (card) {
            card.style.borderColor = 'var(--cyan-glow)';
            card.style.boxShadow = '0 0 40px rgba(0, 240, 255, 0.6)';
            setTimeout(() => {
              card.style.borderColor = '';
              card.style.boxShadow = '';
            }, 1400);
          }
        }
      });
    }

    // Actions from Founder's Note
    const btnFounderPlay = document.getElementById('btn-founder-play');
    if (btnFounderPlay) {
      btnFounderPlay.addEventListener('click', () => {
        document.getElementById('game-board')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    const btnFounderExam = document.getElementById('btn-founder-exam');
    if (btnFounderExam) {
      btnFounderExam.addEventListener('click', () => {
        if (window.examPortal) window.examPortal.startExam();
      });
    }

    const btnFounderCodex = document.getElementById('btn-founder-codex');
    if (btnFounderCodex) {
      btnFounderCodex.addEventListener('click', () => {
        document.getElementById('modal-codex')?.classList.add('active');
      });
    }

    // Sound toggle
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isMuted = soundEngine.toggleMute();
        soundBtn.innerHTML = isMuted ? '🔇 Muted' : '🔊 Sound On';
      });
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-backdrop');
        if (modal) modal.classList.remove('active');
      });
    });

    // Open Codex / Vault
    const codexBtn = document.getElementById('btn-open-codex');
    if (codexBtn) {
      codexBtn.addEventListener('click', () => {
        document.getElementById('modal-codex').classList.add('active');
      });
    }

    // Open Exam Portal from Header
    const examBtn = document.getElementById('btn-open-exam');
    if (examBtn) {
      examBtn.addEventListener('click', () => {
        if (window.examPortal) {
          window.examPortal.startExam();
        }
      });
    }

    // Take Exam from Certificate Lock Banner
    const certTakeExamBtn = document.getElementById('btn-cert-take-exam');
    if (certTakeExamBtn) {
      certTakeExamBtn.addEventListener('click', () => {
        document.getElementById('modal-certificates')?.classList.remove('active');
        if (window.examPortal) {
          window.examPortal.startExam();
        }
      });
    }

    // Open Certificate Modal
    const certBtn = document.getElementById('btn-open-certs');
    if (certBtn) {
      certBtn.addEventListener('click', () => {
        this.openCertificateModal();
      });
    }

    // Download App ZIP
    const dlZipBtn = document.getElementById('btn-download-app');
    if (dlZipBtn) {
      dlZipBtn.addEventListener('click', () => {
        window.location.href = '/api/download-app-zip';
      });
    }

    // Certificate Name Input change
    const nameInput = document.getElementById('cert-user-name');
    if (nameInput) {
      nameInput.value = this.userName;
      nameInput.addEventListener('input', (e) => {
        this.userName = e.target.value.trim() || 'AI Architect';
        localStorage.setItem('synapse_user_name', this.userName);
        localStorage.setItem('aiverse_user_name', this.userName);
        this.updateUserProfileHeader();
        this.updateCertPreview();
      });
    }

    // Certificate Download PNG (Strict Gate Check)
    const dlCertPngBtn = document.getElementById('btn-dl-cert-png');
    if (dlCertPngBtn) {
      dlCertPngBtn.addEventListener('click', () => {
        const isCertUnlocked = window.examPortal ? window.examPortal.isCertificateUnlocked() : (localStorage.getItem('aiverse_cert_unlocked') === 'true');
        if (!isCertUnlocked) {
          alert('🔒 CERTIFICATE LOCKED!\nYou must pass the 60-Minute 200 MCQ Assessment with ≥ 90% (180/200) to download this official credential.');
          return;
        }

        const examScore = parseInt(localStorage.getItem('aiverse_exam_score') || '185', 10);
        const canvas = certificateEngine.renderCertificateCanvas({
          userName: this.userName,
          avatar: this.selectedAvatar,
          tierTitle: CONFIG.CERTIFICATES[0].title,
          tierLevel: 10,
          score: this.score,
          examScore: examScore
        });
        certificateEngine.downloadCanvasAsPng(canvas, `AIVERSE-1.0-Master-Certificate-${this.userName.replace(/\s+/g, '_')}.png`);
      });
    }

    // Certificate Download PDF (Strict Gate Check)
    const dlCertPdfBtn = document.getElementById('btn-dl-cert-pdf');
    if (dlCertPdfBtn) {
      dlCertPdfBtn.addEventListener('click', () => {
        const isCertUnlocked = window.examPortal ? window.examPortal.isCertificateUnlocked() : (localStorage.getItem('aiverse_cert_unlocked') === 'true');
        if (!isCertUnlocked) {
          alert('🔒 CERTIFICATE LOCKED!\nYou must pass the 60-Minute 200 MCQ Assessment with ≥ 90% (180/200) to download this official credential.');
          return;
        }

        const examScore = parseInt(localStorage.getItem('aiverse_exam_score') || '185', 10);
        certificateEngine.downloadCertificateAsPdf({
          userName: this.userName,
          avatar: this.selectedAvatar,
          tierTitle: CONFIG.CERTIFICATES[0].title,
          tierLevel: 10,
          score: this.score,
          examScore: examScore
        }, `AIVERSE-1.0-Master-Certificate-${this.userName.replace(/\s+/g, '_')}.pdf`);
      });
    }

    // Multiplayer Room actions
    const btnCreateRoom = document.getElementById('btn-create-room');
    if (btnCreateRoom) {
      btnCreateRoom.addEventListener('click', () => {
        this.multiplayer.createRoom();
      });
    }

    const btnJoinRoom = document.getElementById('btn-join-room');
    if (btnJoinRoom) {
      btnJoinRoom.addEventListener('click', () => {
        const code = document.getElementById('input-room-code')?.value;
        if (code) this.multiplayer.joinRoom(code);
      });
    }

    // Bot difficulty selector
    const botSelect = document.getElementById('select-bot-diff');
    if (botSelect) {
      botSelect.addEventListener('change', (e) => {
        this.botAI.setDifficulty(e.target.value);
        this.updateLog(`🤖 AI Sparring Partner updated: ${this.botAI.name}`);
      });
    }
  }

  setupPwa() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      const installBtn = document.getElementById('btn-install-pwa');
      if (installBtn) {
        installBtn.style.display = 'inline-flex';
        installBtn.addEventListener('click', () => {
          if (this.deferredInstallPrompt) {
            this.deferredInstallPrompt.prompt();
            this.deferredInstallPrompt.userChoice.then((choice) => {
              if (choice.outcome === 'accepted') {
                console.log('User accepted PWA installation');
              }
              this.deferredInstallPrompt = null;
              installBtn.style.display = 'none';
            });
          }
        });
      }
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.warn('Service worker registration failed:', err);
      });
    }
  }

  // Load a campaign or timed level with Cinematic Loading Screen
  loadLevel(levelIdx) {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.currentLevelIdx = levelIdx;
    this.currentLevel = LEVELS_DATA[levelIdx];

    // Trigger Cinematic Loading Screen
    this.showLevelLoadingScreen(this.currentLevel);

    this.score = 0;
    this.loss = 0.50;
    this.movesLeft = this.currentLevel.moves;
    this.timeLeft = this.currentLevel.timerSeconds;
    this.activePlayer = 'P1';
    this.comboChain = 1;
    this.tokenStats = {};
    Object.keys(CONFIG.TOKENS).forEach(k => this.tokenStats[k] = 0);

    // Initialize board & pieces
    this.board.init();
    this.chessSystem.initDefaultPieces();

    // Spawn level-specific hazards
    if (this.currentLevel.hazards) {
      this.currentLevel.hazards.forEach(h => {
        this.board.spawnHazard(h.type, h.r, h.c, h.timer || 3);
      });
    }

    // Spawn mystery blocks
    if (this.currentLevel.mysteryBlocks) {
      this.currentLevel.mysteryBlocks.forEach(m => {
        this.board.spawnMysteryBlock(m.r, m.c);
      });
    }

    // Start timer if timed level
    if (this.timeLeft) {
      this.timerInterval = setInterval(() => {
        this.timeLeft--;
        this.updateHud();
        if (this.timeLeft <= 0) {
          clearInterval(this.timerInterval);
          this.checkWinLossCondition(true);
        }
      }, 1000);
    }

    this.renderLevelMenu();
    this.renderBoard();
    this.updateHud();
    this.showIntelToast(this.currentLevel.conceptTitle, this.currentLevel.conceptDesc);
    this.updateLog(`🚀 Loaded ${this.currentLevel.title}. Objective: ${this.currentLevel.goalText}`);
  }

  switchMode(mode) {
    this.currentMode = mode;
    this.multiplayer.setMode(mode);

    document.querySelectorAll('[data-mode]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    const mpSection = document.getElementById('section-multiplayer-controls');
    if (mpSection) {
      mpSection.style.display = mode === 'ONLINE_ROOM' ? 'flex' : 'none';
    }

    const botSection = document.getElementById('section-bot-controls');
    if (botSection) {
      botSection.style.display = mode === 'SPARRING_BOT' ? 'flex' : 'none';
    }

    if (mode === 'TIMED') {
      this.loadLevel(10); // First timed level (index 10)
    } else {
      this.loadLevel(0);
    }
  }

  // Handle cell click on the board
  handleCellClick(r, c) {
    if (this.isProcessingTurn) return;

    // Check if it's currently P2's turn in Bot or Remote mode
    if (this.currentMode === 'SPARRING_BOT' && this.activePlayer === 'P2') return;
    if (this.currentMode === 'ONLINE_ROOM' && this.activePlayer !== this.multiplayer.playerRole) return;

    soundEngine.ensureContext();
    const cell = this.board.getCell(r, c);
    if (!cell) return;

    // 1. If clicking a friendly chess piece
    if (cell.piece && cell.piece.owner === this.activePlayer) {
      if (this.selectedPiece === cell.piece) {
        this.clearSelection();
      } else {
        this.selectedPiece = cell.piece;
        this.selectedCell = null;
        this.validPieceMoves = this.chessSystem.getValidMoves(cell.piece);
        soundEngine.playChessMove();
        this.renderBoard();
        this.updateLog(`♟️ Selected [${cell.piece.type}] at (${r},${c}). ${CONFIG.PIECES[cell.piece.type].moves}`);
      }
      return;
    }

    // 2. If a piece is already selected and user clicks a valid move destination
    if (this.selectedPiece) {
      const isTargetValid = this.validPieceMoves.some(m => m.r === r && m.c === c);
      if (isTargetValid) {
        this.executePieceMove(this.selectedPiece, r, c);
        return;
      } else {
        this.clearSelection();
      }
    }

    // 3. Candy Crush style Token Swap Selection
    if (!this.selectedCell) {
      this.selectedCell = { r, c };
      soundEngine.playSwap();
      this.renderBoard();
    } else {
      const r1 = this.selectedCell.r;
      const c1 = this.selectedCell.c;
      const r2 = r;
      const c2 = c;

      if (r1 === r2 && c1 === c2) {
        this.clearSelection();
        this.renderBoard();
        return;
      }

      if (this.board.canSwap(r1, c1, r2, c2)) {
        this.executeTokenSwap(r1, c1, r2, c2);
      } else {
        soundEngine.playSwap();
        this.flashInvalidSwap(r1, c1, r2, c2);
        this.clearSelection();
        this.renderBoard();
      }
    }
  }

  // Execute Token Swap
  async executeTokenSwap(r1, c1, r2, c2, isRemote = false) {
    this.isProcessingTurn = true;
    this.clearSelection();

    if (!isRemote && this.currentMode === 'ONLINE_ROOM') {
      this.multiplayer.sendMove({ type: 'SWAP', r1, c1, r2, c2 });
    }

    soundEngine.playSwap();
    this.board.swap(r1, c1, r2, c2);
    this.renderBoard();

    await this.resolveCascadeChain();
    this.finishTurnAction();
  }

  // Execute Chess Piece Move
  async executePieceMove(piece, targetR, targetC, isRemote = false) {
    this.isProcessingTurn = true;
    const fromR = piece.r;
    const fromC = piece.c;

    this.clearSelection();

    if (!isRemote && this.currentMode === 'ONLINE_ROOM') {
      this.multiplayer.sendMove({ type: 'PIECE', fromR, fromC, targetR, targetC });
    }

    soundEngine.playChessMove();
    const result = this.chessSystem.movePiece(piece, targetR, targetC);

    if (result) {
      if (result.capturedPiece) {
        soundEngine.playToolExecute();
        this.addScore(500);
        this.updateLog(`💥 [${piece.owner}] captured opponent's [${result.capturedPiece.type}]! +500 Compute`);
      }

      if (result.powerupCollected) {
        soundEngine.playPowerup();
        const pDef = CONFIG.POWERUPS[result.powerupCollected] || { name: result.powerupCollected };
        this.showIntelToast(`Power-Up Acquired!`, `${pDef.name}: ${pDef.desc || 'Boost active!'}`);
        this.updateLog(`🍄 Powerup Activated: ${pDef.name}!`);
      }

      if (result.harvestedToken) {
        this.tokenStats[result.harvestedToken] = (this.tokenStats[result.harvestedToken] || 0) + 1;
        this.addScore(80);
      }

      if (result.promoted) {
        soundEngine.playVictory();
        this.showIntelToast(`Model Promotion!`, `Vector Memory unit reached frontier rank! Promoted to Frontier Evaluator!`);
      }
    }

    this.board.applyGravity();
    this.renderBoard();

    await this.resolveCascadeChain();
    this.finishTurnAction();
  }

  // Cascade resolution loop
  async resolveCascadeChain() {
    let combo = 1;
    while (true) {
      const matches = this.board.findMatches();
      if (matches.length === 0) break;

      const result = this.board.processMatches(matches);

      soundEngine.playMatch(combo);
      if (matches.some(m => m.length >= 4)) {
        soundEngine.playFlashAttention();
      }

      matches.forEach(m => {
        this.tokenStats[m.token] = (this.tokenStats[m.token] || 0) + m.cells.length;
      });

      const comboMultiplier = 1 + (combo - 1) * 0.4;
      const points = Math.round(result.totalScore * comboMultiplier);
      this.addScore(points);

      const lossReduction = 0.008 * result.tokensCleared * comboMultiplier;
      this.loss = Math.max(0.001, parseFloat((this.loss - lossReduction).toFixed(4)));

      this.comboChain = combo;
      this.renderBoard();
      this.updateHud();

      await new Promise(res => setTimeout(res, 220));

      this.board.applyGravity();
      this.renderBoard();

      await new Promise(res => setTimeout(res, 180));
      combo++;
    }
  }

  // Finalize turn actions
  finishTurnAction() {
    if (this.timeLeft === null) {
      this.movesLeft--;
    }

    this.comboChain = 1;
    const exploded = this.board.tickHazards();
    if (exploded > 0) {
      soundEngine.playHallucinationExplode();
      this.loss = Math.min(1.0, parseFloat((this.loss + 0.15 * exploded).toFixed(3)));
      this.updateLog(`⚠️ ${exploded} Hallucination(s) exploded! Training loss surged.`);
    }

    this.updateHud();

    const gameOver = this.checkWinLossCondition();
    if (gameOver) {
      this.isProcessingTurn = false;
      return;
    }

    // Toggle turn if bot or pass and play
    if (this.currentMode === 'SPARRING_BOT') {
      this.activePlayer = 'P2';
      this.updateHud();
      this.scheduleBotTurn();
      return;
    } else if (this.currentMode === 'PASS_AND_PLAY') {
      this.activePlayer = this.activePlayer === 'P1' ? 'P2' : 'P1';
      this.updateHud();
    }

    this.isProcessingTurn = false;
  }

  // AI Bot Turn Execution
  scheduleBotTurn() {
    const delay = Math.floor(Math.random() * 400) + 500;
    setTimeout(() => {
      const decision = this.botAI.computeMove(this.board, this.chessSystem);
      if (decision.thought) {
        this.updateLog(decision.thought);
      }

      if (decision.type === 'SWAP') {
        const { r1, c1, r2, c2 } = decision.data;
        this.executeTokenSwap(r1, c1, r2, c2, true).then(() => {
          this.activePlayer = 'P1';
          this.isProcessingTurn = false;
          this.updateHud();
        });
      } else if (decision.type === 'PIECE') {
        const { piece, dest } = decision.data;
        this.executePieceMove(piece, dest.r, dest.c, true).then(() => {
          this.activePlayer = 'P1';
          this.isProcessingTurn = false;
          this.updateHud();
        });
      } else {
        this.activePlayer = 'P1';
        this.isProcessingTurn = false;
        this.updateHud();
      }
    }, delay);
  }

  // Handle move from remote multiplayer opponent
  handleRemoteMove(moveData, sender) {
    if (moveData.type === 'SWAP') {
      this.executeTokenSwap(moveData.r1, moveData.c1, moveData.r2, moveData.c2, true);
    } else if (moveData.type === 'PIECE') {
      const piece = this.chessSystem.getPieceAt(moveData.fromR, moveData.fromC);
      if (piece) {
        this.executePieceMove(piece, moveData.targetR, moveData.targetC, true);
      }
    }
  }

  handleMultiplayerStatus(status, message) {
    this.updateLog(`[Multiplayer] ${message}`);
    const statusEl = document.getElementById('mp-status-indicator');
    if (statusEl) statusEl.textContent = message;
  }

  // Win / Loss Verification with Strict Milestone Badge Unlocking
  checkWinLossCondition(isTimeout = false) {
    const lvl = this.currentLevel;

    // Check Level Target conditions
    const scoreReached = this.score >= lvl.targetScore;
    const lossReached = this.loss <= lvl.targetLoss;
    const targetTokenReached = !lvl.targetToken || (this.tokenStats[lvl.targetToken] || 0) >= (lvl.targetTokenCount || 0);

    const isVictory = scoreReached && lossReached && targetTokenReached;

    if (isVictory) {
      if (this.timerInterval) clearInterval(this.timerInterval);
      soundEngine.playVictory();
      this.triggerConfetti();

      // Unlock this level's badge progressively!
      if (!this.completedLevels.includes(lvl.id)) {
        this.completedLevels.push(lvl.id);
        localStorage.setItem('aiverse_completed_levels', JSON.stringify(this.completedLevels));
        const badge = CONFIG.LEVEL_BADGES.find(b => b.level === lvl.id);
        if (badge) {
          this.showAnnouncement(`🎖️ Milestone Badge Unlocked: "${badge.title}" for completing Level ${lvl.id}!`);
        }
      }

      // Unlock next level in curriculum
      if (this.currentLevelIdx + 1 < LEVELS_DATA.length) {
        this.unlockedLevels = Math.max(this.unlockedLevels, this.currentLevelIdx + 2);
      }

      this.showVictoryModal();
      return true;
    }

    // Check Game Over
    const outOfMoves = this.movesLeft <= 0 && this.timeLeft === null;
    const outOfTime = isTimeout || (this.timeLeft !== null && this.timeLeft <= 0);

    if (outOfMoves || outOfTime) {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.showDefeatModal();
      return true;
    }

    return false;
  }

  addScore(pts) {
    this.score += pts;
    this.updateHud();
  }

  clearSelection() {
    this.selectedCell = null;
    this.selectedPiece = null;
    this.validPieceMoves = [];
  }

  flashInvalidSwap(r1, c1, r2, c2) {
    const el1 = document.querySelector(`[data-pos="${r1}-${c1}"]`);
    const el2 = document.querySelector(`[data-pos="${r2}-${c2}"]`);
    if (el1) el1.classList.add('shake-error');
    if (el2) el2.classList.add('shake-error');
    setTimeout(() => {
      if (el1) el1.classList.remove('shake-error');
      if (el2) el2.classList.remove('shake-error');
    }, 400);
  }

  // Render the 8x8 Grid
  renderBoard() {
    const boardEl = document.getElementById('game-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    for (let r = 0; r < this.board.size; r++) {
      for (let c = 0; c < this.board.size; c++) {
        const cell = this.board.getCell(r, c);
        const cellEl = document.createElement('div');
        cellEl.className = 'grid-cell';
        cellEl.setAttribute('data-pos', `${r}-${c}`);

        if (this.selectedCell && this.selectedCell.r === r && this.selectedCell.c === c) {
          cellEl.classList.add('selected-token');
        }

        const isValidMove = this.validPieceMoves.some(m => m.r === r && m.c === c);
        if (isValidMove) {
          cellEl.classList.add('valid-dest');
        }

        if (cell.token) {
          const tDef = CONFIG.TOKENS[cell.token];
          const tokenEl = document.createElement('div');
          tokenEl.className = `token-node token-${cell.token.toLowerCase()}`;
          tokenEl.innerHTML = `
            <span class="token-symbol">${tDef.symbol}</span>
            <span class="token-badge">${cell.token.substring(0, 3)}</span>
          `;

          if (cell.special === 'FLASH_ROW' || cell.special === 'FLASH_COL') {
            tokenEl.classList.add('special-flash');
            tokenEl.innerHTML += `<div class="flash-beam-indicator">⚡</div>`;
          } else if (cell.special === 'SINGULARITY') {
            tokenEl.classList.add('special-singularity');
            tokenEl.innerHTML += `<div class="singularity-indicator">🌌</div>`;
          }

          cellEl.appendChild(tokenEl);
        }

        if (cell.piece) {
          const pDef = CONFIG.PIECES[cell.piece.type];
          const pieceEl = document.createElement('div');
          pieceEl.className = `agent-piece piece-${cell.piece.owner.toLowerCase()} ${this.selectedPiece === cell.piece ? 'piece-selected' : ''}`;
          pieceEl.innerHTML = `
            <div class="piece-icon">${pDef.symbol}</div>
            <div class="piece-label">${pDef.badge}</div>
            <div class="piece-hp">${'•'.repeat(cell.piece.hp)}</div>
          `;
          cellEl.appendChild(pieceEl);
        }

        if (cell.hazard) {
          const hDef = CONFIG.HAZARDS[cell.hazard];
          const hazardEl = document.createElement('div');
          hazardEl.className = `hazard-badge hazard-${cell.hazard.toLowerCase()}`;
          hazardEl.innerHTML = `
            <span class="hazard-icon">${hDef.symbol}</span>
            ${cell.hazardTimer > 0 ? `<span class="hazard-timer">${cell.hazardTimer}</span>` : ''}
          `;
          cellEl.appendChild(hazardEl);
        }

        if (cell.powerup) {
          const powerEl = document.createElement('div');
          powerEl.className = 'powerup-mystery-block';
          if (cell.powerup === 'MYSTERY_BLOCK') {
            powerEl.innerHTML = `<span>?</span>`;
          } else {
            const pDef = CONFIG.POWERUPS[cell.powerup] || { symbol: '★' };
            powerEl.innerHTML = `<span>${pDef.symbol}</span>`;
          }
          cellEl.appendChild(powerEl);
        }

        cellEl.addEventListener('click', () => this.handleCellClick(r, c));
        boardEl.appendChild(cellEl);
      }
    }
  }

  // Update Top HUD
  updateHud() {
    const scoreVal = document.getElementById('hud-score');
    if (scoreVal) scoreVal.textContent = this.score.toLocaleString();

    const lossVal = document.getElementById('hud-loss');
    if (lossVal) lossVal.textContent = this.loss.toFixed(3);

    const movesVal = document.getElementById('hud-moves');
    if (movesVal) {
      if (this.timeLeft !== null) {
        movesVal.innerHTML = `⏱️ ${this.timeLeft}s`;
        movesVal.classList.toggle('timer-warning', this.timeLeft < 15);
      } else {
        movesVal.textContent = this.movesLeft;
        movesVal.classList.remove('timer-warning');
      }
    }

    const comboVal = document.getElementById('hud-combo');
    if (comboVal) comboVal.textContent = `${this.comboChain}x Attention`;

    const turnBadge = document.getElementById('hud-turn-badge');
    if (turnBadge) {
      turnBadge.textContent = this.activePlayer === 'P1' ? '🔵 Blue Swarm' : '🔴 Red Collective';
      turnBadge.className = `turn-badge ${this.activePlayer === 'P1' ? 'turn-p1' : 'turn-p2'}`;
    }

    const targetProg = document.getElementById('hud-target-progress');
    if (targetProg && this.currentLevel.targetToken) {
      const cur = this.tokenStats[this.currentLevel.targetToken] || 0;
      const needed = this.currentLevel.targetTokenCount || 1;
      targetProg.textContent = `${CONFIG.TOKENS[this.currentLevel.targetToken].name}: ${cur}/${needed}`;
    }
  }

  updateLog(message) {
    const logBox = document.getElementById('agent-thought-stream');
    if (!logBox) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const time = new Date().toLocaleTimeString();
    entry.innerHTML = `<span class="log-time">[${time}]</span> ${message}`;
    logBox.insertBefore(entry, logBox.firstChild);
    while (logBox.children.length > 25) {
      logBox.removeChild(logBox.lastChild);
    }
  }

  showIntelToast(title, desc) {
    const toast = document.getElementById('intel-toast');
    if (!toast) return;
    document.getElementById('toast-title').textContent = title;
    document.getElementById('toast-desc').textContent = desc;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 6000);
  }

  renderLevelMenu() {
    const levelList = document.getElementById('level-select-list');
    if (!levelList) return;
    levelList.innerHTML = '';

    LEVELS_DATA.forEach((lvl, idx) => {
      const isLocked = idx >= this.unlockedLevels;
      const isCurrent = idx === this.currentLevelIdx;
      const item = document.createElement('button');
      item.className = `level-chip ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`;
      item.innerHTML = `
        <span class="lvl-num">${lvl.id > 100 ? '⏱️' : lvl.id}</span>
        <span class="lvl-title">${lvl.title}</span>
      `;
      if (!isLocked) {
        item.addEventListener('click', () => this.loadLevel(idx));
      }
      levelList.appendChild(item);
    });
  }

  renderCodex() {
    const codexContainer = document.getElementById('codex-content-area');
    if (!codexContainer) return;
    codexContainer.innerHTML = '';

    CODEX_DATA.forEach(section => {
      const secEl = document.createElement('div');
      secEl.className = 'codex-section';
      secEl.innerHTML = `<h3 class="codex-sec-title">${section.category}</h3>`;

      section.topics.forEach(t => {
        const topicEl = document.createElement('div');
        topicEl.className = 'codex-topic-card';
        topicEl.innerHTML = `
          <div class="topic-header">
            <h4>${t.title}</h4>
            <span class="standard-tag">${t.standard}</span>
          </div>
          <p class="topic-summary">${t.summary}</p>
          <p class="topic-details">${t.details}</p>
          <div class="topic-gameplay-tip">💡 <strong>Game Synergy:</strong> ${t.gameplayTip}</div>
        `;
        secEl.appendChild(topicEl);
      });
      codexContainer.appendChild(secEl);
    });

    // Render Quizzes
    const quizArea = document.getElementById('codex-quiz-area');
    if (quizArea) {
      quizArea.innerHTML = '<h3>🎓 AI Competency Mastery Quizzes</h3>';
      CODEX_QUIZZES.forEach((q, qIdx) => {
        const qCard = document.createElement('div');
        qCard.className = 'quiz-card';
        qCard.innerHTML = `
          <p class="quiz-q">${qIdx + 1}. ${q.question}</p>
          <div class="quiz-options">
            ${q.options.map((opt, oIdx) => `
              <button class="quiz-opt-btn" data-qid="${qIdx}" data-oid="${oIdx}">${opt}</button>
            `).join('')}
          </div>
          <div class="quiz-feedback" id="quiz-fb-${qIdx}"></div>
        `;
        quizArea.appendChild(qCard);
      });

      quizArea.querySelectorAll('.quiz-opt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const qid = parseInt(e.target.getAttribute('data-qid'));
          const oid = parseInt(e.target.getAttribute('data-oid'));
          const quiz = CODEX_QUIZZES[qid];
          const fb = document.getElementById(`quiz-fb-${qid}`);

          if (oid === quiz.correctIndex) {
            fb.innerHTML = `✅ <strong>Correct!</strong> ${quiz.explanation} (+${quiz.rewardCompute} Compute)`;
            fb.className = 'quiz-feedback correct';
            this.addScore(quiz.rewardCompute);
            soundEngine.playPowerup();
          } else {
            fb.innerHTML = `❌ Incorrect. Hint: ${quiz.explanation}`;
            fb.className = 'quiz-feedback incorrect';
          }
        });
      });
    }
  }

  openCertificateModal() {
    const modal = document.getElementById('modal-certificates');
    if (!modal) return;
    this.updateCertPreview();
    modal.classList.add('active');
  }

  // Strict Certificate & Badge Locking Previews
  updateCertPreview() {
    const previewContainer = document.getElementById('cert-canvas-preview');
    const lockBanner = document.getElementById('cert-lock-banner');
    const btnDlPdf = document.getElementById('btn-dl-cert-pdf');
    const btnDlPng = document.getElementById('btn-dl-cert-png');

    const isCertUnlocked = window.examPortal ? window.examPortal.isCertificateUnlocked() : (localStorage.getItem('aiverse_cert_unlocked') === 'true');
    const examScore = parseInt(localStorage.getItem('aiverse_exam_score') || '0', 10);

    if (isCertUnlocked) {
      if (lockBanner) lockBanner.classList.add('unlocked');
      if (btnDlPdf) { btnDlPdf.disabled = false; btnDlPdf.style.opacity = '1'; }
      if (btnDlPng) { btnDlPng.disabled = false; btnDlPng.style.opacity = '1'; }
    } else {
      if (lockBanner) lockBanner.classList.remove('unlocked');
      if (btnDlPdf) { btnDlPdf.disabled = true; btnDlPdf.style.opacity = '0.4'; btnDlPdf.title = 'Score ≥90% on Exam to unlock'; }
      if (btnDlPng) { btnDlPng.disabled = true; btnDlPng.style.opacity = '0.4'; btnDlPng.title = 'Score ≥90% on Exam to unlock'; }
    }

    const highestCert = CONFIG.CERTIFICATES[0];
    const canvas = certificateEngine.renderCertificateCanvas({
      userName: this.userName,
      avatar: this.selectedAvatar,
      tierTitle: highestCert.title,
      tierLevel: 10,
      score: this.score,
      examScore: examScore > 0 ? examScore : 185
    });

    if (previewContainer) {
      previewContainer.innerHTML = '';
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      canvas.style.borderRadius = '8px';
      canvas.style.boxShadow = '0 8px 30px rgba(0, 240, 255, 0.2)';
      if (!isCertUnlocked) {
        canvas.style.filter = 'grayscale(85%) opacity(50%)';
      } else {
        canvas.style.filter = 'none';
        canvas.style.opacity = '1';
      }
      previewContainer.appendChild(canvas);
    }

    // Render 10 Milestone Badges with strict level completion gating
    const badgeGrid = document.getElementById('badge-preview-grid');
    if (badgeGrid && CONFIG.LEVEL_BADGES) {
      badgeGrid.innerHTML = '';
      CONFIG.LEVEL_BADGES.forEach(bDef => {
        const isUnlocked = this.completedLevels.includes(bDef.level);
        const bCanvas = certificateEngine.renderBadgeCanvas(bDef, this.userName);

        const card = document.createElement('div');
        card.className = `badge-download-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
          <div class="badge-title">${bDef.title}</div>
          <div class="badge-req" style="color: ${isUnlocked ? 'var(--green-glow)' : 'var(--text-muted)'}; font-weight: 700;">
            ${isUnlocked ? '✅ UNLOCKED' : `🔒 Requires Level ${bDef.level}`}
          </div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">${bDef.desc}</div>
        `;

        bCanvas.style.width = '120px';
        bCanvas.style.height = '120px';
        bCanvas.style.cursor = isUnlocked ? 'pointer' : 'not-allowed';

        if (!isUnlocked) {
          bCanvas.style.filter = 'grayscale(100%) opacity(40%)';
          bCanvas.title = `Locked: Complete Level ${bDef.level} to unlock this badge`;
          bCanvas.addEventListener('click', () => {
            alert(`🔒 This milestone badge is locked! Conquer Level ${bDef.level} in Campaign mode to unlock and download.`);
          });
        } else {
          bCanvas.style.filter = 'none';
          bCanvas.title = 'Click to download high-resolution PNG Badge';
          bCanvas.addEventListener('click', () => {
            certificateEngine.downloadCanvasAsPng(bCanvas, `${bDef.id}-${this.userName.replace(/\s+/g, '_')}.png`);
          });
        }

        card.insertBefore(bCanvas, card.firstChild);
        badgeGrid.appendChild(card);
      });
    }
  }

  showVictoryModal() {
    const modal = document.getElementById('modal-victory');
    if (!modal) return;
    document.getElementById('vic-score').textContent = this.score.toLocaleString();
    document.getElementById('vic-loss').textContent = this.loss.toFixed(3);
    document.getElementById('btn-next-level').onclick = () => {
      modal.classList.remove('active');
      this.loadLevel(Math.min(LEVELS_DATA.length - 1, this.currentLevelIdx + 1));
    };
    modal.classList.add('active');
  }

  showDefeatModal() {
    const modal = document.getElementById('modal-defeat');
    if (!modal) return;
    document.getElementById('btn-retry-level').onclick = () => {
      modal.classList.remove('active');
      this.loadLevel(this.currentLevelIdx);
    };
    modal.classList.add('active');
  }

  triggerConfetti() {
    if (window.confetti) {
      window.confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }
}

// Instantiate on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.synapseApp = new SynapseApp();
});
