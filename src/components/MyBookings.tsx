import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getUserBookings } from '../services/bookings';
import { motion } from 'framer-motion';

export function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getUserBookings();
      setBookings(data || []);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center text-stone-600">
          No bookings found. Book your first stay!
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-display font-light text-stone-900 mb-8">My Bookings</h1>
      
      <div className="space-y-6">
        {bookings.map((booking) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-stone-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-display font-light mb-2">
                  {booking.accommodations.title}
                </h3>
                <p className="text-stone-600 mb-4">
                  {booking.accommodations.location}
                </p>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-stone-500">Check-in:</span>{' '}
                    {format(new Date(booking.check_in), 'PPP')}
                  </p>
                  <p>
                    <span className="text-stone-500">Check-out:</span>{' '}
                    {format(new Date(booking.check_out), 'PPP')}
                  </p>
                  <p>
                    <span className="text-stone-500">Total Price:</span>{' '}
                    €{booking.total_price}
                  </p>
                </div>
              </div>
              <img
                src={booking.accommodations.image_url}
                alt={booking.accommodations.title}
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}