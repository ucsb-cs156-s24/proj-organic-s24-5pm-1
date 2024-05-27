import React from 'react'
import { useBackend } from 'main/utils/useBackend';
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { Button } from 'react-bootstrap';
import { useCurrentUser, hasRole} from 'main/utils/currentUser';
import StaffTable from 'main/components/Staff/StaffTable';

export default function StaffIndexPage() {

  const { data: currentUser } = useCurrentUser();
  const createButton = () => {  

      return (
          <Button
              variant="primary"
              href="/staff/create"
              style={{ float: "right" }}
          >
              Create Staff 
          </Button>
      )

  }

  const { data: staff, error: _error, status: _status } =
    useBackend(
      // Stryker disable next-line all : don't test internal caching of React Query
      ["/api/staff/all"],
      // Stryker disable next-line all : GET is the default
      { method: "GET", url: "/api/staff/all" },
      []
    );

    return (
      <BasicLayout>
        <div className="pt-2">
          {(hasRole(currentUser, "ROLE_ADMIN") || hasRole(currentUser, "ROLE_INSTRUCTOR")) && createButton()}
          <h1>Staff</h1>
          <StaffTable staff={staff} currentUser={currentUser} />

        </div>
      </BasicLayout>
    )
}