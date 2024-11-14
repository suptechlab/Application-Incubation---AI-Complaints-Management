import React from "react";
import { Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";

// Utility function to convert keys to camelCase
const toCamelCase = (str) =>
  str.replace(/([-_][a-z])/gi, (match) =>
    match.toUpperCase().replace("-", "").replace("_", "")
  );

const toCapitalized = (str) =>
  str
    .replace(/([A-Z])/g, " $1") // Add space before each uppercase letter
    .replace(/^./, (match) => match.toUpperCase()); // Capitalize the first letter of the resulting string

// Utility function to render cell data
const renderCell = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "object") {
    return (
      <Table bordered size="sm">
        <tbody>
          {Object.entries(value).map(([subKey, subValue]) => (
            <tr key={subKey}>
              <td>{toCamelCase(subKey)}</td>
              <td>{JSON.stringify(subValue, null, 2).replace(/"/g, "")}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }
  return <pre className="mb-0">{JSON.stringify(value, null, 2).replace(/"/g, "")}</pre>;
};

// Render audit table
const AuditTable = ({ newData, oldData, activityType }) => {
  const auditKeys = new Set([...Object.keys(newData), ...Object.keys(oldData)]);

  const { t } = useTranslation()

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>{t("FIELD")}</th>
          <th>{t("NEW RECORD")}</th>
          {
            activityType !== "DATA_ENTRY" ? <th>{t("OLD RECORD")}</th> : ""
          }
          {activityType !== "DATA_ENTRY" ? <th>{t("STATUS")}</th> : ""}
        </tr>
      </thead>
      <tbody>
        {[...auditKeys].map((key) => {
          const newValue = newData[key];
          const oldValue = oldData[key];
          const isChanged = JSON.stringify(newValue) !== JSON.stringify(oldValue);

          return (
            <tr key={key}>
              <td>{toCapitalized(key)}</td>
              <td>{renderCell(newValue)}</td>
              {
                activityType !== "DATA_ENTRY" ? <td>{renderCell(oldValue)}</td> : ""
              }
              {
                activityType !== "DATA_ENTRY" ? <td style={{ color: isChanged ? 'red' : 'green' }}>
                  {isChanged ? t('MODIFIED') : t('UNCHANGED')}
                </td> : ""
              }
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default AuditTable;
