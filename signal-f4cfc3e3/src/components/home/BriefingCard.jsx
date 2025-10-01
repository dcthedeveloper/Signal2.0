import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import TextToSpeech from "../shared/TextToSpeech";

export default function BriefingCard({ news }) {
  const getSentimentIcon = () => {
    if (news.sentiment === "Bullish") return <TrendingUp className="w-4 h-4" />;
    if (news.sentiment === "Bearish") return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getSentimentColor = () => {
    if (news.sentiment === "Bullish") return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
    if (news.sentiment === "Bearish") return "text-red-400 bg-red-500/20 border-red-500/30";
    return "text-gray-400 bg-gray-500/20 border-gray-500/30";
  };

  const getImpactColor = () => {
    if (news.impact_level === "high") return "border-l-red-500";
    if (news.impact_level === "medium") return "border-l-yellow-500";
    return "border-l-blue-500";
  };

  const audioText = `${news.headline}. ${news.summary}`;

  return (
    <Card className={`bg-gray-900/40 border-gray-800/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all border-l-4 ${getImpactColor()} group`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {news.tickers?.map((ticker) => (
                <Badge key={ticker} variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                  {ticker}
                </Badge>
              ))}
              {news.category && (
                <Badge variant="outline" className="text-gray-400 border-gray-700">
                  {news.category.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
              {news.headline}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {news.summary}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
          <div className="flex items-center gap-4">
            <Badge className={`flex items-center gap-1 ${getSentimentColor()} border`}>
              {getSentimentIcon()}
              {news.sentiment}
            </Badge>
            <span className="text-xs text-gray-500">
              {news.published_at ? format(new Date(news.published_at), "MMM d, h:mm a") : 'Recent'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TextToSpeech text={audioText} />
            {news.source_url && (
              <a
                href={news.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}