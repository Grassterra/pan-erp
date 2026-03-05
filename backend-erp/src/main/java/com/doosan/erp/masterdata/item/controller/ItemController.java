package com.doosan.erp.masterdata.item.controller;

import com.doosan.erp.common.dto.ApiResponse;
import com.doosan.erp.masterdata.item.dto.ItemRequest;
import com.doosan.erp.masterdata.item.dto.ItemResponse;
import com.doosan.erp.masterdata.item.service.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/master-data/items")
@RequiredArgsConstructor
@Tag(name = "Master Data - Item", description = "품목 마스터 API")
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    @Operation(summary = "품목 생성", description = "새로운 품목을 생성합니다")
    public ResponseEntity<ApiResponse<ItemResponse>> create(@Valid @RequestBody ItemRequest request) {
        ItemResponse response = itemService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "품목이 생성되었습니다"));
    }

    @GetMapping
    @Operation(summary = "품목 목록 조회", description = "전체 품목 목록을 조회합니다")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getAll() {
        List<ItemResponse> response = itemService.getAll();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{itemCode}")
    @Operation(summary = "품목 조회", description = "품목코드로 품목을 조회합니다")
    public ResponseEntity<ApiResponse<ItemResponse>> getOne(@PathVariable String itemCode) {
        ItemResponse response = itemService.getOne(itemCode);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{itemCode}")
    @Operation(summary = "품목 수정", description = "품목 정보를 수정합니다")
    public ResponseEntity<ApiResponse<ItemResponse>> update(
            @PathVariable String itemCode,
            @Valid @RequestBody ItemRequest request) {
        ItemResponse response = itemService.update(itemCode, request);
        return ResponseEntity.ok(ApiResponse.success(response, "품목이 수정되었습니다"));
    }

    @DeleteMapping("/{itemCode}")
    @Operation(summary = "품목 삭제", description = "품목을 삭제합니다")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String itemCode) {
        itemService.delete(itemCode);
        return ResponseEntity.ok(ApiResponse.success(null, "품목이 삭제되었습니다"));
    }
}
