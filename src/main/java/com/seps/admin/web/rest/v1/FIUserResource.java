package com.seps.admin.web.rest.v1;

import com.seps.admin.domain.User;
import com.seps.admin.repository.UserRepository;
import com.seps.admin.service.MailService;
import com.seps.admin.service.UserService;
import com.seps.admin.service.dto.FIUserDTO;
import com.seps.admin.service.dto.ResponseStatus;
import com.seps.admin.suptech.service.dto.PersonInfoDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

@Tag(name = "FI User Management", description = "APIs for managing FI users")
@RestController
@RequestMapping("/api/v1/fi-users")
public class FIUserResource {

    private static final Logger LOG = LoggerFactory.getLogger(FIUserResource.class);
    private final UserService userService;
    private final MessageSource messageSource;
    private final UserRepository userRepository;
    private final MailService mailService;

    public FIUserResource(UserService userService, MessageSource messageSource, UserRepository userRepository, MailService mailService) {
        this.userService = userService;
        this.messageSource = messageSource;
        this.userRepository = userRepository;
        this.mailService = mailService;
    }

    @Operation(summary = "GET the person information", description = "GET the person information by identification number.")
    @ApiResponse(responseCode = "200", description = "Person information fetched successfully")
    @GetMapping("/person-info")
    public ResponseEntity<PersonInfoDTO> getPersonInformationByIdentification(@RequestParam(name = "identificacion") String identificacion) {
        // Perform the status update
        PersonInfoDTO personInfo = userService.fetchPersonDetails(identificacion);
        return ResponseEntity.ok(personInfo);
    }

    @Operation(
        summary = "Create a new FI User",
        description = """
                Creates a new FI user in the system. The email address is validated to ensure
                uniqueness before creating the user. If the email already exists, a 400 error is returned.
                Upon successful creation, an account creation email is sent to the new user.
            """
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "FI User created successfully",
            content = @Content(schema = @Schema(implementation = ResponseStatus.class))
        )
    })
    @PostMapping
    public ResponseEntity<ResponseStatus> addSepsUser(@Valid @RequestBody FIUserDTO dto) throws URISyntaxException {
        LOG.info("Attempting to create a new FI user with email: {}", dto.getEmail());
        User newUser = userService.addFIUser(dto);
        mailService.sendSepsUserCreationEmail(newUser);
        com.seps.admin.service.dto.ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("fi.user.created.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.CREATED.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.created(new URI("/api/v1/fi-users/" + newUser.getId()))
            .body(responseStatus);
    }

}
