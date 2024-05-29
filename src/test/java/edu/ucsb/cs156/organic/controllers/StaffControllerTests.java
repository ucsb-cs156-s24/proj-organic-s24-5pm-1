package edu.ucsb.cs156.organic.controllers;

import static org.junit.Assert.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.ObjectMapper;

import edu.ucsb.cs156.organic.entities.Staff;
import edu.ucsb.cs156.organic.repositories.CourseRepository;
import edu.ucsb.cs156.organic.repositories.StaffRepository;
import edu.ucsb.cs156.organic.repositories.UserRepository;
import edu.ucsb.cs156.organic.services.CurrentUserService;
import edu.ucsb.cs156.organic.services.jobs.JobService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@WebMvcTest(controllers = StaffController.class)
@Import(JobService.class)
@AutoConfigureDataJpa
public class StaffControllerTests extends ControllerTestCase {
    @MockBean
    UserRepository userRepository;

    @MockBean
    StaffRepository staffRepository;

    @Autowired
    CurrentUserService userService;

    @MockBean
    CourseRepository courseRepository;

    @Autowired
    ObjectMapper objectMapper;

    Staff staff = Staff.builder()
            .id(1L)
            .githubId(19506566)
            .courseId(1L)
            .build();

    Staff staff2 = Staff.builder()
            .id(1L)
            .githubId(92136161)
            .courseId(1L)
            .build();

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_get_all_staff() throws Exception {

        // arrange

        ArrayList<Staff> expectedStaff = new ArrayList<>();
        expectedStaff.addAll(Arrays.asList(staff, staff2));

        when(staffRepository.findAll()).thenReturn(expectedStaff);

        // act
        MvcResult response = mockMvc.perform(get("/api/staff/all"))
                .andExpect(status().isOk()).andReturn();

        // assert

        verify(staffRepository, atLeastOnce()).findAll();
        String expectedJson = mapper.writeValueAsString(expectedStaff);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void users_cannot_access_staff() throws Exception {

        // arrange

        ArrayList<Staff> expectedStaff = new ArrayList<>();
        expectedStaff.addAll(Arrays.asList(staff, staff2));

        when(staffRepository.findAll()).thenReturn(expectedStaff);

        // act
        MvcResult response = mockMvc.perform(get("/api/staff/all"))
                .andExpect(status().is(403)).andReturn();

        // assert
        verify(staffRepository, never()).findAll();
        String expectedJson = mapper.writeValueAsString(expectedStaff);
        String responseString = response.getResponse().getContentAsString();
        assertNotEquals(expectedJson, responseString);
    }
}