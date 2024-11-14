import { useQuery } from "@tanstack/react-query";
import qs from "qs";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { MdConfirmationNumber, MdHourglassEmpty, MdPending, MdTaskAlt } from "react-icons/md";
import { useLocation } from "react-router-dom";
import CommonDataTable from "../../../components/CommonDataTable";
import InfoCards from "../../../components/infoCards";
import Loader from "../../../components/Loader";
import PageHeader from "../../../components/PageHeader";
import { handleGetUsers } from "../../../services/user.service";
import TicketsListFilters from "./filters";

export default function TicketsList() {
    const location = useLocation();
    const params = qs.parse(location.search, { ignoreQueryPrefix: true });
    const [pagination, setPagination] = React.useState({
        pageIndex: params.page ? parseInt(params.page) - 1 : 0,
        pageSize: params.limit ? parseInt(params.limit) : 10,
    });

    const [sorting, setSorting] = React.useState([]);

    const [filter, setFilter] = React.useState({
        search: "",
        subscription: "",
        status: "",
    });

    const [loading, setLoading] = useState(false);

    const dataQuery = useQuery({
        queryKey: ["data", pagination, sorting, filter],
        queryFn: () => {
            const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
            Object.keys(filterObj).forEach(
                (key) => filterObj[key] === "" && delete filterObj[key]
            );

            if (sorting.length === 0) {
                return handleGetUsers({
                    page: pagination.pageIndex,
                    size: pagination.pageSize,
                    ...filterObj,
                });
            } else {
                return handleGetUsers({
                    page: pagination.pageIndex,
                    size: pagination.pageSize,
                    sort: sorting
                        .map((sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`)
                        .join(","),
                    ...filterObj,
                });
            }
        },
    });

    //handle last page deletion item
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
                accessorFn: (row) => row.ticketId,
                id: "ticketId",
                header: () => "Ticket ID",
            },
            {
                accessorFn: (row) => row.creationDate,
                id: "creationDate",
                header: () => "Creation Date",
                enableSorting: true,
            },
            {
                accessorFn: (row) => row.claimType,
                id: "claimType",
                header: () => "Claim Type",
                enableSorting: true,
            },
            {
                accessorFn: (row) => row.claimFilledBy,
                id: "claimFilledBy",
                header: () => "Claim filled by",
                enableSorting: true,
            },
            {
                accessorFn: (row) => row.sla,
                id: "sla",
                header: () => "SLA",
                enableSorting: true,
            },
            {
                accessorFn: "Closed",
                id: "status",
                header: () => "Status",
                size: "90",
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

    //Add New Click Hanlder
    const addNewClickHanlder = () => {
        console.log('Soon...')
    }

    // Info Cards Data
    const cardsData = [
        {
            bgColor: 'bg-primary',
            Icon: <MdConfirmationNumber size={24} />,
            title: 'New Tickets',
            value: 5,
            colProps: { sm: 6, lg: 3 }
        },
        {
            bgColor: 'bg-orange',
            Icon: <MdHourglassEmpty size={24} />,
            title: 'Tickets in Progress',
            value: 2,
            colProps: { sm: 6, lg: 3 }
        },
        {
            bgColor: 'bg-danger',
            Icon: <MdPending size={24} />,
            title: 'Rejected Tickets',
            value: 1,
            colProps: { sm: 6, lg: 3 }
        },
        {
            bgColor: 'bg-success',
            Icon: <MdTaskAlt size={24} />,
            title: 'Closed Tickets',
            value: 2,
            colProps: { sm: 6, lg: 3 }
        },
    ];

    return (
        <React.Fragment>
            <Loader isLoading={loading} />
            <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
                <PageHeader
                    title="Tickets"
                    actions={[
                        { label: "Add New", onClick: addNewClickHanlder, variant: "warning" },
                    ]}
                />
                <div className="info-cards mb-3">
                    <InfoCards cardsData={cardsData} />
                </div>
                <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
                    <Card.Body className="d-flex flex-column">
                        <TicketsListFilters filter={filter} setFilter={setFilter} />
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
        </React.Fragment>
    );
}
