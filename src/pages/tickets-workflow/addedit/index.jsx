
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button, Card, Col, Row, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdAddCircle, MdClose } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import CommonFormikComponent from "../../../components/CommonFormikComponent";
import FormInput from "../../../components/FormInput";
import Loader from "../../../components/Loader";
import PageHeader from "../../../components/PageHeader";
import ReactSelect from "../../../components/ReactSelect";
import { AuthenticationContext } from "../../../contexts/authentication.context";
import { MasterDataContext } from "../../../contexts/masters.context";
import { claimTypesDropdownList, getClaimSubTypeById } from "../../../services/claimSubType.service";
import { getOrganizationList, getTeamMemberList } from "../../../services/teamManagment.service";
import { convertToLabelValue } from "../../../services/ticketmanagement.service";
import { ticketWorkflowSchema } from "../../../validations/ticketWorkflow.validation";

export default function TicketWorkFlowAddEdit() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const { t } = useTranslation();
    const [initialValues, setInitialValues] = useState({
        entityId: "",
        instanceTypeId: "",
        eventId: "",
        workflowName: "",
        description: "",
        conditions: [
            {
                conditionId: '',
                conditionCatId: '',
            }
        ],
        actions: [
            {
                actionId: '',
                actionFilter1: '',
                actionFilter2: ''
            }
        ],
        userType: ""
    });
    const { masterData } = useContext(MasterDataContext);
    const [organizationArr, setOrganizationArr] = useState([]);
    const [instanceTypeArr, setInstanceTypeArr] = useState([]);
    const [eventTypeArr, setEventTypeArr] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState([]);
    const [conditionsArr, setConditionsArr] = useState([]);
    const [conditionsCatArr, setConditionsCatArr] = useState([]);
    const [actionsArr, setActionsArr] = useState([]);
    const [actionCategory1Arr, setActionCategory1Arr] = useState([]);
    const [actionCategory2Arr, setActionCategory2Arr] = useState([]);
    const { currentUser } = useContext(AuthenticationContext);


    const getOrganizationLists = async (type) => {
        setLoading(true);
        try {
            await getOrganizationList(type).then((response) => {
                const formattedOrgData = response.data.map((item) => ({
                    label: item.name,
                    value: item.id
                }));
                setOrganizationArr([...formattedOrgData]);
                setLoading(false);
            });
        } catch (error) {
            setLoading(false);
        }
    }

    const getTeamMemberLists = async (type) => {
        setLoading(true);
        try {
            await getTeamMemberList(type).then((response) => {
                console.log('resp', response)
                const formattedData = response.data.map((item) => ({
                    label: item.name,
                    value: item.id
                }));
                setActionCategory2Arr(formattedData)
                setLoading(false);
            });
        } catch (error) {
            setLoading(false);
        }
    }

    const getClaimTypeDropdownList = () => {
        setLoading(true);
        claimTypesDropdownList().then(response => {
            if (response?.data && response?.data?.length > 0) {
                const dropdownData = response?.data.map(item => ({
                    value: item.id,
                    label: item.name
                }));
                setConditionsArr(dropdownData);
                setLoading(false);
            }
        }).catch((error) => {
            if (error?.response?.data?.errorDescription) {
                toast.error(error?.response?.data?.errorDescription);
            } else {
                toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
            }
            setLoading(false);
        })
    }

    const getClaimSubTypes = useCallback(async (claimId) => {
        setLoading(true);
        try {
            const response = await getClaimSubTypeById(claimId);
            const claimSubTypeFormatList = response?.data
                ? [{ label: response.data.name, value: response.data.id }]
                : [];
            setConditionsCatArr(claimSubTypeFormatList);
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    }, [setConditionsCatArr])

    useEffect(() => {
        getOrganizationLists("FI");
        if (masterData) {
            setInstanceTypeArr(convertToLabelValue(masterData.instanceType || {}));
            setEventTypeArr(convertToLabelValue(masterData.ticketWorkflowEvent || {}));
        }
        if (currentUser) {
            setInitialValues({
                userType: currentUser,
                entityId: "",
                eventId: "",
                instanceTypeId: "",
                workflowName: "",
                description: "",
                conditions: [
                    {
                        conditionId: '',
                        conditionCatId: '',
                    }
                ],
                actions: [
                    {
                        actionId: '',
                        actionFilter1: '',
                        actionFilter2: ''
                    }
                ]
            })
        }
    }, [masterData, currentUser]);

    const updateActionCategory1Filter = async (selectedActionCat1) => {
        switch (selectedActionCat1) {
            case 'ASSIGN_TO_TEAM':
                return setActionCategory1Arr([
                    { label: 'SEPS User', value: 'SEPS' },
                    { label: 'Fi User', value: 'FI' },
                ]);
            case 'ASSIGN_TO_AGENT':
                return setActionCategory1Arr([]);
            case 'MAIL_TO_CUSTOMER':
                return setActionCategory1Arr([]);
            case 'MAIL_TO_FI_TEAM':
                return setActionCategory1Arr([]);
            case 'MAIL_TO_FI_AGENT':
                return setActionCategory1Arr([]);
            case 'MAIL_TO_SEPS_TEAM':
                return setActionCategory1Arr([]);
            case 'MAIL_TO_SEPS_AGENT':
                return setActionCategory1Arr([]);
        }
    }

    const updateActionCategory2Filter = async (selectedActionCat2) => {
        switch (selectedActionCat2) {
            case 'SEPS':
                return getTeamMemberLists('SEPS');
            case 'FI':
                return getTeamMemberLists('FI');
        }
    }

    const getEventActionsConditions = async (event) => {
        switch (event) {
            case 'CREATED':
                return [
                    setActionsArr(convertToLabelValue(masterData.createAction || {})),
                    getClaimTypeDropdownList()
                ];
            case 'SLA_BREACH':
                return setActionsArr(convertToLabelValue(masterData.slaBreachAction || {}));
            case 'SLA_DAYS_REMINDER':
                return setActionsArr(convertToLabelValue(masterData.slaDaysReminderAction || {}));
            case 'TICKET_DATE_EXTENSION':
                return setActionsArr(convertToLabelValue(masterData.ticketDateExtensionAction || {}));
            case 'TICKET_PRIORITY':
                return setActionsArr(convertToLabelValue(masterData.ticketPriorityAction || {}));
            case 'TICKET_STATUS':
                return setActionsArr(convertToLabelValue(masterData.ticketStatusAction || {}));
            default:
                return setActionsArr([]);
        }
    }

    const handleSubmit = async (values, actions) => {
        // setLoading(true);

        // try {
        //     const action = isEdit
        //         ? handleUpdateUser(id, { ...values })
        //         : handleAddUser({ ...values });

        //     const response = await action;
        //     toast.success(response.data.message);
        //     navigate('/team-management');
        // } catch (error) {
        //     const errorMessage = error.response?.data?.errorDescription;
        //     toast.error(errorMessage);
        // } finally {
        //     setLoading(false);
        //     actions.setSubmitting(false);
        // }
        console.log('submitted')
    };


    return (
        <React.Fragment>
            <Loader isLoading={loading} />
            <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
                <PageHeader title={`${isEdit ? t('EDIT_TICKET_WORKFLOW') : t('CREATE_NEW_TICKET_WORKFLOW')}  `} />
                <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
                    <Card.Body className="d-flex flex-column">
                        <CommonFormikComponent
                            validationSchema={ticketWorkflowSchema}
                            initialValues={initialValues}
                            onSubmit={handleSubmit}
                            enableReinitialize={true}
                        >
                            {(formikProps) => (
                                <React.Fragment>
                                    <div className="text-break d-flex flex-column small pt-0">

                                        {/* First Section Starts*/}
                                        <Row>
                                            {(currentUser === 'SUPER_ADMIN' || currentUser === 'SEPS_ADMIN') && (
                                                <Col sm={6} lg={4}>
                                                    <ReactSelect
                                                        label={`${t('ENTITY NAME')}*`}
                                                        options={organizationArr}
                                                        value={formikProps.values.entityId}
                                                        onChange={(option) => {
                                                            formikProps.setFieldValue("entityId", option?.value || "");
                                                        }}
                                                        name="entityId"
                                                        onBlur={formikProps.handleBlur}
                                                        error={formikProps.errors.entityId}
                                                        touched={formikProps.touched.entityId}
                                                    />
                                                </Col>
                                            )}
                                            <Col sm={6} lg={4}>
                                                <ReactSelect
                                                    label={t('INSTANCE_TYPE') + '*'}
                                                    options={instanceTypeArr}
                                                    value={formikProps.values.instanceTypeId || ""}
                                                    onChange={(option) => {
                                                        formikProps.setFieldValue(
                                                            "instanceTypeId",
                                                            option?.target?.value.toString() ?? ""
                                                        );
                                                    }}
                                                    name="instanceTypeId"
                                                    onBlur={formikProps.handleBlur}
                                                    error={formikProps.errors.instanceTypeId}
                                                    touched={formikProps.touched.instanceTypeId}
                                                />
                                            </Col>
                                            <Col sm={6} lg={4}>
                                                <FormInput
                                                    id="workflowName"
                                                    label={t('WORKFLOW_NAME') + '*'}
                                                    name="workflowName"
                                                    type="text"
                                                    onBlur={formikProps.handleBlur}
                                                    onChange={formikProps.handleChange}
                                                    value={formikProps.values.workflowName || ""}
                                                    error={formikProps.errors.workflowName}
                                                    touched={formikProps.touched.workflowName}
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col lg={8}>
                                                <FormInput
                                                    id="description"
                                                    label={t('DESCRIPTION')}
                                                    name="description"
                                                    type="text"
                                                    as="textarea"
                                                    rows="5"
                                                    onBlur={formikProps.handleBlur}
                                                    onChange={formikProps.handleChange}
                                                    value={formikProps.values.description || ""}
                                                    error={formikProps.errors.description}
                                                    touched={formikProps.touched.description}
                                                />
                                            </Col>
                                        </Row>
                                        {/* First Section Ends*/}

                                        {/* Event Section Starts*/}
                                        <div className="border-top mt-2 mx-n3 px-3">
                                            <Stack direction="horizontal" gap={2} className="mb-3 pb-1 pt-4">
                                                <h5 className="fw-semibold mb-0 me-auto">{t('EVENTS')}</h5>
                                            </Stack>
                                            <div className="position-relative custom-padding-right-66">
                                                <Row className="gx-4">
                                                    <Col sm={6} lg={4}>
                                                        <ReactSelect
                                                            label={t('EVENT_SELECTION') + '*'}
                                                            placeholder={t('SELECT')}
                                                            name="eventId"
                                                            wrapperClassName={'mb-3'}
                                                            options={eventTypeArr}
                                                            value={formikProps.values.eventId || ""}
                                                            onChange={(option) => {
                                                                formikProps.setFieldValue(
                                                                    "eventId",
                                                                    option?.target?.value.toString() ?? ""
                                                                );
                                                                formikProps.setFieldValue("conditions", [
                                                                    { conditionId: '', conditionCatId: '' },
                                                                ])
                                                                setConditionsArr([]);
                                                                setConditionsCatArr([]);
                                                                setSelectedEvent(option?.target?.value);
                                                                getEventActionsConditions(option?.target?.value);
                                                            }}
                                                            onBlur={formikProps.handleBlur}
                                                            error={formikProps.errors.eventId}
                                                            touched={formikProps.touched.eventId}
                                                        />
                                                    </Col>
                                                </Row>
                                            </div>

                                        </div>
                                        {/* Event Section Ends*/}

                                        {/* Condition Section Starts */}
                                        <div className="border-top mt-2 mx-n3 px-3">
                                            <Stack direction="horizontal" gap={2} className="mb-3 pb-1 pt-4">
                                                <div className="me-auto">
                                                    <h5 className="fw-semibold mb-0">{t('CONDITIONS')}</h5>
                                                    <p className="mb-0 text-muted">{t('CONDITION_MESSAGE')}</p>
                                                </div>

                                                <Button
                                                    variant="link"
                                                    className="link-dark border-0 text-decoration-none p-0 fw-semibold d-inline-flex align-items-center"
                                                    onClick={() =>
                                                        formikProps.setFieldValue("conditions", [
                                                            ...formikProps.values.conditions,
                                                            { conditionId: '', conditionCatId: '' },
                                                        ])
                                                    }
                                                >
                                                    <MdAddCircle size={20} aria-hidden={true} className="me-2 text-primary" /> {t('ADD_OR_CONDITION')}
                                                </Button>
                                            </Stack>

                                            {formikProps.values.conditions.map((condition, index) => (
                                                <div key={index} className="repeater-row">
                                                    <div className="position-relative custom-padding-right-66">
                                                        <Row className="gx-4">
                                                            <Col sm={6} lg={4}>
                                                                <ReactSelect
                                                                    placeholder={t('SELECT')}
                                                                    name={`conditions[${index}].conditionId`}
                                                                    options={conditionsArr}
                                                                    onBlur={formikProps.handleBlur}
                                                                    onChange={(option) => {
                                                                        formikProps.setFieldValue(
                                                                            `conditions[${index}].conditionId`,
                                                                            option?.target?.value
                                                                        )
                                                                        if (selectedEvent === 'CREATED') {
                                                                            getClaimSubTypes(option?.target?.value)
                                                                        }
                                                                    }
                                                                    }
                                                                    value={formikProps.values.conditions[index].conditionId}
                                                                    error={formikProps.errors?.conditions?.[index]?.conditionId}
                                                                    touched={formikProps.touched?.conditions?.[index]?.conditionId}
                                                                />
                                                            </Col>
                                                            <Col sm={6} lg={4}>
                                                                <ReactSelect
                                                                    placeholder={t('SELECT')}
                                                                    name={`conditions[${index}].conditionCatId`}
                                                                    options={conditionsCatArr}
                                                                    onBlur={formikProps.handleBlur}
                                                                    onChange={(option) =>
                                                                        formikProps.setFieldValue(
                                                                            `conditions[${index}].conditionCatId`,
                                                                            option?.target?.value
                                                                        )
                                                                    }
                                                                    value={formikProps.values.conditions[index].conditionCatId}
                                                                    error={formikProps.errors?.conditions?.[index]?.conditionCatId}
                                                                    touched={formikProps.touched?.conditions?.[index]?.conditionCatId}
                                                                />
                                                            </Col>
                                                            {index > 0 && (
                                                                <Col xs="auto" className="custom-margin-right--66 pe-0">
                                                                    <Button
                                                                        variant="link"
                                                                        aria-label="Remove"
                                                                        className="p-1 rounded custom-width-42 custom-height-42 d-flex align-items-center justify-content-center link-danger bg-danger-subtle"
                                                                        onClick={() => {
                                                                            const updatedConditions =
                                                                                formikProps.values.conditions.filter(
                                                                                    (_, i) => i !== index
                                                                                );
                                                                            formikProps.setFieldValue(
                                                                                "conditions",
                                                                                updatedConditions
                                                                            );
                                                                        }}
                                                                    >
                                                                        <MdClose size={24} />
                                                                    </Button>
                                                                </Col>
                                                            )}
                                                        </Row>
                                                    </div>

                                                    {index < formikProps.values.conditions.length - 1 && (
                                                        <div className="border-top my-4 position-relative">
                                                            <span className="bg-body fw-semibold position-absolute px-2 small start-50 top-50 translate-middle">{t('OR')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {/* Condition Section Ends */}


                                        {/* Actions Section Starts*/}
                                        <div className="border-top my-2 mx-n3 px-3">
                                            <Stack direction="horizontal" gap={2} className="mb-3 pb-1 pt-4">
                                                <div className="me-auto">
                                                    <h5 className="fw-semibold mb-0">{t('ACTIONS')}</h5>
                                                    <p className="mb-0 text-muted">{t('ACTION_MSG')}</p>
                                                </div>

                                                <Button
                                                    variant="link"
                                                    className="link-dark border-0 text-decoration-none p-0 fw-semibold d-inline-flex align-items-center"
                                                    onClick={() =>
                                                        formikProps.setFieldValue("actions", [
                                                            ...formikProps.values.actions,
                                                            { actionId: '', actionFilter1: '', actionFilter2: '' },
                                                        ])}
                                                >
                                                    <MdAddCircle size={20} aria-hidden={true} className="me-2 text-primary" /> {t('ADD_MORE')}
                                                </Button>
                                            </Stack>
                                            {formikProps.values.actions.map((action, index) => (

                                                <div key={index} className="repeater-row">
                                                    <div className="position-relative custom-padding-right-66">
                                                        <Row className="gx-4">
                                                            <Col sm={6} lg={4}>
                                                                <ReactSelect
                                                                    wrapperClassName={'mb-3'}
                                                                    placeholder={t('SELECT_ACTION')}
                                                                    name={`actions[${index}].actionId`}
                                                                    options={actionsArr}
                                                                    onBlur={formikProps.handleBlur}
                                                                    onChange={(option) =>
                                                                        formikProps.setFieldValue(
                                                                            `actions[${index}].actionId`,
                                                                            option?.target?.value
                                                                        )
                                                                    }
                                                                    value={formikProps.values.actions[index].actionId}
                                                                    error={formikProps.errors?.actions?.[index]?.actionId}
                                                                    touched={formikProps.touched?.actions?.[index]?.actionId}
                                                                />
                                                            </Col>
                                                            <Col sm={6} lg={4}>
                                                                <ReactSelect
                                                                    wrapperClassName={'mb-3'}
                                                                    placeholder={t('SELECT')}
                                                                    name={`actions[${index}].actionFilter1`}
                                                                    options={actionCategory1Arr}
                                                                    onBlur={formikProps.handleBlur}
                                                                    onChange={(option) => {
                                                                        formikProps.setFieldValue(
                                                                            `actions[${index}].actionFilter1`,
                                                                            option?.target?.value
                                                                        );
                                                                        updateActionCategory2Filter(option?.target?.value)
                                                                    }}
                                                                    value={formikProps.values.actions[index].actionFilter1}
                                                                    error={formikProps.errors?.actions?.[index]?.actionFilter1}
                                                                    touched={formikProps.touched?.actions?.[index]?.actionFilter1}
                                                                />
                                                            </Col>

                                                            <Col sm={6} lg={4}>
                                                                <ReactSelect
                                                                    wrapperClassName={'mb-3'}
                                                                    placeholder={t('SELECT')}
                                                                    name={`actions[${index}].actionFilter2`}
                                                                    options={actionCategory2Arr}
                                                                    onBlur={formikProps.handleBlur}
                                                                    onChange={(option) => {
                                                                        formikProps.setFieldValue(
                                                                            `actions[${index}].actionFilter2`,
                                                                            option?.target?.value
                                                                        );
                                                                        updateActionCategory2Filter(option?.target?.value)
                                                                    }}
                                                                    value={formikProps.values.actions[index].actionFilter2}
                                                                    error={formikProps.errors?.actions?.[index]?.actionFilter2}
                                                                    touched={formikProps.touched?.actions?.[index]?.actionFilter2}
                                                                />
                                                            </Col>

                                                            {index > 0 && (
                                                                <Col xs="auto" className="custom-margin-right--66 pe-0">
                                                                    <Button
                                                                        variant="link"
                                                                        aria-label="Remove"
                                                                        className="p-1 rounded custom-width-42 custom-height-42 d-flex align-items-center justify-content-center link-danger bg-danger-subtle"
                                                                        onClick={() => {
                                                                            const updatedActions =
                                                                                formikProps.values.actions.filter(
                                                                                    (_, i) => i !== index
                                                                                );
                                                                            formikProps.setFieldValue(
                                                                                "actions",
                                                                                updatedActions
                                                                            );
                                                                        }}
                                                                    >
                                                                        <MdClose size={24} />
                                                                    </Button>
                                                                </Col>
                                                            )}

                                                        </Row>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Action Section Ends*/}
                                    </div>

                                    <div className="theme-from-footer mt-auto border-top px-3 mx-n3 pt-3">
                                        <Stack
                                            direction="horizontal"
                                            gap={3}
                                            className="justify-content-end flex-wrap"
                                        >
                                            <Link
                                                to={"/tickets-workflow"}
                                                className="btn btn-outline-dark custom-min-width-85"
                                            >
                                                {t('CANCEL')}
                                            </Link>
                                            <Button
                                                type="submit"
                                                variant="warning"
                                                className="custom-min-width-85"
                                            >
                                                {isEdit ? t('UPDATE') : t('SUBMIT')}
                                            </Button>
                                        </Stack>
                                    </div>
                                </React.Fragment>
                            )}
                        </CommonFormikComponent>
                    </Card.Body>
                </Card>
            </div>

        </React.Fragment>
    );
}