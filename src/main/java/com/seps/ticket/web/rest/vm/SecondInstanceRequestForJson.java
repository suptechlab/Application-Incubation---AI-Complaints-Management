package com.seps.ticket.web.rest.vm;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SecondInstanceRequestForJson {
    private Long id;
    private String comment;
    private List<String> attachments = new ArrayList<>();
}
