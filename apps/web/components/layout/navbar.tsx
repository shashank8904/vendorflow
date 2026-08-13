"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Sun, Moon, Command, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette } from "./command-palette";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [commandOpen, setCommandOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center h-14 px-4 gap-3 border-b border-border bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        {/* Search */}
        <button
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-gray-50 dark:bg-gray-800 text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-1 max-w-xs"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="text-gray-400 dark:text-gray-500">Search...</span>
          <kbd className="ml-auto flex items-center gap-1 text-xs text-gray-300 dark:text-gray-600 font-mono">
            <Command className="w-3 h-3" />K
          </kbd>
        </button>

        <div className="flex items-center gap-1 ml-auto">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-lg">
            <Bell className="w-4 h-4 text-gray-500" />
            <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-indigo-600 text-white border-2 border-white dark:border-gray-950">
              3
            </Badge>
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-gray-500" />
            ) : (
              <Moon className="w-4 h-4 text-gray-500" />
            )}
          </Button>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <div role="button" tabIndex={0} className="flex items-center gap-2 h-8 pl-1 pr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-xs font-semibold">
                    SN
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-none">Suhas Nair</span>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
            } />
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-xs text-gray-500 font-medium">
                suhas@vendorflow.io
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Team Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400"
                onClick={() => router.push("/login")}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={commandOpen} setOpen={setCommandOpen} />
    </>
  );
}
