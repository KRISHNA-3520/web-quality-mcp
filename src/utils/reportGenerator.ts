
import fs from "fs";
import path from "path";

export const generateHTMLReport = async (data: any) => {
  const filePath = path.join(process.cwd(), "report.html");

  const extractScoreValue = (text: string) =>
    parseInt(text?.match(/Score:\s*(\d+)/)?.[1] || "0");

  const extractIssueCount = (text: string) =>
    parseInt(text?.match(/\((\d+)\)/)?.[1] || "0");

  const extractLinkSummary = (text: string) => ({
    broken: parseInt(text?.match(/Broken:\s*(\d+)/)?.[1] || "0"),
    suspicious: parseInt(text?.match(/Suspicious:\s*(\d+)/)?.[1] || "0"),
  });

  const linksData = extractLinkSummary(data.links);

  const html = `
<!DOCTYPE html>
<html>
<head>
<title>Website Audit Report</title>

<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
  margin: 0;
  background: #f5f7fb;
  color: #111827;
}

/* HEADER (GLASS STYLE) */

header {
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  padding: 40px 20px;
  text-align: center;
}

.header-card {
  backdrop-filter: blur(14px);
  background: rgba(255,255,255,0.12);
  padding: 22px;
  border-radius: 16px;
  display: inline-block;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

/* URL ROW */
.url-row {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.badge {
  background: rgba(0,0,0,0.3);
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 12px;
}

.copy-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  padding: 5px 10px;
  border-radius: 8px;
  cursor: pointer;
  color: white;
}

.copy-btn:hover {
  background: rgba(255,255,255,0.35);
}

.time-pill {
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.9;
}

/* CONTAINER */
.container {
  max-width: 1100px;
  margin: auto;
  padding: 25px;
}

/* CIRCLES */
.cards {
  display: flex;
  justify-content: space-between;
  margin-bottom: 35px;
  flex-wrap: wrap;
}

.circle-wrapper {
  text-align: center;
}

.circle {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  transition: transform 0.2s ease;
}

.circle:hover {
  transform: scale(1.05);
}

.circle-inner {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.label {
  margin-top: 8px;
  font-size: 13px;
  color: #374151;
}

/* ACCORDION */
.accordion {
  background: white;
  border-radius: 12px;
  margin-bottom: 14px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0,0,0,0.05);
  position: relative;
}

/* shine layer */

.accordion::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255,255,255,0.25),
    transparent
  );
  transform: skewX(-25deg);
}

/* hover trigger */
.accordion:hover::before {
  animation: shine 0.8s ease;
}

/* animation */
@keyframes shine {
  0% { left: -100%; }
  100% { left: 150%; }
}

/* HEADER */
.accordion-header {
  padding: 16px;
  cursor: pointer;
  font-weight: 600;
  background: #eef2ff;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.25s ease;
}

.accordion-header:hover {
  background: #e0e7ff;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0,0,0,0.10);
}

/* CLICK PRESS EFFECT */

.accordion-header:active {
  transform: scale(0.98);
}

.accordion.active .accordion-header {
  background: #dbeafe;
  box-shadow: 0 4px 12px rgba(59,130,246,0.25);
}

/* CONTENT */
.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: 
    max-height 0.35s ease,
    padding 0.25s ease;
}

.accordion.active .accordion-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
}

/* SCROLL */
.accordion-content::-webkit-scrollbar {
  width: 6px;
}

.accordion-content::-webkit-scrollbar-thumb {
  background: #6366f1;
  border-radius: 10px;
}

/* CONTENT FORMAT */
.content-box {
  font-size: 13px;
  line-height: 1.6;
}

.section-title {
  margin-top: 10px;
  margin-bottom: 6px;
  font-weight: bold;
  color: #93c5fd;
}

.section-title.fix {
  color: #34d399;
}

.tag.red { color: #ef4444; }
.tag.orange { color: #f97316; }
.tag.yellow { color: #facc15; }
.tag.green { color: #22c55e; }

.fix-item {
  background: rgba(52, 211, 153, 0.1);
  border-left: 3px solid #34d399;
  padding: 6px 8px;
  margin: 6px 0;
  border-radius: 6px;
}

/* TOAST */

#copy-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #111827;
  color: white;
  padding: 8px 14px;
  border-radius: 6px;
  opacity: 0;
  transition: 0.25s;
}

#copy-toast.show {
  opacity: 1;
}

/* FOOTER */

.footer {
  text-align: center;
  margin-top: 25px;
  font-size: 13px;
  color: #6b7280;
}

/* CHEVRON */
.chevron {
  font-size: 14px;
  transition: transform 0.3s ease;
}

/* ROTATE ON OPEN */

.accordion.active .chevron {
  transform: rotate(180deg);
}

.accordion + .accordion {
  margin-top: 10px;
}

/* FADE-IN ANIMATION */
@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.accordion.active .content-box {
  animation: fadeSlide 0.35s ease;
}

.highlight {
  color: #60a5fa;
  font-weight: 600;
}
</style>
</head>

<body>

<header>
  <div class="header-card">
    <h1>🌐 Website Audit Report</h1>

    <div class="url-row">
      <span class="badge">
        ${data.url?.startsWith("https") ? "🔒 HTTPS" : "⚠️ HTTP"}
      </span>

      <span>${data.url}</span>
      <button onclick="copyUrl()" class="copy-btn">📋</button>
    </div>

    <div class="time-pill">
      ${new Date().toLocaleString()}
    </div>
  </div>
</header>

<div class="container">

<div class="cards">
  ${createCircle("⚡ Performance", extractScoreValue(data.performance))}
  ${createCircle("♿ Accessibility", extractIssueCount(data.accessibility))}
  ${createCircle("🔗 Links", linksData.broken)}
  ${createCircle("🔍 SEO", extractScoreValue(data.seo))}
</div>

${createSection("⚡ Performance", data.performance)}
${createSection("♿ Accessibility", data.accessibility)}
${createSection("🔗 Links", data.links)}
${createSection("🔍 SEO", data.seo)}
${createSection("🖼️ Visual", data.visual)}

<div class="footer">🚀 Generated by Web Quality MCP</div>

</div>

<div id="copy-toast">Copied ✓</div>

<script>
document.addEventListener("DOMContentLoaded", () => {

  // ACCORDION
document.querySelectorAll(".accordion-header").forEach(header => {
  header.addEventListener("click", () => {
    const acc = header.parentElement;
    const isActive = acc.classList.contains("active");

    // close all
    document.querySelectorAll(".accordion").forEach(a => {
      a.classList.remove("active");
    });

    // open clicked
    if (!isActive) {
      acc.classList.add("active");
    }
  });
});

  // CIRCLE ANIMATION
  document.querySelectorAll(".circle").forEach(circle => {
    const value = parseInt(circle.dataset.value || "0");
    const color = circle.dataset.color;
    const inner = circle.querySelector(".circle-inner");

    let current = 0;

    const animate = () => {
      current++;
      const deg = (current / 100) * 360;

      circle.style.background =
        "conic-gradient(" + color + " " + deg + "deg, #e5e7eb 0deg)";

      inner.textContent = current;

      if (current < value) requestAnimationFrame(animate);
      else inner.textContent = value;
    };

    animate();
  });

});

function copyUrl() {
  navigator.clipboard.writeText("${data.url}");

  const toast = document.getElementById("copy-toast");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 900);
}

// Auto shine once on load
document.addEventListener("DOMContentLoaded", () => {
  const accs = document.querySelectorAll(".accordion");

  accs.forEach((acc, i) => {
    setTimeout(() => {
      acc.classList.add("shine-run");

      setTimeout(() => {
        acc.classList.remove("shine-run");
      }, 800);
    }, i * 150);
  });
});
</script>

</body>
</html>
`;

  fs.writeFileSync(filePath, html);
  return filePath;
};

/* helpers */

function createCircle(label: string, value: number) {
  const percent = Math.min(value, 100);

  let color = "#ef4444";
  if (percent >= 80) color = "#10b981";
  else if (percent >= 50) color = "#f59e0b";

  return `
<div class="circle-wrapper">

    <div class="circle" data-value="${percent}" data-color="${color}">

      <div class="circle-inner">0</div>

    </div>

    <div class="label">${label}</div>

  </div>
  `;
}

function createSection(title: string, content: string) {
  return `
    <div class="accordion">
      <div class="accordion-header">
        <span>${title}</span>
        <span class="chevron">⌄</span>
      </div>
      <div class="accordion-content">
        <div class="content-box">
          ${formatContent ? formatContent(content) : (content || "").replace(/\\n/g, "<br>")}
        </div>
      </div>
    </div>
  `;
}

function formatContent(content: string) {
  if (!content) return "<p>No data available</p>";

  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);

  let html = "";

  for (let line of lines) {

    // Section headers
    if (line.toLowerCase().includes("summary")) {
      html += `<div class="section-title">📊 Summary</div>`;
      continue;
    }

    if (line.toLowerCase().includes("issues")) {
      html += `<div class="section-title">🚨 Issues</div>`;
      continue;
    }

    if (line.toLowerCase().includes("fix")) {
      html += `<div class="section-title fix">🛠 Fix Recommendations</div>`;
      continue;
    }

    // Highlight numbers + %
    line = line.replace(
      /(\d+(\.\d+)?%?)/g,
      `<span class="highlight">$1</span>`
    );

    // Severity colors
    line = line
      .replace("Critical:", `<span class="tag red">🔴 Critical:</span>`)
      .replace("Serious:", `<span class="tag orange">🟠 Serious:</span>`)
      .replace("Moderate:", `<span class="tag yellow">🟡 Moderate:</span>`)
      .replace("Minor:", `<span class="tag green">🟢 Minor:</span>`);

    // Fix block
    if (line.startsWith("Fix") || line.startsWith("Add") || line.startsWith("Use")) {
      html += `<div class="fix-item">${line}</div>`;
      continue;
    }

    html += `<div class="line">${line}</div>`;
  }

  return html;
}
