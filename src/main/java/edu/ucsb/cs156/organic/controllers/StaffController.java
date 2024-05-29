package edu.ucsb.cs156.organic.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;

import edu.ucsb.cs156.organic.entities.Course;
import edu.ucsb.cs156.organic.entities.Staff;
import edu.ucsb.cs156.organic.entities.User;
import edu.ucsb.cs156.organic.errors.EntityNotFoundException;
import edu.ucsb.cs156.organic.repositories.CourseRepository;
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

    @Autowired
    CourseRepository courseRepository;

    @Operation(summary = "List all staff")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<Staff> allCourses() {
        User u = getCurrentUser().getUser();
        log.info("u={}", u);

        return staffRepository.findAll();
    }
}