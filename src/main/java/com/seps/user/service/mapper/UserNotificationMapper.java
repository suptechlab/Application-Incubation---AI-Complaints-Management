package com.seps.user.service.mapper;

import com.seps.user.domain.UserNotification;
import com.seps.user.service.dto.UserNotificationDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserNotificationMapper {
    UserNotificationDTO toDTO(UserNotification userNotification);
}
