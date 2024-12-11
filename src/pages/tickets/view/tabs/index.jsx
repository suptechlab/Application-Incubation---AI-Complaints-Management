import React, { useState } from 'react';
import { Nav, Stack, Tab } from 'react-bootstrap';
import { MdOutlineNote, MdOutlineNoteAdd, MdOutlineReply } from 'react-icons/md';
import ReplyTab from './reply-tab';
import { useTranslation } from 'react-i18next';

const TicketTabsSection = ({ticketId,setIsGetAcitivityLogs}) => {
    const {t} = useTranslation()
    const [activeTab, setActiveTab] = useState('replies');

    //Handle Dropdown Select
    const handleDropdownSelect = (eventKey) => {
        for (const tab of ticketsTabsData) {
            if (eventKey === tab?.id) {
                setActiveTab(eventKey)
            }
        }
    };

    // Tickets Tabs Data
    const ticketsTabsData = [
        {
            id: 'replies',
            name: t('REPLIES'),
            tabIcon: <MdOutlineReply size={14} />,
            Component: <ReplyTab ticketId={ticketId} setIsGetAcitivityLogs={setIsGetAcitivityLogs}/>,
            disabled: false,
        },
        // {
        //     id: 'internalNote',
        //     name: 'Add an Internal Note',
        //     tabIcon: <MdOutlineNoteAdd size={14} />,
        //     Component: <ReplyTab />,
        //     disabled: false,
        // },
        // {
        //     id: 'resolutionNotes',
        //     name: 'Resolution Notes',
        //     tabIcon: <MdOutlineNote size={14} />,
        //     Component: <ReplyTab />,
        //     disabled: false,
        // },
    ];

    return (
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
                    const { id, name, tabIcon, disabled } = tabNames;
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
                                    <span>{tabIcon}</span>
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
    )
}

export default TicketTabsSection