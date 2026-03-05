package com.doosan.erp.masterdata.item.service;

import com.doosan.erp.common.constant.ErrorCode;
import com.doosan.erp.common.exception.BusinessException;
import com.doosan.erp.common.exception.ResourceNotFoundException;
import com.doosan.erp.masterdata.item.dto.ItemRequest;
import com.doosan.erp.masterdata.item.dto.ItemResponse;
import com.doosan.erp.masterdata.item.entity.Item;
import com.doosan.erp.masterdata.item.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemService {

    private final ItemRepository itemRepository;

    @Transactional
    public ItemResponse create(ItemRequest request) {
        itemRepository.findById(request.getItemCode()).ifPresent(it -> {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "이미 존재하는 품목코드입니다");
        });

        Item item = new Item();
        apply(item, request);
        item.setIsActive(true); // ← always true on creation

        Item saved = itemRepository.save(item);
        return ItemResponse.from(saved);
    }

    public ItemResponse getOne(String itemCode) {
        Item item = itemRepository.findById(itemCode)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ITEM_NOT_FOUND));
        return ItemResponse.from(item);
    }

    public List<ItemResponse> getAll() {
        return itemRepository.findAllByOrderByItemCodeAsc().stream()
                .map(ItemResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ItemResponse update(String itemCode, ItemRequest request) {
        Item item = itemRepository.findById(itemCode)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ITEM_NOT_FOUND));

        if (request.getItemCode() != null && !itemCode.equals(request.getItemCode())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "itemCode는 변경할 수 없습니다");
        }

        apply(item, request);

        // ← allow updating isActive (for soft-delete)
        if (request.getIsActive() != null) {
            item.setIsActive(request.getIsActive());
        }

        Item saved = itemRepository.save(item);
        return ItemResponse.from(saved);
    }

    @Transactional
    public void delete(String itemCode) {
        Item item = itemRepository.findById(itemCode)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ITEM_NOT_FOUND));

        itemRepository.delete(item);
    }

    private void apply(Item item, ItemRequest request) {
        item.setItemCode(request.getItemCode());
        item.setItemName(request.getItemName());
        item.setCategory(request.getCategory());
        item.setUpperItem(request.getUpperItem());
        item.setUnit(request.getUnit());
        item.setDescription(request.getDescription());
        item.setColor(request.getColor());
        item.setAdditionalDetail(request.getAdditionalDetail());
        item.setSearchKeyword(request.getSearchKeyword());
        item.setInventoryManagement(request.getInventoryManagement());
        item.setJobHour(request.getJobHour());
        item.setCurrentStep(request.getCurrentStep());
        item.setIncludedVat(request.getIncludedVat());
        item.setTaxfree(request.getTaxfree());
        item.setSalesBasisPrice(request.getSalesBasisPrice());
        item.setPurchaseBasisPrice(request.getPurchaseBasisPrice());
        item.setForeignSalesPrice(request.getForeignSalesPrice());
        item.setForeignPurchasePrice(request.getForeignPurchasePrice());
        item.setBoxUsage(request.getBoxUsage());
        item.setQuantityInABox(request.getQuantityInABox());
        item.setBarcode(request.getBarcode());
        item.setBarcodeType(request.getBarcodeType());
        item.setPhoto(request.getPhoto());
    }
}