import React from "react";
import {
  Building,
  CreditCard,
  Receipt,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export type SysAdminTab = "organizations" | "plans" | "payments";

interface SysAdminSidebarProps {
  activeTab: SysAdminTab;
  onTabChange: (tab: SysAdminTab) => void;
  orgCount?: number;
  plansCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOnboardClick: () => void;
}

export const SysAdminSidebar: React.FC<SysAdminSidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  onOnboardClick,
}) => {
  const navItems: {
    id: SysAdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: "organizations",
      label: "Organizations",
      icon: Building,
    },
    {
      id: "plans",
      label: "Plans & Pricing",
      icon: CreditCard,
    },
    {
      id: "payments",
      label: "Payment History",
      icon: Receipt,
    },
  ];

  return (
    <aside
      className={`shrink-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800 shadow-xs transition-[width] duration-300 ease-in-out flex flex-col justify-between ${
        isCollapsed ? "w-16" : "w-60"
      }`}
      style={{ minHeight: "calc(100vh - 52px)" }}
    >
      <div className="flex flex-col flex-1">
        {/* Header Row with Collapse Button matching user sidebar */}
        {onToggleCollapse && (
          <div className="h-12 px-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div
              className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${
                isCollapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100"
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 truncate">
                Navigation
              </span>
            </div>

            <button
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer ${
                isCollapsed ? "mx-auto" : "ml-auto"
              }`}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4.5 h-4.5" />
              ) : (
                <PanelLeftClose className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
        )}

        {/* Navigation list */}
        <nav className="py-3 px-2.5 space-y-1 overflow-y-auto flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full group relative flex items-center h-10 px-2.5 rounded-lg transition-colors overflow-hidden cursor-pointer ${
                  isActive
                    ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold border-l-[3px] border-sky-500 pl-[7px]"
                    : "text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="w-6 h-6 shrink-0 flex items-center justify-center text-sky-500 transition-transform duration-200 group-hover:scale-110">
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                    isCollapsed
                      ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                      : "max-w-[150px] opacity-100 translate-x-0 ml-3 truncate"
                  }`}
                >
                  {item.label}
                </span>
                {isCollapsed && (
                  <div className="pointer-events-none fixed left-[68px] px-2.5 py-1 rounded-md bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Action Button at Bottom */}
      <div className="p-2.5 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={onOnboardClick}
          className={`w-full h-10 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer ${
            isCollapsed ? "px-0" : "px-3"
          }`}
          title="Onboard Organization"
        >
          <Plus className="w-4.5 h-4.5 shrink-0" />
          {!isCollapsed && <span className="truncate">Onboard Organization</span>}
        </button>
      </div>
    </aside>
  );
};
