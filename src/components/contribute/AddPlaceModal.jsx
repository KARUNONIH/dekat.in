"use client";

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Component for handling map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect([lat, lng]);
    },
  });
  return null;
}

export default function AddPlaceModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'cafe',
    coords: [-6.2, 106.816], // Default Jakarta coordinates
    image: null,
    alamat_lengkap: 'Jl. Thamrin No.5, Jakarta',
    open_hour: '',
    close_hour: '',
    start_price: 0,
    end_price: 0
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    { value: 'cafe', label: 'cafe' },
    { value: 'restaurant', label: 'restaurant' },
    { value: 'perpustakaan', label: 'perpustakaan' },
    { value: 'outdoor space', label: 'outdoor space' },
  ];

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleLocationSelect = (coords) => {
    setFormData(prev => ({
      ...prev,
      coords: coords
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get access token from localStorage
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        alert('Anda harus login terlebih dahulu');
        return;
      }

      // Prepare form data for multipart/form-data
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('category', formData.category);
      submitData.append('coords', JSON.stringify(formData.coords));
      submitData.append('alamat_lengkap', formData.alamat_lengkap);
      submitData.append('open_hour', formData.open_hour);
      submitData.append('close_hour', formData.close_hour);
      submitData.append('start_price', formData.start_price);
      submitData.append('end_price', formData.end_price);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      // Submit to API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_DEKATIN_DEMO}/api/locations/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: submitData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Location added successfully:', result);
        
        // Reset form
        setFormData({
          name: '',
          category: 'cafe',
          coords: [-6.2, 106.816],
          image: null,
          alamat_lengkap: '',
          open_hour: '',
          close_hour: '',
          start_price: 0,
          end_price: 0
        });
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        onSubmit(result);
        alert('Tempat berhasil ditambahkan!');
      } else {
        const error = await response.json();
        console.error('Error adding location:', error);
        alert(`Error: ${error.message || 'Gagal menambahkan tempat'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Terjadi kesalahan saat menambahkan tempat');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tambah Tempat Baru</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form - Single Column Layout */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Tempat *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Coordinates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lokasi *
            </label>
            <div className="space-y-2">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={formData.coords[0]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  coords: [parseFloat(e.target.value) || 0, prev.coords[1]]
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={formData.coords[1]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  coords: [prev.coords[0], parseFloat(e.target.value) || 0]
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                {showMap ? 'Sembunyikan Map' : 'Pilih di Map'}
              </button>
            </div>
          </div>

          {/* Map */}
          {showMap && (
            <div className="space-y-2">
              <div className="h-64 rounded-lg overflow-hidden border">
                <MapContainer
                  center={formData.coords}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={formData.coords} />
                  <MapClickHandler onLocationSelect={handleLocationSelect} />
                </MapContainer>
              </div>
              <p className="text-xs text-gray-500">
                Klik pada map untuk memilih lokasi
              </p>
            </div>
          )}

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gambar
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {formData.image && (
              <p className="text-sm text-green-600 mt-1">
                File dipilih: {formData.image.name}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Lengkap *
            </label>
            <textarea
              name="alamat_lengkap"
              value={formData.alamat_lengkap }
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Open Hour */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jam Buka *
            </label>
            <input
              type="time"
              name="open_hour"
              value={formData.open_hour}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Close Hour */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jam Tutup *
            </label>
            <input
              type="time"
              name="close_hour"
              value={formData.close_hour}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Start Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Mulai (Rp)
            </label>
            <input
              type="text"
              name="start_price"
              value={formData.start_price}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* End Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Akhir (Rp)
            </label>
            <input
              type="text"
              name="end_price"
              value={formData.end_price}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'Menambahkan...' : 'Tambah Tempat'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}