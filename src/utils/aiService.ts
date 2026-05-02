export const getAIRecommendations = async (data: any) => {
  let suggestions = [];

  if (data.performance.includes("Needs Improvement")) {
    suggestions.push("Optimize images and reduce JS bundle size.");
  }

  if (data.accessibility.includes("CRITICAL")) {
    suggestions.push("Fix critical accessibility issues (alt text, labels).");
  }

  if (data.links.includes("Broken Links")) {
    suggestions.push("Fix broken links to improve SEO.");
  }

  if (suggestions.length === 0) {
    return "✅ Website looks good overall!";
  }

  return suggestions.join("\n");
};