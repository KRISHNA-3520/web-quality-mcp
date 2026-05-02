// src/tools/accessibility.ts
import { chromium } from "playwright";
import axe from "axe-core";
export const accessibilityTest = async ({ url }) => {
    const browser = await chromium.launch({
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: "networkidle" });
        // Inject axe-core
        await page.addScriptTag({ content: axe.source });
        const results = await page.evaluate(async () => {
            return await window.axe.run();
        });
        const violations = results.violations || [];
        // 🔥 Group by severity
        const grouped = {
            critical: [],
            serious: [],
            moderate: [],
            minor: [],
        };
        violations.forEach((v) => {
            const level = v.impact || "minor";
            if (grouped[level]) {
                grouped[level].push(v);
            }
            else {
                grouped.minor.push(v);
            }
        });
        // 🔥 Build detailed issues list
        const issues = violations.map((v, index) => {
            const selector = v.nodes?.[0]?.target?.join(" ") || "N/A";
            return `
${index + 1}. [${(v.impact || "unknown").toUpperCase()}] ${v.description}
Rule: ${v.id}
Fix: ${v.help}
Affected elements: ${v.nodes?.length || 0}
Example element: ${selector}
`;
        });
        // 🔥 Summary section (important)
        const summary = `
📊 Accessibility Summary:

🔴 Critical: ${grouped.critical.length}
🟠 Serious: ${grouped.serious.length}
🟡 Moderate: ${grouped.moderate.length}
🟢 Minor: ${grouped.minor.length}
`;
        const text = violations.length > 0
            ? `
🚨 Accessibility Issues Found (${violations.length})

${summary}

📋 Detailed Issues:
${issues.join("\n")}
`
            : "✅ No accessibility issues found";
        return {
            content: [
                {
                    type: "text",
                    text,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Error running accessibility audit: ${error.message}`,
                },
            ],
        };
    }
    finally {
        await browser.close();
    }
};
//# sourceMappingURL=accessibility.js.map