import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import StaffForm from "main/components/Staff/StaffForm";
import { staffFixture } from "fixtures/staffFixture";
import { BrowserRouter as Router } from "react-router-dom";

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));

  

describe("StaffForm tests", () => {

    test("renders correctly", async () => {

        render(
            <Router  >
                <StaffForm />
            </Router>
        );
        await screen.findByText(/Create/);
    });


    test("renders correctly when passing in a Staff", async () => {

        render(
            <Router  >
                <StaffForm initialContents={staffFixture.oneStaff} />
            </Router>
        );
        await screen.findByTestId(/StaffForm-id/);
        expect(screen.getByTestId(/StaffForm-id/)).toHaveValue("1");
    });


    test("Correct Error messsages on missing input", async () => {

        render(
            <Router  >
                <StaffForm />
            </Router>
        );
        await screen.findByTestId("StaffForm-submit");
        const submitButton = screen.getByTestId("StaffForm-submit");

        fireEvent.click(submitButton);

        await screen.findByText(/courseId is required./);
        expect(screen.getByText(/courseId is required./)).toBeInTheDocument();
        expect(screen.getByText(/githubId is required./)).toBeInTheDocument();
 
    });

    test("No Error messsages on good input", async () => {

        const mockSubmitAction = jest.fn();


        render(
            <Router  >
                <StaffForm submitAction={mockSubmitAction} />
            </Router>
        );
        await screen.findByTestId("StaffForm-courseId");

        const courseField = screen.getByTestId("StaffForm-courseId");
        const githubField = screen.getByTestId("StaffForm-githubId");
        const submitButton = screen.getByTestId("StaffForm-submit");

        fireEvent.change(courseField, { target: { value: "1" } });
        fireEvent.change(githubField, { target: { value: "2" } });
        fireEvent.click(submitButton);

        await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    });
});