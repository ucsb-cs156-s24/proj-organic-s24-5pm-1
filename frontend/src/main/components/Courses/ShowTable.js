import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable"
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function ShowTable({ courses, currentUser }) {

    const navigate = useNavigate();

    const staffCallback = (cell) => {
        navigate(`/courses/${cell.row.values.id}/staff`);
    };

    const editCallback = (cell) => {
        navigate(`/courses/edit/${cell.row.values.id}`);
    };

    const columns = [
        {
            Header: 'id',
            accessor: 'id',
        },
        {
            Header: 'Name',
            accessor: 'name',
        },
        {
            Header: 'School',
            accessor: 'school',
        },
        {
            Header: 'Term',
            accessor: 'term',
        },
        {
            Header: 'StartDate',
            accessor: 'startDate',
        },
        {
            Header: 'EndDate',
            accessor: 'endDate',
        },
        {
            Header: 'GitHub Org',
            accessor: 'githubOrg',
        },


    ];

    if (hasRole(currentUser, "ROLE_ADMIN") || hasRole(currentUser, "ROLE_INSTRUCTOR")) {
        columns.push(ButtonColumn("Staff", "primary", staffCallback, "ShowTable"));
        columns.push(ButtonColumn("Edit", "#AAFF00", editCallback, "ShowTable"));
    }

    return (
        <>
            <div>Total Courses: {courses.length}</div> 
            <OurTable data={courses} columns={columns} testid={"ShowTable"} />
        </>
    );
};