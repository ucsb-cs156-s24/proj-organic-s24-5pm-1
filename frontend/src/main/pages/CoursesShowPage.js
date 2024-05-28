import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import CoursesShowPage from "main/pages/CoursesShowPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { coursesFixtures } from "fixtures/coursesFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

const mockToast = jest.fn();
jest.mock('react-toastify', () => {
    const originalModule = jest.requireActual('react-toastify');
    return {
        __esModule: true,
        ...originalModule,
        toast: (x) => mockToast(x)
    };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    return {
        __esModule: true,
        ...originalModule,
        useParams: () => ({
            id: 17
        }),
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("CoursesShowPage tests", () => {

    const axiosMock = new AxiosMockAdapter(axios);

    const testId = "CoursesTable";

    const setupAdminUser = () => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    };

    const setupInstructorUser = () => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.instructorUser);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    }

    const setupUser = () => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    }

    const renderCoursesShowPage = async (userSetup) => {
        userSetup();
        const queryClient = new QueryClient();
        axiosMock.onGet("/api/courses/get", { params: { id: 17 } }).reply(200, coursesFixtures.threeCourses[0]);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CoursesShowPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => { expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1"); });
    };

    test("renders course correctly for admin", async () => {
        await renderCoursesShowPage(setupAdminUser);
    });

    test("renders course correctly for instructor", async () => {
        await renderCoursesShowPage(setupInstructorUser);
    });

    const renderAndAssertEmptyTable = async (userSetup) => {
        userSetup();
        const queryClient = new QueryClient();
        axiosMock.onGet("/api/courses/get", { params: { id: 17 } }).timeout();
        const restoreConsole = mockConsole();

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CoursesShowPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => { expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1); });

        restoreConsole();

        expect(screen.queryByTestId(`${testId}-cell-row-0-col-id`)).not.toBeInTheDocument();
    };

    test("renders empty table when backend unavailable, admin", async () => {
        await renderAndAssertEmptyTable(setupAdminUser);
    });

    test("renders empty table when backend unavailable, instructor", async () => {
        await renderAndAssertEmptyTable(setupInstructorUser);
    });

    const testDeleteCourse = async (userSetup) => {
        userSetup();
        const queryClient = new QueryClient();
        axiosMock.onGet("/api/courses/get", { params: { id: 17 } }).reply(200, coursesFixtures.threeCourses[0]);
        axiosMock.onDelete("/api/courses/delete").reply(200, "Course with id 1 was deleted");

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CoursesShowPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => { expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toBeInTheDocument(); });
        expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");

        const deleteButton = screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`);
        expect(deleteButton).toBeInTheDocument();

        fireEvent.click(deleteButton);

        await waitFor(() => { expect(mockToast).toBeCalledWith("Course with id 1 was deleted") });
    };

    test("what happens when you click delete, admin", async () => {
        await testDeleteCourse(setupAdminUser);
    });

    test("what happens when you click delete, instructor", async () => {
        await testDeleteCourse(setupInstructorUser);
    });

    test("tests buttons for editing do not show up for user", async () => {
        setupUser();
        const queryClient = new QueryClient();
        axiosMock.onGet("/api/courses/get", { params: { id: 17 } }).reply(200, coursesFixtures.threeCourses[0]);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CoursesShowPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => { expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toBeInTheDocument(); });
        expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");

        const deleteButton = screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`);
        expect(deleteButton).not.toBeInTheDocument();
    });

    const checkLengthHelper = (courses) => {
        let checkLength = courses;
        if (courses && courses.length !== 0) {
            checkLength = [courses];
        }
        return checkLength;
    };

    test("checkLength should contain courses if courses exists", () => {
        const courses = [{ id: 1, name: "Test Course" }];
        let checkLength = checkLengthHelper(courses);
        expect(checkLength).toEqual([courses]);
    });

    test("checkLength should contain courses if courses exists but is empty", () => {
        const courses = [];
        let checkLength = checkLengthHelper(courses);
        expect(checkLength).toEqual(courses);
    });

    test("throw a falsy value to courses?", async () => {
        setupAdminUser();
        const queryClient = new QueryClient();
        axiosMock.onGet("/api/courses/get", { params: { id: 17 } }).reply(200, 0);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CoursesShowPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(screen.queryByTestId(`${testId}-cell-row-0-col-id`)).not.toBeInTheDocument();
    });

    test("check that the course links are correct", async () => {
        setupAdminUser();
        const queryClient = new QueryClient();
        axiosMock.onGet("/api/courses/get", { params: { id: 17 } }).reply(200, coursesFixtures.threeCourses[0]);
    
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CoursesShowPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
    
        await waitFor(() => {
            expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toBeInTheDocument();
        });
    
        expect(screen.getByRole('link', { name: /Upload Roster/i })).toHaveAttribute('href', '/courses/17/roster-upload');
        expect(screen.getByRole('link', { name: /View Staff/i })).toHaveAttribute('href', '/courses/17/staff-roster');
        expect(screen.getByRole('link', { name: /View Students/i })).toHaveAttribute('href', '/courses/17/student-roster');
    });

});