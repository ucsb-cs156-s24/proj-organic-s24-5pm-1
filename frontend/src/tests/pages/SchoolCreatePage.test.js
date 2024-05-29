import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import SchoolCreatePage from "main/pages/SchoolCreatePage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("SchoolCreatePage tests", () => {

    const axiosMock =new AxiosMockAdapter(axios);

    beforeEach(() => {
        jest.clearAllMocks();
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    });

    

    const queryClient = new QueryClient();
    test("renders without crashing", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <SchoolCreatePage />
                </MemoryRouter>
            </QueryClientProvider>
        );
    });

    test("on submit, makes request to backend", async () => {

        const queryClient = new QueryClient();
        const school = {
            abbrev: "abb",
            name: "name-1",
            termRegex: "[WSMF]\\d\\d",
            termDescription: "F23",
            termError: "error-1"
        };

        axiosMock.onPost("/api/schools/post").reply(200, school);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <SchoolCreatePage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        
        expect(await screen.findByText("Create New School")).toBeInTheDocument();

        const abbrevField = screen.getByTestId("SchoolForm-abbrev");
        const nameField = screen.getByTestId("SchoolForm-name");
        const termRegexField = screen.getByTestId("SchoolForm-termRegex");
        const termDescriptionField = screen.getByTestId("SchoolForm-termDescription");
        const termErrorField = screen.getByTestId("SchoolForm-termError");
        const submitButton = screen.getByTestId("SchoolForm-submit");

       
        fireEvent.change(abbrevField, { target: { value: 'abb' } });
        fireEvent.change(nameField, { target: { value: 'name-1' } });
        fireEvent.change(termRegexField, { target: { value: '[WSMF]\\d\\d' } });
        fireEvent.change(termDescriptionField, { target: { value: 'F23' } });
        fireEvent.change(termErrorField, { target: { value: 'error-1' } });
      

        fireEvent.click(submitButton);

        await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

        expect(axiosMock.history.post[0].data).toEqual(
            JSON.stringify({
                "abbrev": "abb",
                "name": "name-1",
                "termRegex": "[WSMF]\\d\\d",
                "termDescription": "F23",
                "termError": "error-1"
        }));

        expect(mockToast).toBeCalledWith("New school created - id: abb");
        expect(mockNavigate).toBeCalledWith({ "to": "/schools" });
    });


});