import { useEffect, useMemo, useState } from "react";
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faRobot,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import { TypeAnimation } from "react-type-animation";
import loading from "./../loading.svg";
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
  const [editPlayer, setEditPlayer] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);

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

  //if you want to avoid useEffect, look at the React Query example instead
  useEffect(() => {
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

  const handleOpenEditModal = (player: User) => {
    setEditPlayer(player);
    setEditForm({ ...player });
    setEditError("");
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditPlayer(null);
    setEditForm({});
    setEditError("");
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleEditSave = async () => {
    if (!editPlayer) return;
    setEditSaving(true);
    setEditError("");
    try {
      const response = await fetch(`${API_URL}/edit-player/${editPlayer.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.error || "Failed to save changes.";
        setEditError(errorMsg);
        setEditSaving(false);
        toast.error(errorMsg);
        return;
      }
      setEditModalOpen(false);
      setEditPlayer(null);
      setEditForm({});
      setEditError("");
      setEditSaving(false);
      setIsRefetching(true);
      toast.success("Player data saved.");
      // Refetch data
      fetchData();
    } catch (e) {
      setEditError("Error saving changes.");
      setEditSaving(false);
      toast.error("Error saving changes.");
    }
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
      {
        header: "Edit",
        id: "edit-player",
        Cell: ({ row }) => (
          <button
            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => handleOpenEditModal(row.original)}
          >
            Edit
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
    getRowId: (row) => (row.id !== undefined ? row.id.toString() : ""),
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
    renderTopToolbarCustomActions: () => (
      <div
        style={{
          width: "100%",
          float: "right",
          marginTop: "0.5rem",
        }}
      >
        <button
          style={{ fontSize: "1.1rem", color: "#757575", float: "right" }}
          title="Refresh Data"
          className="hover:text-black"
          onClick={async () => {
            try {
              await fetch(`${API_URL}/refresh-data`, { method: "GET" });
              fetchData();
              toast.success("Data refreshed successfully!");
            } catch (error) {
              console.log(error);
              toast.error("Failed to refresh data.");
            }
          }}
        >
          <FontAwesomeIcon icon={faRotate} />
        </button>
      </div>
    ),
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
      <ToastContainer />
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
              <div>
                <TypeAnimation
                  sequence={[
                    "Loading",
                    500,
                    "Loading.", //  Continuing previous Text
                    500,
                    "Loading..",
                    500,
                    "Loading...",
                    500,
                    "Loading..",
                    500,
                    "Loading.",
                    500,
                    "Loading",
                  ]}
                  className="text-sm"
                  repeat={Infinity}
                />
                <img slot="loading" src={loading} alt="Loading..." />
              </div>
            ) : (
              <>
                <p className="speech bubble whitespace-pre-wrap text-sm">
                  <TypeAnimation
                    sequence={[modalContent]}
                    style={{ fontSize: "0.75em" }}
                    speed={99}
                    repeat={0}
                  />
                </p>

                <div>
                  <FontAwesomeIcon className="ml-2 float-left" icon={faRobot} />
                </div>
              </>
            )}
          </div>
        </div>
      )}{" "}
      {editModalOpen && editPlayer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 text-black">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={handleCloseEditModal}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-2">Edit Player</h2>
            <form
              className="grid grid-cols-4 gap-2 overflow-y-auto"
              onSubmit={(e) => {
                e.preventDefault();
                handleEditSave();
              }}
            >
              {[
                "player_name",
                "position",
                "games",
                "at_bat",
                "runs",
                "hits",
                "double_2b",
                "third_baseman",
                "home_run",
                "run_batted_in",
                "a_walk",
                "strikeouts",
                "stolen_base",
                "caught_stealing",
                "avg",
                "on_base_percentage",
                "slugging_percentage",
                "on_base_plus_slugging",
              ].map((key) => (
                <div key={key} className="col-span-2">
                  <label
                    className="block text-xs font-semibold mb-1 capitalize"
                    htmlFor={key}
                  >
                    {key.replace(/_/g, " ")}
                  </label>
                  <input
                    className="w-full border px-2 py-1 rounded text-sm"
                    type={
                      typeof editForm[key as keyof User] === "number"
                        ? "number"
                        : "text"
                    }
                    name={key}
                    id={key}
                    value={editForm[key as keyof User] ?? ""}
                    onChange={handleEditChange}
                  />
                </div>
              ))}
              {editError && (
                <div className="col-span-2 text-red-500">{editError}</div>
              )}
              <button
                type="submit"
                className="col-span-4 mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                disabled={editSaving}
              >
                {editSaving ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Table;
