package com.seps.admin.component;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.beans.IntrospectionException;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
import java.time.*;
import java.util.HashMap;
import java.util.Map;

@Component("commonHelperProperty")
@Slf4j
public class CommonHelper {
    @Autowired
    HttpServletRequest httpServletRequest;
    private static final ZoneOffset UTC_OFFSET = ZoneOffset.UTC;


    public static double bytesToKB(double bytes) {
        return (bytes / 1024.0);
    }

    public String getRemoteInfo() {
        String remoteAddress = "";
        if (httpServletRequest != null) {
            remoteAddress = httpServletRequest.getHeader("X-FORWARDED-FOR");
            if (StringUtils.isBlank(remoteAddress)) {
                remoteAddress = httpServletRequest.getRemoteAddr();
            }
        }
        return remoteAddress;
    }

    public Instant getInstant(LocalDate date, LocalTime time) {
        LocalDateTime localDateTime = LocalDateTime.of(date, time);
        Instant instant = localDateTime.atOffset(UTC_OFFSET).toInstant();
        return instant;
    }

    public static Map<String, Object> convertEntityToMap(Object entity) {
        Map<String, Object> map = new HashMap<>();
        if (entity == null) return map;

        try {
            for (PropertyDescriptor propertyDescriptor : Introspector.getBeanInfo(entity.getClass(), Object.class).getPropertyDescriptors()) {
                String propertyName = propertyDescriptor.getName();
                Method readMethod = propertyDescriptor.getReadMethod();

                // Skip if there's no getter method or if the method is inaccessible
                if (readMethod == null || !readMethod.canAccess(entity)) {
                    continue;
                }

                Object propertyValue = readMethod.invoke(entity);

                // Optional: skip null values
                if (propertyValue != null) {
                    map.put(propertyName, propertyValue);
                }
            }
        } catch (IntrospectionException | ReflectiveOperationException e) {
            log.error("Error converting entity to map: {}", e.getMessage(), e);
        }

        return map;
    }


}
