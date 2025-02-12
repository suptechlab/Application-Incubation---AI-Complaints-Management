import React from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../myAccount/header";
import { Button, Col, Container, Row, Stack } from "react-bootstrap";
import CommonFormikComponent from "../../components/CommonFormikComponent";
import AppTooltip from "../../components/tooltip";
import { FiInfo } from "react-icons/fi";
import RadioInput from "../../components/RadioInput";

const SurveyForm = () => {

  const { t } = useTranslation()

  return <Container>
    <div className="contentHeader py-3">

      <h1 className="fw-bold fs-4 mb-0 me-auto">
        {t('SATISFACTION_SURVEY')}
      </h1>
    </div>

    <CommonFormikComponent
      // validationSchema={BasicInfoFormSchema}
      initialValues={{
        claim_survey_1: '',
        claim_survey_2: '',
        claim_survey_3: '',
        claim_survey_4: '',
        claim_survey_5: '',
      }}
    // onSubmit={handleSubmit}
    >
      {(formikProps) => (
        <div className="text-break d-flex flex-column small pt-0">

          <Row className="gx-4">
            <Col lg={12}>
              <RadioInput
                wrapperClassName="mb-3"
                id="claim_survey_1"
                label={t("CLAIM_SURVEY_QUE_1")}
                name="claim_survey_1"
                error={formikProps.errors.claim_survey_1}
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                options={[
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                  { label: '3', value: 3 },
                  { label: '4', value: 4 },
                  { label: '5', value: 5 }
                ]}
                touched={formikProps.touched.claim_survey_1}
                value={formikProps.values.claim_survey_1 || ""}
              />
            </Col>
            <Col lg={12}>
              <RadioInput
              wrapperClassName="mb-3"
                id="claim_survey_2"
                label={t("CLAIM_SURVEY_QUE_2")}
                name="claim_survey_2"
                error={formikProps.errors.claim_survey_2}
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                options={[
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                  { label: '3', value: 3 },
                  { label: '4', value: 4 },
                  { label: '5', value: 5 }
                ]}
                touched={formikProps.touched.claim_survey_2}
                value={formikProps.values.claim_survey_2 || ""}
              />
            </Col>
            <Col lg={12}>
              <RadioInput
              wrapperClassName="mb-3"
                id="claim_survey_3"
                label={t("CLAIM_SURVEY_QUE_3")}
                name="claim_survey_3"
                error={formikProps.errors.claim_survey_3}
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                options={[
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                  { label: '3', value: 3 },
                  { label: '4', value: 4 },
                  { label: '5', value: 5 }
                ]}
                touched={formikProps.touched.claim_survey_3}
                value={formikProps.values.claim_survey_3 || ""}
              />
            </Col>
            <Col lg={12}>
              <RadioInput
              wrapperClassName="mb-3"
                id="claim_survey_4"
                label={t("CLAIM_SURVEY_QUE_4")}
                name="claim_survey_4"
                error={formikProps.errors.claim_survey_4}
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                options={[
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                  { label: '3', value: 3 },
                  { label: '4', value: 4 },
                  { label: '5', value: 5 }
                ]}
                touched={formikProps.touched.claim_survey_4}
                value={formikProps.values.claim_survey_4 || ""}
              />
            </Col>
          </Row>
          <div>
            <Button
              type="submit"
              variant="warning"
              className="custom-min-width-100"
            >
              {t("SUBMIT")}
            </Button>
          </div>

        </div>

      )}
    </CommonFormikComponent>

  </Container>;
};

export default SurveyForm;
