
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Sparkles, Code2, Smartphone, Settings, Menu, Shield, CreditCard, ChevronRight, Zap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Create App",
    url: createPageUrl("Studio"),
    icon: Sparkles,
    description: "Build with AI",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    title: "My Projects",
    url: createPageUrl("Projects"),
    icon: Code2,
    description: "Manage apps",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    title: "Pricing",
    url: createPageUrl("Pricing"),
    icon: CreditCard,
    description: "Upgrade plan",
    gradient: "from-emerald-500 to-teal-500"
  }
];

const adminNavigationItem = {
  title: "Admin Panel",
  url: createPageUrl("AdminPanel"),
  icon: Shield,
  description: "System control",
  gradient: "from-yellow-500 to-orange-500"
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.log("Not logged in");
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, []);

  const allNavItems = [...navigationItems];
  if (currentUser?.role === 'admin') {
    allNavItems.push(adminNavigationItem);
  }
  
  return (
    <div className="bg-slate-950 text-white w-full min-h-screen">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 backdrop-blur-xl">
            <SidebarHeader className="bg-slate-950 p-6 flex flex-col gap-2 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-2.5 rounded-xl shadow-lg shadow-purple-500/25">
                  <Smartphone className="w-full h-full text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Vibe Coding
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">AI Development Platform</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-4 bg-slate-950">
              {/* User Info Section */}
              {currentUser && (
                <div className="mb-6 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
                      {currentUser.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{currentUser.email}</p>
                      <p className="text-xs text-slate-400 capitalize">{currentUser.subscription_plan || 'Free'} Plan</p>
                    </div>
                  </div>
                  {currentUser.role !== 'admin' && (
                    <div className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-slate-300">{currentUser.token_balance || 0} Tokens</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>
              )}

              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-3 mb-2">
                  Navigation
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-2">
                    {allNavItems.map((item) => {
                      const isActive = location.pathname === item.url;
                      const isAdmin = item.title === 'Admin Panel';
                      
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <Link 
                              to={item.url} 
                              className={`group relative flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 overflow-hidden ${
                                isActive 
                                  ? `bg-gradient-to-r ${item.gradient} shadow-lg shadow-purple-500/25 text-white` 
                                  : isAdmin
                                    ? 'hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-orange-500/10 border border-yellow-500/20 text-yellow-300 hover:text-yellow-200 hover:border-yellow-400/30'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:shadow-md'
                              }`}
                            >
                              {/* Background glow effect */}
                              {isActive && (
                                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20 blur-xl`}></div>
                              )}
                              
                              <div className={`relative w-5 h-5 flex items-center justify-center ${
                                isActive 
                                  ? 'text-white' 
                                  : isAdmin 
                                    ? 'text-yellow-400' 
                                    : 'text-slate-400 group-hover:text-white'
                              } transition-colors`}>
                                <item.icon className="w-5 h-5" />
                              </div>
                              
                              <div className="relative flex-1">
                                <span className={`font-semibold text-sm ${
                                  isActive ? 'text-white' : ''
                                }`}>
                                  {item.title}
                                </span>
                                <p className={`text-xs mt-0.5 ${
                                  isActive 
                                    ? 'text-white/80' 
                                    : isAdmin 
                                      ? 'text-yellow-400/70' 
                                      : 'text-slate-500 group-hover:text-slate-400'
                                }`}>
                                  {item.description}
                                </p>
                              </div>
                              
                              {isActive && (
                                <ChevronRight className="w-4 h-4 text-white/80" />
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-slate-800/50">
                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    Powered by AI Technology
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div>
                    <p className="text-xs text-emerald-400">System Online</p>
                  </div>
                </div>
              </div>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 relative min-w-0 w-full">
            <div className="md:hidden absolute top-4 left-4 z-40">
              <SidebarTrigger className="bg-slate-900/80 border border-slate-700/50 text-white hover:bg-slate-800/80 p-2 rounded-lg backdrop-blur-sm">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
            </div>
            
            <div className="h-screen overflow-y-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
