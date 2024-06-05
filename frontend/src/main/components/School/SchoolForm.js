import { Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';


function SchoolForm({ initialContents, submitAction, buttonLabel = "Create" }) {

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

    // Stryker disable next-line Regex
    const abbrev_regex = /^([a-z._])+$/;

    return (

        <Form onSubmit={handleSubmit(submitAction)}>
            <Row>
                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="abbrev">Abbreviation (all lowercase)</Form.Label>
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Please choose an abbreviation for your school such as ucsb, wsu, uh-hilo, etc, consisting of only lowercase characters and hyphens.</Tooltip>}
                            delay='5'
                        >
                            <Form.Control
                            data-testid="SchoolForm-abbrev"
                            id="abbrev"
                            type="text"
                            isInvalid={Boolean(errors.abbrev)}
                            {...register("abbrev", { required: true, pattern: abbrev_regex })}
                            />

                        </OverlayTrigger>
                        
                        <Form.Control.Feedback type="invalid">
                            {errors.abbrev?.type === 'required' && 'Abbreviation is required. '}
                            {errors.abbrev?.type === 'pattern' && 'Abbreviation must be lowercase letters (_ and . allowed), e.g. ucsb'}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="name">Name</Form.Label>
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>The normal full name by which your school is known, e.g. UC Santa Barbara, U Hawaii - Hilo, Washington State, Oregon State, etc.</Tooltip>}
                            delay='5'
                        >
                            <Form.Control
                                data-testid="SchoolForm-name"
                                id="name"
                                type="text"
                                isInvalid={Boolean(errors.name)}
                                {...register("name", { required: true })}
                            />

                        </OverlayTrigger>
                        
                        <Form.Control.Feedback type="invalid">
                            {errors.name && 'Name is required. '}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="termRegex">Term Regex(Example: W24)</Form.Label>
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Enter a regular expression that can be used for the abbreviations for academic terms at your school.  For example, if your terms are F24, W25, S25, M25, you can use [FWSM]\d\d.  To allow anything to be entered, use .* for this field.</Tooltip>}
                            delay='5'
                        >
                            <Form.Control
                                data-testid="SchoolForm-termRegex"
                                id="termRegex"
                                type="text"
                                isInvalid={Boolean(errors.termRegex)}
                                {...register("termRegex", { required: true})}
                            />
                        </OverlayTrigger>
                        
                        <Form.Control.Feedback type="invalid">
                            {errors.termRegex && 'Term regex is required.'}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="termDescription">Term Description (e.g. Quarter, Semester, Session)</Form.Label>
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Please enter the name of the academic term used at your school.  For example: Semester, Quarter, Session, etc.</Tooltip>}
                            delay='5'
                        >
                            <Form.Control
                                data-testid="SchoolForm-termDescription"
                                id="termDescription"
                                type="text"
                                isInvalid={Boolean(errors.termDescription)}
                                {...register("termDescription", { required: true})}
                            />
                        </OverlayTrigger>
                        
                        <Form.Control.Feedback type="invalid">
                            {errors.termDescription && 'Term Description is required.'}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Button
                        type="submit"
                        data-testid="SchoolForm-submit"
                    >
                        {buttonLabel}
                    </Button>
                    <Button
                        variant="Secondary"
                        onClick={() => navigate(-1)}
                        data-testid="SchoolForm-cancel"
                    >
                        Cancel
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}

export default SchoolForm;
