package com.seps.admin.service;

import com.google.gson.Gson;
import com.seps.admin.config.Constants;
import com.seps.admin.domain.*;
import com.seps.admin.enums.*;
import com.seps.admin.repository.TeamMemberRepository;
import com.seps.admin.repository.TeamRepository;
import com.seps.admin.repository.UserRepository;
import com.seps.admin.security.AuthoritiesConstants;
import com.seps.admin.service.dto.*;
import com.seps.admin.service.mapper.TeamMapper;
import com.seps.admin.service.mapper.UserMapper;
import com.seps.admin.service.specification.TeamSpecification;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.util.*;
import java.util.stream.Collectors;

import static com.seps.admin.component.CommonHelper.convertEntityToMap;

@Service
@Transactional
public class TeamService {

    private static final Logger log = LoggerFactory.getLogger(TeamService.class);

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserService userService;
    private final OrganizationService organizationService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;
    private final MessageSource messageSource;
    private final Gson gson;
    private final TeamMapper teamMapper;
    private final MailService mailService;

    /**
     * Service class responsible for handling operations related to teams and team members.
     * This service provides methods to manage teams, their members, and the interactions between them,
     * along with logging and user-related functionality.
     *
     * <p>The following dependencies are injected through the constructor:
     * <ul>
     *     <li>{@link TeamRepository} - Repository for managing team data in the database.</li>
     *     <li>{@link TeamMemberRepository} - Repository for managing team member data in the database.</li>
     *     <li>{@link OrganizationService} - Service to interact with organization-related functionalities.</li>
     *     <li>{@link UserRepository} - Repository for managing user data in the database.</li>
     *     <li>{@link UserMapper} - Mapper to convert between user entity and DTO objects.</li>
     *     <li>{@link AuditLogService} - Service to log audit records for team and user operations.</li>
     *     <li>{@link UserService} - Service for handling user-specific functionalities and data.</li>
     *     <li>{@link MessageSource} - Source for retrieving internationalized messages.</li>
     *     <li>{@link Gson} - Utility class for serializing and deserializing JSON data.</li>
     *     <li>{@link TeamMapper} - Mapper to convert between team entity and DTO objects.</li>
     *     <li>{@link MailService} - Service to send mails</li>
     * </ul>
     * </p>
     *
     * @param teamRepository Repository for performing CRUD operations on team data.
     * @param teamMemberRepository Repository for performing CRUD operations on team member data.
     * @param organizationService Service for interacting with organization-related functionality.
     * @param userRepository Repository for managing user data.
     * @param userMapper Mapper for converting between user entities and DTOs.
     * @param auditLogService Service for logging audit entries related to team operations.
     * @param userService Service that provides various user-related functionalities.
     * @param messageSource Service for retrieving messages for internationalization.
     * @param gson Utility for converting objects to JSON and vice versa.
     * @param teamMapper Mapper for converting between team entities and DTOs.
     * @param mailService Service for send mails.
     */
    @Autowired
    public TeamService(TeamRepository teamRepository, TeamMemberRepository teamMemberRepository, OrganizationService organizationService,
                       UserRepository userRepository, UserMapper userMapper, AuditLogService auditLogService, UserService userService, MessageSource messageSource,
                       Gson gson, TeamMapper teamMapper, MailService mailService) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userService = userService;
        this.organizationService = organizationService;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.auditLogService = auditLogService;
        this.messageSource = messageSource;
        this.gson = gson;
        this.teamMapper = teamMapper;
        this.mailService = mailService;
    }

    /**
     * Creates a new team with the specified details and assigns team members to the team.
     * The team creation is dependent on the authority of the current user, and based on the
     * authority, the entity type (SEPS or FI) is set for the team. The team members are validated
     * for uniqueness and validity before being assigned to the team.
     *
     * <p>If the current user has the SEPS authority, the team will be assigned the SEPS entity type.
     * If the current user has the FI authority, the team will be assigned the FI entity type.
     * If the entity type is FI, an associated organization is fetched based on the provided entity ID.</p>
     *
     * <p>Before saving the team, several validations are performed:
     * <ul>
     *     <li>Validation of the team members being assigned to the team.</li>
     *     <li>Check for any duplicate teams based on the provided details.</li>
     *     <li>Validation of unique member assignments to the team.</li>
     * </ul>
     * </p>
     *
     * The method saves the newly created team and its members to the repository and returns the ID of the saved team.
     *
     * @param teamDTO The data transfer object containing the details of the team to be created. It includes the team name, description,
     *                entity type, entity ID, and a list of team members.
     * @return The ID of the newly created team.
     * @throws IllegalArgumentException if any validation fails (e.g., duplicate team, invalid member assignment).
     */
    public Long createTeam(@Valid TeamDTO teamDTO) {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        if(authority.contains(AuthoritiesConstants.SEPS)){
            teamDTO.setEntityType(TeamEntityTypeEnum.SEPS);
        }
        if(authority.contains(AuthoritiesConstants.FI)){
            teamDTO.setEntityType(TeamEntityTypeEnum.FI);
        }

        Team team = new Team();
        if(teamDTO.getEntityType().equals(TeamEntityTypeEnum.FI)) {
            OrganizationDTO organization = organizationService.getOrganizationById(teamDTO.getEntityId());
            team.setEntityId(organization.getId());
        }

        validatePersonAssignToTeam(teamDTO.getTeamMembers(),teamDTO.getEntityType());
        validateDuplicateTeam(teamDTO,null);
        validateUniqueMemberAssignment(teamDTO.getTeamMembers());

        team.setTeamName(teamDTO.getTeamName());
        team.setDescription(teamDTO.getDescription());
        team.setEntityType(teamDTO.getEntityType().name());
        team.setCreatedBy(currentUser.getId());
        team.setEntityId(teamDTO.getEntityId());
        team.setStatus(true);

        Team savedTeam = teamRepository.save(team);

        if (teamDTO.getTeamMembers() != null) {
            List<TeamMember> members = teamDTO.getTeamMembers().stream().map(memberId -> {
                TeamMember member = new TeamMember();
                member.setTeam(savedTeam);
                member.setUserId(memberId);
                member.setAssignedBy(currentUser.getId());
                return member;
            }).toList();
            teamMemberRepository.saveAll(members);
        }

        return savedTeam.getId();
    }

    /**
     * Creates an audit log entry for the creation of a new team. This method logs details
     * related to the newly created team, including the current user’s information, the
     * team ID, and the provided team data. It also generates a localized audit message for
     * different languages and stores the new team data as part of the audit entry.
     *
     * <p>The method retrieves the current user's email and generates an audit message in
     * different languages. It also converts the new team entity into a map to store the
     * team's data for auditing purposes. The request body is serialized to JSON format for
     * inclusion in the log.</p>
     *
     * The following details are logged:
     * <ul>
     *     <li>Audit message in multiple languages (depending on available language codes).</li>
     *     <li>New team data as a map.</li>
     *     <li>Request body containing the team details in JSON format.</li>
     * </ul>
     *
     * @param id The ID of the newly created team.
     * @param teamDTO The data transfer object containing the team details that were used to create the team.
     * @param requestInfo Information about the incoming request (e.g., client IP, session info).
     * @throws IllegalArgumentException if any validation fails or required parameters are missing.
     */
    public void createTeamLog(Long id, TeamDTO teamDTO, RequestInfo requestInfo){
        User currentUser = userService.getCurrentUser();
        Map<String, String> auditMessageMap = new HashMap<>();
        Map<String, Object> entityData = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.team.created",
                new Object[]{currentUser.getEmail(), id}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        entityData.put(Constants.NEW_DATA,convertEntityToMap(this.findOne(id)));
        String requestBody = gson.toJson(teamDTO);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "createTeam", ActionTypeEnum.TEAM_ADD.name(), id, Team.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);
    }

    /**
     * Creates an audit log entry for updating an existing team. This method logs details
     * related to the modification of the team, including the current user’s information,
     * the team ID, the old data, and the updated team data. It generates a localized audit
     * message in different languages and stores both the old and new team data as part of
     * the audit entry.
     *
     * <p>The method retrieves the current user's email and generates an audit message in
     * different languages. It also compares the old and new team data, storing both for
     * auditing purposes. The request body is serialized to JSON format for inclusion in
     * the log.</p>
     *
     * The following details are logged:
     * <ul>
     *     <li>Audit message in multiple languages (depending on available language codes).</li>
     *     <li>Old team data before the update.</li>
     *     <li>New team data after the update.</li>
     *     <li>Request body containing the updated team details in JSON format.</li>
     * </ul>
     *
     * @param oldData A map containing the previous state of the team before the update.
     * @param id The ID of the team being updated.
     * @param teamDTO The data transfer object containing the updated team details.
     * @param requestInfo Information about the incoming request (e.g., client IP, session info).
     * @throws IllegalArgumentException if any validation fails or required parameters are missing.
     */
    public void updateTeamLog(Map<String, Object> oldData, Long id, TeamDTO teamDTO, RequestInfo requestInfo){
        User currentUser = userService.getCurrentUser();
        Map<String, String> auditMessageMap = new HashMap<>();
        Map<String, Object> entityData = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.team.updated",
                new Object[]{currentUser.getEmail(), id}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA,convertEntityToMap(this.findOne(id)));
        String requestBody = gson.toJson(teamDTO);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "updateTeam", ActionTypeEnum.TEAM_EDIT.name(), id, Team.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }

    /**
     * Validates that the list of members assigned to thROLE_FIe team are related to the specified role type (e.g., `ROLE_FI`).
     *
     * @param personIds List of member IDs to be assigned to the team.
     * @param entityType  The user role type (e.g., `ROLE_FI`).
     * @throws CustomException if any member in the list does not belong to the specified role type.
     */
    private void validatePersonAssignToTeam(List<Long> personIds, TeamEntityTypeEnum entityType) {
        if (personIds == null || personIds.isEmpty()) {
            return; // No members to validate
        }
        String userRole = AuthoritiesConstants.SEPS;
        if(entityType.equals(TeamEntityTypeEnum.FI))
            userRole = AuthoritiesConstants.FI;

        // Fetch valid member IDs based on the specified role
        List<Long> validPersonIds = userRepository.findValidPersonIdsByUserRole(userRole);

        // Check if all provided member IDs are valid
        List<Long> invalidMembers = personIds.stream()
            .filter(personId -> !validPersonIds.contains(personId))
            .toList();

        if (!invalidMembers.isEmpty()) {
            throw new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.INVALID_MEMBER_LIST,
                new String[]{userRole, invalidMembers.toString()},
                null
            );
        }
    }

    /**
     * Validates if a team with the same name, entity type, and entity ID already exists
     * in the system. The method checks for duplicates depending on whether the team is
     * being created or updated.
     * <p>
     * When updating a team, the current team's record is excluded from the duplicate check
     * to allow for changes to the team details. When creating a new team, the method checks
     * for exact duplicates based on the provided team name, entity type, and entity ID.
     * </p>
     * <p>
     * If a duplicate team is found, a {@link CustomException} is thrown with a
     * {@link Status#CONFLICT} status, indicating a conflict due to duplicate data.
     * </p>
     *
     * @param teamDTO The data transfer object containing the team details to be validated.
     * @param teamId The ID of the team being updated (can be null when creating a new team).
     * @throws CustomException if a duplicate team is found with the same name, entity type,
     *         and entity ID (excluding the current team when updating).
     */
    private void validateDuplicateTeam(TeamDTO teamDTO, Long teamId) {
        boolean isDuplicate;

        if (teamId != null) {
            // For update: exclude the current record from duplicate check
            isDuplicate = teamRepository.existsByTeamNameAndEntityTypeAndEntityIdAndIdNot(
                teamDTO.getTeamName(),
                teamDTO.getEntityType().toString(),
                teamDTO.getEntityId(),
                teamId
            );
        } else {
            // For create: check for exact duplicates
            isDuplicate = teamRepository.existsByTeamNameAndEntityTypeAndEntityId(
                teamDTO.getTeamName(),
                teamDTO.getEntityType().toString(),
                teamDTO.getEntityId()
            );
        }

        if (isDuplicate) {
            throw new CustomException(
                Status.CONFLICT,
                SepsStatusCode.DUPLICATE_TEAM,
                new String[]{
                    teamDTO.getTeamName(),
                    teamDTO.getEntityType().getCode(),
                    teamDTO.getEntityId() != null ? teamDTO.getEntityId().toString() : "N/A"
                },
                null
            );
        }
    }

    private void validateUniqueMemberAssignment(List<Long> personIds) {
        List<Long> assignedMembers = teamRepository.findAssignedMembers(personIds);

        if (!assignedMembers.isEmpty()) {
            throw new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.MEMBER_ALREADY_ASSIGNED,
                new String[]{assignedMembers.toString()},
                null
            );
        }
    }


    public void updateTeam(@Valid Long id, TeamDTO teamDTO) {
        User currentUser = userService.getCurrentUser();
        Team team = getTeam(id, currentUser);
        validateDuplicateTeam(teamDTO, id);
        team.setTeamName(teamDTO.getTeamName());
        team.setDescription(teamDTO.getDescription());
        team.setUpdatedBy(currentUser.getId());
        teamRepository.save(team);
    }

    private Team getTeam(Long teamId, User currentUser) {
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        if(authority.contains(AuthoritiesConstants.SEPS)){
            return teamRepository.findByIdAndEntityType(teamId,TeamEntityTypeEnum.SEPS.toString())
                .orElseThrow(() -> new CustomException(
                    Status.BAD_REQUEST,
                    SepsStatusCode.TEAM_NOT_FOUND,
                    null,
                    null
                ));
        } else if (authority.contains(AuthoritiesConstants.FI)){
            FIUserDTO fiUserDTO = userMapper.userToFIUserDTO(currentUser);
            return teamRepository.findByIdAndEntityIdAndEntityType(teamId,fiUserDTO.getOrganization().getId(),TeamEntityTypeEnum.FI.toString())
                .orElseThrow(() -> new CustomException(
                    Status.BAD_REQUEST,
                    SepsStatusCode.TEAM_NOT_FOUND,
                    null,
                    null
                ));
        }else {
            return teamRepository.findById(teamId)
                .orElseThrow(() -> new CustomException(
                    Status.BAD_REQUEST,
                    SepsStatusCode.TEAM_NOT_FOUND,
                    null,
                    null
                ));
        }
    }
    public TeamDTO findOne(Long id) {
        // Retrieve the current user
        User currentUser = userService.getCurrentUser();

        // Get the team entity based on ID and current user's access
        Team team = getTeam(id, currentUser);

        // Use the mapper to convert the entity to DTO
        return teamMapper.toTeamDTO(team);
    }

    @Transactional(readOnly = true)
    public List<TeamDTO.MemberDropdownDTO> findAllMembers(TeamEntityTypeEnum entityType) {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        // Determine the user role
        String userRole = AuthoritiesConstants.SEPS;
        if (authority.contains(AuthoritiesConstants.FI) ||
            (authority.contains(AuthoritiesConstants.ADMIN) && entityType.equals(TeamEntityTypeEnum.FI))) {
            userRole = AuthoritiesConstants.FI;
        }

        // Fetch users not assigned to a team by role
        List<User> users = userRepository.findUsersNotAssignedToTeamByRole(userRole);

        // Map User entities to MemberDropdownDTO
        return users.stream()
            .map(user -> {
                String roles = user.getRoles().stream().map(Role::getName).collect(Collectors.joining(", "));
                TeamDTO.MemberDropdownDTO dropdown = new TeamDTO.MemberDropdownDTO();
                dropdown.setId(user.getId());
                dropdown.setName(user.getFirstName() != null ? user.getFirstName() + " (" + roles + ")" : ""); // Handle null names
                dropdown.setRole(roles); // Ensure compatibility
                return dropdown;
            })
            .toList();
    }


    public List<Long> assignMembersToTeam(Long teamId, AssignMembersRequestDTO requestDto) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.TEAM_NOT_FOUND,
                null,
                null
            ));
        User currentUser = userService.getCurrentUser();
        validatePersonAssignToTeam(requestDto.getUserIds(),TeamEntityTypeEnum.SEPS.name().equals(team.getEntityType())?TeamEntityTypeEnum.SEPS:
            TeamEntityTypeEnum.FI);

        List<Long> alreadyAssignedUserIds = teamMemberRepository.findUserIdsByTeamId(teamId);
        List<Long> userIdsToAssign = requestDto.getUserIds().stream()
            .filter(userId -> !alreadyAssignedUserIds.contains(userId))
            .toList();

        if (userIdsToAssign.isEmpty()) {
            throw new CustomException(
                Status.CONFLICT,
                SepsStatusCode.NO_MEMBERS_TO_ASSIGN,
                null,
                null
            );
        }
        List<TeamMember> newTeamMembers = userIdsToAssign.stream()
            .map(userId -> TeamMember.builder()
                .team(team)
                .userId(userId)
                .assignedBy(currentUser.getId())
                .build())
            .toList();

        teamMemberRepository.saveAll(newTeamMembers);

        log.debug("userIdsToAssign: {}",userIdsToAssign);
        // Send emails to new members
        userIdsToAssign.forEach(userId -> {
            log.debug("userId: {}",userId);
            User newUser = userService.getUserById(userId);
            mailService.sendWelcomeToTeamEmail(newUser, team.getTeamName());
        });

        // Notify existing team members
        alreadyAssignedUserIds.forEach(userId -> {
            User existingUser = userService.getUserById(userId);
            mailService.sendNewMemberAddedNotification(existingUser, team.getTeamName(), userIdsToAssign);
        });

        return userIdsToAssign;
    }
    public void assignMembersToTeamLoad(Map<String, Object> oldData, Long teamId,List<Long> userIdsToAssign, AssignMembersRequestDTO requestDto, RequestInfo requestInfo){
        TeamDTO team = this.findOne(teamId);
        User currentUser = userService.getCurrentUser();
        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.assigned.member",
                new Object[]{currentUser.getEmail(),userIdsToAssign, team.getTeamName()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(team);
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        String requestBody = gson.toJson(requestDto);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "assignMembersToTeam", ActionTypeEnum.TEAM_ASSIGNED_MEMBER.name(), teamId, TeamMember.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }
    public void unassignMemberFromTeam(Long teamId, Long userId) {

        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
            .orElseThrow(() -> new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.MEMBER_NOT_FOUND_IN_TEAM,
                null,
                null
            ));

        teamMemberRepository.delete(teamMember);
    }

    public void unassignMemberFromTeamLoad(Map<String, Object> oldData, Long teamId, Long userIdsToUnassigned, RequestInfo requestInfo){
        TeamDTO team = this.findOne(teamId);
        User currentUser = userService.getCurrentUser();
        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.unassign.member",
                new Object[]{currentUser.getEmail(),userIdsToUnassigned, team.getTeamName()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(team);
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, String> req = new HashMap<>();
        req.put("userId", userIdsToUnassigned.toString());
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "unassignMemberFromTeam", ActionTypeEnum.TEAM_UNASSIGNED_MEMBER.name(), teamId, TeamMember.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }

    public void changeStatus(Long id, Boolean status, RequestInfo requestInfo) {
        User currentUser = userService.getCurrentUser();
        Team team = getTeam(id,currentUser);
        Map<String, Object> oldData = convertEntityToMap(this.findOne(team.getId()));
        team.setStatus(status);
        Team savedTeam = teamRepository.save(team);

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.team.status.change",
                new Object[]{currentUser.getEmail(), savedTeam.getStatus()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.findOne(savedTeam.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, String> req = new HashMap<>();
        req.put("status", status.toString());
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "changeStatus", ActionTypeEnum.TEAM_STATUS_CHANGE.name(), savedTeam.getId(), Team.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.STATUS_CHANGE.name(), requestBody);
    }

    public Page<TeamListDTO> listTeams(Pageable pageable, String search, Boolean status) {
        return teamRepository.findAll(TeamSpecification.byFilter(search, status), pageable)
            .map(teamMapper::toTeamListDTO);
    }

    /**
     * Retrieves a list of active teams for workflow based on the current user's authority
     * and the provided organization ID.
     *
     * <p>If the current user has the FI role, the organization ID is overridden
     * with the user's organization ID. If no organization ID is provided or determined,
     * a default value of 0 is used.
     *
     * @param organizationId the ID of the organization to filter teams by;
     *                       can be null, in which case it defaults to 0.
     * @return a list of {@link DropdownListDTO} objects representing the active teams,
     *         containing their IDs and names.
     * @throws IllegalStateException if the current user is not authenticated or has no roles assigned.
     * @see TeamSpecification#byFilterWorkflow(Long)
     */
    public List<DropdownListDTO> listActiveTeamsForWorkFlow(Long organizationId) {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        if (authority.contains(AuthoritiesConstants.FI)) {
            organizationId = currentUser.getOrganizationId();
        }

        return teamRepository.findAll(TeamSpecification.byFilterWorkflow(organizationId))
            .stream().map(teamMapper::toDropDownDTO).toList();
    }

    /**
     * Retrieves a list of active team members for workflow based on the specified team ID.
     *
     * <p>This method fetches all team members associated with the given team ID and maps
     * them to a list of {@link DropdownListDTO} objects. If a team member's first name is null,
     * the name will be set to an empty string.
     *
     * @param teamId the ID of the team whose members are to be retrieved.
     * @return a list of {@link DropdownListDTO} objects representing the active team members,
     *         including their user IDs and names.
     * @throws IllegalArgumentException if the provided team ID is invalid or does not exist.
     */
    public List<DropdownListDTO> listActiveTeamsMembersForWorkFlow(Long teamId) {
        return teamMemberRepository.findAllByTeamId(teamId)
            .stream()
            .map(team -> {
                DropdownListDTO dropdown = new DropdownListDTO();
                dropdown.setId(team.getUser().getId());
                dropdown.setName(team.getUser().getFirstName() != null ? team.getUser().getFirstName() : ""); // Handle null names
                return dropdown;
            })
            .toList();
    }
}
