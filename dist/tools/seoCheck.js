import { chromium } from "playwright";
export const seoCheck = async ({ url }) => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: "networkidle" });
        const data = await page.evaluate(() => {
            const title = document.title;
            const description = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
            const h1Count = document.querySelectorAll("h1").length;
            const images = Array.from(document.images);
            const imagesWithoutAlt = images.filter(img => !img.alt).length;
            return {
                title,
                description,
                h1Count,
                imagesWithoutAlt,
            };
        });
        let score = 100;
        let issues = [];
        let fixes = [];
        if (!data.title) {
            score -= 25;
            issues.push("Missing page title");
            fixes.push("Add a <title> tag inside <head>");
        }
        if (!data.description) {
            score -= 25;
            issues.push("Missing meta description");
            fixes.push('Add <meta name="description" content="...">');
        }
        if (data.h1Count === 0) {
            score -= 25;
            issues.push("No H1 tag found");
            fixes.push("Add a primary <h1> heading for SEO structure");
        }
        if (data.imagesWithoutAlt > 0) {
            score -= 25;
            issues.push(`${data.imagesWithoutAlt} images missing ALT`);
            fixes.push("Add alt attributes to all <img> tags");
        }
        // 🎯 Rating
        let rating = "";
        if (score >= 80)
            rating = "🟢 Good";
        else if (score >= 50)
            rating = "🟡 Needs Improvement";
        else
            rating = "🔴 Poor";
        return {
            content: [
                {
                    type: "text",
                    text: `
🔍 SEO Report

Score: ${score}/100
Rating: ${rating}

📊 Summary:
Title: ${data.title ? "✅ Present" : "❌ Missing"}
Meta Description: ${data.description ? "✅ Present" : "❌ Missing"}
H1 Tags: ${data.h1Count}
Images Missing ALT: ${data.imagesWithoutAlt}

🚨 Issues:
${issues.length ? issues.join("\n") : "None"}

🛠️ Fix Recommendations:
${fixes.length ? fixes.join("\n") : "No fixes needed"}
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
                    text: `❌ SEO check failed: ${error.message}`,
                },
            ],
        };
    }
    finally {
        await browser.close();
    }
};
//# sourceMappingURL=seoCheck.js.map