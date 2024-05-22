
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
              href="/staffs/create"
              style={{ float: "right" }}
          >
              Create Staff 
          </Button>
      )
    
  }
  
  const { data: staffs, error: _error, status: _status } =
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
          {(hasRole(currentUser, "ROLE_ADMIN") || hasRole(currentUser, "ROLE_INSTRUCTOR") 
        //   || hasRole(currentUser, "ROLE_USER")
          ) && createButton()}
          <h1>Staffs</h1>
          <StaffTable staff={staffs} currentUser={currentUser} />
    
        </div>
      </BasicLayout>
    )
}
