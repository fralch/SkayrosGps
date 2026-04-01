import { useRef, useState, useCallback } from 'react';

interface CamionPlacaItem {
  id: number;
  placa: string;
}

interface CamionesPlacasApiResponse {
  data?: CamionPlacaItem[];
  pagination?: {
    current_page?: number;
    has_more_pages?: boolean;
  };
}

const BASE_URL = 'https://sketch3dlab.com';
const PER_PAGE = 10;
const MAX_PAGES_TO_SCAN = 60;

const fetchPage = async (query: string, page: number) => {
  const url = `${BASE_URL}/api/camiones/placas/paginado?per_page=${PER_PAGE}&q=${encodeURIComponent(query)}&page=${page}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const json = (await response.json()) as CamionesPlacasApiResponse;
  return {
    data: json.data ?? [],
    page: json.pagination?.current_page ?? page,
    hasMorePages: Boolean(json.pagination?.has_more_pages),
  };
};

const filterMatches = (items: CamionPlacaItem[], query: string) => {
  const normalizedQuery = query.trim().toUpperCase();
  if (!normalizedQuery) {
    return items;
  }
  return items.filter((item) => item.placa.toUpperCase().includes(normalizedQuery));
};

export const usePlacas = () => {
  const [suggestions, setSuggestions] = useState<CamionPlacaItem[]>([]);
  const [isLoadingPlacas, setIsLoadingPlacas] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const activeQueryRef = useRef('');
  const requestIdRef = useRef(0);

  const searchPlacas = useCallback(async (query: string) => {
    const normalizedQuery = query.trim();
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    activeQueryRef.current = normalizedQuery;

    if (!normalizedQuery) {
      setSuggestions([]);
      setHasMore(false);
      setErrorMessage(null);
      setCurrentPage(1);
      return;
    }

    setIsLoadingPlacas(true);
    setErrorMessage(null);

    try {
      let targetPage = 1;
      let scannedPages = 0;
      let hasMorePages = true;
      let incoming: CamionPlacaItem[] = [];
      let resolvedPage = 1;

      while (hasMorePages && incoming.length === 0 && scannedPages < MAX_PAGES_TO_SCAN) {
        const pageResponse = await fetchPage(normalizedQuery, targetPage);
        incoming = filterMatches(pageResponse.data, normalizedQuery);
        hasMorePages = pageResponse.hasMorePages;
        resolvedPage = pageResponse.page;
        scannedPages += 1;
        if (incoming.length === 0 && hasMorePages) {
          targetPage = resolvedPage + 1;
        }
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      setSuggestions(incoming);
      setCurrentPage(resolvedPage);
      setHasMore(hasMorePages);
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setSuggestions([]);
      setHasMore(false);
      setErrorMessage('No se pudieron cargar las placas');
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoadingPlacas(false);
      }
    }
  }, []);

  const loadMore = useCallback(async () => {
    const normalizedQuery = activeQueryRef.current.trim();
    if (!normalizedQuery || !hasMore || isLoadingMore || isLoadingPlacas) {
      return;
    }

    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    setIsLoadingMore(true);
    setErrorMessage(null);

    try {
      let targetPage = currentPage + 1;
      let scannedPages = 0;
      let hasMorePages: boolean = hasMore;
      let incoming: CamionPlacaItem[] = [];
      let resolvedPage = currentPage;

      while (hasMorePages && incoming.length === 0 && scannedPages < MAX_PAGES_TO_SCAN) {
        const pageResponse = await fetchPage(normalizedQuery, targetPage);
        incoming = filterMatches(pageResponse.data, normalizedQuery);
        hasMorePages = pageResponse.hasMorePages;
        resolvedPage = pageResponse.page;
        scannedPages += 1;
        if (incoming.length === 0 && hasMorePages) {
          targetPage = resolvedPage + 1;
        }
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (incoming.length > 0) {
        setSuggestions((prev) => [...prev, ...incoming]);
      }
      setCurrentPage(resolvedPage);
      setHasMore(hasMorePages);
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setHasMore(false);
      setErrorMessage('No se pudieron cargar más resultados');
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [currentPage, hasMore, isLoadingMore, isLoadingPlacas]);

  return {
    suggestions,
    isLoadingPlacas,
    isLoadingMore,
    hasMore,
    errorMessage,
    searchPlacas,
    loadMore,
  };
};
