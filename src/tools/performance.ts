// src/tools/performance.ts

import { launch } from "chrome-launcher";

export const performanceTest = async ({ url }: { url: string }) => {
  let chrome: any;

  try {
    const lighthouse = (await import("lighthouse")).default;

    // 🔥 More stable Chrome launch
    chrome = await launch({
      chromeFlags: [
        "--headless",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const result = await lighthouse(url, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
    });

    const lhr = result?.lhr;

    // ❗ Handle Lighthouse failure properly
    if (!lhr || !lhr.categories?.performance) {
      return {
        content: [
          {
            type: "text",
            text: "⚠️ Performance data unavailable (Lighthouse failed to analyze page)",
          },
        ],
      };
    }

    const score = lhr.categories.performance.score ?? 0;
    const percent = Math.round(score * 100);

    // 🎯 Rating logic
    let rating = "";
    if (score >= 0.9) rating = "🟢 Good";
    else if (score >= 0.5) rating = "🟡 Needs Improvement";
    else rating = "🔴 Poor";

    // 📊 Extract key metrics
    const audits = lhr.audits;

    const lcp = audits["largest-contentful-paint"]?.displayValue || "N/A";
    const fcp = audits["first-contentful-paint"]?.displayValue || "N/A";
    const cls = audits["cumulative-layout-shift"]?.displayValue || "N/A";
    const tbt = audits["total-blocking-time"]?.displayValue || "N/A";
    const si = audits["speed-index"]?.displayValue || "N/A";

    // 📊 Additional insights
    const performanceSummary =
      score >= 0.9
        ? "Excellent performance. No major improvements needed."
        : score >= 0.5
        ? "Moderate performance. Optimization recommended."
        : "Poor performance. Immediate improvements required.";

    return {
      content: [
        {
          type: "text",
          text: `
🚀 Performance Report

🌐 URL: ${url}

Score: ${percent}/100
Rating: ${rating}

📊 Key Metrics:
- LCP (Largest Contentful Paint): ${lcp}
- FCP (First Contentful Paint): ${fcp}
- CLS (Cumulative Layout Shift): ${cls}
- TBT (Total Blocking Time): ${tbt}
- Speed Index: ${si}

📈 Score Range:
🟢 Good: 90-100
🟡 Needs Improvement: 50-89
🔴 Poor: 0-49

💡 Summary:
${performanceSummary}
          `,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error running performance test: ${error.message}`,
        },
      ],
    };
  } finally {
    // 🔥 Always close Chrome (important)
    if (chrome) {
      await chrome.kill();
    }
  }
};