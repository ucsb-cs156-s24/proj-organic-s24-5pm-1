import ShowTable from "main/components/Courses/ShowTable"
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { coursesFixtures } from "fixtures/coursesFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";


const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));

describe("UserTable tests", () => {
  const queryClient = new QueryClient();

  test("Has the expected column headers and content for ordinary user", () => {

    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ShowTable courses={coursesFixtures.threeCourses} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>

    );

    const expectedHeaders = ["id", "Name", "School", "Term", "StartDate", "EndDate", "GitHub Org"];
    const expectedFields = ["id", "name", "school", "term", "startDate", "endDate", "githubOrg"];
    const testId = "ShowTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");



    const editButton = screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`);
    expect(editButton).not.toBeInTheDocument();

    const totalCoursesElement = screen.getByText("Total Courses: 3"); // Assuming there are 3 courses in the fixture
    expect(totalCoursesElement).toBeInTheDocument();

  });


  
  test("renders empty table correctly", () => {

    // arrange
    const currentUser = currentUserFixtures.adminUser;
    const expectedHeaders = ["id", "Name", "School", "Term", "StartDate", "EndDate", "GitHub Org"];
    const expectedFields = ["id", "name", "school", "term", "startDate", "endDate", "githubOrg"];
    const testId = "ShowTable";
    
    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ShowTable courses={[]} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const fieldElement = screen.queryByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(fieldElement).not.toBeInTheDocument();
    });

    const totalCoursesElement = screen.getByText("Total Courses: 0"); // Since the table is empty
    expect(totalCoursesElement).toBeInTheDocument();
  });


  test("Has the expected colum headers and content for adminUser", () => {

    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
            <ShowTable courses={coursesFixtures.threeCourses} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>

    );

    const expectedHeaders = ["id", "Name", "School", "Term", "StartDate", "EndDate", "GitHub Org"];
    const expectedFields = ["id", "name", "school", "term", "startDate", "endDate", "githubOrg"];
    const testId = "ShowTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");

    const editButton = screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`);
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const totalCoursesElement = screen.getByText("Total Courses: 3"); // Assuming there are 3 courses in the fixture
    expect(totalCoursesElement).toBeInTheDocument();
  });

  test("Has the expected colum headers and content for instructorUser", () => {

    const currentUser = currentUserFixtures.instructorUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
            <ShowTable courses={coursesFixtures.threeCourses} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>

    );

    const expectedHeaders = ["id", "Name", "School", "Term", "StartDate", "EndDate", "GitHub Org"];
    const expectedFields = ["id", "name", "school", "term", "startDate", "endDate", "githubOrg"];
    const testId = "ShowTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");


    const staffButton = screen.getByTestId(`${testId}-cell-row-0-col-Staff-button`);
    expect(staffButton).toBeInTheDocument();
    expect(staffButton).toHaveClass("btn-primary");

    const editButton = screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`);
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

  });


  test("Staff button navigates to the staff page for admin user", async () => {

    const currentUser = currentUserFixtures.adminUser;


    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
            <ShowTable courses={coursesFixtures.threeCourses} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>

    );

    await waitFor(() => { expect(screen.getByTestId(`ShowTable-cell-row-0-col-id`)).toHaveTextContent("1"); });



    const staffButton = screen.getByTestId(`ShowTable-cell-row-0-col-Staff-button`);
    expect(staffButton).toBeInTheDocument();

    fireEvent.click(staffButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith('/courses/1/staff'));

  });


  test("Edit button navigates to the edit page for admin user", async () => {

    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
            <ShowTable courses={coursesFixtures.threeCourses} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>

    );

    await waitFor(() => { expect(screen.getByTestId(`ShowTable-cell-row-0-col-id`)).toHaveTextContent("1"); });

    const editButton = screen.getByTestId(`ShowTable-cell-row-0-col-Edit-button`);
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith('/courses/edit/1'));
    
    const totalCoursesElement = screen.getByText("Total Courses: 3"); // Assuming there are 3 courses in the fixture
    expect(totalCoursesElement).toBeInTheDocument();
    
  });
});