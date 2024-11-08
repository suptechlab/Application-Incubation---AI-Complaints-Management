package com.seps.admin.service.mapper;

import com.seps.admin.domain.InquirySubTypeEntity;
import com.seps.admin.service.dto.InquirySubTypeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {InquiryTypeMapper.class})
public interface InquirySubTypeMapper {

    InquirySubTypeEntity toEntity(InquirySubTypeDTO dto);

    @Mapping(source = "inquiryType.name", target = "inquiryTypeName")
    InquirySubTypeDTO toDTO(InquirySubTypeEntity entity);
}

