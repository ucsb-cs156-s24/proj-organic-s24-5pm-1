package edu.ucsb.cs156.organic.controllers;

import static org.junit.Assert.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import edu.ucsb.cs156.organic.entities.Staff;
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

    // Tests for GET /api/staff/get?id=...
    @Test
    public void logged_out_users_cannot_get_by_id() throws Exception {
            mockMvc.perform(get("/api/staff/get?id=1"))
                            .andExpect(status().is(403)); // logged out users can't get by id
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void users_cannot_get_by_id() throws Exception {
            mockMvc.perform(get("/api/staff/get?id=1"))
                            .andExpect(status().is(403)); // logged out users can't get by id
    }
 

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void test_that_admin_can_get_by_id_when_the_id_exists() throws Exception {

            // arrange
            when(staffRepository.findById(eq(1L))).thenReturn(Optional.of(staff));

            // act
            MvcResult response = mockMvc.perform(get("/api/staff/get?id=1"))
                            .andExpect(status().isOk()).andReturn();

            // assert
            verify(staffRepository, times(1)).findById(eq(1L));
            String expectedJson = mapper.writeValueAsString(staff);
            String responseString = response.getResponse().getContentAsString();
            assertEquals(expectedJson, responseString);
    }


    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void test_that_admin_cannot_get_by_id_when_the_id_does_not_exist() throws Exception {

            // arrange

            when(staffRepository.findById(eq(7L))).thenReturn(Optional.empty());

            // act
            MvcResult response = mockMvc.perform(get("/api/staff/get?id=7"))
                            .andExpect(status().isNotFound()).andReturn();

            // assert

            verify(staffRepository, times(1)).findById(eq(7L));
            Map<String, Object> json = responseToJson(response);
            assertEquals("EntityNotFoundException", json.get("type"));
            assertEquals("Staff with id 7 not found", json.get("message"));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void an_admin_user_can_post_a_new_course() throws Exception {
        // arrange

        Staff staffBefore = Staff.builder()
                .githubId(19506566)
                .courseId(1L)
                .build();

        Staff staffAfter = Staff.builder()
                .id(222L)
                .githubId(19506566)
                .courseId(1L)
                .build();

        when(staffRepository.save(eq(staffBefore))).thenReturn(staffAfter);

        // act
        MvcResult response = mockMvc.perform(
                post("/api/staff/post?githubId=19506566&courseId=1")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(staffRepository, times(1)).save(staffBefore);
        String expectedJson = mapper.writeValueAsString(staffAfter);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    // @WithMockUser(roles = { "INSTRUCTOR", "USER" })
    // @Test
    // public void an_instructor_can_post_a_new_course() throws Exception {
    //     // arrange

    //     Course courseBefore = Course.builder()
    //             .name("CS16")
    //             .school("UCSB")
    //             .term("F23")
    //             .startDate(LocalDateTime.parse("2023-09-01T00:00:00"))
    //             .endDate(LocalDateTime.parse("2023-12-31T00:00:00"))
    //             .githubOrg("ucsb-cs16-f23")
    //             .build();

    //     Course courseAfter = Course.builder()
    //             .id(222L)
    //             .name("CS16")
    //             .school("UCSB")
    //             .term("F23")
    //             .startDate(LocalDateTime.parse("2023-09-01T00:00:00"))
    //             .endDate(LocalDateTime.parse("2023-12-31T00:00:00"))
    //             .githubOrg("ucsb-cs16-f23")
    //             .build();

    //     when(courseRepository.save(eq(courseBefore))).thenReturn(courseAfter);

    //     // act
    //     MvcResult response = mockMvc.perform(
    //             post("/api/courses/post?name=CS16&school=UCSB&term=F23&startDate=2023-09-01T00:00:00&endDate=2023-12-31T00:00:00&githubOrg=ucsb-cs16-f23")
    //                     .with(csrf()))
    //             .andExpect(status().isOk()).andReturn();

    //     // assert
    //     verify(courseRepository, times(1)).save(courseBefore);
    //     String expectedJson = mapper.writeValueAsString(courseAfter);
    //     String responseString = response.getResponse().getContentAsString();
    //     assertEquals(expectedJson, responseString);
    // }

    
    @WithMockUser(roles = { "USER" })
    @Test
    public void an_user_cannot_post_a_new_staff() throws Exception {
        // arrange

        Staff staffBefore = Staff.builder()
                .githubId(19506566)
                .courseId(1L)
                .build();

        Staff staffAfter = Staff.builder()
                .id(222L)
                .githubId(19506566)
                .courseId(1L)
                .build();

        when(staffRepository.save(eq(staffBefore))).thenReturn(staffAfter);

        // act
        MvcResult response = mockMvc.perform(
                post("/api/staff/post?githubId=19506566&courseId=1")
                        .with(csrf()))
                .andExpect(status().isForbidden()).andReturn();
    }

    //     // Tests for DELETE /api/staff?id=... 

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_delete_a_staff() throws Exception {

            when(staffRepository.findById(eq(15L))).thenReturn(Optional.of(staff));

            // act
            MvcResult response = mockMvc.perform(
                            delete("/api/staff/delete?id=15")
                                            .with(csrf()))
                            .andExpect(status().isOk()).andReturn();

            // assert
            verify(staffRepository, times(1)).findById(15L);
            verify(staffRepository, times(1)).delete(any());

            // Map<String, Object> json = responseToJson(response);
            // assertEquals("Staff with id 15 is deleted", json.get("message"));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_tries_to_delete_non_existant_staff_and_gets_right_error_message()
                    throws Exception {
            // arrange

            when(staffRepository.findById(eq(15L))).thenReturn(Optional.empty());

            // act
            MvcResult response = mockMvc.perform(
                            delete("/api/staff/delete?id=15")
                                            .with(csrf()))
                            .andExpect(status().isNotFound()).andReturn();

            // assert
            verify(staffRepository, times(1)).findById(15L);
            Map<String, Object> json = responseToJson(response);
            assertEquals("Staff with id 15 not found", json.get("message"));
    }
  
    // admin cannot update non existing staff
    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void an_admin_user_cannot_update_non_existing_staff() throws Exception {
        // arrange

        when(staffRepository.findById(eq(42L))).thenReturn(Optional.empty());
        // act

        MvcResult response = mockMvc.perform(
                put("/api/staff/update?id=42&githubId=19506566&courseId=1")
                                .with(csrf()))
                .andExpect(status().isNotFound()).andReturn();
        // assert

        Map<String,String> responseMap = mapper.readValue(response.getResponse().getContentAsString(), new TypeReference<Map<String,String>>(){});
        Map<String,String> expectedMap = Map.of("message", "Staff with id 42 not found", "type", "EntityNotFoundException");
        assertEquals(expectedMap, responseMap);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void an_admin_user_can_update_a_staff() throws Exception {
        // arrange

        Staff staffBefore = staff;

        Staff staffAfter = staff2;
        staffAfter.setCourseId(222l);

        when(staffRepository.findById(eq(staffBefore.getId()))).thenReturn(Optional.of(staffBefore));
        when(staffRepository.save(eq(staffAfter))).thenReturn(staffAfter);

        String urlTemplate = String.format(
                "/api/staff/update?id=" + staffAfter.getId() +"&githubId=" + staffAfter.getGithubId() + "&courseId=" + staffAfter.getCourseId());
        MvcResult response = mockMvc.perform(
                put(urlTemplate)
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(staffRepository, times(1)).save(staffBefore);
        String expectedJson = mapper.writeValueAsString(staffAfter);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    // User cannot update staff at all
    @WithMockUser(roles = { "USER" })
    @Test
    public void a_user_cannot_update_a_staff() throws Exception {
        // arrange

        Staff staffBefore = Staff.builder()
                .githubId(19506566)
                .courseId(1L)
                .build();

        Staff staffAfter = Staff.builder()
                .id(222L)
                .githubId(19506566)
                .courseId(1L)
                .build();

        when(staffRepository.findById(eq(staffBefore.getId()))).thenReturn(Optional.of(staffBefore));
        when(staffRepository.save(eq(staffAfter))).thenReturn(staffAfter);

        // act
        MvcResult response = mockMvc.perform(
                put("/api/staff/update?id=" + staffAfter.getId() +"&githubId=" + staffAfter.getGithubId() + "&courseId=" + staffAfter.getCourseId())
                        .with(csrf()))
                .andExpect(status().is(403)).andReturn();

        // assert
        verify(staffRepository, times(0)).save(staffAfter);

        // verify message is correct
        Map<String, String> responseMap = mapper.readValue(response.getResponse().getContentAsString(),
                new TypeReference<Map<String, String>>() {
                });
        Map<String, String> expectedMap = Map.of("message", "Access is denied", "type",
                "AccessDeniedException");
        assertEquals(expectedMap, responseMap);
    }

    // admin cannot delete non existing staff
    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void an_admin_cannot_delete_non_existing_staff() throws Exception {
        // arrange

        when(staffRepository.findById(eq(42L))).thenReturn(Optional.empty());
        // act

        MvcResult response = mockMvc.perform(
                delete("/api/staff/delete?id=42")
                                .with(csrf()))
                .andExpect(status().isNotFound()).andReturn();
        // assert

        Map<String,String> responseMap = mapper.readValue(response.getResponse().getContentAsString(), new TypeReference<Map<String,String>>(){});
        Map<String,String> expectedMap = Map.of("message", "Staff with id 42 not found", "type", "EntityNotFoundException");
        assertEquals(expectedMap, responseMap);
    }

    // admin can delete staff
    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void an_admin_user_can_delete_a_staff() throws Exception {
        // arrange

        Staff staffBefore = Staff.builder()
                .id(1l)
                .githubId(19506566)
                .courseId(1L)
                .build();

        when(staffRepository.findById(eq(staffBefore.getId()))).thenReturn(Optional.of(staffBefore));

        // act
        MvcResult response = mockMvc.perform(
                delete("/api/staff/delete?id=1")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(staffRepository, times(1)).delete(staffBefore);
        String expectedJson = mapper.writeValueAsString(staffBefore);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    // User cannot delete course at all
    @WithMockUser(roles = { "INSTRUCTOR", "USER" })
    @Test
    public void a_user_cannot_delete_a_staff() throws Exception {
        // arrange
        Staff staffBefore = Staff.builder()
                .id(1l)
                .githubId(19506566)
                .courseId(1L)
                .build();

        when(staffRepository.findById(eq(staffBefore.getId()))).thenReturn(Optional.of(staffBefore));

        // act
        MvcResult response = mockMvc.perform(
                delete("/api/staff/delete?id=1")
                        .with(csrf()))
                .andExpect(status().isForbidden()).andReturn();

        // assert
        verify(staffRepository, times(0)).delete(staffBefore);

        // verify message is correct
        Map<String, String> responseMap = mapper.readValue(response.getResponse().getContentAsString(),
                new TypeReference<Map<String, String>>() {
                });
        Map<String, String> expectedMap = Map.of("message", "Access is denied", "type",
                "AccessDeniedException");
        assertEquals(expectedMap, responseMap);
    }
}
