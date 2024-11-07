import React from "react";
import Form from "react-bootstrap/Form";

/**
 * View Text Reusable Component
 *
 * @param {{ label: any; value: any; wrapperClassname: any; valueClassName: any; }} param0
 * @param {*} param0.label
 * @param {*} param0.value
 * @param {*} param0.wrapperClassname
 * @param {*} param0.valueClassName
 * @returns {*}
 */

const CommonViewData = ({ label, value, wrapperClassname='mb-3', valueClassName }) => {
  return (
    <Form.Group className={`small ${wrapperClassname}`}>
      {label && (
        <div className="lh-sm fw-semibold opacity-50">{label}</div>
      )}
      <div className={`text-break ${valueClassName || ""}`}>
        {value !== null && value !== undefined ? value : "-"}
      </div>
    </Form.Group>
  );
};

export default CommonViewData;
