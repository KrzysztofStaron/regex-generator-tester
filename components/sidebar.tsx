import { Search, Code, FileText, Play, BookOpen, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    {
      group: "Generation",
      items: [
        {
          id: "generate",
          label: "Generate Regex",
          icon: Zap,
          description: "From natural language",
        },
      ],
    },
    {
      group: "Tools",
      items: [
        {
          id: "analyze",
          label: "Analyze Regex",
          icon: Search,
          description: "Reverse mode",
        },
        {
          id: "sandbox",
          label: "Interactive Sandbox",
          icon: Play,
          description: "Test and refine",
        },
      ],
    },
    {
      group: "Other",
      items: [
        {
          id: "library",
          label: "Pattern Library",
          icon: BookOpen,
          description: "Common patterns",
        },
      ],
    },
  ];

  return (
    <div className="w-full md:w-64 bg-zinc-900/80 backdrop-blur-sm border-b md:border-r md:border-b-0 border-zinc-800/50 flex flex-col md:h-screen md:fixed md:left-0 md:top-0 md:z-50">
      <div className="p-4 md:p-6 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <Image src="/icon.png" alt="Regex Hub" width={40} height={40} />
          <div>
            <h1 className="text-lg font-semibold text-white">Regex Hub</h1>
            <p className="text-xs text-slate-400">Pattern Intelligence</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {menuItems.map(group => (
            <div key={group.group} className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3">{group.group}</h3>
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                        activeTab === item.id
                          ? "bg-zinc-800/60 backdrop-blur-sm text-white shadow-lg"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
                      )}
                      title={item.description}
                    >
                      <Icon className="w-4 h-4" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-zinc-500">{item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
