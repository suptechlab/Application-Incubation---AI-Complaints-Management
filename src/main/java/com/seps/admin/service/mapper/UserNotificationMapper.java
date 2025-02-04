package com.seps.admin.service.mapper;

import com.seps.admin.domain.UserNotification;
import com.seps.admin.service.dto.UserNotificationDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserNotificationMapper {
    UserNotificationDTO toDTO(UserNotification userNotification);
}
