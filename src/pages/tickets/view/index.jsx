import moment from 'moment/moment';
import React, { useContext, useEffect, useState } from 'react';
import { Card, Col, Dropdown, Image, Row, Stack } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { MdArrowDropDown, MdAttachFile, MdCalendarToday } from 'react-icons/md';
import { Link, useParams } from 'react-router-dom';
import defaultAvatar from "../../../assets/images/default-avatar.jpg";
import CommonViewData from '../../../components/CommonViewData';
import AppTooltip from '../../../components/tooltip';
import { AuthenticationContext } from '../../../contexts/authentication.context';
import { MasterDataContext } from '../../../contexts/masters.context';
import { changeTicketPriority, ticketDetailsApi } from '../../../services/ticketmanagement.service';
import AttachmentsModal from '../modals/attachmentsModal';
import ConsumerInfoModal from '../modals/consumerInfoModal';
import SlaReminderModal from '../modals/slaReminderModal';
import UserInfoModal from '../modals/userInfoModal';
import ActivityLogs from './activity-logs';
import TicketViewHeader from './header';
import TicketTabsSection from './tabs';


const TicketsView = () => {

  const { currentUser, permissions = {}, profileImage } = useContext(AuthenticationContext);

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

  const [isGetActivityLogs, setIsGetActivityLogs] = useState(true)

  const [selectedPriority, setSelectedPriority] = useState('LOW');
  const [userInfoModalShow, setUserInfoModalShow] = useState(false);
  const [consumerInfoModalShow, setConsumerInfoModalShow] = useState(false);
  const [attachmentsModalShow, setAttachmentsModalShow] = useState(false);
  const [currentInstance, setCurrentInstance] = useState('')
  const [attachmentPosition, setAttachmentPosition] = useState('')

  const [loading, setLoading] = useState(false)

  const [activityLoading, setActivityLoading] = useState(false)

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
    setActivityLoading(true)
    if (priority && priority !== '') {
      changeTicketPriority(id, priority).then(response => {
        setSelectedPriority(priority);
        setIsGetActivityLogs((prev) => !prev)
      }).catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message ?? "FAILED TO FETCH TICKET DETAILS");
        }
      }).finally(() => {
        setActivityLoading(false)
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
  const priorityOptions = ['LOW', 'MEDIUM', 'HIGH'];

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
          {(permissionsState?.priorityPermission && !isPrevData &&
            (
            (currentUser === 'FI_USER' && ticketData?.instanceType === 'FIRST_INSTANCE') ||
            ((currentUser === 'SEPS_USER' || currentUser === 'SYSTEM_ADMIN') && (ticketData?.instanceType === 'SECOND_INSTANCE' || ticketData?.instanceType === 'COMPLAINT'))) &&
       
            !["CLOSED", "REJECTED"].includes(commonData?.status)) ? (
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
                    </span>
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
                commonData?.priority
              )}`}
            >
              {masterData?.claimTicketPriority[commonData?.priority]}
            </span>
          )}
        </Stack>
      ),
      colProps: { sm: 6 },
    },

    ...(!isPrevData ? [
      {
        label: t("CLAIM TYPE"),
        value: commonData?.claimType?.name,
        colProps: { sm: 6 },
      }
    ] : [])
    ,
    ...(!isPrevData ? [{
      label: t("CLAIM_SUB_TYPE"),
      value: commonData?.claimSubType?.name,
      colProps: { sm: 6 },
    }] : []),
    {
      label: t("AGENT"),
      value: commonData?.instanceType === 'FIRST_INSTANCE' ? commonData?.fiAgent?.name ?? "N/A" : commonData?.sepsAgent?.name ?? 'N/A',
      colProps: { sm: 6 },
    },
    {
      label: t("SOURCE"),
      value: commonData?.source,
      colProps: { sm: 6 },
    },
    {
      label: t("CHANNEL_OF_ENTRY"),
      value: commonData?.channelOfEntry,
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
              {t("PROVIDE_SLA_COMMENT")}
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

      if (ticketData?.team) {
        fields.push({
          label: t("TEAM"),
          value: ticketData?.team ?? "N/A",
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

      if (ticketData?.secondInstanceSlaComment) {
        fields.push({
          label: t("SLA_COMMENT"),
          value: (
            <p className="text-decoration-none text-secondary fw-bold">
              {ticketData?.secondInstanceSlaComment}
            </p>
          ),
          colProps: { sm: 6 },
        });
      }

      return fields;
    };

    const createAttachmentField = (instanceType, position) => ({
      value: (
        <Stack direction="horizontal" gap={1}>
          <span>
            <MdAttachFile size={16} />
          </span>
          <button
            onClick={() => handleAttachmentsClick(instanceType, position)}
            className="fw-semibold text-decoration-none text-info btn p-0"
          >
            {t("ATTACHMENTS")}
          </button>
        </Stack>
      ),
      colProps: { sm: 6 },
    });

    const createInstanceFields = (instanceData, instanceType, position) => [
      {
        label: t("TICKET_ID"),
        value: <Link target='_blank' to={`/tickets/view/${instanceData?.id}`} className=''>#{instanceData?.ticketId}</Link>,
        colProps: { xs: 6, className: "py-2" },
      },
      ...createCommonFields(instanceData, true),
      createAttachmentField(instanceType, position),

      ...(instanceType === "COMPAINT" || instanceType === "FIRST_INSTANCE"
        ? [
            {
              label: t("PRECEDENTS"),
              value: instanceData?.precedents,
              colProps: { xs: 12, className: "py-2" },
            },
            {
              label: t("SPECIFIC_PETITION"),
              value: instanceData?.specificPetition ?? "N/A",
              colProps: { xs: 12 },
            },
          ]
        : []),
    
      ...(instanceType === "SECOND_INSTANCE"
        ? [
            {
              label: t("COMMENT"),
              value: instanceData?.secondInstanceComment,
              colProps: { xs: 12, className: "py-2" },
            },
          ]
        : []),
      // {
      //   label: t("PRECEDENTS"),
      //   value: instanceData?.precedents,
      //   colProps: { xs: 12, className: "py-2" },
      // },
      // {
      //   label: t("SPECIFIC_PETITION"),
      //   value: instanceData?.specificPetition ?? "N/A",
      //   colProps: { xs: 12 },
      // },

      // {
      //   label: t("COMMENT"),
      //   value: instanceData?.secondInstanceComment,
      //   colProps: { xs: 12, className: "py-2" },
      // },
    ];

    const buildSections = () => {
      const topFields = addConditionalFields(createCommonFields(ticketData, false));

      if (ticketData?.instanceType === "FIRST_INSTANCE") {
        setTopSectionData([
          ...topFields,
          {
            label: t("ENTITY NAME"),
            value: ticketData?.organization?.razonSocial,
            colProps: { xs: 6, className: "py-2" },
          },
          createAttachmentField("FIRST_I6NSTANCE", 'TOP'),
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
        ]);
      } else if (ticketData?.instanceType === "SECOND_INSTANCE") {
        setTopSectionData([
          ...topFields,
          {
            label: t("ENTITY NAME"),
            value: ticketData?.organization?.razonSocial,
            colProps: { xs: 6, className: "py-2" },
          },
          createAttachmentField("SECOND_INSTANCE", "TOP"),
          {
            label: t("COMMENT"),
            value: ticketData?.secondInstanceComment,
            colProps: { xs: 12, className: "py-2" },
          },
        ]);

        if (ticketData?.previousTicket) {
          setMiddleSectionData(createInstanceFields(ticketData?.previousTicket, "FIRST_INSTANCE", "MIDDLE"));
        }
      } else if (ticketData?.instanceType === "COMPLAINT") {
        setTopSectionData([
          ...topFields,
          {
            label: t("ENTITY NAME"),
            value: ticketData?.organization?.razonSocial,
            colProps: { xs: 6, className: "py-2" },
          },
          createAttachmentField("COMPLAINT", "TOP"),
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
        ]);

        if (ticketData?.previousTicket) {
          setMiddleSectionData(createInstanceFields(ticketData?.previousTicket, "SECOND_INSTANCE", "MIDDLE"));

          if (ticketData?.previousTicket?.previousTicket) {
            setBottomSectionData(createInstanceFields(ticketData?.previousTicket?.previousTicket, "FIRST_INSTANCE", "BOTTOM"));
          }
        }
      }
    };

    buildSections();
  }, [ticketData, selectedPriority]);

  // The color class based on the priority level
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
  const handleAttachmentsClick = (instance_type, position) => {
    setCurrentInstance(instance_type)
    setAttachmentsModalShow(true)
    setAttachmentPosition(position)
  }

  return (
    <React.Fragment>
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">

        <TicketViewHeader
          title={"#" + ticketData?.ticketId && ticketData?.ticketId !== undefined ? ticketData?.ticketId : ''}
          ticketData={ticketData}
          setIsGetActivityLogs={setIsGetActivityLogs}
          getTicketData={getTicketDetails}
          permissionState={permissionsState}
          loading={loading}
          setLoading={setLoading}
        />

        <div className='pb-3'>
          <Row className='gy-3 gy-lg-0 gx-3'>
            {loading && loading === true ? <Col lg={6} className="placeholder-glow custom-min-height-200">
              <div className="placeholder w-100 h-100"></div>
            </Col> :
              <Col lg={6}>
                <Card className="border-0 shadow custom-min-height-200">
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
                  <Card className="border-0 card custom-min-height-200 mt-3 shadow">
                    <Card.Body className='mh-100'>
                      <h5 className='custom-font-size-18 fw-semibold mb-3'>
                        {t({
                          FIRST_INSTANCE: "FIRST_INSTANCE_CLAIM_DETAILS",
                          SECOND_INSTANCE: "SECOND_INSTANCE_CLAIM_DETAILS",
                        }[ticketData?.previousTicket?.instanceType] || "COMPLAINT_DETAILS")}
                      </h5>

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
                  (bottomSectionData && bottomSectionData?.length > 0) &&
                  <Card className="border-0 card custom-min-height-200 mt-3 shadow">
                    <Card.Body className='mh-100'>
                      <h5 className='custom-font-size-18 fw-semibold mb-3'>{t("FIRST_INSTANCE_CLAIM_DETAILS")}</h5>
                      <Row>
                        {bottomSectionData?.map((item, index) => (
                          <Col key={"data_view_" + index} {...item.colProps}>
                            <CommonViewData label={item.label} value={item.value} />
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Card>
                }
              </Col>
            }
            <Col lg={6}>
              <Card className="border-0 shadow">
                <Card.Header className='bg-body border-0 py-3'>
                  {/* REPLY SECTION */}
                  <Row className='g-2'>
                    <Col xs="auto">
                      <Image
                        className="object-fit-cover rounded-circle"
                        src={profileImage && profileImage!=="" ? profileImage : defaultAvatar}
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
                <TicketTabsSection ticketId={ticketData?.id} setIsGetActivityLogs={setIsGetActivityLogs} ticketData={ticketData} getTicketData={getTicketDetails} permissionState={permissionsState} />
              </Card>
              <ActivityLogs ticketId={id} isGetActivityLogs={isGetActivityLogs} permissionState={permissionsState} activityLoading={activityLoading} setActivityLoading={setActivityLoading} />
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
        attachmentPosition={attachmentPosition}
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