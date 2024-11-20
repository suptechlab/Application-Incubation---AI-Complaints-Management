import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';

export default function CommonDataTable({
  value,  // Data to display in the table
  columns,  // Column configuration with field and header
  pagination = true,  // Enable pagination by default
  rows = 10,  // Default rows per page
  onPageChange,  // Optional callback when page changes
  filterable = false,  // Show search bar for filtering (optional)
  sortable = false,  // Enable sorting on columns (optional)
  searchQuery = '',  // Search query state (optional)
  onSearchChange,  // Callback to handle search query changes (optional)
  emptyMessage = 'No data available',  // Custom message when no data found
  globalFilter = false,  // Enable global search filter (optional)
}) {

  // Handle the search input change
  const handleSearch = (e) => {
    if (onSearchChange) onSearchChange(e.target.value);
  };

  return (
    <div className="">
      {/* Conditional Search Input */}
      {filterable && (
        <div className="p-clearfix" style={{ marginBottom: '20px' }}>
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search..."
            />
          </span>
        </div>
      )}

      <DataTable
      stripedRows
        value={value}
        paginator={pagination}
        rows={rows}
        onPage={onPageChange}
        emptyMessage={emptyMessage}
        tableStyle={{ minWidth: '50rem' }}
        globalFilter={globalFilter ? searchQuery : null}  // Global search if enabled
      >
        {/* Dynamically render columns */}
        {columns && columns.map((col, index) => (
          <Column
            key={index}
            field={col.field}
            header={col.header}
            sortable={sortable}
            filter={filterable}
          />
        ))}
      </DataTable>
    </div>
  );
}
