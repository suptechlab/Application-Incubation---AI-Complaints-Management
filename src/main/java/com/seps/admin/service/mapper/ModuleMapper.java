package com.seps.admin.service.mapper;

import com.seps.admin.domain.Module;
import com.seps.admin.service.dto.ModuleDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PermissionMapper.class})
public interface ModuleMapper {

    ModuleDTO toDto(Module module);

    List<ModuleDTO> toDto(List<Module> modules);
}
