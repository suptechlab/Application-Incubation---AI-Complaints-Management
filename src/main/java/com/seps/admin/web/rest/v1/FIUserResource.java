package com.seps.admin.web.rest.v1;

import com.seps.admin.aop.permission.PermissionCheck;
import com.seps.admin.domain.User;
import com.seps.admin.enums.UserStatusEnum;
import com.seps.admin.repository.UserRepository;
import com.seps.admin.service.ImportUserService;
import com.seps.admin.service.MailService;
import com.seps.admin.service.UserService;
import com.seps.admin.service.dto.FIUserDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.dto.ResponseStatus;
import com.seps.admin.suptech.service.dto.PersonInfoDTO;
import com.seps.admin.web.rest.vm.ImportUserVM;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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
import tech.jhipster.web.util.PaginationUtil;

import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Locale;

@Tag(name = "FI User Management", description = "APIs for managing FI users")
@RestController
@RequestMapping("/api/v1/fi-users")
public class FIUserResource {

    private static final Logger LOG = LoggerFactory.getLogger(FIUserResource.class);
    private final UserService userService;
    private final MessageSource messageSource;
    private final MailService mailService;
    private final ImportUserService importUserService;

    public FIUserResource(UserService userService, MessageSource messageSource, MailService mailService, ImportUserService importUserService) {
        this.userService = userService;
        this.messageSource = messageSource;
        this.mailService = mailService;
        this.importUserService = importUserService;
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
    @PermissionCheck({"FI_USER_CREATE_BY_SEPS", "FI_USER_CREATE_BY_FI"})
    public ResponseEntity<ResponseStatus> addFIUser(@Valid @RequestBody FIUserDTO dto, HttpServletRequest request)
        throws URISyntaxException {
        LOG.info("Attempting to create a new FI user with email: {}", dto.getEmail());
        RequestInfo requestInfo = new RequestInfo(request);
        User newUser = userService.addFIUser(dto, requestInfo);
        mailService.sendFIUserCreationEmail(newUser);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("fi.user.created.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.CREATED.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.created(new URI("/api/v1/fi-users/" + newUser.getId()))
            .body(responseStatus);
    }

    @Operation(summary = "Get a FI User by ID", description = "Retrieve a specific FI user by its ID.")
    @ApiResponse(responseCode = "200", description = "FI user details retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = FIUserDTO.class)))
    @GetMapping("/{id}")
    @PermissionCheck({"FI_UPDATE_CREATE_BY_SEPS", "FI_UPDATE_CREATE_BY_FI"})
    public ResponseEntity<FIUserDTO> getFIUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getFIUserById(id));
    }

    @Operation(summary = "List all FI User", description = "Retrieve a list of all FI user with optional search and status filters.")
    @ApiResponse(responseCode = "200", description = "FI Users retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = FIUserDTO.class)))
    @GetMapping
    @PermissionCheck({"FI_USER_CREATE_BY_SEPS", "FI_USER_CREATE_BY_FI", "FI_UPDATE_CREATE_BY_SEPS", "FI_UPDATE_CREATE_BY_FI", "FI_STATUS_CHANGE_CREATE_BY_SEPS", "FI_STATUS_CHANGE_CREATE_BY_FI"})
    public ResponseEntity<List<FIUserDTO>> listFIUsers(Pageable pageable,
                                                       @RequestParam(value = "search", required = false) String search,
                                                       @Parameter(description = "Filter by status") @RequestParam(required = false) UserStatusEnum status,
                                                       @Parameter(description = "Filter by role") @RequestParam(required = false) Long roleId) {
        Page<FIUserDTO> page = userService.listFIUsers(pageable, search, status, roleId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @Operation(summary = "Update an existing SEPS User", description = "Update the details of an existing SEPS user.")
    @ApiResponse(
        responseCode = "200",
        description = "SEPS User updated successfully",
        content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseStatus.class))
    )
    @PutMapping("/{id}")
    @PermissionCheck({"FI_UPDATE_CREATE_BY_SEPS", "FI_UPDATE_CREATE_BY_FI"})
    public ResponseEntity<ResponseStatus> editFIUser(@PathVariable Long id, @Valid @RequestBody FIUserDTO dto,
                                                     HttpServletRequest request) {
        RequestInfo requestInfo = new RequestInfo(request);
        userService.editFIUser(id, dto, requestInfo);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("fi.user.updated.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @Operation(summary = "Change the status of a FI User", description = "Update the status of a FI User (ACTIVE/BLOCKED).")
    @ApiResponse(responseCode = "204", description = "Status changed successfully")
    @PatchMapping("/{id}/{status}")
    @PermissionCheck({"FI_STATUS_CHANGE_CREATE_BY_SEPS", "FI_STATUS_CHANGE_CREATE_BY_FI"})
    public ResponseEntity<Void> changeStatus(@PathVariable Long id, @PathVariable(name = "status") UserStatusEnum status,
                                             HttpServletRequest request) {
        // Perform the status update
        RequestInfo requestInfo = new RequestInfo(request);
        userService.changeFIStatus(id, status, requestInfo);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/import")
    public ResponseEntity<?> importFIUser(@ModelAttribute @Valid ImportUserVM importUserVM, Locale locale) {
        try {
            InputStream fileInputStream = importUserVM.getBrowseFile().getInputStream();
            List<String> errors = importUserService.processAndValidateFile(fileInputStream, locale);
            if (!errors.isEmpty()) {
                return ResponseEntity.badRequest().body(errors);
            }
            return ResponseEntity.ok("File processed successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process file.");
        }
    }
}
