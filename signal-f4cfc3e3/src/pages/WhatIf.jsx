import React, { useState } from "react";
import { Portfolio } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Sparkles } from "lucide-react";

export default function WhatIf({ user, isAnonymous }) {
  const [scenario, setScenario] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!scenario.trim()) return;

    setIsAnalyzing(true);

    const portfolioData = await Portfolio.list();
    const portfolioContext = portfolioData.length > 0
      ? `Portfolio: ${portfolioData.map(p => `${p.ticker} (${p.shares} shares at $${p.current_price})`).join(", ")}`
      : "No portfolio data";

    const result = await InvokeLLM({
      prompt: `Analyze this hypothetical market scenario and its impact on the portfolio:

${portfolioContext}

Scenario: ${scenario}

Provide:
1. Overall impact assessment
2. Affected stocks and how
3. Risk level (High/Medium/Low)
4. Recommended actions`,
      response_json_schema: {
        type: "object",
        properties: {
          impact_summary: { type: "string" },
          affected_stocks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                ticker: { type: "string" },
                impact: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          risk_level: { type: "string" },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    });

    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const scenarios = [
    "Federal Reserve raises interest rates by 0.5%",
    "Major tech company announces breakthrough in AI",
    "Global supply chain disruption in semiconductors",
    "Oil prices surge by 30% due to geopolitical tensions"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1C] to-[#0F1729] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">What If Analysis</h1>
          <p className="text-gray-400">Explore hypothetical market scenarios and their impact</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Define Your Scenario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  placeholder="Describe a hypothetical market event or scenario..."
                  className="min-h-[150px] bg-gray-800/50 border-gray-700 text-white"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !scenario.trim()}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                      Analyzing Impact...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Analyze Impact
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {analysis && (
              <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Impact Summary</h3>
                    <p className="text-white leading-relaxed">{analysis.impact_summary}</p>
                  </div>

                  {analysis.affected_stocks?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3">Affected Stocks</h3>
                      <div className="space-y-3">
                        {analysis.affected_stocks.map((stock, idx) => (
                          <div key={idx} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-emerald-400">{stock.ticker}</span>
                              <span className="text-sm text-gray-400">{stock.impact}</span>
                            </div>
                            <p className="text-sm text-gray-300">{stock.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.recommendations?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3">Recommended Actions</h3>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-white flex items-start gap-2">
                            <span className="text-emerald-400">→</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">Sample Scenarios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {scenarios.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => setScenario(s)}
                    className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 hover:border-emerald-500/50 hover:bg-gray-800 transition-all cursor-pointer"
                  >
                    <p className="text-sm text-white">{s}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}