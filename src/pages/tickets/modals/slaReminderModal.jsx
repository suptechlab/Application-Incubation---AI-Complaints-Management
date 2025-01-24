import React, { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import SvgIcons from '../../../components/SVGIcons'
import { TbBellRingingFilled } from "react-icons/tb";
import { calculateDaysDifference } from '../../../utils/commonutils';
import { useTranslation } from 'react-i18next';
import { Formik, Form } from 'formik';
import FormInput from '../../../components/FormInput';
import { reminderFormValidation } from '../../../validations/ticketsManagement.validation';
import toast from 'react-hot-toast';
import { slaReminderCommentApi, slaReminderDismissApi } from '../../../services/ticketmanagement.service';

const SlaReminderModal = ({ showModal, ticketData ,toggle,getTicketData}) => {


  const { t } = useTranslation()

  const handleClose = () => {
    slaReminderDismissApi(ticketData?.id).then((response) => {
      toggle()
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message);
      }
    })
  }

  const handleSubmit = (values, actions) => {
    actions.setSubmitting(true)

    const formData = {
      slaComment: values?.comment
    }

    slaReminderCommentApi(ticketData?.id, formData).then((response) => {
      toast.success(response?.data?.messagetTicketDatage)
      getTicketData()
      toggle()
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message);
      }
    }).finally(() => {
      actions.setSubmitting(false)
    })
  }

  return (
    <Modal
      show={showModal}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered={true}
      scrollable={true}
      className="theme-modal"
      enforceFocus={false}
      size="sm"
    >
      <Modal.Header className='pb-0' closeButton></Modal.Header>
      <Modal.Body className="text-break pt-3">
        <div className='text-center'>
          <div className='mb-3' aria-label='Success Launch Icon'><TbBellRingingFilled className='text-primary' size='50' /></div>
          <h2 className='fw-bold'>{t('REMINDER')}</h2>
          <h6 className='fw-semibold'>
            {t('SLA_BREACH_NOTICE', {
              ticketId: ticketData?.ticketId,
              days: ticketData?.slaBreachDate ? calculateDaysDifference(ticketData?.slaBreachDate) : '0',
            })}
          </h6>
        </div>
        <Formik
          initialValues={{
            comment: "",
          }}
          validationSchema={reminderFormValidation}
          onSubmit={handleSubmit}
        >
          {({
            isSubmitting,
            handleChange,
            handleBlur,
            values,
            setFieldValue,
            setFieldError,
            touched,
            isValid,
            errors,
          }) => (
            <Form>
              <FormInput
                label={t("COMMENT")}
                id="comment"
                name="comment"
                type="text"
                as="textarea"
                rows={5}
                onBlur={handleBlur}
                value={values?.comment}
                onChange={handleChange}
                error={errors?.comment}
                touched={touched?.comment}
              />
              <Modal.Footer className="pt-0">
                <Button
                  type="submit"
                  variant="warning"
                  className="px-5"
                  disabled={isSubmitting ?? false}
                >
                  {t('SUBMIT')}
                </Button>
              </Modal.Footer>
            </Form>)}
        </Formik>
      </Modal.Body>
    </Modal>
  )
}

export default SlaReminderModal