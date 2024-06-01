import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CoursesShowPage from "main/pages/CoursesShowPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { coursesFixtures } from "fixtures/coursesFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";
import path from 'path';
import fs from 'fs';
import userEvent from '@testing-library/user-event';


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
            id: 17,
        }),
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("CoursesShowPage tests", () => {

    const axiosMock = new AxiosMockAdapter(axios);

    const testId = "ShowTable";

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
    };

    test("renders empty table when backend unavailable, admin", async () => {
        await renderAndAssertEmptyTable(setupAdminUser);
    });

    test("renders empty table when backend unavailable, instructor", async () => {
        await renderAndAssertEmptyTable(setupInstructorUser);
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

    test("check if correct API URL is called", async () => {
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
            expect(axiosMock.history.get.length).toBe(4);
        });
        await waitFor(() => {
            expect(axiosMock.history.get[0].url).toBe("/api/currentUser");
        });
    });

    test("check if correct HTTP method is used", async () => {
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
            expect(axiosMock.history.get.length).toBe(4);
        });
        await waitFor(() => {
            expect(axiosMock.history.get[0].method).toBe("get");
        });
    });

    test("renders CoursesTable when courses data is available", async () => {
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

        expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toBeInTheDocument();
    });

    test('displays an error if no file is selected for upload', async () => {
        
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CoursesShowPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Click the upload button without selecting a file
        fireEvent.click(screen.getByText('Upload Roster'));

        // Expect an error message to be displayed
        expect(screen.getByText('Please select a file to upload.')).toBeInTheDocument();
    });

    test('displays an error message on file upload failure', async () => {
        const mockAxios = new AxiosMockAdapter(axios);
        const queryClient = new QueryClient();

        mockAxios.onPost('/api/students/upload/egrades?courseId=1').reply(400, {
            message: 'File upload failed.'
        });

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/courses/show/1']}>
                    <Routes>
                        <Route path="/courses/show/:id" element={<CoursesShowPage />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Select a file
        const file = new File(['dummy content'], 'example.csv', { type: 'text/csv' });
        const fileInput = screen.getByLabelText('Choose file'); // Ensure this matches the label or use `getByTestId`
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Click the upload button
        fireEvent.click(screen.getByText('Upload Roster'));

        // Wait for the error message
        await waitFor(() => {
            expect(screen.getByText('Error uploading file.')).toBeInTheDocument();
        });

        // Ensure the mock was called
        expect(mockAxios.history.post.length).toBe(1);

        // Verify the form data
        const formData = mockAxios.history.post[0].data;
        const formDataEntries = Array.from(new URLSearchParams(formData));
        expect(formDataEntries).toEqual([['file', '[object File]']]);
    });

    test('successfully uploads a file', async () => {
        const mockAxios = new AxiosMockAdapter(axios);
        const queryClient = new QueryClient();

        const csvFilePath = path.resolve(__dirname, '../../../../docs/examples/egrades.csv');
        const csvContent = fs.readFileSync(csvFilePath, 'utf-8');

        const file = new File([csvContent], 'egrades.csv', { type: 'text/csv' });

        mockAxios.onPost('/api/students/upload/egrades?courseId=1').reply(200, {
            message: 'File uploaded successfully.'
        });

        axiosMock.onGet("/api/courses/get", { params: { id: 1 } }).reply(200, coursesFixtures.threeCourses[0]);


        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/courses/show/1']}>
                    <CoursesShowPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const fileInput = screen.getByLabelText(/Choose file/i);
        userEvent.upload(fileInput, file);

        const submitButton = screen.getByText(/upload roster/i);
        userEvent.click(submitButton);
        
        await waitFor(() => {
            expect(screen.getByText('File uploaded successfully.')).toBeInTheDocument();
        });

        expect(mockAxios.history.post.length).toBe(1);
    });
});

