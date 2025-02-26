package com.seps.user.enums;

import com.seps.user.component.EnumWithDescription;

public enum CustomerTypeEnum implements EnumWithDescription {
    PARTNER_ASSOCIATE("customer.type.partner.associate"),
    LEGAL_REPRESENTATIVE("customer.type.legal.representative"),
    PRESIDENT_BOARD_MEMBER("customer.type.president.board.member"),
    SECRETARY("customer.type.secretary"),
    REPRESENTATIVE_ASSEMBLY("customer.type.representative.assembly"),
    STRATEGIC_STAFF("customer.type.strategic.staff"),
    FINANCIAL_USER_CLIENT("customer.type.financial.user.client"),
    //MEMBER_COMMUNITY_ORGANIZATION("customer.type.member.community.organization"),
    //SUBSIDIARY_INTEGRATION_ORGANIZATION("customer.type.subsidiary.integration.organization"),
    INTERESTED_THIRD_PARTY("customer.type.interested.third.party");

    private final String key;

    CustomerTypeEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }
}
