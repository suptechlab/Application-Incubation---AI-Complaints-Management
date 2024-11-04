import React from "react";
import { FormCheck } from "react-bootstrap";
import AppTooltip from "./tooltip";

const Toggle = ({ id, label, name, onChange, value, tooltip }) => {
  const toggleSwitch = (
    <FormCheck
      type="switch"
      id={id}
      name={name}
      label={label}
      checked={value}
      onChange={onChange}
    />
  );

  return (
    <div className="form-group">
      {label || !tooltip ? toggleSwitch : <AppTooltip title={tooltip}>{toggleSwitch}</AppTooltip>}
    </div>
  );
};

export default Toggle;