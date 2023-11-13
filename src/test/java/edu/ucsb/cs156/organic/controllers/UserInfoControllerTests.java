package edu.ucsb.cs156.organic.controllers;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.ObjectMapper;

import edu.ucsb.cs156.organic.entities.User;
import edu.ucsb.cs156.organic.entities.UserEmail;
import edu.ucsb.cs156.organic.models.CurrentUser;
import edu.ucsb.cs156.organic.repositories.UserEmailRepository;
import edu.ucsb.cs156.organic.repositories.UserRepository;
import edu.ucsb.cs156.organic.testconfig.TestConfig;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import static org.mockito.Mockito.verify;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@WebMvcTest(controllers = UserInfoController.class)
@Import(TestConfig.class)
@AutoConfigureDataJpa
public class UserInfoControllerTests extends ControllerTestCase {
  @Captor
  ArgumentCaptor<User> userCaptor;

  @MockBean
  UserRepository userRepository;

  @Test
  public void currentUser__last_online__logged_out() throws Exception {
    mockMvc.perform(post("/api/currentUser/last-online"))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = { "USER" })
  @Test
  public void currentUser__logged_in() throws Exception {

    // arrange

    ObjectMapper mapper = ApiController.mapperThatIgnoresMockitoMocks();
    CurrentUser currentUser = currentUserService.getCurrentUser();
    String expectedJson =  mapper.writeValueAsString(currentUser);

    // act

    MvcResult response = mockMvc.perform(get("/api/currentUser"))
        .andExpect(status().isOk()).andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = { "USER" })
  @Test
  public void currentUser__update_last_online() throws Exception {
    CurrentUser currentUser = currentUserService.getCurrentUser();
    Instant beforeUpdate = currentUser.getUser().getLastOnline();

    MvcResult response = mockMvc.perform(post("/api/currentUser/last-online").with(csrf()))
        .andExpect(status().isOk()).andReturn();

    assertFalse(response.getResponse().getContentAsString().isEmpty());

    verify(userRepository).save(userCaptor.capture());
    User savedUser = userCaptor.getValue();

    assertTrue(savedUser.getLastOnline().isAfter(beforeUpdate),
        String.format(
            "savedUser.getLastOnline() is %s which should be after the beforeUpdate value of %s should be updated",
            savedUser.getLastOnline().toString(), beforeUpdate.toString()));
  }

  @WithMockUser(roles = { "USER" })
  @Test
  public void currentUser__get_emails() throws Exception {
    CurrentUser currentUser = currentUserService.getCurrentUser();

    MvcResult response = mockMvc.perform(get("/api/currentUser/emails").with(csrf()))
        .andExpect(status().isOk()).andReturn();

    String responseString = response.getResponse().getContentAsString();

    UserEmail expectedUserEmail = UserEmail.builder().email("cgaucho@ucsb.edu").user(currentUser.getUser()).build();
    List<UserEmail> expectedUserEmails = new ArrayList<UserEmail>();
    expectedUserEmails.add(expectedUserEmail);

    String expectedJson = mapper.writeValueAsString(expectedUserEmails);
    assertEquals(expectedJson, responseString);

  }

}
