
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
    const [conditionsCatArr, setConditionsCatArr] = useState({});
    const [actionsArr, setActionsArr] = useState([]);
    const [actionCategory1Arr, setActionCategory1Arr] = useState({});
    const [actionCategory2Arr, setActionCategory2Arr] = useState({});
    const [actionCategory3Arr, setActionCategory3Arr] = useState({});
    const { currentUser, userData } = useContext(AuthenticationContext);
    const [conditionLabel, setConditionLabel] = useState('')
    const [actionFilter2Label, setActionFilter2Label] = useState('')

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
            const response = (orgId && orgId !==null)
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
    const getTemplateLists = async (type, index) => {
        setLoading(true);
        try {
            const response = await getTemplateList(type);
            const formattedData = response.data.map((item) => ({
                label: item.name,
                value: item.id
            }));
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
                console.log("ARE YOU HRER")
                getTeamLists(null, index);
                break;
            case 'MAIL_TO_FI_TEAM':
                if (selectedOrg) {
                    return await getTeamLists(selectedOrg, index);
                } else {
                    toast.error("Please select organization id.")
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
            // case 'ASSIGN_TO_AGENT':
            //     return await getTemplateLists(selectedValue, index);
            //     break;
            // default:
            //     break;

            // case 'MAIL_TO_FI_TEAM':
            // case 'MAIL_TO_FI_AGENT':
            //     return getTemplateLists('actionFilter2');
            //     break;
            // case 'MAIL_TO_SEPS_TEAM':
            // case 'MAIL_TO_SEPS_AGENT':
            //     return getTemplateLists('actionFilter2');
            //     break;
            //     return setActionCategory1Arr([]);
        }
    };


    const updateActionCategory3Filter = (selectedAction, selectedValue, index)=>{
        if(selectedAction==='MAIL_TO_SEPS_TEAM'){
            getTemplateLists('SEPS', index); 
        }else if (selectedAction==='MAIL_TO_FI_TEAM'){
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
                    MAIL_TO_FI_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", actionFilter3: "templateId" },
                    MAIL_TO_SEPS_TEAM: { actionId: "action", actionFilter1: "teamId", actionFilter2: "agentId", actionFilter3: "templateId" },
                    ASSIGN_TO_AGENT: { actionId: "action", actionFilter1: "agentId" },
                    MAIL_TO_SEPS_AGENT: { actionId: "action", actionFilter1: "templateId" },
                    MAIL_TO_FI_AGENT: { actionId: "action", actionFilter1: "templateId" },
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

        // try {
        //     const action = isEdit
        //         ? editTicketWorkflow(id, { ...payload })
        //         : addTicketWorkflow({ ...payload });

        //     const response = await action;
        //     toast.success(response.data.message);
        //     navigate('/tickets-workflow');
        // } catch (error) {
        //     const errorMessage = error.response?.data?.errorDescription;
        //     toast.error(errorMessage);
        // } finally {
        //     setLoading(false);
        //     actions.setSubmitting(false);
        // }
    };

    // HANDLE CONDITION CHANGE
    const handleConditionChange = (formikProps, value, index) => {

        if (selectedEvent !== 'CREATED') {
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

            getClaimSubTypes(index, value);
            formikProps.setFieldValue(`conditions[${index}].conditionId`, value);


        }



    };

    const isOptionDisabled = (value) => {
        // Disable the option if it is already selected and not the current value
        return selectedConditions.includes(value);
    };

    // HANDLE ACTION CHANGE DROPDOWN
    const handleActionChange = (formikProps, value, index) => {
        console.log({ ACTION_VALUE: value });
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
            // setConditionsCatArr((prev) => ({
            //     ...prev,
            //     ...optionsObject,
            // }));

            // return optionsObject; // Return options for further processing if needed
        } catch (error) {
            console.error("Error fetching claim sub-types:", error);
        }
    };

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
            case "TICKET_PRIORITY":
            case "SLA_DAYS_REMINDER":
            case "SLA_BREACH":
            case "TICKET_DATE_EXTENSION":
                break;
            default:
                return conditions; // Default return if no matching case
        }
    };

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
            let actions = [
                {
                    actionId: "",
                    actionFilter1: "",
                    actionFilter2: "",
                },
            ]

            const prevConditions = await initializeConditions(responseValues)
            setInitialValues({
                entityId: responseValues.organizationId ?? "",
                instanceTypeId: responseValues.instanceType ?? "",
                eventId: responseValues.event ?? "",
                workflowName: responseValues.title ?? "",
                description: responseValues.description ?? "",
                conditions: prevConditions ?? [],
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
                                                    disabled={currentUser === 'FI_ADMIN' || isEdit ? true : false}
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
                                                                                // formikProps.setFieldValue(
                                                                                //     `conditions[${index}].conditionId`,
                                                                                //     option?.target?.value
                                                                                // );
                                                                                // if (selectedEvent === 'CREATED') {
                                                                                //     getClaimSubTypes(option?.target?.value);
                                                                                // }
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
                                                                            name={`conditions[${index}].conditionCatId`}
                                                                            options={conditionsCatArr[index] ?? []}
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
                                                        <Row className="gx-4 align-items-center">
                                                            <Col sm={6} lg={4}>
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
                                                                <Col sm={6} lg={4}>
                                                                    <ReactSelect
                                                                        wrapperClassName={'mb-3'}
                                                                        placeholder={t('SELECT TEMPLATE')}
                                                                        label={t("TEMPLATES")}
                                                                        name={`actions[${index}].actionFilter1`}
                                                                        options={actionCategory1Arr[index] ?? []}
                                                                        onBlur={formikProps.handleBlur}
                                                                        onChange={(option) => {
                                                                            formikProps.setFieldValue(
                                                                                `actions[${index}].actionFilter1`,
                                                                                option?.target?.value
                                                                            );
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
                                                                        options={actionCategory1Arr[index] ?? []}
                                                                        onBlur={formikProps.handleBlur}
                                                                        label={t("AGENTS")}
                                                                        onChange={(option) => {
                                                                            formikProps.setFieldValue(
                                                                                `actions[${index}].actionFilter1`,
                                                                                option?.target?.value
                                                                            );
                                                                            // updateActionCategory2Filter(formikProps.values.actions[index].actionId, option?.target?.value)
                                                                        }}
                                                                        value={formikProps.values.actions[index].actionFilter1}
                                                                        error={formikProps.errors?.actions?.[index]?.actionFilter1}
                                                                        touched={formikProps.touched?.actions?.[index]?.actionFilter1}
                                                                    />
                                                                </Col>
                                                            }
                                                            {
                                                                (formikProps.values.actions[index].actionId === 'ASSIGN_TO_TEAM' || formikProps.values.actions[index].actionId === 'MAIL_TO_SEPS_TEAM' || formikProps.values.actions[index].actionId === 'MAIL_TO_FI_TEAM') &&
                                                                <Col sm={6} lg={4}>
                                                                    <ReactSelect
                                                                        wrapperClassName={'mb-3'}
                                                                        placeholder={t('SELECT TEAM')}
                                                                        name={`actions[${index}].actionFilter1`}
                                                                        options={actionCategory1Arr[index] ?? []}
                                                                        onBlur={formikProps.handleBlur}
                                                                        label={t("TEAMS")}
                                                                        onChange={(option) => {
                                                                            formikProps.setFieldValue(
                                                                                `actions[${index}].actionFilter1`,
                                                                                option?.target?.value
                                                                            );
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
                                                                <Col sm={6} lg={4}>
                                                                    <ReactSelect
                                                                        wrapperClassName={'mb-3'}
                                                                        placeholder={t('SELECT AGENT')}
                                                                        name={`actions[${index}].actionFilter2`}
                                                                        options={actionCategory2Arr[index] ?? []}
                                                                        onBlur={formikProps.handleBlur}
                                                                        label={t("AGENTS")}
                                                                        onChange={(option) => {
                                                                            formikProps.setFieldValue(
                                                                                `actions[${index}].actionFilter2`,
                                                                                option?.target?.value
                                                                            );
                                                                            // updateActionCategory3Filter(formikProps.values.actions[index].actionId, option?.target?.value,index)
                                                                        }}
                                                                        value={formikProps.values.actions[index].actionFilter2}
                                                                        error={formikProps.errors?.actions?.[index]?.actionFilter2}
                                                                        touched={formikProps.touched?.actions?.[index]?.actionFilter2}
                                                                    />
                                                                </Col>
                                                            }
                                                            {
                                                                (formikProps.values.actions[index].actionId === 'MAIL_TO_SEPS_TEAM' || formikProps.values.actions[index].actionId === 'MAIL_TO_FI_TEAM') &&
                                                                <Col sm={6} lg={4}>
                                                                    <ReactSelect
                                                                        wrapperClassName={'mb-3'}
                                                                        placeholder={t('SELECT TEMPLATE')}
                                                                        name={`actions[${index}].actionFilter3`}
                                                                        options={actionCategory3Arr[index] ?? []}
                                                                        onBlur={formikProps.handleBlur}
                                                                        label={t("TEMPLATES")}
                                                                        onChange={(option) => {
                                                                            formikProps.setFieldValue(
                                                                                `actions[${index}].actionFilter3`,
                                                                                option?.target?.value
                                                                            );
                                                                            // updateActionCategory2Filter(formikProps.values.actions[index].actionId, option?.target?.value,index)
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