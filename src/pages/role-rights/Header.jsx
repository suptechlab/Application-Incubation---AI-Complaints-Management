import React from 'react';
import { Button, Stack } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ toggle }) => {
    const navigate = useNavigate();
    return (
        <div className="contentHeader p-1">
            <Stack
                direction="horizontal"
                gap={2}
                className="flex-wrap justify-content-between custom-min-height-42"
            >
                <h1 className="fw-semibold h4 mb-0 fs-22">
                    Portal Users Management
                </h1>
                <Link to={`/role-rights/add`} className="fw-semibold fs-14 custom-width-85 bg-info text-white text-decoration-none rounded-2 p-2 text-center" type="button" variant="info" size="sm">Add New</Link>
            </Stack>
        </div>
    );
};

export default Header;
