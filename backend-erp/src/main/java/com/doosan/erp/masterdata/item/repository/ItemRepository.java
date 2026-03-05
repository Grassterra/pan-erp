package com.doosan.erp.masterdata.item.repository;

import com.doosan.erp.masterdata.item.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, String> {

    Optional<Item> findByItemCode(String itemCode);

    List<Item> findAllByOrderByItemCodeAsc();
}
