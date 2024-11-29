import React from 'react';
import { Formik, Form } from 'formik';

const CommonFormikComponent = ({
  validationSchema,
  initialValues,
  onSubmit,
  children,
  innerRef
}) => {
  return (
    <Formik
      innerRef={innerRef}
      enableReinitialize
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps) => {
        const scrollToError = () => {
          const property = Object.keys(formikProps?.errors)?.[0];
          if (Array.isArray(formikProps?.errors?.[property])) {
            const firstError = formikProps?.errors?.[property];
            if (firstError[0]) {
              const nextProperty = Object.keys(firstError?.[0]);
              const errorFieldElement = document.getElementById(`${property}[0].${nextProperty[0]}`);
              if (errorFieldElement) {
                errorFieldElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'nearest',
                });
              }
            }
          } else {
            const errorFieldElement = document.getElementById(property);
            if (errorFieldElement) {
              errorFieldElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
              });
            }
          }
        };

        return (
          <Form noValidate onSubmit={formikProps.handleSubmit} className="d-flex flex-column theme-common-form h-100">
            <>
              {children(formikProps, formikProps.isSubmitting, formikProps.isValid)}
              {formikProps?.submitCount > 0 && Object.keys(formikProps?.errors).length > 0 && scrollToError()}
            </>
          </Form>
        );
      }}
    </Formik>
  );
};

export default CommonFormikComponent;