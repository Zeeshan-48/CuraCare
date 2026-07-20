import { useState, useEffect } from 'react';

export const useFormPersist = (storageKey, initialData = {}) => {
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem(storageKey);
    return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
  });

  useEffect(() => {
    return () => {
      sessionStorage.removeItem(storageKey);
    };
  }, [storageKey]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (!name) return;

    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
      sessionStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const clearPersistedData = () => {
    sessionStorage.removeItem(storageKey);
    setFormData(initialData);
  };

  return { formData, handleFormChange, clearPersistedData };
};
