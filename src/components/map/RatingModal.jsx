import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

const RatingModal = ({ isOpen, onClose, locationId, locationName }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch user profile to get user_id
  const fetchUserProfile = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Token tidak ditemukan. Silakan login kembali.');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_DEKATIN_DEMO}/api/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true', // Tambahkan header ini
    },
  });

  if (!response.ok) {
    throw new Error('Gagal mengambil profil pengguna');
  }

  const data = await response.json();
  return data.userId;
};

// Submit rating
const handleSubmitRating = async () => {
  if (selectedRating === 0) {
    setSubmitError('Silakan pilih rating terlebih dahulu');
    return;
  }

  setIsSubmitting(true);
  setSubmitError(null);

  try {
    // Get user_id from profile
    const userId = await fetchUserProfile();

    // Submit rating
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_DEKATIN_DEMO}/api/ratings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Tambahkan header ini
      },
      body: JSON.stringify({
        user_id: userId,
        location_id: locationId,
        rating: selectedRating,
        comment: "" // Empty comment as requested
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal mengirim rating');
    }

    setSubmitSuccess(true);
    
    // Close modal after 1.5 seconds
    setTimeout(() => {
      onClose();
      setSelectedRating(0);
      setSubmitSuccess(false);
    }, 1500);

  } catch (error) {
    console.error('Error submitting rating:', error);
    setSubmitError(error.message);
  } finally {
    setIsSubmitting(false);
  }
};



  // Reset state when modal closes
  const handleClose = () => {
    setSelectedRating(0);
    setSubmitError(null);
    setSubmitSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999999] p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Beri Rating
          </h3>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Location name */}
        <p className="text-sm text-gray-600 mb-4">
          {locationName}
        </p>

        {/* Success message */}
        {submitSuccess && (
          <div className="bg-green-100 border border-green-200 text-green-700 p-3 rounded-md mb-4 text-sm">
            Rating berhasil dikirim! Terima kasih.
          </div>
        )}

        {/* Error message */}
        {submitError && (
          <div className="bg-red-100 border border-red-200 text-red-700 p-3 rounded-md mb-4 text-sm">
            {submitError}
          </div>
        )}

        {/* Rating stars */}
        <div className="flex justify-center items-center mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setSelectedRating(star)}
              disabled={isSubmitting}
              className="p-1 hover:scale-110 transition-transform disabled:hover:scale-100"
            >
              <Star
                size={32}
                className={`${
                  star <= selectedRating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                } transition-colors`}
              />
            </button>
          ))}
        </div>

        {/* Selected rating text */}
        {selectedRating > 0 && (
          <p className="text-center text-sm text-gray-600 mb-4">
            Rating: {selectedRating} dari 5 bintang
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmitRating}
            disabled={isSubmitting || selectedRating === 0}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Rating'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;