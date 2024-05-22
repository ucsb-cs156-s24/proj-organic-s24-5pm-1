import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable"
import { useBackendMutation } from "main/utils/useBackend";
import { cellToAxiosParamsDelete, onDeleteSuccess } from "main/components/Utils/CoursesUtils"
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";


export default function StaffTable({ staff, currentUser }) {

    const navigate = useNavigate();


    const staffCallback = (cell) => {
        navigate(`/staff/${cell.row.values.id}/staff`);
    };

    const editCallback = (cell) => {
        navigate(`/staff/edit/${cell.row.values.id}`);
    };

    const deleteMutation = useBackendMutation(
        cellToAxiosParamsDelete,
        { onSuccess: onDeleteSuccess },
        ["/api/courses/all"]
    );

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
        columns.push(ButtonColumn("Staff", "primary", staffCallback, "staffTable"));
        columns.push(ButtonColumn("Edit", "primary", editCallback, "staffTable"));
        columns.push(ButtonColumn("Delete", "danger", deleteCallback, "staffTable"));
    }

    return <OurTable
        data={staff}
        columns={columns}
        testid={"StaffTable"} />;
};