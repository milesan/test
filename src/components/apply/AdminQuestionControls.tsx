import React, { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Props {
  questionId: string;
}

export function AdminQuestionControls({ questionId }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState('');

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('application_questions')
        .delete()
        .eq('order_number', questionId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  const handleEdit = async () => {
    if (!isEditing) {
      try {
        const { data, error } = await supabase
          .from('application_questions')
          .select('text')
          .eq('order_number', questionId)
          .single();

        if (error) throw error;
        setText(data.text);
        setIsEditing(true);
      } catch (err) {
        console.error('Error fetching question:', err);
      }
    } else {
      try {
        const { error } = await supabase
          .from('application_questions')
          .update({ text })
          .eq('order_number', questionId);

        if (error) throw error;
        setIsEditing(false);
      } catch (err) {
        console.error('Error updating question:', err);
      }
    }
  };

  return (
    <div className="absolute -right-12 top-0 flex flex-col gap-2">
      {isEditing ? (
        <>
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 text-stone-500 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleEdit}
            className="p-2 text-emerald-600 hover:text-emerald-800"
          >
            <Check className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={handleEdit}
            className="p-2 text-stone-500 hover:text-stone-700"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-rose-500 hover:text-rose-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}