/**
 * SYNAPSE SAGA: Official Certificates & Verified Badges Engine
 * Aligned with Microsoft Azure AI & Google Cloud Generative AI Standards.
 * Generates high-res PNG Badges, PNG Certificates, and PDF Certificates via jsPDF.
 */

class CertificateEngine {
  constructor() {
    this.certCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this.badgeCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  }

  // Generate Unique Verifiable Credential ID
  generateCredentialId(level = 10, userName = 'Architect') {
    const hash = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `AGY-AI-2026-LV${level}-${hash}-GGL-MSFT`;
  }

  // 1. Render Official Certificate on Canvas
  renderCertificateCanvas(data) {
    const {
      userName = 'AI Architect',
      tierTitle = 'Certified Autonomous Agent Systems Architect',
      tierLevel = 10,
      score = 9850,
      credentialId = this.generateCredentialId(tierLevel, userName),
      issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } = data;

    const width = 1600;
    const height = 1131; // Standard Landscape A4 Proportion
    this.certCanvas.width = width;
    this.certCanvas.height = height;
    const ctx = this.certCanvas.getContext('2d');

    // Background: Deep Royal Slate Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#060a17');
    bgGrad.addColorStop(0.5, '#0b162c');
    bgGrad.addColorStop(1, '#050914');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Neural Network Background Grid & Circuit Nodes
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, height - 40);
      ctx.stroke();
    }
    for (let y = 40; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 40, y);
      ctx.stroke();
    }

    // Outer Decorative Border (Dual Gold & Cyan Neon)
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, width - 96, height - 96);

    // Corner Ornaments
    const drawCorner = (x, y, dx, dy) => {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x, y + dy * 35);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * 35, y);
      ctx.stroke();
    };
    drawCorner(55, 55, 1, 1);
    drawCorner(width - 55, 55, -1, 1);
    drawCorner(55, height - 55, 1, -1);
    drawCorner(width - 55, height - 55, -1, -1);

    // Header Logo & Studio Branding
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 18px "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '5px';
    ctx.fillText('SARLAYASH PRODUCTIONS PRESENTS', width / 2, 92);

    ctx.fillStyle = '#00f0ff';
    ctx.font = '900 24px "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('AIVERSE 1.0 • POWERED BY KAPIL', width / 2, 122);

    ctx.fillStyle = '#a0aec0';
    ctx.font = '600 13px "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('BENCHMARKED TO GOOGLE CLOUD & MICROSOFT AZURE CURRICULUM STANDARDS', width / 2, 146);

    // Main Certificate Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 44px "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('CERTIFICATE OF ARCHITECTURAL MASTERY', width / 2, 195);

    // Subtitle
    ctx.fillStyle = '#00e5ff';
    ctx.font = '600 20px "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('IN ADVANCED ARTIFICIAL INTELLIGENCE, GENERATIVE MODELS & AGENTIC SYSTEMS', width / 2, 235);

    // Thin separator line
    const lineGrad = ctx.createLinearGradient(width / 2 - 300, 0, width / 2 + 300, 0);
    lineGrad.addColorStop(0, 'rgba(255, 215, 0, 0)');
    lineGrad.addColorStop(0.5, '#ffd700');
    lineGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 350, 260);
    ctx.lineTo(width / 2 + 350, 260);
    ctx.stroke();

    // "This is to certify that"
    ctx.fillStyle = '#a0aec0';
    ctx.font = 'italic 20px "Georgia", serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('This official credential certifies that', width / 2, 310);

    // Recipient Name
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 56px "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(userName.toUpperCase(), width / 2, 385);

    // Underlying decoration for name
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 280, 410);
    ctx.lineTo(width / 2 + 280, 410);
    ctx.stroke();

    // "Has successfully demonstrated mastery in:"
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '20px "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('has demonstrated superior engineering competence and practical mastery in:', width / 2, 460);

    // Certified Title
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 36px "Segoe UI", Roboto, sans-serif';
    ctx.fillText(tierTitle, width / 2, 520);

    // Competency Domains Box
    const boxX = 180;
    const boxY = 560;
    const boxW = width - 360;
    const boxH = 250;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.fill();
    ctx.stroke();

    // Box Header
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 18px "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('VERIFIED KNOWLEDGE & PRACTICAL BENCHMARKS ACCREDITED:', boxX + 40, boxY + 40);

    const competencies = [
      '• Deep Learning & Optimization: Gradient Descent, Activation Functions & Dynamic Loss Landscape Tuning',
      '• Transformer Architecture: Multi-Head Scaled Dot-Product Self-Attention, KV Cache & Tokenization (BPE)',
      '• Retrieval-Augmented Generation (RAG): High-Dimensional Vector Embeddings, Chunking & Semantic Search',
      '• Autonomous Agent Systems: ReAct Architecture (Thought->Action->Observation), Memory Units & Reflection',
      '• Tool Execution & Alignment: OpenAPI Function Calling, Code Sandbox Dispatching & RLHF Safety Guardrails'
    ];

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '17px "Segoe UI", Roboto, sans-serif';
    competencies.forEach((text, i) => {
      ctx.fillText(text, boxX + 40, boxY + 80 + i * 32);
    });

    // Score & Honors Badge
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 20px "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Compute Score: ${score.toLocaleString()} PTS  |  Mastery Rating: 99.4% (Honors Distinction)`, width / 2, 850);

    // Golden Official Seal
    const sealX = 300;
    const sealY = 960;
    ctx.save();
    ctx.beginPath();
    ctx.arc(sealX, sealY, 65, 0, Math.PI * 2);
    ctx.fillStyle = '#10223e';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffd700';
    ctx.stroke();

    // Inner seal circle
    ctx.beginPath();
    ctx.arc(sealX, sealY, 55, 0, Math.PI * 2);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED', sealX, sealY - 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px "Segoe UI", sans-serif';
    ctx.fillText('AI', sealX, sealY + 12);
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillText('STANDARD', sealX, sealY + 30);
    ctx.restore();

    // Verifiable QR-Code Graphic Simulation (Grid of high-tech markers)
    const qrX = width - 380;
    const qrY = 900;
    const qrSize = 110;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX, qrY, qrSize, qrSize);

    // QR inner blocks
    ctx.fillStyle = '#0a1020';
    const numCells = 9;
    const cellSize = qrSize / numCells;
    for (let r = 0; r < numCells; r++) {
      for (let c = 0; c < numCells; c++) {
        // Corners and random deterministic bits
        const isCorner1 = r < 3 && c < 3;
        const isCorner2 = r < 3 && c > 5;
        const isCorner3 = r > 5 && c < 3;
        const bit = ((r * 7 + c * 13 + tierLevel * 3) % 5 === 0);
        if (isCorner1 || isCorner2 || isCorner3 || bit) {
          ctx.fillRect(qrX + c * cellSize, qrY + r * cellSize, cellSize, cellSize);
        }
      }
    }
    // QR labels
    ctx.fillStyle = '#718096';
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN TO VERIFY CREDENTIAL', qrX + qrSize / 2, qrY + qrSize + 18);

    // Signatures & Signoff
    const sigX = width / 2;
    const sigY = 952;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'italic bold 32px "Brush Script MT", "Segoe Script", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('Kapil', sigX, sigY);

    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sigX - 220, sigY + 12);
    ctx.lineTo(sigX + 220, sigY + 12);
    ctx.stroke();

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.fillText('KAPIL  •  Chief AI Architect & Systems Lead', sigX, sigY + 30);

    ctx.fillStyle = '#a0aec0';
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.fillText('SARLAYASH Productions AI Systems Board  |  Google Cloud & Microsoft Azure Competency Standard', sigX, sigY + 48);

    // Credential ID & Issue Date Footer
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 15px "Segoe UI", monospace';
    ctx.fillText(`Credential ID: ${credentialId}  •  Issued: ${issueDate}`, sigX, height - 70);

    return this.certCanvas;
  }

  // 2. Render Verified Badge on Canvas (800x800)
  renderBadgeCanvas(tierData, userName = 'Architect') {
    const width = 800;
    const height = 800;
    this.badgeCanvas.width = width;
    this.badgeCanvas.height = height;
    const ctx = this.badgeCanvas.getContext('2d');

    const cx = width / 2;
    const cy = height / 2;

    // Transparent / dark radial background
    const bgGrad = ctx.createRadialGradient(cx, cy, 100, cx, cy, 380);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.7, '#070b19');
    bgGrad.addColorStop(1, '#02040a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Outer Shield / Polygon (Octagon)
    const radius = 340;
    const sides = 8;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI / sides) - (Math.PI / 8);
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.fillStyle = '#091326';
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = tierData.color || '#ffd700';
    ctx.stroke();

    // Inner Glowing Ring
    ctx.beginPath();
    ctx.arc(cx, cy, 270, 0, Math.PI * 2);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Concentric Cyber Dots
    for (let i = 0; i < 24; i++) {
      const angle = i * (Math.PI * 2 / 24);
      const dotX = cx + 295 * Math.cos(angle);
      const dotY = cy + 295 * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? tierData.color : '#00f0ff';
      ctx.fill();
    }

    // Top Header: Studio & Engine Branding
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '3px';
    ctx.fillText('SARLAYASH PRODUCTIONS', cx, cy - 215);

    ctx.fillStyle = '#00f0ff';
    ctx.font = '900 18px "Segoe UI", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('AIVERSE 1.0 • POWERED BY KAPIL', cx, cy - 192);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('GOOGLE & MICROSOFT STANDARDS', cx, cy - 172);

    // Big Emoji / Symbol Icon
    ctx.font = '110px "Segoe UI Emoji", sans-serif';
    ctx.fillText(tierData.badgeIcon || '🥇', cx, cy - 70);

    // Tier Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "Segoe UI", sans-serif';
    ctx.fillText(tierData.tier.toUpperCase() + ' TIER', cx, cy + 40);

    // Main Designation
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    const words = tierData.title.split(' ');
    const line1 = words.slice(0, 3).join(' ');
    const line2 = words.slice(3).join(' ');
    ctx.fillText(line1, cx, cy + 85);
    if (line2) ctx.fillText(line2, cx, cy + 120);

    // Recipient Name
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillText(`VERIFIED: ${userName.toUpperCase()}`, cx, cy + 180);

    // Verifiable Hash
    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px monospace';
    ctx.fillText(`ID: AGY-${tierData.id.toUpperCase()}-2026`, cx, cy + 215);

    return this.badgeCanvas;
  }

  // Download Canvas as PNG
  downloadCanvasAsPng(canvas, filename) {
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Download Certificate as PDF using jsPDF
  downloadCertificateAsPdf(data, filename = 'Synapse-Saga-AI-Certificate.pdf') {
    const canvas = this.renderCertificateCanvas(data);
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (window.jspdf && window.jspdf.jsPDF) {
      const { jsPDF } = window.jspdf;
      // Landscape A4: 297mm x 210mm
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      doc.addImage(imgData, 'JPEG', 0, 0, 297, 210);
      doc.save(filename);
    } else {
      console.warn('jsPDF not found, falling back to PNG export');
      this.downloadCanvasAsPng(canvas, filename.replace('.pdf', '.png'));
    }
  }
}

// Global expose
const certificateEngineInstance = new CertificateEngine();
if (typeof window !== 'undefined') {
  window.certificateEngine = certificateEngineInstance;
  window.CertificateEngine = CertificateEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = certificateEngineInstance;
}
