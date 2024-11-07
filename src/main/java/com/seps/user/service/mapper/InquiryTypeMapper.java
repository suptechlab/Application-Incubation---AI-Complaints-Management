package com.seps.user.service.mapper;

import com.seps.user.domain.InquiryTypeEntity;
import com.seps.user.service.dto.DropdownListDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface InquiryTypeMapper {

    DropdownListDTO toDropDownDTO(InquiryTypeEntity inquiryTypeEntity);
}
