import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import StaffForm from "main/components/Staff/StaffForm";
import { Navigate } from 'react-router-dom'
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function StaffCreatePage({storybook=false}) {

    const objectToAxiosParams = (staff) => ({
        url: "/api/staff/post",
        method: "POST",
        params: {
        courseid: staff.courseid,
        githubid: staff.githubid
        }
    });

    const onSuccess = (staff) => {
        toast(`New staff created - id: ${staff.id}`);
    }

    const mutation = useBackendMutation(
        objectToAxiosParams,
        { onSuccess }, 
        // Stryker disable next-line all : hard to set up test for caching
        ["/api/staff/all"] // mutation makes this key stale so that pages relying on it reload
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
            <h1>Create New Staff</h1>

            <StaffForm submitAction={onSubmit} />

        </div>
        </BasicLayout>
    )
}