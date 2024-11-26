import { useQuery } from "@tanstack/react-query";
import qs from "qs";
import React, { useEffect, useState } from "react";
import { Card, Form } from "react-bootstrap";
import { MdConfirmationNumber, MdHourglassEmpty, MdPending, MdTaskAlt } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import CommonDataTable from "../../../components/CommonDataTable";
import InfoCards from "../../../components/infoCards";
import Loader from "../../../components/Loader";
import PageHeader from "../../../components/PageHeader";
import { handleGetUsers } from "../../../services/user.service";
import TicketsListFilters from "./filters";
import { handleGetTicketList } from "../../../services/ticketmanagement.service";

export default function TicketsList() {
    const location = useLocation();
    const navigate = useNavigate();
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
        queryFn: async () => {
          // Set loading state to true before the request starts
          setLoading(true);
    
          try {
            const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
            Object.keys(filterObj).forEach(key => filterObj[key] === "" && delete filterObj[key]);
    
            // Make the API request based on sorting
            let response;
            if (sorting.length === 0) {
              response = await handleGetTicketList({
                page: pagination.pageIndex,
                size: pagination.pageSize,
                ...filterObj,
              });
            } else {
              response = await handleGetTicketList({
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
    
            // Return the API response data
            return response;
          } catch (error) {
            console.error("Error fetching data", error);
            // Optionally, handle errors here
          } finally {
            // Set loading state to false when the request finishes (whether successful or not)
            setLoading(false);
          }
        },
        staleTime: 0, // Data is always stale, so it refetches
        cacheTime: 0, // Cache expires immediately
        refetchOnWindowFocus: false, // Disable refetching on window focus
        refetchOnMount: false, // Prevent refetching on component remount
        retry: 0, //Disable retry on failure
      });

    const sampleData = [
        {
            ticketId: "TCK-1001",
            creationDate: "2024-11-20",
            claimType: "Health Insurance",
            claimFilledBy: "John Doe",
            sla: "5 Days",
            status: "Closed",
        },
        {
            ticketId: "TCK-1002",
            creationDate: "2024-11-21",
            claimType: "Auto Insurance",
            claimFilledBy: "Jane Smith",
            sla: "3 Days",
            status: "In Progress",
        },
        {
            ticketId: "TCK-1003",
            creationDate: "2024-11-22",
            claimType: "Travel Insurance",
            claimFilledBy: "Robert Brown",
            sla: "7 Days",
            status: "Rejected",
        },
        {
            ticketId: "TCK-1004",
            creationDate: "2024-11-23",
            claimType: "Property Insurance",
            claimFilledBy: "Emily Davis",
            sla: "2 Days",
            status: "New",
        },
        {
            ticketId: "TCK-1005",
            creationDate: "2024-11-24",
            claimType: "Life Insurance",
            claimFilledBy: "Michael Wilson",
            sla: "10 Days",
            status: "Closed",
        },
    ];


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
                id: 'select-col',
                header: ({ table }) => (
                  <Form.Check
                    checked={table.getIsAllRowsSelected()}
                    indeterminate={table.getIsSomeRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()} //or getToggleAllPageRowsSelectedHandler
                  />
                ),
                cell: ({ row }) => (
                  <Form.Check
                    checked={row.getIsSelected()}
                    disabled={!row.getCanSelect()}
                    onChange={row.getToggleSelectedHandler()}
                  />
                ),
              },
            {
                accessorFn: (row) => row?.ticketId,
                id: "ticketId",
                header: () => "Ticket Id",
                enableSorting: true
            },

            {
                accessorFn: (row) => row?.claimType?.name,
                id: "claimType",
                header: () => "Claim Type",
                enableSorting: true,
            },
            {
                accessorFn: (row) => row?.createdAt,
                id: "createdAt",
                header: () => "Creation Date",
                enableSorting: true,
                 cell: ({ row }) => (
                    row?.original?.createdAt
                ),
            },
            {
                accessorFn: (row) => row?.user?.name,
                id: "claimFilledBy",
                header: () => "Claim filled by",
                enableSorting: true,
            },
            {
                accessorFn: (row) => row?.slaBreachDays,
                id: "slaBreachDays",
                header: () => "SLA",
                enableSorting: true,
            },
            {
                accessorFn: (row) => row?.status,
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
        // navigate tickets/view/1
        navigate('/tickets/view/1')
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
