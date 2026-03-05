package com.doosan.erp.masterdata.item.dto;

import com.doosan.erp.masterdata.item.entity.Item;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ItemResponse {

    private String itemCode;
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

    public static ItemResponse from(Item item) {
        ItemResponse res = new ItemResponse();
        res.setItemCode(item.getItemCode());
        res.setItemName(item.getItemName());
        res.setCategory(item.getCategory());
        res.setUpperItem(item.getUpperItem());
        res.setUnit(item.getUnit());
        res.setDescription(item.getDescription());
        res.setColor(item.getColor());
        res.setAdditionalDetail(item.getAdditionalDetail());
        res.setSearchKeyword(item.getSearchKeyword());
        res.setInventoryManagement(item.getInventoryManagement());
        res.setJobHour(item.getJobHour());
        res.setCurrentStep(item.getCurrentStep());
        res.setIncludedVat(item.getIncludedVat());
        res.setTaxfree(item.getTaxfree());
        res.setSalesBasisPrice(item.getSalesBasisPrice());
        res.setPurchaseBasisPrice(item.getPurchaseBasisPrice());
        res.setForeignSalesPrice(item.getForeignSalesPrice());
        res.setForeignPurchasePrice(item.getForeignPurchasePrice());
        res.setBoxUsage(item.getBoxUsage());
        res.setQuantityInABox(item.getQuantityInABox());
        res.setBarcode(item.getBarcode());
        res.setBarcodeType(item.getBarcodeType());
        res.setPhoto(item.getPhoto());
        res.setIsActive(item.getIsActive());
        return res;
    }
}
