// src/tools/linkCheck.ts

import { chromium } from "playwright";

export const linkCheck = async ({ url }: { url: string }) => {
    const browser = await chromium.launch({
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: "networkidle" });

        // 🔗 Extract links
        const links: string[] = await page.$$eval("a", (as) =>
            as
                .map((a) => (a as HTMLAnchorElement).href)
                .filter((href) => href && href.startsWith("http"))
        );

        const uniqueLinks = Array.from(new Set(links));

        const broken: string[] = [];
        const suspicious: string[] = [];

        // 🔥 Helper: check link with retry
        const checkLink = async (link: string) => {
            try {
                let res;

                try {
                    res = await page.request.head(link, { timeout: 8000 });
                } catch {
                    res = await page.request.get(link, { timeout: 8000 });
                }

                const status = res.status();

                // ✅ Good
                if (status >= 200 && status < 400) return;

                // 🔥 NEW: Browser fallback for false positives
                if (status >= 400) {
                    try {
                        const tempPage = await browser.newPage();
                        await tempPage.goto(link, {
                            waitUntil: "domcontentloaded",
                            timeout: 10000,
                        });

                        const finalUrl = tempPage.url();

                        await tempPage.close();

                        // If navigation succeeded → NOT broken
                        if (finalUrl) {
                            suspicious.push(`${link} → Verified via browser (likely valid)`);
                            return;
                        }
                    } catch {
                        // still failing → treat properly
                    }
                }

                // ⚠️ Suspicious (blocked)
                if ([400, 401, 403].includes(status)) {
                    suspicious.push(`${link} → Status: ${status} (possibly blocked)`);
                } else {
                    broken.push(`${link} → Status: ${status}`);
                }
            } catch {
                suspicious.push(`${link} → Request Failed (possibly blocked)`);
            }
        };

        // ⚡ Parallel execution (BIG speed improvement)
        await Promise.all(uniqueLinks.map((link) => checkLink(link)));

        // 🔥 Summary (VERY IMPORTANT)
        const total = uniqueLinks.length;

        let output = `
🔗 Link Summary:
Total Checked: ${total}
Broken: ${broken.length}
Suspicious: ${suspicious.length}

`;

        if (broken.length > 0) {
            output += `🔴 Broken Links (${broken.length}):\n\n${broken.join("\n")}\n\n`;
        }

        if (suspicious.length > 0) {
            output += `⚠️ Suspicious Links (${suspicious.length}):\n\n${suspicious.join("\n")}\n\n`;
        }

        if (broken.length === 0 && suspicious.length === 0) {
            output += "✅ No broken links found";
        }

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
                    text: `❌ Error checking links: ${error.message}`,
                },
            ],
        };
    } finally {
        await browser.close();
    }
};