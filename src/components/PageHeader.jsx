import React from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const PageHeader = ({title, toggle }) => {
    const {t} = useTranslation()
    return (
        <div className="contentHeader p-1">
            <Stack
                direction="horizontal"
                gap={2}
                className="flex-wrap justify-content-between custom-min-height-42"
            >
                <h1 className="fw-semibold h4 mb-0 fs-22">
                    {title}
                </h1>
                <Button
                    variant="warning"
                    className="fw-semibold fs-14"
                    onClick={toggle}
                >
                    {t("ADD NEW")}
                </Button>
                {/* <Link to={`/districts/add`} className="fw-semibold fs-14 custom-width-85 bg-info text-white text-decoration-none rounded-2 p-2 text-center" type="button" variant="info" size="sm">Add New</Link> */}
            </Stack>
        </div>
    );
};

export default PageHeader;
