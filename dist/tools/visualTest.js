// src/tools/visualTest.ts
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
export const visualTest = async ({ url }) => {
    const browser = await chromium.launch({
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: "networkidle" });
        // Stabilize dynamic content
        await page.waitForTimeout(1500);
        // 🔹 Unique filename per URL
        const fileName = url.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        const baselinePath = path.join("screenshots", `baseline_${fileName}.png`);
        const currentPath = path.join("screenshots", `current_${fileName}.png`);
        const diffPath = path.join("screenshots", `diff_${fileName}.png`);
        // Ensure folder exists
        if (!fs.existsSync("screenshots")) {
            fs.mkdirSync("screenshots");
        }
        // Take screenshot
        await page.screenshot({ path: currentPath, fullPage: true });
        // 🟢 First run → create baseline
        if (!fs.existsSync(baselinePath)) {
            fs.copyFileSync(currentPath, baselinePath);
            return {
                content: [
                    {
                        type: "text",
                        text: `
📸 Baseline image created

URL: ${url}
Saved at: ${baselinePath}

👉 Run again to compare visual changes.
            `,
                    },
                ],
            };
        }
        // Read images
        const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
        const img2 = PNG.sync.read(fs.readFileSync(currentPath));
        // 🔥 Handle different image sizes
        const width = Math.min(img1.width, img2.width);
        const height = Math.min(img1.height, img2.height);
        const cropped1 = new PNG({ width, height });
        const cropped2 = new PNG({ width, height });
        PNG.bitblt(img1, cropped1, 0, 0, width, height, 0, 0);
        PNG.bitblt(img2, cropped2, 0, 0, width, height, 0, 0);
        const diff = new PNG({ width, height });
        const mismatchedPixels = pixelmatch(cropped1.data, cropped2.data, diff.data, width, height, { threshold: 0.1 });
        // Save diff image
        fs.writeFileSync(diffPath, PNG.sync.write(diff));
        // 🔥 Percentage calculation
        const totalPixels = width * height;
        const diffPercentage = (mismatchedPixels / totalPixels) * 100;
        // 🔥 Classification
        let status = "";
        let analysis = "";
        if (diffPercentage === 0) {
            status = "🟢 No Visual Changes";
            analysis = `
- No UI differences detected
- Layout and rendering are stable
`;
        }
        else if (diffPercentage < 1) {
            status = "🟡 Minor Changes";
            analysis = `
- Small UI differences detected
- Likely caused by dynamic content (ads, timestamps, etc.)
`;
        }
        else {
            status = "🔴 Major Changes";
            analysis = `
- Significant UI differences detected
- Visual regression likely present
`;
        }
        return {
            content: [
                {
                    type: "text",
                    text: `
🖼️ Visual Regression Report

Status: ${status}

Difference: ${diffPercentage.toFixed(2)}%

📊 Analysis:

${analysis}

📁 Images:

Baseline: ${baselinePath}

Current: ${currentPath}

Diff: ${diffPath}
          `,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Visual test failed: ${error.message}`,
                },
            ],
        };
    }
    finally {
        await browser.close();
    }
};
//# sourceMappingURL=visualTest.js.map