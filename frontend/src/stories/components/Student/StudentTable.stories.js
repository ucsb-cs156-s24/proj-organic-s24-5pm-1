import React from 'react';
import StudentTable from 'main/components/Student/StudentTable';
import { studentFixture } from 'fixtures/studentFixture';
import { currentUserFixtures } from 'fixtures/currentUserFixtures';
import { rest } from "msw";

export default {
    title: 'components/Student/StudentTable',
    component: StudentTable
};

const Template = (args) => {
    return (
        <StudentTable {...args} />
    )
};

export const Empty = Template.bind({});

Empty.args = {
    students: []
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
    students: studentFixture.threeStudents,
    currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
    students: studentFixture.threeStudents,
    currentUser: currentUserFixtures.adminUser,
}

ThreeItemsAdminUser.parameters = {
    msw: [
        rest.delete('/api/course/student/all', (req, res, ctx) => {
            window.alert("DELETE: " + JSON.stringify(req.url));
            return res(ctx.status(200),ctx.json({}));
        }),
    ]
};