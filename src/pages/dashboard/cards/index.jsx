import React from "react";
import { Button, Card, Col, Row, Stack } from "react-bootstrap";
import { BsPersonCheckFill } from "react-icons/bs";
import { CiCircleInfo } from "react-icons/ci";
import { MdBorderColor, MdCurrencyPound, MdFilterListAlt, MdGroup } from "react-icons/md";


export const cardDataList = [
  {
    id: 1,
    bg: "primary",
    icon: <MdGroup size={16} />,
    title: "Total New Users",
    subtitle: "337",
    className: "total_new_users"
  },
  {
    id: 2,
    bg: "primary",
    icon: <MdGroup size={16} />,
    title: <Stack direction="horizontal" gap={2}>
      <span>New Users</span>
      <div className="fs-14 me-auto on_trail">On Trial</div>

    </Stack>,
    subtitle: "Product Count",
    className: "new_users_trial"
  },
  {
    id: 3,
    bg: "primary",
    icon: <MdGroup size={16} />,
    title: <Stack direction="horizontal" gap={2}>
      <span>New Users</span>
      <div className="fs-14 me-auto paid">Paid</div>

    </Stack>,
    subtitle: "Products in Cart",
    className: "new_users_paid"
  },
  {
    id: 4,
    bg: "primary",
    icon: <MdGroup size={16} />,
    title: <Stack direction="horizontal" gap={2}>
      <span>New Users</span>
      <div className="fs-14 me-auto free">Free</div>

    </Stack>,
    subtitle: "Post Count",
    className: "new_users_free"
  },
  {
    id: 5,
    bg: "primary",
    icon: <MdBorderColor size={16} />,
    title: <Stack direction="horizontal" gap={2}>
      <span>Total Registered Users</span>
      <Button type="button" variant="link" className="border-0 p-0 lh-1"><CiCircleInfo size={16} /></Button>
    </Stack>,
    subtitle: "User Active Status",
    className: "registered_users"
  },
  {
    id: 6,
    bg: "primary",
    icon: <BsPersonCheckFill size={16} />,
    title: <Stack direction="horizontal" gap={2}>
      <span>Revenue</span>
      <Button type="button" variant="link" className="border-0 p-0 lh-1"><CiCircleInfo size={16} /></Button>
    </Stack>,
    subtitle: "Product Count",
    className: "active_users"
  },
  {
    id: 7,
    bg: "primary",
    icon: <MdCurrencyPound size={16} />,
    title: <Stack direction="horizontal" gap={2}>
      <span>Revenue</span>
      <div className="fs-14 me-auto current_month-pack">Current Month</div>
      <Button type="button" variant="link" className="border-0 p-0 lh-1"><MdFilterListAlt size={16} /></Button>
    </Stack>,
    subtitle: "Products in Cart",
    className: "revenue"
  },
  {
    id: 8,
    bg: "primary",
    icon: <MdCurrencyPound size={16} />,
    title: 0,
    subtitle: "Post Count",
    className: "customer_churn_rate"

  }
]

export const InfoCard = ({ bg, icon, title, subtitle, className }) => {
  return (
    <Card className="rounded-3 h-100 bg-opacity-25 border-0" >
      <Card.Body>
        <Stack direction="horizontal" gap={3}>
          <div className={`${className} rounded-pill custom-width-38 custom-height-38 d-flex`}>
            <span className="m-auto">
              {icon}
            </span>
          </div>

          <div className="flex-grow-1">
            <Card.Title className="fs-14 fw-normal ">{title}</Card.Title>
            <Card.Subtitle className="fw-semibold fs-20">{subtitle}</Card.Subtitle>
          </div>
        </Stack>
      </Card.Body>
    </Card>
  )
}

export const CardData = () => {
  return (
    <Row className="g-4 mb-4">
      {cardDataList.map(cardData => {
        const { id, bg, icon, title, subtitle, className } = cardData
        return (
          <Col key={id} sm={6} lg={4} xxl={3}>
            <InfoCard className={className} bg={bg} icon={icon} title={title} subtitle={subtitle} />
          </Col>
        )
      })}
    </Row>
  )
}
