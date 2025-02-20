import React, { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import CommonFormikComponent from "../../components/CommonFormikComponent";
import RadioInput from "../../components/RadioInput";
import { satisfactionSurveyFormApi } from "../../redux/api/apiServices";
import { surveyValidationSchema } from "./validation";

const SurveyForm = () => {

  const { t } = useTranslation()
  const [searchParams] = useSearchParams();
  const [token] = useState(searchParams.get("token"));
  const navigate = useNavigate()


  const handleSubmit = (values,actions)=>{


    const formData = {
      token : token,
      easeOfFindingInfo: values?.easeOfFindingInfo ?? '',
      providedFormats: values?.providedFormats ?? '',
      responseClarity: values?.responseClarity ?? '',
      attentionTime : values?.attentionTime ?? ''
    }
    satisfactionSurveyFormApi(formData)
      .then((response) => {
        navigate('/')
        toast.success(response?.data?.message);
      })
      .catch((error) => {
        if (error?.response?.data?.errorDescription) {
          // toast.error(error?.response?.data?.errorDescription);
        } else {
          // toast.error(error?.message);
        }
      })
      .finally(() => {
        actions.setSubmitting(false);
      });
  }


  useEffect(()=>{
    if(!token){
      navigate('/')
    }
  },[])

  return <Container>
    <div className="contentHeader py-3">

      <h1 className="fw-bold fs-4 mb-0 me-auto">
        {t('SATISFACTION_SURVEY')}
      </h1>
    </div>


    <CommonFormikComponent
      validationSchema={surveyValidationSchema}
      initialValues={{
        easeOfFindingInfo: '',
        providedFormats: '',
        responseClarity: '',
        attentionTime: '',
        // comment: '',
      }}
    onSubmit={handleSubmit}
    >
      {(formikProps) => (
        <div className="text-break d-flex flex-column small pt-0">
          <Row className="gx-4">
            <Col lg={12}>
              <RadioInput
                wrapperClassName="mb-3"
                id="easeOfFindingInfo"
                label={t("CLAIM_SURVEY_QUE_1")}
                name="easeOfFindingInfo"
                error={formikProps.errors.easeOfFindingInfo}
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                options={[
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                  { label: '3', value: 3 },
                  { label: '4', value: 4 },
                  { label: '5', value: 5 }
                ]}
                touched={formikProps.touched.easeOfFindingInfo}
                value={formikProps.values.easeOfFindingInfo || ""}
              />
            </Col>
            <Col lg={12}>
              <RadioInput
                wrapperClassName="mb-3"
                id="providedFormats"
                label={t("CLAIM_SURVEY_QUE_2")}
                name="providedFormats"
                error={formikProps.errors.providedFormats}
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                options={[
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                  { label: '3', value: 3 },
                  { label: '4', value: 4 },
                  { label: '5', value: 5 }
                ]}
                touched={formikProps.touched.providedFormats}
                value={formikProps.values.providedFormats || ""}
              />
            </Col>
            <Col lg={12}>
              <RadioInput
                wrapperClassName="mb-3"
                id="responseClarity"
                label={t("CLAIM_SURVEY_QUE_3")}
                name="responseClarity"
                error={formikProps.errors.responseClarity}
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                options={[
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                  { label: '3', value: 3 },
                  { label: '4', value: 4 },
                  { label: '5', value: 5 }
                ]}
                touched={formikProps.touched.responseClarity}
                value={formikProps.values.responseClarity || ""}
              />
            </Col>
            <Col lg={12}>
              <RadioInput
                wrapperClassName="mb-3"
                id="attentionTime"
                label={t("CLAIM_SURVEY_QUE_4")}
                name="attentionTime"
                error={formikProps.errors.attentionTime}
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                options={[
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                  { label: '3', value: 3 },
                  { label: '4', value: 4 },
                  { label: '5', value: 5 }
                ]}
                touched={formikProps.touched.attentionTime}
                value={formikProps.values.attentionTime || ""}
              />
            </Col>
            {/* <Col lg={12}>
              <FormInputBox
                id="comment"
                label={t("COMMENT")}
                name="comment"
                type="text"
                as="textarea"
                rows="4"
                error={formikProps.errors.comment}
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                touched={formikProps.touched.comment}
                value={formikProps.values.comment || ""}
              />

              </Col> */}
          </Row>
          <div>
            <Button
              type="submit"
              variant="warning"
              className="custom-min-width-100"
              disabled={formikProps?.isSubmitting ?? false}
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
