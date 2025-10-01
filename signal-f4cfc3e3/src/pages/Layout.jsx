
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Bell, 
  Settings as SettingsIcon,
  Loader2,
  Zap
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Briefing", url: createPageUrl("Home"), icon: LayoutDashboard },
  { title: "Portfolio", url: createPageUrl("Portfolio"), icon: Briefcase },
  { title: "Analysis", url: createPageUrl("Analysis"), icon: FileText },
  { title: "Assistant", url: createPageUrl("Assistant"), icon: MessageSquare },
  { title: "What If", url: createPageUrl("WhatIf"), icon: TrendingUp },
  { title: "Calendar", url: createPageUrl("Calendar"), icon: CalendarIcon },
  { title: "Alerts", url: createPageUrl("Alerts"), icon: Bell },
  { title: "Settings", url: createPageUrl("Settings"), icon: SettingsIcon },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        setIsAnonymous(false);
      } catch (error) {
        setUser(null);
        setIsAnonymous(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Zap className="w-16 h-16 text-emerald-500" />
              <Loader2 className="w-16 h-16 text-emerald-500 absolute inset-0 animate-spin opacity-50" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Initializing Signal...</h2>
          <p className="text-gray-400">Connecting to financial intelligence</p>
        </div>
      </div>
    );
  }

  const childrenWithProps = React.cloneElement(children, { user, isAnonymous });

  return (
    <SidebarProvider>
      {user && user.high_contrast && (
        <style>{`
          :root {
            --background: 0 0% 100%;
            --foreground: 0 0% 0%;
          }
          .dark {
            --background: 0 0% 0%;
            --foreground: 0 0% 100%;
          }
        `}</style>
      )}
      <div className="min-h-screen flex w-full bg-[#0A0F1C]">
        {/* Desktop Sidebar */}
        <Sidebar className="border-r border-gray-800/50 hidden md:flex" style={{ backgroundColor: '#0A0F1C' }}>
          <SidebarHeader className="border-b border-gray-800/50 p-6" style={{ backgroundColor: '#0A0F1C' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-white">Signal</h2>
                <p className="text-xs text-emerald-500">Financial Intelligence</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3" style={{ backgroundColor: '#0A0F1C' }}>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`group transition-all duration-200 rounded-xl mb-1 ${
                            isActive 
                              ? 'bg-emerald-500/20 text-emerald-400 backdrop-blur-sm' 
                              : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : ''}`} />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-800/50 p-4" style={{ backgroundColor: '#0A0F1C' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                <span className="text-emerald-400 font-semibold text-sm">
                  {user ? user.email?.[0]?.toUpperCase() || 'U' : 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">
                  {user ? user.email || 'User' : 'Anonymous'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {isAnonymous ? 'Guest Mode' : 'Active'}
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <header className="bg-[#0A0F1C]/80 backdrop-blur-xl border-b border-gray-800/50 px-4 py-4 md:hidden sticky top-0 z-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Signal</h1>
                </div>
              </div>
              <SidebarTrigger className="text-white hover:bg-gray-800/30 p-2 rounded-lg" />
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {childrenWithProps}
          </div>

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden bg-[#0A0F1C]/95 backdrop-blur-xl border-t border-gray-800/50 px-2 py-2 sticky bottom-0">
            <div className="flex items-center justify-around">
              {[
                navigationItems[0],
                navigationItems[1],
                navigationItems[2],
                navigationItems[6],
              ].map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-gray-400'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </main>
      </div>
    </SidebarProvider>
  );
}
