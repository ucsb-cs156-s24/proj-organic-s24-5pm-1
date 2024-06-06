import { Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { enableEndDateValidation } from './dateValidation'; // Import the JavaScript file
import React, { useEffect, useState } from 'react';

import axios from 'axios';

function formatDateToISO(date) {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultStartDate() {
    const today = new Date();
    today.setHours(0, 1, 0, 0);
    var startDateISO = formatDateToISO(today);
    return startDateISO;
}

function defaultEndDate() {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 120);
    endDate.setHours(23, 59, 0, 0);
    var endDateISO = formatDateToISO(endDate);
    return endDateISO;
}

function CoursesForm({ initialContents, submitAction, buttonLabel = "Create"}) { // schooloptions = drop down menu items
    const [schoolOptions, setSchoolOptions] = useState([]);
    useEffect(() => {
        enableEndDateValidation(); // Call the function to enable end date validation
        axios.get('/api/schools/all')
            .then((data) => {
                return data.data;
            })
            .then((jsonData) => {
                const nameArray = Array.isArray(jsonData) ? jsonData.map(item => item.name) : [jsonData.name];
                setSchoolOptions(nameArray);
            })
    }, 
    // Stryker disable all
    []); 
    // Run only once after component mounts
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm(
        { defaultValues: initialContents || {}, }
    );

    const navigate = useNavigate();
    
    // Stryker restore all
    
    // Stryker disable next-line Regex
    const isodate_regex = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;
    
    return (

        <Form onSubmit={handleSubmit(submitAction)}>


            <Row>

                {initialContents && (
                    <Col>
                        <Form.Group className="mb-3" >
                            <Form.Label htmlFor="id">Id</Form.Label>
                            <Form.Control
                                data-testid="CoursesForm-id"
                                id="id"
                                type="text"
                                {...register("id")}
                                value={initialContents.id}
                                disabled
                            />
                        </Form.Group>
                    </Col>
                )}

                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="name">Name</Form.Label>
                        <Form.Control
                            data-testid="CoursesForm-name"
                            id="name"
                            type="text"
                            isInvalid={Boolean(errors.name)}
                            {...register("name", { required: true })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name && 'Name is required. '}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="school">School</Form.Label>
                        <Form.Select
                            data-testid="CoursesForm-school"
                            id="school"
                            isInvalid={Boolean(errors.school)}
                            {...register("school", { required: true })}
                        >
                            <option value="">Select a school</option>
                            {schoolOptions.map((school, index) => (
                                <option 
                                key={index} 
                                value={school}
                                selected={school === initialContents?.school ? true : false}>
                                    {school}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.school && 'School is required. '}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="term">Term</Form.Label>
                        <Form.Control
                            data-testid="CoursesForm-term"
                            id="term"
                            type="text"
                            isInvalid={Boolean(errors.term)}
                            {...register("term", { required: true })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.term && 'Term is required. '}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="startDate">StartDate(iso format)</Form.Label>
                        <Form.Control
                            data-testid="CoursesForm-startDate"
                            id="startDate"
                            type="datetime-local"
                            isInvalid={Boolean(errors.startDate)}
                            defaultValue={defaultStartDate()}
                            {...register("startDate", { required: true, pattern: isodate_regex })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.startDate && 'StartDate date is required. '}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="">EndDate(iso format)</Form.Label>
                        <Form.Control
                            data-testid="CoursesForm-endDate"
                            id="endDate"
                            type="datetime-local"
                            isInvalid={Boolean(errors.endDate)}
                            defaultValue={defaultEndDate()}
                            {...register("endDate", {required: true, pattern: isodate_regex })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.endDate && 'EndDate date is required. '}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="githubOrg">GithubOrg</Form.Label>
                        <Form.Control
                            data-testid="CoursesForm-githubOrg"
                            id="githubOrg"
                            type="text"
                            isInvalid={Boolean(errors.githubOrg)}
                            {...register("githubOrg", { required: true })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.githubOrg && 'GithubOrg is required. '}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Button
                        type="submit"
                        data-testid="CoursesForm-submit"
                    >
                        {buttonLabel}
                    </Button>
                    <Button
                        variant="Secondary"
                        onClick={() => navigate(-1)}
                        data-testid="CoursesForm-cancel"
                    >
                        Cancel
                    </Button>
                </Col>
            </Row>
        </Form>

    )
}

export default CoursesForm
