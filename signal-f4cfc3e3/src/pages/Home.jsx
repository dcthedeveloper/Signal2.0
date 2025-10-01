import React, { useState, useEffect } from "react";
import { Portfolio } from "@/api/entities";
import { NewsItem } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import WelcomeScreen from "../components/home/WelcomeScreen";
import BriefingCard from "../components/home/BriefingCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, DollarSign, Zap, Search } from "lucide-react";

export default function Home({ user, isAnonymous }) {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = newsItems.filter(news => 
        news.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.tickers?.some(ticker => ticker.toLowerCase().includes(searchQuery.toLowerCase())) ||
        news.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNews(filtered);
    } else {
      setFilteredNews(newsItems);
    }
  }, [searchQuery, newsItems]);

  const loadData = async () => {
    setIsLoading(true);
    const [portfolio, news] = await Promise.all([
      Portfolio.list("-created_date"),
      NewsItem.list("-published_at", 20)
    ]);
    setPortfolioItems(portfolio);
    setNewsItems(news);
    setFilteredNews(news);
    setIsLoading(false);
  };

  const handleTryDemo = async () => {
    setIsLoadingDemo(true);
    
    const demoPrompt = `Generate realistic portfolio data and news across different asset classes:

STOCKS: Apple (AAPL), Tesla (TSLA)
CRYPTO: Bitcoin (BTC), Ethereum (ETH)
FOREX: EUR/USD, GBP/JPY
COMMODITIES: Gold (XAU), Crude Oil (CL)

For each asset create:
1. Portfolio data with realistic current prices and market values
2. 1-2 recent news items with headlines, summaries, sentiment analysis, and market-specific context

Return as JSON with two arrays: "portfolio_items" and "news_items"`;

    const result = await InvokeLLM({
      prompt: demoPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          portfolio_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                ticker: { type: "string" },
                company_name: { type: "string" },
                market_type: { type: "string" },
                shares: { type: "number" },
                avg_cost: { type: "number" },
                current_price: { type: "number" },
                market_value: { type: "number" },
                change_percent: { type: "number" },
                is_watchlist: { type: "boolean" }
              }
            }
          },
          news_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                headline: { type: "string" },
                summary: { type: "string" },
                tickers: { type: "array", items: { type: "string" } },
                category: { type: "string" },
                impact_level: { type: "string" },
                published_at: { type: "string" },
                sentiment: { type: "string" }
              }
            }
          }
        }
      }
    });

    if (result.portfolio_items) {
      await Portfolio.bulkCreate(result.portfolio_items);
    }
    if (result.news_items) {
      await NewsItem.bulkCreate(result.news_items);
    }

    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0A0F1C] to-[#0F1729]">
        <div className="flex items-center gap-3 text-emerald-400">
          <Zap className="w-6 h-6 animate-pulse" />
          <span className="text-lg">Loading briefing...</span>
        </div>
      </div>
    );
  }

  if (portfolioItems.length === 0) {
    return <WelcomeScreen onTryDemo={handleTryDemo} isLoadingDemo={isLoadingDemo} />;
  }

  const totalValue = portfolioItems.reduce((sum, item) => sum + (item.market_value || 0), 0);
  const watchlistCount = portfolioItems.filter(item => item.is_watchlist).length;
  const portfolioCount = portfolioItems.filter(item => !item.is_watchlist).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1C] to-[#0F1729] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Daily Briefing</h1>
          <p className="text-gray-400">AI-powered insights for your portfolio</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Holdings</p>
                  <p className="text-2xl font-bold text-white">{portfolioCount}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Watchlist</p>
                  <p className="text-2xl font-bold text-white">{watchlistCount}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              placeholder="Search news by ticker, headline, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-gray-900/40 border-gray-800/50 text-white placeholder:text-gray-500 h-12 text-base"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-400 mt-2">
              Found {filteredNews.length} {filteredNews.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Latest Market Intelligence</h2>
          <div className="grid gap-6">
            {filteredNews.length > 0 ? (
              filteredNews.map((news) => (
                <BriefingCard key={news.id} news={news} />
              ))
            ) : searchQuery ? (
              <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-gray-500 mt-2">Try a different search term or ticker symbol</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-400">No news items yet. Add stocks to your portfolio to see relevant insights.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}