# 🌐 Web Quality MCP

A comprehensive website quality analysis tool built as a Model Context Protocol (MCP) server. Analyzes performance, accessibility, SEO, link integrity, and visual consistency of websites with AI-powered recommendations.

## ✨ Features

### 🔍 Core Analysis Tools

- **⚡ Performance Monitoring** - Lighthouse-powered metrics (LCP, CLS, TBT, Speed Index)
- **♿ Accessibility Audit** - WCAG compliance checks using axe-core
- **🔗 Link Validation** - Detect broken and suspicious links
- **🔍 SEO Analysis** - Meta tags, headings, alt attributes, and more
- **🖼️ Visual Regression Testing** - Screenshot comparison for UI consistency
- **📝 Content Verification** - Check for specific text content on pages

### 📊 Intelligent Reporting

- **Interactive HTML Reports** - Beautiful, responsive reports with:
  - Circular KPI indicators (Lighthouse-style)
  - Accordion-based structured sections
  - Micro-interactions and animations
  - Gradient and glassmorphism UI
  - Auto-generated "Top Critical Issues" panel
  
- **🤖 AI-Powered Insights** - Actionable recommendations for each analysis type
- **📤 Easy Sharing** - Export as HTML with copy-to-clipboard functionality

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Chrome/Chromium browser (for Lighthouse and Playwright)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KRISHNA-3520/web-quality-mcp.git
cd web-quality-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

### Running the MCP Server

Start the server in development mode:
```bash
npm run dev:mcp
```

Or run the built version:
```bash
npm start
```

### Testing with MCP Inspector

The MCP Inspector is a powerful tool for testing and debugging your MCP server during development.

1. Install the MCP Inspector globally:
```bash
npx @modelcontextprotocol/inspector node dist/server.js
```

2. This will:
   - Launch the MCP Inspector web interface
   - Connect to your server
   - Provide an interactive UI to test all available tools
   - Show real-time request/response data
   - Help debug tool inputs and outputs

3. Command : mcp inpsector   --> this will open mcp inspector automatically

4. In the Inspector interface, you can:
   - View all available tools
   - Execute tools with custom parameters
   - Inspect JSON responses
   - Debug errors in real-time

**Example test in Inspector:**
    "url": "https://example.com"


## 📖 Usage

### Available MCP Tools

The server exposes the following tools that can be called through MCP clients:

#### 1. `analyze_website`
Runs a comprehensive analysis of a website including all quality checks.

```json
{
  "url": "https://example.com"
}
```

#### 2. `performance_monitor`
Measures performance metrics using Lighthouse.

```json
{
  "url": "https://example.com"
}
```

#### 3. `accessibility_audit`
Finds accessibility issues using axe-core.

```json
{
  "url": "https://example.com"
}
```

#### 4. `visual_regression`
Detects UI changes using screenshot comparison.

```json
{
  "url": "https://example.com"
}
```

#### 5. `link_checker`
Detects broken links on a webpage.

```json
{
  "url": "https://example.com"
}
```

#### 6. `content_verification`
Checks if specific content exists on a page.

```json
{
  "url": "https://example.com",
  "text": "Welcome to our site"
}
```

### Example: Using with Claude Desktop

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "web-quality": {
      "command": "node",
      "args": ["/path/to/web-quality-mcp/dist/server.js"]
    }
  }
}
```

Then in Claude Desktop:
```
Can you analyze the website https://example.com for quality issues?
```

## 🏗️ Project Structure

```
web-quality-mcp/
├── src/
│   ├── server.ts              # Main MCP server setup
│   ├── tools/                 # Individual analysis tools
│   │   ├── analyzeWebsite.ts  # Orchestrates all tests
│   │   ├── performance.ts     # Lighthouse performance tests
│   │   ├── accessibility.ts   # Axe-core accessibility tests
│   │   ├── seoCheck.ts        # SEO analysis
│   │   ├── linkCheck.ts       # Broken link detection
│   │   ├── visualTest.ts      # Visual regression testing
│   │   └── contentCheck.ts    # Content verification
│   └── utils/
│       ├── reportGenerator.ts # HTML report generation
│       └── aiService.ts       # AI recommendations
├── dist/                      # Compiled JavaScript output
├── screenshots/               # Visual regression baselines
├── report.html               # Generated reports (output)
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Technology Stack

- **Runtime**: Node.js with TypeScript
- **MCP SDK**: `@modelcontextprotocol/sdk` - Model Context Protocol implementation
- **Testing Tools**:
  - Lighthouse - Performance and SEO analysis
  - Playwright - Browser automation and screenshots
  - axe-core - Accessibility testing
  - Pixelmatch - Visual comparison
- **Utilities**:
  - Zod - Schema validation
  - Chrome Launcher - Programmatic Chrome control

## 🔧 Development

### Build

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Development Mode

```bash
npm run dev:mcp
```

Runs the server with hot-reloading using ts-node.

## 📊 Output Examples

### Performance Report
```
⚡ Performance Metrics:
├─ LCP: 1.2s ✅
├─ CLS: 0.05 ✅
├─ TBT: 150ms ⚠️
└─ Speed Index: 2.1s ✅
```

### Accessibility Issues
```
♿ Accessibility Audit:
├─ Critical: 2 issues
│   └─ Missing alt text on 2 images
├─ Moderate: 5 issues
│   └─ Insufficient color contrast
└─ Minor: 3 issues
```

### HTML Report
The tool generates a beautiful, interactive HTML report saved as `report.html` with:
- Visual KPI indicators
- Expandable sections for each analysis type
- AI-powered recommendations
- Highlighted critical issues
- Copy-to-clipboard functionality

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🔮 Future Enhancements

- [ ] Add email report delivery
- [ ] Support for scheduled audits
- [ ] Historical trend tracking
- [ ] Multi-page crawling capabilities
- [ ] Custom rule configuration
- [ ] Integration with CI/CD pipelines
- [ ] PDF report export
- [ ] Compare multiple websites



## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ from Krishna Jamadar