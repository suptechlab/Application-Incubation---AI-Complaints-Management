import React, { useEffect, useState } from 'react';
import { Col, Row, Stack } from 'react-bootstrap';
import { MdAnalytics, MdAssignmentAdd, MdEditDocument, MdTask } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { fileClaimStats } from '../../../redux/slice/fileClaimSlice';
import SvgIcons from '../../../components/SVGIcons';
import { useTranslation } from 'react-i18next';
const InfoCards = ({ filter, setLoading }) => {

  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [claimStatsData, setClaimsStatsData] = useState([])

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
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    getClaimStats()
  }, [filter?.year])

  // Info Cards Data
  const cardsData = [
    {
      bgColor: 'bg-body border border-orange',
      iconBg: 'bg-orange-subtle text-orange',
      Icon: <MdEditDocument size={30} />,
      title: t('TOTAL_CLAIMS'),
      value: claimStatsData?.totalClaims,
      colProps: { xs: 6, sm: 4, xl: 2 }
    },
    {
      bgColor: 'bg-body border border-primary',
      iconBg: 'bg-primary text-primary',
      Icon: <MdAssignmentAdd size={30} />,
      title: t('NEW_CLAIMS'),
      value: claimStatsData?.countsByStatus?.NEW,
      colProps: { xs: 6, sm: 4, xl: 2 }
    },
    {
      bgColor: 'bg-body border border-warning',
      iconBg: 'bg-warning text-warning',
      Icon: SvgIcons.fileInfoIcon,
      title: t('PENDING_CLAIMS'),
      value: claimStatsData?.countsByStatus?.PENDING,
      colProps: { xs: 6, sm: 4, xl: 2 }
    },
    {
      bgColor: 'bg-body border border-info',
      iconBg: 'bg-info text-info',
      Icon: <MdAnalytics size={30} />,
      title: t('CLAIMS_IN_PROGRESS'),
      value: claimStatsData?.countsByStatus?.IN_PROGRESS,
      colProps: { xs: 6, sm: 4, xl: 2 }
    },
    {
      bgColor: 'bg-body border border-success',
      iconBg: 'bg-success text-success',
      Icon: <MdTask size={30} />,
      title: t('CLAIMS_CLOSED'),
      value: claimStatsData?.countsByStatus?.CLOSED,
      colProps: { xs: 6, sm: 4, xl: 2 }
    },
    {
      bgColor: 'bg-body border border-danger',
      iconBg: 'bg-danger text-danger',
      Icon: SvgIcons.fileCloseIcon,
      title: t('CLAIMS_REJECTED'),
      value: claimStatsData?.countsByStatus?.REJECTED,
      colProps: { xs: 6, sm: 4, xl: 2 }
    },
  ];

  return (
    <Row className='g-3 g-lg-4'>
      {cardsData.map((card, index) => (
        <Col key={index} {...card.colProps}>
          <Stack
            gap={1}
            className={`align-items-center p-2  rounded-3 h-100 ${card.bgColor || 'bg-primary'}`}
          >
            <span className={`custom-width-48 custom-height-48 flex-shrink-0 d-flex align-items-center justify-content-center ${card.iconBg} bg-opacity-25 rounded-pill mt-1`}>
              {card.Icon}
            </span>
            <div className="fs-4 lh-sm ">{card.value}</div>
            <div className="lh-sm fw-semibold text-center">{card.title}</div>
          </Stack>
        </Col>
      ))}
    </Row>
  );
};

export default InfoCards;