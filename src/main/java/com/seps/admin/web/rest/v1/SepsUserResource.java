package com.seps.admin.web.rest.v1;

import com.seps.admin.domain.User;
import com.seps.admin.enums.UserStatusEnum;
import com.seps.admin.repository.UserRepository;
import com.seps.admin.service.MailService;
import com.seps.admin.service.UserService;
import com.seps.admin.service.dto.ProvinceDTO;
import com.seps.admin.service.dto.ResponseStatus;
import com.seps.admin.service.dto.SEPSUserDTO;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.zalando.problem.Status;
import tech.jhipster.web.util.PaginationUtil;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@Tag(name = "SEPS User Management", description = "APIs for managing SEPS users")
@RestController
@RequestMapping("/api/v1/seps-users")
public class SepsUserResource {

    private static final Logger LOG = LoggerFactory.getLogger(SepsUserResource.class);
    private final UserService userService;
    private final MessageSource messageSource;
    private final UserRepository userRepository;
    private final MailService mailService;

    public SepsUserResource(UserService userService, MessageSource messageSource, UserRepository userRepository,
                            MailService mailService) {
        this.userService = userService;
        this.messageSource = messageSource;
        this.userRepository = userRepository;
        this.mailService = mailService;
    }


    @Operation(
        summary = "Create a new SEPS User",
        description = """
                Creates a new SEPS user in the system. The email address is validated to ensure
                uniqueness before creating the user. If the email already exists, a 400 error is returned.
                Upon successful creation, an account creation email is sent to the new user.
            """
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "SEPS User created successfully",
            content = @Content(schema = @Schema(implementation = ResponseStatus.class))
        )
    })
    @PostMapping
    public ResponseEntity<ResponseStatus> addSepsUser(@Valid @RequestBody SEPSUserDTO dto) throws URISyntaxException {
        LOG.info("Attempting to create a new SEPS user with email: {}", dto.getEmail());
        // Lowercase the user email before comparing with database
        if (userRepository.findOneByEmailIgnoreCase(dto.getEmail()).isPresent()) {
            LOG.warn("Email {} already in use.", dto.getEmail());
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.EMAIL_ALREADY_USED, null, null);
        } else {
            User newUser = userService.addSepsUser(dto);
            mailService.sendSepsUserCreationEmail(newUser);
            ResponseStatus responseStatus = new ResponseStatus(
                messageSource.getMessage("seps.user.created.successfully", null, LocaleContextHolder.getLocale()),
                HttpStatus.CREATED.value(),
                System.currentTimeMillis()
            );
            return ResponseEntity.created(new URI("/api/v1/seps-users/" + newUser.getId()))
                .body(responseStatus);
        }
    }

    @Operation(summary = "Get a SEPS User by ID", description = "Retrieve a specific SEPS user by its ID.")
    @ApiResponse(responseCode = "200", description = "SEPS user details retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = SEPSUserDTO.class)))
    @GetMapping("/{id}")
    public ResponseEntity<SEPSUserDTO> getSepsUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getSepsUserById(id));
    }

    @Operation(summary = "List all SEPS User", description = "Retrieve a list of all SEPS user with optional search and status filters.")
    @ApiResponse(responseCode = "200", description = "SEPS User retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ProvinceDTO.class)))
    @GetMapping
    public ResponseEntity<List<SEPSUserDTO>> listSEPSUsers(Pageable pageable,
                                                           @RequestParam(value = "search", required = false) String search,
                                                           @Parameter(description = "Filter by status") @RequestParam(required = false) UserStatusEnum status) {
        Page<SEPSUserDTO> page = userService.listSEPSUsers(pageable, search, status);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }


    @Operation(summary = "Update an existing SEPS User", description = "Update the details of an existing SEPS user.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "SEPS User updated successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseStatus.class))
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<ResponseStatus> updateSepsUser(@PathVariable Long id, @Valid @RequestBody SEPSUserDTO dto) {
        userService.updateSepsUser(id, dto);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("seps.user.updated.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @Operation(summary = "Change the status of a SEPS User", description = "Update the status of a SEPS User (ACTIVE/BLOCKED).")
    @ApiResponse(responseCode = "204", description = "Status changed successfully")
    @PatchMapping("/{id}/{status}")
    public ResponseEntity<Void> changeStatus(@PathVariable Long id, @PathVariable(name = "status") UserStatusEnum status) {
        // Perform the status update
        userService.changeSEPSStatus(id, status);
        return ResponseEntity.noContent().build();
    }
}
