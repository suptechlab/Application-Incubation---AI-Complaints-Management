import React, { useContext } from 'react';
import { Col, Row, Stack } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { MdConfirmationNumber, MdHourglassEmpty, MdPending, MdTaskAlt } from "react-icons/md";
import { AuthenticationContext } from '../contexts/authentication.context';


const InfoCards = ({claimStatsData , rowClassName = 'g-3 g-lg-4' }) => {
  const {t} = useTranslation()

  const {currentUser, userData} = useContext(AuthenticationContext)

  const isFiAgent = currentUser==='FI_USER' && userData?.roles &&  userData?.roles?.length > 0 && userData?.roles[0]?.name !== 'Fi Admin';
  const cardsData = [
    {
      bgColor: 'bg-primary',
      Icon: <MdConfirmationNumber size={24} />,
      title: isFiAgent ? t('ASSIGNED_TICKETS') : t('NEW_TICKETS'),
      value: isFiAgent 
        ? claimStatsData?.countsByStatus?.ASSIGNED 
        : claimStatsData?.countsByStatus?.NEW,
      colProps: { sm: 6, lg: 3 }
    },
    {
      bgColor: 'bg-orange',
      Icon: <MdHourglassEmpty size={24} />,
      title: t('TICKETS_IN_PROGRESS'), 
      value: claimStatsData?.countsByStatus?.IN_PROGRESS,
      colProps: { sm: 6, lg: 3 }
    },
    {
      bgColor: 'bg-danger',
      Icon: <MdPending size={24} />,
      title: t('REJECTED_TICKETS'), // Direct translation key
      value: claimStatsData?.countsByStatus?.REJECTED,
      colProps: { sm: 6, lg: 3 }
    },
    {
      bgColor: 'bg-success',
      Icon: <MdTaskAlt size={24} />,
      title: t('CLOSED_TICKETS'), // Direct translation key
      value: claimStatsData?.countsByStatus?.CLOSED,
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