import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import qs from "qs";
import React, { useEffect, useRef, useState } from "react";
import { Card } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import CommonDataTable from "../../components/CommonDataTable";
import ListingSearchForm from "../../components/ListingSearchForm";
import PageHeader from "../../components/PageHeader";
import SvgIcons from "../../components/SVGIcons";
import { changeClaimTypeStatus, downloadClaimTypes } from "../../services/claimType.service";
import { getModulePermissions, isAdminUser } from "../../utils/authorisedmodule";
import { MdVisibility } from "react-icons/md";
import Loader from "../../components/Loader";
import { handleGetAuditLogs } from "../../services/auditlogs.services";

const AuditLogs = () => {

    const location = useLocation();
    const queryClient = useQueryClient();

    const params = qs.parse(location.search, { ignoreQueryPrefix: true });

    const [isLoading, setLoading] = useState(false)
    const [isDownloading, setDownloading] = useState(false)

    const { t } = useTranslation()

    const [pagination, setPagination] = useState({
        pageIndex: params.page ? parseInt(params.page) - 1 : 1,
        pageSize: params.limit ? parseInt(params.limit) : 10,
    });
    const [modal, setModal] = useState(false);
    const [editModal, setEditModal] = useState({ row: {}, open: false })
    const [sorting, setSorting] = useState([
        {
            "id": "createdAt",
            "desc": true
        }
    ]);
    const [filter, setFilter] = useState({
        search: "",
    });

    const toggle = () => setModal(!modal);

    const editToggle = () => setEditModal({ row: {}, open: !editModal?.open });

    const permission = useRef({ addModule: false, editModule: false, deleteModule: false });

    useEffect(() => {
        isAdminUser().then(response => {
            if (response) {
                permission.current.addModule = true;
                permission.current.editModule = true;
                permission.current.deleteModule = true;
            } else {
                getModulePermissions("Master management").then(response => {
                    if (response.includes("CLAIM_TYPE_CREATE")) {
                        permission.current.addModule = true;
                    }
                    if (response.includes("CLAIM_TYPE_UPDATE")) {
                        permission.current.editModule = true;
                    }
                    if (response.includes("CLAIM_TYPE_DELETE")) {
                        permission.current.deleteModule = true;
                    }
                }).catch(error => {
                    console.error("Error fetching permissions:", error);
                });
            }
        }).catch(error => {
            console.error("Error get during to fetch User Type", error);
        })

    }, []);


    // DATA QUERY
    const dataQuery = useQuery({
        queryKey: ["data", pagination, sorting, filter],
        queryFn: () => {
            const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
            Object.keys(filterObj).forEach(key => filterObj[key] === "" && delete filterObj[key]);

            if (sorting.length === 0) {
                return handleGetAuditLogs({
                    page: pagination.pageIndex,
                    size: pagination.pageSize,
                    ...filterObj,
                });
            } else {
                return handleGetAuditLogs({
                    page: pagination.pageIndex,
                    size: pagination.pageSize,
                    sort: sorting
                        .map(
                            (sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`
                        )
                        .join(","),
                    ...filterObj,
                });
            }
        },
        staleTime: 0, // Data is always stale, so it refetches
        cacheTime: 0, // Cache expires immediately
    });


    // DOWNLOAD AUDIT LOGS LIST
    const handleDownload = () => {
        setDownloading(true)
        toast.loading(t("EXPORT IN PROGRESS"), { id: "downloading", isLoading: isDownloading })
        downloadClaimTypes({ search: filter?.search ?? "" }).then(response => {
            if (response?.data) {
                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const blobUrl = window.URL.createObjectURL(blob);

                toast.success(t("CSV DOWNLOADED"), { id: "downloading" })


                const tempLink = document.createElement('a');
                tempLink.href = blobUrl;
                tempLink.setAttribute('download', 'claim-types.xlsx');

                // Append the link to the document body before clicking it
                document.body.appendChild(tempLink);

                tempLink.click();

                // Clean up by revoking the Blob URL
                window.URL.revokeObjectURL(blobUrl);

                // Remove the link from the document body after clicking
                document.body.removeChild(tempLink);
            } else {
                throw new Error(t("EMPTY RESPONSE"));
            }
            // toast.success(t("STATUS UPDATED"));
        }).catch((error) => {
            if (error?.response?.data?.errorDescription) {
                toast.error(error?.response?.data?.errorDescription);
            } else {
                toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
            }
            toast.dismiss("downloading");
        }).finally(() => {
            // Ensure the loading toast is dismissed
            // toast.dismiss("downloading");
            setDownloading(false)
        });
    }

    useEffect(() => {
        if (dataQuery.data?.data?.totalPages < pagination.pageIndex + 1) {
            setPagination({
                pageIndex: dataQuery.data?.data?.totalPages - 1,
                pageSize: 10,
            });
        }
    }, [dataQuery.data?.data?.totalPages]);

    const columns = React.useMemo(
        () => [
            {
                accessorFn: (row) => row.dateTime,
                id: "dateTime",
                header: () => "Activity Time",
                cell: (info) => {
                    return (
                        <span>
                            {moment(info?.row?.original?.createdAt).format(
                                "D-M-YYYY hh:mm A"
                            )}
                        </span>
                    );
                },
            },
            {
                accessorFn: (row) => row?.userName,
                id: "userName",
                header: () => "Username",
            },
            {
                accessorFn: (row) => row.activityType,
                id: "activityType",
                header: () => "Activity Type",
            },
            {
                accessorFn: (row) => row.ipAddress,
                id: "ipAddress",
                header: () => "Ip Address",
            },
            {
                id: "actions",
                isAction: true,
                cell: (info) => {
                    return (
                        <div className="d-flex items-center gap-2 justify-content-center">
                            <Link to={`/audit-log/${info?.row?.original?.id}`} className="text-dark"><MdVisibility /> </Link>
                        </div>
                    );
                },
                header: () => <div className="d-flex justify-content-center">Actions</div>,
                enableSorting: false,
            },
        ],
        []
    );

    useEffect(() => {
        setPagination({
            pageIndex: 0,
            pageSize: 10,
        });
    }, [filter]);

    // TO REMOVE CURRENT DATA ON COMPONENT UNMOUNT
    useEffect(() => {
        return () => {
            queryClient.removeQueries("data");
        };
    }, [queryClient]);


    return <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        <Loader isLoading={isLoading} />
        <PageHeader
            title={t("AUDIT LOGS")}
            actions={[
                { label: t("EXPORT TO CSV"), onClick: handleDownload, variant: "warning", disabled: true },
            ]}
        />
        <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
            <Card.Body className="d-flex flex-column">
                <ListingSearchForm filter={filter} setFilter={setFilter} />
                <CommonDataTable
                    columns={columns}
                    dataQuery={dataQuery}
                    pagination={pagination}
                    setPagination={setPagination}
                    sorting={sorting}
                    setSorting={setSorting}
                />
            </Card.Body>
        </Card>
    </div>
};

export default AuditLogs;
