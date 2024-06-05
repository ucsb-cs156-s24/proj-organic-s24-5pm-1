import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import SchoolEditPage from "main/pages/SchoolEditPage";

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
            abbrev: "abb"
        }),
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("SchoolEditPage tests", () => {

    describe("when the backend doesn't return data", () => {

        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/schools", { params: { abbrev: "abb" } }).timeout();
        });

        const queryClient = new QueryClient();
        test("renders header but table is not present", async () => {

            const restoreConsole = mockConsole();

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <SchoolEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );
            await screen.findByText("Edit School");
            expect(screen.queryByTestId("SchoolForm-name")).not.toBeInTheDocument();
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
            axiosMock.onGet("/api/schools", { params: { abbrev: "abb" } }).reply(200, {
                abbrev: "abb",
                name: "name-17",
                termRegex: "W24",
                termDescription: "description-17",
                termError: "error-17" 
            });
            axiosMock.onPut('/api/schools/update').reply(200, {
                abbrev: "abb",
                name: "new-name-17",
                termRegex: "S24",
                termDescription: "new-description-17",
                termError: "new-error-17" 
            });
        });

        const queryClient = new QueryClient();
    
        test("Is populated with the data provided", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <SchoolEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );
            await screen.findByTestId("SchoolForm-abbrev");

            const abbrevField = screen.getByTestId("SchoolForm-abbrev");
            const nameField = screen.getByTestId("SchoolForm-name");
            const termRegexField = screen.getByTestId("SchoolForm-termRegex");
            const termDescriptionField = screen.getByTestId("SchoolForm-termDescription");
            const submitButton = screen.getByTestId("SchoolForm-submit");

            expect(abbrevField).toBeInTheDocument();
            expect(abbrevField).toHaveValue("abb");
            expect(nameField).toBeInTheDocument();
            expect(nameField).toHaveValue("name-17");
            expect(termRegexField).toBeInTheDocument();
            expect(termRegexField).toHaveValue("W24");
            expect(termDescriptionField).toBeInTheDocument();
            expect(termDescriptionField).toHaveValue("description-17");

            expect(submitButton).toHaveTextContent("Update");

            fireEvent.change(nameField, { target: { value: 'new-name-17' } });
            fireEvent.change(termRegexField, { target: { value: 'S24' } });
            fireEvent.change(termDescriptionField, { target: { value: 'new-description-17' } });
            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            expect(mockToast).toBeCalledWith("School Updated - abbrev: abb name: new-name-17");
            
            expect(mockNavigate).toBeCalledWith({ "to": "/schools" });

            expect(axiosMock.history.put.length).toBe(1); 
            expect(axiosMock.history.put[0].params).toEqual({ abbrev: 'abb' });
            expect(axiosMock.history.put[0].data).toBe(JSON.stringify({
                name: "new-name-17",
                termRegex: "S24",
                termDescription: "new-description-17",
                termError: "error-17" 
            })); 


        });

        test("Changes when you click Update", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <SchoolEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );


            const abbrevField = screen.getByTestId("SchoolForm-abbrev");
            const nameField = screen.getByTestId("SchoolForm-name");
            const termRegexField = screen.getByTestId("SchoolForm-termRegex");
            const termDescriptionField = screen.getByTestId("SchoolForm-termDescription");
            const submitButton = screen.getByTestId("SchoolForm-submit");

    
            expect(abbrevField).toHaveValue("abb");
            expect(nameField).toHaveValue("name-17");
            expect(termRegexField).toHaveValue("W24");
            expect(termDescriptionField).toHaveValue("description-17");

            fireEvent.change(nameField, { target: { value: 'new-name-17' } });
            fireEvent.change(termRegexField, { target: { value: 'S24' } });
            fireEvent.change(termDescriptionField, { target: { value: 'new-description-17' } });
            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            expect(mockToast).toBeCalledWith("School Updated - abbrev: abb name: new-name-17");
            expect(mockNavigate).toBeCalledWith({ "to": "/schools" });
        });

       
    });
});