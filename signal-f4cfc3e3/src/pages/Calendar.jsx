import React, { useState } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Portfolio } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, TrendingUp, Loader2, DollarSign, Briefcase } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format, addDays } from "date-fns";

export default function Calendar({ user, isAnonymous }) {
  const [earningsEvents, setEarningsEvents] = useState([]);
  const [macroEvents, setMacroEvents] = useState([]);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(false);
  const [isLoadingMacro, setIsLoadingMacro] = useState(false);

  const loadEarningsCalendar = async () => {
    setIsLoadingEarnings(true);

    const portfolioData = await Portfolio.list();
    const tickers = portfolioData.map(p => p.ticker).join(", ");

    if (!tickers) {
      setEarningsEvents([]);
      setIsLoadingEarnings(false);
      return;
    }

    const result = await InvokeLLM({
      prompt: `Get upcoming earnings dates for these stocks: ${tickers}. Return as a list with ticker, company name, date, and time if available. Include the next 30 days.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                ticker: { type: "string" },
                company: { type: "string" },
                date: { type: "string" },
                time: { type: "string" },
                quarter: { type: "string" }
              }
            }
          }
        }
      }
    });

    setEarningsEvents(result.events || []);
    setIsLoadingEarnings(false);
  };

  const loadMacroEvents = async () => {
    setIsLoadingMacro(true);

    const result = await InvokeLLM({
      prompt: `Get upcoming major macroeconomic events for the next 30 days including:
      - Federal Reserve meetings (FOMC)
      - CPI (inflation) reports
      - GDP releases
      - Employment reports (NFP)
      - Central bank decisions
      - Major economic data releases
      
      Return with event name, date, time if available, description, and impact level (high/medium/low).`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                event_name: { type: "string" },
                date: { type: "string" },
                time: { type: "string" },
                description: { type: "string" },
                impact_level: { type: "string" },
                category: { type: "string" }
              }
            }
          }
        }
      }
    });

    setMacroEvents(result.events || []);
    setIsLoadingMacro(false);
  };

  const getImpactColor = (level) => {
    if (level?.toLowerCase() === "high") return "bg-red-500/20 text-red-400 border-red-500/30";
    if (level?.toLowerCase() === "medium") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const getCategoryIcon = (category) => {
    if (category?.toLowerCase().includes("fed") || category?.toLowerCase().includes("central")) {
      return <DollarSign className="w-5 h-5" />;
    }
    if (category?.toLowerCase().includes("employment") || category?.toLowerCase().includes("job")) {
      return <Briefcase className="w-5 h-5" />;
    }
    return <TrendingUp className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1C] to-[#0F1729] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Economic Calendar</h1>
          <p className="text-gray-400">Track earnings reports and major economic events</p>
        </div>

        <Tabs defaultValue="earnings" className="w-full">
          <TabsList className="bg-gray-900/40 border border-gray-800/50 mb-6">
            <TabsTrigger 
              value="earnings" 
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Earnings Calendar
            </TabsTrigger>
            <TabsTrigger 
              value="macro" 
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Macro Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earnings">
            <div className="mb-6">
              <Button
                onClick={loadEarningsCalendar}
                disabled={isLoadingEarnings}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {isLoadingEarnings ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Load Earnings Calendar
                  </>
                )}
              </Button>
            </div>

            {earningsEvents.length > 0 ? (
              <div className="grid gap-4">
                {earningsEvents.map((event, idx) => (
                  <Card key={idx} className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold text-white">{event.ticker}</h3>
                              {event.quarter && (
                                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                                  {event.quarter}
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-400">{event.company}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-emerald-400">{event.date}</p>
                          {event.time && <p className="text-sm text-gray-400">{event.time}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
                <CardContent className="p-12 text-center">
                  <CalendarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">
                    {isLoadingEarnings ? "Loading earnings calendar..." : "Click 'Load Earnings Calendar' to see upcoming earnings for your portfolio"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="macro">
            <div className="mb-6">
              <Button
                onClick={loadMacroEvents}
                disabled={isLoadingMacro}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {isLoadingMacro ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Load Macro Events
                  </>
                )}
              </Button>
            </div>

            {macroEvents.length > 0 ? (
              <div className="grid gap-4">
                {macroEvents.map((event, idx) => (
                  <Card key={idx} className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          event.impact_level?.toLowerCase() === "high" ? "bg-red-500/20" :
                          event.impact_level?.toLowerCase() === "medium" ? "bg-yellow-500/20" :
                          "bg-blue-500/20"
                        }`}>
                          {getCategoryIcon(event.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-white mb-1">{event.event_name}</h3>
                              <p className="text-sm text-gray-400">{event.description}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-lg font-semibold text-emerald-400 whitespace-nowrap">{event.date}</p>
                              {event.time && <p className="text-sm text-gray-400">{event.time}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            {event.impact_level && (
                              <Badge className={`${getImpactColor(event.impact_level)} border`}>
                                {event.impact_level} Impact
                              </Badge>
                            )}
                            {event.category && (
                              <Badge variant="outline" className="text-gray-400 border-gray-700">
                                {event.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">
                    {isLoadingMacro ? "Loading macro events..." : "Click 'Load Macro Events' to see upcoming economic events"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Track FOMC meetings, CPI reports, GDP releases, and more
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}