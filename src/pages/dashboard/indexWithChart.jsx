import React, { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import qs from "qs";
import LineChartBottam from "./lineChart/LineChartBottam";
import LineChartTop from "./lineChart/LineChartTop";
import BarChartModel from "./barChart/index";
import ReactSelect from "react-select";
import { PieChart } from "@mui/x-charts/PieChart";
import DataReviewTable from "./DataReviewTable";
import {
  handleGetCompany,
  getDashbaordData,
  getListingData,
  handleGetStates,
  handleGetFinancialYear,
  handleGetMinistryDashboardCompanies,
} from "../../services/dashboard.service";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import { getLocalStorage } from "../../utils/storage";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const params = qs.parse(location.search, { ignoreQueryPrefix: true });
  const [pagination, setPagination] = useState({
    pageIndex: params.page ? parseInt(params.page) - 1 : 0,
    pageSize: params.limit ? parseInt(params.limit) : 10,
  });

  const [sorting, setSorting] = useState([]);
  const [filter, setFilter] = useState({
    stateId: "",
    companyId: "",
    companyId2: "",
    companyId3: "",
    // financialYearId: "",
    financialYearId: [],
    // month: "",
    month: [],
    consumerCategoryId: "",
    categoryId: "",
    consumerId: "",
  });
  const [consumerOptions, setConsumerOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [pieChartData, setPieChartData] = useState([]); // PieChart
  const [sortedData, setSortedData] = useState([]); // Table
  const [barChartData, setBarChartData] = useState([]);
  const [lineChartDataTop, setLineChartDataTop] = useState([]);
  const [lineChartDataBottam, setLineChartDataBottam] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [financialYearOptions, setFinancialYearOptions] = useState([]);
  const [monthOptions, setMonthOptions] = useState([
    // { label: "Select Month", value: "" },
    { label: "January", value: "Jan" },
    { label: "February", value: "Feb" },
    { label: "March", value: "Mar" },
    { label: "April", value: "Apr" },
    { label: "May", value: "May" },
    { label: "June", value: "Jun" },
    { label: "July", value: "Jul" },
    { label: "August", value: "Aug" },
    { label: "September", value: "Sep" },
    { label: "October", value: "Oct" },
    { label: "November", value: "Nov" },
    { label: "December", value: "Dec" },
  ]);
  const [isVisibleCompanyDropDown, setIsVisibleCompanyDropDown] = useState(false);
  const [companyTitle, setCompanyTitle] = useState({
    companyTitle: ""
  })

  const [currentFinancialYear, setCurrentFinancialYear] = useState({
    name: "",
    id: ""
  });

  const loginCompanyTitle = getLocalStorage("companyTitle");
  // if(loginCompanyTitle==='Ministry'|| loginCompanyTitle==='PPAC'|| loginCompanyTitle==='AGCL'){
  // if (loginCompanyTitle === 'Ministry' || loginCompanyTitle === 'PPAC') {
  //   setIsVisibleCompanyDropDown(true);
  // }

  const fetchDashboardData = async (filter) => {
    setLoading(true);
    const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
    Object.keys(filterObj).forEach((key) => filterObj[key] === "" && delete filterObj[key]);

    const response = await getDashbaordData(filterObj);
    console.log('calling for filter')
    setLineChartDataTop(response.data.data.subsidyGasTrendsQty);
    setLineChartDataBottam(response.data.data.subsidyGasTrendsAmount);
    setBarChartData(response.data.data.gasBenefitByState);
    setPieChartData(response.data.data.gasBenefitByConsumerCategory);
    // Sort the pieChartData array by item.value in descending order
    setSortedData(response.data.data.gasBenefitByConsumerCategory.sort((a, b) => b.value - a.value));
    setLoading(false);
  };

  const dataQuery = useQuery({
    queryKey: ["data", pagination, sorting, filter],
    queryFn: () => {
      const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
      Object.keys(filterObj).forEach((key) => filterObj[key] === "" && delete filterObj[key]);

      if (sorting.length === 0) {
        return getListingData({
          page: pagination.pageIndex,
          size: pagination.pageSize,
          ...filterObj,
        });
      } else {
        return getListingData({
          page: pagination.pageIndex,
          size: pagination.pageSize,
          sort: sorting
            .map((sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`)
            .join(","),
          ...filterObj,
        });
      }
    },
  });

  const [companiesData, setCompaniesData] = useState(null);
  const [selectedFirstCompany, setSelectedFirstCompany] = useState(null);
  const [selectedSecondCompany, setSelectedSecondCompany] = useState(null);
  const [selectedThirdCompany, setSelectedThirdCompany] = useState(null);

  const [firstOptions, setFirstOptions] = useState([]);
  const [secondOptions, setSecondOptions] = useState([]);
  const [thirdOptions, setThirdOptions] = useState([]);


  const handleFirstChange = (field, selectedOption) => {
    if (selectedOption) {
      const selectedId = parseInt(selectedOption.value);
      setSecondOptions([]);
      delete filter['companyId2'];
      const selected = companiesData.find(item => item.id === selectedId);
      const secondOptions = selected.child.length > 0 ? selected.child.map(item => ({ value: item.id, label: item.title })) : [];
      setSecondOptions(secondOptions);
      setSelectedFirstCompany(selected);
      setSelectedSecondCompany(null);
      setSelectedThirdCompany(null);
    } else {
      setSelectedFirstCompany(null);
      setSelectedSecondCompany(null);
      setSelectedThirdCompany(null);
    }
    setFilter({
      ...filter,
      [field]: selectedOption ? selectedOption.value : "",
    });
  };

  const handleSecondChange = (field, selectedOption) => {
    if (selectedOption) {
      const selectedId = parseInt(selectedOption.value);
      const selected = selectedFirstCompany.child.find(item => item.id === selectedId);
      const thirdOptions = selected.child.length > 0 ? selected.child.map(item => ({ value: item.id, label: item.title })) : [];
      setThirdOptions(thirdOptions);
      setSelectedSecondCompany(selected);
      //setSelectedThirdCompany(selected); // Reset third dropdown
      //toast.success("Please select State for proper result.")
    } else {
      setSelectedSecondCompany(null);
      setSelectedThirdCompany(null);
    }
    setFilter({
      ...filter,
      [field]: selectedOption ? selectedOption.value : "",
    });
  };

  const handleThirdChange = (field, selectedOption) => {
    if (selectedOption) {
      const selectedId = parseInt(selectedOption.value);
      const selected = selectedSecondCompany.child.find(item => item.id === selectedId);
      setSelectedThirdCompany(selectedOption);
    } else {

    }
    setFilter({
      ...filter,
      [field]: selectedOption ? selectedOption.value : "",
    });
  };


  useEffect(() => {
    fetchDashboardData(filter);
  }, [filter]);

  useEffect(() => {
    // const fy = currentFY(); // Get the current financial year
    const fy = previousFY(); // Get the previous financial year
    setCompanyTitle({
      companyTitle: getLocalStorage("companyTitle")
    });

    

    

    handleGetCompany().then((response) => {
      // let companiesList = [{ value: "", label: "Select Company" }];
      let companiesList = [];
      if (response.data?.data?.length > 0) {
        response.data?.data?.forEach((category) => {
              companiesList.push({ value: category?.id, label: category?.title });
          
        });
      }
      setCompanyOptions(companiesList);
    });

    handleGetMinistryDashboardCompanies().then((response) => {
      // let companiesList = [{ value: "", label: "Select Company" }];
      let companiesList = [];
      if (response.data?.data?.length > 0) {
        console.log("Ministry Dashboard::::", response.data.data);
        setCompaniesData(response.data.data);
        const firstOptions = response.data.data.map(item => ({ value: item.id, label: item.title }));
        const secondOptions = selectedFirstCompany ? selectedFirstCompany.child.map(item => ({ value: item.id, label: item.title })) : [];
        const thirdOptions = selectedSecondCompany ? selectedSecondCompany.child.map(item => ({ value: item.id, label: item.title })) : [];

        setFirstOptions(firstOptions);
        setSecondOptions(secondOptions);
        setThirdOptions(thirdOptions);
      }
    });

    handleGetFinancialYear().then((response) => {
      // let financialYearList = [{ value: "", label: "Select Financial Year" }];
      let financialYearList = [];
      let currentFYOption = null;

      if (response.data?.data?.length > 0) {
        response.data?.data?.forEach((category) => {
          financialYearList.push({ value: category?.id, label: category?.financialYear });

          if (category.financialYear === fy) {
            currentFYOption = { value: category.id, label: category.financialYear };
            setCurrentFinancialYear({
              name: fy,
              id: category.id
            });
          }
        });
        setFinancialYearOptions(financialYearList);
        if (currentFYOption) {
          setFilter((prevFilter) => ({
            ...prevFilter,
            financialYearId: [currentFYOption.value], // Set current FY ID as default
          }));
        }
      }
    });

    handleGetStates().then((response) => {
      setStateOptions(response.data.data.map((state) => ({
        value: state.id,
        label: state.stateName,
      })));
    });

    setLoading(false);
  }, []);

  const columns = React.useMemo(() => {
    let cols = [
      {
        accessorFn: (row) => row.month,
        id: "month",
        header: () => "Month",
        enableSorting: false,
      },
    ];

      
    return cols;
  }, [loginCompanyTitle]);

  const handleChange = (field, selectedOption) => {
    setFilter({
      ...filter,
      [field]: selectedOption ? selectedOption.value : "",
    });
  };

  const handleChangeMonth = (field, selectedOptions) => {
    setFilter({
      ...filter,
      [field]: selectedOptions ? selectedOptions.map(option => option.value) : [],
    });
  };

  const truncateLabel = (label, maxLength) => {
    return label.length > maxLength ? `${label.slice(0, maxLength)}...` : label;
  };

  const currentFY = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    let startYear, endYear;

    if (currentMonth >= 3) {
      startYear = currentYear;
      endYear = currentYear + 1;
    } else {
      startYear = currentYear - 1;
      endYear = currentYear;
    }

    const endYearShort = endYear.toString().slice(-2);
    const financialYear = `${startYear}-${endYearShort}`;
    return financialYear;
  }

  const previousFY = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    let startYear, endYear;

    // Logic for previous financial year
    if (currentMonth >= 3) {
      startYear = currentYear - 1;
      endYear = currentYear;
    } else {
      startYear = currentYear - 2;
      endYear = currentYear - 1;
    }

    const endYearShort = endYear.toString().slice(-2);
    const financialYear = `${startYear}-${endYearShort}`;
    return financialYear;
  }


  const totalValue = sortedData.reduce((acc, item) => acc + item.value, 0).toFixed(2);

  return (
    <>
      {loading ? (
        <Loader isLoading={loading} />
      ) : 
       (
        <div className="d-flex flex-column h-100 pageContainer px-sm-1 w-100 pb-sm-1">
          <div className="pageHeader px-3 py-2 my-1 header-search">
            <Row className="">
              <Col md={12} lg={2}>
                <h1 className="fw-semibold h4 my-2">Dashboard</h1>
              </Col>
              <Col md={12} lg={10}>
                <Row className="align-items-start g-2 justify-content-end row">
                  {/* <pre>{JSON.stringify(companyOptions,null,2)}</pre> */}
                  <Col sm md="auto" className="d-flex">
                    {companyTitle.companyTitle === 'AGCL' ?
                      <div className="me-2">
                        <ReactSelect
                          classNamePrefix="react-select"
                          placeholder="All Company"
                          options={companyOptions}
                          isClearable
                          onChange={(selectedOption) => handleChange("companyId", selectedOption)}
                          value={companyOptions.find((option) => option.value === filter.companyId)}
                        />
                      </div> : ''}

                    {loginCompanyTitle === "Ministry" || loginCompanyTitle === "PPAC" ?
                      <div className="me-2 dashbord-Category-select">
                        <ReactSelect
                          classNamePrefix="react-select"
                          placeholder="Select Company"
                          options={firstOptions}
                          isClearable
                          // onChange={handleFirstChange}
                          onChange={(selectedOption) => handleFirstChange("companyId", selectedOption)}
                          //value={selectedFirstCompany}
                          value={firstOptions.find((option) => option.value === filter.companyId)}
                        />
                      </div> : ''
                    }

                    {selectedFirstCompany && selectedFirstCompany.child.length > 0 && (
                      <div className="me-2 dashbord-Category-select">
                        <ReactSelect
                          classNamePrefix="react-select"
                          placeholder="Select Child"
                          options={secondOptions}
                          isClearable
                          //onChange={handleSecondChange}
                          onChange={(selectedOption) => handleSecondChange("companyId2", selectedOption)}
                          value={secondOptions.find((option) => option.value === filter.companyId2)}
                        />
                      </div>
                    )}

                    {selectedSecondCompany && selectedSecondCompany.child.length > 0 && (
                      <div className="me-2 dashbord-Category-select">
                        <ReactSelect
                          classNamePrefix="react-select"
                          placeholder="Select Child"
                          options={thirdOptions}
                          isClearable
                          //onChange={handleThirdChange}
                          onChange={(selectedOption) => handleThirdChange("companyId3", selectedOption)}
                          value={thirdOptions.find((option) => option.value === filter.companyId3)}
                        />
                      </div>
                    )}

                    <div className="me-2 dashbord-Category-select">
                      <ReactSelect
                        classNamePrefix="react-select"
                        placeholder="All  Consumer Category"
                        options={categoryOptions}
                        isClearable
                        onChange={(selectedOption) => handleChange("categoryId", selectedOption)}
                        value={categoryOptions.find((option) => option.value === filter.categoryId)}
                      />
                    </div>
                    {loginCompanyTitle === "AGCL" || loginCompanyTitle === "TNGC" || loginCompanyTitle === "Ministry" || loginCompanyTitle === "PPAC" ? '' :
                      <div className="me-2 dashbord-select1">
                        <ReactSelect
                          classNamePrefix="react-select"
                          placeholder="All  Consumer"
                          options={consumerOptions}
                          isClearable
                          onChange={(selectedOption) => handleChange("consumerId", selectedOption)}
                          value={consumerOptions.find((option) => option.value === filter.consumerId)}
                        />
                      </div>
                    }

                    <div className="me-2 dashbord-select1">
                      <ReactSelect
                        classNamePrefix="react-select"
                        placeholder="All  States"
                        options={stateOptions}
                        isClearable
                        onChange={(selectedOption) => handleChange("stateId", selectedOption)}
                        value={stateOptions.find((option) => option.value === filter.stateId)}
                      />
                    </div>
                    {/* <p>{JSON.stringify(financialYearOptions,null,2)}</p> */}
                    <div className="me-2 dashbord-select2">
                      <ReactSelect
                        classNamePrefix="react-select"
                        placeholder="All  Financial Year"
                        options={financialYearOptions}
                        isClearable
                        isMulti
                        //onChange={(selectedOption) => handleChange("month", selectedOption)}
                        onChange={(selectedOption) => handleChangeMonth("financialYearId", selectedOption)}
                        //onChange={(selectedOption) => handleChange("financialYearId", selectedOption)}
                        //value={financialYearOptions.find((option) => option.value === filter.financialYearId)}
                        // value={financialYearOptions[3]} // zero selected
                        value={financialYearOptions.filter(item => filter.financialYearId.includes(item.value))}
                      />
                    </div>

                    <div className="me-2 dashbord-month-select">

                      <ReactSelect
                        classNamePrefix="react-select"
                        placeholder="All  Month"
                        options={monthOptions}
                        isClearable
                        isMulti
                        //onChange={(selectedOption) => handleChange("month", selectedOption)}
                        onChange={(selectedOption) => handleChangeMonth("month", selectedOption)}
                        //value={monthOptions.find((option) => option.value === filter.month)}
                        value={monthOptions.filter(item => filter.month.includes(item.value))}
                      />
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
            { selectedSecondCompany ?
            <Row className="">
              <Col md={12} lg={12}>
                <h3 className="fs-16 fw-bolder" style={{ border: "1px solid #00ffd0", padding: "5px", backgroundColor: "#bdf1e55c" }}>
                  Please select State for proper result
                </h3>
              </Col>
            </Row> : '' }
          </div>

          <div className="flex-grow-1 pageContent position-relative overflow-auto px-3 pb-3">
            <Row>
              {loginCompanyTitle != "GAIL" ?
                <Col md={12} xxl={6} className="mb-3">
                  <Card className="h-100 border-0 p-3 custom-shadow">
                    <Card.Header as="h6" className="fw-semibold bg-body border-0">
                      <h2 className="fs-16 fw-bolder">Gas Subsidy Benefit by Consumer Category (Rs in Crore)</h2>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-fex row">
                        <div className="mb-3 col-lg-8 pie_width_height">
                          <PieChart
                            series={[
                              {
                                cx: 200,
                                cy: 150,
                                innerRadius: 0,
                                outerRadius: 100,
                                paddingAngle: 0,
                                cornerRadius: 0,
                                startAngle: -169,
                                endAngle: 200,
                                data: pieChartData,
                                valueFormatter: (v) => (v === null ? '' : v.value + ' Cr.'),
                                highlightScope: { faded: 'global', highlighted: 'item' },
                                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                //arcLabel: (item) => `${item.label} (${item.value})`,
                                //arcLabelMinAngle: 45,
                              },
                            ]}

                            slotProps={{
                              legend: {
                                direction: 'row',
                                position: { vertical: 'bottom', horizontal: 'middle' },
                                padding: 0,
                                hidden: true,  //  You can hide the legend with the property slotProps.legend.hidden.
                                margin: { top: 0, bottom: 80, left: 0, right: 30 },
                              },
                            }}
                            margin={{ top: -50, bottom: 100, left: 0, right: 30 }}
                          />
                        </div>
                        {/* {JSON.stringify(pieChartData,null,2)} */}
                        <div className="col-lg-4">
                          <table className="table table-sm table-bordered border table-hover dashboard-table">
                            <thead className="">
                              <tr>
                                <th className="text-start text-center">
                                  Category
                                </th>
                                <th className="text-start text-center">
                                  Rs in Crore
                                </th>

                              </tr>
                            </thead>
                            <tbody>
                              {sortedData.map((item) => (
                                <tr key={item.id}>
                                  <td className="text-start border text-truncate" style={{
                                    background: item.color,
                                    color: "#fff",
                                    maxWidth: "50px",
                                  }} title={item.fullLabel} >{item.fullLabel}</td>
                                  <td className="text-start border">{item.value.toFixed(2)}</td>
                                </tr>
                              ))}
                              <tr>
                                <td
                                  className="text-start border"
                                  style={{
                                    background: '#fff',
                                    color: "#000",
                                    'font-weight': "600",
                                  }}
                                >
                                  Total
                                </td>
                                <td className="text-start border">{totalValue}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </Card.Body>

                  </Card>
                </Col>
                :
                <Col md={12} xxl={6} className="mb-3">
                  <Card className="h-100 border-0 p-3 custom-shadow dashboard-bottom-table">
                    <Card.Header as="h6" className="fw-semibold bg-body border-0"></Card.Header>
                    <Card.Body>
                      <Card.Header as="h6" className="fw-semibold bg-body border-0">
                        <h2 className="fs-16 fw-bolder">Monthly Gas Subsidy Values (Rupees in Crore)</h2>
                      </Card.Header>
                      <DataReviewTable
                        columns={columns}
                        dataQuery={dataQuery}
                        pagination={pagination}
                        setPagination={setPagination}
                        sorting={sorting}
                        setSorting={setSorting}
                      />
                    </Card.Body>
                  </Card>
                </Col>
              }
              <Col md={12} xxl={6} className="mb-3">
                <Card className="h-100 border-0 p-3 custom-shadow">
                  <Card.Header as="h6" className="fw-semibold bg-body border-0">
                    <h2 className="fs-16 fw-bolder">Gas Subsidy Benefit by State (Rupees in Crore)</h2>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className="dashbord-rotate-text dashbord-rotate-text-Subsidy">
                        <span>Subsidy - Rs in Crore</span>
                      </div>
                      <div className="w-100 ">
                        <BarChartModel chartData={barChartData} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={12} className="mb-3">
                <Card className="h-100 border-0 p-3 border-0 custom-shadow">
                  <Card.Header as="h6" className="fw-semibold bg-body border-0">

                    <h2 className="fs-16 fw-bolder">Monthly Gas Subsidy Trends (Quantity in MSCM)</h2>


                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className="dashbord-rotate-text">
                        <span>Qty in MSCM</span>
                      </div>
                      <div className="w-100"><LineChartTop chartData={lineChartDataTop} heading={'Monthly Gas Subsidy Trends (Quantity in MSCM)'} /></div>
                    </div>

                  </Card.Body>
                </Card>
              </Col>
              <Col md={12} className="mb-3">
                <Card className="h-100 border-0 p-3 border-0 custom-shadow">
                  <Card.Header as="h6" className="fw-semibold bg-body border-0">

                    <h2 className="fs-16 fw-bolder">Monthly Gas Subsidy Trends (Rupees in Crore)</h2>


                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className="dashbord-rotate-text">
                        <span>Rupees in Crore</span>
                      </div>
                      <div className="w-100">
                        <LineChartBottam chartData={lineChartDataBottam} heading={'Monthly Gas Subsidy Trends (Rupees in Crore)'} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              {loginCompanyTitle != "GAIL" ?
                <Col md={12}>
                  <Card className="h-100 border-0 p-3 custom-shadow dashboard-bottom-table">
                    <Card.Header as="h6" className="fw-semibold bg-body border-0"></Card.Header>
                    <Card.Body>
                      <Card.Header as="h6" className="fw-semibold bg-body border-0">
                        <h2 className="fs-16 fw-bolder">Monthly Gas Subsidy Values (Rupees in Crore)</h2>
                      </Card.Header>
                      <DataReviewTable
                        columns={columns}
                        dataQuery={dataQuery}
                        pagination={pagination}
                        setPagination={setPagination}
                        sorting={sorting}
                        setSorting={setSorting}
                      />
                    </Card.Body>
                  </Card>
                </Col>
                : ''}
            </Row>
          </div>
        </div>
      )}
    </>
  );
}
