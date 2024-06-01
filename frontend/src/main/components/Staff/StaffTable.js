import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable"
import { useBackendMutation } from "main/utils/useBackend";
import { cellToAxiosParamsDelete, onDeleteSuccess } from "main/components/Utils/StaffUtils"
import { hasRole } from "main/utils/currentUser";
import { useQueryClient } from "react-query";


export default function StaffTable({ staff, currentUser }) {

    const queryClient = useQueryClient(); 

    // Stryker disable all : hard to test for query caching
    const deleteMutation = useBackendMutation(
        cellToAxiosParamsDelete,
        {
            onSuccess: (data) => {
                onDeleteSuccess(data);
                queryClient.invalidateQueries(["/api/courses/getStaff"]); 
            }
        },
        ["/api/courses/getStaff"]
    );
    // Stryker restore all

    // Stryker disable next-line all : TODO try to make a good test for this
    const deleteCallback = async (cell) => { deleteMutation.mutate(cell); }

    const columns = [
        {
            Header: 'id',
            accessor: 'id',
        },
        {
            Header: 'courseId',
            accessor: 'courseId',
        },
        {
            Header: 'githubId',
            accessor: 'githubId',
        },

    ];

    if (hasRole(currentUser, "ROLE_ADMIN") || hasRole(currentUser, "ROLE_INSTRUCTOR")) {
        columns.push(ButtonColumn("Delete", "danger", deleteCallback, "StaffTable"));
    }

    return <OurTable
        data={staff}
        columns={columns}
        testid={"StaffTable"} />;
};