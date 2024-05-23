import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";
import StaffForm from "main/components/Staff/StaffForm";
import { Navigate } from 'react-router-dom'
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function StaffEditPage({ storybook = false }) {
    let { id } = useParams();

    const { data: staff, _error, _status } =
        useBackend(
            // Stryker disable next-line all : don't test internal caching of React Query
            [`/api/staff?id=${id}`],
            {  // Stryker disable next-line all : GET is the default, so changing this to "" doesn't introduce a bug
                method: "GET",
                url: `/api/staff/get`,
                params: {
                    id
                }
            }
        );


    const objectToAxiosPutParams = (staff) => ({
        url: "/api/staff/update",
        method: "PUT",
        params: {
            id: staff.id,
            courseId: staff.courseId,
            githubId: staff.githubId
        },
    });

    const onSuccess = (staff) => {
        toast(`Staff Updated - id: ${staff.id} courseid: ${staff.courseId} githubid: ${staff.githubId}`);
    }

    const mutation = useBackendMutation(
        objectToAxiosPutParams,
        { onSuccess },
        // Stryker disable next-line all : hard to set up test for caching
        [`/api/staff?id=${id}`]
    );

    const { isSuccess } = mutation

    const onSubmit = async (data) => {
        mutation.mutate(data);
    }

    if (isSuccess && !storybook) {
        return <Navigate to="/staff" />
    }

    return (
        <BasicLayout>
            <div className="pt-2">
                <h1>Edit Staff</h1>
                {
                    staff && <StaffForm initialContents={staff} submitAction={onSubmit} buttonLabel="Update" />
                }
            </div>
        </BasicLayout>
    )
}
