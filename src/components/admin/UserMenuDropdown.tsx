'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, ChevronDown, User } from 'lucide-react';

interface UserMenuDropdownProps {
  userEmail: string;
  onSignOutClick: () => void;
}

export function UserMenuDropdown({ userEmail, onSignOutClick }: UserMenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (email: string) => {
    if (!email) return 'AD';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 transition-all cursor-pointer shadow-2xs group"
        aria-label="User menu"
      >
        <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow-2xs">
          {getInitials(userEmail)}
        </div>

        <div className="hidden lg:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-900 truncate max-w-[130px] leading-tight">
            {userEmail.split('@')[0]}
          </span>
          <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Online</span>
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in zoom-in-95 duration-150 p-2 space-y-1">
          {/* User Info Header Box */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logged in as</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                Online
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 truncate font-mono">{userEmail}</p>
          </div>

          {/* Profile Settings Link */}
          <Link
            href="/admin/profile"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <User className="w-4 h-4 text-slate-500" />
            <span>Admin Profile</span>
          </Link>

          {/* Sign Out Action Button */}
          <button
            onClick={() => {
              setIsOpen(false);
              onSignOutClick();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-red-100"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
