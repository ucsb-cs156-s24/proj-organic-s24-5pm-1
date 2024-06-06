import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import CoursesForm from "main/components/Courses/CoursesForm";
import { coursesFixtures } from "fixtures/coursesFixtures";
import { BrowserRouter as Router } from "react-router-dom";
import { enableEndDateValidation } from "main/components/Courses/dateValidation"; // Import the function to test
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { schoolsFixtures } from "fixtures/schoolsFixtures";


const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));

jest.mock("main/components/Courses/dateValidation", () => ({
    enableEndDateValidation: jest.fn(), // Mock the function
  }));
  

describe("CoursesForm tests", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
        jest.clearAllMocks();
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/schools/all").reply(200, schoolsFixtures.threeSchools);

    });

    //newly added for mutation
    test('initializes with an empty array for school options', () => {
        render(<CoursesForm initialContents={{}} submitAction={jest.fn()} />);
      
        // Check that the initial state does not contain "Stryker was here"
        const listItem = screen.queryByText('Stryker was here');
        expect(listItem).not.toBeInTheDocument();
    });

    test("calls enableEndDateValidation on mount", () => {
        render(<CoursesForm />);
    
        expect(enableEndDateValidation).toHaveBeenCalled();
      });

    test("renders correctly", async () => {

        render(
            <Router  >
                <CoursesForm />
            </Router>
        );
        await screen.findByText(/Name/);
        await screen.findByText(/Create/);
    });


    test("renders correctly when passing in a Courses", async () => {

        render(
            <Router  >
                <CoursesForm initialContents={coursesFixtures.oneCourse} />
            </Router>
        );
        await screen.findByTestId(/CoursesForm-id/);
        expect(screen.getByText(/Id/)).toBeInTheDocument();
        expect(screen.getByTestId(/CoursesForm-id/)).toHaveValue("1");
    });


    test("Correct Error messsages on missing input", async () => {

        render(
            <Router  >
                <CoursesForm />
            </Router>
        );
        await screen.findByTestId("CoursesForm-submit");
        const submitButton = screen.getByTestId("CoursesForm-submit");

        fireEvent.click(submitButton);

        await screen.findByText(/Name is required./);
        expect(screen.getByText(/Name is required/)).toBeInTheDocument();
        expect(screen.getByText(/School is required./)).toBeInTheDocument();
        expect(screen.getByText(/Term is required./)).toBeInTheDocument();
        // expect(screen.getByText(/StartDate date is required./)).toBeInTheDocument();
        // expect(screen.getByText(/EndDate date is required./)).toBeInTheDocument();
        expect(screen.getByText(/GithubOrg is required./)).toBeInTheDocument();
    });

    test("No Error messages on good input", async () => {


        const mockSubmitAction = jest.fn();


        render(
            <Router  >
                <CoursesForm submitAction={mockSubmitAction} />
            </Router>
        );
        await screen.findByTestId("CoursesForm-name");

        const nameField = screen.getByTestId("CoursesForm-name");
        const schoolField = screen.getByTestId("CoursesForm-school");
        const termField = screen.getByTestId("CoursesForm-term");
        const startDateField = screen.getByTestId("CoursesForm-startDate");
        const endDateField = screen.getByTestId("CoursesForm-endDate");
        const githubOrgField = screen.getByTestId("CoursesForm-githubOrg")
        const submitButton = screen.getByTestId("CoursesForm-submit");

        fireEvent.change(nameField, { target: { value: "CMPSC 156" } });
        fireEvent.change(schoolField, { target: { value: 'UC Santa Barbara' } });
        fireEvent.change(termField, { target: { value: 'f23' } });
        fireEvent.change(startDateField, { target: { value: '2022-01-02T12:00' } });
        fireEvent.change(endDateField, { target: { value: '2022-02-02T12:00' } });
        fireEvent.change(githubOrgField, { target: { value: 'cs156-f23'}})
        fireEvent.click(submitButton);

        await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

        expect(screen.queryByText(/StartDate date is required./)).not.toBeInTheDocument();
        expect(screen.queryByText(/EndDate date is required./)).not.toBeInTheDocument();

    });


    test("that navigate(-1) is called when Cancel is clicked", async () => {

        render(
            <Router  >
                <CoursesForm />
            </Router>
        );
        await screen.findByTestId("CoursesForm-cancel");
        const cancelButton = screen.getByTestId("CoursesForm-cancel");

        fireEvent.click(cancelButton);

        await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));

    });

    test("makes API call and sets school options on mount", async () => {
        render(
            <Router>
                <CoursesForm />
            </Router>
        );

        // Check if the axios call was made
        await waitFor(() => expect(axiosMock.history.get.length).toBe(1));

        // Check if the school options are set correctly
        await waitFor(() => {
            expect(screen.getByTestId("CoursesForm-school")).toHaveTextContent("UC Santa Barbara");
        });
    });

    // Test to ensure useEffect dependency array is correctly handled
    test('useEffect dependency array is empty and runs only once', async () => {
        const { rerender } = render(
            <Router>
                <CoursesForm />
            </Router>
        );

        // First render: should call API and set school options
        await waitFor(() => expect(axiosMock.history.get.length).toBe(1));

        // Re-render with the same component: should not call API again
        rerender(
            <Router>
                <CoursesForm />
            </Router>
        );

        // Ensure no additional API calls are made
        expect(axiosMock.history.get.length).toBe(1);
    });
    
});