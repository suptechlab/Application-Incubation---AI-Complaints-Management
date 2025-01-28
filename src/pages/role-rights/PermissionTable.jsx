import React from "react";
import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const PermissionsTable = ({ modules, values, handleCheckboxChange, setFieldValue }) => {
  const {t} = useTranslation()
  return (
    <table className="table table-bordered table-white">
      <thead>
        <tr>
          <th>{t('MODULE_NAME')}</th>
          <th>{t('PERMISSIONS')}</th>
        </tr>
      </thead>
      <tbody>
        {modules.map((module) => (
          <tr key={module.name}>
            <td className="fw-semibold">{module.name}</td>
            <td>
              {module.permissions.map((permission) => (
                <Form.Check
                  key={permission.id}
                  className="d-inline-block me-3 align-top"
                  inline
                  type="checkbox"
                  label={permission.description}
                  id={`checkbox-${module.name}-${permission.id}`}
                  checked={
                    values.rights[module.name]?.[permission.name]?.checked || false
                  }
                  onChange={(e) =>
                    handleCheckboxChange(
                      e,
                      module.name,
                      permission.name,
                      permission.id,
                      values,
                      setFieldValue
                    )
                  }
                />
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PermissionsTable;
