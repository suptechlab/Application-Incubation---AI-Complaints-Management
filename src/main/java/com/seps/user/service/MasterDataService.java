package com.seps.user.service;

import com.seps.user.enums.CustomerTypeEnum;
import com.seps.user.enums.PriorityCareGroupEnum;
import com.seps.user.component.EnumUtil;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Service class responsible for providing master data for various enums used in the application.
 * It utilizes {@link EnumUtil} to localize the enum values based on the provided locale.
 */
@Service
public class MasterDataService {

    private final EnumUtil enumUtil;

    /**
     * Constructor for {@link MasterDataService}.
     *
     * @param enumUtil The utility component for enum localization.
     */
    public MasterDataService(EnumUtil enumUtil) {
        this.enumUtil = enumUtil;
    }

    /**
     * Retrieves a map of localized master data for various enums based on the given locale.
     *
     * @param locale The {@link Locale} used for localizing the enum descriptions.
     * @return A map containing the localized master data, where the key is the enum name
     *         (e.g., "customerType", "priorityCareGroup") and the value is a map of enum entries
     *         with their localized descriptions.
     */
    public Map<String, Object> getMasterData(Locale locale) {
        Map<String, Object> masterData = new HashMap<>();

        // Adding localized data for Customer Type enum
        masterData.put("customerType", enumUtil.enumToLocalizedMap(CustomerTypeEnum.class, locale));

        // Adding localized data for Priority Care Group enum
        masterData.put("priorityCareGroup", enumUtil.enumToLocalizedMap(PriorityCareGroupEnum.class, locale));

        return masterData;
    }
}
