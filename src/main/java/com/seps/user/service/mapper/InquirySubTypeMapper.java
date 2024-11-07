package com.seps.user.service.mapper;

import com.seps.user.domain.InquirySubTypeEntity;
import com.seps.user.service.dto.InquirySubTypeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {InquiryTypeMapper.class})
public interface InquirySubTypeMapper {

    @Mapping(source = "inquiryType.name", target = "inquiryTypeName")
    InquirySubTypeDTO toDTO(InquirySubTypeEntity entity);
}

