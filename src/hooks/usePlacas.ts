import { useState, useEffect } from 'react';

const PLACAS_MOCK = ['ABC-123', 'DEF-456', 'GHI-789', 'XYZ-999'];

export const usePlacas = () => {
  const [placas, setPlacas] = useState<string[]>([]);
  const [isLoadingPlacas, setIsLoadingPlacas] = useState(true);

  useEffect(() => {
    fetchPlacas();
  }, []);

  const fetchPlacas = async () => {
    setIsLoadingPlacas(true);
    try {
      setPlacas(PLACAS_MOCK);
    } catch (error) {
      console.warn('Error cargando placas mock:', error);
      setPlacas(PLACAS_MOCK);
    } finally {
      setIsLoadingPlacas(false);
    }
  };

  return { placas, isLoadingPlacas, refetchPlacas: fetchPlacas };
};
