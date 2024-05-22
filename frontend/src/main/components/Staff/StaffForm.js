import { Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

function StaffForm({ initialContents, submitAction, buttonLabel = "Create" }) {

    // Stryker disable all
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm(
        { defaultValues: initialContents || {}, }
    );
    // Stryker restore all

    const navigate = useNavigate();

    return (

        <Form onSubmit={handleSubmit(submitAction)}>


            <Row>
                {initialContents && (
                    <Col>
                        <Form.Group className="mb-3" >
                            <Form.Label htmlFor="id">Id</Form.Label>
                            <Form.Control
                                data-testid="StaffForm-id"
                                id="id"
                                type="text"
                                {...register("id")}
                                value={initialContents.id}
                                disabled
                            />
                        </Form.Group>
                    </Col>
                )}
            </Row>

            <Row>
                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="courseId">courseId</Form.Label>
                        <Form.Control
                            data-testid="StaffForm-courseId"
                            id="courseId"
                            type="number"
                            isInvalid={Boolean(errors.courseId)}
                            {...register("courseId", { required: true })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.courseId && 'courseId is required.'}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="githubId">Github Id</Form.Label>
                        <Form.Control
                            data-testid="StaffForm-githubId"
                            id="githubId"
                            type="number"
                            isInvalid={Boolean(errors.githubId)}
                            {...register("githubId", { required: true })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.githubId && 'githubId is required. '}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Button
                        type="submit"
                        data-testid="StaffForm-submit"
                    >
                        {buttonLabel}
                    </Button>
                    <Button
                        variant="Secondary"
                        onClick={() => navigate(-1)}
                        data-testid="StaffForm-cancel"
                    >
                        Cancel
                    </Button>
                </Col>
            </Row>
        </Form>

    )
}

export default StaffForm