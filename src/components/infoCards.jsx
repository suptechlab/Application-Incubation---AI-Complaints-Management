import React, { useEffect, useState } from 'react';
import { Col, Row, Stack } from 'react-bootstrap';
import { ticketOverviewAPI } from '../services/ticketmanagement.service';
import toast from 'react-hot-toast';
import { MdAttachFile, MdConfirmationNumber, MdHourglassEmpty, MdPending, MdTaskAlt } from "react-icons/md";


const InfoCards = ({claimStatsData , rowClassName = 'g-3 g-lg-4' }) => {


  const cardsData = [
    {
      bgColor: 'bg-primary',
      Icon: <MdConfirmationNumber size={24} />,
      title: 'New Tickets',
      value:claimStatsData?.countsByStatus?.NEW,
      colProps: { sm: 6, lg: 3 }
    },
    {
      bgColor: 'bg-orange',
      Icon: <MdHourglassEmpty size={24} />,
      title: 'Tickets in Progress',
      value:claimStatsData?.countsByStatus?.IN_PROGRESS,
      colProps: { sm: 6, lg: 3 }
    },
    {
      bgColor: 'bg-danger',
      Icon: <MdPending size={24} />,
      title: 'Rejected Tickets',
      value:claimStatsData?.countsByStatus?.REJECTED,
      colProps: { sm: 6, lg: 3 }
    },
    {
      bgColor: 'bg-success',
      Icon: <MdTaskAlt size={24} />,
      title: 'Closed Tickets',
     value:claimStatsData?.countsByStatus?.CLOSED,
      colProps: { sm: 6, lg: 3 }
    },
  ];




  return (
    <Row className={rowClassName}>
      {cardsData.map((card, index) => (
        <Col key={index} {...card.colProps}>
          <Stack
            direction="horizontal"
            gap={2}
            className={`p-3 text-white rounded h-100 ${card.bgColor || 'bg-primary'}`}
          >
            <span className="custom-width-48 custom-height-48 flex-shrink-0 d-flex align-items-center justify-content-center bg-white bg-opacity-25 rounded-pill me-1">
              {card.Icon}
            </span>
            <Stack className='my-auto'>
              <div className="lh-sm">{card.title}</div>
              <div className="custom-font-size-30 lh-sm">{card.value}</div>
            </Stack>
          </Stack>
        </Col>
      ))}
    </Row>
  );
};

export default InfoCards;