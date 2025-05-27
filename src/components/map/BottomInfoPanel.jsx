import React, { useState, useEffect } from "react";
import { Star, Clock, Bookmark } from "lucide-react";
import { IoCloseSharp } from "react-icons/io5";
import { useRouter } from "next/navigation";
import RatingModal from "./RatingModal";

const BottomInfoPanel = ({
  item,
  location,
  currentViewedLocation,
  openMap,
  onClose,
  onCalculateRoute,
}) => {
  const router = useRouter();
  // Tentukan data yang akan digunakan (prioritas: item > location > currentViewedLocation)
  const data = item || location || currentViewedLocation;
  
  // State untuk modal rating
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  
  // State untuk auth dan bookmark
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  
  // Jika tidak ada data, jangan render
  if (!data) return null;

  // Check login status on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    setToken(accessToken);
    setIsLoggedIn(!!accessToken);
    
    // Set initial bookmark status from data
    if (data.isBookmarked !== undefined) {
      setIsBookmarked(data.isBookmarked);
    }
  }, [data.isBookmarked]);

  // Handle rating click
  const handleRatingClick = () => {
    if (!isLoggedIn) {
      // Redirect to login if not logged in
      router.push('/login');
      return;
    }
    setIsRatingModalOpen(true);
  };

  // Handle close rating modal
  const handleCloseRatingModal = () => {
    setIsRatingModalOpen(false);
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    if (!isLoggedIn || !token) {
      router.push('/login');
      return;
    }

    setIsBookmarkLoading(true);
    
    try {
      // Jika sudah di-bookmark (true), lakukan unbookmark (DELETE)
      // Jika belum di-bookmark (false), lakukan bookmark (POST)
      const method = isBookmarked ? 'DELETE' : 'POST';
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_DEKATIN_DEMO}/api/bookmarks`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          location_id: Number(data.id) // Ensure it's a number
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengubah bookmark');
      }

      // Toggle bookmark status locally
      setIsBookmarked(!isBookmarked);
      
      // Show success message
      const message = isBookmarked ? 'Bookmark dihapus' : 'Berhasil menambahkan bookmark';
      console.log(message);
      
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  return (
    <>
      <div className="">
        <div className="w-full fixed bottom-0 z-[9999999] bg-white rounded-t-lg overflow-hidden max-w-[480px]">
          <div className="p-4">
            <div className="flex justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {data.name || 'Nama tidak tersedia'}
                </h2>
                <div className="flex items-center gap-4 mt-1">
                  <section className="flex items-center gap-1">
                    <span className="font-semibold mr-1">
                      {data.rating || data.averageRating || '0.0'}
                    </span>
                    {/* Make star clickable for rating */}
                    <button onClick={handleRatingClick}>
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 hover:scale-110 transition-transform" />
                    </button>
                  </section>
                  <section>
                    <span className="text-sm text-gray-600">
                      {data.category || 'Kategori tidak tersedia'} -{" "}
                      {data.distance || '0'} km
                    </span>
                  </section>
                </div>
              </div>
              <div className="">
                <div className="flex items-center gap-2">
                  {/* Bookmark button - only show if logged in */}
                  {isLoggedIn && (
                    <button 
                      className="aspect-square w-[40px] rounded-md shadow flex items-center justify-center bg-hijau-tua hover:bg-green-700 transition-colors disabled:opacity-50"
                      onClick={handleBookmarkToggle}
                      disabled={isBookmarkLoading}
                      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                    >
                      {isBookmarkLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Bookmark 
                          className={`w-5 h-5 text-white transition-all ${
                            isBookmarked ? 'fill-white stroke-white' : 'fill-transparent stroke-black'
                          }`} 
                        />
                      )}
                    </button>
                  )}
                  
                  {/* Close button */}
                  <button 
                    className="aspect-square w-[40px] rounded-md shadow flex items-center justify-center bg-hijau-tua hover:bg-green-700 transition-colors" 
                    onClick={onClose}
                    aria-label="Close panel"
                  >
                    <IoCloseSharp className="text-2xl text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Hours and Price Range */}
            <div className="flex items-center mt-2 text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {(data.openHour && data.openHour.slice(0, -3)) || data.open_hour || '00:00'} -{" "}
                {(data.closeHour && data.closeHour.slice(0, -3)) || data.close_hour || '23:59'} Rp
                {Math.round((data.startPrice || data.start_price || 0) / 1000)}K -
                {Math.round((data.endPrice || data.end_price || 0) / 1000)}K
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                className="bg-hijau-tua text-white px-4 py-[2px] rounded-full text-sm hover:bg-green-700 transition-colors"
                onClick={() => {
                  if (onCalculateRoute) {
                    onCalculateRoute(data.coords, data);
                  }
                }}
              >
                Lihat Rute
              </button>
            </div>

            {/* Perbaikan mapping gambar */}
            <div className="flex overflow-x-auto scrollbar-hide mt-4 gap-4">
              {data.images && Array.isArray(data.images) && data.images.length > 0 ? (
                data.images.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`${data.name} - ${index + 1}`}
                    className="aspect-video h-[100px] flex-shrink-0 rounded"
                    onError={(e) => {
                      e.target.src = '/assets/content/prolog-kopi.jpg'; // fallback image
                    }}
                  />
                ))
              ) : data.image ? (
                <img
                  src={data.image}
                  alt={data.name}
                  className="aspect-video h-[100px] flex-shrink-0 rounded"
                  onError={(e) => {
                    e.target.src = '/assets/content/prolog-kopi.jpg'; // fallback image
                  }}
                />
              ) : (
                <div className="aspect-video h-[100px] flex-shrink-0 rounded bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No Image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal - only render if logged in */}
      {isLoggedIn && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={handleCloseRatingModal}
          locationId={data.id}
          locationName={data.name}
        />
      )}
    </>
  );
};

export default BottomInfoPanel;