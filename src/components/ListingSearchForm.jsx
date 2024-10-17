import React from 'react';
import { Col, Row, Stack } from 'react-bootstrap';
import FormInput from "../components/FormInput";
import ReactSelect from './ReactSelect';


const ListingSearchForm = ({ filter, setFilter }) => {
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
                  placeholder="Search"
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
                    placeholder="All Status"
                    id="floatingSelect"
                    //aria-label="Floating label select example"
                    options={[
                      {
                        label: "All Status",
                        value: "",
                        class: "label-class"
                      },
                      {
                        label: "Active",
                        value: true,
                      },
                      {
                        label: "Inactive",
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
