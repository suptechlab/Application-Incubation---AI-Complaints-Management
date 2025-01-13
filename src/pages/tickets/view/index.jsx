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
import SlaReminderModal from '../modals/slaReminderModal';

const TicketsView = () => {

  const { currentUser, permissions = {} } = useContext(AuthenticationContext);

  const { masterData } = useContext(MasterDataContext);

  const [topSectionData, setTopSectionData] = useState([])

  const [middleSectionData, setMiddleSectionData] = useState([])

  const [bottomSectionData, setBottomSectionData] = useState([])

  // PERMISSIONS work

  const [permissionsState, setPermissionsState] = React.useState({
    statusModule: false,
    rejectPermission: false,
    closePermission: false,
    priorityPermission: false,
    downloadPermission: false,
    assignPermission: false,
    dateExtPermission: false,
    replyToCustomerPermission: false,
    replyInternalPermission: false,
    internalNotePermission: false
  });

  useEffect(() => {
    const updatedPermissions = {
      statusModule: false,
      rejectPermission: false,
      closePermission: false,
      priorityPermission: false,
      downloadPermission: false,
      assignPermission: false,
      dateExtPermission: false,
      replyToCustomerPermission: false,
      replyInternalPermission: false,
      internalNotePermission: false
    };
    if (currentUser === "SYSTEM_ADMIN") {
      updatedPermissions.statusModule = true;
      updatedPermissions.rejectPermission = true;
      updatedPermissions.closePermission = true;
      updatedPermissions.priorityPermission = true;
      updatedPermissions.downloadPermission = true;
      updatedPermissions.assignPermission = true;
      updatedPermissions.dateExtPermission = true;
      updatedPermissions.replyToCustomerPermission = true;
      updatedPermissions.replyInternalPermission = true;
      updatedPermissions.internalNotePermission = true;
    } else {
      const permissionArr = permissions['Ticket'] ?? [];
      if (["TICKET_ASSIGNED_TO_AGENT_FI", "TICKET_ASSIGNED_TO_AGENT_SEPS"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.assignPermission = true;
      }
      if (["TICKET_CHANGE_STATUS_BY_SEPS", "TICKET_CHANGE_STATUS_BY_FI"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.statusModule = true;
      }
      if (["TICKET_REJECT_FI", "TICKET_REJECT_SEPS"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.rejectPermission = true;
      }
      if (["TICKET_CLOSED_FI", "TICKET_CLOSED_SEPS"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.closePermission = true;
      }
      if (["TICKET_PRIORITY_CHANGE_FI", "TICKET_PRIORITY_CHANGE_SEPS"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.priorityPermission = true;
      }
      if (["TICKET_DOWNLOAD_PDF_FI", "TICKET_DOWNLOAD_PDF_SEPS"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.downloadPermission = true;
      }
      if (["TICKET_DATE_EXTENSION_FI", "TICKET_DATE_EXTENSION_SEPS"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.dateExtPermission = true;
      }
      if (["TICKET_REPLY_TO_CUSTOMER_FI", "TICKET_REPLY_TO_CUSTOMER_SEPS"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.replyToCustomerPermission = true;
      }
      if (["TICKET_REPLY_TO_INTERNAL_FI", "TICKET_REPLY_TO_INTERNAL_SEPS"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.replyInternalPermission = true;
      }
      if (["TICKET_INTERNAL_NOTE_FI", "TICKET_INTERNAL_NOTE_SEPS"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.internalNotePermission = true;
      }
    }

    setPermissionsState(updatedPermissions);
  }, [permissions, currentUser]);

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

  const [showReminderModal, setShowReminderModal] = useState(false)

  const toggleSLAReminder = () => {
    setShowReminderModal(!showReminderModal)
  }

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

        if (response?.data?.slaPopup === true) {
          setShowReminderModal(true)
        } else {
          setShowReminderModal(false)
        }
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


  const formatDate = (date, format) => (date ? moment(date).format(format) : 'N/A');


  // COMMON FIELDS
  const createCommonFields = (commonData, isPrevData) => [
    {
      label: t("CREATED_ON"),
      value: formatDate(commonData?.createdAt, "DD-MM-YYYY | hh:mm:a"),
      colProps: { sm: 6 },
    },
    {
      label: t("DUE_DATE"),
      value: formatDate(commonData?.slaBreachDate, "DD-MM-YYYY"),
      colProps: { sm: 6 },
    },
    {
      label: t("CLAIM_FILED_BY"),
      value: (
        <Link onClick={handleUserInfoClick} className="text-decoration-none">
          {commonData?.createdByUser?.name}
        </Link>
      ),
      colProps: { sm: 6 },
    },
    {
      label: t("PRIORITY"),
      value: (
        <Stack direction="horizontal" gap={1}>
          {(permissionsState?.priorityPermission && !isPrevData) &&
            !["CLOSED", "REJECTED"].includes(commonData?.status) ? (
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                id="filter-dropdown"
                className="link-dark p-1 ms-n1 hide-dropdown-arrow lh-1 text-decoration-none"
              >
                <AppTooltip title={t("CHANGE_PRIORITY")} placement="top">
                  <span>
                    <span
                      className={`custom-min-width-50 fw-bold ${getPriorityClass(
                        selectedPriority
                      )}`}
                    >
                      {masterData?.claimTicketPriority[selectedPriority]}
                    </span>{" "}
                    <MdArrowDropDown size={14} />
                  </span>
                </AppTooltip>
              </Dropdown.Toggle>
              <Dropdown.Menu
                align="end"
                className="shadow-lg rounded-3 border-0 mt-1"
              >
                {priorityOptions?.map((priority) => (
                  <Dropdown.Item
                    key={priority}
                    className={`small ${selectedPriority === priority ? "active" : ""
                      }`}
                    onClick={() => handlePriorityChange(priority)}
                  >
                    {masterData?.claimTicketPriority[priority]}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <span
              className={`custom-min-width-50 fw-bold ${getPriorityClass(
                selectedPriority
              )}`}
            >
              {selectedPriority}
            </span>
          )}
        </Stack>
      ),
      colProps: { sm: 6 },
    },
    {
      label: t("CLAIM TYPE"),
      value: commonData?.claimType?.name,
      colProps: { sm: 6 },
    },
    {
      label: t("CLAIM_SUB_TYPE"),
      value: commonData?.claimSubType?.name,
      colProps: { sm: 6 },
    },
    {
      label: t("AGENT"),
      value: commonData?.instanceType === 'FIRST_INSTANCE' ? commonData?.fiAgent?.name ?? "N/A" : commonData?.sepsAgent?.name ?? 'N/A',
      colProps: { sm: 6 },
    },
    {
      label: t("TEAM"),
      value: commonData?.team ?? "N/A",
      colProps: { sm: 6 },
    },
  ];


  useEffect(() => {
    if (!ticketData) return;

    const addConditionalFields = (fields) => {
      if (ticketData?.slaPopup !== null) {
        fields.push({
          value: (
            <Link
              onClick={(event) => {
                setShowReminderModal(true);
                event.preventDefault();
              }}
              className="text-decoration-none"
            >
              {("PROVIDE_SLA_COMMENT")}
            </Link>
          ),
          colProps: { sm: 6 },
        });
      }

      if (ticketData?.createdByUser?.id !== ticketData?.user?.id) {
        fields.push({
          label: t("CONSUMER_INFO"),
          value: (
            <Link
              onClick={handleConsumerInfoClick}
              className="text-decoration-none"
            >
              {ticketData?.user?.name}
            </Link>
          ),
          colProps: { sm: 6 },
        });
      }

      if (ticketData?.slaComment !== null) {
        fields.push({
          label: t("SLA_COMMENT"),
          value: (
            <p className="text-decoration-none text-secondary fw-bold">
              {ticketData?.slaComment}
            </p>
          ),
          colProps: { sm: 6 },
        });
      }

      if (ticketData?.slaComment) {
        fields.push({
          label: t("SLA_COMMENT"),
          value: <p className='text-decoration-none text-secondary fw-bold'> {ticketData?.secondInstanceSlaComment}</p>,
          colProps: { sm: 6 },
        });
      }

      return fields;
    };


    const topCommonFields = createCommonFields(ticketData, false);
    let middleCommonFields = []

    if (ticketData?.instanceType === "FIRST_INSTANCE") {
      setTopSectionData(
        addConditionalFields([
          ...topCommonFields,
          {
            value: (
              <Stack direction="horizontal" gap={1}>
                <span>
                  <MdAttachFile size={16} />
                </span>
                <button
                  onClick={() => handleAttachmentsClick("FIRST_INSTANCE")}
                  className="fw-semibold text-decoration-none text-info btn p-0"
                >
                  {t("ATTACHMENTS")}
                </button>
              </Stack>
            ),
            colProps: { sm: 6 },
          },
          {
            label: t("PRECEDENTS"),
            value: ticketData?.precedents,
            colProps: { xs: 12, className: "py-2" },
          },
          {
            label: t("SPECIFIC_PETITION"),
            value: ticketData?.specificPetition ?? "N/A",
            colProps: { xs: 12 },
          },
        ])
      );
    } else if (ticketData?.instanceType === "SECOND_INSTANCE") {
      setTopSectionData(
        addConditionalFields([
          ...topCommonFields,
          {
            value: (
              <Stack direction="horizontal" gap={1}>
                <span>
                  <MdAttachFile size={16} />
                </span>
                <button
                  onClick={() => handleAttachmentsClick("SECOND_INSTANCE")}
                  className="fw-semibold text-decoration-none text-info btn p-0"
                >
                  {t("ATTACHMENTS")}
                </button>
              </Stack>
            ),
            colProps: { sm: 6 },
          },
          {
            label: t("COMMENT"),
            value: ticketData?.secondInstanceComment,
            colProps: { xs: 12, className: "py-2" },
          },
        ])
      );
      if (ticketData?.previousTicket) {
        middleCommonFields = createCommonFields(ticketData?.previousTicket, true)
        setMiddleSectionData([ {
          label: t("TICKET_ID"),
          value: ticketData?.previousTicket?.ticketId,
          colProps: { xs: 12, className: "py-2" },
        },
        ...middleCommonFields,
        {
          value: (
            <Stack direction="horizontal" gap={1}>
              <span>
                <MdAttachFile size={16} />
              </span>
              <button
                onClick={() => handleAttachmentsClick("FIRST_INSTANCE")}
                className="fw-semibold text-decoration-none text-info btn p-0"
              >
                {t("ATTACHMENTS")}
              </button>
            </Stack>
          ),
          colProps: { sm: 6 },
        },
        {
          label: t("PRECEDENTS"),
          value: ticketData?.previousTicket?.precedents,
          colProps: { xs: 12, className: "py-2" },
        },
        {
          label: t("SPECIFIC_PETITION"),
          value: ticketData?.previousTicket?.specificPetition ?? "N/A",
          colProps: { xs: 12 },
        },])
      }
    }
  }, [ticketData]);


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
          (permissionsState?.priorityPermission === true && (ticketData?.status !== "CLOSED" && ticketData?.status !== "REJECTED")) ?
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
    ...(ticketData?.slaPopup !== null
      ? [
        {
          // label: t("CONSUMER_INFO"),
          value: <Link onClick={(event) => { setShowReminderModal(true); event.preventDefault() }} className='text-decoration-none'>Provide SLA Comment</Link>,
          colProps: { sm: 6 },
        },
      ]
      : []),
    ...(ticketData?.createdByUser?.id !== ticketData?.user?.id
      ? [
        {
          label: t("CONSUMER_INFO"),
          value: <Link onClick={handleConsumerInfoClick} className='text-decoration-none'>{ticketData?.user?.name}</Link>,
          colProps: { sm: 6 },
        },
      ]
      : []),
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
    ...(ticketData?.slaComment !== null
      ? [
        {
          label: t("SLA_COMMENT"),
          value: <p className='text-decoration-none text-secondary fw-bold'> {ticketData?.slaComment}</p>,
          colProps: { sm: 6 },
        },
      ]
      : [])
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
    ...(ticketData?.secondInstanceSlaComment !== null
      ? [
        {
          label: t("SLA_COMMENT"),
          value: <p className='text-decoration-none text-secondary fw-bold'> {ticketData?.secondInstanceSlaComment}</p>,
          colProps: { sm: 6 },
        },
      ]
      : [])
  ];

  const viewComplaintData = [
    {
      label: t("CREATED_ON"),
      value: ticketData?.complaintFiledAt ? moment(ticketData?.complaintFiledAt).format("DD-MM-YYYY | hh:mm:a") : '',
      colProps: { sm: 6 }
    },
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
    ...(ticketData?.complaintSlaComment !== null
      ? [
        {
          label: t("SLA_COMMENT"),
          value: <p className='text-decoration-none text-secondary fw-bold'> {ticketData?.complaintSlaComment}</p>,
          colProps: { sm: 6 },
        },
      ]
      : [])
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
          permissionState={permissionsState}
        />}
        <div className='d-flex flex-column flex-grow-1 mh-100 overflow-x-hidden pb-3'>
          <Row className='h-100 gy-3 gy-lg-0 gx-3'>
            <Col lg={6} className='mh-100 d-flex flex-column'>
              <Card className="border-0 shadow h-100 custom-min-height-200 overflow-auto">
                <Card.Body>
                  <Row>
                    {topSectionData?.map((item, index) => (
                      <Col key={"data_view_" + index} {...item.colProps}>
                        <CommonViewData label={item.label} value={item.value} />
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
              {/* SECOND INSTANCE DETAILS */}
              {
                (ticketData?.previousTicket) &&
                <Card className="border-0 card custom-min-height-200 flex-grow-1 mh-100 mt-3 overflow-auto shadow">
                  <Card.Body className='mh-100'>
                    <h5 className='custom-font-size-18 fw-semibold mb-3'>{t("FIRST_INSTANCE_CLAIM_DETAILS")}</h5>
                    <Row>
                      {middleSectionData?.map((item, index) => (
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
                <TicketTabsSection ticketId={ticketData?.id} setIsGetAcitivityLogs={setIsGetAcitivityLogs} ticketData={ticketData} getTicketData={getTicketDetails} permissionState={permissionsState} />
              </Card>
              <ActivityLogs setLoading={setLoading} ticketId={id} isGetActivityLogs={isGetActivityLogs} permissionState={permissionsState} />
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
        permissionState={permissionsState}
      />
      {
        ticketData?.slaPopup !== null &&
        <SlaReminderModal
          ticketData={ticketData}
          showModal={showReminderModal}
          toggle={toggleSLAReminder}
          getTicketData={getTicketDetails}
        />
      }

    </React.Fragment>
  )
}

export default TicketsView