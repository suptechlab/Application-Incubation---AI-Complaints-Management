import React, { useEffect, useState } from 'react';
import { Col, Row, Stack } from 'react-bootstrap';

const InfoCards = ({ cardsData, rowClassName = 'g-3 g-lg-4' }) => {


  const [claimStatsData, setClaimsStatsData] = useState([])


  // GET CLAIM TYPE DROPDOWN LIST
  const getClaimTypeStatsData = () => {
    // claimTypesDropdownList().then(response => {
    //   setClaimTypes(response?.data)
    // }).catch((error) => {
    //   if (error?.response?.data?.errorDescription) {
    //     toast.error(error?.response?.data?.errorDescription);
    //   } else {
    //     toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
    //   }
    // })
  }

  useEffect(() => {
    getClaimTypeStatsData()
  }, [])


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