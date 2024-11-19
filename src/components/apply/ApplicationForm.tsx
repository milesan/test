import React, { useState, useEffect } from 'react';
import { ApplicationQuestion } from '../../types/application';
import { QuestionField } from './QuestionField';
import { Send } from 'lucide-react';

interface Props {
  questions: ApplicationQuestion[];
  onSubmit: (data: any) => void;
}

export function ApplicationForm({ questions, onSubmit }: Props) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleRandomFill = (event: CustomEvent) => {
      setFormData(event.detail);
    };

    window.addEventListener('fillRandomAnswers', handleRandomFill as EventListener);
    return () => {
      window.removeEventListener('fillRandomAnswers', handleRandomFill as EventListener);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (questionId: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Group questions by section
  const sections = questions.reduce((acc, question) => {
    const section = question.section || 'Other';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(question);
    return acc;
  }, {} as Record<string, ApplicationQuestion[]>);

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {Object.entries(sections).map(([sectionName, sectionQuestions]) => (
        <div key={sectionName} className="space-y-8">
          <h2 className="text-2xl font-display font-light text-stone-900">
            {sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}
          </h2>
          
          <div className="space-y-6">
            {sectionQuestions.map(question => (
              <div 
                key={question.order_number}
                className="bg-white p-6 rounded-lg border border-stone-200 hover:border-emerald-500 transition-colors"
              >
                <QuestionField
                  question={question}
                  value={formData[question.order_number]}
                  onChange={(value) => handleChange(question.order_number, value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border border-stone-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Application
            </>
          )}
        </button>
      </div>
    </form>
  );
}