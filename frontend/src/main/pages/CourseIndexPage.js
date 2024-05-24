import React from 'react'
import { useBackend } from 'main/utils/useBackend';
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CoursesTable from 'main/components/Courses/CoursesTable';
import { Button } from 'react-bootstrap';
import { useCurrentUser, hasRole } from 'main/utils/currentUser';

export default function CourseIndexPage() {

  const { data: currentUser } = useCurrentUser();
  const createButton = () => {

    return (
      <Button
        variant="primary"
        href="/courses/create"
        style={{ float: "right" }}
      >
        Create Course
      </Button>
    )

  }
  const staffButton = () => {
    return (
      <Button variant="primary" href="/staff" style={{ float: "middle" }}>
        Staff Click Here
      </Button>
    );
  }

  const { data: courses, error: _error, status: _status } =
    useBackend(
      // Stryker disable next-line all : don't test internal caching of React Query
      ["/api/courses/all"],
      // Stryker disable next-line all : GET is the default
      { method: "GET", url: "/api/courses/all" },
      []
    );


  return (
    <BasicLayout>
      <div className="pt-2">
        {(hasRole(currentUser, "ROLE_ADMIN") || hasRole(currentUser, "ROLE_INSTRUCTOR")) && (
          <React.Fragment>
            {createButton()}
            {staffButton()}
          </React.Fragment>
        )}
        <h1>Course</h1>
        <CoursesTable courses={courses} currentUser={currentUser} />
      </div>
    </BasicLayout>
  );
}
