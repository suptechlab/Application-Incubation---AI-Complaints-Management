import React, { useState } from 'react';
import { Button, Card, Col, Dropdown, Image, Row, Stack } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { MdArrowDropDown, MdAttachFile, MdCalendarToday } from 'react-icons/md';
import { Link } from 'react-router-dom';
import CommonViewData from '../../../components/CommonViewData';
import Loader from '../../../components/Loader';
import AppTooltip from '../../../components/tooltip';
import TicketViewHeader from './header';
import defaultAvatar from "../../../assets/images/default-avatar.jpg";

const TicketsView = () => {
  const { t } = useTranslation();
  const [selectedPriority, setSelectedPriority] = useState('Low');
  const [fileName, setFileName] = useState("");

  //Handle File Change
  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("Fi_Users_data.xlsx");
    }
  };

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
      value: <Link to="/" className='text-decoration-none'>Veronica Andres</Link>,
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
        <Link className='fw-semibold text-decoration-none'>Attachments</Link>
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
    <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
      <Loader isLoading={false} />
      <TicketViewHeader
        title="#52541"
      />
      <div className='d-flex flex-column flex-grow-1 overflow-y-auto overflow-x-hidden visible-in-small-devices pb-4'>
        <Row className='h-100 g-3'>
          <Col lg={6} className='h-100'>
            <Card className="border-0 flex-grow-1 d-flex flex-column shadow h-100">
              <Card.Body className="d-flex flex-column h-100 overflow-auto">
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
          <Col lg={6} className='h-100'>
            <Card className="border-0 shadow">
              <Card.Header className='bg-body border-0 py-3'>
                <Row className='g-2 align-items-center'>
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
              <Card.Body>
                Body
                {fileName && (
                  <div className='mx-n3 px-3 mt-3 mb-n2'>
                    <Link
                      target="_blank"
                      to="/fi-users/import"
                      className="text-decoration-none small mw-100 text-break"
                    >
                      {fileName}
                    </Link>
                  </div>
                )}
              </Card.Body>
              <Card.Footer className='bg-body py-3'>
                <Stack direction='horizontal' gap={2} className='flex-wrap'>
                  <div className="overflow-hidden position-relative z-1 flex-shrink-0 me-auto">
                    <label
                      htmlFor="files"
                      className="small link-info align-middle cursor-pointer"
                    >
                      <span className='align-text-bottom'><MdAttachFile size={16} /></span> Add attachment
                    </label>
                    <input
                      id="files"
                      accept="image/png, image/jpeg, image/jpg"
                      className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                      type="file"
                      onChange={handleFileChange}
                    />
                  </div>
                  <Button
                    type='button'
                    size="sm"
                    variant='outline-dark'
                  >
                    Reply to Customer
                  </Button>
                  <Button
                    type='button'
                    size="sm"
                    variant='warning'
                  >
                    Reply Internally
                  </Button>
                </Stack>
              </Card.Footer>
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
  )
}

export default TicketsView