import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const AppTooltip = ({ children, title, placement, className }) => {
    const tooltip = <Tooltip className={className} id="tooltip">{title}</Tooltip>;
    return (
        <OverlayTrigger rootClose={true} rootCloseEvent="mousedown" trigger={["hover", "hover"]} overlay={tooltip} placement={placement || 'top'}>
            {children}
        </OverlayTrigger>
    );
};

export default AppTooltip;
