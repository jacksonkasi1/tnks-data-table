"use client";

// ** import components
import { DataTable } from "@/components/data-table/data-table";

// ** import schema
import { Booking } from "./schema";

// ** import columns
import { getColumns, getSubRowColumns } from "./components/columns";

// ** import utils
import { useExportConfig } from "./utils/config";
import { useBookingsData } from "./utils/data-fetching";

// ** import API
import { fetchBookingsByIds } from "@/api/booking/fetch-bookings-by-ids";

export function BookingsDataTable() {
  return (
    <DataTable<Booking, unknown>
      getColumns={getColumns}
      getSubRowColumns={getSubRowColumns}
      fetchDataFn={useBookingsData}
      fetchByIdsFn={fetchBookingsByIds}
      idField="id"
      pageSizeOptions={[10, 20, 30, 50]}
      exportConfig={useExportConfig()}
      subRowsConfig={{
        enabled: true,
        mode: "custom-columns",
        showSubRowHeaders: true,
        hideExpandIconWhenSingle: false,
        autoExpandSingle: false,
        indentSize: 0,
      }}
      config={{
        enableRowSelection: true,
        enableToolbar: true,
        enablePagination: true,
        enableColumnResizing: true,
        columnResizingTableId: "bookings-table",
        defaultSortBy: "booking_date",
      }}
    />
  );
}
