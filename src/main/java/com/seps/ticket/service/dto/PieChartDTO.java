package com.seps.ticket.service.dto;

import lombok.Data;

import java.util.List;

@Data
public class PieChartDTO {
    private List<String> labels;
    private List<Dataset> datasets;

    public PieChartDTO(List<String> labels, List<Dataset> datasets) {
        this.labels = labels;
        this.datasets = datasets;
    }

    @Data
    public static class Dataset {
        private List<Long> data;
        private List<String> backgroundColor;
        private List<String> hoverBackgroundColor;

        public Dataset(List<Long> data, List<String> backgroundColor, List<String> hoverBackgroundColor) {
            this.data = data;
            this.backgroundColor = backgroundColor;
            this.hoverBackgroundColor = hoverBackgroundColor;
        }
    }
}
