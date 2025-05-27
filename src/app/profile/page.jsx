"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, Plus, Settings, LogOut } from 'lucide-react';
import BottomNavbar from "@/components/home/BotomNavbar";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by checking for accessToken
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      // Redirect to login if not logged in
      router.push('/login');
      return;
    }

    // Get user data from localStorage
      try {
        const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const userData = JSON.parse(storedUser);
    setUser({
      name: userData?.name,
      email: userData?.email,
    });
  } else {
    console.warn('User not found in localStorage');
    // Optional: redirect or show error
  }
    } catch (error) {
      console.error('Error getting user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    
    // Redirect to login
    router.push('/login');
  };

  // Generate avatar URL from user name
  const getAvatarUrl = (name) => {
    // Use DiceBear API to generate avatar from name
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=22c55e`;
  };

  if (isLoading) {
    return (
      <div className="max-w-[480px] h-dvh mx-auto flex items-center justify-center bg-white shadow">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hijau-tua mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[480px] h-dvh mx-auto overflow-y-auto bg-white shadow relative scrollbar-hide">
      {/* Main Content */}
      <div className="flex flex-col items-center py-8">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 mb-4">
          <img 
            src={getAvatarUrl(user?.name || 'User')} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* User Name */}
        <h1 className="text-xl font-bold text-gray-800 mb-1">{user?.name || 'User'}</h1>
        
        {/* User Email */}
        <p className="text-sm text-gray-600 mb-8">{user?.email || 'user@example.com'}</p>

        {/* Menu Options */}
        <div className="w-full max-w-xs bg-hijau-tua rounded-xl p-4 shadow-md">
          {/* Bookmark Option */}
          <Link href="/bookmarks" className="flex items-center justify-between text-white p-3 hover:bg-hjiau-tua rounded-lg transition">
            <div className="flex items-center">
              <Bookmark size={20} className="mr-3" />
              <span>Bookmark</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>

          {/* Add Place Option */}
          {/* <Link href="/contribute" className="flex items-center justify-between text-white p-3 hover:bg-hjiau-tua rounded-lg transition">
            <div className="flex items-center">
              <Plus size={20} className="mr-3" />
              <span>Tambah Tempat Baru</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link> */}

          {/* Account Settings Option */}
          {/* <Link href="/settings" className="flex items-center justify-between text-white p-3 hover:bg-hjiau-tua rounded-lg transition">
            <div className="flex items-center">
              <Settings size={20} className="mr-3" />
              <span>Kelola Akun</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link> */}
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full max-w-xs bg-hijau-tua hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg mt-6 transition"
        >
          Keluar Akun
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
}