import React from 'react';
import { Stack } from 'react-bootstrap';

const Header = () => {
    return (
        <div className="contentHeader p-1">
            <Stack
                direction="horizontal"
                gap={2}
                className="flex-wrap justify-content-between custom-min-height-42"
            >
                <h1 className="fw-semibold h4 mb-0 fs-22">
                    Manage Users
                </h1>

            </Stack>
        </div>
    );
};

export default Header;
