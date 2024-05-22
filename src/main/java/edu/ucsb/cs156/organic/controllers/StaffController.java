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

    // @Autowired
    // StaffRepository courseStaffRepository;

    @Autowired
    UserRepository userRepository;

    @Operation(summary = "List all staff")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<Staff> allCourses() {
        User u = getCurrentUser().getUser();
        log.info("u={}", u);
        if (u.isAdmin()) {
            return staffRepository.findAll();
        } else {
            return staffRepository.findByGithubId(u.getGithubId());
        }
    }

//     @Operation(summary= "Get a single course by id")
//     @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
//     @GetMapping("/get")
//     public Course getById(
//             @Parameter(name="id") @RequestParam Long id) {
//         User u = getCurrentUser().getUser();

//         Course course = courseRepository.findById(id)
//                 .orElseThrow(() -> new EntityNotFoundException(Course.class, id));
        
//         if(!u.isAdmin()){
//                 courseStaffRepository.findByCourseIdAndGithubId(id, u.getGithubId())
//                         .orElseThrow(() -> new AccessDeniedException(
//                 String.format("User %s is not authorized to get course %d", u.getGithubLogin(), id)));
//         }

//         return course;
// }

    @Operation(summary = "Create a new staff")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @PostMapping("/post")
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

//     @Operation(summary = "Add a staff member to a course")
//     @PreAuthorize("hasRole('ROLE_ADMIN')")
//     @PostMapping("/addStaff")
//     public Staff addStaff(
//             @Parameter(name = "courseId") @RequestParam Long courseId,
//             @Parameter(name = "githubLogin") @RequestParam String githubLogin)
//             throws JsonProcessingException {

//         Course course = courseRepository.findById(courseId)
//                 .orElseThrow(() -> new EntityNotFoundException(Course.class, courseId.toString()));

//         User user = userRepository.findByGithubLogin(githubLogin)
//                 .orElseThrow(() -> new EntityNotFoundException(User.class, githubLogin.toString()));

//         Staff courseStaff = Staff.builder()
//                 .courseId(course.getId())
//                 .githubId(user.getGithubId())
//                 .user(user)
//                 .build();

//         courseStaff = courseStaffRepository.save(courseStaff);
//         log.info("courseStaff={}", courseStaff);

//         return courseStaff;
//     }

    @Operation(summary = "Get Staff")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/get")
    public Staff getStaff(
            @Parameter(name = "id") @RequestParam Long id)
            throws JsonProcessingException {

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Staff.class, id.toString()));

        return staff;
    }

//     @Operation(summary = "Delete a Course Staff by id")
//     @PreAuthorize("hasRole('ROLE_ADMIN')")
//     @DeleteMapping("/staff")
//     public Object deleteStaff(
//         @Parameter(name = "id") @RequestParam Long id) {
//         Staff staff = courseStaffRepository.findById(id)
//                 .orElseThrow(() -> new EntityNotFoundException(Staff.class, id.toString()));

//                 courseStaffRepository.delete(staff);
//                 return genericMessage("Staff with id %s is deleted".formatted(id));
//         }

    @Operation(summary = "Update information for a staff member")
    // allow for roles of ADMIN or INSTRUCTOR but only if the user is a staff member
    // for the course
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @PutMapping("/update")
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

//     // delete a course if the user is an admin or instructor for the course
    @Operation(summary = "Delete a staff")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @DeleteMapping("/delete")
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
