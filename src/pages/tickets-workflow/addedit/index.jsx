
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
import { addTicketWorkflow, editTicketWorkflow, getAgentList, getTeamList, getTeamMemberList, getTemplateList, handleGetWorkflowById } from "../../../services/ticketWorkflow.service";
import { ticketWorkflowSchema } from "../../../validations/ticketWorkflow.validation";

export default function TicketWorkFlowAddEdit() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const { t } = useTranslation();

    const { masterData } = useContext(MasterDataContext);
    const [organizationArr, setOrganizationArr] = useState([]);
    const [instanceTypeArr, setInstanceTypeArr] = useState([]);
    const [eventTypeArr, setEventTypeArr] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState([]);
    const [selectedActions, setSelectedActions] = useState([]);
    const [conditionsArr, setConditionsArr] = useState([]);
    const [conditionsCatArr, setConditionsCatArr] = useState({});
    const [actionsArr, setActionsArr] = useState([]);
    const [actionCategory1Arr, setActionCategory1Arr] = useState({});
    const [actionCategory2Arr, setActionCategory2Arr] = useState({});
    const [actionCategory3Arr, setActionCategory3Arr] = useState({});
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

    const getTeamLists = async (orgId, index) => {
        setLoading(true);
        try {
            const response = (orgId && orgId !== null)
                ? await getTeamList(orgId)
                : await getTeamList();

            const formattedData = response.data.map((item) => ({
                label: item.name,
                value: item.id
            }));

            // setActionCategory1Arr(formattedData);

            setActionCategory1Arr((prev) => {
                return {
                    ...prev,
                    [index]: formattedData,
                };
            });
        } catch (error) {
            console.error("Error fetching team list:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTeamMemberLists = async (teamId, index) => {
        setLoading(true);
        try {
            const response = await getTeamMemberList(teamId);
            const formattedData = response.data.map((item) => ({
                label: item.name,
                value: item.id
            }));
            // setActionCategory2Arr(formattedData);
            setActionCategory2Arr((prev) => {
                return {
                    ...prev,
                    [index]: formattedData,
                };
            })
        } catch (error) {
            console.error("Error fetching team list:", error);
        } finally {
            setLoading(false);
        }
    };

    // GET TEMPLATE LIST FOR ACTION'S TEMPLATE DROPDOWN
    const getTemplateLists = async (type, index, actionCategory) => {
        setLoading(true);
        try {
            const response = await getTemplateList(type);
            const formattedData = response.data.map((item) => ({
                label: item.name,
                value: item.id
            }));

            if (actionCategory && actionCategory === 'actionCategory3') {
                setActionCategory3Arr((prev) => {
                    return {
                        ...prev,
                        [index]: formattedData,
                    };
                });
            } else {
                setActionCategory1Arr((prev) => {
                    return {
                        ...prev,
                        [index]: formattedData,
                    };
                });
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

    const getAgentLists = async (orgId, index) => {
        setLoading(true);
        try {
            const response = orgId
                ? await getAgentList(orgId)
                : await getAgentList();

            const formattedData = response.data.map((item) => ({
                label: item.name,
                value: item.id
            }));
            // setActionCategory1Arr(formattedData);
            setActionCategory1Arr((prev) => ({
                ...prev,
                [index]: formattedData,
            }))
        } catch (error) {
            console.error("Error fetching team list:", error);
        } finally {
            setLoading(false);
        }
    };

    const getClaimSubTypes = useCallback(async (index, claimId) => {
        setLoading(true);
        try {
            const response = await getClaimSubTypeById(claimId);
            const claimSubTypeFormatList = response?.data
                ? [{ label: response.data.name, value: response.data.id }]
                : [];
            // setConditionsCatArr(claimSubTypeFormatList);

            setConditionsCatArr((prev) => ({
                ...prev,
                [index]: claimSubTypeFormatList,
            }))
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
            // setClaimTicketStatusArr(convertToLabelValue(masterData.claimTicketStatus || {}));
            // setClaimTicketPriorityArr(convertToLabelValue(masterData.claimTicketPriority || {}));
        }
        if (currentUser) {

            const instanceType = currentUser === 'FI_USER' ? 'FIRST_INSTANCE' : ""

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

    const updateActionCategory1Filter = async (selectedActionCat1, index, instanceType) => {
        switch (selectedActionCat1) {
            case 'MAIL_TO_CUSTOMER':
                getTemplateLists('CUSTOMER', index);
                break;
            case 'MAIL_TO_FI_AGENT':
                getTemplateLists('FI', index);
                break;
            case 'MAIL_TO_SEPS_AGENT':
                getTemplateLists('SEPS', index);
                break;
            case 'ASSIGN_TO_AGENT':
                if (selectedOrg) {
                    return await getAgentLists(selectedOrg, index);
                } else {
                    return getAgentLists(null, index);
                }
            case 'ASSIGN_TO_TEAM':
                if (instanceType === "FIRST_INSTANCE" && selectedOrg) {
                    return await getTeamLists(selectedOrg, index);
                } else {
                    return getTeamLists(null, index);
                }
            case 'MAIL_TO_SEPS_TEAM':
                getTeamLists(null, index);
                getTemplateLists('SEPS', index, 'actionCategory3');

                break;
            case 'MAIL_TO_FI_TEAM':
                if (selectedOrg) {
                    getTemplateLists('FI', index, 'actionCategory3');
                    return await getTeamLists(selectedOrg, index);
                } else {
                    toast.error(t("SELECT_ORGANIZATION_ID_MSG"))
                    // return getTeamLists(null, index);
                }
                break;
            default:
                // setActionCategory1Arr([]);
                break;
        }
    };

    const updateActionCategory2Filter = async (selectedAction, selectedValue, index) => {

        switch (selectedAction) {
            case 'ASSIGN_TO_TEAM':
            case 'MAIL_TO_FI_TEAM':
            case 'MAIL_TO_SEPS_TEAM':
                if (selectedValue) {
                    return getTeamMemberLists(selectedValue, index);
                }
                break;

        }
    };


    const updateActionCategory3Filter = (selectedAction, selectedValue, index) => {
        if (selectedAction === 'MAIL_TO_SEPS_TEAM') {
            getTemplateLists('SEPS', index);
        } else if (selectedAction === 'MAIL_TO_FI_TEAM') {
            getTemplateLists('FI', index);
        }
    }
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
                    setConditionsArr([{ label: t('SELECT'), value: '' }, ...convertToLabelValue(masterData.claimTicketPriority || {})])
                ];
            case 'TICKET_STATUS':
                return [
                    setActionsArr([{ label: t('SELECT'), value: '' }, ...convertToLabelValue(masterData?.ticketStatusAction || {})]),
                    setConditionsArr([{ label: t('SELECT'), value: '' }, ...convertToLabelValue(masterData.claimTicketStatus || {})])
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

    // GENERATE DYNAMIC PAYLOAD FOR FORM SUBMIT
    const generateDynamicPayload = (selectedEvent, values) => {

        const eventKeyMap = {
            CREATED: {
                conditionsKey: "createConditions",
                actionsKey: "createActions",
                conditionFields: { DEFAULT: { conditionId: "claimTypeId", conditionCatId: "claimSubTypeId" } },
                actionFields: {
                    ASSIGN_TO_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId" },
                    ASSIGN_TO_AGENT: { actionId: "action", actionFilter1: "agentId" },
                    MAIL_TO_FI_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", actionFilter3: "templateId" },
                    MAIL_TO_SEPS_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", actionFilter3: "templateId" },
                    MAIL_TO_SEPS_AGENT: { actionId: "action", actionFilter1: "templateId" },
                    MAIL_TO_FI_AGENT: { actionId: "action", actionFilter1: "templateId" },
                    MAIL_TO_CUSTOMER: { actionId: "action", actionFilter1: "templateId" },
                },
            },
            TICKET_STATUS: {
                conditionsKey: "ticketStatusConditions",
                actionsKey: "ticketStatusActions",
                // conditionFields: { conditionId: "status",conditionCatId:'' },
                conditionFields: {
                    CLOSED: { conditionId: "status", conditionCatId: "closedStatus" },
                    REJECTED: { conditionId: "status", conditionCatId: "rejectedStatus" },
                    DEFAULT: { conditionId: "status" }
                },
                actionFields: {
                    MAIL_TO_FI_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", actionFilter3: "templateId" },
                    MAIL_TO_SEPS_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", actionFilter3: "templateId" },
                    MAIL_TO_SEPS_AGENT: { actionId: "action", actionFilter1: "templateId" },
                    MAIL_TO_FI_AGENT: { actionId: "action", actionFilter1: "templateId" },
                    MAIL_TO_CUSTOMER: { actionId: "action", actionFilter1: "templateId" },
                },
            },
            TICKET_PRIORITY: {
                conditionsKey: "ticketPriorityConditions",
                actionsKey: "ticketPriorityActions",
                conditionFields: { DEFAULT: { conditionId: "priority" } },
                actionFields: {
                    MAIL_TO_FI_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", actionFilter3: "templateId" },
                    MAIL_TO_SEPS_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", actionFilter3: "templateId" },
                    MAIL_TO_SEPS_AGENT: { actionId: "action", actionFilter1: "templateId" },
                    MAIL_TO_FI_AGENT: { actionId: "action", actionFilter1: "templateId" },
                    MAIL_TO_CUSTOMER: { actionId: "action", actionFilter1: "templateId" },
                },
            },
            SLA_DAYS_REMINDER: {
                conditionsKey: "slaDaysReminderConditions",
                actionsKey: "slaDaysReminderActions",
                conditionFields: { DEFAULT: { conditionId: "noOfDays" } },
                actionFields: {
                    MAIL_TO_FI_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", actionFilter3: "templateId" },
                    MAIL_TO_SEPS_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", actionFilter3: "templateId" },
                    MAIL_TO_SEPS_AGENT: { actionId: "action", actionFilter1: "templateId" },
                    MAIL_TO_FI_AGENT: { actionId: "action", actionFilter1: "templateId" },
                    MAIL_TO_CUSTOMER: { actionId: "action", actionFilter1: "templateId" },
                },
            },
            SLA_BREACH: {
                actionsKey: "slaBreachActions",
                actionFields: {
                    MAIL_TO_FI_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", actionFilter3: "templateId" },
                    MAIL_TO_SEPS_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", actionFilter3: "templateId" },
                    MAIL_TO_SEPS_AGENT: { actionId: "action", actionFilter1: "templateId" },
                    MAIL_TO_FI_AGENT: { actionId: "action", actionFilter1: "templateId" },
                    MAIL_TO_CUSTOMER: { actionId: "action", actionFilter1: "templateId" },
                },
            },
            TICKET_DATE_EXTENSION: {
                actionsKey: "ticketDateExtensionActions",
                actionFields: {
                    MAIL_TO_FI_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", actionFilter3: "templateId" },
                    MAIL_TO_SEPS_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", actionFilter3: "templateId" },
                    MAIL_TO_SEPS_AGENT: { actionId: "action", actionFilter1: "templateId" },
                    MAIL_TO_FI_AGENT: { actionId: "action", actionFilter1: "templateId" },
                    MAIL_TO_CUSTOMER: { actionId: "action", actionFilter1: "templateId" },
                },
            }
        };
        // const { conditionsKey, actionsKey, conditionFields, actionFields } = eventKeyMap[selectedEvent] || {};

        const { conditionsKey, actionsKey, conditionFields: rawConditionFields, actionFields } = eventKeyMap[selectedEvent] || {};



        if (!actionsKey || !actionFields) {
            throw new Error(`Invalid event type: ${selectedEvent}`);
        }

        // let conditions;

        let conditions = [];
        if (conditionsKey && rawConditionFields && values?.conditions?.length) {
            conditions = values.conditions.map((item) => {
                const conditionId = item.conditionId; // Extract conditionId from each condition
                const conditionFields = rawConditionFields[conditionId] || rawConditionFields.DEFAULT; // Resolve fields dynamically

                const transformedCondition = {};
                // Map conditionFields to the current item's keys
                Object.entries(conditionFields).forEach(([key, mappedKey]) => {
                    if (item[key] !== undefined) {
                        transformedCondition[mappedKey] = item[key];
                    }
                });

                return transformedCondition;
            });
        }

        const actions = values?.actions.map((item) => {
            const specificActionFields = actionFields[item?.actionId];
            if (!specificActionFields) {
                throw new Error(`Invalid action type: ${item?.actionId}`);
            }
            const transformedAction = {};
            Object.keys(specificActionFields).forEach((key) => {
                transformedAction[specificActionFields[key]] = item[key];
            });
            return transformedAction;
        });


        const organizationId = currentUser === 'FI_USER' ? userData?.organizationId : values?.entityId


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

        try {
            const action = isEdit
                ? editTicketWorkflow(id, { id: id, ...payload })
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
        if (selectedEvent !== 'CREATED') {
            if (selectedEvent === 'TICKET_STATUS') {
                if (value === 'CLOSED') {
                    setConditionsCatArr((prev) => ({
                        ...prev,
                        [index]: [{ label: t('SELECT'), value: '' }, ...convertToLabelValue(masterData.closedStatus || [])],
                    }))
                } else if (value === 'REJECTED') {
                    setConditionsCatArr((prev) => ({
                        ...prev,
                        [index]: [{ label: t('SELECT'), value: '' }, ...convertToLabelValue(masterData.rejectedStatus || [])],
                    }))
                }
            }
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
                return updatedSelectedConditions;
            });
        } else {
            // Additional logic for specific events


            if (value !== '' && value !== formikProps?.values?.conditions?.[index]?.conditionId) {
                getClaimSubTypes(index, value);
                formikProps.setFieldValue(`conditions[${index}].conditionId`, value);

                if (formikProps?.values?.conditions?.[index].conditionCatId) {
                    console.log("ARE YOU HERE")
                    formikProps.setFieldValue(
                        `conditions[${index}].conditionCatId`,
                        ''
                    )
                }
            }
        }
    };

    const isOptionDisabled = (value) => {
        // Disable the option if it is already selected and not the current value
        return selectedConditions.includes(value);
    };

    // HANDLE ACTION CHANGE DROPDOWN
    const handleActionChange = (formikProps, value, index) => {
        const previousValue = formikProps.values.actions[index]?.actionId;
        if (value === 'ASSIGN_TO_AGENT' || value === 'ASSIGN_TO_TEAM') {
            setSelectedActions((prevSelectedActions) => {
                const updatedSelectedActions = [...prevSelectedActions];
                // Remove conflicting values
                const conflictingValues = ['ASSIGN_TO_AGENT', 'ASSIGN_TO_TEAM'];
                conflictingValues.forEach((conflict) => {
                    const conflictIndex = updatedSelectedActions.indexOf(conflict);
                    if (conflictIndex > -1) {
                        updatedSelectedActions.splice(conflictIndex, 1);
                    }
                });

                // Add the new value and its counterpart
                if (value) {
                    updatedSelectedActions.push(value);
                    const counterpart = value === 'ASSIGN_TO_AGENT' ? 'ASSIGN_TO_TEAM' : 'ASSIGN_TO_AGENT';
                    updatedSelectedActions.push(counterpart);
                }

                // Update Formik's field value
                formikProps.setFieldValue(`actions[${index}].actionId`, value);

                // Reset and update action categories
                updateActionCategory1Filter(value, index, formikProps?.values?.instanceTypeId);

                return updatedSelectedActions;
            });
        } else {
            if (previousValue === 'ASSIGN_TO_AGENT' || previousValue === 'ASSIGN_TO_TEAM') {
                setSelectedActions([])
            }

            // For other values, directly update Formik and action categories
            formikProps.setFieldValue(`actions[${index}].actionId`, value);
            updateActionCategory1Filter(value, index, formikProps?.values?.instanceTypeId);
        }

        // Update the disabled state of options
        setActionsArr((prevActionsArr) =>
            prevActionsArr.map((action) => ({
                ...action,
                isDisabled:
                    action.value === 'ASSIGN_TO_TEAM' || action.value === 'ASSIGN_TO_AGENT'
                        ? value === 'ASSIGN_TO_TEAM' || value === 'ASSIGN_TO_AGENT'
                        : action.isDisabled,
            }))
        );


        if (value !== formikProps?.values?.actions?.[index]?.actionId) {
            ['actionFilter1', 'actionFilter2', 'actionFilter3'].forEach((filter) => {
                if (formikProps?.values?.actions?.[index]?.[filter]) {
                    formikProps.setFieldValue(`actions[${index}].${filter}`, '');
                }
            });
        }



    };

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


    // FETCH SUB TYPES FOR EDIT FORM CONDITIONS DATA
    const fetchSubTypesForConditions = async (conditions) => {
        try {
            const optionsObject = {};

            // Map through conditions and fetch sub-type options
            await Promise.all(
                conditions.map(async (condition, index) => {
                    // Fetch claim sub-types by ID
                    const response = await getClaimSubTypeById(condition.conditionId);
                    const claimSubTypeFormatList = response?.data
                        ? [{ label: response.data.name, value: response.data.id }]
                        : [];

                    // Store the result in the options object with the index as the key
                    optionsObject[index] = claimSubTypeFormatList;
                })
            );

            // Update the state with the accumulated options

            await new Promise((resolve) => {
                setConditionsCatArr((prev) => {
                    const updatedState = { ...prev, ...optionsObject };
                    resolve(updatedState); // Resolve the promise after updating state
                    return updatedState;
                });
            });

            return optionsObject;
        } catch (error) {
            console.error("Error fetching claim sub-types:", error);
        }
    };

    const fetchStatusForConditions = async (conditions) => {
        try {
            const optionsObject = {};

            // Map through conditions and fetch sub-type options
            await Promise.all(
                conditions.map(async (condition, index) => {
                    let subStatusList = []

                    if (condition?.conditionId === 'CLOSED') {
                        subStatusList = [{ label: t('SELECT'), value: '' }, ...convertToLabelValue(masterData.closedStatus || [])]
                    } else if (condition?.conditionId === 'REJECTED') {
                        subStatusList = [{ label: t('SELECT'), value: '' }, ...convertToLabelValue(masterData.rejectedStatus || [])]
                    }
                    // Store the result in the options object with the index as the key
                    optionsObject[index] = subStatusList;
                })
            );

            // Update the state with the accumulated options

            await new Promise((resolve) => {
                setConditionsCatArr((prev) => {
                    const updatedState = { ...prev, ...optionsObject };
                    resolve(updatedState); // Resolve the promise after updating state
                    return updatedState;
                });
            });

            return optionsObject;
        } catch (error) {
            console.error("Error fetching claim sub-types:", error);
        }
    };

    // INITIALIZE CONDITIONS DATA FOR EDIT FORM
    const initializeConditions = async (responseValues) => {
        let conditions = [
            {
                conditionId: "",
                conditionCatId: "",
            },
        ];
        switch (responseValues?.event) {
            case "CREATED":
                conditions = responseValues?.createConditions?.map((condition) => ({
                    conditionId: condition["claimSubTypeId"] ?? "",
                    conditionCatId: condition["claimSubTypeId"] ?? "",
                })) ?? [];

                // Wait for the dropdown data to be fetched and set
                await fetchSubTypesForConditions(conditions);
                // Return the conditions only after the dropdown data is set
                return conditions;

            case "TICKET_STATUS":
                conditions = responseValues?.ticketStatusConditions?.map((condition) => {
                    setSelectedConditions((prevSelectedConditions) => ([...prevSelectedConditions, condition["status"]]))
                    if (condition?.status === 'CLOSED') {
                        return {
                            conditionId: condition["status"] ?? "",
                            conditionCatId: condition["closedStatus"]
                        }
                    } else if (condition?.status === 'REJECTED') {
                        return {
                            conditionId: condition["status"] ?? "",
                            conditionCatId: condition['rejectedStatus'],
                        }
                    } else {
                        return {
                            conditionId: condition["status"] ?? "",
                        }
                    }

                }
                ) ?? [
                        {
                            conditionId: "",
                        },
                    ];


                await fetchStatusForConditions(conditions)
                return conditions;
            case "TICKET_PRIORITY":
                conditions = responseValues?.ticketPriorityConditions?.map((condition) => {
                    setSelectedConditions((prevSelectedConditions) => ([...prevSelectedConditions, condition["priority"]]))
                    return {
                        conditionId: condition["priority"] ?? "",
                    }
                }
                ) ?? [
                        {
                            conditionId: "",
                        },
                    ];
                return conditions;
            case "SLA_DAYS_REMINDER":
                conditions = responseValues?.slaDaysReminderConditions?.map((condition) => ({
                    conditionId: condition["noOfDays"] ?? "",
                })) ?? [
                        {
                            conditionId: "",
                        },
                    ];
                return conditions;
            case "SLA_BREACH":
            case "TICKET_DATE_EXTENSION":
                break;
            default:
                return conditions; // Default return if no matching case
        }
    };
    // FETCH DROPDOWN FILTER FOR ACTIONS
    const fetchDropdownFilterForActions = async (actions, instanceType, organizationId) => {

        try {
            const actionCat1 = {};
            const actionCat2 = {};
            const actionCat3 = {};
            setLoading(true);
            // Map through conditions and fetch sub-type options
            await Promise.all(
                actions.map(async (actions, index) => {
                    switch (actions?.actionId) {
                        case 'ASSIGN_TO_TEAM': {
                            const teamData = await getTeamList(instanceType === "FIRST_INSTANCE" && organizationId ? organizationId : undefined);

                            const teamList = teamData?.data?.length > 0
                                ? teamData.data.map(team => ({ label: team.name, value: team.id }))
                                : [];

                            actionCat1[index] = teamList;

                            const teamMemberData = await getTeamMemberList(actions?.actionFilter1);

                            const teamMembersList = teamMemberData?.data?.length > 0
                                ? teamMemberData.data.map(item => ({ label: item.name, value: item.id }))
                                : [];

                            actionCat2[index] = teamMembersList;

                            break;
                        }
                        case 'ASSIGN_TO_AGENT': {
                            const agentData = await getAgentList(instanceType === "FIRST_INSTANCE" && organizationId ? organizationId : undefined);

                            const agentList = agentData?.data?.length > 0
                                ? agentData.data.map(agent => ({ label: agent.name, value: agent.id }))
                                : [];

                            actionCat1[index] = agentList;
                            break;
                        }
                        case 'MAIL_TO_CUSTOMER': {
                            const templateData = await getTemplateList('CUSTOMER');

                            const templateList = templateData?.data?.length > 0
                                ? templateData.data.map(template => ({ label: template.name, value: template.id }))
                                : [];

                            actionCat1[index] = templateList;
                            break;
                        }
                        case 'MAIL_TO_FI_AGENT': {
                            const templateData = await getTemplateList('FI');

                            const templateList = templateData?.data?.length > 0
                                ? templateData.data.map(template => ({ label: template.name, value: template.id }))
                                : [];

                            actionCat1[index] = templateList;
                            break;
                        }
                        case 'MAIL_TO_SEPS_AGENT': {
                            const templateData = await getTemplateList('SEPS');

                            const templateList = templateData?.data?.length > 0
                                ? templateData.data.map(template => ({ label: template.name, value: template.id }))
                                : [];

                            actionCat1[index] = templateList;
                            break;
                        }
                        case 'MAIL_TO_SEPS_TEAM': {
                            // TEAM DATA
                            const teamData = await getTeamList();

                            const teamList = teamData?.data?.length > 0
                                ? teamData.data.map(team => ({ label: team.name, value: team.id }))
                                : [];

                            actionCat1[index] = teamList;

                            // AGENT DATA
                            const agentData = await getAgentList(organizationId ? organizationId : undefined);

                            const agentList = agentData?.data?.length > 0
                                ? agentData.data.map(agent => ({ label: agent.name, value: agent.id }))
                                : [];

                            actionCat2[index] = agentList;

                            // TEMPLATE DATA
                            const templateData = await getTemplateList('SEPS');

                            const templateList = templateData?.data?.length > 0
                                ? templateData.data.map(template => ({ label: template.name, value: template.id }))
                                : [];

                            actionCat3[index] = templateList;
                            break;
                        }
                        case 'MAIL_TO_FI_TEAM': {
                            // TEAM DATA
                            const teamData = await getTeamList(instanceType === "FIRST_INSTANCE" && organizationId ? organizationId : undefined);

                            const teamList = teamData?.data?.length > 0
                                ? teamData.data.map(team => ({ label: team.name, value: team.id }))
                                : [];

                            actionCat1[index] = teamList;

                            // AGENT DATA
                            const agentData = await getAgentList(organizationId ? organizationId : undefined);

                            const agentList = agentData?.data?.length > 0
                                ? agentData.data.map(agent => ({ label: agent.name, value: agent.id }))
                                : [];

                            actionCat2[index] = agentList;

                            // TEMPLATE DATA
                            const templateData = await getTemplateList('FI');

                            const templateList = templateData?.data?.length > 0
                                ? templateData.data.map(template => ({ label: template.name, value: template.id }))
                                : [];

                            actionCat3[index] = templateList;
                            break;
                        }
                    }
                })
            );
            // Update the state with the accumulated options

            await new Promise((resolve) => {
                setActionCategory1Arr((prev) => {
                    const updatedState = { ...prev, ...actionCat1 };
                    resolve(updatedState); // Resolve the promise after updating state
                    return updatedState;
                });
                setActionCategory2Arr((prev) => {
                    const updatedState = { ...prev, ...actionCat2 };
                    resolve(updatedState); // Resolve the promise after updating state
                    return updatedState;
                });
                setActionCategory3Arr((prev) => {
                    const updatedState = { ...prev, ...actionCat3 };
                    resolve(updatedState); // Resolve the promise after updating state
                    return updatedState;
                });
            });

            setLoading(false);

            return { actionCat1, actionCat2, actionCat3 };
        } catch (error) {
            console.error("Error fetching claim sub-types:", error);
        }
    };
    // INITIALIZE ACTIONS
    const initializeActions = async (responseValues) => {

        let actions = [
            {
                actionId: "",
                actionFilter1: "",
                actionFilter2: "",
            },
        ]

        const actionMapping = {
            CREATED: responseValues?.createActions,
            TICKET_STATUS: responseValues?.ticketStatusActions,
            TICKET_PRIORITY: responseValues?.ticketPriorityActions,
            SLA_DAYS_REMINDER: responseValues?.slaDaysReminderActions,
            SLA_BREACH: responseValues?.slaBreachActions,
            TICKET_DATE_EXTENSION: responseValues?.ticketDateExtensionActions,
        };

        const currentActionArr = actionMapping[responseValues?.event] ?? [];

        if (responseValues?.event === 'CREATED') {
            actions = responseValues?.createActions?.map((action) => {
                if (action["action"] === 'ASSIGN_TO_TEAM') {


                    setSelectedActions((prevSelectedActions) => (
                        [...prevSelectedActions, 'ASSIGN_TO_TEAM', 'ASSIGN_TO_AGENT']))
                    return {
                        actionId: action["action"] ?? "",
                        actionFilter1: action["teamId"] ?? "",
                        actionFilter2: action["agentId"] ?? "",
                    };
                } else if (action["action"] === 'ASSIGN_TO_AGENT') {
                    setSelectedActions((prevSelectedActions) => (
                        [...prevSelectedActions, 'ASSIGN_TO_TEAM', 'ASSIGN_TO_AGENT']))
                    return {
                        actionId: action["action"] ?? "",
                        actionFilter1: action["agentId"] ?? "",
                    };
                } else if (action["action"] === 'MAIL_TO_CUSTOMER' || action["action"] === 'MAIL_TO_FI_AGENT' || action["action"] === 'MAIL_TO_SEPS_AGENT') {
                    return {
                        actionId: action["action"] ?? "",
                        actionFilter1: action["templateId"] ?? "",
                    };
                } else if (action["action"] === 'MAIL_TO_FI_TEAM' || action["action"] === 'MAIL_TO_SEPS_TEAM') {
                    return {
                        actionId: action["action"] ?? "",
                        actionFilter1: action["teamId"] ?? "",
                        actionFilter2: action["agentId"] ?? "",
                        actionFilter3: action["templateId"] ?? "",
                    };
                }
                else {
                    // Handle unexpected actions or return null
                    console.warn(`Unexpected action type: ${action["action"]}`);
                    return null; // Return null for unmatched cases
                }
            }).filter(Boolean) ?? []; // Filter out null or undefined values
            // Wait for the dropdown data to be fetched and set
            await fetchDropdownFilterForActions(actions, responseValues?.instanceType, responseValues?.organizationId);
        } else {
            actions = currentActionArr?.map((action) => {
                if (action["action"] === 'MAIL_TO_CUSTOMER' || action["action"] === 'MAIL_TO_FI_AGENT' || action["action"] === 'MAIL_TO_SEPS_AGENT') {
                    return {
                        actionId: action["action"] ?? "",
                        actionFilter1: action["templateId"] ?? "",
                    };
                } else if (action["action"] === 'MAIL_TO_FI_TEAM' || action["action"] === 'MAIL_TO_SEPS_TEAM') {
                    return {
                        actionId: action["action"] ?? "",
                        actionFilter1: action["teamId"] ?? "",
                        actionFilter2: action["agentId"] ?? "",
                        actionFilter3: action["templateId"] ?? "",
                    };
                }
                else {
                    // Handle unexpected actions or return null
                    console.warn(`Unexpected action type: ${action["action"]}`);
                    return null; // Return null for unmatched cases
                }
            }).filter(Boolean) ?? []; // Filter out null or undefined values
            // Wait for the dropdown data to be fetched and set
            await fetchDropdownFilterForActions(actions, responseValues?.instanceType, responseValues?.organizationId);
        }

        // Return the conditions only after the dropdown data is set
        return actions;
    };

    // GET TICKET WORKFLOW DATA FOR EDIT FORM
    const getTicketWorkflowData = () => {
        setLoading(true)
        handleGetWorkflowById(id).then(async (response) => {
            const responseValues = response?.data
            if (responseValues?.event) {
                const newEventId = responseValues?.event
                setSelectedEvent(newEventId);
                getEventActionsConditions(newEventId);
                getConditionLabel(newEventId);
            }
            if (responseValues?.organizationId) {
                setSelectedOrg(responseValues?.organizationId)
            }

            let conditions = [
                {
                    conditionId: "",
                    conditionCatId: "",
                },
            ];

            let actions = [
                {
                    actionId: "",
                    actionFilter1: "",
                    actionFilter2: "",
                },
            ]

            const prevConditions = await initializeConditions(responseValues)

            const prevActions = await initializeActions(responseValues)


            setInitialValues({
                entityId: responseValues.organizationId ?? "",
                instanceTypeId: responseValues.instanceType ?? "",
                eventId: responseValues.event ?? "",
                workflowName: responseValues.title ?? "",
                description: responseValues.description ?? "",
                conditions: prevConditions ?? conditions,
                actions: prevActions ?? actions,
                userType: currentUser ?? "",
            })

        }).catch((error) => {
            if (error?.response?.data?.errorDescription) {
                toast.error(error?.response?.data?.errorDescription);
            } else {
                toast.error(error?.message ?? "FAILED TO FETCH TICKET WORKFLOW DETAILS");
            }
        }).finally(() => {
            // setLoading(false)
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
                                                    disabled={currentUser === 'FI_USER' || isEdit ? true : false}
                                                />
                                            </Col>
                                            {(currentUser === 'SYSTEM_ADMIN' || currentUser === 'SEPS_USER') && (
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
                                                        disabled={isEdit ?? false}
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
                                                    disabled={isEdit ?? false}
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
                                                    disabled={isEdit ?? false}
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
                                                                setConditionsCatArr({});
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
                                                            disabled={isEdit ?? false}
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
                                                                            onBlur={formikProps?.handleBlur}
                                                                            onChange={(option) => {
                                                                                handleConditionChange(formikProps, option?.target?.value, index)
                                                                            }}
                                                                            label={conditionLabel}
                                                                            value={formikProps?.values?.conditions[index].conditionId ?? ''}
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
                                                                            // name={`conditions[${index}].conditionCatId`}
                                                                            // options={[{label:t('SELECT'),value:''},...conditionsCatArr[index]] ?? []}
                                                                            options={[{ label: t('SELECT'), value: '' }, ...(Array.isArray(conditionsCatArr[index]) ? conditionsCatArr[index] : [])]}

                                                                            onBlur={formikProps.handleBlur}
                                                                            onChange={(option) =>
                                                                                formikProps.setFieldValue(
                                                                                    `conditions[${index}].conditionCatId`,
                                                                                    option?.target?.value
                                                                                )
                                                                            }
                                                                            // value={conditionsCatArr[index]?.find(
                                                                            //     (opt) => opt.value === formikProps.values.conditions[index].conditionCatId
                                                                            // ) ?? ''}
                                                                            value={formikProps.values.conditions[index]?.conditionCatId || ''}
                                                                            label={t("CLAIM SUB TYPE")}
                                                                            error={formikProps.errors?.conditions?.[index]?.conditionCatId}
                                                                            touched={formikProps.touched?.conditions?.[index]?.conditionCatId}
                                                                        />
                                                                    </Col>
                                                                )}

                                                                {(selectedEvent === 'TICKET_STATUS' && (formikProps.values.conditions[index]?.conditionId === 'CLOSED' || formikProps.values.conditions[index]?.conditionId === 'REJECTED')) && (
                                                                    <Col sm={6} lg={4}>
                                                                        <ReactSelect
                                                                            placeholder={t('SELECT')}
                                                                            name={`conditions[${index}].conditionCatId`}
                                                                            options={conditionsCatArr[index] ?? []}
                                                                            onBlur={formikProps.handleBlur}
                                                                            onChange={(option) =>
                                                                                formikProps.setFieldValue(
                                                                                    `conditions[${index}].conditionCatId`,
                                                                                    option?.target?.value
                                                                                )
                                                                            }
                                                                            value={formikProps.values.conditions[index]?.conditionCatId || ''}
                                                                            label="Sub-status"
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

                                                                                setSelectedConditions((prevConditions) => {
                                                                                    if (prevConditions.includes(formikProps.values.conditions[index]?.conditionId)) {
                                                                                        return prevConditions.filter((condition) => condition !== formikProps.values.conditions[index]?.conditionId);
                                                                                    }
                                                                                    return prevConditions; // Return unchanged if 'LOW' doesn't exist
                                                                                });
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
                                                        <Row className="gx-4 align-items-center">
                                                            <Col sm={6} lg={formikProps.values.actions[index]?.actionId === 'MAIL_TO_FI_TEAM' || formikProps.values.actions[index]?.actionId === 'MAIL_TO_SEPS_TEAM' ? 3 : 4}>
                                                                <ReactSelect
                                                                    wrapperClassName={'mb-3'}
                                                                    placeholder={t('SELECT_ACTION')}
                                                                    name={`actions[${index}].actionId`}
                                                                    label={t("ACTION")}
                                                                    // options={actionsArr}
                                                                    options={actionsArr.map((option) => ({
                                                                        ...option,
                                                                        isDisabled: isActionDisabled(option.value, formikProps.values.actions[index]?.actionId),
                                                                    }))}
                                                                    onBlur={formikProps.handleBlur}
                                                                    onChange={(option) => {
                                                                        handleActionChange(formikProps, option?.target?.value, index)
                                                                    }}
                                                                    value={formikProps.values.actions[index]?.actionId}
                                                                    error={formikProps.errors?.actions?.[index]?.actionId}
                                                                    touched={formikProps.touched?.actions?.[index]?.actionId}
                                                                />
                                                            </Col>


                                                            {(formikProps.values.actions[index].actionId === 'MAIL_TO_CUSTOMER' || formikProps.values.actions[index].actionId === 'MAIL_TO_FI_AGENT' || formikProps.values.actions[index].actionId === 'MAIL_TO_SEPS_AGENT') &&
                                                                <Col sm={6} lg={formikProps.values.actions[index].actionId === 'MAIL_TO_FI_TEAM' || formikProps.values.actions[index].actionId === 'MAIL_TO_SEPS_TEAM' ? 3 : 4}>
                                                                    <ReactSelect
                                                                        wrapperClassName={'mb-3'}
                                                                        placeholder={t('SELECT TEMPLATE')}
                                                                        label={t("TEMPLATES")}
                                                                        name={`actions[${index}].actionFilter1`}
                                                                        // options={actionCategory1Arr[index] ?? []}
                                                                        options={[{ label: t('SELECT'), value: '' }, ...(Array.isArray(actionCategory1Arr[index]) ? actionCategory1Arr[index] : [])]}

                                                                        onBlur={formikProps.handleBlur}
                                                                        onChange={(option) => {
                                                                            formikProps.setFieldValue(
                                                                                `actions[${index}].actionFilter1`,
                                                                                option?.target?.value
                                                                            );

                                                                            if (option.target.value !== formikProps?.values?.actions?.[index]?.actionFilter1) {
                                                                                [ 'actionFilter2', 'actionFilter3'].forEach((filter) => {
                                                                                    if (formikProps?.values?.actions?.[index]?.[filter]) {
                                                                                        formikProps.setFieldValue(`actions[${index}].${filter}`, '');
                                                                                    }
                                                                                });
                                                                            }
                                                                        }}
                                                                        value={formikProps.values.actions[index].actionFilter1}
                                                                        error={formikProps.errors?.actions?.[index]?.actionFilter1}
                                                                        touched={formikProps.touched?.actions?.[index]?.actionFilter1}
                                                                    />
                                                                </Col>}
                                                            {
                                                                formikProps.values.actions[index].actionId === 'ASSIGN_TO_AGENT' &&
                                                                <Col sm={6} lg={4}>
                                                                    <ReactSelect
                                                                        wrapperClassName={'mb-3'}
                                                                        placeholder={t('SELECT AGENT')}
                                                                        name={`actions[${index}].actionFilter1`}
                                                                        // options={actionCategory1Arr[index] ?? []}
                                                                        options={[{ label: t('SELECT'), value: '' }, ...(Array.isArray(actionCategory1Arr[index]) ? actionCategory1Arr[index] : [])]}
                                                                        onBlur={formikProps.handleBlur}
                                                                        label={t("AGENTS")}
                                                                        onChange={(option) => {
                                                                            formikProps.setFieldValue(
                                                                                `actions[${index}].actionFilter1`,
                                                                                option?.target?.value
                                                                            );
                                                                            if (option.target.value !== formikProps?.values?.actions?.[index]?.actionFilter1) {
                                                                                [ 'actionFilter2', 'actionFilter3'].forEach((filter) => {
                                                                                    if (formikProps?.values?.actions?.[index]?.[filter]) {
                                                                                        formikProps.setFieldValue(`actions[${index}].${filter}`, '');
                                                                                    }
                                                                                });
                                                                            }
                                                                        }}
                                                                        value={formikProps.values.actions[index].actionFilter1}
                                                                        error={formikProps.errors?.actions?.[index]?.actionFilter1}
                                                                        touched={formikProps.touched?.actions?.[index]?.actionFilter1}
                                                                    />
                                                                </Col>
                                                            }
                                                            {
                                                                (formikProps.values.actions[index].actionId === 'ASSIGN_TO_TEAM' || formikProps.values.actions[index].actionId === 'MAIL_TO_SEPS_TEAM' || formikProps.values.actions[index].actionId === 'MAIL_TO_FI_TEAM') &&
                                                                <Col sm={6} lg={formikProps.values.actions[index].actionId === 'MAIL_TO_FI_TEAM' || formikProps.values.actions[index].actionId === 'MAIL_TO_SEPS_TEAM' ? 3 : 4}>
                                                                    <ReactSelect
                                                                        wrapperClassName={'mb-3'}
                                                                        placeholder={t('SELECT TEAM')}
                                                                        name={`actions[${index}].actionFilter1`}
                                                                        // options={actionCategory1Arr[index] ?? []}
                                                                        options={[{ label: t('SELECT'), value: '' }, ...(Array.isArray(actionCategory1Arr[index]) ? actionCategory1Arr[index] : [])]}
                                                                        onBlur={formikProps.handleBlur}
                                                                        label={t("TEAMS")}
                                                                        onChange={(option) => {
                                                                            formikProps.setFieldValue(
                                                                                `actions[${index}].actionFilter1`,
                                                                                option?.target?.value
                                                                            );
                                                                            if (option.target.value !== formikProps?.values?.actions?.[index]?.actionFilter1) {
                                                                                [ 'actionFilter2', 'actionFilter3'].forEach((filter) => {
                                                                                    if (formikProps?.values?.actions?.[index]?.[filter]) {
                                                                                        formikProps.setFieldValue(`actions[${index}].${filter}`, '');
                                                                                    }
                                                                                });
                                                                            }
                                                                            updateActionCategory2Filter(formikProps.values.actions[index].actionId, option?.target?.value, index)
                                                                        }}
                                                                        value={formikProps.values.actions[index].actionFilter1}
                                                                        error={formikProps.errors?.actions?.[index]?.actionFilter1}
                                                                        touched={formikProps.touched?.actions?.[index]?.actionFilter1}
                                                                    />
                                                                </Col>
                                                            }
                                                            {
                                                                (formikProps.values.actions[index].actionId === 'ASSIGN_TO_TEAM' || formikProps.values.actions[index].actionId === 'MAIL_TO_SEPS_TEAM' || formikProps.values.actions[index].actionId === 'MAIL_TO_FI_TEAM') &&
                                                                <Col sm={6} lg={formikProps.values.actions[index].actionId === 'MAIL_TO_FI_TEAM' || formikProps.values.actions[index].actionId === 'MAIL_TO_SEPS_TEAM' ? 3 : 4}>
                                                                    <ReactSelect
                                                                        wrapperClassName={'mb-3'}
                                                                        placeholder={t('SELECT AGENT')}
                                                                        name={`actions[${index}].actionFilter2`}
                                                                        // options={actionCategory2Arr[index] ?? []}
                                                                        options={[{ label: t('SELECT'), value: '' }, ...(Array.isArray(actionCategory2Arr[index]) ? actionCategory2Arr[index] : [])]}
                                                                        onBlur={formikProps.handleBlur}
                                                                        label={t("AGENTS")}
                                                                        onChange={(option) => {
                                                                            formikProps.setFieldValue(
                                                                                `actions[${index}].actionFilter2`,
                                                                                option?.target?.value
                                                                            );
                                                                            if (option.target.value !== formikProps?.values?.actions?.[index]?.actionFilter2) {
                                                                                if (formikProps?.values?.actions?.[index]?.actionFilter3) {
                                                                                        formikProps.setFieldValue(`actions[${index}].actionFilter3`, '');
                                                                                    }
                                                                            }
                                                                        }}
                                                                        value={formikProps.values.actions[index].actionFilter2}
                                                                        error={formikProps.errors?.actions?.[index]?.actionFilter2}
                                                                        touched={formikProps.touched?.actions?.[index]?.actionFilter2}
                                                                    />
                                                                </Col>
                                                            }
                                                            {
                                                                (formikProps.values.actions[index].actionId === 'MAIL_TO_SEPS_TEAM' || formikProps.values.actions[index].actionId === 'MAIL_TO_FI_TEAM') &&
                                                                <Col sm={6} lg={formikProps.values.actions[index].actionId === 'MAIL_TO_FI_TEAM' || formikProps.values.actions[index].actionId === 'MAIL_TO_SEPS_TEAM' ? 3 : 4}>
                                                                    <ReactSelect
                                                                        wrapperClassName={'mb-3'}
                                                                        placeholder={t('SELECT TEMPLATE')}
                                                                        name={`actions[${index}].actionFilter3`}
                                                                        // options={actionCategory3Arr[index] ?? []}
                                                                        options={[{ label: t('SELECT'), value: '' }, ...(Array.isArray(actionCategory3Arr[index]) ? actionCategory3Arr[index] : [])]}
                                                                        onBlur={formikProps.handleBlur}
                                                                        label={t("TEMPLATES")}
                                                                        onChange={(option) => {
                                                                            formikProps.setFieldValue(
                                                                                `actions[${index}].actionFilter3`,
                                                                                option?.target?.value
                                                                            );
                                                                        }}
                                                                        value={formikProps.values.actions[index]?.actionFilter3}
                                                                        error={formikProps.errors?.actions?.[index]?.actionFilter3}
                                                                        touched={formikProps.touched?.actions?.[index]?.actionFilter3}
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
                                                                            const prevVal = formikProps.values.actions[index]?.actionId;

                                                                            setSelectedActions((prevActions) => {


                                                                                if (prevVal === 'ASSIGN_TO_AGENT' || prevVal === 'ASSIGN_TO_TEAM') {
                                                                                    // Remove both 'ASSIGN_TO_AGENT' and 'ASSIGN_TO_ADMIN' from the array
                                                                                    return prevActions.filter(
                                                                                        (action) => action !== 'ASSIGN_TO_AGENT' && action !== 'ASSIGN_TO_TEAM'
                                                                                    );
                                                                                }

                                                                                if (prevActions.includes(prevVal)) {
                                                                                    return prevActions.filter((action) => action !== prevVal);
                                                                                }

                                                                                return prevActions; // Return unchanged if none of the conditions are met
                                                                            });

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