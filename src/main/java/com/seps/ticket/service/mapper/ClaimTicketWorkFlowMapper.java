package com.seps.ticket.service.mapper;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.seps.ticket.domain.*;
import com.seps.ticket.service.dto.*;
import com.seps.ticket.service.dto.workflow.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ClaimTicketWorkFlowMapper {

    @Mapping(source = "createdByUser", target = "createdByUser")
    @Mapping(source = "updatedByUser", target = "updatedByUser")
    ClaimTicketWorkFlowDTO toDTO(ClaimTicketWorkFlow claimTicketWorkFlow);

    // Default method for conditional mapping
    default ClaimTicketWorkFlowDTO mapEntityToDTO(ClaimTicketWorkFlow entity) {
        Gson gson = new GsonBuilder().create();
        ClaimTicketWorkFlowDTO dto = toDTO(entity);

        if (entity.getEvent() != null) {
            switch (entity.getEvent()) {
                case CREATED:
                    dto.setCreateConditions(gson.fromJson(entity.getConditions(), new TypeToken<List<CreateCondition>>() {}.getType()));
                    dto.setCreateActions(gson.fromJson(entity.getActions(), new TypeToken<List<CreateAction>>() {}.getType()));
                    break;
                case TICKET_STATUS:
                    dto.setTicketStatusConditions(gson.fromJson(entity.getConditions(), new TypeToken<List<TicketStatusCondition>>() {}.getType()));
                    dto.setTicketStatusActions(gson.fromJson(entity.getActions(), new TypeToken<List<TicketStatusAction>>() {}.getType()));
                    break;
                case TICKET_PRIORITY:
                    dto.setTicketPriorityConditions(gson.fromJson(entity.getConditions(), new TypeToken<List<TicketPriorityCondition>>() {}.getType()));
                    dto.setTicketPriorityActions(gson.fromJson(entity.getActions(), new TypeToken<List<TicketPriorityAction>>() {}.getType()));
                    break;
                case SLA_DAYS_REMINDER:
                    dto.setSlaDaysReminderConditions(gson.fromJson(entity.getConditions(), new TypeToken<List<SLADaysReminderCondition>>() {}.getType()));
                    dto.setSlaDaysReminderActions(gson.fromJson(entity.getActions(), new TypeToken<List<SLADaysReminderAction>>() {}.getType()));
                    break;
                case SLA_BREACH:
                    dto.setSlaBreachActions(gson.fromJson(entity.getActions(), new TypeToken<List<SLABreachAction>>() {}.getType()));
                    break;
                case TICKET_DATE_EXTENSION:
                    dto.setTicketDateExtensionActions(gson.fromJson(entity.getActions(), new TypeToken<List<TicketDateExtensionAction>>() {}.getType()));
                    break;
                default:
                    // Log unrecognized event if necessary
                    break;
            }
        }
        return dto;
    }

    // Map authorities to string set
    default Set<String> mapAuthorities(Set<Authority> authorities) {
        if (authorities == null) {
            return null; // Handle null gracefully
        }
        return authorities.stream()
            .map(Authority::getName) // Ensure Authority has a getName() method
            .collect(Collectors.toSet());
    }

    // Map User entity to UserDTO
    @Mapping(target = "authorities", expression = "java(mapAuthorities(user.getAuthorities()))")
    @Mapping(source = "firstName", target = "name")
    UserDTO toUserDTO(User user);
}
