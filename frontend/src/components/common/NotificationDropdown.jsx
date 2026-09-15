import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import notificationApi from "../../api/notification.api";
import useAuthStore from "../../store/useAuthStore";
import socketService from "../../services/socket.service";
import { requestAndSaveFcmToken } from "../../utils/fcm.utils";

export default function NotificationDropdown() {
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await notificationApi.getMyNotifications(1, 15);
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    loadNotifications();
    requestAndSaveFcmToken();

    // Socket.IO real-time notification listener (No continuous polling required!)
    const socket = socketService.connect(accessToken);
    const handleNewNotification = (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev.filter((n) => n._id !== newNotif._id)]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [accessToken]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (n) => {
    // 1. Call mark as read API
    if (!n.isRead) {
      try {
        await notificationApi.markAsRead(n._id);
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    }

    // 2. Open full detail popup modal
    setSelectedNotification(n);
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-96 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden text-text-primary">
          <div className="p-3 border-b border-border flex items-center justify-between bg-surface-elevated">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-text-accent hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-muted animate-pulse">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 text-xs cursor-pointer transition-colors flex gap-3 ${
                    !n.isRead ? "bg-surface-hover/80" : "hover:bg-surface-hover/50 opacity-80"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center text-text-accent shrink-0 font-bold">
                    🔔
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-semibold text-text-primary truncate">
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-text-muted shrink-0">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-text-secondary leading-snug line-clamp-2">
                      {n.message || n.body}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 bg-red-500 rounded-full shrink-0 self-center"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Notification Detail Popup Modal */}
      {selectedNotification &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6 relative text-text-primary max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="absolute top-4 right-4 p-1 text-text-muted hover:text-text-primary rounded-lg transition-colors"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl shrink-0 font-bold">
                  🔔
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-primary">
                    {selectedNotification.title}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {formatTime(selectedNotification.createdAt)}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-background-secondary border border-border mb-6">
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {selectedNotification.message || selectedNotification.body}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-xs shadow-lg hover:brightness-110 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
