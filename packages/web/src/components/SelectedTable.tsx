/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, useCallback, useState } from "react";
import { Search } from "lucide-react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Table, { type TableColumn } from "./Table";

// Enhanced SelectableTable component
interface SelectableTableProps {
  columns: TableColumn[];
  data: any[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
}

const SelectableTable: React.FC<SelectableTableProps> = ({
  columns,
  data,
  selected,
  onSelectionChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter(
    (item) =>
      item.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRow = useCallback(
    (id: string) => {
      const newSelected = selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id];
      onSelectionChange(newSelected);
    },
    [onSelectionChange, selected]
  );

  const selectAll = () => {
    const allIds = filteredData.map((item) => item.id);
    onSelectionChange(allIds);
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const selectableColumns: TableColumn[] = [
    {
      key: "_select",
      header: " ",
      width: "100px",
      align: "center",
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selected.includes(row.id)}
          onChange={() => toggleRow(row.id)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />
      ),
    },
    ...columns,
  ];

  const onRowClickCallback = useCallback(
    (row: any) => {
      toggleRow(row.id);
    },
    [toggleRow]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
        <div className="flex space-x-2">
          <Button type="button" variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table
          columns={selectableColumns}
          data={filteredData}
          onRowClick={onRowClickCallback}
        />
      </div>

      <div className="text-sm text-gray-600">
        {selected.length} of {data.length} employees selected
      </div>
    </div>
  );
};

export default memo(SelectableTable);
