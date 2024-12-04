import React, { useEffect, useState } from 'react';
import { Card, Col, Dropdown, Image, ListGroup, Row, Stack } from 'react-bootstrap';
import { MdArrowDropDown, MdAttachFile, MdCalendarToday } from 'react-icons/md';
import { Link, useParams } from 'react-router-dom';
import defaultAvatar from "../../../assets/images/default-avatar.jpg";
import CommonViewData from '../../../components/CommonViewData';
import Loader from '../../../components/Loader';
import AppTooltip from '../../../components/tooltip';
import AttachmentsModal from '../modals/attachmentsModal';
import UserInfoModal from '../modals/userInfoModal';
import TicketViewHeader from './header';
import TicketTabsSection from './tabs';
import { changeTicketPriority, ticketDetailsApi } from '../../../services/ticketmanagement.service';
import toast from 'react-hot-toast';
import moment from 'moment/moment';
import ActivityLogs from './activity-logs';

const TicketsView = () => {
  const [selectedPriority, setSelectedPriority] = useState('Low');
  const [userInfoModalShow, setUserInfoModalShow] = useState(false);
  const [attachmentsModalShow, setAttachmentsModalShow] = useState(false);
  const [loading , setLoading] = useState(false)

  const { id } = useParams()

  const [ticketData, setTicketData] = useState({})

  // Function to handle dropdown item selection
  const handleSelect = (priority) => {
    
    setLoading(true)
    if (priority && priority !== '') {
      changeTicketPriority(id,priority).then(response => {
        setSelectedPriority(priority);
      }).catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message ?? "FAILED TO FETCH TICKET DETAILS");
        }
      }).finally(()=>{
        setLoading(false)
      })
    }
  };

  // GET TICKET DETAILS
  const getTicketDetails = () => {
    setLoading(true)
    ticketDetailsApi(id).then(response => {
      if (response?.data) {
        setTicketData(response?.data)
        setSelectedPriority(response?.data?.priority)
      }
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? "FAILED TO FETCH TICKET DETAILS");
      }
    }).finally(()=>{
      setLoading(false)
    })
  }
  useEffect(() => {
    getTicketDetails()
  }, [id])

  // The color class based on the priority level
  const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'NIL'];
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'LOW':
        return 'text-success';
      case 'MEDIUM':
        return 'text-orange';
      case 'HIGH':
        return 'text-danger';
      case 'NIL':
        return 'text-muted';
      default:
        return 'text-body';
    }
  };

  // Handle File a Claim Button
  const handleUserInfoClick = () => {
    setUserInfoModalShow(true)
  }

  // Handle Attachments Button
  const handleAttachmentsClick = () => {
    setAttachmentsModalShow(true)
  }
  // View Top Data
  const viewTopData = [
    {
      label: "Created on",
      value: ticketData?.createdAt ? moment(ticketData?.createdAt).format("DD-MM-YYYY | hh:mm:a") : '',
      colProps: { sm: 6 }
    },
    {
      label: "Due Date",
      value: ticketData?.slaBreachDate ? moment(ticketData?.slaBreachDate).format("DD-MM-YYYY") : 'N/A',
      colProps: { sm: 6 }
    },
    {
      label: "Claim filed by",
      value: <Link onClick={handleUserInfoClick} className='text-decoration-none'>{ticketData?.createdByUser?.name}</Link>,
      colProps: { sm: 6 }
    },
    {
      label: "Priority",
      value: (<Stack direction='horizontal' gap={1}>
        {/* <span className={`custom-min-width-50 fw-bold ${getPriorityClass(selectedPriority)}`}>{selectedPriority}</span> */}
        {/* Dropdown FILTER */}
        <Dropdown>
          <Dropdown.Toggle
            variant="link"
            id="filter-dropdown"
            className="link-dark p-1 ms-n1 hide-dropdown-arrow lh-1 text-decoration-none"
          >
            <AppTooltip title="Change Priority" placement="top">
              <span><span className={`custom-min-width-50 fw-bold  ${getPriorityClass(selectedPriority)}`}>{selectedPriority}</span> <MdArrowDropDown size={14} /></span>
            </AppTooltip>
          </Dropdown.Toggle>
          <Dropdown.Menu align="end" className="shadow-lg rounded-3 border-0 mt-1">
            {priorityOptions?.map((priority) => (
              <Dropdown.Item
                key={priority}
                className={`small ${selectedPriority === priority ? 'active' : ''}`}
                onClick={() => handleSelect(priority)}
              >
                {priority}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Stack>),
      colProps: { sm: 6 }
    },
    {
      label: "Claim Type",
      value: ticketData?.claimType?.name,
      colProps: { sm: 6 }
    },
    {
      label: "Claim Sub Type",
      value: ticketData?.claimSubType?.name,
      colProps: { sm: 6 }
    },
    {
      label: "Agent",
      value: ticketData?.fiAgent?.name ?? "N/A",
      colProps: { sm: 6 }
    },
    {
      label: "Team",
      value: ticketData?.team ?? "N/A",
      colProps: { sm: 6 }
    },
    // {
    //   value: (<Stack direction='horizontal' gap={1}>
    //     <span><MdAttachFile size={16} /></span>
    //     <Link onClick={handleAttachmentsClick} className='fw-semibold text-decoration-none'>Attachments</Link>
    //   </Stack>),
    //   colProps: { xs: 12, className: "pb-4" }
    // },
    {
      label: "Precedents",
      value: ticketData?.precedents,
      colProps: { xs: 12, className: "py-2" }
    },
    {
      label: "Specific Petition",
      value: ticketData?.specificPetition ?? 'N/A',
      colProps: { xs: 12 }
    },
  ];

  // View Bottom Data
  const viewBottomData = [
    {
      label: "Created on",
      value: `07-10-24 | 03:33 pm`,
      colProps: { sm: 6 }
    },
    {
      label: "Agent",
      value: `John Duo`,
      colProps: { sm: 6 }
    },
    {
      value: (<Stack direction='horizontal' gap={1}>
        <span><MdAttachFile size={16} /></span>
        <Link onClick={handleAttachmentsClick} className='fw-semibold text-decoration-none'>Attachments</Link>
      </Stack>),
      colProps: { xs: 12, className: "pb-3" }
    },
    {
      label: "Comments",
      value: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam luctus ante quis massa bibendum fringilla.`,
      colProps: { xs: 12 }
    },
  ]
  return (
    <React.Fragment>
      <Loader isLoading={loading} />
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        <TicketViewHeader
          title={"#" + ticketData?.ticketId}
          ticketData={ticketData}
        />
        <div className='d-flex flex-column flex-grow-1 mh-100 overflow-x-hidden pb-3'>
          <Row className='h-100 gy-3 gy-lg-0 gx-3'>
            <Col lg={6} className='mh-100 d-flex flex-column'>
              <Card className="border-0 shadow h-100 custom-min-height-200 overflow-auto">
                <Card.Body>
                  <Row>
                    {viewTopData?.map((item, index) => (
                      <Col key={"data_view_" + index} {...item.colProps}>
                        <CommonViewData label={item.label} value={item.value} />
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
              <Card className="border-0 card custom-min-height-200 flex-grow-1 mh-100 mt-3 overflow-auto shadow">
                <Card.Body className='mh-100'>
                  <h5 className='custom-font-size-18 fw-semibold mb-3'>2nd Instance Claim details</h5>
                  <Row>
                    {viewBottomData?.map((item, index) => (
                      <Col key={"data_view_" + index} {...item.colProps}>
                        <CommonViewData label={item.label} value={item.value} />
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6} className='mh-100 d-flex flex-column'>
              <Card className="border-0 shadow">
                <Card.Header className='bg-body border-0 py-3'>
                {/* REPLY SECTION */}
                  <Row className='g-2'>
                    <Col xs="auto">
                      <Image
                        className="object-fit-cover rounded-circle"
                        src={defaultAvatar}
                        width={36}
                        height={36}
                        alt="John Smith"
                      />
                    </Col>
                    <Col xs className='small lh-sm'>
                      <div className='fw-bold'>John Smith</div>
                      <Stack direction='horizontal' gap={2} className='text-secondary'>
                        <span className='d-inline-flex'><MdCalendarToday size={12} /></span>
                        <span>07-14-24 | 10:00 am </span>
                      </Stack>
                    </Col>
                  </Row>
                </Card.Header>
                <TicketTabsSection />
              </Card>
              <ActivityLogs setLoading = {setLoading} ticketId ={id}/>

              {/* <Card className="border-0 card custom-min-height-200 flex-grow-1 mh-100 mt-3 overflow-auto shadow">
                <Card.Body className='py-0'>
                  <ListGroup variant="flush">
                    {chatReplyData.map((reply) => (
                      <ListGroup.Item key={reply.id} className='py-3'>
                        <Row className='g-2'>
                          <Col xs="auto">
                            <Image
                              className="object-fit-cover rounded-circle"
                              src={reply.avatar}
                              width={36}
                              height={36}
                              alt={reply.name}
                            />
                          </Col>
                          <Col xs className='small lh-sm'>
                            <div className='fw-bold'>{reply.name} <span className='fw-normal'>{reply.action}</span></div>
                            <Stack direction='horizontal' gap={2} className='text-secondary'>
                              <span className='d-inline-flex'><MdCalendarToday size={12} /></span>
                              <span>{reply.date}</span>
                            </Stack>
                            <p className={`mt-2 mb-0 bg-opacity-25 ${getReplyStatusClass(reply.variant)}`}>{reply.message}</p>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card> */}
            </Col>
          </Row>
        </div>
      </div>
      {/* User Info Modals */}
      <UserInfoModal
        modal={userInfoModalShow}
        userData={ticketData}
        toggle={() => setUserInfoModalShow(false)}
      />

      {/* Attachments Modals */}
      <AttachmentsModal
        modal={attachmentsModalShow}
        toggle={() => setAttachmentsModalShow(false)}
      />

    </React.Fragment>
  )
}

export default TicketsView