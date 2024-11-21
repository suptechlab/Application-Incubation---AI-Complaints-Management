import React, { useState } from 'react';
import { Card, Col, Dropdown, Image, Row, Stack } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { MdArrowDropDown, MdAttachFile, MdCalendarToday } from 'react-icons/md';
import { Link } from 'react-router-dom';
import defaultAvatar from "../../../assets/images/default-avatar.jpg";
import CommonViewData from '../../../components/CommonViewData';
import Loader from '../../../components/Loader';
import AppTooltip from '../../../components/tooltip';
import AttachmentsModal from '../modals/attachmentsModal';
import UserInfoModal from '../modals/userInfoModal';
import TicketViewHeader from './header';
import TicketTabsSection from './tabs';

const TicketsView = () => {
  const { t } = useTranslation();
  const [selectedPriority, setSelectedPriority] = useState('Low');
  const [userInfoModalShow, setUserInfoModalShow] = useState(false);
  const [attachmentsModalShow, setAttachmentsModalShow] = useState(false);

  // Function to handle dropdown item selection
  const handleSelect = (priority) => {
    setSelectedPriority(priority);
  };

  // The color class based on the priority level
  const priorityOptions = ['Low', 'Medium', 'High', 'NIL'];
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Low':
        return 'text-success';
      case 'Medium':
        return 'text-orange';
      case 'High':
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
      value: "07-10-24 | 03:33 pm",
      colProps: { sm: 6 }
    },
    {
      label: "Due Date",
      value: "07-26-24 | 05:30 pm",
      colProps: { sm: 6 }
    },
    {
      label: "Claim filed by",
      value: <Link onClick={handleUserInfoClick} className='text-decoration-none'>Veronica Andres</Link>,
      colProps: { sm: 6 }
    },
    {
      label: "Priority",
      value: (<Stack direction='horizontal' gap={1}>
        <span className={`custom-min-width-50 fw-bold ${getPriorityClass(selectedPriority)}`}>{selectedPriority}</span>
        {/* Dropdown FILTER */}
        <Dropdown>
          <Dropdown.Toggle
            variant="link"
            id="filter-dropdown"
            className="link-dark p-1 ms-n1 hide-dropdown-arrow lh-1"
          >
            <AppTooltip title="Change Priority" placement="top">
              <span><MdArrowDropDown size={14} /></span>
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
      value: "Credit Portfolio",
      colProps: { sm: 6 }
    },
    {
      label: "Claim Sub Type",
      value: "Refinancing Request",
      colProps: { sm: 6 }
    },
    {
      label: "Agent",
      value: "John Duo",
      colProps: { sm: 6 }
    },
    {
      label: "Team",
      value: "Finance -1 Team",
      colProps: { sm: 6 }
    },
    {
      value: (<Stack direction='horizontal' gap={1}>
        <span><MdAttachFile size={16} /></span>
        <Link onClick={handleAttachmentsClick} className='fw-semibold text-decoration-none'>Attachments</Link>
      </Stack>),
      colProps: { xs: 12, className: "pb-4" }
    },
    {
      label: "Precedents",
      value: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s book.",
      colProps: { xs: 12, className: "py-2" }
    },
    {
      label: "Specific Petition",
      value: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      colProps: { xs: 12 }
    },
  ];

  return (
    <React.Fragment>
      <Loader isLoading={false} />
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        <TicketViewHeader
          title="#52541"
        />
        <div className='d-flex flex-column flex-grow-1'>
          <Row className='h-100 gy-3 gy-lg-0 gx-3 pb-3'>
            <Col lg={6}>
              <Card className="border-0 shadow h-100">
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
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow">
                <Card.Header className='bg-body border-0 py-3'>
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
              <Card className="border-0 shadow mt-3">
                <Card.Body>
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
                      <div className='fw-bold'>John Smith <span className='fw-normal'>added Internal Note</span></div>
                      <Stack direction='horizontal' gap={2} className='text-secondary'>
                        <span className='d-inline-flex'><MdCalendarToday size={12} /></span>
                        <span>07-14-24 | 10:00 am </span>
                      </Stack>
                      <p className='mt-2 mb-0'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        <div className="theme-from-footer mt-auto border-top px-3 mx-n3 pt-3 bg-body">
          <Stack
            direction="horizontal"
            gap={3}
            className="justify-content-end flex-wrap"
          >
            <Link
              to={"/tickets"}
              className="btn btn-outline-dark custom-min-width-85"
            >
              {t("BACK")}
            </Link>

          </Stack>
        </div>
      </div>

      {/* User Info Modals */}
      <UserInfoModal
        modal={userInfoModalShow}
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