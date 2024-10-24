package com.seps.admin.service.mapper;

import com.seps.admin.domain.InquiryTypeEntity;
import com.seps.admin.service.dto.DropdownListDTO;
import com.seps.admin.service.dto.InquiryTypeDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface InquiryTypeMapper {

    InquiryTypeDTO toDTO(InquiryTypeEntity inquiryTypeEntity);

    InquiryTypeEntity toEntity(InquiryTypeDTO inquiryTypeDTO);

    DropdownListDTO toDropDownDTO(InquiryTypeEntity inquiryTypeEntity);
}
