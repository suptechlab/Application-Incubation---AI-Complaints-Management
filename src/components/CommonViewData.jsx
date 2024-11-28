import React from "react";
import Form from "react-bootstrap/Form";

/**
 * View Text Reusable Component
 *
 * @param {{ label: any; value: any; wrapperClassname?: string; valueClassName: any; }} param0
 * @param {*} param0.label
 * @param {*} param0.value
 * @param {string} [param0.wrapperClassname='mb-3']
 * @param {*} param0.valueClassName
 * @returns {*}
 */

const CommonViewData = ({ label, value, wrapperClassname='mb-3 pb-1', valueClassName }) => {
  return (
    <Form.Group className={wrapperClassname}>
      {label && (
        <div className="fw-bold mb-1">{label}</div>
      )}
      <div className={`text-break ${valueClassName || ""}`}>
        {value !== null && value !== undefined ? value : "-"}
      </div>
    </Form.Group>
  );
};

export default CommonViewData;
