import React, { useState, useEffect } from "react";
import { Document } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import TextToSpeech from "../components/shared/TextToSpeech";

export default function Analysis({ user, isAnonymous }) {
  const [documents, setDocuments] = useState([]);
  const [inputText, setInputText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const docs = await Document.list("-created_date", 5);
    setDocuments(docs);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    
    const result = await InvokeLLM({
      prompt: `Analyze this financial document and provide detailed insights:

${inputText}

Provide:
1. Overall sentiment (Bullish/Bearish/Neutral)
2. Key topics and themes
3. Important financial metrics mentioned
4. Risk factors
5. Investment implications`,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment: { type: "string" },
          key_topics: { type: "array", items: { type: "string" } },
          financial_metrics: { type: "array", items: { type: "string" } },
          risk_factors: { type: "array", items: { type: "string" } },
          implications: { type: "string" }
        }
      }
    });

    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const loadSampleDocument = (doc) => {
    setInputText(doc.full_text);
    setAnalysis(null);
  };

  const getAnalysisAudioText = () => {
    if (!analysis) return "";
    
    let text = `Analysis Results. Sentiment: ${analysis.sentiment}. `;
    
    if (analysis.key_topics?.length > 0) {
      text += `Key topics: ${analysis.key_topics.join(", ")}. `;
    }
    
    if (analysis.financial_metrics?.length > 0) {
      text += `Financial metrics: ${analysis.financial_metrics.join(", ")}. `;
    }
    
    if (analysis.risk_factors?.length > 0) {
      text += `Risk factors: ${analysis.risk_factors.join(". ")}. `;
    }
    
    if (analysis.implications) {
      text += `Investment implications: ${analysis.implications}`;
    }
    
    return text;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1C] to-[#0F1729] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Document Analysis</h1>
          <p className="text-gray-400">AI-powered analysis of financial documents</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Input Document
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your financial document, earnings report, or news article here..."
                  className="min-h-[300px] bg-gray-800/50 border-gray-700 text-white"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !inputText.trim()}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Document
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {analysis && (
              <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      Analysis Results
                    </CardTitle>
                    <TextToSpeech text={getAnalysisAudioText()} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Sentiment</h3>
                    <Badge className={`${
                      analysis.sentiment?.toLowerCase().includes('bullish') 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : analysis.sentiment?.toLowerCase().includes('bearish')
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    } text-lg px-4 py-2`}>
                      {analysis.sentiment}
                    </Badge>
                  </div>

                  {analysis.key_topics?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3">Key Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.key_topics.map((topic, idx) => (
                          <Badge key={idx} variant="outline" className="text-emerald-400 border-emerald-500/30">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.financial_metrics?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3">Financial Metrics</h3>
                      <ul className="space-y-2">
                        {analysis.financial_metrics.map((metric, idx) => (
                          <li key={idx} className="text-white flex items-start gap-2">
                            <span className="text-emerald-400">•</span>
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.risk_factors?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        Risk Factors
                      </h3>
                      <ul className="space-y-2">
                        {analysis.risk_factors.map((risk, idx) => (
                          <li key={idx} className="text-white flex items-start gap-2">
                            <span className="text-yellow-400">⚠</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.implications && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3">Investment Implications</h3>
                      <p className="text-white leading-relaxed">{analysis.implications}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">Sample Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => loadSampleDocument(doc)}
                    className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 hover:border-emerald-500/50 hover:bg-gray-800 transition-all cursor-pointer"
                  >
                    <h4 className="font-semibold text-white mb-1">{doc.title}</h4>
                    <p className="text-xs text-gray-400 mb-2">{doc.company} • {doc.ticker}</p>
                    <Badge variant="outline" className="text-xs">
                      {doc.document_type.replace(/_/g, ' ')}
                    </Badge>
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