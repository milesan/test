import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ApplicationQuestion } from '../types/application';

export function useQuestions() {
  const [questions, setQuestions] = useState<ApplicationQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: questionsError } = await supabase
          .from('application_questions')
          .select('*')
          .order('order_number');

        if (questionsError) throw questionsError;
        
        if (!data) {
          throw new Error('No questions found');
        }

        setQuestions(data);
      } catch (err) {
        console.error('Error loading questions:', err);
        setError(err instanceof Error ? err : new Error('Failed to load questions'));
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  return { questions, loading, error };
}