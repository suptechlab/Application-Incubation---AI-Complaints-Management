package com.seps.auth.web.rest.vm;

import jakarta.validation.constraints.NotBlank;

/**
 * View Model object for storing the user's key and password.
 */
public class KeyAndPasswordVM {

    private String key;

    private String newPassword;

    private String recaptchaToken;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getRecaptchaToken() {
        return recaptchaToken;
    }

    public void setRecaptchaToken(String recaptchaToken) {
        this.recaptchaToken = recaptchaToken;
    }
}
