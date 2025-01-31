import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const PermissionsTable = ({ modules, values, handleCheckboxChange, setFieldValue }) => {
  const { t } = useTranslation()
  return (
    <table className="table table-bordered table-white">
      <thead>
        <tr>
          <th  scope="col" className="w-20">{t('MODULE_NAME')}</th>
          <th  scope="col">{t('PERMISSIONS')}</th>
        </tr>
      </thead>
      <tbody>
        {modules.map((module) => {
          if (module?.permissions?.length > 0) {
            return <tr key={module.name}>
              <td className="fw-semibold">{module.name}</td>
              <td>
                <Row>
                  {module.permissions.map((permission) => (
                    <Col md={3}  key={permission.id} className="my-2" >
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
                      /> </Col>
                  ))}
                </Row>

              </td>
            </tr>
          } else {
            return ''
          }

        })}
      </tbody>
    </table>
  );
};

export default PermissionsTable;
