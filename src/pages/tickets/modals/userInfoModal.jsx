import React from "react";
import { Col, Image, Modal, Row, Stack } from "react-bootstrap";
import defaultAvatar from "../../../assets/images/default-avatar.jpg";
import CommonViewData from "../../../components/CommonViewData";
import Loader from "../../../components/Loader";

const UserInfoModal = ({ userData, modal, toggle,masterData }) => {

    // PHONE NO AND NATIONAL ID IS PENDING IN THIS
    // Info Modal Data
    const InfoModalData = [
        {
            label: "National ID",
            value: userData?.ticketId ?? '',
            colProps: { sm: 6, lg: 4 }
        },
        {
            label: "Email",
            value: userData?.user?.email,
            colProps: { sm: 6, lg: 4 }
        },
        {
            label: "Phone",
            value: userData?.user?.countryCode + " " + userData?.user?.phoneNumber,
            colProps: { sm: 6, lg: 4 }
        },
        {
            label: "Province of residence",
            value: userData?.province?.name,
            colProps: { sm: 6, lg: 4 }
        },
        {
            label: "Canton of residence",
            value: userData?.city?.name,
            colProps: { sm: 6, lg: 4 }
        },
        {
            label: "Priority care group",
            value: masterData?.priorityCareGroup[userData?.priorityCareGroup],
            colProps: { sm: 6, lg: 4 }
        },
        {
            label: "Customer Type",
            value: masterData?.customerType[userData?.customerType],
            colProps: { xs: 12 }
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
                            <span className="text-truncate">{userData?.user?.name ?? ''}</span>
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