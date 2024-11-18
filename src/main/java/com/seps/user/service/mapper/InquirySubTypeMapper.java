package com.seps.user.service.mapper;

import com.seps.user.domain.InquirySubTypeEntity;
import com.seps.user.service.dto.DropdownListDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {InquiryTypeMapper.class})
public interface InquirySubTypeMapper {


    DropdownListDTO toDropDownDTO(InquirySubTypeEntity inquirySubTypeEntity);
}

