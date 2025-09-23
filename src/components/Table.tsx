import { useEffect, useMemo, useState } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from 'material-react-table';


type User = {
  "Player name": string;
  position: string;
  Games: number;
  "At-bat": number;
  Runs: number;
  Hits: number;
  "Double (2B)": number;
  "third baseman": number;
  "home run": number;
  "run batted in": number;
  "a walk": number;
  Strikeouts: number;
  "stolen base": number;
  "Caught stealing": number;
  AVG: number;
  "On-base Percentage": number;
  "Slugging Percentage": number;
  "On-base Plus Slugging": number;
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
  const [globalFilter, setGlobalFilter] = useState('');
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

        const url = new URL('https://api.hirefraction.com/api/test/baseball');
        try {
          const response = await fetch(url.href);
          const json = (await response.json()) as User[];
          setData(json);
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
        { accessorKey: 'Player name', header: 'Player Name' },
        { accessorKey: 'position', header: 'Position' },
        { accessorKey: 'Games', header: 'Games' },
        { accessorKey: 'At-bat', header: 'At-bat' },
        { accessorKey: 'Runs', header: 'Runs' },
        { accessorKey: 'Hits', header: 'Hits' },
        { accessorKey: 'Double (2B)', header: 'Double (2B)' },
        { accessorKey: 'third baseman', header: 'Third Baseman' },
        { accessorKey: 'home run', header: 'Home Run' },
        { accessorKey: 'run batted in', header: 'Run Batted In' },
        { accessorKey: 'a walk', header: 'Walks' },
        { accessorKey: 'Strikeouts', header: 'Strikeouts' },
        { accessorKey: 'stolen base', header: 'Stolen Base' },
        { accessorKey: 'Caught stealing', header: 'Caught Stealing' },
        { accessorKey: 'AVG', header: 'AVG' },
        { accessorKey: 'On-base Percentage', header: 'On-base %' },
        { accessorKey: 'Slugging Percentage', header: 'Slugging %' },
        { accessorKey: 'On-base Plus Slugging', header: 'OPS' },
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
          color: 'error',
          children: 'Error loading data',
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

