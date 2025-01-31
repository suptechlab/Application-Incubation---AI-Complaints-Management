package com.seps.ticket.enums;

import com.seps.ticket.component.EnumWithDescription;

public enum PriorityCareGroupEnum implements EnumWithDescription {
    NONE("priority.care.none"),
    ADULT("priority.care.adult"),
    CHILD_OR_ADOLESCENT("priority.care.child.or.adolescent"),
    PREGNANT_WOMAN("priority.care.pregnant.woman"),
    DISABLED_PERSON("priority.care.disabled.person"),
    PERSON_DEPRIVED_OF_LIBERTY("priority.care.person.deprived.of.liberty"),
    CATASTROPHIC_ILLNESS("priority.care.catastrophic.illness"),
    PERSON_AT_RISK("priority.care.person.at.risk"),
    VICTIM_OF_DOMESTIC_VIOLENCE("priority.care.victim.domestic.violence"),
    VICTIM_OF_CHILD_ABUSE("priority.care.victim.child.abuse"),
    VICTIM_OF_DISASTER("priority.care.victim.disaster");

    private final String key;

    PriorityCareGroupEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }
}
