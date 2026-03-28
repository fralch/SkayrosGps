import { useState, useEffect } from 'react';

const API_BASE_URL = 'https://api.skayros.com';

export const usePlacas = () => {
  const [placas, setPlacas] = useState<string[]>([]);
  const [isLoadingPlacas, setIsLoadingPlacas] = useState(true);

  useEffect(() => {
    fetchPlacas();
  }, []);

  const fetchPlacas = async () => {
    setIsLoadingPlacas(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/gps/track`);
      if (response.ok) {
        const data = await response.json();
        setPlacas(data);
      } else {
        throw new Error('Error al obtener placas');
      }
    } catch (error) {
      console.warn('Usando datos de prueba porque falló la API:', error);
      setPlacas(['ABC-123', 'DEF-456', 'GHI-789', 'XYZ-999']);
    } finally {
      setIsLoadingPlacas(false);
    }
  };

  return { placas, isLoadingPlacas, refetchPlacas: fetchPlacas };
};
