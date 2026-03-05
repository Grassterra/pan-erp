package com.doosan.erp.masterdata.item.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "mst_item")
@Getter
@Setter
@NoArgsConstructor
public class Item {

    @Id
    @Column(name = "item_code", nullable = false, length = 50)
    private String itemCode;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "upper_item", length = 50)
    private String upperItem;

    @Column(name = "unit", length = 20)
    private String unit;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "additional_detail", length = 2000)
    private String additionalDetail;

    @Column(name = "search_keyword", length = 500)
    private String searchKeyword;

    @Column(name = "inventory_management", length = 20)
    private String inventoryManagement;

    @Column(name = "job_hour", length = 50)
    private String jobHour;

    @Column(name = "current_step", length = 100)
    private String currentStep;

    @Column(name = "included_vat", length = 10)
    private String includedVat;

    @Column(name = "taxfree", length = 10)
    private String taxfree;

    @Column(name = "sales_basis_price", precision = 19, scale = 2)
    private BigDecimal salesBasisPrice;

    @Column(name = "purchase_basis_price", precision = 19, scale = 2)
    private BigDecimal purchaseBasisPrice;

    @Column(name = "foreign_sales_price", precision = 19, scale = 2)
    private BigDecimal foreignSalesPrice;

    @Column(name = "foreign_purchase_price", precision = 19, scale = 2)
    private BigDecimal foreignPurchasePrice;

    @Column(name = "box_usage", length = 50)
    private String boxUsage;

    @Column(name = "quantity_in_a_box", precision = 19, scale = 2)
    private BigDecimal quantityInABox;

    @Column(name = "barcode", length = 100)
    private String barcode;

    @Column(name = "barcode_type", length = 50)
    private String barcodeType;

    @Column(name = "photo", length = 500)
    private String photo;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
