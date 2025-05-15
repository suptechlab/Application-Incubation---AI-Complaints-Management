import React from "react";
import { Col, Image, Modal, Row, Stack } from "react-bootstrap";
import defaultAvatar from "../../../assets/images/default-avatar.jpg";
import CommonViewData from "../../../components/CommonViewData";
import Loader from "../../../components/Loader";
import { useTranslation } from "react-i18next";

const UserInfoModal = ({ userData, modal, toggle,masterData }) => {

    const {t} = useTranslation()

    // PHONE NO AND NATIONAL ID IS PENDING IN THIS
    // Info Modal Data
    const InfoModalData = [
        {
          label: t("NATIONAL_ID"),
          value: userData?.formattedTicketId ?? '',
          colProps: { sm: 6, lg: 4 },
        },
        {
          label: t("EMAIL"),
          value: userData?.createdByUser?.email,
          colProps: { sm: 6, lg: 4 },
        },
        {
          label: t("PHONE"),
          value: userData?.createdByUser?.countryCode + " " + userData?.createdByUser?.phoneNumber,
          colProps: { sm: 6, lg: 4 },
        },
        {
          label: t("PROVINCE_OF_RESIDENCE"),
          value: userData?.province?.name,
          colProps: { sm: 6, lg: 4 },
        },
        {
          label: t("CANTON_OF_RESIDENCE"),
          value: userData?.city?.name,
          colProps: { sm: 6, lg: 4 },
        },
        {
          label: t("PRIORITY_CARE_GROUP"),
          value: masterData?.priorityCareGroup[userData?.priorityCareGroup],
          colProps: { sm: 6, lg: 4 },
        },
        {
          label: t("CUSTOMER_TYPE"),
          value: masterData?.customerType[userData?.customerType],
          colProps: { xs: 12 },
        },
      ];
      
    return (
        <React.Fragment>
            <Loader isLoading={false} />
            <Modal
                show={modal}
                onHide={toggle}
                backdrop="static"
                keyboard={false}
                centered={true}
                scrollable={true}
                size="lg"
                className="theme-modal"
                enforceFocus={false}
            >
                <Modal.Header className="pb-3" closeButton>
                    <Modal.Title className="fw-semibold mw-1">
                        <Stack direction="horizontal" gap={2}>
                            <Image
                                className="object-fit-cover rounded-circle me-lg-1"
                                src={defaultAvatar}
                                width={36}
                                height={36}
                                alt="John Smith"
                            />
                            <span className="text-truncate">{userData?.createdByUser?.name ?? ''}</span>
                        </Stack>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-break pt-1 pb-2">
                    <Row>
                        {InfoModalData?.map((item, index) => (
                            <Col key={"data_view_" + index} {...item.colProps}>
                                <CommonViewData
                                    wrapperClassname="mb-3 pb-1"
                                    label={item.label}
                                    value={item.value}
                                />
                            </Col>
                        ))}
                    </Row>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    );
};

export default UserInfoModal;