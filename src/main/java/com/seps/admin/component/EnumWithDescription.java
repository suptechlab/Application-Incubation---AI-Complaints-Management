package com.seps.admin.component;

/**
 * This interface defines a contract for enums that provide a description.
 * <p>
 * Enums implementing this interface must provide a method to retrieve
 * a description, which can be used for localization or display purposes.
 * It is commonly used with utility classes like {@link EnumUtil} to map
 * enum constants to their human-readable or localized descriptions.
 *
 * <h3>Example:</h3>
 * <pre>{@code
 * public enum CustomerTypeEnum implements EnumWithDescription {
 *     PARTNER_ASSOCIATE("partner.associate"),
 *     LEGAL_REPRESENTATIVE("legal.representative");
 *
 *     private final String key;
 *
 *     CustomerTypeEnum(String key) {
 *         this.key = key;
 *     }
 *
 *     @Override
 *     public String getDescription() {
 *         return key;
 *     }
 * }
 * }</pre>
 */
public interface EnumWithDescription {

    /**
     * Returns the description associated with the enum constant.
     * <p>
     * This description is typically used for localization or user-facing display.
     *
     * @return the description of the enum constant
     */
    String getDescription();
}
