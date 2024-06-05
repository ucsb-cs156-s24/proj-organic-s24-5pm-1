
import React from 'react';
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { coursesFixtures } from 'fixtures/coursesFixtures';
import { rest } from "msw";

import CoursesShowPage from 'main/pages/CoursesShowPage';

export default {
    title: 'pages/CoursesShowPage',
    component: CoursesShowPage
};

const Template = () => <CoursesShowPage storybook={true}/>;

export const Empty = Template.bind({});
Empty.parameters = {
    msw: [
        rest.get('/api/currentUser', (_req, res, ctx) => {
            return res( ctx.json(apiCurrentUserFixtures.userOnly));
        }),
        rest.get('/api/systemInfo', (_req, res, ctx) => {
            return res(ctx.json(systemInfoFixtures.showingNeither));
        }),
        rest.get('/api/courses/get', (_req, res, ctx) => {
            return res(ctx.json([]));
        })/*,
        rest.put('/api/courses', async (req, res, ctx) => {
            var reqBody = await req.text();
            window.alert("PUT: " + req.url + " and body: " + reqBody);
            return res(ctx.status(200),ctx.json({}));
        })*/,
    ],
}
export const OrdinaryUser = Template.bind({});

OrdinaryUser.parameters = {
    msw: [
        rest.get('/api/currentUser', (_req, res, ctx) => {
            return res( ctx.json(apiCurrentUserFixtures.userOnly));
        }),
        rest.get('/api/systemInfo', (_req, res, ctx) => {
            return res(ctx.json(systemInfoFixtures.showingNeither));
        }),
        rest.get('/api/courses/get', (_req, res, ctx) => {
            return res(ctx.json(coursesFixtures.oneCourse));
        }),
    ],
}

export const AdminUser = Template.bind({});

AdminUser.parameters = {
    msw: [
        rest.get('/api/currentUser', (_req, res, ctx) => {
            return res( ctx.json(apiCurrentUserFixtures.adminUser));
        }),
        rest.get('/api/systemInfo', (_req, res, ctx) => {
            return res(ctx.json(systemInfoFixtures.showingNeither));
        }),
        rest.get('/api/courses/get', (_req, res, ctx) => {
            return res(ctx.json(coursesFixtures.oneCourse));
        })
    ],
}

export const InstructorUser = Template.bind({});

InstructorUser.parameters = {
    msw: [
        rest.get('/api/currentUser', (_req, res, ctx) => {
            return res( ctx.json(apiCurrentUserFixtures.instructorUser));
        }),
        rest.get('/api/systemInfo', (_req, res, ctx) => {
            return res(ctx.json(systemInfoFixtures.showingNeither));
        }),
        rest.get('/api/courses/get', (_req, res, ctx) => {
            return res(ctx.json(coursesFixtures.oneCourse));
        })
    ],
}
