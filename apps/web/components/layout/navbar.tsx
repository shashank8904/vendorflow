"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Command, ChevronDown, Check, Loader2, LogOut, Settings, User } from "lucide-react";
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
import { notificationsApi, type NotificationItem } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const { user, signOutUser } = useAuth();
  const router = useRouter();

  const fetchUnread = async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      setUnreadCount(res.unreadCount);
    } catch {
      // Ignore background notification count errors
    }
  };

  const fetchNotificationsList = async () => {
    setLoadingNotifications(true);
    try {
      const res = await notificationsApi.getAll({ limit: 5 });
      setNotifications(res.items);
    } catch {
      // Ignore
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to update notifications");
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "VF";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

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
          {/* Notifications Dropdown */}
          <DropdownMenu onOpenChange={(open) => { if (open) fetchNotificationsList(); }}>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-lg">
                  <Bell className="w-4 h-4 text-gray-500" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-indigo-600 text-white border-2 border-white dark:border-gray-950">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border text-xs font-semibold">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-indigo-600 dark:text-indigo-400 text-[11px] hover:underline font-normal"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-border">
                {loadingNotifications ? (
                  <div className="py-6 text-center text-xs text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-indigo-600" />
                    Loading...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs space-y-1 transition-colors ${
                        n.isRead
                          ? "opacity-60 bg-transparent"
                          : "bg-indigo-50/40 dark:bg-indigo-950/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <div
                  role="button"
                  tabIndex={0}
                  className="flex items-center gap-2 h-8 pl-1 pr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <Avatar className="h-6 w-6">
                    {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || "Avatar"} />}
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-[10px] font-bold">
                      {getInitials(user?.displayName || user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-none truncate max-w-[120px]">
                      {user?.displayName || user?.email?.split("@")[0] || "User"}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
              }
            />
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-2 py-1.5 text-xs text-gray-500 font-medium break-all">
                {user?.email || "user@vendorflow.io"}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")} className="gap-2">
                <Settings className="w-3.5 h-3.5" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400 gap-2 cursor-pointer"
                onClick={signOutUser}
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={commandOpen} setOpen={setCommandOpen} />
    </>
  );
}
