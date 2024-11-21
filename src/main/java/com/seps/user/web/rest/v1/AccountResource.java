package com.seps.user.web.rest.v1;

import com.seps.user.service.UserService;
import com.seps.user.service.dto.UserDTO;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/account")
@Tag(name = "Account", description = "Operations related to the account")
public class AccountResource {


    private final UserService userService;

    public AccountResource(UserService userService) {
        this.userService = userService;
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

}
