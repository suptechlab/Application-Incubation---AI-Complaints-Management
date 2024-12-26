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
import { useContext } from 'react';
import { AuthenticationContext } from '../../../contexts/authentication.context';
import { MasterDataContext } from '../../../contexts/masters.context';
import { useTranslation } from 'react-i18next';
import ConsumerInfoModal from '../modals/consumerInfoModal';

const TicketsView = () => {

  const { currentUser } = useContext(AuthenticationContext);

  const { masterData } = useContext(MasterDataContext);

  const { t } = useTranslation()

  const [isGetActivityLogs, setIsGetAcitivityLogs] = useState(true)

  const [selectedPriority, setSelectedPriority] = useState('LOW');
  const [userInfoModalShow, setUserInfoModalShow] = useState(false);
  const [consumerInfoModalShow, setConsumerInfoModalShow] = useState(false);
  const [attachmentsModalShow, setAttachmentsModalShow] = useState(false);
  const [currentInstance, setCurrentInstance] = useState('')

  const [loading, setLoading] = useState(false)

  const { id } = useParams()

  const [ticketData, setTicketData] = useState({})

  const [currentDate, setCurrentDate] = useState(moment().format("DD-MM-YYYY | hh:mm:a"));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDate(moment().format("DD-MM-YYYY | hh:mm:a"));
    }, 60000); // Update every 60,000ms (1 minute)

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this effect runs only once



  // Function to handle dropdown item selection
  const handlePriorityChange = (priority) => {
    setLoading(true)
    if (priority && priority !== '') {
      changeTicketPriority(id, priority).then(response => {
        setSelectedPriority(priority);
        setIsGetAcitivityLogs((prev) => !prev)
      }).catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message ?? "FAILED TO FETCH TICKET DETAILS");
        }
      }).finally(() => {
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
    }).finally(() => {
      setLoading(false)
    })
  }
  useEffect(() => {
    getTicketDetails()
  }, [id])

  // The color class based on the priority level
  const priorityOptions = ['LOW', 'MEDIUM', 'HIGH'];
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'LOW':
        return 'text-success';
      case 'MEDIUM':
        return 'text-orange';
      case 'HIGH':
        return 'text-danger';
      // case 'NIL':
      //   return 'text-muted';
      default:
        return 'text-body';
    }
  };

  // Handle File a Claim Button
  const handleUserInfoClick = () => {
    setUserInfoModalShow(true)
  }

  // Handle File a Claim Button
  const handleConsumerInfoClick = () => {
    setConsumerInfoModalShow(true)
  }

  // Handle Attachments Button
  const handleAttachmentsClick = (instance_type) => {
    setCurrentInstance(instance_type)
    setAttachmentsModalShow(true)
  }
  // VIEW TOP DATA
  const viewTopData = [
    {
      label: t("CREATED_ON"),
      value: ticketData?.createdAt ? moment(ticketData?.createdAt).format("DD-MM-YYYY | hh:mm:a") : '',
      colProps: { sm: 6 }
    },
    {
      label: t("DUE_DATE"),
      value: ticketData?.slaBreachDate ? moment(ticketData?.slaBreachDate).format("DD-MM-YYYY") : 'N/A',
      colProps: { sm: 6 }
    },
    {
      label: t("CLAIM_FILED_BY"),
      value: <Link onClick={handleUserInfoClick} className='text-decoration-none'>{ticketData?.createdByUser?.name}</Link>,
      colProps: { sm: 6 }
    },
    {
      label: t("PRIORITY"),
      value: (<Stack direction='horizontal' gap={1}>
        {
          ((currentUser === "FI_ADMIN" || currentUser === "SEPS_ADMIN" || currentUser === "ADMIN") && (ticketData?.status !== "CLOSED" && ticketData?.status !== "REJECTED")) ?
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                id="filter-dropdown"
                className="link-dark p-1 ms-n1 hide-dropdown-arrow lh-1 text-decoration-none"
              >
                <AppTooltip title={t("CHANGE_PRIORITY")} placement="top">
                  <span>
                    <span className={`custom-min-width-50 fw-bold  ${getPriorityClass(selectedPriority)}`}>
                      {masterData?.claimTicketPriority[selectedPriority]}
                    </span> <MdArrowDropDown size={14} /></span>
                </AppTooltip>
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="shadow-lg rounded-3 border-0 mt-1">
                {priorityOptions?.map((priority) => (
                  <Dropdown.Item
                    key={priority}
                    className={`small ${selectedPriority === priority ? 'active' : ''}`}
                    onClick={() => handlePriorityChange(priority)}
                  >
                    {masterData?.claimTicketPriority[priority]}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown> :
            <span className={`custom-min-width-50 fw-bold ${getPriorityClass(selectedPriority)}`}>{selectedPriority}</span>
        }
      </Stack>),
      colProps: { sm: 6 }
    },
    {
      label: t("CLAIM TYPE"),
      value: ticketData?.claimType?.name,
      colProps: { sm: 6 }
    },
    {
      label: t("CLAIM_SUB_TYPE"),
      value: ticketData?.claimSubType?.name,
      colProps: { sm: 6 }
    },
    {
      label: t("AGENT"),
      value: ticketData?.fiAgent?.name ?? "N/A",
      colProps: { sm: 6 }
    },
    {
      label: t("TEAM"),
      value: ticketData?.team ?? "N/A",
      colProps: { sm: 6 }
    },
    ...(ticketData?.createdByUser?.id !== ticketData?.user?.id
      ? [
        {
          label: t("CONSUMER_INFO"),
          value: <Link onClick={handleConsumerInfoClick} className='text-decoration-none'>{ticketData?.user?.name}</Link>,
          colProps: { sm: 6 },
        },
      ]
      : []),
    // {
    //   label: t("CONSUMER_INFO"),
    //   value: <Link onClick={handleConsumerInfoClick} className='text-decoration-none'>{ticketData?.user?.name}</Link>,
    //   colProps: { sm: 6 }
    // },
    // ...(ticketData?.claimTicketDocuments !== ticketData?.claimTicketDocuments?.length > 0
    //   ? [{
    //     value: (<Stack direction='horizontal' gap={1}>
    //       <span><MdAttachFile size={16} /></span>
    //       <Link onClick={handleAttachmentsClick} className='fw-semibold text-decoration-none'>{t("ATTACHMENTS")}</Link>
    //     </Stack>),
    //     colProps: { sm: 6 }
    //   }] :[]),
    {
      value: (<Stack direction='horizontal' gap={1}>
        <span><MdAttachFile size={16} /></span>
        <button onClick={() => handleAttachmentsClick("FIRST_INSTANCE")} className='fw-semibold text-decoration-none text-info btn p-0'>{t("ATTACHMENTS")}</button>
      </Stack>),
      colProps: { sm: 6 }
    },
    {
      label: t("PRECEDENTS"),
      value: ticketData?.precedents,
      colProps: { xs: 12, className: "py-2" }
    },
    {
      label: t("SPECIFIC_PETITION"),
      value: ticketData?.specificPetition ?? 'N/A',
      colProps: { xs: 12 }
    },
  ];
  // VIEW BOTTOM DATA
  const viewSecondInstanceData = [
    {
      label: t("CREATED_ON"),
      value: ticketData?.secondInstanceFiledAt ? moment(ticketData?.secondInstanceFiledAt).format("DD-MM-YYYY | hh:mm:a") : '',
      colProps: { sm: 6 }
    },
    {
      label: t("AGENT"),
      value: ticketData?.sepsAgent?.name ?? 'N/A',
      colProps: { sm: 6 }
    },
    {
      value: (<Stack direction='horizontal' gap={1}>
        <span><MdAttachFile size={16} /></span>
        <button onClick={() => handleAttachmentsClick("SECOND_INSTANCE")} className='fw-semibold text-decoration-none text-info btn p-0'>{t("ATTACHMENTS")}</button>
      </Stack>),
      colProps: { xs: 12 }
    },
    {
      label: t("COMMENT"),
      value: ticketData?.secondInstanceComment ?? 'N/A',
      colProps: { xs: 12 }
    },
  ];

  const viewComplaintData = [
    {
      label: t("CREATED_ON"),
      value: ticketData?.complaintFiledAt ? moment(ticketData?.complaintFiledAt).format("DD-MM-YYYY | hh:mm:a") : '',
      colProps: { sm: 6 }
    },
    // {
    //   label: t("AGENT"),
    //   value: ticketData?.sepsAgent?.name ?? 'N/A',
    //   colProps: { sm: 6 }
    // },
    {
      value: (<Stack direction='horizontal' gap={1}>
        <span><MdAttachFile size={16} /></span>
        <button onClick={() => handleAttachmentsClick("COMPLAINT")} className='fw-semibold text-decoration-none text-info btn p-0'>{t("ATTACHMENTS")}</button>
      </Stack>),
      colProps: { xs: 12 }
    },
    {
      label: t("PRECEDENTS"),
      value: ticketData?.complaintPrecedents ?? 'N/A',
      colProps: { xs: 12 }
    },
  ];

  return (
    <React.Fragment>
      <Loader isLoading={loading} />



      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        {loading !== true && <TicketViewHeader
          title={"#" + ticketData?.ticketId}
          ticketData={ticketData}
          setIsGetAcitivityLogs={setIsGetAcitivityLogs}
          getTicketData={getTicketDetails}
        />}


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
              {/* SECOND INSTANCE DETAILS */}
              {
                (ticketData?.instanceType === 'SECOND_INSTANCE' || ticketData?.instanceType === 'COMPLAINT') &&
                <Card className="border-0 card custom-min-height-200 flex-grow-1 mh-100 mt-3 overflow-auto shadow">
                  <Card.Body className='mh-100'>
                    <h5 className='custom-font-size-18 fw-semibold mb-3'>{t("SECOND_INSTANCE_CLAIM_DETAILS")}</h5>
                    <Row>
                      {viewSecondInstanceData?.map((item, index) => (
                        <Col key={"data_view_" + index} {...item.colProps}>
                          <CommonViewData label={item.label} value={item.value} />
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              }
              {/* COMPLAINT DETAILS */}
              {
                ticketData?.instanceType === 'COMPLAINT' &&
                <Card className="border-0 card custom-min-height-200 flex-grow-1 mh-100 mt-3 overflow-auto shadow">
                  <Card.Body className='mh-100'>
                    <h5 className='custom-font-size-18 fw-semibold mb-3'>{t("COMPLAINT")}</h5>
                    <Row>
                      {viewComplaintData?.map((item, index) => (
                        <Col key={"data_view_" + index} {...item.colProps}>
                          <CommonViewData label={item.label} value={item.value} />
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              }
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
                        alt={ticketData?.user?.name}
                      />
                    </Col>
                    <Col xs className='small lh-sm'>
                      <div className='fw-bold'>{ticketData?.user?.name}</div>
                      <Stack direction='horizontal' gap={2} className='text-secondary'>
                        <span className='d-inline-flex'><MdCalendarToday size={12} /></span>
                        <span> {currentDate} </span>
                      </Stack>
                    </Col>
                  </Row>
                </Card.Header>
                <TicketTabsSection ticketId={ticketData?.id} setIsGetAcitivityLogs={setIsGetAcitivityLogs} ticketData={ticketData} getTicketData={getTicketDetails} />
              </Card>
              <ActivityLogs setLoading={setLoading} ticketId={id} isGetActivityLogs={isGetActivityLogs} />
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
        masterData={masterData}
      />
      <ConsumerInfoModal
        modal={consumerInfoModalShow}
        userData={ticketData}
        toggle={() => setConsumerInfoModalShow(false)}
        masterData={masterData}
      />
      {/* Attachments Modals */}
      <AttachmentsModal
        modal={attachmentsModalShow}
        toggle={() => setAttachmentsModalShow(false)}
        currentInstance={currentInstance}
        ticketData={ticketData}
      />
    </React.Fragment>
  )
}

export default TicketsView