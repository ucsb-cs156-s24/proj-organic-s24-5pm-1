import axios from 'axios';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ShowTable from 'main/components/Courses/ShowTable';
import StudentTable from 'main/components/Student/StudentTable';
import { useBackend } from 'main/utils/useBackend';
import { useCurrentUser } from 'main/utils/currentUser';

export default function CoursesShowPage() {
    let { id, courseId } = useParams();
    const { data: currentUser } = useCurrentUser();

    const { data: courses, error: _error, status: _status } =
        // Stryker disable all 
        useBackend(
            [],
            {
                method: "GET", url: "/api/courses/get",
                params: {
                    id
                },
            },
            []
        );
    
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setUploadStatus('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        
        try {
            await axios.post(`/api/students/upload/egrades?courseId=${id}`,formData);
        } catch (error) {
            console.error('Error response:', error);
            setUploadStatus("Error uploading file.");
        }
    };
     
         const { data: students, error: _errors, status: _statuses } =
         // Stryker disable all 
         useBackend(
             [`/api/students/all?courseId=${courseId}`],
             {
                 method: "GET", url: "/api/students/all",
                 params: {
                     courseId: id
                 },
             },
             []
         );
          // Stryker restore all

    return (
        <BasicLayout>
            <div className="pt-2">
                <h1>Individual Course Information</h1>
                <ShowTable courses={[courses]} currentUser={currentUser} />
                <br></br>
                <p>As an admin or instructor, you can navigate from the main courses page to a specific page for each course. This allows you to see a page dedicated to your specific course, which includes functionalities such as uploading the student roster, adding students or staff, and other course-related tasks. </p>
                <br></br>
                {/* Course Roster Upload Link */}
                <p>
                    <strong>Course Roster:</strong>
                    <form onSubmit={handleFileUpload}>
                        <label htmlFor="file-upload">Choose file</label>
                        <input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} />
                        <button type="submit">Upload Roster</button>
                    </form>
                    {uploadStatus && <p>{uploadStatus}</p>}
                </p>
                {/* Staff Roster */}
                <p>
                    <strong>Staff Roster:</strong>
                    <p>View Staff</p>
                </p>
                {/* Student Roster */}
                <p>
                    <strong>Student Roster:</strong>
                    <p>View Students</p>
                    <StudentTable students={students}/>
                </p>
            </div>
        </BasicLayout>
    );
}
