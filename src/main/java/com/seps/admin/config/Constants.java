package com.seps.admin.config;

/**
 * Application constants.
 */
public final class Constants {

    public static final String SYSTEM = "system";
    public static final String DEFAULT_LANGUAGE = "en";
    public static final String ACTIVE = "Active";
    public static final String INACTIVE = "In-Active";
    public static final String MICROSERVICE_NAME = "admin";
    // Regex for acceptable logins
    public static final String LOGIN_REGEX = "^(?>[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)|(?>[_.@A-Za-z0-9-]+)$";
    public static final String AUDIT_LOG = "Audit Log";
    public static final String NEW_DATA = "newData";
    public static final String OLD_DATA = "oldData";

    private Constants() {}
}
