"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import BottomNavbar from "@/components/home/BotomNavbar";

// Import AddPlaceModal dengan dynamic import untuk menghindari SSR error
const AddPlaceModal = dynamic(() => import("@/components/contribute/AddPlaceModal"), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Contribute() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // State untuk user locations
  const [userLocations, setUserLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    setMounted(true);
    // Check for authentication token on component mount
    const accessToken = localStorage.getItem("accessToken");
    setToken(accessToken);
    setIsLoggedIn(!!accessToken);
    
    if (!accessToken) {
      router.push('/login');
    }
  }, [router]);

  // Fetch user's locations
  const fetchUserLocations = async () => {
    if (!token) return;
    
    setIsLoadingLocations(true);
    setFetchError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_DEKATIN_DEMO}/api/locations/my`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data lokasi');
      }

      const data = await response.json();
      setUserLocations(data || []);
    } catch (error) {
      console.error('Error fetching user locations:', error);
      setFetchError(error.message);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // Fetch user locations when component mounts and token is available
  useEffect(() => {
    if (token && isLoggedIn && mounted) {
      fetchUserLocations();
    }
  }, [token, isLoggedIn, mounted]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    // Reset any previous submission states
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitPlace = async (formData) => {
    if (!token) {
      setSubmitError("Token autentikasi tidak ditemukan. Silakan login kembali.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Format the data according to the API requirements
      const payload = {
        name: formData.name,
        category: formData.category,
        coords: formData.coords, // Ensure this is an array [lat, lng]
        image: formData.image || null,
        alamat_lengkap: formData.address,
        open_hour: formData.openHour,
        close_hour: formData.closeHour,
        start_price: parseFloat(formData.startPrice) || 0,
        end_price: parseFloat(formData.endPrice) || 0
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_DEKATIN_DEMO}/api/locations/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menambahkan tempat baru');
      }
      
      const responseData = await response.json();
      console.log('API response:', responseData);
      
      // Success handling
      setSubmitSuccess(true);
      setIsModalOpen(false);
      
      // Refresh user locations after successful submission
      fetchUserLocations();
      
      // Show success message
      alert('Tempat berhasil ditambahkan! Terima kasih atas kontribusi Anda.');
      
    } catch (error) {
      console.error('Error submitting place:', error);
      setSubmitError(error.message || 'Terjadi kesalahan saat menambahkan tempat');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="max-w-[480px] h-dvh mx-auto overflow-y-auto bg-white shadow relative scrollbar-hide">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hijau-tua"></div>
        </div>
      </div>
    );
  }

  // If user is not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <div className="max-w-[480px] h-dvh mx-auto overflow-y-auto bg-white shadow relative scrollbar-hide">
        <div className="sticky top-0 bg-white z-10 p-4 flex items-center border-b shadow-sm">
          <Link href="/" className="text-hijau-tua mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-center flex-grow mr-6 text-hijau-tua">Kontribusi</h1>
        </div>
        
        <div className="flex flex-col items-center justify-center h-[70vh] px-4">
          <div className="text-center space-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
            
            <h2 className="text-xl font-semibold text-gray-800">Login Diperlukan</h2>
            <p className="text-gray-600 mb-4">
              Silakan login untuk mulai berkontribusi dengan menambahkan tempat baru.
            </p>
            
            <Link 
              href="/login" 
              className="inline-block bg-hijau-tua text-white py-3 px-6 rounded-lg font-medium hover:bg-hijau-tua transition"
            >
              Login Sekarang
            </Link>
          </div>
        </div>
        
        <BottomNavbar />
      </div>
    );
  }

  return (
    <div className="max-w-[480px] h-dvh mx-auto overflow-y-auto bg-white shadow relative scrollbar-hide">
      {/* Header with back button */}
      <div className="sticky top-0 bg-white z-10 p-4 flex items-center border-b shadow-sm">
        <Link href="/" className="text-hijau-tua mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-center flex-grow mr-6 text-hijau-tua">Kontribusi</h1>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Add New Place Button */}
        <div className="mb-6">
          <button 
            className="w-full py-3 px-4 rounded-lg bg-hijau-tua text-white font-medium hover:bg-hijau-tua focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md"
            onClick={handleOpenModal}
          >
            Tambah Tempat Baru
          </button>
        </div>

        {/* Success message */}
        {submitSuccess && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md">
            Tempat berhasil ditambahkan! Terima kasih atas kontribusi Anda.
          </div>
        )}

        {/* Error message */}
        {fetchError && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md">
            {fetchError}
          </div>
        )}

        {/* Loading state */}
        {isLoadingLocations && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hijau-tua"></div>
            <span className="ml-2 text-gray-600">Memuat lokasi...</span>
          </div>
        )}

        {/* User Locations */}
        {!isLoadingLocations && (
          <>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Lokasi yang Anda Tambahkan ({userLocations.length})
            </h2>

            {userLocations.length === 0 ? (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Anda belum menambahkan lokasi
                </h3>
                <p className="text-gray-600 text-sm">
                  Mulai berkontribusi dengan menambahkan tempat-tempat menarik di sekitar Anda.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userLocations.map((location) => (
                  <div key={location.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      {/* Location Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={location.images && location.images.length > 0 ? location.images[0] : '/assets/content/prolog-kopi.jpg'}
                          alt={location.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/assets/content/prolog-kopi.jpg';
                          }}
                        />
                      </div>

                      {/* Location Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {location.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {location.category}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {location.address}
                        </p>
                        
                        {/* Rating and Price */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs text-gray-600 ml-1">
                              {location.averageRating || '0.0'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Rp{Math.round((location.startPrice || 0) / 1000)}K - {Math.round((location.endPrice || 0) / 1000)}K
                          </div>
                        </div>

                        {/* Operating Hours */}
                        <div className="text-xs text-gray-500 mt-1">
                          {location.openHour?.slice(0, -3)} - {location.closeHour?.slice(0, -3)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Place Modal - Rendered only when modal should be open and component is mounted */}
      {mounted && isModalOpen && (
        <AddPlaceModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitPlace}
          isSubmitting={isSubmitting}
          error={submitError}
        />
      )}

      {/* Bottom Navigation Bar */}
      <BottomNavbar />
    </div>
  );
}