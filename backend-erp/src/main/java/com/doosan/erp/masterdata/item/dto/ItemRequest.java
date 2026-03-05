package com.doosan.erp.masterdata.item.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ItemRequest {

    @NotBlank
    private String itemCode;

    @NotBlank
    private String itemName;

    private String category;

    private String upperItem;
    private String unit;
    private String description;
    private String color;
    private String additionalDetail;
    private String searchKeyword;
    private String inventoryManagement;
    private String jobHour;
    private String currentStep;
    private String includedVat;
    private String taxfree;

    private BigDecimal salesBasisPrice;
    private BigDecimal purchaseBasisPrice;
    private BigDecimal foreignSalesPrice;
    private BigDecimal foreignPurchasePrice;

    private String boxUsage;
    private BigDecimal quantityInABox;

    private String barcode;
    private String barcodeType;
    private String photo;

    private Boolean isActive;

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
