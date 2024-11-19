import React, { useState } from 'react';
import { ApplicationQuestion } from '../types/application';
import { QuestionField } from './QuestionField';
import { Brain, User, Home, Sparkles, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  questions: ApplicationQuestion[];
  onSubmit: (data: any) => void;
}

const sectionIcons: Record<string, React.ReactNode> = {
  personal: <User className="w-5 h-5" />,
  philosophy: <Brain className="w-5 h-5" />,
  stay: <Home className="w-5 h-5" />,
  intro: <Sparkles className="w-5 h-5" />
};

export function ApplicationForm({ questions, onSubmit }: Props) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentSection, setCurrentSection] = useState<string>('intro');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sections = Array.from(new Set(questions.map(q => q.section)));

  const handleChange = (order_number: number, value: any) => {
    setFormData(prev => ({ ...prev, [order_number]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'intro': return 'Getting Started';
      case 'personal': return 'Personal Details';
      case 'stay': return 'Your Stay';
      case 'philosophy': return 'Philosophy & Worldview';
      case 'health': return 'Health & Wellbeing';
      default: return section.charAt(0).toUpperCase() + section.slice(1);
    }
  };

  const getSectionProgress = (section: string) => {
    const sectionQuestions = questions.filter(q => q.section === section);
    const answeredQuestions = sectionQuestions.filter(q => formData[q.order_number]);
    return Math.round((answeredQuestions.length / sectionQuestions.length) * 100);
  };

  return (
    <div>
      <div className="flex overflow-x-auto gap-3 mb-8 pb-4">
        {sections.map((section, index) => {
          const progress = getSectionProgress(section);
          return (
            <button
              key={section}
              onClick={() => setCurrentSection(section)}
              className={`group relative flex items-center gap-2 px-5 py-3 rounded-xl whitespace-nowrap transition-all ${
                currentSection === section
                  ? 'bg-emerald-900 text-white shadow-lg scale-105'
                  : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              <span className={`flex items-center gap-2 ${
                currentSection === section ? 'text-white' : 'text-emerald-900'
              }`}>
                {sectionIcons[section]}
                {getSectionTitle(section)}
              </span>
              
              {progress > 0 && (
                <span className={`ml-2 text-sm ${
                  currentSection === section ? 'text-emerald-100' : 'text-emerald-700'
                }`}>
                  {progress}%
                </span>
              )}
              
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-emerald-900/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-900 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <AnimatePresence mode="wait">
          {sections.map((section) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: currentSection === section ? 1 : 0,
                x: currentSection === section ? 0 : 20,
                display: currentSection === section ? 'block' : 'none'
              }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-8">
                {questions
                  .filter(q => q.section === section)
                  .map((question) => (
                    <motion.div 
                      key={`question-${question.order_number}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 hover:border-emerald-900/20 transition-colors"
                    >
                      <QuestionField
                        question={question}
                        value={formData[question.order_number]}
                        onChange={(value) => handleChange(question.order_number, value)}
                      />
                    </motion.div>
                  ))}
              </div>

              <div className="flex justify-between mt-12 pt-6 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = sections.indexOf(currentSection);
                    if (currentIndex > 0) {
                      setCurrentSection(sections[currentIndex - 1]);
                    }
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors ${
                    sections.indexOf(currentSection) === 0 ? 'invisible' : ''
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous Section
                </button>

                {sections.indexOf(currentSection) === sections.length - 1 ? (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-emerald-900 text-white px-8 py-3 rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Application
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = sections.indexOf(currentSection);
                      if (currentIndex < sections.length - 1) {
                        setCurrentSection(sections[currentIndex + 1]);
                      }
                    }}
                    className="flex items-center gap-2 bg-emerald-900 text-white px-6 py-3 rounded-lg hover:bg-emerald-800 transition-colors"
                  >
                    Next Section
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </form>
    </div>
  );
}