import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ApplicationDetails } from './ApplicationDetails';
import { motion, AnimatePresence } from 'framer-motion';

export function Applications2() {
  // ... (previous code remains the same until updateApplicationStatus)

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      // First update the application status
      const { error: applicationError } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);

      if (applicationError) throw applicationError;

      // If approved, call the approve_application function
      if (status === 'approved') {
        const { error: approvalError } = await supabase
          .rpc('approve_application', {
            p_application_id: id
          });

        if (approvalError) throw approvalError;
      }

      await loadApplications();
    } catch (err) {
      console.error('Error updating application:', err);
      setError(err instanceof Error ? err.message : 'Failed to update application');
    }
  };

  // ... (rest of the component remains the same)
}