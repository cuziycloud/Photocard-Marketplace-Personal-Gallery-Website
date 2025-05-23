package com.kpop.Clz.dto;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Getter
@Setter
public class ProductIdsRequest {
    @NotEmpty(message = "Product IDs list cannot be empty")
    private List<Long> productIds;
}