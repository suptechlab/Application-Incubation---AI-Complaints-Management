import React from 'react';
import { Button, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const PageHeader = ({ title, actions }) => {
    const { t } = useTranslation();

    return (
        <div className="contentHeader">
            <Stack
                direction="horizontal"
                gap={2}
                className="flex-wrap custom-min-height-38"
            >
                <h1 className="fw-semibold fs-4 mb-0 me-auto">
                    {title}
                </h1>

                {actions?.length > 0 && (
                    <Stack direction="horizontal" gap={2} className='gap-md-3 flex-wrap'>
                        {actions.map((action, index) =>
                            action.to ? (
                                <Link
                                    key={`action-${index}`}
                                    to={action.to}
                                    className={`btn btn-${action.variant || 'primary'}`}
                                    onClick={action.onClick}
                                >
                                    {t(action.label)}
                                </Link>
                            ) : (
                                <Button
                                    key={`action-${index}`}
                                    variant={action.variant || 'primary'}
                                    onClick={action.onClick}
                                >
                                    {t(action.label)}
                                </Button>
                            )
                        )}
                    </Stack>
                )}
            </Stack>
        </div>
    );
};

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func,
        to: PropTypes.string, // If present, renders a Link
        variant: PropTypes.string, // Only for Button
    })),
};

PageHeader.defaultProps = {
    actions: [],
};

export default PageHeader;