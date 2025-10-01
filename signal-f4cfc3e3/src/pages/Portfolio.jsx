import React, { useState, useEffect } from "react";
import { Portfolio as PortfolioEntity } from "@/api/entities";
import { NewsItem } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, Trash2, RefreshCw, Bitcoin, DollarSign, Gem, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AddTickerDialog from "../components/portfolio/AddTickerDialog";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Portfolio({ user, isAnonymous }) {
  const navigate = useNavigate();
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("portfolio");
  const [isResetting, setIsResetting] = useState(false);
  const [marketFilter, setMarketFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const items = await PortfolioEntity.list("-created_date");
    setPortfolioItems(items.filter(item => !item.is_watchlist));
    setWatchlistItems(items.filter(item => item.is_watchlist));
    setIsLoading(false);
  };

  const handleAdd = async (data) => {
    await PortfolioEntity.create(data);
    loadData();
  };

  const handleDelete = async (id) => {
    await PortfolioEntity.delete(id);
    loadData();
  };

  const handleResetDemo = async () => {
    if (!confirm("This will delete all portfolio and news data. Continue?")) return;
    
    setIsResetting(true);
    
    const [portfolioItems, newsItems] = await Promise.all([
      PortfolioEntity.list(),
      NewsItem.list()
    ]);

    for (const item of portfolioItems) {
      await PortfolioEntity.delete(item.id);
    }

    for (const item of newsItems) {
      await NewsItem.delete(item.id);
    }

    navigate(createPageUrl("Home"));
  };

  const getMarketIcon = (type) => {
    switch(type) {
      case "crypto": return <Bitcoin className="w-5 h-5" />;
      case "forex": return <DollarSign className="w-5 h-5" />;
      case "commodity": return <Gem className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getMarketColor = (type) => {
    switch(type) {
      case "crypto": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "forex": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "commodity": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }
  };

  const filterByMarket = (items) => {
    if (marketFilter === "all") return items;
    return items.filter(item => item.market_type === marketFilter);
  };

  const renderPortfolioCard = (item) => (
    <Card key={item.id} className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gray-800/50 rounded-xl flex items-center justify-center">
              {getMarketIcon(item.market_type)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-emerald-400">{item.ticker}</h3>
              <p className="text-sm text-gray-400">{item.company_name}</p>
              <Badge className={`mt-2 ${getMarketColor(item.market_type)} border text-xs`}>
                {item.market_type || "stock"}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(item.id)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {!item.is_watchlist && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">
                  {item.market_type === "forex" ? "Units" : item.market_type === "crypto" ? "Amount" : "Shares"}
                </p>
                <p className="text-lg font-semibold text-white">{item.shares}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg Cost</p>
                <p className="text-lg font-semibold text-white">${item.avg_cost?.toFixed(2)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Market Value</p>
                  <p className="text-2xl font-bold text-white">${item.market_value?.toFixed(2)}</p>
                </div>
                <div className={`flex items-center gap-1 ${item.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.change_percent >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  <span className="font-bold">{Math.abs(item.change_percent).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </>
        )}

        {item.is_watchlist && (
          <div className="pt-4 border-t border-gray-800/50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Current Price</p>
              <p className="text-2xl font-bold text-white">${item.current_price?.toFixed(2)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const currentItems = activeTab === "portfolio" ? portfolioItems : watchlistItems;
  const filteredItems = filterByMarket(currentItems);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1C] to-[#0F1729] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Portfolio & Watchlist</h1>
            <p className="text-gray-400">Manage your investments across all markets</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleResetDemo}
              disabled={isResetting}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              {isResetting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Reset Demo Data
            </Button>
            <Button onClick={() => setShowAddDialog(true)} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="bg-gray-900/40 border border-gray-800/50">
              <TabsTrigger value="portfolio" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                Portfolio ({portfolioItems.length})
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                Watchlist ({watchlistItems.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={marketFilter} onValueChange={setMarketFilter}>
            <SelectTrigger className="w-48 bg-gray-900/40 border-gray-800/50 text-white">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All Markets</SelectItem>
              <SelectItem value="stock">Stocks</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="forex">Forex</SelectItem>
              <SelectItem value="commodity">Commodities</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(renderPortfolioCard)}
          </div>
        ) : (
          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <p className="text-gray-400 mb-4">
                {marketFilter !== "all" 
                  ? `No ${marketFilter} assets found. Try a different filter.`
                  : `No assets in your ${activeTab} yet.`
                }
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="bg-emerald-500 hover:bg-emerald-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Asset
              </Button>
            </CardContent>
          </Card>
        )}

        <AddTickerDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAdd={handleAdd}
          isWatchlist={activeTab === "watchlist"}
        />
      </div>
    </div>
  );
}