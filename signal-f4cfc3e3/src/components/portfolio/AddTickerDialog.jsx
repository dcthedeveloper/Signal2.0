
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvokeLLM } from "@/api/integrations";
import { User } from "@/api/entities";
import { Search, Loader2, TrendingUp, Bitcoin, DollarSign, Gem, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AddTickerDialog({ open, onClose, onAdd, isWatchlist }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [marketType, setMarketType] = useState("stock");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [shares, setShares] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [error, setError] = useState(null);

  const getMarketIcon = (type) => {
    switch(type) {
      case "crypto": return <Bitcoin className="w-4 h-4" />;
      case "forex": return <DollarSign className="w-4 h-4" />;
      case "commodity": return <Gem className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getMarketLabel = (type) => {
    switch(type) {
      case "crypto": return "Cryptocurrency";
      case "forex": return "Forex Pair";
      case "commodity": return "Commodity";
      default: return "Stock";
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    setSearchResults([]); // Clear previous results

    let foundWithAlphaVantage = false;

    try {
      const user = await User.me();
      const alphaVantageKey = user.api_keys?.alpha_vantage;

      // Attempt to use Alpha Vantage if key is available and marketType is not commodity
      if (alphaVantageKey && marketType !== "commodity") { 
        let url = "";
        
        if (marketType === "stock") {
          url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${searchQuery.toUpperCase()}&apikey=${alphaVantageKey}`;
        } else if (marketType === "crypto") {
          url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${searchQuery.toUpperCase()}&to_currency=USD&apikey=${alphaVantageKey}`;
        } else if (marketType === "forex") {
          const parts = searchQuery.toUpperCase().split("/");
          const from = parts[0];
          const to = parts.length > 1 ? parts[1] : 'USD'; // Default to USD if only one currency given
          url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${alphaVantageKey}`;
        }

        if (url) {
          const response = await fetch(url);
          const data = await response.json();

          if (data["Error Message"] || data["Note"] || Object.keys(data).length === 0) {
            console.warn("Alpha Vantage API error or no data:", data);
            setError("Alpha Vantage: Invalid symbol, API limit reached, or no data. Falling back to AI search.");
          } else {
            let result = null;
            
            if (marketType === "stock" && data["Global Quote"]) {
              const quote = data["Global Quote"];
              result = {
                ticker: quote["01. symbol"],
                company_name: quote["02. open"] ? quote["01. symbol"] : "Unknown Stock",
                current_price: parseFloat(quote["05. price"]),
                market_type: "stock"
              };
            } else if ((marketType === "crypto" || marketType === "forex") && data["Realtime Currency Exchange Rate"]) {
              const rate = data["Realtime Currency Exchange Rate"];
              result = {
                ticker: `${rate["1. From_Currency Code"]}/${rate["3. To_Currency Code"]}`,
                company_name: rate["2. From_Currency Name"] || `${rate["1. From_Currency Code"]} to ${rate["3. To_Currency Code"]} Rate`,
                current_price: parseFloat(rate["5. Exchange Rate"]),
                market_type: marketType
              };
            }

            if (result && !isNaN(result.current_price) && result.current_price > 0) {
              setSearchResults([result]);
              foundWithAlphaVantage = true;
              setError(null); // Clear error if AV search was successful
            } else {
              setError("Alpha Vantage: Failed to parse data or data invalid. Falling back to AI search.");
            }
          }
        }
      } else if (!alphaVantageKey && marketType !== "commodity") {
        setError("Add Alpha Vantage API key in Settings for real-time data. Falling back to AI search.");
      }

      // Fallback to InvokeLLM if Alpha Vantage didn't provide results, or if it's a commodity search,
      // or if Alpha Vantage key is missing for other types.
      if (!foundWithAlphaVantage) {
        let prompt = "";
        if (marketType === "stock") {
          prompt = `Search for stock ticker information for: "${searchQuery}". Return current price and company details.`;
        } else if (marketType === "crypto") {
          prompt = `Search for cryptocurrency information for: "${searchQuery}". Return current price in USD, full name, and symbol. Examples: Bitcoin (BTC), Ethereum (ETH).`;
        } else if (marketType === "forex") {
          prompt = `Search for forex pair information for: "${searchQuery}". Return current exchange rate and pair name. Examples: EUR/USD, GBP/JPY.`;
        } else if (marketType === "commodity") {
          prompt = `Search for commodity information for: "${searchQuery}". Return current price and commodity name. Examples: Gold, Crude Oil, Natural Gas.`;
        }

        const llmResult = await InvokeLLM({
          prompt: prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              ticker: { type: "string" },
              company_name: { type: "string" },
              current_price: { type: "number" },
              market_type: { type: "string" }
            },
            required: ["ticker", "company_name", "current_price", "market_type"]
          }
        });

        if (llmResult && llmResult.ticker && !isNaN(llmResult.current_price) && llmResult.current_price > 0) {
          setSearchResults([{ ...llmResult, market_type: llmResult.market_type || marketType }]);
          setError(null); // Clear any previous errors if LLM search was successful
        } else {
          // If LLM also failed, keep any prior error or set a new one
          setError(prevError => prevError || "AI search failed to find valid data. Please try a different query.");
        }
      }

    } catch (err) {
      console.error("Search error:", err);
      // If a critical error occurred, override or set the error message
      setError(err.message || "An unexpected error occurred during search.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    if (isWatchlist) {
      onAdd({
        ticker: asset.ticker,
        company_name: asset.company_name,
        current_price: asset.current_price,
        market_type: asset.market_type,
        is_watchlist: true,
        shares: 0,
        avg_cost: 0,
        market_value: 0,
        change_percent: 0
      });
      handleClose();
    }
  };

  const handleAddToPortfolio = () => {
    if (!selectedAsset || shares === "" || avgCost === "") return;

    const sharesNum = parseFloat(shares);
    const avgCostNum = parseFloat(avgCost);
    const currentPrice = selectedAsset.current_price || 0; // Ensure current_price is valid

    if (isNaN(sharesNum) || isNaN(avgCostNum) || sharesNum <= 0 || avgCostNum <= 0) {
        setError("Please enter valid positive numbers for shares/amount and average cost.");
        return;
    }

    const marketValue = sharesNum * currentPrice;
    const changePercent = ((currentPrice - avgCostNum) / avgCostNum) * 100;

    onAdd({
      ticker: selectedAsset.ticker,
      company_name: selectedAsset.company_name,
      market_type: selectedAsset.market_type,
      shares: sharesNum,
      avg_cost: avgCostNum,
      current_price: currentPrice,
      market_value: marketValue,
      change_percent: changePercent,
      is_watchlist: false
    });
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setMarketType("stock");
    setSearchResults([]);
    setSelectedAsset(null);
    setShares("");
    setAvgCost("");
    setError(null); // Clear error on close
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isWatchlist ? "Add to Watchlist" : "Add to Portfolio"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert className="bg-yellow-500/10 border-yellow-500/30">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-300 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label className="text-gray-400 mb-2 block">Market Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: "stock", label: "Stocks", icon: TrendingUp },
                { value: "crypto", label: "Crypto", icon: Bitcoin },
                { value: "forex", label: "Forex", icon: DollarSign },
                { value: "commodity", label: "Commodities", icon: Gem }
              ].map((market) => (
                <button
                  key={market.value}
                  onClick={() => {
                    setMarketType(market.value);
                    setSearchResults([]); // Clear results when market type changes
                    setSelectedAsset(null); // Deselect asset when market type changes
                    setError(null); // Clear error when market type changes
                  }}
                  className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                    marketType === market.value
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <market.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{market.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder={`Search ${getMarketLabel(marketType).toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Button onClick={handleSearch} disabled={isSearching} className="bg-emerald-500 hover:bg-emerald-600">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectAsset(result)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedAsset?.ticker === result.ticker
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center">
                        {getMarketIcon(result.market_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-emerald-400">{result.ticker}</p>
                          <Badge variant="outline" className="text-xs">
                            {getMarketLabel(result.market_type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">{result.company_name}</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold">${result.current_price?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedAsset && !isWatchlist && (
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <div>
                <Label className="text-gray-400">
                  {marketType === "forex" ? "Units" : marketType === "crypto" ? "Amount" : "Shares/Contracts"}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  placeholder="e.g., 10"
                  className="bg-gray-800 border-gray-700 text-white mt-2"
                />
              </div>
              <div>
                <Label className="text-gray-400">Average Cost per Unit</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={avgCost}
                  onChange={(e) => setAvgCost(e.target.value)}
                  placeholder="e.g., 150.00"
                  className="bg-gray-800 border-gray-700 text-white mt-2"
                />
              </div>
              <Button onClick={handleAddToPortfolio} className="w-full bg-emerald-500 hover:bg-emerald-600">
                Add to Portfolio
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
