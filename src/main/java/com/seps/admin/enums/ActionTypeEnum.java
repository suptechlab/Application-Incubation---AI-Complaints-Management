package com.seps.admin.enums;

public enum ActionTypeEnum {
    CITY_MASTER_ADD("Add City Master"),
    CITY_MASTER_EDIT("Edit City Master"),
    CITY_MASTER_STATUS_CHANGE("City Status Change"),
    PROVINCE_MASTER_ADD("Add Province Master"),
    PROVINCE_MASTER_EDIT("Edit Province Master"),
    PROVINCE_MASTER_STATUS_CHANGE("Province Status Change"),
    CLAIM_TYPE_MASTER_ADD("Add Claim Type Master"),
    CLAIM_TYPE_MASTER_EDIT("Edit Claim Type Master"),
    CLAIM_TYPE_MASTER_STATUS_CHANGE("Claim Type Status Change"),
    CLAIM_SUB_TYPE_MASTER_ADD("Add Claim Sub Type Master"),
    CLAIM_SUB_TYPE_MASTER_EDIT("Edit Claim Sub Type Master"),
    CLAIM_SUB_TYPE_MASTER_STATUS_CHANGE("Claim Sub Type Status Change"),
    INQUIRY_TYPE_MASTER_ADD("Add Inquiry Type Master"),
    INQUIRY_TYPE_MASTER_EDIT("Edit Inquiry Type Master"),
    INQUIRY_TYPE_MASTER_STATUS_CHANGE("Inquiry Type Status Change"),
    INQUIRY_SUB_TYPE_MASTER_ADD("Add Inquiry Sub Type Master"),
    INQUIRY_SUB_TYPE_MASTER_EDIT("Edit Inquiry Sub Type Master"),
    INQUIRY_SUB_TYPE_MASTER_STATUS_CHANGE("Inquiry Sub Type Status Change"),
    ROLE_ADD("Add New Role"),
    ROLE_EDIT("Edit Existing Role"),
    ROLE_STATUS_CHANGE("Role Status Change"),
    ORGANIZATION_MASTER_ADD("Add Organization"),
    FI_USER_ADD("Add FI User"),
    FI_USER_EDIT("Edit FI User"),
    FI_USER_STATUS_CHANGE("FI User Status Change");

    private final String description;

    ActionTypeEnum(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
