import React from 'react';
import toast from 'react-hot-toast';

export default function CopyField({ value, label }) {
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copied to clipboard');
    } catch (e) {
      toast.error('Failed to copy');
    }
  };
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input value={value} readOnly className="flex-1 border rounded px-3 py-2" />
        <button onClick={onCopy} className="px-3 py-2 bg-indigo-600 text-white rounded">Copy</button>
      </div>
    </div>
  );
}


