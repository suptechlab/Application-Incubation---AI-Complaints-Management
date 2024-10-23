import React from 'react';
import { Col, Row, Stack } from 'react-bootstrap';
import FormInput from "../components/FormInput";
import ReactSelect from './ReactSelect';
import { useTranslation } from 'react-i18next';


const ListingSearchForm = ({ filter, setFilter }) => {
  const {t} = useTranslation()
  return (
    <div className="theme-card-header px-1 header-search">
      <Stack
        gap={3}
        className="flex-wrap px-3 pt-3 align-items-start"
      >
        <div className="w-100">
          <Row className="g-3 justify-content-between">
            <Col md={4} className="d-flex">
              <div className="custom-width-250 flex-grow-1 flex-md-grow-0">
                <FormInput
                  id="search"
                  key={"search"}
                  //label="Search"
                  name="search"
                  placeholder={t("SEARCH")}
                  type="text"
                  onChange={(event) => {
                    if (event.target.value === "") {
                      setFilter({
                        ...filter,
                        search: undefined,
                      });
                      return;
                    }
                    setFilter({
                      ...filter,
                      search: event.target.value,
                    });
                  }}
                  value={filter.search}
                />
              </div>
            </Col>
            <Col
              sm
              md="auto"
              className="d-flex"
            >
              <div className=" flex-grow-1 flex-md-grow-0">
                <div class="">
                  <ReactSelect
                    label={""}
                    class="form-select "
                    placeholder={t("ALL STATUS")}
                    id="floatingSelect"
                    //aria-label="Floating label select example"
                    options={[
                      {
                        label: t("ALL STATUS"),
                        value: "",
                        class: "label-class"
                      },
                      {
                        label: t("ACTIVE"),
                        value: true,
                      },
                      {
                        label: t("INACTIVE"),
                        value: false,
                      },
                    ]}
                    onChange={(
                      e
                    ) => {
                      setFilter({
                        ...filter,
                        status: e.target.value,
                      });
                    }}
                    value={filter.status}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Stack>
    </div>
  );
};

export default ListingSearchForm;
