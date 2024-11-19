import React from 'react';
import { ApplicationForm } from '../components/apply/ApplicationForm';
import { Sprout } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { useQuestions } from '../hooks/useQuestions';

export function ApplyPage() {
  const { questions, loading, error } = useQuestions();

  const handleSubmit = async (data: any) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          application_status: 'pending'
        }
      });

      if (updateError) throw updateError;

      // Then submit the application
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert([{
          user_id: user.id,
          data: data,
          status: 'pending'
        }])
        .select()
        .single();

      if (applicationError) throw applicationError;

      // If this is a linked application
      if (data[9]?.answer === "Yes" && data[9]?.partnerName && data[9]?.partnerEmail) {
        const { error: linkError } = await supabase
          .from('linked_applications')
          .insert([{
            primary_application_id: application.id,
            linked_name: data[9].partnerName,
            linked_email: data[9].partnerEmail
          }]);

        if (linkError) throw linkError;
      }

      // Refresh the session to reflect the changes
      await supabase.auth.refreshSession();

    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-green-500 font-mono">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-black border border-green-500 p-8 rounded-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-mono text-green-500 mb-2">Failed to Load Questions</h2>
          <p className="text-green-500 mb-6">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 text-black px-6 py-2 rounded-lg hover:bg-green-400 transition-colors font-mono"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sprout className="w-10 h-10 text-green-500" />
            <h1 className="text-3xl font-mono text-green-500">Apply to The Garden</h1>
          </div>
          <p className="text-green-500 font-mono">Please answer the following questions thoughtfully.</p>
        </motion.div>

        <ApplicationForm questions={questions} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}