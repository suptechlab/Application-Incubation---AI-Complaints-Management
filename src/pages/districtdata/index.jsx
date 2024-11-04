import React, { useEffect, useState } from "react"
import { Button, Card, Col, Container, Image, Row } from "react-bootstrap"
import ReactSelect from "react-select"


export default function Districtdata() {
  const [filter, setFilter] = useState({

  })
  const onSubmit = async (values, actions) => {

  }
  return (
    <>
      

      <section className="section-4th bg-white py-40">
        <Container>
          <Row className="d-flex align-items-center">
            <Col md={12}>
              <h3 className="mb-1 fs-40 text-primary fw-semibold text-center">District-wise Supply Data</h3>
              <p className="mb-4 text-center">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempo</p>



             <div className="align-items-start g-2 justify-content-center mb-4 d-flex custom-new-wrap">

                <div class="me-2 custom-flex">

                  <ReactSelect
                    label={""}
                    className="w-100 fs-14"
                    classNamePrefix="react-select"
                    placeholder="All States"
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
                <div class="me-2 custom-flex">
                  <ReactSelect
                    label={""}
                    className="w-100 fs-14"
                    placeholder="All Districts"
                    classNamePrefix="react-select"
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
                <div class="me-2 custom-flex">
                  <ReactSelect
                    label={""}
                    className="w-100 fs-14"
                    placeholder="All Supplier"
                    classNamePrefix="react-select"
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
                <div class="me-2 custom-flex">
                  <ReactSelect
                    label={""}
                    className="w-100 fs-14"
                    placeholder="October"
                    classNamePrefix="react-select"
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
                <div class="me-2 custom-flex">
                  <ReactSelect
                    label={""}
                    className="w-100 fs-14"
                    classNamePrefix="react-select"
                    placeholder="All FY"
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
                <div class="me-2 custom-flex">
                  <ReactSelect
                    label={""}
                   //class="form-select custom-width-190"
                    className="w-100 fs-14"
                    classNamePrefix="react-select"
                    placeholder="All Consumption Type"
                    id="floatingSelect"

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
                <button type="submit" className="btn btn-primary custom-width-85">
                        
                Search
                        
                      </button>
              </div>

              <div className="table-responsive custom-table home-table">
                <table class="table ">
                  <thead class="thead-light">
                    <tr>
                      <th>#</th>
                      <th scope="col">First</th>
                      <th scope="col">Last</th>
                      <th scope="col">Handle</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>@mdo</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Jacob</td>
                      <td>Thornton</td>
                      <td>@fat</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <td>4</td>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <td>5</td>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <td>6</td>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <td>7</td>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                  </tbody>
                </table>
                
              </div>
            </Col>
          </Row>
        </Container>
      </section>
     

    </>
  )
}
