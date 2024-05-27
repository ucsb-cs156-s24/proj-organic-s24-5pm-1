import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import StaffEditPage from "main/pages/StaffEditPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
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

describe("StaffEditPage tests", () => {

    describe("when the backend doesn't return data", () => {

        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/staff/get", { params: { id: 17 } }).timeout();
        });

        const queryClient = new QueryClient();
        test("renders header but table is not present", async () => {

            const restoreConsole = mockConsole();

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <StaffEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );
            await screen.findByText("Edit Staff");
            expect(screen.queryByTestId("StaffForm-courseId")).not.toBeInTheDocument();
            restoreConsole();
        });
    });

    describe("tests where backend is working normally", () => {

        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/staff/get", { params: { id: 17 } }).reply(200, {
                id: 17,
                courseId: "2",
                githubId: "3"
            });
            axiosMock.onPut('/api/staff/update').reply(200, {
                id: "17",
                courseId: "4",
                githubId: "5"
            });
        });

        const queryClient = new QueryClient();
        test("renders without crashing", () => {
            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <StaffEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );
        });

        test("Is populated with the data provided", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <StaffEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("StaffForm-courseId");

            const idField = screen.getByTestId("StaffForm-id");
            const courseField = screen.getByTestId("StaffForm-courseId");
            const githubField = screen.getByTestId("StaffForm-githubId");
            const submitButton = screen.getByTestId("StaffForm-submit");

            expect(idField).toHaveValue("17");
            expect(courseField).toHaveValue(2);
            expect(githubField).toHaveValue(3);
            expect(submitButton).toBeInTheDocument();
        });

        test("Changes when you click Update", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <StaffEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("StaffForm-courseId");

            const idField = screen.getByTestId("StaffForm-id");
            const courseField = screen.getByTestId("StaffForm-courseId");
            const githubField = screen.getByTestId("StaffForm-githubId");
            const submitButton = screen.getByTestId("StaffForm-submit");

            expect(idField).toHaveValue("17");
            expect(courseField).toHaveValue(2);
            expect(githubField).toHaveValue(3);
            expect(submitButton).toBeInTheDocument();

            fireEvent.change(courseField, { target: { value: "4" } })
            fireEvent.change(githubField, { target: { value: "5" } })

            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            
            expect(mockToast).toBeCalledWith("Staff Updated - id: 17 courseid: 4 githubid: 5");
            expect(mockNavigate).toBeCalledWith({ "to": "/staff" });

            expect(axiosMock.history.put.length).toBe(1); // times called
            expect(axiosMock.history.put[0].params).toEqual({ id: 17, courseId: "4", githubId: "5"});

        });
    });
});

