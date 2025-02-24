import React, { useContext, useEffect, useState } from 'react';
import { Card, Col, Row, Stack } from 'react-bootstrap';
import toast from 'react-hot-toast';
import ReactSelect from '../../../../components/ReactSelect';
import InfoCards from '../../../../components/infoCards';
import { getDashboardGraphAndTiles } from '../../../../services/dashboard.service';
import { getOrganizationList } from '../../../../services/teamManagment.service';
import ClosedClaimList from './closed-claims';
import PieChart from './pie-chart';
import CustomDateRangePicker from '../../../../components/CustomDateRangePicker';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { AuthenticationContext } from '../../../../contexts/authentication.context';

const TotalClaimsSection = ({ setLoading }) => {

    const { currentUser } = useContext(AuthenticationContext);

    const [dashboardData, setDashboardData] = useState({})

    const [orgList, setOrgList] = useState([])

    const [filters, setFilters] = useState({})

    const { t } = useTranslation()
    // Temporary state to hold the selected dates
    const [tempDateRange, setTempDateRange] = useState([null, null]);
    const handleDateFilterChange = ([newStartDate, newEndDate]) => {
        setTempDateRange([newStartDate, newEndDate]);

        // Update filter state only if both dates are selected
        if (newStartDate && newEndDate) {
            setFilters({
                startDate: moment(newStartDate).format("YYYY-MM-DD"),
                endDate: moment(newEndDate).format("YYYY-MM-DD")
            });
        } else if(filters?.startDate && filters?.endDate){
            setFilters((prevFilters) => {
                const { startDate, endDate, ...restFilters } = prevFilters;
                return { ...restFilters };
            });
        }
    };

    // GET DASHBOARD DATA FROM API
    const getDashboardInfo = async () => {
        // setLoading(true)
        getDashboardGraphAndTiles(filters).then((response) => {
            setDashboardData(response?.data)
            setLoading(false)
        })
            .catch((error) => {
                if (error?.response?.data?.errorDescription) {
                    toast.error(error?.response?.data?.errorDescription);
                } else {
                    toast.error(error?.message);
                }
            }).finally(() => {
                // setLoading(false)
            })
    };

    useEffect(() => {
        getDashboardInfo()
    }, [filters])

    // GET ORGANIZATION LIST 

    const getOrganizationDropdownData = async () => {
        setLoading(true)
        getOrganizationList().then((response) => {
            const orgListData = response?.data?.map((data) => {
                return {
                    label: data?.name,
                    value: data?.id
                }
            })
            setOrgList([{ label: t('ALL_ENTITIES'), value: '' }, ...orgListData])
        }).catch((error) => {
            if (error?.response?.data?.errorDescription) {
                toast.error(error?.response?.data?.errorDescription);
            } else {
                toast.error(error?.message);
            }
        }).finally(() => {
            setLoading(false)
        })
    }
    useEffect(() => {
        getOrganizationDropdownData()
    }, [])

    return (
        <Card className="border-0 shadow mb-3">
            <Card.Header className="bg-body">
                <Stack
                    direction="horizontal"
                    gap={2}
                    className="flex-wrap my-1"
                >
                    <Stack
                        direction="horizontal"
                        gap={2}
                        className="flex-wrap me-auto"
                    >
                        <div className="fw-semibold fs-4 mb-0">
                            {t("TOTAL_CLAIMS")}
                            {/* <span className="fs-14 fw-normal">({t('SUBMITTED_ACROSS_ALL_FIS')})</span> */}
                        </div>
                        <div className="bg-primary bg-opacity-10 p-2 small rounded"><span className="me-2">{t("AVERAGE_RESOLUTION_TIME")}:</span> <span className="fw-semibold">{dashboardData?.averageResolutionTime} {t("DAYS")}</span></div>
                    </Stack>


                    <Stack
                        direction="horizontal"
                        gap={2}
                        className="flex-wrap "
                    >
                        {
                            currentUser !== "FI_USER" &&
                            <div className="custom-width-320  flex-grow-1 flex-md-grow-0">
                                <ReactSelect
                                    wrapperClassName="mb-0"
                                    className="form-select "
                                    placeholder={t("ALL_ENTITIES")}
                                    id="organizationId"
                                    size="sm"
                                    onChange={(event) => {
                                        setFilters((prev) => ({ ...prev, organizationId: event?.target?.value }))
                                    }}
                                    options={orgList ?? []}
                                />
                            </div>
                        }

                        <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
                            <CustomDateRangePicker
                                wrapperClassName="mb-0"
                                tempDateRange={tempDateRange}
                                handleChange={handleDateFilterChange}
                                startDate={filters?.startDate ?? null}
                                endDate={filters?.endDate}
                                selectsRange={true}
                                placeholder={t("SELECT_DATE_RANGE")}
                                size="sm"
                            />
                        </div>
                    </Stack>

                </Stack>
            </Card.Header>
            <Card.Body>
                <div className="info-cards mb-3">
                    <InfoCards claimStatsData={dashboardData?.claimStatusCount} rowClassName="g-3 text-nowrap" />
                </div>
                <Row className='gx-4 gy-3'>
                    <Col lg={6} >
                        <PieChart graphData={dashboardData?.slaAdherenceGraph} />
                    </Col>
                    <Col lg={6}>
                        <ClosedClaimList closedClaimData={dashboardData?.closeClaimStatusCount} />
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    )
}
export default TotalClaimsSection