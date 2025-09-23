import { useEffect, useMemo, useState } from "react";
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

const Table = () => {
  //data and fetching state
  const [data, setData] = useState<User[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);

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

      // const url = new URL('https://api.hirefraction.com/api/test/baseball');
      const API_URL = process.env.REACT_APP_API_URL;
      const url = new URL("/get-player-stats", API_URL);
      try {
        const response = await fetch(url.href);
        const json = (await response.json()) as User[];
        setData(json);
        console.log(json);
        setRowCount(json.length);
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
    columnFilters, //re-fetch when column filters change
    globalFilter, //re-fetch when global filter changes
    pagination.pageIndex, //re-fetch when page index changes
    pagination.pageSize, //re-fetch when page size changes
    sorting, //re-fetch when sorting changes
  ]);

  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
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
      { accessorKey: "stolen_base", header: "Stolen Base" },
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
    enableRowSelection: true,
    getRowId: (row) => row.phoneNumber,
    initialState: { showColumnFilters: true },
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

  return <MaterialReactTable table={table} />;
};

export default Table;
