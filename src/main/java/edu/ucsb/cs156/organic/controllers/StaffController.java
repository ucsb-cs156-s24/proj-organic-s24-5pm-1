package edu.ucsb.cs156.organic.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;

import edu.ucsb.cs156.organic.entities.Staff;
import edu.ucsb.cs156.organic.entities.User;
import edu.ucsb.cs156.organic.errors.EntityNotFoundException;
import edu.ucsb.cs156.organic.repositories.StaffRepository;
import edu.ucsb.cs156.organic.repositories.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "Staff")
@RequestMapping("/api/staff")
@RestController
@Slf4j
public class StaffController extends ApiController{

    @Autowired
    StaffRepository staffRepository;

    @Autowired
    UserRepository userRepository;

    @Operation(summary = "List all staff")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<Staff> allCourses() {
        User u = getCurrentUser().getUser();
        log.info("u={}", u);

        return staffRepository.findAll();
    }

    @Operation(summary = "Create a new staff")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @PostMapping("")
    public Staff postCourse(
            @Parameter(name = "courseId", description = "course id") @RequestParam Long courseId,
            @Parameter(name = "githubId", description = "school abbreviation e.g. UCSB") @RequestParam Integer githubId)
            throws JsonProcessingException {


        Staff staff = Staff.builder()
                    .courseId(courseId)
                    .githubId(githubId)
                    .build();

        Staff savedStaff = staffRepository.save(staff);

        return savedStaff;
    }

    @Operation(summary = "Get Staff")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("")
    public Staff getStaff(
            @Parameter(name = "id") @RequestParam Long id)
            throws JsonProcessingException {

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Staff.class, id.toString()));

        return staff;
    }

    @Operation(summary = "Update information for a staff member")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @PutMapping("")
    public Staff updateStaff(
            @Parameter(name = "id") @RequestParam Long id,
            @Parameter(name = "courseId", description = "course id") @RequestParam Long courseId,
            @Parameter(name = "githubId", description = "school abbreviation e.g. UCSB") @RequestParam Integer githubId)
            throws JsonProcessingException {

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Staff.class, id.toString()));

        staff.setCourseId(courseId);
        staff.setGithubId(githubId);

        staff = staffRepository.save(staff);
        log.info("staff={}", staff);

        return staff;
    }

    @Operation(summary = "Delete a staff")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Staff deleteCourse(
            @Parameter(name = "id") @RequestParam Long id)
            throws JsonProcessingException {

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Staff.class, id.toString()));

        // Check if the current user is a staff member for this course or an admin. If
        // not, throw AccessDeniedException

        staffRepository.delete(staff);
        return staff;
    }
}
