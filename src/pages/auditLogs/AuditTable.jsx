import React from 'react';
import { Table } from 'react-bootstrap';

// Utility function to convert keys to camelCase
const toCamelCase = (str) =>
  str.replace(/([-_][a-z])/gi, (match) => match.toUpperCase().replace('-', '').replace('_', ''));

// Utility function to render cell data
const renderCell = (value) => {
  if (value === undefined || value === null || value === "") return '-';
  if (typeof value === 'object') {
    return (
      <Table bordered size="sm">
        <tbody>
          {Object.entries(value).map(([subKey, subValue]) => (
            <tr key={subKey}>
              <td>{toCamelCase(subKey)}</td>
              <td>{JSON.stringify(subValue, null, 2).replace(/"/g, '')}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }
  return <pre>{JSON.stringify(value, null, 2).replace(/"/g, '')}</pre>;
};

// Render audit table
const AuditTable = ({ newData, oldData }) => {
  const auditKeys = new Set([...Object.keys(newData), ...Object.keys(oldData)]);

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Field</th>
          <th>New Record</th>
          <th>Old Record</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {[...auditKeys].map((key) => {
          const newValue = newData[key];
          const oldValue = oldData[key];
          const isChanged = JSON.stringify(newValue) !== JSON.stringify(oldValue);

          return (
            <tr key={key}>
              <td>{toCamelCase(key)}</td>
              <td>{renderCell(newValue)}</td>
              <td>{renderCell(oldValue)}</td>
              <td style={{ color: isChanged ? 'red' : 'green' }}>
                {isChanged ? 'Modified' : 'Unchanged'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default AuditTable;
