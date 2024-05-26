import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable"
import { useBackendMutation } from "main/utils/useBackend";
import { cellToAxiosParamsDelete, onDeleteSuccess } from "main/components/Utils/StaffUtils"
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";


export default function StaffTable({ staff, currentUser }) {

    const navigate = useNavigate();


    const editCallback = (cell) => {
        navigate(`/staff/edit/${cell.row.values.id}`);
    };

    const deleteMutation = useBackendMutation(
        cellToAxiosParamsDelete,
        { onSuccess: onDeleteSuccess }
        ["/api/staff/all"]
    );

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
        columns.push(ButtonColumn("Edit", "primary", editCallback, "StaffTable"));
        columns.push(ButtonColumn("Delete", "danger", deleteCallback, "StaffTable"));
    }

    return <OurTable
        data={staff}
        columns={columns}
        testid={"StaffTable"} />;
};

