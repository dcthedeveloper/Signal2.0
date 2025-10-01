import React, { useState, useEffect } from "react";
import { Alert as AlertEntity } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Plus, Trash2, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Alerts({ user, isAnonymous }) {
  const [alerts, setAlerts] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: "",
    ticker: "",
    conditions: [{ metric: "price", operator: ">", value: "" }],
    notification_tier: "In-App",
    is_active: true
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    const data = await AlertEntity.list("-created_date");
    setAlerts(data);
  };

  const handleCreate = async () => {
    await AlertEntity.create(newAlert);
    setShowDialog(false);
    setNewAlert({
      name: "",
      ticker: "",
      conditions: [{ metric: "price", operator: ">", value: "" }],
      notification_tier: "In-App",
      is_active: true
    });
    loadAlerts();
  };

  const handleToggle = async (alert) => {
    await AlertEntity.update(alert.id, { is_active: !alert.is_active });
    loadAlerts();
  };

  const handleDelete = async (id) => {
    await AlertEntity.delete(id);
    loadAlerts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1C] to-[#0F1729] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Custom Alerts</h1>
            <p className="text-gray-400">Set up alerts for price movements and market events</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="w-4 h-4 mr-2" />
            New Alert
          </Button>
        </div>

        {alerts.length > 0 ? (
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-white">{alert.name}</h3>
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                          {alert.ticker}
                        </Badge>
                        <Badge className={alert.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"}>
                          {alert.is_active ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {alert.conditions?.map((cond, idx) => (
                          <p key={idx} className="text-gray-400">
                            {cond.metric} {cond.operator} {cond.value}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggle(alert)}
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(alert.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No alerts created yet</p>
              <Button onClick={() => setShowDialog(true)} className="bg-emerald-500 hover:bg-emerald-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Alert
              </Button>
            </CardContent>
          </Card>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Create New Alert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Alert name"
                value={newAlert.name}
                onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                className="bg-gray-800 border-gray-700"
              />
              <Input
                placeholder="Ticker (e.g., AAPL)"
                value={newAlert.ticker}
                onChange={(e) => setNewAlert({ ...newAlert, ticker: e.target.value.toUpperCase() })}
                className="bg-gray-800 border-gray-700"
              />
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={newAlert.conditions[0].metric}
                  onValueChange={(value) => setNewAlert({
                    ...newAlert,
                    conditions: [{ ...newAlert.conditions[0], metric: value }]
                  })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="volume">Volume</SelectItem>
                    <SelectItem value="sentiment">Sentiment</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={newAlert.conditions[0].operator}
                  onValueChange={(value) => setNewAlert({
                    ...newAlert,
                    conditions: [{ ...newAlert.conditions[0], operator: value }]
                  })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=">">Greater than</SelectItem>
                    <SelectItem value="<">Less than</SelectItem>
                    <SelectItem value="=">Equals</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Value"
                  value={newAlert.conditions[0].value}
                  onChange={(e) => setNewAlert({
                    ...newAlert,
                    conditions: [{ ...newAlert.conditions[0], value: e.target.value }]
                  })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <Button onClick={handleCreate} className="w-full bg-emerald-500 hover:bg-emerald-600">
                Create Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}