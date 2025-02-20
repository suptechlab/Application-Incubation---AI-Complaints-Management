package com.seps.user.service;

import com.seps.user.domain.User;
import com.seps.user.repository.UserRepository;
import com.seps.user.security.SecurityUtils;
import com.seps.user.suptech.service.DocumentService;
import com.seps.user.suptech.service.FileStorageException;
import com.seps.user.web.rest.errors.CustomException;
import com.seps.user.web.rest.errors.SepsStatusCode;
import com.seps.user.web.rest.vm.ProfileVM;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.zalando.problem.Status;

import java.io.IOException;

@Service
@Transactional
public class UserService {

    private static final Logger LOG = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final DocumentService documentService;
    private final MessageSource messageSource;


    public UserService(UserRepository userRepository, DocumentService documentService, MessageSource messageSource) {
        this.userRepository = userRepository;
        this.documentService = documentService;
        this.messageSource = messageSource;
    }

    public User getCurrentUser() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneWithAuthoritiesByLogin)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CURRENT_USER_NOT_FOUND, null, null));
    }

    public Long getCurrentUserId() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneWithAuthoritiesByLogin)
            .map(User::getId)
            .orElse(null);
    }

    @Transactional
    public void editAccount(@Valid ProfileVM profileVM) {
        User currentUser = getCurrentUser();
        MultipartFile file = profileVM.getProfilePicture();
        if (file != null) {
            try {
                String uniqueFileName = documentService.generateUniqueFileName(file.getOriginalFilename());
                // Upload the document and get the external document ID
                ResponseEntity<String> response = documentService.upload(file.getBytes(), uniqueFileName);
                String externalDocumentId = response.getBody();  // Assuming the response body contains the externalDocumentId
                currentUser.setExternalDocumentId(externalDocumentId);
            } catch (FileStorageException e) {
                LOG.error("Exception while uploadDocument:{}", e.getMessage());
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.FILE_STORAGE_ERROR, e.getMessage());
            } catch (IOException e) {
                LOG.error("IOException while uploadDocument:{}", e.getMessage());
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.FILE_STORAGE_ERROR, e.getMessage());
            } catch (Exception e) {
                String errorMessage = messageSource.getMessage("error.file.upload.unexpected", null, LocaleContextHolder.getLocale());
                // Catch any other unexpected exceptions
                throw new CustomException(Status.INTERNAL_SERVER_ERROR, SepsStatusCode.FILE_STORAGE_ERROR, errorMessage);
            }
        }
        currentUser.setCountryCode(profileVM.getCountryCode());
        currentUser.setPhoneNumber(profileVM.getPhoneNumber());
        userRepository.save(currentUser);
    }

    public ResponseEntity<byte[]> downloadProfilePicture() {
        User currentUser = getCurrentUser();
        if (currentUser.getExternalDocumentId() != null) {
            return documentService.downloadDocument(currentUser.getExternalDocumentId());
        }
        return null;
    }

    public String getCurrentUserJwtToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication.isAuthenticated() && authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            Object principal = jwtAuthenticationToken.getPrincipal();

            if (principal instanceof Jwt jwt) {
                return jwt.getTokenValue(); // Return the JWT token value
            }
        }
        return null; // Return null if not authenticated
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CURRENT_USER_NOT_FOUND, null, null));
    }

    @Transactional
    public User findUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

}
