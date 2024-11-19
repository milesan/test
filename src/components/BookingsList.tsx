import React from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

interface Booking {
  id: string;
  accommodation_id: string;
  user_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string;
  created_at: string;
  accommodations: {
    title: string;
    location: string;
  };
  profiles: {
    email: string;
  };
}

export function BookingsList() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadBookings();

    // Subscribe to booking changes
    const bookingsSubscription = supabase
      .channel('bookings_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadBookings();
      })
      .subscribe();

    return () => {
      bookingsSubscription.unsubscribe();
    };
  }, []);

  async function loadBookings() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          accommodations (
            title,
            location
          ),
          profiles!bookings_user_id_fkey (
            email
          )
        `)
        .order('check_in', { ascending: true });

      if (error) throw error;
      setBookings(data as Booking[]);
    } catch (e) {
      console.error('Error loading bookings:', e);
      setError(e instanceof Error ? e.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">{error}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Accommodation
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Guest
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check-in
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check-out
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {booking.accommodations?.title || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  {booking.accommodations?.location || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {booking.profiles?.email || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(booking.check_in), 'PP')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(booking.check_out), 'PP')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                €{booking.total_price}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  booking.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : booking.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}