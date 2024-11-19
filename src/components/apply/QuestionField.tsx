import React from 'react';
import { ApplicationQuestion } from '../../types/application';
import { Check } from 'lucide-react';

interface Props {
  question: ApplicationQuestion;
  value: any;
  onChange: (value: any) => void;
}

export function QuestionField({ question, value, onChange }: Props) {
  if (question.type === 'radio' && question.options) {
    const options = Array.isArray(question.options) 
      ? question.options 
      : JSON.parse(question.options);

    const handleRadioChange = (selectedOption: string) => {
      // For questions that need additional info
      if (question.order_number === 8) { // Muse question
        onChange({
          answer: selectedOption,
          role: value?.role || ''
        });
      } else if (question.order_number === 9) { // Applying with someone else
        onChange({
          answer: selectedOption,
          partnerName: value?.partnerName || '',
          partnerEmail: value?.partnerEmail || ''
        });
      } else {
        onChange(selectedOption);
      }
    };

    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-stone-900">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="space-y-3">
          {options.map((option: string) => {
            const isSelected = value?.answer === option || value === option;
            return (
              <label 
                key={option} 
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                    : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-500' 
                    : 'border-stone-300'
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                <input
                  type="radio"
                  name={`question-${question.order_number}`}
                  value={option}
                  checked={isSelected}
                  onChange={() => handleRadioChange(option)}
                  className="sr-only"
                  required={question.required}
                />
                <span className={`text-base ${
                  isSelected ? 'text-emerald-900 font-medium' : 'text-stone-700'
                }`}>
                  {option}
                </span>
              </label>
            );
          })}
        </div>

        {/* Additional fields for Muse role */}
        {question.order_number === 8 && value?.answer === "Yes" && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <label className="block text-sm font-medium text-emerald-900 mb-2">
              What skills would you like to contribute? *
            </label>
            <textarea
              value={value.role || ''}
              onChange={(e) => onChange({ ...value, role: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Describe your skills and how you'd like to contribute..."
              required
            />
          </div>
        )}

        {/* Additional fields for partner info */}
        {question.order_number === 9 && value?.answer === "Yes" && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-900 mb-2">
                Partner's Name *
              </label>
              <input
                type="text"
                value={value.partnerName || ''}
                onChange={(e) => onChange({ ...value, partnerName: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter your partner's name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-900 mb-2">
                Partner's Email *
              </label>
              <input
                type="email"
                value={value.partnerEmail || ''}
                onChange={(e) => onChange({ ...value, partnerEmail: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter your partner's email"
                required
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (question.type === 'textarea') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-stone-900">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[100px] p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          required={question.required}
          placeholder="Type your answer here..."
        />
      </div>
    );
  }

  if (question.type === 'file') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-stone-900">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange(file);
          }}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          required={question.required}
          multiple
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-stone-900">
        {question.text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={question.type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        required={question.required}
        placeholder={`Enter your ${question.text.toLowerCase()}`}
      />
    </div>
  );
}