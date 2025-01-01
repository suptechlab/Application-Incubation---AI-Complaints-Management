import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Nav, Stack, Tab } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/Loader";
import PageHeader from "../../../components/PageHeader";
import { AuthenticationContext } from "../../../contexts/authentication.context";
import TicketsNormalList from "./normal-list-tab";
import TicketsListFilters from "./filters";
import TicketsTaggedList from "./tagged-list-tab";

export default function TicketsList() {
    const navigate = useNavigate();
    const { currentUser, permissions = {} } = useContext(AuthenticationContext)
    const [permissionsState, setPermissionsState] = React.useState({
        addModule: false
    });
    const [activeTab, setActiveTab] = useState('taggedTickets');

    //Handle Dropdown Select
    const handleDropdownSelect = (eventKey) => {
        for (const tab of ticketsTabsData) {
            if (eventKey === tab?.id) {
                setActiveTab(eventKey)
            }
        }
    };

    useEffect(() => {
        const updatedPermissions = {
            addModule: false
        };
        if (currentUser === "SYSTEM_ADMIN") {
            updatedPermissions.addModule = true;
        } else {
            const permissionArr = permissions['Ticket'] ?? [];
            if (["TICKET_CREATED_BY_SEPS", "TICKET_CREATED_BY_FI"].some(permission => permissionArr.includes(permission))) {
                updatedPermissions.addModule = true;
            }
        }

        setPermissionsState(updatedPermissions);
    }, [permissions, currentUser]);

    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);

    //Add New Click Hanlder
    const addNewClickHanlder = () => {
        navigate('/tickets/add')
    }

    // Tickets Tabs Data
    const ticketsTabsData = [
        {
            id: 'allTickets',
            name: t('ALL_TICKETS'),
            Component: <TicketsNormalList />,
            disabled: false,
        },
        {
            id: 'taggedTickets',
            name: t("TAGGED_TICKETS"),
            Component: <TicketsTaggedList />,
            disabled: false,
        }
    ];

    const actions = permissionsState?.addModule ?
        [{ label: t('ADD_NEW_CLAIM'), onClick: addNewClickHanlder, variant: 'warning', disabled: true }] : []

    return (
        <React.Fragment>
            <Loader isLoading={loading} />
            <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
                <PageHeader
                    title={t('TICKETS')}
                    actions={actions}
                />
                <Tab.Container
                    id="tickets-tabs"
                    activeKey={activeTab}
                    onSelect={handleDropdownSelect}
                    unmountOnExit={true}
                >
                    <Nav
                        className="custom-border-tabs border-black border-bottom border-opacity-10"
                    >
                        {ticketsTabsData.map((tabNames) => {
                            const { id, name, disabled } = tabNames;
                            return (
                                <React.Fragment
                                    key={id}
                                >
                                    <Nav.Link
                                        eventKey={id}
                                        disabled={disabled}
                                        className={`position-relative border-bottom border-2 border-white link-dark link-opacity-50 ${disabled ? 'opacity-50' : ''}`}
                                    >
                                        <Stack direction='horizontal' gap={2} className='custom-padding-top-2'>
                                            <span className='custom-font-size-13'>{name}</span>
                                        </Stack>
                                    </Nav.Link>
                                </React.Fragment>
                            )
                        })}
                    </Nav>

                    <Tab.Content className='tickets-tab-content'>
                        {ticketsTabsData.map((tabNames) => {
                            const { id, Component } = tabNames;
                            return (
                                <React.Fragment
                                    key={id}
                                >
                                    <Tab.Pane
                                        eventKey={id}
                                    >
                                        {Component}
                                    </Tab.Pane>
                                </React.Fragment>
                            )
                        })}
                    </Tab.Content>
                </Tab.Container>
            </div>

        </React.Fragment>
    );
}
