import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, TrendingUp, PlayCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WelcomeScreen({ onTryDemo, isLoadingDemo }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#0A0F1C] to-[#0F1729]">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/50 animate-pulse">
              <Zap className="w-14 h-14 text-white" />
            </div>
            <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl"></div>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Signal</span>
        </h1>
        
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Your AI-powered financial intelligence platform. Get personalized insights, 
          real-time market analysis, and smart portfolio management.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl p-8 hover:bg-gray-900/60 transition-all group cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Build Your Portfolio</h3>
              <p className="text-gray-400 mb-6">
                Add stocks to track and receive AI-powered insights tailored to your investments.
              </p>
              <Button 
                onClick={() => navigate(createPageUrl("Portfolio"))}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white group-hover:shadow-lg group-hover:shadow-emerald-500/50 transition-all"
              >
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>

          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl p-8 hover:bg-gray-900/60 transition-all group cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PlayCircle className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Try Demo Mode</h3>
              <p className="text-gray-400 mb-6">
                Explore Signal with sample portfolio data and see AI insights in action.
              </p>
              <Button 
                onClick={onTryDemo}
                disabled={isLoadingDemo}
                variant="outline"
                className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all"
              >
                {isLoadingDemo ? "Loading..." : "Try Demo"} <PlayCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            AI-Powered Analysis
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Real-Time Market Data
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Smart Alerts
          </div>
        </div>
      </div>
    </div>
  );
}