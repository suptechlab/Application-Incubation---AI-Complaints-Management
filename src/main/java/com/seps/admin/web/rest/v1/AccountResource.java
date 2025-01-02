package com.seps.admin.web.rest.v1;

import com.seps.admin.service.UserService;
import com.seps.admin.web.rest.vm.ProfileVM;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.seps.admin.service.dto.ResponseStatus;


@Tag(name = "Account Resource", description = "APIs for managing user account")
@RestController
@RequestMapping("/api/v1/account")
public class AccountResource {

    private final UserService userService;
    private final MessageSource messageSource;

    public AccountResource(UserService userService, MessageSource messageSource) {
        this.userService = userService;
        this.messageSource = messageSource;
    }

    @Operation(
        summary = "Edit the current user account",
        description = "Update details of the currently logged-in user, including profile picture, country code, and phone number.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Profile data to update",
            content = @Content(schema = @Schema(implementation = ProfileVM.class))
        ),
        responses = {
            @ApiResponse(responseCode = "200", description = "Profile updated successfully",
                content = @Content(schema = @Schema(implementation = ResponseStatus.class)))
        }
    )
    @PostMapping
    public ResponseEntity<ResponseStatus> editAccount(@ModelAttribute @Valid ProfileVM profileVM) {
        userService.editAccount(profileVM);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("profile.updated.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @Operation(
        summary = "Download the user's profile picture",
        description = "Retrieve the profile picture of the currently logged-in user.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Profile picture retrieved successfully",
                content = @Content(mediaType = "application/octet-stream"))}
    )
    @GetMapping("/download-profile-picture")
    public ResponseEntity<byte[]> downloadProfilePicture() {
        return userService.downloadProfilePicture();
    }


}
