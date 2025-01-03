package com.seps.admin.service;

import com.seps.admin.domain.Authority;
import com.seps.admin.enums.UserStatusEnum;
import com.seps.admin.repository.AuthorityRepository;
import com.seps.admin.repository.UserRepository;
import com.seps.admin.security.AuthoritiesConstants;
import com.seps.admin.service.dto.ImportUserDTO;
import com.seps.admin.suptech.service.ExternalAPIService;
import com.seps.admin.suptech.service.dto.OrganizationInfoDTO;
import com.seps.admin.suptech.service.dto.PersonInfoDTO;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;

@Service
public class ImportUserService {

    private static final Logger LOG = LoggerFactory.getLogger(ImportUserService.class);
    private final Validator validator;
    private final MessageSource messageSource;
    private final ExternalAPIService externalAPIService;
    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;

    public ImportUserService(Validator validator, MessageSource messageSource, ExternalAPIService externalAPIService, UserRepository userRepository, AuthorityRepository authorityRepository) {
        this.validator = validator;
        this.messageSource = messageSource;
        this.externalAPIService = externalAPIService;
        this.userRepository = userRepository;
        this.authorityRepository = authorityRepository;
    }

    public List<String> processAndValidateFile(InputStream fileInputStream, Locale locale) {
        // Check if FI user with given identificacion already exists with specific authorities and statuses
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.FI).ifPresent(authorities::add);
        Set<UserStatusEnum> requiredStatuses = Set.of(UserStatusEnum.PENDING, UserStatusEnum.ACTIVE, UserStatusEnum.BLOCKED);

        List<String> errors = new ArrayList<>();
        List<ImportUserDTO> validUsers = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(fileInputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    errors.add(getLocalizedMessage("validation.row.empty", locale, i + 1));
                    continue;
                }
                ImportUserDTO userDTO = mapRowToDTO(row);
                Set<ConstraintViolation<ImportUserDTO>> violations = validator.validate(userDTO);
                if (!violations.isEmpty()) {
                    for (ConstraintViolation<ImportUserDTO> violation : violations) {
                        errors.add("Row " + (i + 1) + ": " + violation.getMessage());
                    }
                } else {
                    // Track the current error count before validating identificacion and ruc
                    int initialErrorCount = errors.size();
                    // Validate identificacion and ruc
                    //validateIdentificacion(userDTO.getIdentificacion(), i, errors);
                    validateRuc(userDTO.getRuc(), i, errors);
                    validateEmail(userDTO.getEmail(), i, userDTO.getIdentificacion(), authorities, requiredStatuses, errors, locale);

                    // Only add userDTO to validUsers if no new errors were added
                    if (errors.size() == initialErrorCount) {
                        validUsers.add(userDTO);
                    }
                    validUsers.add(userDTO);
                }
            }

            if (errors.isEmpty()) {
                saveValidUsers(validUsers);
            }
        } catch (Exception e) {
            errors.add(getLocalizedMessage("validation.file.error", locale, e.getMessage()));
        }

        return errors;
    }

    private void validateEmail(String email, int rowNum, String identificacion, Set<Authority> authorities,
                               Set<UserStatusEnum> requiredStatuses, List<String> errors, Locale locale) {
        if (userRepository.findOneByEmailIgnoreCase(email).isPresent()) {
            String message = getLocalizedMessage("email.already.used", locale);
            errors.add("Row " + (rowNum + 1) + ":" + message);
        }
        if (userRepository.findOneByIdentificacionAndAuthoritiesInAndStatusIn(identificacion, authorities, requiredStatuses).isPresent()) {
            String message = getLocalizedMessage("fi.user.already.exist", locale, new String[]{identificacion});
            errors.add("Row " + (rowNum + 1) + ":" + message);
        }

    }

    private ImportUserDTO mapRowToDTO(Row row) {
        ImportUserDTO userDTO = new ImportUserDTO();
        userDTO.setIdentificacion(getCellValue(row.getCell(0)));
        userDTO.setEmail(getCellValue(row.getCell(1)));
        userDTO.setCountryCode(getCellValue(row.getCell(2)));
        userDTO.setPhoneNumber(getCellValue(row.getCell(3)));
        userDTO.setRuc(getCellValue(row.getCell(4)));
        userDTO.setRole(getCellValue(row.getCell(5)));
        return userDTO;
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                // If the numeric value is a long integer, convert it to a string
                double numericValue = cell.getNumericCellValue();
                // Check if the value is an integer (to avoid issues with decimal places)
                if (numericValue == Math.floor(numericValue)) {
                    yield String.valueOf((long) numericValue); // Treat as long integer to avoid decimals
                } else {
                    yield String.valueOf(numericValue); // For non-integer numeric values
                }
            } // Removing any trailing zeros;
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
    }

    private void saveValidUsers(List<ImportUserDTO> importUserDTOS) {
        // Save to database or perform other processing
        LOG.debug("import user:{}", importUserDTOS);
    }

    private String getLocalizedMessage(String key, Locale locale, Object... args) {
        return messageSource.getMessage(key, args, locale);
    }

    private void validateIdentificacion(String identificacion, int rowNum, List<String> errors) {
        try {
            PersonInfoDTO personInfoDTO = externalAPIService.getPersonInfo(identificacion);
        } catch (Exception e) {
            errors.add("Row " + (rowNum + 1) + ":" + e.getMessage());
        }
    }

    private void validateRuc(String ruc, int rowNum, List<String> errors) {
        try {
            OrganizationInfoDTO organizationInfoDTO = externalAPIService.getOrganizationInfo(ruc);
        } catch (Exception e) {
            errors.add("Row " + (rowNum + 1) + ":" + e.getMessage());
        }
    }


}
