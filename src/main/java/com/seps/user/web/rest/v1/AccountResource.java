package com.seps.user.web.rest.v1;

import com.seps.user.service.UserService;
import com.seps.user.service.dto.ResponseStatus;
import com.seps.user.service.dto.UserDTO;
import com.seps.user.web.rest.vm.ProfileVM;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/account")
@Tag(name = "Account", description = "Operations related to the account")
public class AccountResource {

    private final UserService userService;
    private final MessageSource messageSource;

    public AccountResource(UserService userService, MessageSource messageSource) {
        this.userService = userService;
        this.messageSource = messageSource;
    }

    /**
     * {@code GET  /account} : get the current user.
     *
     * @return the current user.
     * @throws RuntimeException {@code 400 Bad Request} if the user couldn't be returned.
     */
    @GetMapping
    public UserDTO getAccount() {
        return new UserDTO(userService.getCurrentUser());
    }


    /**
     * {@code POST  /account} : edit the current user account.
     *
     * @return the current user.
     * @throws RuntimeException {@code 400 Bad Request} if the user couldn't be returned.
     */
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

    // Endpoint for downloading a document
    @GetMapping("/download-profile-picture")
    public ResponseEntity<byte[]> downloadProfilePicture() {
        return userService.downloadProfilePicture();
    }

}
