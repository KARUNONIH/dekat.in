"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Clock, Star, Bookmark, BookmarkX } from 'lucide-react';
import BottomNavbar from "@/components/home/BotomNavbar";

export default function Bookmarks() {
  const router = useRouter();
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unbookmarkingIds, setUnbookmarkingIds] = useState(new Set());

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/login');
      return;
    }

    fetchLocations();
  }, [router]);

  const fetchLocations = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_DEKATIN_DEMO}/api/locations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data = await response.json();
      
      // Filter hanya lokasi yang ter-bookmark (isBookmarked: true)
      const bookmarkedLocations = data.filter(location => location.isBookmarked === true);
      
      // Process data
      const processedData = bookmarkedLocations.map(item => ({
        ...item,
        images: item.images || [], // Convert null to empty array
      }));
      
      setLocations(processedData);
      
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to load bookmarks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeBookmark = async (locationId) => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    router.push('/login');
    return;
  }

  // Add to unbookmarking set untuk loading state
  setUnbookmarkingIds(prev => new Set([...prev, locationId]));

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_DEKATIN_DEMO}/api/bookmarks`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ 
        location_id: Number(locationId) // Convert to number
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove bookmark');
    }

    // Remove from local state immediately
    setLocations(prev => prev.filter(item => item.id !== locationId));
    
    // Optional: Show success message
    console.log('Bookmark removed successfully');
    
  } catch (err) {
    console.error('Error removing bookmark:', err);
    // You can replace this with a toast notification
    alert(`Error: ${err.message}`);
  } finally {
    // Remove from unbookmarking set
    setUnbookmarkingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(locationId);
      return newSet;
    });
  }
};

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Gratis';
    return `Rp ${new Intl.NumberFormat('id-ID').format(price)}`;
  };

  const formatTimeToHHMM = (timeString) => {
    if (!timeString) return 'N/A';
    // Check if timeString is in the format "HH:MM:SS"
    if (timeString && timeString.includes(':')) {
      return timeString.substring(0, 5); // Extract "HH:MM" from "HH:MM:SS"
    }
    return timeString;
  };

  if (isLoading) {
    return (
      <div className="max-w-[480px] h-dvh mx-auto flex items-center justify-center bg-white shadow">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat bookmark...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[480px] h-dvh mx-auto overflow-y-auto bg-white shadow relative scrollbar-hide">
      {/* Header */}
      <div className="sticky top-0 bg-white z-[1] p-4 flex items-center shadow-sm">
        <Link href="/profile" className="text-hijau-tua mr-4">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-center flex-grow mr-10 text-gray-900">
          Bookmark ({locations.length})
        </h1>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="py-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchLocations}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!error && locations.length === 0 && (
          <div className="py-20 text-center">
            <Bookmark size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Tidak ada bookmark</h2>
            <p className="text-gray-600 mb-6">Anda belum menyimpan tempat favorit apapun</p>
            <Link 
              href="/"
              className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
            >
              Eksplor Tempat
            </Link>
          </div>
        )}

        {!error && locations.length > 0 && (
          <div className="space-y-4">
            {locations.map((location) => (
              <div key={location.id} className="bg-white shadow shadow-gray-300 rounded-xl overflow-hidden">
                <div className="relative">
                  {/* Bookmark Button */}
                  <button 
                    onClick={() => removeBookmark(location.id)}
                    disabled={unbookmarkingIds.has(location.id)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-50"
                    aria-label="Remove bookmark"
                  >
                    {unbookmarkingIds.has(location.id) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                    ) : (
                      <BookmarkX size={18} className="text-red-500" />
                    )}
                  </button>
                
                  <div className="flex p-4 ">
                    {/* Image */}
                    <div className="w-20 h-20 bg-white rounded-lg overflow-hidden mr-4 flex-shrink-0">
                      {location.images && location.images.length > 0 ? (
                        <img 
                          src={location.images[0]}
                          alt={location.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/assets/content/prolog-kopi.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                          <span className="text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Location Info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold mb-1 truncate">{location.name}</h2>
                      <p className="text-sm  truncate mb-1">
                        {location.category || 'Kategori tidak tersedia'}
                      </p>
                      <p className="text-xs  truncate mb-2">
                        {location.address || 'Alamat tidak tersedia'}
                      </p>
                      
                      <div className="flex justify-between items-end">
                        {/* Price Range */}
                        <div className="text-xs">
                          <span>
                            {formatPrice(location.startPrice)} - {formatPrice(location.endPrice)}
                          </span>
                        </div>
                        
                        {/* Rating */}
                        {location.averageRating > 0 && (
                          <div className="bg-white rounded-full px-2 py-1 flex items-center">
                            <Star size={12} fill="#fbbf24" className="text-yellow-400 mr-1" />
                            <span className="text-xs font-medium text-gray-800">
                              {location.averageRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                   
                  </div>
                  
                  {/* Operating Hours */}
                  <div className="px-4 pb-3">
                    <div className="flex items-center  text-xs">
                      <Clock size={12} className="mr-1" />
                      <span>
                        {formatTimeToHHMM(location.openHour)} - {formatTimeToHHMM(location.closeHour)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
}