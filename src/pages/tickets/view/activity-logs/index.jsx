import React, { useEffect, useState } from "react";
import { Card, Col, Image, ListGroup, Row, Stack } from "react-bootstrap";
import { MdCalendarToday } from "react-icons/md";
import { Link } from "react-router-dom";
import defaultAvatar from "../../../../assets/images/default-avatar.jpg";
import { ticketActivityLogs } from "../../../../services/ticketmanagement.service";
import toast from "react-hot-toast";
import moment from "moment";
const ActivityLogs = ({ setLoading, ticketId }) => {

  const [ticketActivity, setTicketActivity] = useState([])

  function replaceLinkedUserPlaceholders(activityTitle, linkedUsers) {
    const parts = activityTitle.split(/(@\d+)/g); // Split on @<id>
    return parts.map((part, index) => {
      const match = part.match(/^@(\d+)$/); // Match @<id>
      if (match) {
        const id = match[1];
        const user = linkedUsers[id] || `@${id}`;
        return (
          <span key={index} className="text-primary fw-bold">
            {user}
          </span>
        );
      }
      return part; // Return plain text for non-placeholder parts
    });
  }

  // GET TICKET DETAILS
  const getTicketActivityLogs = () => {
    setLoading(true)
    const params = { sort: 'performedAt,desc' }
    ticketActivityLogs(ticketId, params).then(response => {
      if (response?.data) {
        const logData = response?.data?.map((activity, index) => {
          console.log({ Transformed: replaceLinkedUserPlaceholders(activity.activityTitle, activity.linkedUsers) })
          return {
            id: activity?.ticketId,
            // name: activity?.activityDetails?.performBy?.name ? getPerformerName(activity?.activityDetails?.performBy?.name, activity?.activityType) : "",
            action: replaceLinkedUserPlaceholders(activity.activityTitle, activity.linkedUsers),
            date: moment(activity?.performedAt).format("DD-MM-YYYY | hh:mm:a"),
            message: <>{activity?.activityDetails?.text}</>,
            avatar: activity?.user?.imageUrl ??  defaultAvatar,
            variant: '',
          }
        })
        setTicketActivity(logData)
        // setSelectedPriority(response?.data?.priority)
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

  console.log(ticketActivity)

  useEffect(() => {
    getTicketActivityLogs()
  }, [ticketId])


  //Chat Reply Data
  const chatReplyData = [
    {
      id: 1,
      name: "John Smith",
      action: <>added Internal Note</>,
      date: "07-14-24 | 10:00 am",
      message: <>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</>,
      avatar: defaultAvatar,
      variant: '',
    },
    {
      id: 2,
      name: "John Smith",
      action: <>replied & tagged <Link to="/" className='text-decoration-none fw-bold'>Kyle</Link></>,
      date: "07-14-24 | 10:00 am",
      message: <>Thanks i will update <Link to="/" className='text-decoration-none'>@Kyle</Link> about the same.</>,
      avatar: defaultAvatar,
      variant: '',
    },
    {
      id: 3,
      name: "Carlos P",
      action: <>replied</>,
      date: "07-14-24 | 10:00 am",
      message: <>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</>,
      avatar: defaultAvatar,
      variant: '',
    },
    {
      id: 4,
      name: "Carlos P",
      action: <>added Resolution Note and mark it Resolved</>,
      date: "14-07-24 | 9:11 am",
      message: <>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer.</>,
      avatar: defaultAvatar,
      variant: 'Resolved',
    },
    {
      id: 5,
      name: "Mic Johns",
      action: <>added Internal Note</>,
      date: "14-07-24 | 9:10 am",
      message: <>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text.</>,
      avatar: defaultAvatar,
      variant: 'In Progress',
    },
  ];

  // The color class based on the status
  const getReplyStatusClass = (status) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-custom-pink p-2 rounded';
      case 'IN_PROGRESS':
        return 'bg-custom-yellow p-2 rounded';
      case 'NEW':
        return 'bg-custom-primary p-2 rounded';
      case 'REJECTED':
        return 'bg-custom-danger p-2 rounded';
      default:
        return '';
    }
  };
  return <Card className="border-0 card custom-min-height-200 flex-grow-1 mh-100 mt-3 overflow-auto shadow">
    <Card.Body className='py-0'>
      <ListGroup variant="flush">
        {ticketActivity.map((reply) => (
          <ListGroup.Item key={reply.id} className='py-3'>
            <Row className='g-2'>
              <Col xs="auto">
                <Image
                  className="object-fit-cover rounded-circle"
                  src={ reply.avatar}
                  width={36}
                  height={36}
                  alt={reply?.name}
                />
              </Col>
              <Col xs className='small lh-sm'>
                <div className='fw-bold'>{reply?.name} <span className='fw-normal'>{reply.action}</span></div>
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
  </Card>;
};

export default ActivityLogs;
