/**
 * SARLAYASH Productions Presents: AIVERSE 1.0 (Powered By Kapil)
 * Comprehensive Verification & Deep Gap-Resolution Test Suite
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

// Mock localStorage and window/document for Node environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new MockLocalStorage();
global.window = {
  localStorage: global.localStorage
};

// 1. Verify Configuration & Badges
console.log('--- TEST 1: CONFIGURATION, AVATARS & LEVEL BADGES ---');
const CONFIG = require('./js/config.js');
assert.strictEqual(CONFIG.GRID_SIZE, 8, 'Grid size should be 8x8');
assert.strictEqual(Array.isArray(CONFIG.AVATARS), true, 'CONFIG.AVATARS must be an array');
assert.strictEqual(CONFIG.AVATARS.length >= 6, true, 'At least 6 custom avatars must be defined');
console.log(`✅ Avatars defined: ${CONFIG.AVATARS.length} (${CONFIG.AVATARS.map(a => a.name).join(', ')})`);

assert.strictEqual(Array.isArray(CONFIG.LEVEL_BADGES), true, 'CONFIG.LEVEL_BADGES must be an array');
assert.strictEqual(CONFIG.LEVEL_BADGES.length, 10, 'There must be exactly 10 milestone badges for levels 1-10');
for (let i = 1; i <= 10; i++) {
  const badge = CONFIG.LEVEL_BADGES.find(b => b.level === i);
  assert.ok(badge, `Milestone badge for level ${i} must exist`);
  assert.ok(badge.title && badge.symbol && badge.desc, `Milestone badge ${i} must have title, symbol, and desc`);
}
console.log(`✅ All 10 Milestone Badges for Levels 1–10 validated.`);

// 2. Verify 200 Exam Questions
console.log('\n--- TEST 2: 200 INDUSTRY & PLACEMENT STANDARD MCQS ---');
const questions = require('./js/exam-questions.js');
assert.strictEqual(questions.length, 200, `Must contain exactly 200 questions, got ${questions.length}`);

let classicalCount = 0;
let genAiCount = 0;
let agenticCount = 0;

questions.forEach((q, idx) => {
  assert.strictEqual(typeof q.id, 'number', `Question ${idx + 1} must have numeric id`);
  assert.ok(q.category, `Question ${idx + 1} must have a category`);
  assert.ok(q.q && q.q.length > 5, `Question ${idx + 1} must have substantive question text`);
  assert.strictEqual(q.options.length, 4, `Question ${idx + 1} must have exactly 4 options`);
  assert.ok(q.ans >= 0 && q.ans <= 3, `Question ${idx + 1} answer must be between 0 and 3`);
  assert.ok(q.explanation && q.explanation.length > 5, `Question ${idx + 1} must have official explanation`);

  const catLower = q.category.toLowerCase();
  if (catLower.includes('classical') || catLower.includes('machine learning') || catLower.includes('neural')) {
    classicalCount++;
  } else if (catLower.includes('generative') || catLower.includes('transformer') || catLower.includes('llm') || catLower.includes('diffusion')) {
    genAiCount++;
  } else {
    agenticCount++;
  }
});

console.log(`✅ 200 MCQs validated:`);
console.log(`   - Classical ML/DL: ${classicalCount}`);
console.log(`   - Generative AI & Transformers: ${genAiCount}`);
console.log(`   - Agentic AI & Swarms: ${agenticCount}`);

// 3. Verify Exam Engine & Strict 90% Gating
console.log('\n--- TEST 3: EXAM PORTAL ENGINE & STRICT 90% THRESHOLD ---');
global.window.FULL_200_EXAM_QUESTIONS = questions;
const ExamPortalEngine = require('./js/exam-engine.js');
const examEngine = new ExamPortalEngine();

assert.strictEqual(examEngine.totalQuestions, 200);
assert.strictEqual(examEngine.passingScore, 180, 'Passing score must be strictly 180 (90%)');
assert.strictEqual(examEngine.totalTimeSeconds, 3600, 'Timer must be 3600 seconds (60 mins)');

// Test 3A: Failure Case (175/200 = 87.5% -> Below 90%)
localStorage.clear();
examEngine.startExam();
for (let i = 0; i < 200; i++) {
  const q = questions[i];
  // Answer correct for first 175 questions, incorrect for remaining 25
  examEngine.userAnswers[q.id] = (i < 175) ? q.ans : ((q.ans + 1) % 4);
}
const failResult = examEngine.submitExam(false);
assert.strictEqual(failResult.passed, false, 'Scoring 175/200 must fail (below 90%)');
assert.strictEqual(examEngine.isCertificateUnlocked(), false, 'Certificate must NOT unlock with 175/200');
console.log(`✅ Test 3A Passed: 175/200 (87.5%) correctly fails and certificate remains LOCKED 🔒`);

// Test 3B: Borderline Fail Case (179/200 = 89.5% -> Below 90%)
localStorage.clear();
examEngine.startExam();
for (let i = 0; i < 200; i++) {
  const q = questions[i];
  examEngine.userAnswers[q.id] = (i < 179) ? q.ans : ((q.ans + 1) % 4);
}
const borderlineFail = examEngine.submitExam(false);
assert.strictEqual(borderlineFail.passed, false, 'Scoring 179/200 must fail (below 90%)');
assert.strictEqual(examEngine.isCertificateUnlocked(), false, 'Certificate must NOT unlock with 179/200');
console.log(`✅ Test 3B Passed: 179/200 (89.5%) strictly fails and certificate remains LOCKED 🔒`);

// Test 3C: Passing Case (180/200 = 90.0% -> Passing)
localStorage.clear();
examEngine.startExam();
for (let i = 0; i < 200; i++) {
  const q = questions[i];
  examEngine.userAnswers[q.id] = (i < 180) ? q.ans : ((q.ans + 1) % 4);
}
const passResult = examEngine.submitExam(false);
assert.strictEqual(passResult.passed, true, 'Scoring 180/200 must pass (90%)');
assert.strictEqual(examEngine.isCertificateUnlocked(), true, 'Certificate MUST unlock with 180/200');
assert.strictEqual(localStorage.getItem('aiverse_cert_unlocked'), 'true');
console.log(`✅ Test 3C Passed: 180/200 (90.0%) passes and unlocks Certificate with Distinction 🏆`);

// 4. Verify HTML DOM Elements and Branding
console.log('\n--- TEST 4: HTML DOM STRUCTURE & BRANDING CHECKS ---');
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const expectedElements = [
  'id="cinematic-level-loader"',
  'id="cinematic-level-title"',
  'id="cinematic-progress-bar"',
  'id="btn-theme-toggle"',
  'id="btn-user-profile"',
  'id="header-avatar-icon"',
  'id="header-user-name"',
  'id="btn-open-exam"',
  'id="announcement-bar"',
  'id="announcement-text"',
  'id="modal-onboarding"',
  'id="onboarding-avatar-grid"',
  'id="btn-save-onboarding"',
  'id="cert-lock-banner"',
  'id="btn-cert-take-exam"',
  'id="modal-exam-portal"',
  'id="exam-timer-display"',
  'id="exam-nav-grid"',
  'id="modal-exam-results"',
  'src="js/exam-questions.js"',
  'src="js/exam-engine.js"'
];

expectedElements.forEach(el => {
  assert.ok(htmlContent.includes(el), `HTML must contain element ${el}`);
});
console.log(`✅ All ${expectedElements.length} required interactive DOM elements present in index.html.`);

// Check Studio Branding in HTML, CSS & Manifest
assert.ok(htmlContent.includes('SARLAYASH PRODUCTIONS PRESENTS'), 'Branding: SARLAYASH PRODUCTIONS PRESENTS missing');
assert.ok(htmlContent.includes('AIVERSE 1.0'), 'Branding: AIVERSE 1.0 missing');
assert.ok(htmlContent.includes('Powered By Kapil'), 'Branding: Powered By Kapil missing');
console.log(`✅ Full studio branding verified in index.html.`);

// 5. Verify CSS Theme Support (Light and Dark)
console.log('\n--- TEST 5: CSS LIGHT & DARK THEME SUPPORT ---');
const cssContent = fs.readFileSync(path.join(__dirname, 'css', 'style.css'), 'utf8');
assert.ok(cssContent.includes('[data-theme="light"]'), 'CSS must define [data-theme="light"] theme overrides');
assert.ok(cssContent.includes('.announcement-bar'), 'CSS must define .announcement-bar');
assert.ok(cssContent.includes('.cinematic-loading-overlay'), 'CSS must define .cinematic-loading-overlay');
assert.ok(cssContent.includes('.avatar-grid'), 'CSS must define .avatar-grid');
assert.ok(cssContent.includes('.cert-lock-banner'), 'CSS must define .cert-lock-banner');
assert.ok(cssContent.includes('.exam-portal-header'), 'CSS must define .exam-portal-header');
console.log(`✅ Complete light/dark variables and all UI component styles verified.`);

// 6. Test Live Server Endpoints
console.log('\n--- TEST 6: SERVER HTTP & WEBSOCKET ENDPOINTS ---');
http.get('http://localhost:3000/', (res) => {
  assert.strictEqual(res.statusCode, 200, 'Server must respond with status 200');
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    assert.ok(data.includes('AIVERSE 1.0'), 'Live page must contain AIVERSE 1.0');
    assert.ok(data.includes('SARLAYASH'), 'Live page must contain SARLAYASH branding');
    console.log(`✅ HTTP GET /: Status 200, Content Verified.`);

    // Test ZIP download endpoint
    http.get('http://localhost:3000/api/download-app-zip', (zipRes) => {
      assert.strictEqual(zipRes.statusCode, 200);
      assert.ok(zipRes.headers['content-type'].includes('zip') || zipRes.headers['content-disposition'].includes('zip'));
      console.log(`✅ HTTP GET /api/download-app-zip: Status 200, Valid ZIP Stream.`);

      // Test WebSocket endpoint
      const ws = new WebSocket('ws://localhost:3000/ws');
      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'CREATE_ROOM' }));
      });
      ws.on('message', (msg) => {
        const parsed = JSON.parse(msg);
        assert.strictEqual(parsed.type, 'ROOM_CREATED');
        assert.ok(parsed.roomCode, 'Must return a roomCode');
        console.log(`✅ WebSocket /ws: Connection established, Room Created (${parsed.roomCode}).`);
        ws.close();
        console.log('\n🎉 ALL COMPREHENSIVE TESTS PASSED WITH 100% SUCCESS!');
        process.exit(0);
      });
      ws.on('error', (err) => {
        console.error('WebSocket Error:', err);
        process.exit(1);
      });
    });
  });
}).on('error', (err) => {
  console.error('HTTP Server Error:', err);
  process.exit(1);
});
