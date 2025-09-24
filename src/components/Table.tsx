import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";

type User = {
  id: number;
  player_name: string;
  position: string;
  games: number;
  at_bat: number;
  runs: number;
  hits: number;
  double_2b: number;
  third_baseman: number;
  home_run: number;
  run_batted_in: number;
  a_walk: number;
  strikeouts: number;
  stolen_base: number;
  caught_stealing: number;
  avg: number;
  on_base_percentage: number;
  slugging_percentage: number;
  on_base_plus_slugging: number;
};

const API_URL = process.env.REACT_APP_API_URL;

const Table = () => {
  //data and fetching state
  const [data, setData] = useState<User[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  //table state
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  //if you want to avoid useEffect, look at the React Query example instead
  useEffect(() => {
    const fetchData = async () => {
      if (!data.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }

      // Build query params for sorting and pagination
      let params = new URLSearchParams();
      if (sorting.length > 0) {
        const ordering = sorting
          .map((sort) => (sort.desc ? `-${sort.id}` : sort.id))
          .join(",");
        params.append("ordering", ordering);
      }
      // Pagination params (Django expects 1-based page index)
      params.append("page", (pagination.pageIndex + 1).toString());
      params.append("page_size", pagination.pageSize.toString());

      const url = new URL("/get-player-stats", API_URL);
      url.search = params.toString();

      try {
        const response = await fetch(url.href);
        const json = await response.json();
        setData(json.results);
        setRowCount(json.total);
      } catch (error) {
        setIsError(true);
        console.error(error);
        return;
      }
      setIsError(false);
      setIsLoading(false);
      setIsRefetching(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columnFilters,
    globalFilter,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
  ]);
  const handleOpenModal = async (player: User) => {
    setModalOpen(true);
    setModalLoading(true);
    setModalContent("");
    try {
      const response = await fetch(`${API_URL}/query-openai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Tell me about ${player.player_name}. Stats: ${JSON.stringify(player)}`,
        }),
      });
      const data = await response.json();
      setModalContent(data.response || "No response from OpenAI.");
    } catch (e) {
      setModalContent("Error fetching OpenAI response.");
    }
    setModalLoading(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalContent("");
  };

  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        header: "AI Summary",
        id: "ai-summary",
        Cell: ({ row }) => (
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleOpenModal(row.original)}
          >
            Ask AI
            <FontAwesomeIcon className="ml-2" icon={faComment} />
          </button>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
      { accessorKey: "player_name", header: "Player Name" },
      { accessorKey: "position", header: "Position" },
      { accessorKey: "games", header: "Games" },
      { accessorKey: "at_bat", header: "At-bat" },
      { accessorKey: "runs", header: "Runs" },
      { accessorKey: "hits", header: "Hits" },
      { accessorKey: "double_2b", header: "Double (2B)" },
      { accessorKey: "third_baseman", header: "Third Baseman" },
      { accessorKey: "home_run", header: "Home Run" },
      { accessorKey: "run_batted_in", header: "Run Batted In" },
      { accessorKey: "a_walk", header: "Walks" },
      { accessorKey: "strikeouts", header: "Strikeouts" },
      {
        accessorKey: "stolen_base",
        header: "Stolen Base",
      },
      { accessorKey: "caught_stealing", header: "Caught Stealing" },
      { accessorKey: "avg", header: "AVG" },
      { accessorKey: "on_base_percentage", header: "On-base %" },
      { accessorKey: "slugging_percentage", header: "Slugging %" },
      { accessorKey: "on_base_plus_slugging", header: "OPS" },
    ],
    [],
  );
  const table = useMaterialReactTable({
    columns,
    data,
    enableRowSelection: false,
    getRowId: (row) => row.phoneNumber,
    initialState: { showColumnFilters: true },
    isMultiSortEvent: () => true, //now no need to hold `shift` key to multi-sort
    maxMultiSortColCount: 3,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
  });

  return (
    <>
      <MaterialReactTable table={table} />
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 text-black">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={handleCloseModal}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-2">AI Response</h2>
            {modalLoading ? (
              <div>Loading...</div>
            ) : (
              <div className="whitespace-pre-wrap">{modalContent}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Table;
