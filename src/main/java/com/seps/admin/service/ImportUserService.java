package com.seps.admin.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.seps.admin.config.Constants;
import com.seps.admin.config.InstantTypeAdapter;
import com.seps.admin.domain.*;
import com.seps.admin.enums.*;
import com.seps.admin.repository.*;
import com.seps.admin.security.AuthoritiesConstants;
import com.seps.admin.service.dto.ImportUserDTO;
import com.seps.admin.suptech.service.ExternalAPIService;
import com.seps.admin.suptech.service.dto.OrganizationInfoDTO;
import com.seps.admin.suptech.service.dto.PersonInfoDTO;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import com.seps.admin.web.rest.vm.ImportUserResponseVM;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;
import tech.jhipster.security.RandomUtil;

import java.io.InputStream;
import java.time.Instant;
import java.util.*;

import static com.seps.admin.component.CommonHelper.convertEntityToMap;

@Service
public class ImportUserService {

    private static final Logger LOG = LoggerFactory.getLogger(ImportUserService.class);
    private final Validator validator;
    private final MessageSource messageSource;
    private final ExternalAPIService externalAPIService;
    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final PersonaRepository personaRepository;
    private final RoleRepository roleRepository;
    private final OrganizationRepository organizationRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;
    private final Gson gson;

    public ImportUserService(Validator validator, MessageSource messageSource, ExternalAPIService externalAPIService,
                             UserRepository userRepository, AuthorityRepository authorityRepository, PersonaRepository personaRepository, RoleRepository roleRepository, OrganizationRepository organizationRepository, UserService userService, AuditLogService auditLogService, PasswordEncoder passwordEncoder, Gson gson) {
        this.validator = validator;
        this.messageSource = messageSource;
        this.externalAPIService = externalAPIService;
        this.userRepository = userRepository;
        this.authorityRepository = authorityRepository;
        this.personaRepository = personaRepository;
        this.roleRepository = roleRepository;
        this.organizationRepository = organizationRepository;
        this.userService = userService;
        this.auditLogService = auditLogService;
        this.passwordEncoder = passwordEncoder;
        this.gson = new GsonBuilder()
            .registerTypeAdapter(Instant.class, new InstantTypeAdapter())
            .create();
    }

    @Transactional
    public ImportUserResponseVM importFIUser(InputStream fileInputStream, Locale locale) {
        ImportUserResponseVM importUserResponseVM = new ImportUserResponseVM();
        // Check if FI user with given identificacion already exists with specific authorities and statuses
        User currentUser = userService.getCurrentUser();
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.FI).ifPresent(authorities::add);
        Set<UserStatusEnum> requiredStatuses = Set.of(UserStatusEnum.PENDING, UserStatusEnum.ACTIVE, UserStatusEnum.BLOCKED);
        List<String> errors = new ArrayList<>();
        List<User> newUserList = new ArrayList<>();
        List<ImportUserDTO> validUsers = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(fileInputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            int lastDataRow = findLastDataRow(sheet);
            for (int i = 1; i <= lastDataRow; i++) {
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
                    validateIdentificacion(userDTO.getIdentificacion(), i, errors);
                    validateRuc(userDTO.getRuc(), i, errors, currentUser);
                    validateEmail(userDTO.getEmail(), i, userDTO.getIdentificacion(), authorities, requiredStatuses, errors, locale);
                    if (userDTO.getRole().equals("ADMIN")) {
                        validateRole(Constants.RIGHTS_FI_ADMIN, i, errors, locale);
                    } else if (userDTO.getRole().equals("AGENT")) {
                        validateRole(Constants.RIGHTS_FI_AGENT, i, errors, locale);
                    } else {
                        String roleMessage = getLocalizedMessage("role.not.found", locale, null);
                        errors.add("Row " + (i + 1) + ":" + roleMessage);
                    }
                    // Only add userDTO to validUsers if no new errors were added
                    if (errors.size() == initialErrorCount) {
                        validUsers.add(userDTO);
                    }
                }
            }
        } catch (Exception e) {
            errors.add(getLocalizedMessage("validation.file.error", locale, e.getMessage()));
        }

        if (errors.isEmpty()) {
            newUserList = saveValidUsers(validUsers, currentUser);
        }
        importUserResponseVM.setErrors(errors);
        importUserResponseVM.setNewUserList(newUserList);
        return importUserResponseVM;
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

    private List<User> saveValidUsers(List<ImportUserDTO> importUserDTOS, User currentUser) {
        // Save to database or perform other processing
        LOG.debug("import user:{}", importUserDTOS);
        List<User> newUserList = new ArrayList<>();
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.FI).ifPresent(authorities::add);

        for (ImportUserDTO userDTO : importUserDTOS) {
            //Check for Identificacion
            String identificacion = userDTO.getIdentificacion();
            Persona persona = personaRepository.findByIdentificacion(identificacion).orElse(null);
            if (persona == null) {
                throw new CustomException(Status.NOT_FOUND, SepsStatusCode.PERSON_NOT_FOUND, new String[]{identificacion}, null);
            }
            //Check for RUC
            String ruc = userDTO.getRuc();
            Organization organization = organizationRepository.findByRuc(ruc).orElse(null);
            if (organization == null) {
                throw new CustomException(Status.NOT_FOUND, SepsStatusCode.PERSON_NOT_FOUND,
                    new String[]{identificacion}, null);
            }
            // Check if email is already in use
            String userEmail = userDTO.getEmail();
            if (userRepository.findOneByEmailIgnoreCase(userEmail).isPresent()) {
                LOG.warn("Email {} already in use.", userEmail);
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.EMAIL_ALREADY_USED, null, null);
            }
            // Check if FI user with given identificacion already exists with specific authorities and statuses
            Set<UserStatusEnum> requiredStatuses = Set.of(UserStatusEnum.PENDING, UserStatusEnum.ACTIVE, UserStatusEnum.BLOCKED);
            if (userRepository.findOneByIdentificacionAndAuthoritiesInAndStatusIn(identificacion, authorities, requiredStatuses).isPresent()) {
                LOG.warn("User with identificacion {} already exists.", identificacion);
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.FI_USER_ALREADY_EXIST, new String[]{identificacion}, null);
            }

            //Check for Role
            String roleSlug = null;
            if (userDTO.getRole().equals("ADMIN")) {
                roleSlug = Constants.RIGHTS_FI_ADMIN;
            } else if (userDTO.getRole().equals("AGENT")) {
                roleSlug = Constants.RIGHTS_FI_AGENT;
            }
            Role role = roleRepository.findByRoleSlugIgnoreCase(roleSlug).orElse(null);
            if (role == null) {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.ROLE_NOT_FOUND, null, null);
            }
            // Initialize new User and set its properties
            User newUser = new User();
            newUser.setFirstName(persona.getNombreCompleto());
            if (userEmail != null) {
                String normalizedEmail = userEmail.toLowerCase();
                newUser.setEmail(normalizedEmail);
                newUser.setLogin(normalizedEmail);
            }
            newUser.setLangKey(Constants.DEFAULT_LANGUAGE);
            // Set up password and activation status
            String randomPassword = RandomUtil.generatePassword();
            String encryptedPassword = passwordEncoder.encode(randomPassword);
            newUser.setPassword(encryptedPassword);
            newUser.setActivated(true);
            // Set user contact and status details
            newUser.setCountryCode(userDTO.getCountryCode());
            newUser.setPhoneNumber(userDTO.getPhoneNumber());
            newUser.setResetKey(RandomUtil.generateResetKey());
            newUser.setResetDate(Instant.now());
            newUser.setPasswordSet(false);
            newUser.setStatus(UserStatusEnum.ACTIVE);
            newUser.setIdentificacion(identificacion);
            newUser.setOrganization(organization);
            // Set authorities and roles
            newUser.setAuthorities(authorities);
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            newUser.setRoles(roles);
            // Save the user and log creation info
            userRepository.save(newUser);
            //Audit Logs
            Map<String, String> auditMessageMap = new HashMap<>();
            Map<String, Object> entityData = new HashMap<>();
            Arrays.stream(LanguageEnum.values()).forEach(language -> {
                String messageAudit = messageSource.getMessage("audit.log.fi.user.created",
                    new Object[]{currentUser.getEmail(), newUser.getId()}, Locale.forLanguageTag(language.getCode()));
                auditMessageMap.put(language.getCode(), messageAudit);
            });
            entityData.put(Constants.NEW_DATA, convertEntityToMap(userService.getFIUserById(newUser.getId())));
            String requestBody = gson.toJson(userDTO);

            auditLogService.logActivity(null, currentUser.getId(), null, "importFIUser", ActionTypeEnum.FI_USER_ADD.name(),
                newUser.getId(), User.class.getSimpleName(), null, auditMessageMap, entityData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);

            newUserList.add(newUser);
        }
        return newUserList;
    }

    private String getLocalizedMessage(String key, Locale locale, Object... args) {
        return messageSource.getMessage(key, args, locale);
    }

    private void validateIdentificacion(String identificacion, int rowNum, List<String> errors) {
        try {
            PersonInfoDTO personInfoDTO = externalAPIService.getPersonInfo(identificacion);
            Optional<Persona> optionalPersona = personaRepository.findByIdentificacion(identificacion);
            if (!optionalPersona.isPresent()) {
                Persona persona = new Persona();
                persona.setIdentificacion(identificacion);
                persona.setNombreCompleto(personInfoDTO.getNombreCompleto());
                persona.setGenero(personInfoDTO.getGenero());
                persona.setLugarNacimiento(personInfoDTO.getLugarNacimiento());
                persona.setNacionalidad(personInfoDTO.getNacionalidad());
                personaRepository.save(persona);
            }
        } catch (Exception e) {
            errors.add("Row " + (rowNum + 1) + ":" + e.getMessage());
        }
    }

    private void validateRuc(String ruc, int rowNum, List<String> errors, User currentUser) {
        try {
            OrganizationInfoDTO organizationInfoDTO = externalAPIService.getOrganizationInfo(ruc);
            Optional<Organization> optionalOrganization = organizationRepository.findByRuc(ruc);
            if (!optionalOrganization.isPresent()) {
                Organization organization = new Organization();
                organization.setRuc(organizationInfoDTO.getRuc());
                organization.setRazonSocial(organizationInfoDTO.getRazonSocial());
                organization.setNemonicoTipoOrganizacion(organizationInfoDTO.getNemonicoTipoOrganizacion());
                organization.setTipoOrganizacion(organizationInfoDTO.getTipoOrganizacion());
                organization.setCreatedBy(currentUser.getId());
                organizationRepository.save(organization);
            }

        } catch (Exception e) {
            errors.add("Row " + (rowNum + 1) + ":" + e.getMessage());
        }
    }

    private void validateRole(String roleSlug, int rowNum, List<String> errors, Locale locale) {
        Role optionalRole = roleRepository.findByRoleSlugIgnoreCase(roleSlug).orElse(null);
        if (optionalRole == null) {
            String message = getLocalizedMessage("role.not.found", locale, null);
            errors.add("Row " + (rowNum + 1) + ":" + message);
        }
    }

    private int findLastDataRow(Sheet sheet) {
        int lastRow = sheet.getLastRowNum();
        for (int i = lastRow; i >= 0; i--) {
            Row row = sheet.getRow(i);
            if (row != null && !isRowEmpty(row)) {
                return i; // Return the last row with content
            }
        }
        return -1; // No data found
    }

    private boolean isRowEmpty(Row row) {
        for (int cellIndex = row.getFirstCellNum(); cellIndex < row.getLastCellNum(); cellIndex++) {
            Cell cell = row.getCell(cellIndex);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String cellValue = cell.toString().trim();
                if (!cellValue.isEmpty()) {
                    return false; // Found meaningful content
                }
            }
        }
        return true; // Row is empty
    }
}
