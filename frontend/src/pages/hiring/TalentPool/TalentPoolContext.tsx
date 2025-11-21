import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import talentPoolService from "../../../services/hiring/talentPoolService";
import type { Candidate } from "../../../types/hiring/candidate";

interface Filters {
  yearsOfExperience: [number, number];
  location: string[];
  jobTitle: string[];
  type: "" | "active" | "disqualified" | null;
  stages: string[];
  clients: string[];
  levels: string[];
}

interface FiltersMeta {
  yearsOfExperience: string[];
  location: string[];
  jobTitle: string[];

  stages: string[];
  clients: string[];
}

interface TalentPoolState {
  searchText: string;
  tags: string[];
  filters: Filters;
  candidateList: Candidate[];
  selectedCandidates: string[]; // Array of candidate IDs
  filtersMeta: FiltersMeta | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  showAssignDialog: boolean;
  page: number;
  pageSize: number;
  totalCandidates: number;
  totalPages: number;
}

interface TalentPoolContextType {
  state: TalentPoolState;
  setCurrentPage: (page: number) => void;
  setShowAssignDialog: (show: boolean) => void;
  setSearchText: (text: string) => void;
  setTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setFilters: (filters: Filters) => void;
  updateFilter: (key: keyof Filters, value: any) => void;
  setCandidateList: (candidates: Candidate[]) => void;
  setFiltersMeta: (meta: FiltersMeta) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectCandidate: (id: string) => void;
  deselectCandidate: (id: string) => void;
  selectAllCandidates: (ids: string[]) => void;
  clearSelectedCandidates: () => void;
  toggleCandidateSelection: (id: string) => void;
  isSelected: (id: string) => boolean;
  getSelectedCount: () => number;
  clearAll: () => void;
  performSearch: (searchText?: string) => Promise<void>;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToPage: (page: number) => void;
}

const initialFilters: Filters = {
  yearsOfExperience: [0, 15],
  location: [],
  jobTitle: [],
  type: null,
  stages: [],
  clients: [],
  levels: [],
};

const initialState: TalentPoolState = {
  searchText: "",
  tags: [],
  filters: initialFilters,
  candidateList: [],
  selectedCandidates: [],
  filtersMeta: null,
  loading: false,
  error: null,
  currentPage: 1,
  showAssignDialog: false,
  page: 1,
  pageSize: 30,
  totalCandidates: 0,
  totalPages: 0,
};

const TalentPoolContext = createContext<TalentPoolContextType | undefined>(
  undefined,
);

export const TalentPoolProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<TalentPoolState>(() => {
    // Try to restore from sessionStorage
    const saved = sessionStorage.getItem("talentPoolState");
    return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
  });

  // Persist state to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem("talentPoolState", JSON.stringify(state));
  }, [state]);

  const setCurrentPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const setShowAssignDialog = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showAssignDialog: show }));
  }, []);

  const setSearchText = useCallback((text: string) => {
    setState((prev) => ({ ...prev, searchText: text }));
  }, []);

  const setTags = useCallback((tags: string[]) => {
    setState((prev) => {
      if (prev.candidateList.length === 0) {
        // If candidate list is empty, do not update tags
        return prev;
      }
      return { ...prev, tags };
    });
  }, []);

  const addTag = useCallback((tag: string) => {
    setState((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags : [...prev.tags, tag],
    }));
  }, []);

  const removeTag = useCallback((tag: string) => {
    setState((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }, []);

  const setFilters = useCallback((filters: Filters) => {
    setState((prev) => ({ ...prev, filters }));
  }, []);

  const updateFilter = useCallback((key: keyof Filters, value: any) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
    }));
  }, []);

  const setCandidateList = useCallback((candidateList: Candidate[]) => {
    setState((prev) => ({ ...prev, candidateList }));
  }, []);

  const setFiltersMeta = useCallback((filtersMeta: FiltersMeta) => {
    setState((prev) => ({ ...prev, filtersMeta }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  // Candidate selection functions
  const selectCandidate = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedCandidates: [...prev.selectedCandidates, id],
    }));
  }, []);

  const deselectCandidate = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedCandidates: prev.selectedCandidates.filter(
        (candidateId) => candidateId !== id,
      ),
    }));
  }, []);

  const selectAllCandidates = useCallback((ids: string[]) => {
    setState((prev) => ({ ...prev, selectedCandidates: ids }));
  }, []);

  const clearSelectedCandidates = useCallback(() => {
    setState((prev) => ({ ...prev, selectedCandidates: [] }));
  }, []);

  const toggleCandidateSelection = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedCandidates: prev.selectedCandidates.includes(id)
        ? prev.selectedCandidates.filter((candidateId) => candidateId !== id)
        : [...prev.selectedCandidates, id],
    }));
  }, []);

  const isSelected = useCallback(
    (id: string) => {
      return state.selectedCandidates.includes(id);
    },
    [state.selectedCandidates],
  );

  const getSelectedCount = useCallback(() => {
    return state.selectedCandidates.length;
  }, [state.selectedCandidates]);

  const runSearch = useCallback(
    async (
      searchText?: string,
      filters?: Filters,
      tags?: string[],
      page?: number,
    ): Promise<void> => {
      setState((prevState) => {
        return { ...prevState, loading: true, error: null };
      });

      try {
        // Get current state values at the time of API call
        const currentState = await new Promise<TalentPoolState>((resolve) => {
          setState((prev) => {
            resolve(prev);
            return prev;
          });
        });

        const response = await talentPoolService.aiSearch({
          searchText: searchText ?? currentState.searchText,
          tags: tags ?? currentState.tags,
          filters: {
            yearsOfExperience: ``,
            location: currentState.filters.location,
            jobTitle: currentState.filters.jobTitle,
            type:
              currentState.filters.type === null ||
              currentState.filters.type === ""
                ? "all"
                : (currentState.filters.type.toLocaleLowerCase() as
                    | "active"
                    | "disqualified"),
            stages: currentState.filters.stages,
            clients: currentState.filters.clients,
            excludeJobIds: [],
          },
          pagination: {
            page: page ?? currentState.page,
            pageSize: currentState.pageSize,
          },
        });

        // Only update lastFiltersRef and searchText if candidates are returned
        if (response?.candidates && response.candidates.length > 0) {
          lastFiltersRef.current = filters ?? currentState.filters;
          setState((prev) => ({
            ...prev,
            tags: response?.extractedTags,
            filtersMeta: response?.filtersMeta || {},
            candidateList: response.candidates || [],
            page: page ?? response.pagination.currentPage ?? prev.page,
            totalCandidates: response.pagination.totalCount ?? 0,
            totalPages: response.pagination.totalPages ?? 0,
            loading: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            tags: response?.extractedTags,
            filtersMeta: response?.filtersMeta || {},
            candidateList: [],
            page: page ?? response?.pagination.currentPage ?? prev.page,
            totalCandidates: response?.pagination.totalCount ?? 0,
            totalPages: response?.pagination.totalPages ?? 0,
            loading: false,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: typeof error === "string" ? error : "Search failed",
        }));
        console.error("Search failed:", error);
      }
    },
    [],
  );

  const goToNextPage = useCallback(() => {
    if (state.page < state.totalPages) {
      const nextPage = state.page + 1;
      runSearch(undefined, undefined, undefined, nextPage);
    }
  }, [state.page, state.totalPages, runSearch]);

  const goToPrevPage = useCallback(() => {
    if (state.page > 1) {
      const prevPage = state.page - 1;
      runSearch(undefined, undefined, undefined, prevPage);
    }
  }, [state.page, runSearch]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= state.totalPages && page !== state.page) {
        runSearch(undefined, undefined, undefined, page);
      }
    },
    [state.page, state.totalPages, runSearch],
  );

  const clearAll = useCallback(() => {
    setState(initialState);
    runSearch("", initialFilters, [], 1);
  }, [runSearch]);

  const performSearch = useCallback(
    async (searchText?: string) => {
      await runSearch(searchText, undefined, undefined, 1);
    },
    [runSearch],
  );

  // Auto-trigger search when filters change (but not on initial load or tag changes)
  const lastFiltersRef = React.useRef<Filters>(state.filters);
  useEffect(() => {
    // Only trigger search if filters have changed from last filters
    const hasFiltersChanged =
      JSON.stringify(state.filters) !== JSON.stringify(lastFiltersRef.current);
    if (hasFiltersChanged) {
      runSearch(undefined, undefined, undefined, 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filters]); // Only depend on filters; runSearch has empty deps so it's stable

  return (
    <TalentPoolContext.Provider
      value={{
        state,
        setSearchText,
        setTags,
        addTag,
        removeTag,
        setFilters,
        updateFilter,
        setCandidateList,
        setFiltersMeta,
        setLoading,
        setError,
        selectCandidate,
        deselectCandidate,
        selectAllCandidates,
        clearSelectedCandidates,
        toggleCandidateSelection,
        isSelected,
        getSelectedCount,
        clearAll,
        performSearch,
        setCurrentPage,
        setShowAssignDialog,
        goToNextPage,
        goToPrevPage,
        goToPage,
      }}
    >
      {children}
    </TalentPoolContext.Provider>
  );
};

export const useTalentPool = () => {
  const context = useContext(TalentPoolContext);
  if (context === undefined) {
    throw new Error("useTalentPool must be used within a TalentPoolProvider");
  }
  return context;
};

export type { Candidate, Filters, FiltersMeta };
