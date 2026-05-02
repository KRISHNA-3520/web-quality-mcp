#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { analyzeWebsite } from "./tools/analyzeWebsite.js";
import { visualTest } from "./tools/visualTest.js";
import { accessibilityTest } from "./tools/accessibility.js";
import { performanceTest } from "./tools/performance.js";
import { contentCheck } from "./tools/contentCheck.js";
import { linkCheck } from "./tools/linkCheck.js";
const server = new Server({
    name: "web-quality-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
//
// 🧰 1. LIST TOOLS
//
server.setRequestHandler(ListToolsRequestSchema, async (_request) => {
    return {
        tools: [
            {
                name: "visual_regression",
                description: "Detect UI changes using screenshot comparison",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: { type: "string" },
                    },
                    required: ["url"],
                },
            },
            {
                name: "accessibility_audit",
                description: "Find accessibility issues using axe-core",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: { type: "string" },
                    },
                    required: ["url"],
                },
            },
            {
                name: "performance_monitor",
                description: "Measure performance metrics using Lighthouse",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: { type: "string" },
                    },
                    required: ["url"],
                },
            },
            {
                name: "content_verification",
                description: "Check if specific content exists on page",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: { type: "string" },
                        text: { type: "string" },
                    },
                    required: ["url", "text"],
                },
            },
            {
                name: "link_checker",
                description: "Detect broken links on a webpage",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: { type: "string" },
                    },
                    required: ["url"],
                },
            },
            {
                name: "analyze_website",
                description: "Run full website analysis (visual, performance, accessibility, links, content)",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: { type: "string" }
                    },
                    required: ["url"]
                }
            }
        ],
    };
});
//
// ⚙️ 2. EXECUTE TOOLS
//
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const name = request.params?.name;
        const args = request.params?.arguments ?? {};
        if (!name) {
            return {
                content: [
                    {
                        type: "text",
                        text: "❌ Tool name is missing",
                    },
                ],
            };
        }
        let result;
        switch (name) {
            case "visual_regression":
                result = await visualTest(args);
                break;
            case "accessibility_audit":
                result = await accessibilityTest(args);
                break;
            case "performance_monitor":
                result = await performanceTest(args);
                break;
            case "content_verification":
                result = await contentCheck(args);
                break;
            case "link_checker":
                result = await linkCheck(args);
                break;
            case "analyze_website":
                {
                    const input = args;
                    return await analyzeWebsite({
                        url: input.url,
                    });
                }
                break;
            default:
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Unknown tool: ${name}`,
                        },
                    ],
                };
        }
        // ✅ Ensure valid MCP response
        if (!result || !result.content) {
            return {
                content: [
                    {
                        type: "text",
                        text: "⚠️ Tool executed but returned no valid response",
                    },
                ],
            };
        }
        return result;
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Error: ${error.message}`,
                },
            ],
        };
    }
});
//
// 🚀 3. START SERVER (STDIO)
//
const transport = new StdioServerTransport();
await server.connect(transport);
//# sourceMappingURL=server.js.map