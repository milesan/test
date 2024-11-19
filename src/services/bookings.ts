import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Accommodation = Database['public']['Tables']['accommodations']['Row'];

export async function createBooking(
  accommodationId: string,
  checkIn: Date,
  checkOut: Date,
  totalPrice: number
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    // First, check if dates are available
    const { data: unavailableDates, error: availabilityError } = await supabase
      .from('availability')
      .select('*')
      .eq('accommodation_id', accommodationId)
      .in('status', ['BOOKED', 'HOLD'])
      .gte('date', checkIn.toISOString().split('T')[0])
      .lt('date', checkOut.toISOString().split('T')[0]);

    if (availabilityError) throw availabilityError;
    if (unavailableDates && unavailableDates.length > 0) {
      throw new Error('Selected dates are not available');
    }

    // Create a hold for these dates
    const dates = [];
    const currentDate = new Date(checkIn);
    while (currentDate < checkOut) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Insert hold records
    const { error: holdError } = await supabase
      .from('availability')
      .insert(
        dates.map(date => ({
          accommodation_id: accommodationId,
          date,
          status: 'HOLD'
        }))
      );

    if (holdError) throw holdError;

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        accommodation_id: accommodationId,
        user_id: user.id,
        check_in: checkIn.toISOString(),
        check_out: checkOut.toISOString(),
        total_price: totalPrice,
        status: 'confirmed'
      })
      .select('*')
      .single();

    if (bookingError) throw bookingError;

    // Update holds to booked
    const { error: updateError } = await supabase
      .from('availability')
      .update({ status: 'BOOKED' })
      .eq('accommodation_id', accommodationId)
      .in('date', dates);

    if (updateError) throw updateError;

    return booking;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

export async function getUserBookings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        *,
        accommodations (
          title,
          location,
          image_url,
          price
        )
      `)
      .eq('user_id', user.id)
      .order('check_in', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
}