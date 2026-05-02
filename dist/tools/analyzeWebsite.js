import { visualTest } from "./visualTest.js";
import { accessibilityTest } from "./accessibility.js";
import { performanceTest } from "./performance.js";
import { seoCheck } from "./seoCheck.js";
import { linkCheck } from "./linkCheck.js";
import { generateHTMLReport } from "../utils/reportGenerator.js";
import { getAIRecommendations } from "../utils/aiService.js";
export const analyzeWebsite = async ({ url, }) => {
    try {
        // ⚡ Run all tools in parallel (resilient)
        const results = await Promise.allSettled([
            visualTest({ url }),
            accessibilityTest({ url }),
            performanceTest({ url }),
            linkCheck({ url }),
            seoCheck({ url }),
        ]);
        // ✅ Safe extractor (handles success + failure)
        const getResult = (res, name) => {
            if (res.status === "fulfilled") {
                return res.value?.content?.[0]?.text || "No data available";
            }
            else {
                return `❌ ${name} failed: ${res.reason?.message || "Unknown error"}`;
            }
        };
        // 📊 Collect results
        const reportData = {
            url,
            visual: getResult(results[0], "Visual Test"),
            accessibility: getResult(results[1], "Accessibility"),
            performance: getResult(results[2], "Performance"),
            links: getResult(results[3], "Link Check"),
            seo: getResult(results[4], "SEO Check"),
        };
        // 🤖 AI Recommendations (PER SECTION)
        const aiInsights = {
            performance: "",
            accessibility: "",
            links: "",
            seo: "",
            visual: "",
        };
        try {
            aiInsights.performance = await getAIRecommendations({
                type: "performance",
                data: reportData.performance,
            });
            aiInsights.accessibility = await getAIRecommendations({
                type: "accessibility",
                data: reportData.accessibility,
            });
            aiInsights.links = await getAIRecommendations({
                type: "links",
                data: reportData.links,
            });
            aiInsights.seo = await getAIRecommendations({
                type: "seo",
                data: reportData.seo,
            });
            aiInsights.visual = await getAIRecommendations({
                type: "visual",
                data: reportData.visual,
            });
        }
        catch (err) {
            // silent fail (don’t break report)
        }
        // 📊 Generate HTML report (WITH AI)
        let reportPath = "Report not generated";
        try {
            reportPath = await generateHTMLReport({
                ...reportData,
                ai: aiInsights,
            });
        }
        catch (err) {
            reportPath = `❌ Failed to generate report: ${err.message}`;
        }
        // ✅ Final response (cleaned)
        return {
            content: [
                {
                    type: "text",
                    text: `
🌐 Website Analysis Complete

📊 Performance:
${reportData.performance}

♿ Accessibility:
${reportData.accessibility}

🔗 Links:
${reportData.links}

🔍 SEO:
${reportData.seo}

🖼️ Visual:
${reportData.visual}

📁 HTML Report:
${reportPath}
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
                    text: `❌ Critical Error analyzing website: ${error.message}`,
                },
            ],
        };
    }
};
//# sourceMappingURL=analyzeWebsite.js.map