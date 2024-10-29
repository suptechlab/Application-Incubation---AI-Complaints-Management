import React from "react";
import { Button, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import AppTooltip from "./tooltip";

/**
 * Render Data Table Grid Actions Functions For Data Grid
 *
 * @param {{ controlId: any; rowData: any; customButtons: any; wrapperClassName: any; }} param0
 * @param {*} param0.controlId
 * @param {*} param0.rowData
 * @param {*} param0.customButtons
 * @param {*} param0.wrapperClassName
 * @returns {*}
 */

const DataGridActions = ({
  controlId,
  rowData,
  customButtons,
  wrapperClassName
}) => {
  return (
    <Stack direction="horizontal" gap={1} className={`justify-content-center ${wrapperClassName || ''}`}>
      {customButtons?.map((buttonItem) => (
        <React.Fragment key={buttonItem?.name}>
          {buttonItem?.enabled && (
            <AppTooltip title={buttonItem?.title} placement="top">
              {buttonItem?.type === "link" ? (
                <Link
                  className={`custom-width-26 custom-height-26 d-inline-flex align-items-center justify-content-center p-1 lh-1 fs-5 theme-${buttonItem?.name}-btn link-dark ${buttonItem?.disabled ? "pe-none opacity-50" : ""}`}
                  to={buttonItem?.customLink ?? `/${controlId}/${buttonItem?.name}/${rowData?.row?.original?.id}`}
                  aria-label={buttonItem?.title}
                  target={buttonItem?.target || "_self"}
                >
                  {buttonItem?.icon}
                </Link>
              ) : (
                <Button
                  className={`custom-width-26 custom-height-26 d-inline-flex align-items-center justify-content-center p-1 lh-1 fs-5 theme-${buttonItem?.name}-btn link-dark`}
                  variant="link"
                  disabled={buttonItem?.disabled}
                  onClick={buttonItem?.handler}
                  aria-label={buttonItem?.title}
                >
                  {buttonItem?.icon}
                </Button>
              )}
            </AppTooltip>
          )}
        </React.Fragment>
      ))}
    </Stack>
  );
};

export default DataGridActions;
