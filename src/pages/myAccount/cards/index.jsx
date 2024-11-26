import React, { useEffect, useState } from 'react';
import { Col, Row, Stack } from 'react-bootstrap';
import { fileClaimStats } from '../../../redux/slice/fileClaimSlice';
import { useDispatch } from 'react-redux';

const InfoCards = ({ cardsData }) => {

  const dispatch = useDispatch()
  const [loading , setLoading] = useState(false)
  const [claimStatsData , setClaimsStatsData] = useState([])

  const getClaimStats = async() => {
    const result = await dispatch(fileClaimStats());
    if (fileClaimStats.fulfilled.match(result)) {
      setClaimsStatsData(result?.payload)
    } else {
      console.error('Verification error:', result.error.message);
    }
  }

  useEffect(()=>{
    // getClaimStats()
  },[])

  return (
    <Row className='g-3 g-lg-4'>
      {cardsData.map((card, index) => (
        <Col key={index} {...card.colProps}>
          <Stack
            gap={2}
            className={`align-items-center p-3 text-white rounded-3 h-100 ${card.bgColor || 'bg-primary'}`}
          >
            <span className="custom-width-64 custom-height-64 flex-shrink-0 d-flex align-items-center justify-content-center bg-white bg-opacity-25 rounded-pill mt-1">
              {card.Icon}
            </span>
            <div className="custom-font-size-30 lh-sm">{card.value}</div>
            <div className="lh-sm fw-semibold">{card.title}</div>
          </Stack>
        </Col>
      ))}
    </Row>
  );
};

export default InfoCards;