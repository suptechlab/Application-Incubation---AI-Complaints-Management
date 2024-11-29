import React, { useState } from "react";
import { Card, Stack } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import CommonDatePicker from "../../components/commonDatePicker";
import Loader from "../../components/Loader";
import ReactSelect from "../../components/ReactSelect";
import InfoCards from "../../components/infoCards";
import { MdConfirmationNumber, MdDoDisturb, MdHourglassEmpty, MdPending, MdTaskAlt } from "react-icons/md";

export default function Dashboard() {
  const [startDate, setStartDate] = useState();
  const { t } = useTranslation();
  let loading = false;

  // Info Cards Data
  const cardsData = [
    {
      bgColor: 'bg-primary',
      Icon: <MdConfirmationNumber size={24} />,
      title: 'New Tickets',
      value: 5,
      colProps: { sm: 6, md: 4, className: "col-xl" }
    },
    {
      bgColor: 'bg-orange',
      Icon: <MdHourglassEmpty size={24} />,
      title: 'Tickets in Progress',
      value: 2,
      colProps: { sm: 6, md: 4, className: "col-xl" }
    },
    {
      bgColor: 'bg-custom-orange',
      Icon: <MdPending size={24} />,
      title: 'Pending Tickets',
      value: 1,
      colProps: { sm: 6, md: 4, className: "col-xl" }
    },
    {
      bgColor: 'bg-custom-green',
      Icon: <MdTaskAlt size={24} />,
      title: 'Closed Tickets',
      value: 2,
      colProps: { sm: 6, md: 4, className: "col-xl" }
    },
    {
      bgColor: 'bg-danger',
      Icon: <MdDoDisturb size={24} />,
      title: 'Rejected Tickets',
      value: 2,
      colProps: { sm: 6, md: 4, className: "col-xl" }
    },
  ];

  return (
    <React.Fragment>
      <Loader isLoading={loading} />
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        {/* Header */}
        <div className="pb-3">
          <Stack
            direction="horizontal"
            gap={2}
            className="flex-wrap custom-min-height-38"
          >
            <h1 className="fw-semibold fs-4 mb-0 me-auto">
              Dashboard
            </h1>

            <div className="custom-width-120 flex-grow-1 flex-md-grow-0">
              <CommonDatePicker
                wrapperClassName="mb-0"
                placeholder="Select"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy"
                showYearPicker={true}
                size="sm"
              />
            </div>
          </Stack>
        </div>

        <Card className="border-0 shadow">
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
                  Total Claims <span className="fs-14 fw-normal">(submitted across all FIs)</span>
                </div>
                <div className="bg-primary bg-opacity-10 p-2 small rounded"><span className="me-2">Average Resolution Time:</span> <span className="fw-semibold">1.2 Days</span></div>
              </Stack>

              <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
                <ReactSelect
                  wrapperClassName="mb-0"
                  class="form-select "
                  placeholder="Select"
                  id="fisAndSeps"
                  size="sm"
                  options={[
                    {
                      label: "FIs & SEPS",
                      value: "",
                    },
                    {
                      label: "Option 1",
                      value: 'option-1',
                    },
                  ]}
                />
              </div>
            </Stack>
          </Card.Header>
          <Card.Body>
            <div className="info-cards mb-3">
              <InfoCards cardsData={cardsData} rowClassName="g-3 text-nowrap" />
            </div>
          </Card.Body>
        </Card>
      </div>
    </React.Fragment>
  );
}
