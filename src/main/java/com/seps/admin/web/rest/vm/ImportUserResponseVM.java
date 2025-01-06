package com.seps.admin.web.rest.vm;

import com.seps.admin.domain.User;
import lombok.Data;

import java.util.List;

@Data
public class ImportUserResponseVM {
    private List<String> errors;
    private List<User> newUserList;
}
