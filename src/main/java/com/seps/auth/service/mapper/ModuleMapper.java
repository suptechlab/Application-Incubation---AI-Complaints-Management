package com.seps.auth.service.mapper;

import com.seps.auth.domain.Module;
import com.seps.auth.service.dto.ModuleDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PermissionMapper.class})
public interface ModuleMapper {

    ModuleDTO toDto(Module module);

    List<ModuleDTO> toDto(List<Module> modules);
}
