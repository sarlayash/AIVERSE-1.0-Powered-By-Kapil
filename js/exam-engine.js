/**
 * SARLAYASH Productions Presents: AIVERSE 1.0 (Powered By Kapil)
 * Timed 60-Minute, 200 MCQs Industry-Standard Examination Portal
 * Passing Score: 90% (180/200 Correct) Required to Unlock Official Certificate
 */

class ExamPortalEngine {
  constructor() {
    const globalQuestions = (typeof window !== 'undefined' && window.FULL_200_EXAM_QUESTIONS) ? window.FULL_200_EXAM_QUESTIONS : (typeof FULL_200_EXAM_QUESTIONS !== 'undefined' ? FULL_200_EXAM_QUESTIONS : []);
    this.questions = globalQuestions;
    this.totalQuestions = 200;
    this.passingPercentage = 90;
    this.passingScore = 180; // 90% of 200
    this.totalTimeSeconds = 60 * 60; // 60 minutes = 3600 seconds

    this.currentQIndex = 0;
    this.userAnswers = {}; // { qId: selectedOptionIndex }
    this.flagged = new Set();
    this.timeRemaining = this.totalTimeSeconds;
    this.timerInterval = null;
    this.isExamActive = false;
    this.isExamSubmitted = false;
    this.finalScore = 0;

    this.init();
  }

  init() {
    this.checkSavedStatus();
    if (typeof document !== 'undefined') {
      this.setupListeners();
    }
  }

  checkSavedStatus() {
    if (typeof localStorage !== 'undefined') {
      const isUnlocked = localStorage.getItem('aiverse_cert_unlocked') === 'true';
      if (isUnlocked) {
        this.finalScore = parseInt(localStorage.getItem('aiverse_exam_score') || '185', 10);
        this.isExamSubmitted = true;
      }
    }
  }

  isCertificateUnlocked() {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('aiverse_cert_unlocked') === 'true';
    }
    return false;
  }

  startExam() {
    const globalQuestions = (typeof window !== 'undefined' && window.FULL_200_EXAM_QUESTIONS) ? window.FULL_200_EXAM_QUESTIONS : (typeof FULL_200_EXAM_QUESTIONS !== 'undefined' ? FULL_200_EXAM_QUESTIONS : []);
    this.questions = globalQuestions;
    this.currentQIndex = 0;
    this.userAnswers = {};
    this.flagged.clear();
    this.timeRemaining = this.totalTimeSeconds;
    this.isExamActive = true;
    this.isExamSubmitted = false;

    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerDisplay();
      if (this.timeRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.submitExam(true); // Auto-submit on timeout
      }
    }, 1000);

    this.renderQuestion(0);
    this.renderNavigator();
    this.updateStats();

    if (typeof document !== 'undefined') {
      const modal = document.getElementById('modal-exam-portal');
      if (modal) modal.classList.add('active');
    }

    // High-priority announcement
    if (typeof window !== 'undefined' && window.synapseApp && window.synapseApp.showAnnouncement) {
      window.synapseApp.showAnnouncement('📝 60-Minute 200 MCQ Assessment in progress! 90% (180/200) required to unlock Master Certificate.');
    }
  }

  updateTimerDisplay() {
    if (typeof document === 'undefined') return;
    const timerEl = document.getElementById('exam-timer-display');
    if (!timerEl) return;

    const mins = Math.floor(this.timeRemaining / 60);
    const secs = this.timeRemaining % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    timerEl.textContent = `⏱️ ${formatted}`;

    if (this.timeRemaining < 300) { // < 5 mins
      timerEl.style.color = '#ff0055';
    } else if (this.timeRemaining < 600) { // < 10 mins
      timerEl.style.color = '#ffbb00';
    } else {
      timerEl.style.color = '#00f0ff';
    }
  }

  renderQuestion(index) {
    if (typeof document === 'undefined') return;
    if (index < 0 || index >= this.questions.length) return;
    this.currentQIndex = index;
    const q = this.questions[index];

    const qNumEl = document.getElementById('exam-q-number');
    const qCatEl = document.getElementById('exam-q-category');
    const qTextEl = document.getElementById('exam-q-text');
    const optionsContainer = document.getElementById('exam-options-container');

    if (qNumEl) qNumEl.textContent = `Question ${index + 1} of 200`;
    if (qCatEl) qCatEl.textContent = q.category;
    if (qTextEl) qTextEl.textContent = q.q;

    if (optionsContainer) {
      optionsContainer.innerHTML = '';
      q.options.forEach((optText, optIdx) => {
        const optBtn = document.createElement('button');
        optBtn.className = 'exam-option-card';
        if (this.userAnswers[q.id] === optIdx) {
          optBtn.classList.add('selected');
        }

        optBtn.innerHTML = `
          <span class="opt-letter">${String.fromCharCode(65 + optIdx)}</span>
          <span class="opt-text">${optText}</span>
        `;

        if (!this.isExamSubmitted) {
          optBtn.addEventListener('click', () => {
            this.userAnswers[q.id] = optIdx;
            this.renderQuestion(this.currentQIndex);
            this.renderNavigator();
            this.updateStats();
          });
        } else {
          // Review mode: show correct & incorrect
          if (optIdx === q.ans) {
            optBtn.classList.add('opt-correct');
          } else if (this.userAnswers[q.id] === optIdx) {
            optBtn.classList.add('opt-wrong');
          }
        }

        optionsContainer.appendChild(optBtn);
      });
    }

    // Flag button state
    const flagBtn = document.getElementById('btn-exam-flag');
    if (flagBtn) {
      flagBtn.classList.toggle('flagged', this.flagged.has(q.id));
      flagBtn.innerHTML = this.flagged.has(q.id) ? '🚩 Flagged' : '🏳️ Flag for Review';
    }

    // Explanation in review mode
    const expEl = document.getElementById('exam-explanation-box');
    if (expEl) {
      if (this.isExamSubmitted) {
        expEl.style.display = 'block';
        expEl.innerHTML = `<strong>💡 Official Explanation:</strong> ${q.explanation}`;
      } else {
        expEl.style.display = 'none';
      }
    }
  }

  toggleFlagCurrent() {
    const q = this.questions[this.currentQIndex];
    if (!q) return;
    if (this.flagged.has(q.id)) {
      this.flagged.delete(q.id);
    } else {
      this.flagged.add(q.id);
    }
    this.renderQuestion(this.currentQIndex);
    this.renderNavigator();
  }

  nextQuestion() {
    if (this.currentQIndex + 1 < this.questions.length) {
      this.renderQuestion(this.currentQIndex + 1);
    }
  }

  prevQuestion() {
    if (this.currentQIndex > 0) {
      this.renderQuestion(this.currentQIndex - 1);
    }
  }

  renderNavigator() {
    if (typeof document === 'undefined') return;
    const navGrid = document.getElementById('exam-nav-grid');
    if (!navGrid) return;
    navGrid.innerHTML = '';

    this.questions.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.className = 'nav-q-box';
      btn.textContent = idx + 1;

      if (idx === this.currentQIndex) {
        btn.classList.add('active');
      }

      if (this.userAnswers[q.id] !== undefined) {
        btn.classList.add('answered');
      }

      if (this.flagged.has(q.id)) {
        btn.classList.add('flagged');
      }

      if (this.isExamSubmitted) {
        if (this.userAnswers[q.id] === q.ans) {
          btn.classList.add('result-correct');
        } else {
          btn.classList.add('result-wrong');
        }
      }

      btn.addEventListener('click', () => {
        this.renderQuestion(idx);
      });

      navGrid.appendChild(btn);
    });
  }

  updateStats() {
    if (typeof document === 'undefined') return;
    const answeredCount = Object.keys(this.userAnswers).length;
    const answeredEl = document.getElementById('exam-stat-answered');
    const remainingEl = document.getElementById('exam-stat-remaining');
    const progressBar = document.getElementById('exam-progress-bar');

    if (answeredEl) answeredEl.textContent = `${answeredCount} / 200`;
    if (remainingEl) remainingEl.textContent = `${200 - answeredCount} Left`;
    if (progressBar) progressBar.style.width = `${(answeredCount / 200) * 100}%`;
  }

  submitExam(isAuto = false) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.isExamActive = false;
    this.isExamSubmitted = true;

    // Calculate score
    let correct = 0;
    this.questions.forEach(q => {
      if (this.userAnswers[q.id] === q.ans) {
        correct++;
      }
    });

    this.finalScore = correct;
    const percentage = ((correct / 200) * 100).toFixed(1);
    const passed = correct >= this.passingScore;

    if (passed) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('aiverse_cert_unlocked', 'true');
        localStorage.setItem('aiverse_exam_score', correct.toString());
        localStorage.setItem('aiverse_exam_date', new Date().toLocaleDateString());
      }

      if (typeof window !== 'undefined') {
        if (window.soundEngine) soundEngine.playVictory();
        if (window.synapseApp) {
          if (window.synapseApp.triggerConfetti) window.synapseApp.triggerConfetti();
          if (window.synapseApp.updateCertPreview) window.synapseApp.updateCertPreview();
          if (window.synapseApp.showAnnouncement) {
            window.synapseApp.showAnnouncement(`🏆 EXAM PASSED! Scored ${correct}/200 (${percentage}%). Official Master Certificate Unlocked!`);
          }
        }
      }
      this.showResultModal(true, correct, percentage, isAuto);
    } else {
      this.showResultModal(false, correct, percentage, isAuto);
    }

    this.renderQuestion(this.currentQIndex);
    this.renderNavigator();
    return { passed, score: correct, percentage };
  }

  showResultModal(passed, score, percentage, isAuto) {
    if (typeof document === 'undefined') return;
    const resModal = document.getElementById('modal-exam-results');
    if (!resModal) return;

    const titleEl = document.getElementById('exam-res-title');
    const msgEl = document.getElementById('exam-res-msg');
    const scoreValEl = document.getElementById('exam-res-score');
    const pctValEl = document.getElementById('exam-res-pct');
    const badgeEl = document.getElementById('exam-res-badge');

    if (scoreValEl) scoreValEl.textContent = `${score} / 200`;
    if (pctValEl) pctValEl.textContent = `${percentage}%`;

    if (passed) {
      if (titleEl) titleEl.textContent = '🏆 DISTINCTION: CERTIFICATE UNLOCKED!';
      if (msgEl) msgEl.innerHTML = `Outstanding achievement! You exceeded the strict <strong>90% Industry Benchmark</strong>.<br>Your official <strong>Certificate of Architectural Mastery</strong> is now permanently unlocked for PDF and PNG export!`;
      if (badgeEl) {
        badgeEl.textContent = 'PASSED (HONORS)';
        badgeEl.className = 'exam-badge-pass';
      }
      const viewBtn = document.getElementById('btn-exam-view-cert');
      if (viewBtn) viewBtn.style.display = 'inline-flex';
    } else {
      if (titleEl) titleEl.textContent = '❌ BENCHMARK NOT MET';
      if (msgEl) msgEl.innerHTML = `You scored <strong>${score} / 200 (${percentage}%)</strong>.<br>The Google & Microsoft aligned standard strictly requires <strong>90% (180/200)</strong> to unlock the official accreditation.<br>Review the AI Codex and retake the assessment.`;
      if (badgeEl) {
        badgeEl.textContent = 'NOT MET (RETRY NEEDED)';
        badgeEl.className = 'exam-badge-fail';
      }
      const viewBtn = document.getElementById('btn-exam-view-cert');
      if (viewBtn) viewBtn.style.display = 'none';
    }

    resModal.classList.add('active');
  }

  setupListeners() {
    if (typeof document === 'undefined') return;

    const btnStart = document.getElementById('btn-start-exam');
    if (btnStart) {
      btnStart.addEventListener('click', () => this.startExam());
    }

    const btnNext = document.getElementById('btn-exam-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => this.nextQuestion());
    }

    const btnPrev = document.getElementById('btn-exam-prev');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => this.prevQuestion());
    }

    const btnFlag = document.getElementById('btn-exam-flag');
    if (btnFlag) {
      btnFlag.addEventListener('click', () => this.toggleFlagCurrent());
    }

    const btnSubmit = document.getElementById('btn-exam-submit');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => {
        const answered = Object.keys(this.userAnswers).length;
        if (confirm(`Are you ready to submit your exam?\nYou have answered ${answered} of 200 questions.`)) {
          this.submitExam(false);
        }
      });
    }

    const btnRetake = document.getElementById('btn-exam-retake');
    if (btnRetake) {
      btnRetake.addEventListener('click', () => {
        document.getElementById('modal-exam-results')?.classList.remove('active');
        this.startExam();
      });
    }

    const btnViewCert = document.getElementById('btn-exam-view-cert');
    if (btnViewCert) {
      btnViewCert.addEventListener('click', () => {
        document.getElementById('modal-exam-results')?.classList.remove('active');
        document.getElementById('modal-exam-portal')?.classList.remove('active');
        if (window.synapseApp) window.synapseApp.openCertificateModal();
      });
    }
  }
}

// Global expose
if (typeof window !== 'undefined') {
  window.ExamPortalEngine = ExamPortalEngine;
  window.examPortal = new ExamPortalEngine();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExamPortalEngine;
}
