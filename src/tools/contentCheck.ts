// src/tools/contentCheck.ts

import { chromium } from "playwright";

export const contentCheck = async ({
    url,
    text,
}: {
    url: string;
    text?: string | string[];
}) => {
    const browser = await chromium.launch({
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: "networkidle" });
        await page.waitForTimeout(1500);

        const pageText = await page.evaluate(() => document.body.innerText);

        const normalize = (str: string) =>
            str.replace(/\s+/g, " ").trim().toLowerCase();

        const normalizedPageText = normalize(pageText);

        // 🔥 Handle empty input
        if (!text || (Array.isArray(text) && text.length === 0)) {
            return {
                content: [
                    {
                        type: "text",
                        text: `
📄 Content Verification Report

🌐 URL: ${url}

⚠️ No content provided to verify.

👉 Please provide "text" input to check content.
Example:
{
  "url": "...",
  "text": ["login", "signup"]
}
            `,
                    },
                ],
            };
        }

        const keywords = Array.isArray(text) ? text : [text];

        const found: string[] = [];
        const missing: string[] = [];

        for (const keyword of keywords) {
            const normalizedKeyword = normalize(keyword);

            if (normalizedPageText.includes(normalizedKeyword)) {
                found.push(keyword);
            } else {
                missing.push(keyword);
            }
        }

        // 🔥 Status
        let status = "";
        let analysis = "";

        if (found.length === keywords.length) {
            status = "🟢 All Content Found";
            analysis = `
- All requested content is present
- Page rendering looks correct
`;
        } else if (found.length > 0) {
            status = "🟡 Partial Content Found";
            analysis = `
- Some requested content is missing
- May be dynamic or conditionally rendered
`;
        } else {
            status = "🔴 Content Not Found";
            analysis = `
- None of the requested content found
- Content may require login or interaction
- Text may differ slightly
`;
        }

        const output = `
📄 Content Verification Report

🌐 URL: ${url}

Status: ${status}

🔍 Requested Content:
${keywords.join("\n")}

✅ Found: ${found.length}
❌ Missing: ${missing.length}

📊 Analysis:

${analysis}

${found.length > 0 ? `✅ Found Content:\n${found.join("\n")}\n` : ""}

${missing.length > 0 ? `❌ Missing Content:\n${missing.join("\n")}\n` : ""}
`;

        return {
            content: [
                {
                    type: "text",
                    text: output,
                },
            ],
        };
    } catch (error: any) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Error checking content: ${error.message}`,
                },
            ],
        };
    } finally {
        await browser.close();
    }
};