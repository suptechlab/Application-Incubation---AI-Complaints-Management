import React, { useEffect, useState } from 'react';
import { Col, Row, Stack } from 'react-bootstrap';
import { MdEditDocument, MdTask } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { fileClaimStats } from '../../../redux/slice/fileClaimSlice';
import SvgIcons from '../../../components/SVGIcons';
const InfoCards = ({filter,setLoading}) => {

  const dispatch = useDispatch()
  const [claimStatsData , setClaimsStatsData] = useState([])

  const getClaimStats = async () => {
    try {
      const params = filter?.year ? { year: filter.year } : {};
      const result = await dispatch(fileClaimStats(params));
  
      if (fileClaimStats?.fulfilled?.match(result)) {
        setClaimsStatsData(result.payload);
      } else {
        console.error('Stats error:', result?.error?.message);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }finally{
      setLoading(false)
    }
  };

  useEffect(()=>{
    getClaimStats()
  },[filter?.year])

  // Info Cards Data
  const cardsData = [
    {
      bgColor: 'bg-primary',
      Icon: <MdEditDocument size={30} />,
      title: 'Total Claims',
      value: claimStatsData?.totalClaims,
      colProps: { sm: 6, lg: 3 }
    },
    {
      bgColor: 'bg-orange',
      Icon: SvgIcons.fileInfoIcon,
      title: 'Claims in Progress',
      value: claimStatsData?.countsByStatus?.IN_PROGRESS,
      colProps: { sm: 6, lg: 3 }
    },
    {
      bgColor: 'bg-success',
      Icon: <MdTask size={30} />,
      title: 'Claims Closed',
      value: claimStatsData?.countsByStatus?.CLOSED,
      colProps: { sm: 6, lg: 3 }
    },
    {
      bgColor: 'bg-danger',
      Icon: SvgIcons.fileCloseIcon,
      title: 'Claims Rejected',
      value: claimStatsData?.countsByStatus?.REJECTED,
      colProps: { sm: 6, lg: 3 }
    },
  ];
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