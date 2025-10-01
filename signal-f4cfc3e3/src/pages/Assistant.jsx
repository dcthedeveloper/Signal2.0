import React, { useState } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Portfolio } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Send, Sparkles } from "lucide-react";

export default function Assistant({ user, isAnonymous }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI financial assistant. Ask me anything about your portfolio, market trends, or investment strategies." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const portfolioData = await Portfolio.list();
    const portfolioContext = portfolioData.length > 0 
      ? `User's portfolio includes: ${portfolioData.map(p => `${p.ticker} (${p.company_name})`).join(", ")}`
      : "User has no portfolio data yet.";

    const conversationHistory = messages.map(m => `${m.role}: ${m.content}`).join("\n");

    const response = await InvokeLLM({
      prompt: `You are a financial AI assistant. Context: ${portfolioContext}

Conversation history:
${conversationHistory}
user: ${input}

Provide helpful, accurate financial advice. Be concise but informative.`,
      add_context_from_internet: true
    });

    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1C] to-[#0F1729] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <MessageSquare className="w-10 h-10 text-emerald-400" />
            AI Assistant
          </h1>
          <p className="text-gray-400">Ask questions about your investments and the market</p>
        </div>

        <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl mb-4">
          <CardContent className="p-6">
            <div className="space-y-4 max-h-[600px] overflow-y-auto mb-4">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === "user"
                        ? "bg-emerald-500/20 text-white border border-emerald-500/30"
                        : "bg-gray-800/50 text-white border border-gray-700"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Sparkles className="w-4 h-4 text-emerald-400 mb-2" />
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/50 text-white border border-gray-700 p-4 rounded-2xl">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your portfolio, market trends, or investment advice..."
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}