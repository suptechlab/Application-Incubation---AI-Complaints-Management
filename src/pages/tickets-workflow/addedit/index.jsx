
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
import { getOrganizationList } from "../../../services/teamManagment.service";
import { convertToLabelValue } from "../../../services/ticketmanagement.service";
import { ticketWorkflowSchema } from "../../../validations/ticketWorkflow.validation";
import { addTicketWorkflow, editTicketWorkflow, getAgentList, getTeamList, getTeamMemberList, getTemplateList, handleGetWorkflowById } from "../../../services/ticketWorkflow.service";

export default function TicketWorkFlowAddEdit() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const { t } = useTranslation();

    const { masterData } = useContext(MasterDataContext);
    const [organizationArr, setOrganizationArr] = useState([]);
    const [instanceTypeArr, setInstanceTypeArr] = useState([]);
    const [claimTicketStatusArr, setClaimTicketStatusArr] = useState([]);
    const [claimTicketPriorityArr, setClaimTicketPriorityArr] = useState([]);
    const [eventTypeArr, setEventTypeArr] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState([]);
    const [selectedActions, setSelectedActions] = useState([]);
    const [conditionsArr, setConditionsArr] = useState([]);
    const [conditionsCatArr, setConditionsCatArr] = useState([]);
    const [actionsArr, setActionsArr] = useState([]);
    const [actionCategory1Arr, setActionCategory1Arr] = useState([]);
    const [actionCategory2Arr, setActionCategory2Arr] = useState([]);
    const { currentUser, userData } = useContext(AuthenticationContext);
    const [conditionLabel, setConditionLabel] = useState('')

    const [selectedConditions, setSelectedConditions] = useState([]);

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
        userType: currentUser ?? ""
    });

    // All Api Calls 

    const getOrganizationLists = async () => {
        setLoading(true);
        try {
            await getOrganizationList().then((response) => {
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

    const getTeamLists = async (orgId) => {
        setLoading(true);
        try {
            const response = orgId
                ? await getTeamList(orgId)
                : await getTeamList();

            const formattedData = response.data.map((item) => ({
                label: item.name,
                value: item.id
            }));

            setActionCategory1Arr(formattedData);
        } catch (error) {
            console.error("Error fetching team list:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTeamMemberLists = async (teamId) => {
        setLoading(true);
        try {
            const response = await getTeamMemberList(teamId);
            const formattedData = response.data.map((item) => ({
                label: item.name,
                value: item.id
            }));
            setActionCategory2Arr(formattedData);
        } catch (error) {
            console.error("Error fetching team list:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTemplateLists = async (type) => {
        setLoading(true);
        try {
            const response = await getTemplateList();
            const formattedData = response.data.map((item) => ({
                label: item.name,
                value: item.id
            }));
            if (type === 'actionFilter2') {
                setActionCategory2Arr(formattedData);
            } else {
                setActionCategory1Arr(formattedData);
            }
        } catch (error) {
            console.error("Error fetching team list:", error);
        } finally {
            setLoading(false);
        }
    };

    const getClaimTypeDropdownList = () => {
        setLoading(true);
        claimTypesDropdownList().then(response => {
            if (response?.data && response?.data?.length > 0) {
                const dropdownData = response?.data.map(item => ({
                    value: item.id,
                    label: item.name
                }));
                setConditionsArr([{ label: t('SELECT'), value: '' }, ...dropdownData]);
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

    const getAgentLists = async (orgId) => {
        setLoading(true);
        try {
            const response = orgId
                ? await getAgentList(orgId)
                : await getAgentList();

            const formattedData = response.data.map((item) => ({
                label: item.name,
                value: item.id
            }));
            setActionCategory1Arr(formattedData);
        } catch (error) {
            console.error("Error fetching team list:", error);
        } finally {
            setLoading(false);
        }
    };

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
        getOrganizationLists();
        if (masterData) {
            setInstanceTypeArr(convertToLabelValue(masterData.instanceType || {}));
            setEventTypeArr(convertToLabelValue(masterData.ticketWorkflowEvent || {}));
            setClaimTicketStatusArr(convertToLabelValue(masterData.claimTicketStatus || {}));
            setClaimTicketPriorityArr(convertToLabelValue(masterData.claimTicketPriority || {}));
        }
        if (currentUser) {

            const instanceType = currentUser === 'FI_ADMIN' ? 'FIRST_INSTANCE' : ""

            setInitialValues({
                userType: currentUser,
                entityId: "",
                eventId: "",
                instanceTypeId: instanceType ?? '',
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
                if (selectedOrg) {
                    return await getTeamLists(selectedOrg);
                } else {
                    return getTeamLists();
                }
                break;
            case 'ASSIGN_TO_AGENT':
                if (selectedOrg) {
                    return await getAgentLists(selectedOrg);
                } else {
                    return getAgentLists();
                }
                break;
            case 'MAIL_TO_CUSTOMER':
                return getTemplateLists('actionFilter1');
                break;
            case 'MAIL_TO_FI_TEAM':
            case 'MAIL_TO_FI_AGENT':
                if (selectedOrg) {
                    return await getAgentLists(selectedOrg);
                } else {
                    return getAgentLists();
                }
                break;
            case 'MAIL_TO_SEPS_TEAM':
            case 'MAIL_TO_SEPS_AGENT':
                if (selectedOrg) {
                    return await getAgentLists(selectedOrg);
                } else {
                    return getAgentLists();
                }
                break;
                return setActionCategory1Arr([]);
        }
    };

    const updateActionCategory2Filter = async (selectedAction, selectedValue) => {
        switch (selectedAction) {
            case 'ASSIGN_TO_TEAM':
                if (selectedValue) {
                    return getTeamMemberLists(selectedValue);
                }
                break;
            case 'ASSIGN_TO_AGENT':
                return await getTemplateLists('actionFilter2');
                break;
            case 'MAIL_TO_FI_TEAM':
            case 'MAIL_TO_FI_AGENT':
                return getTemplateLists('actionFilter2');
                break;
            case 'MAIL_TO_SEPS_TEAM':
            case 'MAIL_TO_SEPS_AGENT':
                return getTemplateLists('actionFilter2');
                break;
                return setActionCategory1Arr([]);
        }
    };

    const getEventActionsConditions = async (event) => {
        switch (event) {
            case 'CREATED':
                return [
                    setActionsArr([{ label: t('SELECT'), value: 'select', disabled: true }, ...convertToLabelValue(masterData?.createAction || {})]),
                    getClaimTypeDropdownList()
                ];
            case 'SLA_BREACH':
                return [
                    setActionsArr([{ label: t('SELECT'), value: '' }, ...convertToLabelValue(masterData?.slaBreachAction || {})])
                ];
            case 'SLA_DAYS_REMINDER':
                return [
                    setActionsArr([{ label: t('SELECT'), value: '' }, ...convertToLabelValue(masterData?.slaDaysReminderAction || {})])
                ];
            case 'TICKET_DATE_EXTENSION':
                return setActionsArr([{ label: t('SELECT'), value: '' }, ...convertToLabelValue(masterData?.ticketDateExtensionAction || {})]);
            case 'TICKET_PRIORITY':
                return [
                    setActionsArr([{ label: t('SELECT'), value: '' }, ...convertToLabelValue(masterData?.ticketPriorityAction || {})]),
                    setConditionsArr([{ label: t('SELECT'), value: '' }, ...claimTicketPriorityArr])
                ];
            case 'TICKET_STATUS':
                return [
                    setActionsArr([{ label: t('SELECT'), value: '' }, ...convertToLabelValue(masterData?.ticketStatusAction || {})]),
                    setConditionsArr([{ label: t('SELECT'), value: '' }, ...claimTicketStatusArr])
                ];
            default:
                return setActionsArr([{ label: t('SELECT'), value: '' }]);
        }

    }




    const getConditionLabel = async (value) => {
        switch (value) {
            case 'CREATED':
                setConditionLabel('Claim Type')
                break;
            case 'TICKET_PRIORITY':
                setConditionLabel('Ticket Priority')
                break;
            case 'TICKET_STATUS':
                setConditionLabel('Ticket Status')
                break;
            default:
                setConditionLabel('')
                break;
        }
    }

    const generateDynamicPayload = (selectedEvent, values) => {

        const eventKeyMap = {
            CREATED: {
                conditionsKey: "createConditions",
                actionsKey: "createActions",
                conditionFields: { conditionId: "claimTypeId", conditionCatId: "claimSubTypeId" },
                actionFields: {
                    ASSIGN_TO_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId" },
                    ASSIGN_TO_AGENT: { actionId: "action", actionFilter1: "agentId", actionFilter2: "templateId" },
                    MAIL_TO_FI_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", templateId: "templateId" },
                    MAIL_TO_FI_AGENT: { actionId: "action", actionFilter1: "agentId", actionFilter2: "templateId" },
                    MAIL_TO_SEPS_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", templateId: "templateId" },
                    MAIL_TO_SEPS_AGENT: { actionId: "action", actionFilter1: "agentId", actionFilter2: "templateId" },
                    MAIL_TO_CUSTOMER: { actionId: "action", actionFilter1: "templateId" },
                },
            },
            TICKET_STATUS: {
                conditionsKey: "ticketStatusConditions",
                actionsKey: "ticketStatusActions",
                conditionFields: { conditionId: "status" },
                actionFields: {
                    MAIL_TO_FI_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", templateId: "templateId" },
                    MAIL_TO_FI_AGENT: { actionId: "action", actionFilter1: "agentId", actionFilter2: "templateId" },
                    MAIL_TO_SEPS_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", templateId: "templateId" },
                    MAIL_TO_SEPS_AGENT: { actionId: "action", actionFilter1: "agentId", actionFilter2: "templateId" },
                },
            },
            TICKET_PRIORITY: {
                conditionsKey: "ticketPriorityConditions",
                actionsKey: "ticketPriorityActions",
                conditionFields: { conditionId: "priority" },
                actionFields: {
                    MAIL_TO_FI_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", templateId: "templateId" },
                    MAIL_TO_FI_AGENT: { actionId: "action", actionFilter1: "agentId", actionFilter2: "templateId" },
                    MAIL_TO_SEPS_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", templateId: "templateId" },
                    MAIL_TO_SEPS_AGENT: { actionId: "action", actionFilter1: "agentId", actionFilter2: "templateId" }
                },
            },
            SLA_DAYS_REMINDER: {
                conditionsKey: "slaDaysReminderConditions",
                actionsKey: "slaDaysReminderActions",
                conditionFields: { conditionId: "noOfDays" },
                actionFields: {
                    MAIL_TO_FI_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", templateId: "templateId" },
                    MAIL_TO_FI_AGENT: { actionId: "action", actionFilter1: "agentId", actionFilter2: "templateId" },
                    MAIL_TO_SEPS_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", templateId: "templateId" },
                    MAIL_TO_SEPS_AGENT: { actionId: "action", actionFilter1: "agentId", actionFilter2: "templateId" },
                },
            },
            SLA_BREACH: {
                actionsKey: "slaBreachActions",
                actionFields: {
                    MAIL_TO_FI_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", templateId: "templateId" },
                    MAIL_TO_FI_AGENT: { actionId: "action", actionFilter1: "agentId", actionFilter2: "templateId" },
                    MAIL_TO_SEPS_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", templateId: "templateId" },
                    MAIL_TO_SEPS_AGENT: { actionId: "action", actionFilter1: "agentId", actionFilter2: "templateId" },
                },
            },
            TICKET_DATE_EXTENSION: {
                actionsKey: "ticketPriorityActions",
                actionFields: {
                    MAIL_TO_FI_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", templateId: "templateId" },
                    MAIL_TO_FI_AGENT: { actionId: "action", actionFilter1: "agentId", actionFilter2: "templateId" },
                    MAIL_TO_SEPS_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", templateId: "templateId" },
                    MAIL_TO_SEPS_AGENT: { actionId: "action", actionFilter1: "agentId", actionFilter2: "templateId" },
                },
            }
        };
        const { conditionsKey, actionsKey, conditionFields, actionFields } = eventKeyMap[selectedEvent] || {};

        if (!actionsKey || !actionFields) {
            throw new Error(`Invalid event type: ${selectedEvent}`);
        }

        let conditions;
        if (conditionsKey && conditionFields) {
            conditions = values?.conditions.map((item) => {
                const transformedCondition = {};
                Object.keys(conditionFields).forEach((key) => {
                    transformedCondition[conditionFields[key]] = item[key];
                });
                return transformedCondition;
            });
        }

        const actions = values?.actions.map((item) => {
            const specificActionFields = actionFields[item.actionId];
            if (!specificActionFields) {
                throw new Error(`Invalid action type: ${item.actionId}`);
            }
            const transformedAction = {};
            Object.keys(specificActionFields).forEach((key) => {
                transformedAction[specificActionFields[key]] = item[key];
            });
            return transformedAction;
        });


        const organizationId = currentUser === 'FI_ADMIN' ? userData?.organizationId : values?.entityId


        const payload = {
            ...(conditionsKey ? { [conditionsKey]: conditions } : {}),
            [actionsKey]: actions,
            organizationId: organizationId,
            instanceType: values.instanceTypeId,
            title: values.workflowName,
            description: values.description,
            event: values.eventId
        };

        return payload;
    };

    const handleSubmit = async (values, actions) => {
        // setLoading(true);
        actions.setSubmitting(true);

        const payload = generateDynamicPayload(selectedEvent, values);

        console.log('payload', payload)

        try {
            const action = isEdit
                ? editTicketWorkflow(id, { ...payload })
                : addTicketWorkflow({ ...payload });

            const response = await action;
            toast.success(response.data.message);
            navigate('/tickets-workflow');
        } catch (error) {
            const errorMessage = error.response?.data?.errorDescription;
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            actions.setSubmitting(false);
        }
    };


    // HANDLE CONDITION CHANGE
    const handleConditionChange = (formikProps, value, index) => {

        setSelectedConditions((prevSelectedConditions) => {
            const updatedSelectedConditions = [...prevSelectedConditions];
            const previousValue = formikProps.values.conditions[index]?.conditionId;

            // Remove the previous value from the selected conditions
            if (previousValue) {
                const prevIndex = updatedSelectedConditions.indexOf(previousValue);
                if (prevIndex > -1) {
                    updatedSelectedConditions.splice(prevIndex, 1);
                }
            }

            // Add the new value to the selected conditions
            if (value) {
                updatedSelectedConditions.push(value);
            }

            // Update Formik's field value
            formikProps.setFieldValue(`conditions[${index}].conditionId`, value);

            // Additional logic for specific events
            if (selectedEvent === 'CREATED') {
                getClaimSubTypes(value);
            }

            return updatedSelectedConditions;
        });

    };

    const isOptionDisabled = (value) => {
        // Disable the option if it is already selected and not the current value
        return selectedConditions.includes(value);
    };


    const handleActionChange = (formikProps, value, index) => {
        setSelectedActions((prevSelectedActions) => {
            const updatedSelectedActions = [...prevSelectedActions];
            const previousValue = formikProps.values.actions[index]?.actionId;

            // Remove the previous value from the selected actions
            if (previousValue) {
                const prevIndex = updatedSelectedActions.indexOf(previousValue);
                if (prevIndex > -1) {
                    updatedSelectedActions.splice(prevIndex, 1);
                }
            }

            if (previousValue === 'ASSIGN_TO_AGENT') {
                const prevIndex = updatedSelectedActions.indexOf('ASSIGN_TO_TEAM');
                if (prevIndex > -1) {
                    updatedSelectedActions.splice(prevIndex, 1);
                }
            }

            if (previousValue === 'ASSIGN_TO_TEAM') {
                const prevIndex = updatedSelectedActions.indexOf('ASSIGN_TO_AGENT');
                if (prevIndex > -1) {
                    updatedSelectedActions.splice(prevIndex, 1);
                }
            }

            // Add the new value to the selected actions
            if (value) {
                updatedSelectedActions.push(value);
            }

            if (value === 'ASSIGN_TO_AGENT') {
                updatedSelectedActions.push('ASSIGN_TO_TEAM');
            }
            if (value === 'ASSIGN_TO_TEAM') {
                updatedSelectedActions.push('ASSIGN_TO_AGENT');
            }

            // Update Formik's field value
            formikProps.setFieldValue(`actions[${index}].actionId`, value);

            // Reset and update action categories
            setActionCategory1Arr([]);
            setActionCategory2Arr([]);
            updateActionCategory1Filter(value);

            return updatedSelectedActions;
        });

        // Update the disabled state of options
        setActionsArr((prevActionsArr) =>
            prevActionsArr.map((action) => {
                if (action.value === 'ASSIGN_TO_TEAM' || action.value === 'ASSIGN_TO_AGENT') {
                    return {
                        ...action,
                        isDisabled: value === 'ASSIGN_TO_TEAM' || value === 'ASSIGN_TO_AGENT',
                    };
                }
                return action;
            })
        );
    };


    // const isActionDisabled = (value, currentValue) => {
    //     return selectedActions.includes(value) && currentValue !== value;
    // };

    const isActionDisabled = (value, currentValue) => {
        // Specific logic for ASSIGN_TO_TEAM and ASSIGN_TO_AGENT
        if ((value === 'ASSIGN_TO_TEAM' || value === 'ASSIGN_TO_AGENT')) {
            return (
                selectedActions.includes('ASSIGN_TO_TEAM') ||
                selectedActions.includes('ASSIGN_TO_AGENT')
            ) && !(currentValue === 'ASSIGN_TO_TEAM' || currentValue === 'ASSIGN_TO_AGENT');
        }

        // General logic for other values
        return selectedActions.includes(value) && currentValue !== value;
    };



    const getTicketWorkflowData = () => {
        setLoading(true)
        handleGetWorkflowById(id).then(response => {
            const responseValues = response?.data
            if (responseValues?.event) {
                const newEventId = responseValues?.event
                setSelectedEvent(newEventId);
                getEventActionsConditions(newEventId);
                getConditionLabel(newEventId);
            }

            let conditions = [
                {
                    conditionId: "",
                    conditionCatId: "",
                },
            ]

            // Process conditions
            // const conditions = apiResponse[conditionsKey]?.map((condition) => ({
            //     conditionId: condition[conditionFields.conditionId] ?? "",
            //     conditionCatId: condition[conditionFields.conditionCatId] ?? "",
            // })) ?? [];

            // switch (responseValues.event) {
            //     case 'CREATED':


                  

            //         break;
            //     default:
            //         conditions = [
            //             {
            //                 conditionId: "",
            //                 conditionCatId: "",
            //             },
            //         ]

            // }

          
            let actions = [
                {
                    actionId: "",
                    actionFilter1: "",
                    actionFilter2: "",
                },
            ]


            setInitialValues({
                entityId: responseValues.organizationId?.toString() ?? "",
                instanceTypeId: responseValues.instanceType ?? "",
                eventId: responseValues.event ?? "",
                workflowName: responseValues.title ?? "",
                description: responseValues.description ?? "",
                conditions: conditions,
                actions: actions,
                userType: currentUser ?? "",
            })

        }).catch((error) => {
            if (error?.response?.data?.errorDescription) {
                toast.error(error?.response?.data?.errorDescription);
            } else {
                toast.error(error?.message ?? "FAILED TO FETCH TICKET WORKFLOW DETAILS");
            }
        }).finally(() => {
            setLoading(false)
        })
    }

    useEffect(() => {
        if (isEdit === true && masterData) {
            getTicketWorkflowData()
        }
    }, [isEdit, masterData])

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
                                                    disabled={currentUser === 'FI_ADMIN' ? true : false}
                                                />
                                            </Col>
                                            {(currentUser === 'SUPER_ADMIN' || currentUser === 'SEPS_ADMIN') && (
                                                <Col sm={6} lg={4}>
                                                    <ReactSelect
                                                        label={`${t('ENTITY NAME')}*`}
                                                        options={organizationArr}
                                                        value={formikProps.values.entityId}
                                                        onChange={(option) => {
                                                            formikProps.setFieldValue("entityId", option?.target?.value || "");
                                                            setSelectedOrg(option?.target?.value);
                                                        }}
                                                        name="entityId"
                                                        onBlur={formikProps.handleBlur}
                                                        error={formikProps.errors.entityId}
                                                        touched={formikProps.touched.entityId}
                                                    />
                                                </Col>
                                            )}
                                        </Row>
                                        <Row>
                                            <Col lg={8}>
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

                                                                const newEventId = option?.target?.value.toString() ?? "";

                                                                // Reset formik values for conditions and actions
                                                                formikProps.setFieldValue("eventId", newEventId);
                                                                formikProps.setFieldValue("conditions", [{ conditionId: '', conditionCatId: '' }]);
                                                                formikProps.setFieldValue("actions", [{ actionId: '', actionFilter1: '', actionFilter2: '' }]);

                                                                // Reset local states
                                                                setConditionsArr([]);
                                                                setConditionsCatArr([]);
                                                                setActionsArr([]);
                                                                setActionCategory1Arr([]);
                                                                setActionCategory2Arr([]);

                                                                // Set selected event and fetch related data
                                                                setSelectedEvent(newEventId);
                                                                getEventActionsConditions(newEventId);
                                                                getConditionLabel(newEventId);
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
                                        {selectedEvent !== 'SLA_BREACH' && selectedEvent !== 'TICKET_DATE_EXTENSION' && (
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
                                                            formikProps.setFieldValue('conditions', [
                                                                ...formikProps.values.conditions,
                                                                { conditionId: '', conditionCatId: '' },
                                                            ])
                                                        }
                                                    >
                                                        <MdAddCircle size={20} aria-hidden className="me-2 text-primary" /> {t('ADD_OR_CONDITION')}
                                                    </Button>
                                                </Stack>


                                                {formikProps.values.conditions.map((condition, index) => (
                                                    <div key={index} className="repeater-row">
                                                        <div className="position-relative custom-padding-right-66">
                                                            <Row className="gx-4 align-items-center">
                                                                {selectedEvent !== 'SLA_DAYS_REMINDER' ? (
                                                                    <Col sm={6} lg={4}>
                                                                        <ReactSelect
                                                                            placeholder={t('SELECT')}
                                                                            name={`conditions[${index}].conditionId`}
                                                                            // options={conditionsArr}
                                                                            options={conditionsArr.map((option) => ({
                                                                                ...option,
                                                                                isDisabled: isOptionDisabled(option.value) && condition.conditionId !== option.value,
                                                                            }))}
                                                                            onBlur={formikProps.handleBlur}
                                                                            onChange={(option) => {
                                                                                handleConditionChange(formikProps, option?.target?.value, index)
                                                                                // formikProps.setFieldValue(
                                                                                //     `conditions[${index}].conditionId`,
                                                                                //     option?.target?.value
                                                                                // );
                                                                                // if (selectedEvent === 'CREATED') {
                                                                                //     getClaimSubTypes(option?.target?.value);
                                                                                // }
                                                                            }}
                                                                            label={conditionLabel}
                                                                            value={formikProps?.values?.conditions[index].conditionId}
                                                                            error={formikProps.errors?.conditions?.[index]?.conditionId}
                                                                            touched={formikProps.touched?.conditions?.[index]?.conditionId}
                                                                        />
                                                                    </Col>
                                                                ) : (
                                                                    <Col sm={6} lg={4}>
                                                                        <FormInput
                                                                            id={`conditions[${index}].conditionId`}
                                                                            placeholder="Enter Days"
                                                                            name={`conditions[${index}].conditionId`}
                                                                            type="text"
                                                                            onBlur={formikProps.handleBlur}
                                                                            onChange={formikProps.handleChange}
                                                                            label="SLA Days"
                                                                            value={formikProps.values.conditions[index]?.conditionId || ''}
                                                                            error={formikProps.errors?.conditions?.[index]?.conditionId}
                                                                            touched={formikProps.touched?.conditions?.[index]?.conditionId}
                                                                        />
                                                                    </Col>
                                                                )}
                                                                {selectedEvent === 'CREATED' && (
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
                                                                            value={conditionsCatArr.find(
                                                                                (opt) => opt.value === formikProps.values.conditions[index].conditionCatId
                                                                            )}
                                                                            label="Claim Sub Type"
                                                                            error={formikProps.errors?.conditions?.[index]?.conditionCatId}
                                                                            touched={formikProps.touched?.conditions?.[index]?.conditionCatId}
                                                                        />
                                                                    </Col>
                                                                )}
                                                                {index > 0 && (
                                                                    <Col xs="auto" className="custom-margin-right--66 pe-0">
                                                                        <Button
                                                                            variant="link"
                                                                            aria-label="Remove"
                                                                            className="p-1 rounded custom-width-42 custom-height-42 d-flex align-items-center justify-content-center link-danger bg-danger-subtle"
                                                                            onClick={() => {
                                                                                const updatedConditions = formikProps.values.conditions.filter(
                                                                                    (_, i) => i !== index
                                                                                );
                                                                                formikProps.setFieldValue('conditions', updatedConditions);
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
                                                                <span className="bg-body fw-semibold position-absolute px-2 small start-50 top-50 translate-middle">
                                                                    {t('OR')}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                                                                    // options={actionsArr}
                                                                    options={actionsArr.map((option) => ({
                                                                        ...option,
                                                                        isDisabled: isActionDisabled(option.value, formikProps.values.actions[index]?.actionId),
                                                                    }))}
                                                                    onBlur={formikProps.handleBlur}
                                                                    onChange={(option) => {
                                                                        handleActionChange(formikProps, option?.target?.value, index)
                                                                        // formikProps.setFieldValue(
                                                                        //     `actions[${index}].actionId`,
                                                                        //     option?.target?.value
                                                                        // )
                                                                        // setActionCategory1Arr([]);
                                                                        // setActionCategory2Arr([]);
                                                                        // updateActionCategory1Filter(option?.target?.value)
                                                                    }}
                                                                    value={formikProps.values.actions[index]?.actionId}
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
                                                                        updateActionCategory2Filter(formikProps.values.actions[index].actionId, option?.target?.value)
                                                                    }}
                                                                    value={formikProps.values.actions[index].actionFilter1}
                                                                    error={formikProps.errors?.actions?.[index]?.actionFilter1}
                                                                    touched={formikProps.touched?.actions?.[index]?.actionFilter1}
                                                                />
                                                            </Col>

                                                            {formikProps.values.actions[index].actionId !== 'MAIL_TO_CUSTOMER' &&
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
                                                                        }}
                                                                        value={formikProps.values.actions[index].actionFilter2}
                                                                        error={formikProps.errors?.actions?.[index]?.actionFilter2}
                                                                        touched={formikProps.touched?.actions?.[index]?.actionFilter2}
                                                                    />
                                                                </Col>
                                                            }
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