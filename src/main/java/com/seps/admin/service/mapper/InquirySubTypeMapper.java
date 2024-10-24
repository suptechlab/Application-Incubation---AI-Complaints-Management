package com.seps.admin.service.mapper;

import com.seps.admin.domain.InquirySubTypeEntity;
import com.seps.admin.service.dto.InquirySubTypeDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {InquiryTypeMapper.class})
public interface InquirySubTypeMapper {

    InquirySubTypeEntity toEntity(InquirySubTypeDTO dto);

    InquirySubTypeDTO toDTO(InquirySubTypeEntity entity);
}

